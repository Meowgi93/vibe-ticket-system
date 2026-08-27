import { parseArgs } from 'util';

const API_URL = 'http://localhost:5000';

const attacks = {
  bruteForce: async () => {
    console.log('🚀 [Attack] Starting Brute Force Attack on /api/auth/login...');
    const email = `victim_${Math.floor(Math.random() * 1000)}@vibe.com`;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'wrongpassword123' })
        });
        console.log(`[Attempt ${attempts}] Status: ${res.status} | IP: (Simulated via Request)`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
      if (attempts >= 20) {
        clearInterval(interval);
        console.log('✅ Brute Force Attack simulation completed (20 requests).');
      }
    }, 200); // ยิงทุกๆ 200ms
  },

  sqlInjection: async () => {
    console.log('🚀 [Attack] Starting SQL Injection Attack on /api/auth/login...');
    const payloads = [
      "' OR 1=1 --",
      "admin' --",
      "' UNION SELECT null, null, null --"
    ];
    for (const payload of payloads) {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload, password: 'any' })
        });
        const data = await res.json();
        console.log(`[SQLi] Payload: ${payload} | Status: ${res.status} | Response:`, data);
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
    }
    console.log('✅ SQL Injection Attack simulation completed.');
  },

  botHoneypot: async () => {
    console.log('🚀 [Attack] Starting Bot Honeypot Form Submission...');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `bot_${Date.now()}`,
          fullName: 'Bot User',
          email: `bot${Date.now()}@spam.com`,
          phone: '0811111111',
          password: 'Password123!',
          honeypot: 'http://spam-website.com' // บอทจะเผลอกรอกช่องนี้
        })
      });
      const data = await res.json();
      console.log(`[Bot] Status: ${res.status} | Response:`, data);
      console.log('✅ Bot Honeypot Attack simulation completed.');
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  },

  pathScan: async () => {
    console.log('🚀 [Attack] Starting Suspicious Path Scanning...');
    const paths = ['/wp-admin', '/.env', '/phpmyadmin', '/backup.zip', '/config.php'];
    for (const path of paths) {
      try {
        const res = await fetch(`${API_URL}${path}`, {
          headers: {
            'User-Agent': 'sqlmap/1.5 (http://sqlmap.org)' // ปลอม User-Agent เป็นเครื่องมือแฮก
          }
        });
        console.log(`[Scan] Path: ${path} | Status: ${res.status}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
    }
    console.log('✅ Path Scanning simulation completed.');
  },
  
  all: async () => {
    await attacks.bruteForce();
    setTimeout(attacks.sqlInjection, 4500);
    setTimeout(attacks.botHoneypot, 6000);
    setTimeout(attacks.pathScan, 7000);
  }
};

const args = process.argv.slice(2);
const mode = args[0] || 'all';

console.log('=============================================');
console.log('🛡️  VIBE Security - Attack Simulator V1.0  🛡️');
console.log('=============================================');

if (attacks[mode]) {
  attacks[mode]();
} else {
  console.log('Usage: node attack-simulator.js [mode]');
  console.log('Modes: bruteForce, sqlInjection, botHoneypot, pathScan, all');
}
