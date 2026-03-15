import { useState } from "react";

const layers = [
  {
    id: "iot",
    label: "EDGE / IoT LAYER",
    color: "#00D4AA",
    bg: "rgba(0,212,170,0.08)",
    border: "rgba(0,212,170,0.3)",
    components: [
      {
        name: "ESP32 Voting Terminal",
        icon: "🖥️",
        details: ["R307 Fingerprint Sensor", "SHA-256 biometric hashing", "Offline vote caching", "Tamper detection auto-disable"],
        tech: "C++ / PlatformIO",
        file: "iot-terminal/esp32_firmware/",
      },
      {
        name: "MQTT Broker",
        icon: "📡",
        details: ["Secure publish/subscribe", "TLS 1.3 transport", "Terminal ↔ Backend bridge", "Message queue for offline sync"],
        tech: "MQTT Protocol",
        file: "iot-terminal/mqtt_config/",
      },
    ],
  },
  {
    id: "backend",
    label: "BACKEND / API LAYER",
    color: "#4A9EFF",
    bg: "rgba(74,158,255,0.08)",
    border: "rgba(74,158,255,0.3)",
    components: [
      {
        name: "Auth Service",
        icon: "🔐",
        details: ["Biometric hash verification", "JWT token issuance", "Role-based access control", "Session management"],
        tech: "Node.js / Express",
        file: "backend/src/services/authService.js",
      },
      {
        name: "Vote Service",
        icon: "🗳️",
        details: ["Vote casting & validation", "Duplicate vote prevention", "AES-256-GCM encryption", "Fabric SDK submission"],
        tech: "Node.js / Express",
        file: "backend/src/services/voteService.js",
      },
      {
        name: "Results Service",
        icon: "📊",
        details: ["Real-time tally computation", "Election status management", "Result finalization", "Public result broadcast"],
        tech: "Node.js / Express",
        file: "backend/src/services/resultsService.js",
      },
      {
        name: "IoT Gateway",
        icon: "🌐",
        details: ["Terminal registration", "MQTT message parsing", "Health monitoring", "Offline sync resolution"],
        tech: "Node.js / MQTT",
        file: "backend/src/services/iotService.js",
      },
    ],
  },
  {
    id: "blockchain",
    label: "BLOCKCHAIN LAYER",
    color: "#FF6B6B",
    bg: "rgba(255,107,107,0.08)",
    border: "rgba(255,107,107,0.3)",
    components: [
      {
        name: "Hyperledger Fabric Network",
        icon: "🔗",
        details: ["3-org topology (Commission, Judiciary, Observers)", "Endorsement policy: 2-of-3", "Immutable vote ledger", "Audit trail for all transactions"],
        tech: "Hyperledger Fabric 2.5",
        file: "blockchain/network/",
      },
      {
        name: "VotingLedger Chaincode",
        icon: "📜",
        details: ["castVote() smart contract", "getVoterStatus() query", "getElectionResults() query", "Voter eligibility enforcement"],
        tech: "Go / Node.js Chaincode",
        file: "blockchain/chaincode/voting/",
      },
    ],
  },
  {
    id: "data",
    label: "DATA LAYER",
    color: "#FFB347",
    bg: "rgba(255,179,71,0.08)",
    border: "rgba(255,179,71,0.3)",
    components: [
      {
        name: "PostgreSQL",
        icon: "🗄️",
        details: ["Voter registration metadata", "Candidate & election data", "Biometric hashes (no raw data)", "Encrypted PII fields"],
        tech: "PostgreSQL 15",
        file: "backend/src/models/ (Sequelize)",
      },
      {
        name: "MongoDB",
        icon: "📋",
        details: ["Audit & event logs", "ML analytics events", "System activity logs", "IoT terminal telemetry"],
        tech: "MongoDB 6",
        file: "backend/src/db/mongo/",
      },
    ],
  },
  {
    id: "ml",
    label: "ML / ANALYTICS LAYER",
    color: "#B47FFF",
    bg: "rgba(180,127,255,0.08)",
    border: "rgba(180,127,255,0.3)",
    components: [
      {
        name: "Fraud Detection Engine",
        icon: "🚨",
        details: ["Isolation Forest anomaly detection", "15+ behavioral features", "Real-time vote stream analysis", "6 alert types (velocity, geo, temporal…)"],
        tech: "Python / Scikit-learn",
        file: "ml-service/anomaly_detection.py",
      },
      {
        name: "Analytics Pipeline",
        icon: "📈",
        details: ["Voter turnout trends", "Geographic distribution", "Voting velocity metrics", "Model retraining scheduler"],
        tech: "Python / Pandas",
        file: "ml-analytics/data_pipeline.py",
      },
    ],
  },
  {
    id: "frontend",
    label: "FRONTEND LAYER",
    color: "#FF9ECD",
    bg: "rgba(255,158,205,0.08)",
    border: "rgba(255,158,205,0.3)",
    components: [
      {
        name: "Voter UI",
        icon: "👤",
        details: ["7-step voting flow (<4 min)", "Multi-language (6 languages)", "Voice guidance + accessibility", "Real-time vote confirmation"],
        tech: "React 18 / Vite",
        file: "voter-ui/src/",
      },
      {
        name: "Observer Dashboard",
        icon: "👁️",
        details: ["Live tally + Chart.js charts", "Blockchain tx hash verifier", "Fraud alert panel", "Audit log browser"],
        tech: "React 18 / Chart.js",
        file: "observer-dashboard/src/",
      },
      {
        name: "Admin Portal",
        icon: "🛠️",
        details: ["Election creation wizard", "Poll open/close controls", "Candidate management", "System health monitoring"],
        tech: "React 18 / Vite",
        file: "admin-portal/src/",
      },
    ],
  },
];

