import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import api from "../api";

const GameContext = createContext();

// Her seviyede kaç senaryo olacağını buradan yönetiyoruz
const LEVEL_SIZE = 5;

export function GameProvider({ children }) {
  const [screen, setScreen] = useState("welcome"); // welcome | scenarios | game | result
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentScenario, setCurrentScenario] = useState(null);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0-based
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0); // 0-based

  // levelProgress: [{ successCount, playedCount, completed }, ...]
  const [levelProgress, setLevelProgress] = useState([]);

  // Oyuna başla → her zaman level ekranına gitsin
  const startGame = useCallback(() => setScreen("scenarios"), []);

  const getLevelScenarios = useCallback(
    (levelIndex) => {
      if (!scenarios.length) return [];
      const start = levelIndex * LEVEL_SIZE;
      return scenarios.slice(start, start + LEVEL_SIZE);
    },
    [scenarios]
  );

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/scenarios");
      let data = res.data || [];
      // ID'ye göre sırala, 1–20 → 5'lik bloklar seviyelere dönüşsün
      data = [...data].sort((a, b) => (a.id || 0) - (b.id || 0));
      setScenarios(data);

      const levelCount = Math.ceil(data.length / LEVEL_SIZE);
      if (levelCount > 0) {
        setLevelProgress((prev) => {
          const next = Array.from({ length: levelCount }, (_, i) => {
            return (
              prev[i] || {
                successCount: 0,
                playedCount: 0,
                completed: false,
              }
            );
          });
          return next;
        });
      } else {
        setLevelProgress([]);
      }

      // Yeni senaryo listesi geldiğinde başlangıcı resetle
      setCurrentLevelIndex(0);
      setCurrentScenarioIndex(0);
      setCurrentScenario(null);
    } catch (e) {
      console.error(e);
      setError("Senaryolar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Eski tek-senaryo akışı için bırakıyorum; şu anda kullanmıyoruz ama dursun
  const selectScenario = useCallback((scenario) => {
    setCurrentScenario(scenario);
    setScreen("game");
  }, []);

  const exitGame = useCallback(() => {
    setCurrentScenario(null);
    setScreen("scenarios");
  }, []);

  // Bir seviyeyi başlat (veya tekrar başlat) → 0. indexten
  const startLevel = useCallback(
    (levelIndex = 0) => {
      const levelScens = getLevelScenarios(levelIndex);
      if (!levelScens.length) return;

      setCurrentLevelIndex(levelIndex);
      setCurrentScenarioIndex(0);
      setCurrentScenario(levelScens[0]);
      setScreen("game");
    },
    [getLevelScenarios]
  );

  // 🔥 YENİ: Seviyenin içinden istenen senaryoyu başlat
  const startScenario = useCallback(
    (levelIndex, scenarioIndex) => {
      const levelScens = getLevelScenarios(levelIndex);
      if (!levelScens.length) return;

      const safeIndex = Math.max(
        0,
        Math.min(scenarioIndex, levelScens.length - 1)
      );
      const chosenScenario = levelScens[safeIndex];

      setCurrentLevelIndex(levelIndex);
      setCurrentScenarioIndex(safeIndex);
      setCurrentScenario(chosenScenario);
      setScreen("game");
    },
    [getLevelScenarios]
  );

  /**
   * Bir senaryo bittiğinde (GameScreen'den çağrılacak):
   * - success = true → hedef cümleye ulaşıldı
   * - success = false → başarısız (şimdilik sadece success=true için çağırıyoruz)
   */
  const finishScenario = useCallback(
    (success) => {
      const levelScens = getLevelScenarios(currentLevelIndex);
      if (!levelScens.length) {
        setScreen("scenarios");
        return;
      }

      const isLastScenario =
        currentScenarioIndex >= levelScens.length - 1;

      setLevelProgress((prevAll) => {
        const copy = [...prevAll];
        const prev =
          copy[currentLevelIndex] || {
            successCount: 0,
            playedCount: 0,
            completed: false,
          };

        const newSuccessCount =
          prev.successCount + (success ? 1 : 0);
        const newPlayedCount = prev.playedCount + 1;
        const neededSuccess = Math.min(4, levelScens.length);
        const willCompleteLevel =
          newSuccessCount >= neededSuccess;

        copy[currentLevelIndex] = {
          successCount: newSuccessCount,
          playedCount: newPlayedCount,
          completed: willCompleteLevel,
        };

        // Navigasyon kararı
        if (willCompleteLevel || isLastScenario) {
          // Seviye bitti → ResultScreen'e git
          setScreen("result");
        } else {
          // Aynı seviyede bir sonraki senaryoya geç
          const nextIndex = currentScenarioIndex + 1;
          const nextScenario = levelScens[nextIndex];
          setCurrentScenarioIndex(nextIndex);
          setCurrentScenario(nextScenario);
          // Ekran zaten "game", değiştirmeye gerek yok
        }

        return copy;
      });
    },
    [currentLevelIndex, currentScenarioIndex, getLevelScenarios]
  );

  const goToNextLevel = useCallback(() => {
    const nextLevelIndex = currentLevelIndex + 1;
    const nextLevelScens = getLevelScenarios(nextLevelIndex);

    if (!nextLevelScens.length) {
      // Son seviye de bitti → senaryo ekranına dön
      setCurrentScenario(null);
      setScreen("scenarios");
      return;
    }

    setCurrentLevelIndex(nextLevelIndex);
    setCurrentScenarioIndex(0);
    setCurrentScenario(nextLevelScens[0]);
    setScreen("game");
  }, [currentLevelIndex, getLevelScenarios]);

  return (
    <GameContext.Provider
      value={{
        // Ekran & senaryolar
        screen,
        scenarios,
        loading,
        error,
        currentScenario,

        // Level bilgileri
        levelSize: LEVEL_SIZE,
        currentLevelIndex,
        currentScenarioIndex,
        levelProgress,
        getLevelScenarios,

        // Akış fonksiyonları
        startGame,
        fetchScenarios,
        selectScenario,
        exitGame,
        setScreen,
        setError,

        startLevel,
        startScenario,   // 🔥 YENİ EXPORT
        finishScenario,
        goToNextLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
