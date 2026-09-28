import { useEffect, useMemo, useRef, useState } from "react";
import {
  Shield,
  Activity,
  Globe,
  Radar,
  Bug,
  AlertTriangle,
  Lock,
  Trash2,
  UserX,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useLanguage } from "../../../../Context/LanguageContext";

const ARCHITECTURE_ITEMS = [
  {
    id: "encryption",
    label: "Encryption",
    status: "TLS 1.3",
    tone: "green",
    description: "Transport layer encryption is active for all API and admin sessions.",
  },
  {
    id: "jwt",
    label: "JWT Auth",
    status: "Verified",
    tone: "green",
    description: "Token signatures and expiry checks are validated on each privileged request.",
  },
  {
    id: "rbac",
    label: "RBAC",
    status: "Strict",
    tone: "green",
    description:
      "Role-Based Access Control ensures users only access resources permitted by their role.",
  },
  {
    id: "sanitize",
    label: "Input Sanitization",
    status: "Active",
    tone: "green",
    description: "Incoming payloads are sanitized to reduce XSS and injection vectors.",
  },
];

const ARCH_STATUS_POOLS = {
  encryption: [
    { status: "TLS 1.3", tone: "green" },
    { status: "TLS 1.3", tone: "green" },
    { status: "Handshake Peak", tone: "amber" },
  ],
  jwt: [
    { status: "Verified", tone: "green" },
    { status: "Verified", tone: "green" },
    { status: "Token Refresh", tone: "amber" },
  ],
  rbac: [
    { status: "Strict", tone: "green" },
    { status: "Strict", tone: "green" },
    { status: "Audit Mode", tone: "amber" },
  ],
  sanitize: [
    { status: "Active", tone: "green" },
    { status: "Active", tone: "green" },
    { status: "Filtering Burst", tone: "amber" },
  ],
};

const GEO_COUNTRIES = ["AT", "DE", "US"];
const GEO_REGION_OPTIONS = ["CN", "RU", "US", "DE", "AT", "BR", "IN", "EG"];

const THREAT_POINTS = [
  {
    id: "na",
    label: "North America Node",
    position: [40, -100],
    color: "#f43f5e",
    risk: "High",
    country: "United States",
    city: "Denver Region",
    lastSeen: "2m ago",
    details: "Repeated suspicious login bursts detected.",
  },
  {
    id: "eu",
    label: "Europe Node",
    position: [50, 10],
    color: "#fb923c",
    risk: "Medium",
    country: "Germany",
    city: "Frankfurt Region",
    lastSeen: "6m ago",
    details: "Elevated API scanning activity across auth endpoints.",
  },
  {
    id: "asia",
    label: "Asia Node",
    position: [30, 105],
    color: "#34d399",
    risk: "Low",
    country: "China",
    city: "Chengdu Region",
    lastSeen: "11m ago",
    details: "Background probe traffic, currently contained.",
  },
  {
    id: "afr",
    label: "Africa Node",
    position: [5, 20],
    color: "#f59e0b",
    risk: "Medium",
    country: "Cameroon",
    city: "Yaounde Region",
    lastSeen: "8m ago",
    details: "Credential stuffing pattern detected and throttled.",
  },
];

const SIMULATED_THREAT_TEMPLATES = [
  {
    label: "North Atlantic Relay",
    position: [56, -24],
    country: "Iceland",
    city: "Reykjavik Corridor",
    details: "Synthetic botnet relay burst generated for simulation analysis.",
  },
  {
    label: "Levant Edge Node",
    position: [33, 36],
    country: "Jordan",
    city: "Amman Region",
    details: "Simulated credential replay attempts against admin endpoints.",
  },
  {
    label: "South Pacific Gate",
    position: [-15, 160],
    country: "Vanuatu",
    city: "Port Vila Sector",
    details: "Synthetic lateral movement signature with packet anomaly spikes.",
  },
  {
    label: "South America Drift",
    position: [-20, -58],
    country: "Paraguay",
    city: "Asuncion Region",
    details: "Simulated brute-force pattern routed through proxy pools.",
  },
  {
    label: "West Africa Transit",
    position: [8, -5],
    country: "Cote d'Ivoire",
    city: "Abidjan Sector",
    details: "Generated high-frequency probe traffic from rotating IP blocks.",
  },
  {
    label: "Indian Ocean Probe",
    position: [-9, 69],
    country: "Maldives",
    city: "Male Route",
    details: "Simulated exfiltration probe sequence with staggered timing.",
  },
];

const WORLD_BOUNDS = [
  [-58, -170],
  [78, 170],
];

function MapAutoFit() {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize();
    };

    const t1 = window.setTimeout(resizeMap, 0);
    const t2 = window.setTimeout(resizeMap, 220);
    window.addEventListener("resize", resizeMap);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", resizeMap);
    };
  }, [map]);

  return null;
}

function DarkCard({ title, icon: Icon, right, children, lightMode = false }) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.1)] ${
        lightMode ? "border-slate-200 bg-white" : "border-[#243654] bg-[#121d30]/95"
      }`}
    >
      <div
        className={`mb-3 flex items-center justify-between border-b pb-2 ${
          lightMode ? "border-slate-200" : "border-[#22314c]"
        }`}
      >
        <h4
          className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
            lightMode ? "text-slate-700" : "text-slate-200"
          }`}
        >
          <Icon className="h-3.5 w-3.5 text-[#4ea2ff]" />
          {title}
        </h4>
        {right}
      </div>
      {children}
    </div>
  );
}

