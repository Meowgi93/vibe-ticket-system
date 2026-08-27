// honeypot.js - ระบบ Honeypot & Adaptive Deception Engine
// Phase 3 of Security Implementation

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'prisma', 'honeypot.db');

// ─── เริ่มต้นฐานข้อมูล Honeypot ──────────────────────────────────────────────
let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  initHoneypotDB();
  seedFakeData();
  console.log('🍯 [Honeypot] Database initialized at', DB_PATH);
} catch (err) {
  console.error('❌ [Honeypot] Failed to initialize:', err.message);
}

// ─── สร้างตารางฐานข้อมูล Honeypot ───────────────────────────────────────────
function initHoneypotDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS AttackLog (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ip          TEXT NOT NULL,
      method      TEXT NOT NULL,
      path        TEXT NOT NULL,
      payload     TEXT,
      attackType  TEXT NOT NULL,
      riskScore   INTEGER DEFAULT 0,
      userAgent   TEXT,
      isDecoyed   INTEGER DEFAULT 0,
      createdAt   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS IpRisk (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ip            TEXT UNIQUE NOT NULL,
      riskScore     INTEGER DEFAULT 0,
      failedLogins  INTEGER DEFAULT 0,
      scanAttempts  INTEGER DEFAULT 0,
      botAttempts   INTEGER DEFAULT 0,
      isDecoyed     INTEGER DEFAULT 0,
      firstSeen     TEXT DEFAULT (datetime('now')),
      lastSeen      TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS FakeUser (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT UNIQUE,
      fullName  TEXT,
      email     TEXT UNIQUE,
      phone     TEXT,
      password  TEXT,
      role      TEXT DEFAULT 'user',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS FakeConcert (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT,
      artist     TEXT,
      date       TEXT,
      venue      TEXT,
      priceRange TEXT
    );

    CREATE TABLE IF NOT EXISTS FakeTicket (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      userId    INTEGER,
      concertId INTEGER,
      totalPaid INTEGER,
      status    TEXT DEFAULT 'confirmed',
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ─── ใส่ข้อมูลสมมติ (เพื่อหลอกแฮกเกอร์ว่านี่คือข้อมูลจริง) ─────────────────
function seedFakeData() {
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM FakeUser').get();
  if (userCount.cnt > 0) return; // ถ้ามีข้อมูลแล้วไม่ต้อง seed ซ้ำ

  db.exec(`
    INSERT INTO FakeUser (username, fullName, email, phone, password, role) VALUES
    ('john_doe', 'John Doe', 'john@vibe-tickets.com', '0812345678', '$2a$10$fakehashedpassword1', 'user'),
    ('jane_smith', 'Jane Smith', 'jane@vibe-tickets.com', '0823456789', '$2a$10$fakehashedpassword2', 'user'),
    ('admin_vibe', 'VIBE Administrator', 'admin@vibe-tickets.com', '0800000001', '$2a$10$fakehashedpassword3', 'admin'),
    ('vip_customer', 'VIP Customer', 'vip@vibe-tickets.com', '0834567890', '$2a$10$fakehashedpassword4', 'user'),
    ('superuser', 'Super User', 'super@vibe-tickets.com', '0845678901', '$2a$10$fakehashedpassword5', 'admin');

    INSERT INTO FakeConcert (title, artist, date, venue, priceRange) VALUES
    ('BTS WORLD TOUR FAKE', 'BTS', '01/01/2027', 'IMPACT Arena', '1500-15000'),
    ('BLACKPINK WORLD TOUR FAKE', 'BLACKPINK', '15/02/2027', 'IMPACT Arena', '2000-20000');

    INSERT INTO FakeTicket (userId, concertId, totalPaid, status) VALUES
    (1, 1, 5000, 'confirmed'),
    (2, 1, 3500, 'confirmed'),
    (3, 2, 15000, 'confirmed');
  `);
  console.log('🍯 [Honeypot] Fake data seeded successfully');
}

// ─── Risk Assessment Engine (OWASP Risk Rating Methodology) ────────────────────
// คำนวณความเสี่ยงตามมาตรฐานสากล: Risk Score = (Likelihood × Impact) × 4
// 스เกล Likelihood (โอกาสเป็นภัยคุกคาม) = 1-5, Impact (ผลกระทบต่อระบบ) = 1-5

const OWASP_MATRIX = {
  // ภัยคุกคามระดับ Critical & High (ผลักเข้า Honeypot)
  XSS_ATTEMPT:      { likelihood: 5, impact: 5 }, // Score: (5*5)*4 = 100
  SQL_INJECTION:    { likelihood: 5, impact: 5 }, // Score: 100
  HEADLESS_BROWSER: { likelihood: 5, impact: 4 }, // Score: 80
  BOT_HONEYPOT:     { likelihood: 5, impact: 4 }, // Score: 80
  MALICIOUS_HEADER: { likelihood: 5, impact: 4 }, // Score: 80 (เช่น sqlmap, nmap)
  IMPOSSIBLE_TRAVEL:{ likelihood: 4, impact: 4 }, // Score: 64 (สลับ IP ข้ามทวีป)

  // ภัยคุกคามระดับ Medium-High (บีบให้ทำ Step-up Auth OTP)
  SUPERHUMAN_SPEED: { likelihood: 4, impact: 4 }, // Score: 64
  MOBILE_BOT:       { likelihood: 5, impact: 4 }, // Score: 80
  BOT_TYPING:       { likelihood: 4, impact: 3 }, // Score: 48
  ROBOTIC_MOUSE:    { likelihood: 4, impact: 3 }, // Score: 48
  SUSPICIOUS_UA:    { likelihood: 4, impact: 3 }, // Score: 48
  NO_MOUSE:         { likelihood: 3, impact: 3 }, // Score: 36
  NO_SCROLL:        { likelihood: 4, impact: 3 }, // Score: 48
  PATH_SCAN:        { likelihood: 4, impact: 2 }, // Score: 32
  RAPID_REQUESTS:   { likelihood: 4, impact: 3 }, // Score: 48 (> 10 req/s)

  // ภัยคุกคามระดับ Low (ปล่อยผ่าน สะสมคะแนน)
  FAILED_LOGIN:     { likelihood: 2, impact: 2 }, // Score: 16
};

const RISK_THRESHOLD = 70; // เกิน 70 คะแนน = เบี่ยงเบนไป Honeypot

export function getRiskScore(ip) {
  if (!db) return 0;
  const row = db.prepare('SELECT riskScore FROM IpRisk WHERE ip = ?').get(ip);
  return row ? row.riskScore : 0;
}

export function isDecoyed(ip) {
  if (!db) return false;
  const row = db.prepare('SELECT isDecoyed FROM IpRisk WHERE ip = ?').get(ip);
  return row ? row.isDecoyed === 1 : false;
}

export function addRiskScore(ip, eventType, extraData = {}) {
  if (!db) return 0;
  
  // คำนวณ Risk Score ด้วย OWASP Methodology
  const riskFactors = OWASP_MATRIX[eventType] || { likelihood: 1, impact: 1 };
  const points = (riskFactors.likelihood * riskFactors.impact) * 4;
  
  const now = new Date().toISOString();

  // Upsert IpRisk
  const existing = db.prepare('SELECT * FROM IpRisk WHERE ip = ?').get(ip);
  if (!existing) {
    db.prepare(`
      INSERT INTO IpRisk (ip, riskScore, lastSeen) VALUES (?, ?, ?)
    `).run(ip, Math.min(points, 100), now);
  } else {
    const newScore = Math.min(existing.riskScore + points, 100);
    const shouldDecoy = newScore >= RISK_THRESHOLD;

    db.prepare(`
      UPDATE IpRisk SET 
        riskScore = ?,
        isDecoyed = ?,
        lastSeen = ?,
        failedLogins = failedLogins + ?,
        botAttempts = botAttempts + ?,
        scanAttempts = scanAttempts + ?
      WHERE ip = ?
    `).run(
      newScore,
      shouldDecoy ? 1 : existing.isDecoyed,
      now,
      eventType === 'FAILED_LOGIN' ? 1 : 0,
      eventType === 'BOT_HONEYPOT' ? 1 : 0,
      eventType === 'PATH_SCAN' ? 1 : 0,
      ip
    );

    if (shouldDecoy && !existing.isDecoyed) {
      console.warn(`🚨 [Adaptive Deception] IP ${ip} exceeded risk threshold (${newScore}/100). Routing to HONEYPOT.`);
    }
  }

  return getRiskScore(ip);
}



// ─── ตรวจจับ SQL Injection Patterns ──────────────────────────────────────────
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
  /(--|;|'|"|\bOR\b|\bAND\b).*(\bSELECT\b|\bDROP\b|\bUNION\b)/i,
  /(\bOR\b\s+\d+\s*=\s*\d+)/i,
  /('.*--)/i,
  /(SLEEP\s*\(|BENCHMARK\s*\(|WAITFOR\s+DELAY)/i,
];

export function detectSQLInjection(text) {
  if (!text) return false;
  const str = typeof text === 'object' ? JSON.stringify(text) : String(text);
  return SQL_PATTERNS.some(pattern => pattern.test(str));
}

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /on(error|load|click|mouseover|mouseenter|focus|blur)\s*=/i,
  /javascript\s*:/i,
  /(document\.cookie|window\.location|document\.write)/i,
  /eval\s*\(/i,
  /\\balert\s*\(/i,
  /<iframe[\s>]/i,
  /<img[^>]+onerror/i,
];

export function detectXSS(text) {
  if (!text) return false;
  const str = typeof text === 'object' ? JSON.stringify(text) : String(text);
  return XSS_PATTERNS.some(pattern => pattern.test(str));
}

export function analyzeBehavior(behavior) {
  const flags = [];
  if (!behavior) return flags;
  
  // ─── 1. Keystroke Analysis ────────────────────────────────────────────────
  if (behavior.keystroke) {
    const k = behavior.keystroke;
    // อนุญาตให้ Copy-Paste (keyCount <= 5) ผ่านได้
    if (k.avgLatency < 15 && k.keyCount > 5) {
      flags.push({ type: 'BOT_TYPING', reason: `Avg latency ${k.avgLatency}ms (< 15ms = bot)` });
    }
    if (k.stdDev < 2 && k.keyCount > 5) {
      flags.push({ type: 'BOT_TYPING', reason: `Std dev ${k.stdDev}ms (< 2ms = robotic)` });
    }
    // NEW: Typing Rhythm Entropy (จาก BeCAPTCHA-Mouse 2022)
    // มนุษย์พิมพ์ไม่สม่ำเสมอ = Entropy สูง, บอทพิมพ์จังหวะเดิม = Entropy ต่ำ
    if (k.typingRhythmEntropy !== undefined && k.typingRhythmEntropy < 0.5 && k.keyCount > 8) {
      flags.push({ type: 'ROBOTIC_TYPING_RHYTHM', reason: `Typing rhythm entropy ${k.typingRhythmEntropy.toFixed(3)} (< 0.5 = too regular)` });
    }
    // NEW: Backspace Ratio (มนุษย์มักพิมพ์ผิดบ้าง)
    // backspaceRatio = 0 หลังพิมพ์ > 15 ตัว = ไม่เคยผิดพลาดเลย = บอทที่พิมพ์โปรแกรม
    if (k.backspaceRatio === 0 && k.keyCount > 15) {
      flags.push({ type: 'ZERO_TYPO', reason: `Zero backspaces in ${k.keyCount} keystrokes (too perfect = bot)` });
    }
  }
  
  // ─── 2. Mouse Analysis ────────────────────────────────────────────────────
  if (behavior.mouse) {
    const m = behavior.mouse;
    if (!m.hasMovement) {
      flags.push({ type: 'NO_MOUSE', reason: 'No mouse movement detected' });
    }
    if (m.straightLineRatio > 0.95 && m.hasMovement) {
      flags.push({ type: 'ROBOTIC_MOUSE', reason: `Straight line ratio ${m.straightLineRatio.toFixed(3)} (> 0.95 = robotic)` });
    }
    // NEW: Mouse Speed Entropy (จาก BeCAPTCHA-Mouse 2022 + Mouse Dynamics Research)
    // มนุษย์เร่ง/ชะลอตลอดเวลา = Entropy สูง, บอทเคลื่อนที่ความเร็วคงที่ = Entropy ต่ำ
    if (m.speedEntropy !== undefined && m.speedEntropy < 0.8 && m.hasMovement && m.totalDistance > 50) {
      flags.push({ type: 'CONSTANT_SPEED_MOUSE', reason: `Mouse speed entropy ${m.speedEntropy.toFixed(3)} (< 0.8 = constant velocity = bot)` });
    }
    // NEW: Mouse Angle Entropy (วัดความโค้งของเส้นทาง)
    // บอทวิ่งเป็นเส้นตรง = มุมเดิมตลอด = Angle Entropy ต่ำ
    if (m.angleEntropy !== undefined && m.angleEntropy < 1.0 && m.hasMovement && m.totalDistance > 100) {
      flags.push({ type: 'LINEAR_MOUSE_PATH', reason: `Mouse angle entropy ${m.angleEntropy.toFixed(3)} (< 1.0 = straight path = bot)` });
    }
  }
  
  // ─── 3. Dwell Time Analysis ───────────────────────────────────────────────
  if (behavior.dwell) {
    if (behavior.dwell.pageLoadToSubmit < 1000) {
      flags.push({ type: 'SUPERHUMAN_SPEED', reason: `Submit in ${behavior.dwell.pageLoadToSubmit}ms (< 1s = bot)` });
    }
  }
  
  // ─── 4. Automation Detection (Advanced — 20+ Signals) ────────────────────
  if (behavior.automation) {
    // เกณฑ์เดิม: 2+ signals = bot. ตอนนี้ระบบมี 20+ checks แล้ว ปรับ threshold เป็น 3
    if (behavior.automation.automationScore >= 3) {
      flags.push({ type: 'HEADLESS_BROWSER', reason: `${behavior.automation.automationScore}/20 automation signals detected` });
    }
    // ถ้าโดน flag webdriver ตรงๆ = Selenium/Playwright ชัวร์
    if (behavior.automation.automationSignals?.webdriver === true) {
      flags.push({ type: 'WEBDRIVER_DETECTED', reason: 'navigator.webdriver = true (Selenium/Playwright/Puppeteer detected)' });
    }
    // Chrome DevTools artifacts
    if (behavior.automation.automationSignals?.hasCDPArtifacts === true) {
      flags.push({ type: 'CDP_ARTIFACT', reason: 'Chrome DevTools Protocol artifacts found (__nightmare, _phantom, callPhantom)' });
    }
  }
  
  // ─── 5. Scroll Analysis (Enhanced — จาก Scroll Behavior Research) ─────────
  if (behavior.scroll) {
    const s = behavior.scroll;
    // NEW: Scroll Interval Variance — บอทเลื่อนสม่ำเสมอ Variance ต่ำ
    // < 500 ms² Variance หลังจากเลื่อนหลายครั้ง = สม่ำเสมอเกินไป = บอท
    if (s.intervalVariance !== undefined && s.intervalVariance < 500 && s.scrollCount > 5) {
      flags.push({ type: 'ROBOTIC_SCROLL', reason: `Scroll interval variance ${s.intervalVariance.toFixed(0)}ms² (< 500 = too regular = bot)` });
    }
    // NEW: Scroll Interval Entropy
    if (s.intervalEntropy !== undefined && s.intervalEntropy < 0.5 && s.scrollCount > 5) {
      flags.push({ type: 'UNIFORM_SCROLL_TIMING', reason: `Scroll timing entropy ${s.intervalEntropy.toFixed(3)} (< 0.5 = uniform = bot)` });
    }
    // NEW: Time-to-first-scroll — บอทอาจเลื่อนก่อนหน้า Render เสร็จด้วยซ้ำ
    if (s.timeToFirstScroll !== null && s.timeToFirstScroll < 300 && s.scrollCount > 0) {
      flags.push({ type: 'INSTANT_SCROLL', reason: `First scroll at ${s.timeToFirstScroll}ms (< 300ms after load = bot)` });
    }
  }

  // ─── 6. Hardware Fingerprint Analysis (Canvas/WebGL/Audio) ───────────────
  if (behavior.fingerprint) {
    const fp = behavior.fingerprint;
    // ตรวจ VM fingerprint: VM ส่วนใหญ่ใช้ llvmpipe, SwiftShader, Mesa
    const vmRenderers = /llvmpipe|swiftshader|mesa|virtualbox|vmware|google swiftshader/i;
    if (fp.webglRenderer && vmRenderers.test(fp.webglRenderer)) {
      flags.push({ type: 'VM_RENDERER', reason: `WebGL renderer: "${fp.webglRenderer}" (VM/Headless GPU detected)` });
    }
    // ตรวจ Canvas ถูก Block (บอทบางตัว Block Canvas API)
    if (fp.canvas === 'canvas_blocked') {
      flags.push({ type: 'CANVAS_BLOCKED', reason: 'Canvas API blocked (bot evasion technique)' });
    }
    // Audio fingerprint ถูก Block
    if (fp.audioHash === 'audio_blocked') {
      flags.push({ type: 'AUDIO_BLOCKED', reason: 'AudioContext API blocked (bot evasion technique)' });
    }
  }

  // ─── 7. Touch / Mobile Analysis ──────────────────────────────────────────
  if (behavior.touch && behavior.device) {
    if (behavior.device.isMobile && !behavior.touch.hasTouch) {
      flags.push({ type: 'MOBILE_BOT', reason: 'Mobile User-Agent but no touch events detected' });
    }
  }
  
  return flags;
}


// ─── Network Analysis (HTTP Headers & GeoIP) ────────────────────────────────

const BAD_AGENTS = /sqlmap|nmap|curl|wget|python-requests|go-http-client|java/i;

export function detectMaliciousHeaders(req) {
  const ua = req.headers['user-agent'] || '';
  if (BAD_AGENTS.test(ua)) {
    return true;
  }
  return false;
}

// Memory สำหรับเก็บข้อมูล Session ล่าสุด
const userSessions = new Map();

export async function checkImpossibleTravel(email, currentIp) {
  if (!email || !currentIp || currentIp === '127.0.0.1' || currentIp === '::1') return false;
  
  try {
    const geoip = await import('geoip-lite');
    const geo = geoip.default.lookup(currentIp);
    const currentCountry = geo ? geo.country : 'Unknown';
    
    if (userSessions.has(email)) {
      const lastSession = userSessions.get(email);
      
      if (lastSession.country !== 'Unknown' && currentCountry !== 'Unknown' && lastSession.country !== currentCountry) {
        const timeDiffMinutes = (Date.now() - lastSession.time) / (1000 * 60);
        // ถ้าเปลี่ยนประเทศภายในเวลาไม่ถึง 5 นาที = Impossible Travel
        if (timeDiffMinutes < 5) {
          return true;
        }
      }
    }
    
    userSessions.set(email, { ip: currentIp, country: currentCountry, time: Date.now() });
    return false;
  } catch (e) {
    // Ignore if geoip-lite is not fully loaded
    return false;
  }
}

// ─── ตรวจจับ Suspicious User-Agent ───────────────────────────────────────────
const SUSPICIOUS_UA_PATTERNS = [
  /sqlmap/i,          // เครื่องมือ SQL Injection อัตโนมัติ
  /nikto/i,           // เครื่องมือสแกนช่องโหว่เว็บเซิร์ฟเวอร์
  /nmap/i,            // เครื่องมือสแกนพอร์ตและเครือข่าย
  /masscan/i,         // เครื่องมือสแกนพอร์ตความเร็วสูง
  /metasploit/i,      // เฟรมเวิร์กทดสอบการเจาะระบบ
  /burpsuite/i,       // เครื่องมือทดสอบความปลอดภัยเว็บ
  /dirbuster/i,       // เครื่องมือค้นหา Directory ที่ซ่อนอยู่
  /gobuster/i,        // เครื่องมือ Brute Force Directory
  /hydra/i,           // เครื่องมือ Brute Force Password
  /python-requests/i, // Library สำหรับเขียน Script อัตโนมัติ
  /go-http-client/i,  // HTTP Client ของภาษา Go
  /curl\/\d/i,        // cURL command-line tool
];

export function detectSuspiciousUA(userAgent) {
  if (!userAgent) return false;
  return SUSPICIOUS_UA_PATTERNS.some(pattern => pattern.test(userAgent));
}

// ─── Honeypot Response Functions ──────────────────────────────────────────────
// ส่งข้อมูลปลอมกลับไปให้แฮกเกอร์ (เหมือนจริงแต่ไม่ใช่)

export function getFakeUser(email) {
  if (!db) return null;
  return db.prepare('SELECT * FROM FakeUser WHERE email = ?').get(email);
}

export function getFakeConcerts() {
  if (!db) return [];
  return db.prepare('SELECT * FROM FakeConcert').all();
}

export function getFakeTickets(userId) {
  if (!db) return [];
  return db.prepare('SELECT * FROM FakeTicket WHERE userId = ?').all(userId);
}

export function getAllIpRisks() {
  if (!db) return [];
  return db.prepare(`
    SELECT * FROM IpRisk 
    ORDER BY riskScore DESC
  `).all();
}

// ─── Dashboard: Risk Score Distribution (สำหรับกราฟแท่ง) ────────────────────
export function getRiskDistribution() {
  if (!db) return [];
  const ranges = [
    { label: 'Safe (0-20)',     min: 0,  max: 20  },
    { label: 'Low (21-40)',     min: 21, max: 40  },
    { label: 'Medium (41-70)', min: 41, max: 70  },
    { label: 'High (71-90)',   min: 71, max: 90  },
    { label: 'Critical (91+)', min: 91, max: 100 },
  ];
  return ranges.map(r => ({
    label: r.label,
    count: db.prepare(`
      SELECT COUNT(*) as cnt FROM IpRisk 
      WHERE riskScore >= ? AND riskScore <= ?
    `).get(r.min, r.max).cnt
  }));
}

export { db as honeypotDB };
