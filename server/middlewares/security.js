import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import {
  getRiskScore, addRiskScore,
  detectSQLInjection, detectSuspiciousUA, detectXSS, analyzeBehavior,
  detectMaliciousHeaders, checkImpossibleTravel
} from '../honeypot.js';
import { sendSecurityAlert } from '../alert.js';

// ─── 1. Threat Detection Middleware ──────────────────────────────────────
export const threatDetectionMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || '';
  const bodyStr = JSON.stringify(req.body || {});
  const queryStr = JSON.stringify(req.query || {});

  if (detectSuspiciousUA(userAgent)) {
    addRiskScore(ip, 'SUSPICIOUS_UA', { method: req.method, path: req.path, payload: req.body, userAgent });
    console.warn(`🔍 [Suspicious UA] IP: ${ip} | UA: ${userAgent.substring(0, 60)}`);
  }

  if ((bodyStr.length > 2 && detectSQLInjection(bodyStr)) || (queryStr.length > 2 && detectSQLInjection(queryStr)) || detectSQLInjection(req.path)) {
    addRiskScore(ip, 'SQL_INJECTION', { method: req.method, path: req.path, payload: { body: req.body, query: req.query }, userAgent });
    console.warn(`💉 [SQL Injection] IP: ${ip} | Path: ${req.path}`);
  }

  if ((bodyStr.length > 2 && detectXSS(bodyStr)) || (queryStr.length > 2 && detectXSS(queryStr)) || detectXSS(req.path)) {
    addRiskScore(ip, 'XSS_ATTEMPT', { method: req.method, path: req.path, payload: { body: req.body, query: req.query }, userAgent });
    console.warn(`🛡️ [XSS Attempt] IP: ${ip} | Path: ${req.path}`);
  }

  if (detectMaliciousHeaders(req)) {
    addRiskScore(ip, 'MALICIOUS_HEADER', { method: req.method, path: req.path, payload: req.body, userAgent });
    console.warn(`🛡️ [Malicious Header] IP: ${ip} | UA: ${userAgent}`);
  }

  next();
};

// ─── 2. Rapid Request Limiter ─────────────────────────────────────────────
const requestCounts = new Map();
export const rapidRequestLimiter = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  const timestamps = requestCounts.get(ip);
  timestamps.push(now);
  
  while (timestamps.length > 0 && timestamps[0] < now - 1000) {
    timestamps.shift();
  }
  
  if (timestamps.length > 50) {
    addRiskScore(ip, 'RAPID_REQUESTS', { method: req.method, path: req.path, payload: req.body, userAgent: req.headers['user-agent'] });
  }
  next();
};

// ─── 3. Global Behavioral Analysis & Impossible Travel ─────────────────────
export const behavioralAnalysisMiddleware = async (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || '';

  if (req.path === '/api/auth/login' && req.method === 'POST') {
    const { email, behavior } = req.body || {};
    
    if (behavior) {
      const flags = analyzeBehavior(behavior);
      for (const flag of flags) {
        addRiskScore(ip, flag.type, { method: 'POST', path: req.path, payload: { reason: flag.reason }, userAgent });
        console.warn(`🤖 [Behavior] IP: ${ip} | ${flag.type}: ${flag.reason}`);
      }
    }

    if (email) {
      const isImpossible = await checkImpossibleTravel(email, ip);
      if (isImpossible) {
        addRiskScore(ip, 'IMPOSSIBLE_TRAVEL', { method: 'POST', path: req.path, userAgent });
        console.warn(`🌍 [Impossible Travel] IP: ${ip} | Email: ${email}`);
      }
    }
  }
  next();
};

// ─── 4. Honeypot Proxy Middleware ──────────────────────────────────────────
const honeypotProxy = createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  logLevel: 'silent',
  on: {
    proxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('x-forwarded-for', req.ip || req.connection?.remoteAddress || 'unknown');
      if (req.body) fixRequestBody(proxyReq, req);
    }
  }
});

export const honeypotProxyMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const riskScore = getRiskScore(ip);
  
  if (riskScore >= 70) {
    console.warn(`🍯 [Deception Proxy] IP ${ip} (Score: ${riskScore}) routed to Honeypot Microservice!`);
    sendSecurityAlert('HONEYPOT_ROUTED', { ip, attackType: 'DECOYED', riskScore, path: req.path });
    return honeypotProxy(req, res, next);
  }
  next();
};