function getArchitectureBadgeClass(tone) {
  if (tone === "red") {
    return "bg-rose-900/70 text-rose-300 border border-rose-700";
  }
  if (tone === "amber") {
    return "bg-amber-900/70 text-amber-300 border border-amber-700";
  }
  return "bg-emerald-900/70 text-emerald-300 border border-emerald-700";
}

function DangerAction({ title, description, buttonText, buttonClass, onClick, icon: Icon, lightMode = false }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        lightMode ? "border-slate-200 bg-slate-50" : "border-slate-700 bg-slate-900"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className={`font-medium ${lightMode ? "text-slate-800" : "text-slate-100"}`}>{title}</p>
          <p className={`text-xs ${lightMode ? "text-slate-500" : "text-slate-400"}`}>{description}</p>
        </div>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded px-3 py-2 text-xs font-semibold uppercase tracking-wide ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRiskWeight(risk) {
  if (risk === "Critical") return 4;
  if (risk === "High") return 3;
  if (risk === "Medium") return 2;
  return 1;
}

function getRiskColor(risk) {
  if (risk === "Critical") return "#f43f5e";
  if (risk === "High") return "#fb7185";
  if (risk === "Medium") return "#f59e0b";
  return "#34d399";
}

function generateSimulatedThreat(seed, index) {
  const template = randomPick(SIMULATED_THREAT_TEMPLATES);
  const riskRoll = Math.random();
  const risk =
    riskRoll > 0.85 ? "Critical" : riskRoll > 0.58 ? "High" : riskRoll > 0.26 ? "Medium" : "Low";

  return {
    id: `sim-${seed}-${index}-${Math.floor(Math.random() * 10000)}`,
    label: `Simulated ${template.label}`,
    position: [
      clamp(template.position[0] + (Math.random() - 0.5) * 8, -55, 75),
      clamp(template.position[1] + (Math.random() - 0.5) * 10, -165, 165),
    ],
    color: getRiskColor(risk),
    risk,
    country: template.country,
    city: template.city,
    lastSeen: "just now",
    details: `[SIM] ${template.details}`,
    simulated: true,
  };
}

function buildTrafficPaths(points, width = 300, height = 56) {
  if (!points.length) {
    return { linePath: "", areaPath: "", lastX: width, lastY: height / 2 };
  }

  const minValue = Math.min(...points);
  const maxValue = Math.max(...points);
  const center = (minValue + maxValue) / 2;
  const halfRange = Math.max((maxValue - minValue) / 2, 9);
  const normalizedMin = center - halfRange;
  const normalizedMax = center + halfRange;
  const drawTopPadding = 2;
  const drawBottomPadding = 2;
  const drawHeight = height - drawTopPadding - drawBottomPadding;

  const xStep = width / Math.max(points.length - 1, 1);
  const coords = points.map((value, index) => ({
    x: index * xStep,
    y:
      drawTopPadding +
      ((normalizedMax - value) / Math.max(normalizedMax - normalizedMin, 1)) * drawHeight,
  }));

  let linePath = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let index = 1; index < coords.length - 1; index += 1) {
    const curr = coords[index];
    const next = coords[index + 1];
    const controlX = ((curr.x + next.x) / 2).toFixed(2);
    const controlY = ((curr.y + next.y) / 2).toFixed(2);
    linePath += ` Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${controlX} ${controlY}`;
  }
  if (coords.length > 1) {
    const penultimate = coords[coords.length - 2];
    const lastPoint = coords[coords.length - 1];
    linePath += ` Q ${penultimate.x.toFixed(2)} ${penultimate.y.toFixed(
      2
    )} ${lastPoint.x.toFixed(2)} ${lastPoint.y.toFixed(2)}`;
  }

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const last = coords[coords.length - 1];

  return {
    linePath,
    areaPath,
    lastX: last.x,
    lastY: last.y,
  };
}

const TRAFFIC_TOTAL_POINTS = 30;

function computeTrafficPoint(phase, isSimulationMode, criticalThreats, highSeverity) {
  const base = 52 + Math.sin(phase / 2.1) * 15 + Math.sin(phase / 1.05) * 5.5;
  const simulationBoost = isSimulationMode ? criticalThreats * 2.8 + highSeverity * 1.15 : 0;
  const jitter = (Math.random() - 0.5) * (isSimulationMode ? 5.5 : 3.1);
  return clamp(base + simulationBoost + jitter, 12, 95);
}

