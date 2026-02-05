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
    startScenario,
    setScreen,
  } = useGame();

  const { logout } = useAuth();

  const [expandedScenarioIds, setExpandedScenarioIds] = useState([]);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  if (loading) return <div style={loadingContainer}>
    <div style={loadingSpinner}></div>
    <div style={loadingText}>Yükleniyor…</div>
  </div>;
  
  if (error) return <div style={errorContainer}>
    <div style={errorText}>{error}</div>
  </div>;
  
  if (!scenarios.length) return <div style={emptyContainer}>
    <div style={emptyText}>Senaryo bulunamadı.</div>
  </div>;

  const toggleScenarioExpand = (id) => {
    setExpandedScenarioIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSwitchUser = () => {
    logout();
    setScreen("welcome");
  };

  const handleScenarioClick = (sIdx) => {
    startScenario(0, sIdx);
  };

  return (
    <div style={container}>
      <div style={header}>
        <div style={headerContent}>
          <h1 style={title}>Senaryolar</h1>
          <button
            type="button"
            style={switchUserBtn}
            onClick={handleSwitchUser}
          >
            Kullanıcıyı Değiştir
          </button>
        </div>
      </div>

      <div style={mainContent}>
        <div style={scenariosContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={detailContainer}
            >
              <div style={scenariosList}>
                {scenarios.map((s, sIdx) => {
                  const isExpanded = expandedScenarioIds.includes(s.id);

                  return (
                    <motion.div
                      key={s.id}
                      style={scenarioCard}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sIdx * 0.1 }}
                      onClick={() => handleScenarioClick(sIdx)}
                    >
                      <div style={scenarioCardHeader}>
                        <div style={scenarioInfo}>
                          <h3 style={scenarioName}>{s.name}</h3>
                          <div style={scenarioNumber}>Senaryo {sIdx + 1}</div>
                        </div>
                        <motion.button
                          style={playButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            startScenario(0, sIdx);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleScenarioExpand(s.id);
                            }}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(99, 102, 241, 0.15)" }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span style={expandButtonIcon}>{isExpanded ? "−" : "+"}</span>
                            {isExpanded ? "Daha az göster" : "Devamını oku"}
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const container = {
  minHeight: "100vh",
  background: "#060424",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#2d3748",
  overflow: "hidden",
  padding: "0",
};

const header = {
  background: "#080530",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "16px",
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 2px 20px rgba(0, 0, 0, 0.3)",
};

const headerContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
};

const title = {
  fontSize: "clamp(24px, 6vw, 32px)",
  fontWeight: "800",
  margin: 0,
  color: "#ffffff",
};

const switchUserBtn = {
  background: "#0b0638",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "12px",
  padding: "10px 16px",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
};

const mainContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0",
  height: "calc(100vh - 80px)",
};

const scenariosContainer = {
  background: "transparent",
  backdropFilter: "none",
  borderRadius: "0",
  boxShadow: "none",
  border: "none",
  overflowY: "auto",
  overflowX: "hidden",
  height: "100%",
  padding: "16px",
  WebkitOverflowScrolling: "touch",
};

const detailContainer = {
  display: "flex",
  flexDirection: "column",
};

const scenariosList = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  paddingBottom: "24px",
};

const scenarioCard = {
  background: "#0b0638",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  minHeight: "auto",
  cursor: "pointer",
  transition: "all 0.2s ease",
  width: "100%",
  boxSizing: "border-box",
};

const scenarioCardHeader = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const scenarioInfo = {
  flex: 1,
  minWidth: "0",
};

const scenarioName = {
  fontSize: "clamp(18px, 4.5vw, 22px)",
  fontWeight: "700",
  margin: "0 0 6px 0",
  color: "#ffffff",
  lineHeight: "1.3",
  wordWrap: "break-word",
};

const scenarioNumber = {
  fontSize: "13px",
  color: "#a0aec0",
  fontWeight: "500",
};

const playButton = {
  background: "#6366f1",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "10px 20px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const scenarioStory = {
  marginTop: "12px",
};

const storyContent = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#cbd5e0",
  overflow: "hidden",
  transition: "max-height 0.3s ease",
  wordWrap: "break-word",
  overflowWrap: "break-word",
};

const expandButton = {
  background: "rgba(99, 102, 241, 0.08)",
  border: "1px solid rgba(99, 102, 241, 0.3)",
  color: "#a5b4fc",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "10px 16px",
  borderRadius: "10px",
  transition: "all 0.2s ease",
  letterSpacing: "0.3px",
  width: "100%",
};

const expandButtonIcon = {
  fontSize: "18px",
  fontWeight: "700",
  lineHeight: "1",
};

const loadingContainer = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  background: "#060424",
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
  background: "#060424",
  padding: "20px",
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
  background: "#060424",
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

/* Sleek custom scrollbar for desktop */
@media (min-width: 769px) {
  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
  }

  *::-webkit-scrollbar-thumb {
    background: rgba(165, 180, 252, 0.3);
    border-radius: 10px;
    transition: background 0.2s ease;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: rgba(165, 180, 252, 0.5);
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(165, 180, 252, 0.3) rgba(255, 255, 255, 0.03);
  }
}

/* Hide scrollbar on mobile but keep functionality */
@media (max-width: 768px) {
  *::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    display: none;
  }

  * {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
}

@media (max-width: 768px) {
  body {
    overflow-x: hidden;
  }
}
`;
