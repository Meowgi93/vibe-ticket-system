import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── Attack Type Badge Colors ─────────────────────────────────────────────────
const ATTACK_COLORS = {
  FAILED_LOGIN:     { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  BOT_HONEYPOT:     { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  SQL_INJECTION:    { bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/30" },
  XSS_ATTEMPT:      { bg: "bg-rose-500/20",   text: "text-rose-400",   border: "border-rose-500/30" },
  SUSPICIOUS_UA:    { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  PATH_SCAN:        { bg: "bg-blue-500/20",   text: "text-blue-400",   border: "border-blue-500/30" },
  RAPID_REQUESTS:   { bg: "bg-pink-500/20",   text: "text-pink-400",   border: "border-pink-500/30" },
  BOT_TYPING:       { bg: "bg-cyan-500/20",   text: "text-cyan-400",   border: "border-cyan-500/30" },
  NO_MOUSE:         { bg: "bg-teal-500/20",   text: "text-teal-400",   border: "border-teal-500/30" },
  ROBOTIC_MOUSE:    { bg: "bg-sky-500/20",    text: "text-sky-400",    border: "border-sky-500/30" },
  SUPERHUMAN_SPEED: { bg: "bg-amber-500/20",  text: "text-amber-400",  border: "border-amber-500/30" },
  HEADLESS_BROWSER: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30" },
};

function RiskBar({ score }) {
  const color = score >= 70 ? "bg-red-500" : score >= 40 ? "bg-orange-400" : "bg-lime-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${score >= 70 ? "text-red-400" : score >= 40 ? "text-orange-400" : "text-lime-400"}`}>
        {score}
      </span>
    </div>
  );
}

function AttackBadge({ type }) {
  const c = ATTACK_COLORS[type] || { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" };
  const labels = {
    FAILED_LOGIN: "Login ผิด",
    BOT_HONEYPOT: "Bot Honeypot",
    SQL_INJECTION: "SQL Injection",
    XSS_ATTEMPT: "XSS Attack",
    SUSPICIOUS_UA: "Suspicious Tool",
    PATH_SCAN: "Path Scan",
    RAPID_REQUESTS: "Rapid Requests",
    BOT_TYPING: "Bot Typing",
    NO_MOUSE: "No Mouse",
    ROBOTIC_MOUSE: "Robotic Mouse",
    SUPERHUMAN_SPEED: "Superhuman Speed",
    HEADLESS_BROWSER: "Headless Browser",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${c.bg} ${c.text} ${c.border}`}>
      {labels[type] || type}
    </span>
  );
}

export default function AdminSecurity() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [ipRisks, setIpRisks] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [detectionRate, setDetectionRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes, ipRes, timeRes, distRes, detRes] = await Promise.all([
        authFetch("/api/security/stats"),
        authFetch("/api/security/logs?limit=100"),
        authFetch("/api/security/ip-risks"),
        authFetch("/api/security/timeline"),
        authFetch("/api/security/distribution"),
        authFetch("/api/security/detection-rate"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (ipRes.ok) setIpRisks(await ipRes.json());
      if (timeRes.ok) setTimeline(await timeRes.json());
      if (distRes.ok) setDistribution(await distRes.json());
      if (detRes.ok) setDetectionRate(await detRes.json());
    } catch (err) {
      console.error("Failed to load security data:", err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // refresh ทุก 15 วิ
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "charts", label: "Analytics" },
    { id: "logs", label: `Attack Logs (${logs.length})` },
    { id: "ips", label: `IP Risks (${ipRisks.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            🛡️ Security Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">ระบบตรวจจับและตอบสนองภัยคุกคาม (Adaptive Deception)</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/security/export"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-4 py-2 text-xs font-semibold text-lime-400 transition hover:bg-lime-500/20 active:scale-95"
          >
            📥 Export CSV
          </a>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-surface-700 active:scale-95"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Attacks", value: stats.totalAttacks, icon: "💥", color: "text-red-400" },
            { label: "IPs Decoyed", value: stats.decoyed, icon: "🍯", color: "text-yellow-400" },
            { label: "Risky IPs", value: stats.risky, icon: "⚠️", color: "text-orange-400" },
            { label: "Detection Rate", value: `${detectionRate?.detectionRate || 0}%`, icon: "🎯", color: "text-lime-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/5 bg-surface-900 p-5">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attack Type Breakdown */}
      {stats?.attackTypes?.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-surface-900 p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Attack Type Breakdown</h2>
          <div className="flex flex-wrap gap-3">
            {stats.attackTypes.map((a) => (
              <div key={a.attackType} className="flex items-center gap-2 rounded-xl border border-white/5 bg-surface-800 px-4 py-2">
                <AttackBadge type={a.attackType} />
                <span className="text-sm font-bold text-white">{a.count} ครั้ง</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-800 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              activeTab === t.id
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Attack Logs Table */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">เวลา</th>
                  <th className="text-left px-4 py-3">IP Address</th>
                  <th className="text-left px-4 py-3">ประเภทการโจมตี</th>
                  <th className="text-left px-4 py-3">Method / Path</th>
                  <th className="text-left px-4 py-3">Payload</th>
                  <th className="text-center px-4 py-3">Risk</th>
                  <th className="text-center px-4 py-3">Decoyed</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-600">ยังไม่มีการโจมตีที่บันทึกไว้</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white">{log.ip}</td>
                      <td className="px-4 py-3"><AttackBadge type={log.attackType} /></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        <span className="text-brand-400">{log.method}</span> {log.path}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={log.payload}>
                        {log.payload || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${log.riskScore >= 70 ? "text-red-400" : log.riskScore >= 40 ? "text-orange-400" : "text-lime-400"}`}>
                          {log.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {log.isDecoyed ? (
                          <span className="text-sm">🍯</span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IP Risk Table */}
      {activeTab === "ips" && (
        <div className="rounded-2xl border border-white/5 bg-surface-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">IP Address</th>
                  <th className="text-left px-4 py-3 w-48">Risk Score</th>
                  <th className="text-center px-4 py-3">Login ผิด</th>
                  <th className="text-center px-4 py-3">Bot</th>
                  <th className="text-center px-4 py-3">Path Scan</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {ipRisks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-600">ยังไม่มี IP น่าสงสัยที่บันทึกไว้</td>
                  </tr>
                ) : (
                  ipRisks.map((ip) => (
                    <tr key={ip.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-white">{ip.ip}</td>
                      <td className="px-4 py-3 w-48"><RiskBar score={ip.riskScore} /></td>
                      <td className="px-4 py-3 text-center text-orange-400 font-bold">{ip.failedLogins}</td>
                      <td className="px-4 py-3 text-center text-yellow-400 font-bold">{ip.botAttempts}</td>
                      <td className="px-4 py-3 text-center text-blue-400 font-bold">{ip.scanAttempts}</td>
                      <td className="px-4 py-3 text-center">
                        {ip.isDecoyed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                            🍯 Decoyed
                          </span>
                        ) : ip.riskScore >= 40 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                            ⚠️ Monitoring
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lime-500/20 border border-lime-500/30 px-2 py-0.5 text-[10px] font-bold text-lime-400">
                            ✓ Normal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(ip.lastSeen).toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab (Charts) */}
      {activeTab === "charts" && (
        <div className="space-y-6">
          {/* Detection Stats */}
          {detectionRate && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-surface-900 p-5">
                <p className="text-sm font-bold text-gray-400">Detection Rate</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black text-brand-400">{detectionRate.detectionRate}%</span>
                  <span className="text-sm text-gray-500 mb-1">of risky IPs blocked</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-surface-900 p-5">
                <p className="text-sm font-bold text-gray-400">Decoy Success Rate</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black text-yellow-400">{detectionRate.decoyRate}%</span>
                  <span className="text-sm text-gray-500 mb-1">successfully routed to Honeypot</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-surface-900 p-5">
                <p className="text-sm font-bold text-gray-400">Total Unique Threat IPs</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black text-purple-400">{detectionRate.totalIPs}</span>
                  <span className="text-sm text-gray-500 mb-1">tracked</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Timeline Chart */}
            <div className="rounded-2xl border border-white/5 bg-surface-900 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Attack Timeline (24h)</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="attacks" name="Total Attacks" stroke="#f87171" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="bruteForce" name="Brute Force" stroke="#fb923c" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sqlInjection" name="SQL Injection" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Chart */}
            <div className="rounded-2xl border border-white/5 bg-surface-900 p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">IP Risk Score Distribution</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '8px' }}
                      cursor={{ fill: '#ffffff05' }}
                    />
                    <Bar dataKey="count" name="Number of IPs" radius={[4, 4, 0, 0]}>
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index >= 3 ? '#ef4444' : index === 2 ? '#fb923c' : '#a3e635'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="rounded-2xl border border-white/5 bg-surface-900 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">ระบบ Adaptive Deception ทำงานอย่างไร</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", icon: "🔍", title: "ตรวจจับ (Detect)", desc: "ระบบตรวจสอบทุก Request หา SQL Injection, เครื่องมือ Hacking, Login ผิดซ้ำ และ Bot ที่เข้ามา" },
              { step: "2", icon: "📊", title: "ประเมิน (Assess)", desc: "คำนวณ Risk Score สะสมต่อ IP ถ้าเกิน 70 คะแนน ถือว่าเป็นภัยคุกคาม" },
              { step: "3", icon: "🍯", title: "เบี่ยงเบน (Deceive)", desc: "เปลี่ยนเส้นทางแฮกเกอร์ไปยังฐานข้อมูลปลอมแบบ Seamless โดยที่เขาไม่รู้ตัว" },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-white/5 bg-surface-800 p-4">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-sm font-bold text-white mb-1">Step {s.step}: {s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