export default function SecurityCyberMonitorPanel({
  settings,
  onUpdateSettings,
  onRequestProtectedAction,
  isDarkMode = true,
}) {
  const lightMode = !isDarkMode;
  const { t } = useLanguage();
  const archLabels = {
    encryption: { label: t("secCyber.encryption"), desc: t("secCyber.encryptionDesc") },
    jwt: { label: t("secCyber.jwtAuth"), desc: t("secCyber.jwtDesc") },
    rbac: { label: t("secCyber.rbac"), desc: t("secCyber.rbacDesc") },
    sanitize: { label: t("secCyber.inputSanitization"), desc: t("secCyber.inputSanitizationDesc") },
    lockdown: { label: t("secCyber.emergencyLockdown"), desc: t("secCyber.emergencyLockdownDesc") },
  };
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [criticalThreats, setCriticalThreats] = useState(0);
  const [highSeverity, setHighSeverity] = useState(0);
  const [criticalDelta, setCriticalDelta] = useState(0);
  const [highDelta, setHighDelta] = useState(0);
  const [isGeoFencingEnabled, setIsGeoFencingEnabled] = useState(false);
  const [geoWhitelistMode, setGeoWhitelistMode] = useState(false);
  const [geoSelectedRegions, setGeoSelectedRegions] = useState(["US"]);
  const [scanStatus, setScanStatus] = useState("Scan Ready");
  const [scanAppIntegrity, setScanAppIntegrity] = useState(true);
  const [scanHostRootkit, setScanHostRootkit] = useState(true);
  const [scanAutoEnabled, setScanAutoEnabled] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(true);
  const [sessionFingerprintHash, setSessionFingerprintHash] = useState("A17FD9");
  const [sessionIp, setSessionIp] = useState("127.0.0.1 (Local)");
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [dangerReadiness, setDangerReadiness] = useState({
    lockdown: 99,
    wipe: 97,
    rtbf: 98,
  });
  const [threatPoints, setThreatPoints] = useState(THREAT_POINTS);
  const [simulatedThreats, setSimulatedThreats] = useState([]);
  const [threatPulseFrame, setThreatPulseFrame] = useState(0);
  const [selectedThreatId, setSelectedThreatId] = useState(THREAT_POINTS[0].id);
  const [shieldHealth, setShieldHealth] = useState(98);
  const [shieldRuntimeStatus, setShieldRuntimeStatus] = useState("ACTIVE");
  const [architectureRuntime, setArchitectureRuntime] = useState(() => ({
    encryption: { status: "TLS 1.3", tone: "green", lastChecked: Date.now() },
    jwt: { status: "Verified", tone: "green", lastChecked: Date.now() },
    rbac: { status: "Strict", tone: "green", lastChecked: Date.now() },
    sanitize: { status: "Active", tone: "green", lastChecked: Date.now() },
  }));
  const trafficTickRef = useRef(0);
  const [trafficSeries, setTrafficSeries] = useState(() =>
    Array.from({ length: TRAFFIC_TOTAL_POINTS }, (_, index) =>
      computeTrafficPoint(index * 0.82, false, 0, 0)
    )
  );
  const [terminalLines, setTerminalLines] = useState([
    "Initializing secure connection...",
    "Loading threat signatures...",
    "Passive monitoring enabled.",
  ]);

  const liveTrafficPercent = useMemo(() => {
    const latest = trafficSeries[trafficSeries.length - 1] ?? 0;
    return Math.round(latest);
  }, [trafficSeries]);

  const trafficShape = useMemo(() => buildTrafficPaths(trafficSeries), [trafficSeries]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCriticalThreats((prevCritical) => {
        if (isSimulationMode) {
          const next = clamp(
            prevCritical + (Math.random() > 0.72 ? 1 : 0) - (Math.random() > 0.86 ? 1 : 0),
            0,
            8
          );
          setCriticalDelta(next - prevCritical);
          return next;
        }
        const next = clamp(
          prevCritical + (Math.random() > 0.96 ? 1 : 0) - (Math.random() > 0.76 ? 1 : 0),
          0,
          2
        );
        setCriticalDelta(next - prevCritical);
        return next;
      });

      setHighSeverity((prevHigh) => {
        if (isSimulationMode) {
          const next = clamp(
            prevHigh + (Math.random() > 0.55 ? 1 : 0) - (Math.random() > 0.84 ? 1 : 0),
            0,
            14
          );
          setHighDelta(next - prevHigh);
          return next;
        }
        const next = clamp(
          prevHigh + (Math.random() > 0.84 ? 1 : 0) - (Math.random() > 0.68 ? 1 : 0),
          0,
          4
        );
        setHighDelta(next - prevHigh);
        return next;
      });
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isSimulationMode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRuntimeTick((prev) => {
        const nextTick = prev + 1;
        setTerminalLines((prevLines) => {
          const next = [
            ...prevLines,
            `[${new Date().toLocaleTimeString()}] Runtime heartbeat | mode=${isSimulationMode ? "SIM" : "REAL"} tick=${nextTick}`,
          ];
          return next.slice(-9);
        });
        return nextTick;
      });
      setSessionFingerprintHash((prev) => {
        const base = prev.slice(0, 4);
        const suffix = Math.floor(Math.random() * 256)
          .toString(16)
          .toUpperCase()
          .padStart(2, "0");
        return `${base}${suffix}`;
      });
      setSessionIp((prev) =>
        isSimulationMode ? "127.0.0.1 (Simulated)" : prev === "127.0.0.1 (Local)" ? prev : "127.0.0.1 (Local)"
      );
      setDangerReadiness((prev) => ({
        lockdown: clamp(prev.lockdown + (Math.random() - 0.5) * (isSimulationMode ? 6 : 2.5), 82, 100),
        wipe: clamp(prev.wipe + (Math.random() - 0.5) * (isSimulationMode ? 7 : 3), 80, 100),
        rtbf: clamp(prev.rtbf + (Math.random() - 0.5) * (isSimulationMode ? 5 : 2.2), 84, 100),
      }));
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isSimulationMode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setShieldHealth((prev) => {
        if (!settings.financialShield) {
          setShieldRuntimeStatus("OFF");
          return 0;
        }

        const drift = isSimulationMode
          ? (Math.random() - 0.5) * 6
          : (Math.random() - 0.5) * 2.2;
        const next = clamp(prev + drift, 52, 100);
        if (next >= 80) setShieldRuntimeStatus("ACTIVE");
        else if (next >= 65) setShieldRuntimeStatus("STABLE");
        else setShieldRuntimeStatus("DEGRADED");
        return Math.round(next);
      });
    }, 2300);

    return () => window.clearInterval(interval);
  }, [isSimulationMode, settings.financialShield]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setArchitectureRuntime((prev) => {
        const next = { ...prev };
        const modeMultiplier = isSimulationMode ? 0.7 : 0.35;
        (Object.keys(ARCH_STATUS_POOLS)).forEach((key) => {
          if (Math.random() < modeMultiplier) {
            const picked = randomPick(ARCH_STATUS_POOLS[key]);
            next[key] = {
              ...picked,
              lastChecked: Date.now(),
            };
          }
        });
        return next;
      });
    }, 3200);

    return () => window.clearInterval(interval);
  }, [isSimulationMode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setThreatPulseFrame((prev) => (prev + 1) % 100000);
    }, 240);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setThreatPoints((prev) =>
        prev.map((point, index) => {
          const shouldUpdate =
            (isSimulationMode && Math.random() > 0.45) || (!isSimulationMode && Math.random() > 0.75);
          if (!shouldUpdate) return point;

          const nextLastSeen = index === 0 ? "just now" : `${1 + Math.floor(Math.random() * 8)}m ago`;
          const nextRisk =
            isSimulationMode && Math.random() > 0.66
              ? point.risk === "Low"
                ? "Medium"
                : "High"
              : point.risk;

          return {
            ...point,
            lastSeen: nextLastSeen,
            risk: nextRisk,
          };
        })
      );
    }, 3200);

    return () => window.clearInterval(interval);
  }, [isSimulationMode]);

  useEffect(() => {
    if (!isSimulationMode) {
      setSimulatedThreats([]);
      setSelectedThreatId((prev) => (prev.startsWith("sim-") ? THREAT_POINTS[0].id : prev));
      return undefined;
    }

    setSimulatedThreats(Array.from({ length: 4 }, (_, index) => generateSimulatedThreat(Date.now(), index)));
    setTerminalLines((prev) => [
      ...prev.slice(-8),
      `[${new Date().toLocaleTimeString()}] Simulation feed injected: synthetic threat nodes online`,
    ]);

    const interval = window.setInterval(() => {
      setSimulatedThreats((prev) => {
        let next = prev.map((point) => {
          const riskWeight = getRiskWeight(point.risk);
          const driftLat = (Math.random() - 0.5) * (riskWeight >= 3 ? 3.2 : 1.9);
          const driftLng = (Math.random() - 0.5) * (riskWeight >= 3 ? 4.2 : 2.6);

          const riskShiftRoll = Math.random();
          const nextRisk =
            riskShiftRoll > 0.9
              ? "Critical"
              : riskShiftRoll > 0.64
              ? "High"
              : riskShiftRoll > 0.32
              ? "Medium"
              : "Low";

          return {
            ...point,
            position: [
              clamp(point.position[0] + driftLat, -55, 75),
              clamp(point.position[1] + driftLng, -165, 165),
            ],
            risk: nextRisk,
            color: getRiskColor(nextRisk),
            lastSeen: "just now",
          };
        });

        if (Math.random() > 0.58 && next.length < 7) {
          next = [...next, generateSimulatedThreat(Date.now(), next.length)];
        }
        if (Math.random() > 0.78 && next.length > 3) {
          next = next.slice(1);
        }

        return next;
      });
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isSimulationMode]);

  useEffect(() => {
    setTerminalLines((prev) => {
      const next = [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Threat stream updated | mode=${
          isSimulationMode ? "SIM" : "REAL"
        } critical=${criticalThreats} high=${highSeverity}`,
      ];
      return next.slice(-9);
    });
  }, [criticalThreats, highSeverity, isSimulationMode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      trafficTickRef.current += 1;
      setTrafficSeries((prev) => {
        const last = prev[prev.length - 1] ?? 56;
        const tick = trafficTickRef.current;
        const target = computeTrafficPoint(
          tick * 0.86,
          isSimulationMode,
          criticalThreats,
          highSeverity
        );
        let nextPoint = clamp(last * 0.44 + target * 0.56, 20, 94);

        const dropCycle = isSimulationMode ? 8 : 12;
        if (tick % dropCycle === 0) {
          nextPoint = clamp(nextPoint - (isSimulationMode ? 16 : 10), 20, 94);
        }
        return [...prev.slice(1), nextPoint];
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [isSimulationMode, highSeverity, criticalThreats]);

  const toggleRegion = (code) => {
    setGeoSelectedRegions((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const runMalwareScan = () => {
    if (isScanning) return;

    if (!scanAppIntegrity && !scanHostRootkit) {
      setScanStatus("Select at least one scanner module.");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanResults([]);
    setScanStatus("Scanning...");
    setTerminalLines((prev) => [
      ...prev.slice(-8),
      `[${new Date().toLocaleTimeString()}] Malware scanner started...`,
    ]);

    const progressTimer = window.setInterval(() => {
      setScanProgress((prev) => {
        const next = Math.min(prev + 10, 100);
        if (next >= 100) {
          window.clearInterval(progressTimer);
          const results = [];
          if (scanAppIntegrity) {
            results.push("✓ [Host] Kernel integrity verified.");
          }
          if (scanHostRootkit) {
            results.push("✓ [Host] No rootkits detected in /usr/bin/.");
            results.push("✓ [Host] Firewall active (UFW). Ports 80, 443 allowed.");
          }
          results.push("✓ [Storage] LocalStorage analysis complete. No threats found.");

          setScanResults(results);
          setScanStatus("Scan Complete.");
          setIsScanning(false);
          setTerminalLines((prevLines) => [
            ...prevLines.slice(-8),
            `[${new Date().toLocaleTimeString()}] Scan complete: clean`,
          ]);
        }
        return next;
      });
    }, 180);
  };

  useEffect(() => {
    if (!scanAutoEnabled) return undefined;
    const timer = window.setInterval(() => {
      runMalwareScan();
    }, 25000);
    return () => window.clearInterval(timer);
  }, [scanAutoEnabled, scanAppIntegrity, scanHostRootkit, isScanning]);

  const handleReverifySession = () => {
    setIsReverifying(true);
    setSessionVerified(false);
    setTerminalLines((prev) => [
      ...prev.slice(-8),
      `[${new Date().toLocaleTimeString()}] Session fingerprint re-verification started...`,
    ]);

    window.setTimeout(() => {
      setIsReverifying(false);
      setSessionVerified(true);
      setTerminalLines((prev) => [
        ...prev.slice(-8),
        `[${new Date().toLocaleTimeString()}] Session fingerprint verified.`,
      ]);
    }, 1200);
  };

  const mapThreatPoints = useMemo(
    () => (isSimulationMode ? [...threatPoints, ...simulatedThreats] : threatPoints),
    [isSimulationMode, threatPoints, simulatedThreats]
  );

  useEffect(() => {
    if (!mapThreatPoints.length) return;
    if (!mapThreatPoints.some((point) => point.id === selectedThreatId)) {
      setSelectedThreatId(mapThreatPoints[0].id);
    }
  }, [mapThreatPoints, selectedThreatId]);

  const selectedThreat = useMemo(
    () => mapThreatPoints.find((point) => point.id === selectedThreatId) ?? mapThreatPoints[0],
    [selectedThreatId, mapThreatPoints]
  );

  const architectureRows = useMemo(
    () => [
      ...ARCHITECTURE_ITEMS.map((item) => ({
        ...item,
        status: architectureRuntime[item.id]?.status ?? item.status,
        tone: architectureRuntime[item.id]?.tone ?? item.tone,
      })),
      {
        id: "lockdown",
        label: t("secCyber.emergencyLockdown"),
        status: settings.panicMode ? t("secCyber.engaged") : t("secCyber.ready"),
        tone: settings.panicMode ? "red" : "amber",
        description: t("secCyber.emergencyLockdownDesc"),
      },
    ],
    [settings.panicMode, architectureRuntime, t]
  );

  return (
    <section
      className={`security-cyber-root space-y-4 rounded-2xl border p-4 ${
        lightMode
          ? "security-light border-slate-200 bg-gradient-to-b from-slate-50 to-white"
          : "border-[#273b60] bg-[#0a1424]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-white">{t("secCyber.securityCenter")}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t("secCyber.simulation")} {isSimulationMode ? t("secCyber.on") : t("secCyber.off")}
          </span>
          <button
            type="button"
            onClick={() => setIsSimulationMode((v) => !v)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              isSimulationMode
                ? "border border-emerald-500 bg-emerald-900/50 text-emerald-300"
                : "border border-slate-600 bg-slate-800 text-slate-300"
            }`}
          >
            {t("secCyber.toggle")}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-rose-600/45 bg-gradient-to-br from-rose-950/30 via-[#131e32] to-[#131e32] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-300">
            {t("secCyber.criticalThreats")}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-4xl font-bold italic text-slate-50">{criticalThreats}</p>
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                criticalDelta > 0
                  ? "bg-rose-900/70 text-rose-300 border border-rose-700"
                  : criticalDelta < 0
                  ? "bg-emerald-900/70 text-emerald-300 border border-emerald-700"
                  : "bg-slate-700/70 text-slate-300 border border-slate-600"
              }`}
            >
              {criticalDelta > 0 ? `+${criticalDelta}` : `${criticalDelta}`}
            </span>
          </div>
          <div className="mt-3 h-1 rounded bg-slate-800">
            <div
              className="h-1 rounded bg-rose-500"
              style={{ width: `${Math.min(100, criticalThreats * 16)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-amber-600/45 bg-gradient-to-br from-amber-950/25 via-[#131e32] to-[#131e32] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-300">
            {t("secCyber.highSeverity")}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-4xl font-bold italic text-slate-50">{highSeverity}</p>
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                highDelta > 0
                  ? "bg-amber-900/70 text-amber-300 border border-amber-700"
                  : highDelta < 0
                  ? "bg-emerald-900/70 text-emerald-300 border border-emerald-700"
                  : "bg-slate-700/70 text-slate-300 border border-slate-600"
              }`}
            >
              {highDelta > 0 ? `+${highDelta}` : `${highDelta}`}
            </span>
          </div>
          <div className="mt-3 h-1 rounded bg-slate-800">
            <div
              className="h-1 rounded bg-amber-500"
              style={{ width: `${Math.min(100, highSeverity * 8)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/45 bg-gradient-to-br from-blue-950/30 via-[#131e32] to-[#131e32] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-300">
            {t("secCyber.liveTraffic")}
          </p>
          <div className="h-16 w-full rounded bg-blue-950/35 p-0.5">
            <svg viewBox="0 0 300 56" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="trafficFillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
                <filter id="trafficGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path d={trafficShape.areaPath} fill="url(#trafficFillGradient)" />
              <path
                d={trafficShape.linePath}
                fill="none"
                stroke="#1d4ed8"
                strokeOpacity="0.85"
                strokeWidth="4.8"
                filter="url(#trafficGlow)"
              />
              <path d={trafficShape.linePath} fill="none" stroke="#60a5fa" strokeWidth="2.4" />
              <circle cx={trafficShape.lastX} cy={trafficShape.lastY} r="2.8" fill="#93c5fd" />
              <circle cx={trafficShape.lastX} cy={trafficShape.lastY} r="5.3" fill="#60a5fa" opacity="0.25" />
            </svg>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            {liveTrafficPercent}% load - {isSimulationMode ? t("secCyber.simulationFeed") : t("secCyber.realtimeBaseline")}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-600/45 bg-gradient-to-br from-emerald-950/30 via-[#102437] to-[#102437] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
            {t("secCyber.financialShield")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            <p className={`text-4xl font-bold text-slate-50 ${settings.financialShield ? "" : "opacity-70"}`}>
              {shieldRuntimeStatus}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t("secCyber.vault")} {settings.financialShield ? t("secCyber.locked") : t("secCyber.open")} - {t("secCyber.health")} {shieldHealth}%
          </p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[240px_minmax(0,1fr)_910px]">
        <div className="space-y-3">
          <DarkCard title={t("secCyber.systemArchitecture")} icon={Shield} lightMode={lightMode}>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {architectureRows.map((item) => (
                <div key={item.id} className="group">
                  <div className="flex items-center justify-between rounded border border-[#243654] bg-slate-800/55 px-2.5 py-1.5 text-xs">
                    <span className="text-slate-200">{archLabels[item.id]?.label ?? item.label}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${getArchitectureBadgeClass(
                        item.tone
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-1 hidden rounded border border-[#2d3f5f] bg-[#0d182a] p-2 text-[11px] leading-relaxed text-slate-300 group-hover:block">
                    {archLabels[item.id]?.desc ?? item.description}
                  </div>
                </div>
              ))}
            </div>
          </DarkCard>

          <DarkCard title={t("secCyber.sessionFingerprint")} icon={Lock} lightMode={lightMode}>
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                {t("secCyber.sessionFingerprintDesc")}
              </p>

              <div className="rounded border border-[#2b3c59] bg-[#132036] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{t("secCyber.browser")}</p>
                <p className="font-mono text-slate-100">Chrome 146.0.0.0 (Windows x64)</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-[#2b3c59] bg-[#132036] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{t("secCyber.engine")}</p>
                  <p className="font-mono text-slate-100">Chrome 146.0.0</p>
                </div>
                <div className="rounded border border-[#2b3c59] bg-[#132036] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{t("secCyber.platform")}</p>
                  <p className="font-mono text-slate-100">Windows x64</p>
                </div>
              </div>

              <div className="rounded border border-[#2b3c59] bg-[#132036] px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{t("secCyber.fingerprintHash")}</p>
                <p className="font-mono text-slate-100">{sessionFingerprintHash}</p>
              </div>

              <div className="flex items-center justify-between rounded border border-[#2b3c59] bg-[#132036] px-3 py-2">
                <div>
                  <p className="text-slate-400">{t("secCyber.status")}</p>
                  <p className={`font-semibold ${sessionVerified ? "text-emerald-300" : "text-amber-300"}`}>
                    {sessionVerified ? t("secCyber.verified") : t("secCyber.revalidating")}
                  </p>
                  <p className="font-mono text-slate-300">{t("secCyber.ipLabel")} {sessionIp}</p>
                  <p className="text-[10px] text-slate-500">{t("secCyber.realtimeSync")} {runtimeTick * 5}s</p>
                </div>
                <button
                  type="button"
                  onClick={handleReverifySession}
                  disabled={isReverifying}
                  className="rounded border border-violet-700 bg-violet-900/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-violet-200 hover:bg-violet-800/70 disabled:opacity-60"
                >
                  {isReverifying ? t("secCyber.checking") : t("secCyber.reVerify")}
                </button>
              </div>
            </div>
          </DarkCard>
        </div>

        <DarkCard title={t("secCyber.liveTerminal")} icon={Activity} lightMode={lightMode}>
          <div className="mb-2 flex items-center justify-between rounded-t border border-[#2a3a56] bg-[#1a2a44] px-2 py-1">
            <span className="font-mono text-[10px] text-slate-300">/var/log/security/live_threats.log</span>
            <span className="text-[10px] text-emerald-300">
              {isSimulationMode ? "LIVE-SIM" : "LIVE-REAL"}
            </span>
          </div>
          <div className="h-60 overflow-y-auto rounded border border-[#2a3a56] bg-[#020812] p-3 font-mono text-xs text-emerald-300">
            {terminalLines.map((line, idx) => (
              <p key={`${line}-${idx}`} className="mb-1">
                {line}
              </p>
            ))}
          </div>
        </DarkCard>

        <DarkCard title={t("secCyber.threatMap")} icon={Globe} lightMode={lightMode}>
          <div className="relative h-72 overflow-hidden rounded border border-[#2a3a56] bg-[#0b1526] md:h-80">
            <MapContainer
              center={[22, 15]}
              zoom={2}
              minZoom={1}
              maxZoom={6}
              zoomSnap={0.1}
              zoomControl
              dragging
              scrollWheelZoom
              doubleClickZoom
              boxZoom
              keyboard
              touchZoom
              maxBounds={WORLD_BOUNDS}
              maxBoundsViscosity={0.35}
              attributionControl={false}
              worldCopyJump
              style={{ height: "100%", width: "100%", background: "#0b1526" }}
            >
              <MapAutoFit />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />
              {mapThreatPoints.map((point, index) => {
                const isSelected = selectedThreatId === point.id;
                const riskWeight = getRiskWeight(point.risk);
                const speed = 0.6 + riskWeight * 0.48;
                const pulse = (Math.sin(threatPulseFrame * speed + index * 0.95) + 1) / 2;
                const pulseSecondary =
                  (Math.sin(threatPulseFrame * speed * 0.72 + index * 0.75 + 1.8) + 1) / 2;

                const coreRadius = 4.6 + riskWeight * 0.95 + pulse * (isSelected ? 1.4 : 1.1);
                const ringOneRadius = coreRadius + 2.5 + pulse * 3.6;
                const ringTwoRadius = ringOneRadius + 1.8 + pulseSecondary * 3.8;
                const coreOpacity = clamp(0.44 + pulse * (0.34 + riskWeight * 0.08), 0.35, 0.96);

                return (
                  <CircleMarker
                    key={`${point.id}-ring-2`}
                    center={point.position}
                    radius={ringTwoRadius}
                    pathOptions={{
                      color: point.color,
                      fillOpacity: 0,
                      opacity: 0.08 + pulseSecondary * (0.18 + riskWeight * 0.04),
                      weight: 1.2,
                    }}
                  >
                    <CircleMarker
                      key={`${point.id}-ring-1`}
                      center={point.position}
                      radius={ringOneRadius}
                      pathOptions={{
                        color: point.color,
                        fillOpacity: 0,
                        opacity: 0.16 + pulse * (0.28 + riskWeight * 0.06),
                        weight: 1.8,
                      }}
                    >
                      <CircleMarker
                        key={point.id}
                        center={point.position}
                        radius={coreRadius}
                        pathOptions={{
                          color: point.color,
                          fillColor: point.color,
                          fillOpacity: coreOpacity,
                          opacity: isSelected ? 0.98 : 0.86,
                          weight: isSelected ? 2.8 : 2.2,
                        }}
                        eventHandlers={{
                          click: () => setSelectedThreatId(point.id),
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                          <div className="text-xs font-medium">
                            {point.label} - {point.risk} Risk {point.simulated ? "(SIM)" : ""}
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    </CircleMarker>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(71,110,164,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(71,110,164,0.16) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="pointer-events-none absolute inset-y-0 left-[-22%] w-1/3 -skew-x-12 bg-gradient-to-r from-cyan-400/0 via-cyan-300/20 to-cyan-400/0 animate-pulse" />

            <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-slate-900/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-slate-300">
              {t("secCyber.globalHeatmap")}
            </div>
            <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-slate-400">
              {t("secCyber.updatedNowNodes")} {mapThreatPoints.length}
            </div>

            <div className="absolute right-2 top-2 space-y-1 text-right">
              <div className="rounded border border-slate-600 bg-slate-900/85 px-2 py-1 text-[10px] text-slate-300">
                {t("secCyber.dragMap")}
              </div>
              <div className="rounded border border-slate-700 bg-slate-900/85 px-2 py-1 text-[10px] text-slate-300">
                {isSimulationMode
                  ? `${t("secCyber.simulationNodes")} ${simulatedThreats.length}`
                  : `${t("secCyber.simulationNodes")} 0`}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 rounded border border-[#2a3a56] bg-[#0d182b] p-3 text-xs md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">{t("secCyber.selectedThreat")}</p>
              <p className="font-semibold text-slate-100">{selectedThreat.label}</p>
              <p className="text-slate-300">
                {selectedThreat.city}, {selectedThreat.country}
              </p>
              <p className="text-slate-400">{t("secCyber.lastSeen")} {selectedThreat.lastSeen}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">{t("secCyber.geoCoordinates")}</p>
              <p className="font-mono text-slate-200">
                {t("secCyber.lat")} {selectedThreat.position[0].toFixed(4)}
              </p>
              <p className="font-mono text-slate-200">
                {t("secCyber.lng")} {selectedThreat.position[1].toFixed(4)}
              </p>
              <p className="text-slate-300">{t("secCyber.risk")} {selectedThreat.risk}</p>
            </div>
            <p className="md:col-span-2 text-slate-300">{selectedThreat.details}</p>
          </div>
        </DarkCard>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">
          {t("secCyber.operations")}
        </p>
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-400">
          {t("secCyber.dangerZone")}
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <DarkCard title={t("secCyber.activeDefense")} icon={Shield} lightMode={lightMode}>
          <div className="space-y-3">
            <div className="rounded bg-slate-800/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-100">{t("secCyber.geoFencing")}</p>
                  <p className="text-xs text-slate-400">
                    {t("secCyber.geoFencingDesc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGeoFencingEnabled((v) => !v)}
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    isGeoFencingEnabled
                      ? "bg-emerald-900/70 text-emerald-300 border border-emerald-700"
                      : "bg-slate-700 text-slate-300 border border-slate-600"
                  }`}
                >
                  {isGeoFencingEnabled ? "On" : "Off"}
                </button>
              </div>
              <p className="mb-2 text-[11px] text-emerald-300">
                {t("secCyber.realtimePolicySync")} {runtimeTick * 5}s - {t("secCyber.selectedRegions")} {geoSelectedRegions.length}
              </p>

              <div className="mb-2 flex items-center justify-between border-b border-[#2a3a56] pb-2">
                <span className="text-slate-300">{t("secCyber.whitelistMode")}</span>
                <button
                  type="button"
                  onClick={() => setGeoWhitelistMode((prev) => !prev)}
                  className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                    geoWhitelistMode
                      ? "bg-emerald-900/70 text-emerald-300 border border-emerald-700"
                      : "bg-slate-700 text-slate-300 border border-slate-600"
                  }`}
                >
                  {geoWhitelistMode ? "ON" : "OFF"}
                </button>
              </div>

              <div className="max-h-24 space-y-1 overflow-y-auto pr-1 text-xs">
                {GEO_REGION_OPTIONS.map((code) => (
                  <label key={code} className="flex items-center justify-between rounded px-1 py-0.5">
                    <span className="text-slate-300">{code}</span>
                    <input
                      type="checkbox"
                      checked={geoSelectedRegions.includes(code)}
                      onChange={() => toggleRegion(code)}
                      className="h-3.5 w-3.5 accent-teal-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded bg-slate-800/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-100">{t("secCyber.malwareScanner")}</p>
                  <p className="text-xs text-slate-400">
                    {t("secCyber.malwareScannerDesc")}
                  </p>
                </div>
                <Bug className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mb-2 space-y-1.5 text-xs text-slate-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scanAppIntegrity}
                    onChange={(event) => setScanAppIntegrity(event.target.checked)}
                    className="h-3.5 w-3.5 accent-emerald-500"
                  />
                  <span>{t("secCyber.appIntegrity")}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scanHostRootkit}
                    onChange={(event) => setScanHostRootkit(event.target.checked)}
                    className="h-3.5 w-3.5 accent-emerald-500"
                  />
                  <span>{t("secCyber.hostRootkit")}</span>
                </label>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={runMalwareScan}
                  disabled={isScanning}
                  className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {isScanning ? t("secCyber.scanning") : t("secCyber.scanNow")}
                </button>
                <label className="flex items-center gap-1.5 text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={scanAutoEnabled}
                    onChange={(event) => setScanAutoEnabled(event.target.checked)}
                    className="h-3.5 w-3.5 accent-teal-500"
                  />
                  {t("secCyber.autoScan")}
                </label>
              </div>

              <div className="mb-2 h-1.5 rounded bg-slate-900/70">
                <div
                  className="h-1.5 rounded bg-blue-500 transition-all"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <p className="mb-1 text-[11px] text-slate-300">
                {scanStatus} - {t("secCyber.realtimeMonitor")} {scanAutoEnabled || isScanning ? "active" : "idle"}
              </p>

              <div className="max-h-24 space-y-1 overflow-y-auto rounded border border-[#2a3a56] bg-[#0a1424] p-2 font-mono text-[12px] text-emerald-300">
                {scanResults.length === 0 ? (
                  <p className="text-slate-500">{t("secCyber.awaitingScan")}</p>
                ) : (
                  scanResults.map((row, index) => (
                    <p key={`${row}-${index}`} className="border-b border-slate-800 pb-1 last:border-b-0">
                      {row}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </DarkCard>

        <DarkCard
          title={t("secCyber.dangerZone")}
          icon={AlertTriangle}
          right={<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-300">{t("secCyber.restrictedOps")}</span>}
          lightMode={lightMode}
        >
          <div className="space-y-3">
            <DangerAction
              title={t("secCyber.lockdown")}
              description={`${t("secCyber.lockdownDesc")} ${Math.round(
                dangerReadiness.lockdown
              )}%.`}
              buttonText={settings.panicMode ? t("secCyber.verifyDeactivateLockdown") : t("secCyber.verifyActivateLockdown")}
              buttonClass={
                settings.panicMode
                  ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                  : "bg-rose-900/60 text-rose-300 border border-rose-700"
              }
              onClick={() => onRequestProtectedAction?.("lockdown")}
              icon={Lock}
              lightMode={lightMode}
            />

            <DangerAction
              title={t("secCyber.dataWipe")}
              description={`${t("secCyber.dataWipeDesc")} ${Math.round(
                dangerReadiness.wipe
              )}%.`}
              buttonText={t("secCyber.verifyDataWipe")}
              buttonClass="bg-rose-900/60 text-rose-300 border border-rose-700 hover:bg-rose-800/70"
              onClick={() => onRequestProtectedAction?.("nuclear_wipe")}
              icon={Trash2}
              lightMode={lightMode}
            />

            <DangerAction
              title={t("secCyber.rightToBeForgotten")}
              description={`${t("secCyber.rightToBeForgottenDesc")} ${Math.round(
                dangerReadiness.rtbf
              )}%.`}
              buttonText={t("secCyber.verifyProcessDeletion")}
              buttonClass="bg-amber-900/60 text-amber-300 border border-amber-700 hover:bg-amber-800/70"
              onClick={() => onRequestProtectedAction?.("right_to_be_forgotten")}
              icon={UserX}
              lightMode={lightMode}
            />
          </div>
        </DarkCard>
      </div>
    </section>
  );
}
