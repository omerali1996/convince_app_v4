import React from "react";
import { useGame } from "../context/GameContext";

export default function ResultScreen() {
  const {
    currentLevelIndex,
    levelProgress,
    getLevelScenarios,
    goToNextLevel,
    startLevel,
    exitGame,
  } = useGame();

  const levelNumber = currentLevelIndex + 1;

  const currentLevelScenarios =
    getLevelScenarios(currentLevelIndex);
  const totalInLevel = currentLevelScenarios.length;

  const lp =
    levelProgress[currentLevelIndex] || {
      successCount: 0,
      playedCount: 0,
      completed: false,
    };

  const successCount = lp.successCount || 0;
  const playedCount = lp.playedCount || 0;
  const completed = !!lp.completed;
  const neededSuccess = Math.min(4, totalInLevel);

  const nextLevelScenarios = getLevelScenarios(
    currentLevelIndex + 1
  );
  const hasNextLevel = nextLevelScenarios.length > 0;

  const title = completed
    ? `Seviye ${levelNumber} tamamlandı!`
    : `Seviye ${levelNumber} sona erdi`;

  const subtitle = completed
    ? `Tebrikler, bu seviyedeki ${totalInLevel} senaryodan ${successCount} tanesini başarıyla tamamladın.`
    : `Bu seviyedeki ${totalInLevel} senaryodan ${successCount} tanesini başarıyla tamamladın. Seviye geçmek için en az ${neededSuccess} başarılı senaryo gerekiyor. Tekrar deneyebilirsin.`;

  const handleNextLevel = () => {
    if (hasNextLevel) {
      goToNextLevel();
    } else {
      // Son seviye → senaryolar ekranına dön
      exitGame();
    }
  };

  const handleReplayLevel = () => {
    startLevel(currentLevelIndex);
  };

  const primaryLabel = completed
    ? hasNextLevel
      ? "Sonraki seviyeye geç"
      : "Oyunu bitir"
    : "Bu seviyeyi tekrar oyna";

  const primaryAction = completed
    ? handleNextLevel
    : handleReplayLevel;

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={subtitleStyle}>{subtitle}</p>

        <div style={statsRow}>
          <div style={statBox}>
            <div style={statLabel}>
              Başarılı senaryo
            </div>
            <div style={statValue}>
              {successCount}/{neededSuccess}
            </div>
          </div>
          <div style={statBox}>
            <div style={statLabel}>
              Toplam oynanan
            </div>
            <div style={statValue}>
              {playedCount}/{totalInLevel}
            </div>
          </div>
        </div>

        <div style={buttonsRow}>
          <button
            className="btn btn-primary"
            onClick={primaryAction}
          >
            {primaryLabel}
          </button>
          <button
            className="btn btn-secondary"
            onClick={exitGame}
          >
            Senaryo ekranına dön
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const wrap = {
  minHeight: "520px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const card = {
  maxWidth: 480,
  width: "100%",
  background: "var(--card)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "0 8px 24px rgba(0,0,0,.35)",
  padding: "24px 20px",
  textAlign: "center",
};

const titleStyle = {
  fontSize: 24,
  marginBottom: 10,
  color: "var(--text)",
  fontWeight: 700,
};

const subtitleStyle = {
  fontSize: 15,
  color: "rgba(255,255,255,0.88)",
  marginBottom: 18,
  lineHeight: 1.55,
};

const statsRow = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  marginBottom: 20,
};

const statBox = {
  flex: 1,
  minWidth: 120,
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const statLabel = {
  fontSize: 12,
  opacity: 0.8,
  marginBottom: 4,
};

const statValue = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--accent)",
};

const buttonsRow = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginTop: 10,
};
