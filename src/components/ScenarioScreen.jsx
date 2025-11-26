import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ScenariosScreen() {
  const {
    scenarios,
    fetchScenarios,
    loading,
    error,
    getLevelScenarios,
    levelProgress,
    startLevel,
    startScenario,     // 🔥 YENİ: context’ten al
    currentLevelIndex,
  } = useGame();

  const [selectedLevel, setSelectedLevel] = useState(0);
  const [expandedScenarioIds, setExpandedScenarioIds] = useState([]);

  // EKRAN AÇILINCA SENARYOLARI YÜKLE
  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  useEffect(() => {
    setSelectedLevel(currentLevelIndex || 0);
  }, [currentLevelIndex]);

  // Seviye değiştiğinde "daha fazla göster" durumlarını sıfırla
  useEffect(() => {
    setExpandedScenarioIds([]);
  }, [selectedLevel]);

  if (loading) return <div style={status}>Yükleniyor…</div>;
  if (error) return <div style={status}>{error}</div>;
  if (!scenarios.length) return <div style={status}>Senaryo bulunamadı.</div>;

  const levelCount = Math.ceil(scenarios.length / 5);
  const levelIndexes = Array.from({ length: levelCount }, (_, i) => i);

  const levelScenarios = getLevelScenarios(selectedLevel);
  const lp = levelProgress[selectedLevel] || {
    successCount: 0,
    playedCount: 0,
    completed: false,
  };

  const totalInLevel = levelScenarios.length;
  const neededSuccess = Math.min(4, totalInLevel);
  const successCount = lp.successCount || 0;

  const handleStartLevel = () => {
    startLevel(selectedLevel);
  };

  const toggleScenarioExpand = (id) => {
    setExpandedScenarioIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={container}>
      <div style={headerRow}>
        <h2 style={title}>Seviyeler</h2>
      </div>

      <div className="grid-2">
        {/* Sol: Level listesi */}
        <div className="scroll-area" style={listCol}>
          {levelIndexes.map((idx) => {
            const lvlScens = getLevelScenarios(idx);
            const lpItem = levelProgress[idx] || {
              successCount: 0,
              completed: false,
            };
            const total = lvlScens.length;
            const needed = Math.min(4, total);
            const completed = lpItem.completed;
            const isSelected = selectedLevel === idx;

            return (
              <button
                key={idx}
                onClick={() => setSelectedLevel(idx)}
                className="btn btn-secondary"
                style={levelBtn(isSelected, completed)}
              >
                <div style={{ fontWeight: 600 }}>
                  Seviye {idx + 1}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.85,
                    marginTop: 3,
                  }}
                >
                  {lvlScens.length} senaryo ·{" "}
                  {lpItem.successCount || 0}/{needed} başarı{" "}
                  {completed && "✅"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sağ: Seviye detayları */}
        <div style={detailCol}>
          <AnimatePresence mode="wait">
            {levelScenarios.length ? (
              <motion.div
                key={selectedLevel}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={detailCard}
              >
                <h3 style={scenarioTitle}>
                  Seviye {selectedLevel + 1}
                </h3>

                <div style={storyBox}>
                  <h4 style={storyHeader}>📖 Bu seviyede</h4>
                  <p style={storyText}>
                    Bu seviyede{" "}
                    <strong>{totalInLevel}</strong> senaryo
                    oynayacaksın. En az{" "}
                    <strong>{neededSuccess}</strong>{" "}
                    senaryoyu başarıyla tamamlarsan seviye
                    geçmiş sayılacaksın.
                  </p>
                  <hr
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      margin: "8px 0 10px",
                    }}
                  />
                  <div style={storyText}>
                    <strong>Senaryolar:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {levelScenarios.map((s, sIdx) => {
                        const isExpanded =
                          expandedScenarioIds.includes(s.id);

                        return (
                          <li
                            key={s.id}
                            style={{ marginBottom: 12 }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 4,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  flex: 1,
                                }}
                              >
                                {s.name}
                              </div>
                              {/* 🔥 Bu senaryoyu direkt başlat */}
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={playScenarioBtn}
                                onClick={() =>
                                  startScenario(
                                    selectedLevel,
                                    sIdx
                                  )
                                }
                              >
                                Bu senaryoyu oyna
                              </button>
                            </div>

                            <div
                              style={{
                                fontSize: 13,
                                opacity: 0.9,
                                maxHeight: isExpanded ? "none" : 80,
                                overflow: "hidden",
                                maskImage: isExpanded
                                  ? "none"
                                  : "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))",
                              }}
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                              >
                                {s.story}
                              </ReactMarkdown>
                            </div>
                            {s.story && s.story.trim().length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleScenarioExpand(s.id)
                                }
                                style={showMoreBtn}
                              >
                                {isExpanded
                                  ? "Daha az göster"
                                  : "Daha fazla göster"}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div style={buttonRow}>
                  <button
                    className="btn btn-primary"
                    onClick={handleStartLevel}
                  >
                    {lp.completed
                      ? "Bu seviyeyi tekrar oyna"
                      : lp.playedCount > 0
                      ? "Bu seviyeyi baştan oyna"
                      : "Bu seviyeyi oyna (1. senaryodan)"}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    opacity: 0.8,
                    textAlign: "right",
                  }}
                >
                  Tamamlanan senaryo:{" "}
                  <strong>
                    {successCount}/{neededSuccess}
                  </strong>
                </div>
              </motion.div>
            ) : (
              <div style={emptyDetail}>
                Bir seviye seçin.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const container = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: "0 8px",
};

const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const title = { fontSize: 22, fontWeight: 600, color: "var(--text)" };

const listCol = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  paddingRight: 6,
  maxHeight: 420,
};

const detailCol = { minHeight: 360 };

const detailCard = {
  height: "100%",
  padding: 16,
  background: "var(--card)",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,.06)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflowY: "auto",
};

const scenarioTitle = {
  fontSize: 20,
  fontWeight: 600,
  color: "var(--accent)",
  marginBottom: 12,
  borderBottom: "1px solid rgba(255,255,255,.1)",
  paddingBottom: 6,
};

const storyBox = {
  marginTop: 8,
  background: "rgba(255,255,255,0.03)",
  padding: 12,
  borderRadius: 12,
  position: "relative",
};

const storyHeader = {
  fontSize: 16,
  marginBottom: 6,
  color: "var(--accent)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  paddingBottom: 4,
};

const storyText = {
  margin: 0,
  color: "rgba(255,255,255,0.9)",
  lineHeight: 1.6,
  fontSize: 14,
};

const buttonRow = {
  display: "flex",
  gap: 8,
  marginTop: 16,
  justifyContent: "flex-end",
};

const emptyDetail = {
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "var(--muted)",
  border: "1px dashed rgba(255,255,255,.12)",
  borderRadius: 16,
  fontStyle: "italic",
};

const status = {
  padding: 20,
  textAlign: "center",
  fontSize: 18,
  color: "var(--muted)",
};

const levelBtn = (isSelected, completed) => ({
  justifyContent: "space-between",
  width: "100%",
  background: isSelected ? "#182242" : "#161d36",
  border: completed
    ? "1px solid rgba(0, 200, 130, .7)"
    : "1px solid rgba(255,255,255,.08)",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 10,
  transition: "all .2s ease",
  cursor: "pointer",
  color: "var(--text)",
  fontWeight: isSelected ? 600 : 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
});

const showMoreBtn = {
  marginTop: 4,
  fontSize: 12,
  background: "transparent",
  border: "none",
  padding: 0,
  color: "var(--accent)",
  cursor: "pointer",
  textDecoration: "underline",
  alignSelf: "flex-start",
};

const playScenarioBtn = {
  fontSize: 11,
  padding: "6px 10px",
  borderRadius: 999,
};