const fileStructure = {
  name: "ElectionManagement/",
  children: [
    {
      name: "voter-ui/",
      color: "#FF9ECD",
      children: [
        { name: "src/components/", children: [{ name: "VotingFlow/" }, { name: "BiometricAuth/" }, { name: "BallotScreen/" }, { name: "ConfirmationScreen/" }] },
        { name: "src/i18n/", children: [{ name: "en.json" }, { name: "hi.json" }, { name: "6 languages" }] },
        { name: "src/api/", children: [{ name: "voteApi.js" }, { name: "authApi.js" }] },
        { name: "package.json" },
      ],
    },
    {
      name: "observer-dashboard/",
      color: "#FF9ECD",
      children: [
        { name: "src/components/", children: [{ name: "LiveTally/" }, { name: "FraudAlerts/" }, { name: "BlockchainVerifier/" }, { name: "AuditLog/" }] },
        { name: "src/charts/", children: [{ name: "TurnoutChart.jsx" }, { name: "GeoMap.jsx" }] },
      ],
    },
    {
      name: "admin-portal/",
      color: "#FF9ECD",
      children: [
        { name: "src/components/", children: [{ name: "ElectionWizard/" }, { name: "CandidateManager/" }, { name: "PollControls/" }] },
      ],
    },
    {
      name: "backend/",
      color: "#4A9EFF",
      children: [
        {
          name: "src/",
          children: [
            { name: "controllers/", children: [{ name: "electionController.js" }, { name: "voteController.js" }, { name: "authController.js" }, { name: "resultsController.js" }] },
            { name: "services/", children: [{ name: "authService.js" }, { name: "voteService.js" }, { name: "resultsService.js" }, { name: "iotService.js" }, { name: "fabricService.js" }] },
            { name: "routes/", children: [{ name: "auth.routes.js" }, { name: "vote.routes.js" }, { name: "election.routes.js" }, { name: "results.routes.js" }] },
            { name: "models/", children: [{ name: "Voter.js" }, { name: "Election.js" }, { name: "Candidate.js" }] },
            { name: "middleware/", children: [{ name: "auth.middleware.js" }, { name: "encryption.js" }, { name: "rateLimiter.js" }] },
            { name: "db/", children: [{ name: "postgres.js" }, { name: "mongo.js" }] },
          ],
        },
        { name: "package.json" },
      ],
    },
    {
      name: "blockchain/",
      color: "#FF6B6B",
      children: [
        { name: "chaincode/", children: [{ name: "voting/", children: [{ name: "voting.go" }, { name: "index.js" }] }, { name: "identity/" }] },
        { name: "network/", children: [{ name: "configtx.yaml" }, { name: "crypto-config.yaml" }, { name: "docker-compose-fabric.yml" }] },
        { name: "config/", children: [{ name: "connection-profile.json" }, { name: "wallet/" }] },
      ],
    },
    {
      name: "iot-terminal/",
      color: "#00D4AA",
      children: [
        { name: "esp32_firmware/", children: [{ name: "main.cpp" }, { name: "fingerprint.cpp" }, { name: "mqtt_client.cpp" }, { name: "crypto_utils.cpp" }] },
        { name: "platformio.ini" },
      ],
    },
    {
      name: "ml-service/",
      color: "#B47FFF",
      children: [{ name: "anomaly_detection.py" }, { name: "feature_extractor.py" }, { name: "model_trainer.py" }, { name: "requirements.txt" }],
    },
    {
      name: "ml-analytics/",
      color: "#B47FFF",
      children: [{ name: "data_pipeline.py" }, { name: "visualizations.py" }, { name: "requirements.txt" }],
    },
    {
      name: "docs/",
      children: [
        { name: "architecture/" },
        { name: "security/" },
        { name: "deployment/" },
        { name: "user-guides/" },
        { name: "api/" },
      ],
    },
    {
      name: "infrastructure/",
      color: "#888",
      children: [{ name: "kubernetes/", children: [{ name: "deployments/" }, { name: "services/" }] }, { name: "terraform/" }],
    },
    { name: ".github/workflows/", children: [{ name: "ci-cd.yml" }, { name: "security-scan.yml" }] },
    { name: "docker-compose.yml" },
    { name: ".env.example" },
    { name: "README.md" },
  ],
};

function FileNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isDir = node.name.endsWith("/");

  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "2px 4px",
          borderRadius: 3,
          cursor: hasChildren ? "pointer" : "default",
          color: node.color || (isDir ? "#ccc" : "#888"),
          fontSize: 12,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => hasChildren && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: 10, opacity: 0.7, width: 12 }}>
          {hasChildren ? (open ? "▼" : "▶") : ""}
        </span>
        <span>{isDir ? "📁" : "📄"}</span>
        <span>{node.name}</span>
      </div>
      {open && hasChildren && (
        <div>
          {node.children.map((child, i) => (
            <FileNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ElectionArchitecture() {
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [tab, setTab] = useState("architecture");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0E1A",
      color: "#E8EAF0",
      fontFamily: "'Syne', 'Helvetica Neue', sans-serif",
      padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0E1A; }
        ::-webkit-scrollbar-thumb { background: #2A3050; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 36px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#00D4AA", textTransform: "uppercase", marginBottom: 4 }}>System Design</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>🔐 Election Management System</div>
          <div style={{ fontSize: 11, color: "#606880", marginTop: 3 }}>Blockchain · IoT · ML Fraud Detection · navyaaasingh/ElectionManagement</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["architecture", "filestructure"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "7px 18px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: tab === t ? "#4A9EFF" : "rgba(255,255,255,0.1)",
                background: tab === t ? "rgba(74,158,255,0.15)" : "transparent",
                color: tab === t ? "#4A9EFF" : "#888",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {t === "architecture" ? "Architecture" : "File Structure"}
            </button>
          ))}
        </div>
      </div>

      {tab === "architecture" && (
        <div style={{ padding: "28px 36px", display: "flex", gap: 24 }}>
          {/* Layer stack */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                style={{
                  background: activeLayer === layer.id ? layer.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activeLayer === layer.id ? layer.border : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: activeLayer === layer.id ? 14 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 3, height: 18, background: layer.color, borderRadius: 2 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: layer.color, textTransform: "uppercase" }}>
                      {layer.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {layer.components.map(c => (
                      <span key={c.name} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 20,
                        background: `${layer.color}18`, color: layer.color, border: `1px solid ${layer.color}30`
                      }}>
                        {c.icon} {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {activeLayer === layer.id && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                    {layer.components.map(comp => (
                      <div
                        key={comp.name}
                        onClick={e => { e.stopPropagation(); setActiveComponent(activeComponent?.name === comp.name ? null : comp); }}
                        style={{
                          background: activeComponent?.name === comp.name ? `${layer.color}15` : "rgba(0,0,0,0.3)",
                          border: `1px solid ${activeComponent?.name === comp.name ? layer.color : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 8,
                          padding: 14,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{comp.icon} {comp.name}</div>
                        <div style={{ fontSize: 10, color: layer.color, fontFamily: "JetBrains Mono, monospace", marginBottom: 8, opacity: 0.8 }}>
                          {comp.tech}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 14 }}>
                          {comp.details.map((d, i) => (
                            <li key={i} style={{ fontSize: 11, color: "#99A0B8", marginBottom: 2 }}>{d}</li>
                          ))}
                        </ul>
                        <div style={{
                          marginTop: 10, padding: "4px 8px", background: "rgba(0,0,0,0.4)", borderRadius: 4,
                          fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#606880"
                        }}>
                          📁 {comp.file}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Data flow arrows between layers */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: "16px 20px",
              marginTop: 4,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#606880", textTransform: "uppercase", marginBottom: 12 }}>Data Flow</div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", gap: 4 }}>
                {[
                  ["IoT Terminal", "#00D4AA"],
                  ["→ MQTT →", "#444"],
                  ["Backend API", "#4A9EFF"],
                  ["→ Fabric SDK →", "#444"],
                  ["Blockchain", "#FF6B6B"],
                  ["→ Event →", "#444"],
                  ["ML Engine", "#B47FFF"],
                  ["→ Alerts →", "#444"],
                  ["Dashboards", "#FF9ECD"],
                ].map(([label, color], i) => (
                  <span key={i} style={{
                    fontSize: 11, color, fontWeight: color === "#444" ? 400 : 600,
                    fontFamily: color === "#444" ? "JetBrains Mono, monospace" : "inherit",
                    opacity: color === "#444" ? 0.5 : 1,
                  }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar: API Routes + Security */}
          <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 18,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#4A9EFF", textTransform: "uppercase", marginBottom: 14 }}>API Routes</div>
              {[
                ["POST", "/api/v1/auth/biometric", "#00D4AA"],
                ["POST", "/api/v1/votes/cast", "#FF6B6B"],
                ["GET", "/api/v1/results/:id", "#4A9EFF"],
                ["GET", "/api/v1/voter/status", "#4A9EFF"],
                ["GET", "/api/v1/audit-log", "#FFB347"],
                ["POST", "/api/v1/elections", "#FF9ECD"],
                ["PUT", "/api/v1/elections/:id/close", "#FF9ECD"],
              ].map(([method, route, color], i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "baseline", marginBottom: 7,
                  paddingBottom: 7, borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.04)" : "none"
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color, background: `${color}15`,
                    border: `1px solid ${color}30`, padding: "1px 5px", borderRadius: 3,
                    fontFamily: "JetBrains Mono, monospace", flexShrink: 0
                  }}>
                    {method}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#8892AA" }}>{route}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 18,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#FF6B6B", textTransform: "uppercase", marginBottom: 14 }}>Security Stack</div>
              {[
                ["🔑", "SHA-256 biometric hashing"],
                ["🔒", "AES-256-GCM vote encryption"],
                ["🛡️", "TLS 1.3 all transport"],
                ["👁️", "No raw biometric stored"],
                ["✅", "2-of-3 endorsement policy"],
                ["🚫", "Role-based access control"],
                ["⚡", "Tamper detection (IoT)"],
                ["🔍", "ML anomaly detection"],
              ].map(([icon, label], i) => (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "center", marginBottom: 8,
                  fontSize: 11, color: "#8892AA"
                }}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 18,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#FFB347", textTransform: "uppercase", marginBottom: 14 }}>Performance Targets</div>
              {[
                ["1,000 TPS", "sustained votes/sec"],
                ["5,000 TPS", "burst capacity"],
                ["< 2 min", "average vote time"],
                ["> 95%", "biometric auth success"],
                ["< 4 min", "full 7-step voter flow"],
              ].map(([val, label], i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#FFB347" }}>{val}</div>
                  <div style={{ fontSize: 10, color: "#606880" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "filestructure" && (
        <div style={{ padding: "28px 36px" }}>
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            padding: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#4A9EFF", textTransform: "uppercase", marginBottom: 16 }}>Repository Tree</div>
              <FileNode node={fileStructure} depth={0} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#00D4AA", textTransform: "uppercase", marginBottom: 16 }}>Module Responsibilities</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { dir: "voter-ui/", color: "#FF9ECD", desc: "React 18 voter-facing app. 7-step guided voting flow with biometric confirmation, multi-language support (6 langs), voice guidance for accessibility.", stack: "React · Vite · i18next" },
                  { dir: "observer-dashboard/", color: "#FF9ECD", desc: "Real-time election monitoring. Live tally charts, blockchain transaction verifier, fraud alert panel, full audit log browser.", stack: "React · Chart.js" },
                  { dir: "admin-portal/", color: "#FF9ECD", desc: "Election lifecycle management. Create elections, manage candidates, open/close polls, view system health.", stack: "React · Vite" },
                  { dir: "backend/", color: "#4A9EFF", desc: "Node.js REST API server. Handles auth, vote submission, results aggregation, IoT gateway, and Fabric SDK integration.", stack: "Node.js · Express · Sequelize" },
                  { dir: "blockchain/", color: "#FF6B6B", desc: "Hyperledger Fabric 2.5 network. 3-org permissioned ledger, Go/JS chaincode for vote enforcement, crypto-config & endorsement policies.", stack: "Hyperledger Fabric · Go" },
                  { dir: "iot-terminal/", color: "#00D4AA", desc: "ESP32 C++ firmware. Captures fingerprint → SHA-256 hash → MQTT publish to backend. Includes tamper detection and offline caching.", stack: "C++ · PlatformIO · MQTT" },
                  { dir: "ml-service/", color: "#B47FFF", desc: "Python Isolation Forest fraud detector. Analyzes 15+ behavioral features in vote stream. Emits 6 alert types to backend.", stack: "Python · Scikit-learn" },
                  { dir: "ml-analytics/", color: "#B47FFF", desc: "Batch analytics pipeline for turnout trends, geographic distribution, voting velocity. Feeds observer dashboard.", stack: "Python · Pandas" },
                  { dir: "infrastructure/", color: "#888", desc: "Kubernetes manifests and Terraform IaC for production deployment. CI/CD pipelines in .github/workflows/.", stack: "Kubernetes · Terraform" },
                ].map(({ dir, color, desc, stack }) => (
                  <div key={dir} style={{
                    padding: 14,
                    background: "rgba(0,0,0,0.2)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace" }}>{dir}</span>
                      <span style={{ fontSize: 9, color: "#555", fontFamily: "JetBrains Mono, monospace" }}>{stack}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: "#8892AA", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
