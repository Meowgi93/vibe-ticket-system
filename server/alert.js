// alert.js - Alert Notification Module
// Phase 3 of Security Implementation

// เก็บเวลาแจ้งเตือนล่าสุดของแต่ละ IP
const rateLimiter = new Map();
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 นาที

// ส่งการแจ้งเตือนผ่าน LINE Notify
export async function sendLineNotify(message) {
  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token) {
    console.log(`[LINE Mock] ${message}`);
    return;
  }
  
  try {
    await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: new URLSearchParams({ message })
    });
  } catch (error) {
    console.error('Failed to send LINE notification', error);
  }
}

// ส่งการแจ้งเตือนผ่าน Telegram
export async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.log(`[Telegram Mock] ${message}`);
    return;
  }
  
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
  } catch (error) {
    console.error('Failed to send Telegram notification', error);
  }
}

// ส่งการแจ้งเตือนแบบครบวงจร พร้อมตรวจสอบ Rate Limit
export async function sendSecurityAlert(type, data) {
  const { ip, attackType, riskScore, path, payload } = data;
  
  // ตรวจสอบ Rate Limit
  const lastAlertTime = rateLimiter.get(ip);
  if (lastAlertTime && Date.now() - lastAlertTime < RATE_LIMIT_MS) {
    return; // ข้ามการแจ้งเตือนถ้ายังไม่พ้น 5 นาที
  }
  rateLimiter.set(ip, Date.now());
  
  // ล้าง rate limiter ที่เก่าเกินไป
  for (const [key, time] of rateLimiter.entries()) {
    if (Date.now() - time > RATE_LIMIT_MS) {
      rateLimiter.delete(key);
    }
  }

  const message = `
🚨 SECURITY ALERT: ${type}
IP: ${ip}
Type: ${attackType}
Risk Score: ${riskScore}/100
Path: ${path}
Payload: ${payload ? JSON.stringify(payload) : 'None'}`;

  await Promise.all([
    sendLineNotify(message),
    sendTelegramAlert(message)
  ]);
}
