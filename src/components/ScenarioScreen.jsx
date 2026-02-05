import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
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
    startScenario,
    currentLevelIndex,
    setScreen,
  } = useGame();

  const { logout } = useAuth();

  const [selectedLevel, setSelectedLevel] = useState(0);
  const [expandedScenarioIds, setExpandedScenarioIds] = useState([]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  useEffect(() => {
    setSelectedLevel(currentLevelIndex || 0);
  }, [currentLevelIndex]);

  useEffect(() => {
    setExpandedScenarioIds([]);
  }, [selectedLevel]);

  if (loading) return <div style={loadingContainer}>
    <div style={loadingSpinner}></div>
    <div style={loadingText}>Yükleniyor…</div>
  </div>;
  
  if (error) return <div style={errorContainer}>
    <div style={errorIcon}>⚠️</div>
    <div style={errorText}>{error}</div>
  </div>;
  
  if (!scenarios.length) return <div style={emptyContainer}>
    <div style={emptyIcon}>🎯</div>
    <div style={emptyText}>Senaryo bulunamadı.</div>
  </div>;

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

  const handleSwitchUser = () => {
    logout();
    setScreen("welcome");
  };

  return (
    <div style={container}>
      <div style={header}>
        <div style={headerContent}>
          <h1 style={title}>🎮 Senaryolar</h1>
          <button
            type="button"
            style={switchUserBtn}
            onClick={handleSwitchUser}
          >
            <span style={switchIcon}>👤</span>
            Kullanıcıyı Değiştir
          </button>
        </div>
      </div>

      <div style={mainContent}>
        {/* Sol Panel - Senaryo Grupları */}
        <div style={leftPanel}>
          <div style={panelHeader}>
            <h2 style={panelTitle}>🏆 Grup Seçimi</h2>
          </div>
          <div style={groupList}>
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
                <motion.button
                  key={idx}
                  onClick={() => setSelectedLevel(idx)}
                  style={groupButton(isSelected, completed)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={groupButtonIcon}>
                    {completed ? "🏅" : "🎯"}
                  </div>
                  <div style={groupButtonContent}>
                    <div style={groupButtonTitle}>Grup {idx + 1}</div>
                    <div style={groupButtonSubtitle}>
                      {lvlScens.length} senaryo
                    </div>
                    <div style={progressBar}>
                      <div 
                        style={progressFill((lpItem.successCount || 0) / needed)}
                      ></div>
                    </div>
                    <div style={progressText}>
                      {lpItem.successCount || 0}/{needed} başarı
                    </div>
                  </div>
                  {completed && <div style={completedBadge}>✨</div>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sağ Panel - Senaryo Detayları */}
        <div style={rightPanel}>
          <AnimatePresence mode="wait">
            {levelScenarios.length ? (
              <motion.div
                key={selectedLevel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={detailContainer}
              >
                <div style={detailHeader}>
                  <h2 style={detailTitle}>📚 Grup {selectedLevel + 1} Senaryoları</h2>
                  <div style={detailStats}>
                    <div style={statBadge}>
                      <span style={statIcon}>🎯</span>
                      {totalInLevel} senaryo
                    </div>
                    <div style={statBadge}>
                      <span style={statIcon}>⭐</span>
                      {successCount}/{neededSuccess} başarı
                    </div>
                  </div>
                </div>

                <div style={scenariosList}>
                  {levelScenarios.map((s, sIdx) => {
                    const isExpanded = expandedScenarioIds.includes(s.id);

                    return (
                      <motion.div
                        key={s.id}
                        style={scenarioCard}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sIdx * 0.1 }}
                      >
                        <div style={scenarioCardHeader}>
                          <div style={scenarioIcon}>🎲</div>
                          <div style={scenarioInfo}>
                            <h3 style={scenarioName}>{s.name}</h3>
                            <div style={scenarioNumber}>Senaryo {sIdx + 1}</div>
                          </div>
                          <motion.button
                            style={playButton}
                            onClick={() => startScenario(selectedLevel, sIdx)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span style={playIcon}>▶️</span>
                            Oyna
                          </motion.button>
                        </div>

                        {s.story && (
                          <div style={scenarioStory}>
                            <div
                              style={{
                                ...storyContent,
                                maxHeight: isExpanded ? "none" : "80px",
                                maskImage: isExpanded
                                  ? "none"
                                  : "linear-gradient(to bottom, rgba(0,0,0,1) 60%, transparent)",
                              }}
                            >
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {s.story}
                              </ReactMarkdown>
                            </div>
                            
                            <motion.button
                              style={expandButton}
                              onClick={() => toggleScenarioExpand(s.id)}
                              whileHover={{ scale: 1.02 }}
                            >
                              <span style={expandIcon}>
                                {isExpanded ? "🔼" : "🔽"}
                              </span>
                              {isExpanded ? "Daha az göster" : "Daha fazla göster"}
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div style={actionSection}>
                  <motion.button
                    style={startAllButton}
                    onClick={handleStartLevel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span style={startAllIcon}>🚀</span>
                    {lp.completed
                      ? "Bu grubu tekrar oyna"
                      : lp.playedCount > 0
                      ? "Bu grubu baştan oyna"
                      : "Tüm senaryoları oyna"}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div style={emptyDetail}>
                <div style={emptyDetailIcon}>🎯</div>
                <div style={emptyDetailText}>Bir grup seçin</div>
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
  minHeight: "100vh",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#2d3748",
  overflow: "hidden",
};

const header = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
  padding: "12px 0",
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
};

const headerContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
};

const title = {
  fontSize: "clamp(20px, 5vw, 28px)",
  fontWeight: "800",
  margin: 0,
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const switchUserBtn = {
  background: "linear-gradient(135deg, #ff6b6b, #ffa500)",
  border: "none",
  borderRadius: "25px",
  padding: "8px 16px",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
  transition: "all 0.2s ease",
};

const switchIcon = {
  fontSize: "16px",
};

const mainContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px 16px",
  display: "grid",
  gridTemplateColumns: "minmax(280px, 350px) 1fr",
  gap: "20px",
  height: "calc(100vh - 80px)",
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
    height: "auto",
  },
};

const leftPanel = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  overflowY: "auto",
  maxHeight: "100%",
};

const panelHeader = {
  marginBottom: "20px",
  paddingBottom: "16px",
  borderBottom: "2px solid #f1f5f9",
};

const panelTitle = {
  fontSize: "18px",
  fontWeight: "700",
  margin: 0,
  color: "#1e293b",
};

const groupList = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const groupButton = (isSelected, completed) => ({
  background: isSelected 
    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    : completed
    ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    : "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  border: "none",
  borderRadius: "16px",
  padding: "16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  position: "relative",
  overflow: "hidden",
  boxShadow: isSelected 
    ? "0 8px 25px rgba(79, 172, 254, 0.4)"
    : "0 4px 15px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  color: isSelected ? "white" : "#2d3748",
});

const groupButtonIcon = {
  fontSize: "24px",
  minWidth: "32px",
  textAlign: "center",
};

const groupButtonContent = {
  flex: 1,
  textAlign: "left",
};

const groupButtonTitle = {
  fontSize: "16px",
  fontWeight: "700",
  marginBottom: "4px",
};

const groupButtonSubtitle = {
  fontSize: "12px",
  opacity: 0.8,
  marginBottom: "8px",
};

const progressBar = {
  width: "100%",
  height: "4px",
  background: "rgba(255, 255, 255, 0.3)",
  borderRadius: "2px",
  overflow: "hidden",
  marginBottom: "4px",
};

const progressFill = (percentage) => ({
  width: `${Math.min(percentage * 100, 100)}%`,
  height: "100%",
  background: "rgba(255, 255, 255, 0.8)",
  borderRadius: "2px",
  transition: "width 0.3s ease",
});

const progressText = {
  fontSize: "11px",
  fontWeight: "600",
  opacity: 0.9,
};

const completedBadge = {
  fontSize: "20px",
  position: "absolute",
  top: "8px",
  right: "8px",
};

const rightPanel = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  overflowY: "auto",
  maxHeight: "100%",
};

const detailContainer = {
  padding: "24px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const detailHeader = {
  marginBottom: "24px",
  paddingBottom: "20px",
  borderBottom: "2px solid #f1f5f9",
};

const detailTitle = {
  fontSize: "22px",
  fontWeight: "800",
  margin: "0 0 12px 0",
  color: "#1e293b",
};

const detailStats = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const statBadge = {
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "white",
  padding: "6px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const statIcon = {
  fontSize: "14px",
};

const scenariosList = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginBottom: "24px",
};

const scenarioCard = {
  background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

const scenarioCardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
};

const scenarioIcon = {
  fontSize: "24px",
  minWidth: "32px",
  textAlign: "center",
};

const scenarioInfo = {
  flex: 1,
};

const scenarioName = {
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 4px 0",
  color: "#2d3748",
};

const scenarioNumber = {
  fontSize: "12px",
  color: "#718096",
  fontWeight: "500",
};

const playButton = {
  background: "linear-gradient(135deg, #48bb78, #38a169)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "8px 16px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 8px rgba(72, 187, 120, 0.3)",
};

const playIcon = {
  fontSize: "12px",
};

const scenarioStory = {
  marginTop: "12px",
};

const storyContent = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#4a5568",
  overflow: "hidden",
  transition: "max-height 0.3s ease",
};

const expandButton = {
  background: "transparent",
  border: "none",
  color: "#667eea",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "8px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 8px",
  borderRadius: "8px",
  transition: "background 0.2s ease",
};

const expandIcon = {
  fontSize: "10px",
};

const actionSection = {
  paddingTop: "20px",
  borderTop: "2px solid #f1f5f9",
  textAlign: "center",
};

const startAllButton = {
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "white",
  border: "none",
  borderRadius: "16px",
  padding: "14px 28px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
  minWidth: "200px",
  justifyContent: "center",
};

const startAllIcon = {
  fontSize: "18px",
};

const emptyDetail = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  color: "#a0aec0",
  padding: "40px",
  textAlign: "center",
};

const emptyDetailIcon = {
  fontSize: "48px",
};

const emptyDetailText = {
  fontSize: "18px",
  fontWeight: "600",
};

const loadingContainer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

const loadingSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255, 255, 255, 0.3)",
  borderTop: "4px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const loadingText = {
  color: "white",
  fontSize: "18px",
  fontWeight: "600",
};

const errorContainer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "20px",
};

const errorIcon = {
  fontSize: "48px",
};

const errorText = {
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  textAlign: "center",
};

const emptyContainer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

const emptyIcon = {
  fontSize: "48px",
};

const emptyText = {
  color: "white",
  fontSize: "18px",
  fontWeight: "600",
};

// CSS Animation keyframes should be added to your global CSS
const globalCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .mainContent {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
    padding: 16px !important;
  }
  
  .leftPanel, .rightPanel {
    max-height: none !important;
  }
}
`;
