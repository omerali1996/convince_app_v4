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
                    >
                      <div style={scenarioCardHeader}>
                        <div style={scenarioInfo}>
                          <h3 style={scenarioName}>{s.name}</h3>
                          <div style={scenarioNumber}>Senaryo {sIdx + 1}</div>
                        </div>
                        <motion.button
                          style={playButton}
                          onClick={() => startScenario(0, sIdx)}
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
                            onClick={() => toggleScenarioExpand(s.id)}
                            whileHover={{ scale: 1.02 }}
                          >
                            {isExpanded ? "Daha az göster" : "Daha fazla göster"}
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
  padding: "12px 0",
};

const header = {
  background: "#0a0635",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "12px 0",
  position: "sticky",
  top: 0,
  zIndex: 100,
  boxShadow: "0 2px 20px rgba(0, 0, 0, 0.3)",
  borderRadius: "20px",
  margin: "0 16px",
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
  color: "#ffffff",
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

const mainContent = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "16px",
};

const scenariosContainer = {
  background: "#0a0635",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  overflowY: "auto",
  maxHeight: "calc(100vh - 140px)",
};

const detailContainer = {
  padding: "24px",
  paddingBottom: "40px",
  display: "flex",
  flexDirection: "column",
};

const scenariosList = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginBottom: "24px",
};

const scenarioCard = {
  background: "#0e0846",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  minHeight: "120px",
};

const scenarioCardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
};

const scenarioInfo = {
  flex: 1,
};

const scenarioName = {
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 4px 0",
  color: "#ffffff",
};

const scenarioNumber = {
  fontSize: "12px",
  color: "#a0aec0",
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

const scenarioStory = {
  marginTop: "12px",
};

const storyContent = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#cbd5e0",
  overflow: "hidden",
  transition: "max-height 0.3s ease",
};

const expandButton = {
  background: "transparent",
  border: "none",
  color: "#a0aec0",
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

@media (max-width: 768px) {
  .mainContent {
    padding: 16px !important;
  }
}
`;
