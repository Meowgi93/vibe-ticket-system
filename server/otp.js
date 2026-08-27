// otp.js - OTP Verification Module
// Phase 3 of Security Implementation

const otpStore = new Map();

// สร้างและจัดเก็บ OTP
export function generateOTP(email) {
  // สร้าง OTP 6 หลัก
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 นาที TTL
  
  otpStore.set(email, { code, expiresAt, attempts: 0 });
  return code;
}

// ตรวจสอบ OTP
export function verifyOTP(email, code) {
  const record = otpStore.get(email);
  
  if (!record) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: 'OTP has expired' };
  }
  
  record.attempts += 1;
  if (record.attempts > 3) {
    otpStore.delete(email);
    return { success: false, message: 'Too many failed attempts, request a new OTP' };
  }
  
  if (record.code === code) {
    otpStore.delete(email); // ลบเมื่อตรวจสอบสำเร็จ
    return { success: true, message: 'OTP verified successfully' };
  }
  
  return { success: false, message: 'Invalid OTP code' };
}

// ล้าง OTP ที่หมดอายุ
export function cleanupExpired() {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(email);
    }
  }
}

// ตั้งเวลาทำความสะอาดทุกๆ 1 นาที
setInterval(cleanupExpired, 60 * 1000);

// จำลองการส่งอีเมล (สามารถแทนที่ด้วย Nodemailer ใน production)
export function sendOTPEmail(email, code) {
  console.log(`📧 [Email Simulation] Sending OTP to ${email}: ${code}`);
}
