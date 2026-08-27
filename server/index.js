import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit as expressRateLimit } from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import {
  getRiskScore, isDecoyed, addRiskScore, getFakeUser, getFakeConcerts,
  getAllIpRisks, getRiskDistribution
} from './honeypot.js';
import { 
  threatDetectionMiddleware, 
  rapidRequestLimiter, 
  behavioralAnalysisMiddleware, 
  honeypotProxyMiddleware 
} from './middlewares/security.js';
import { generateOTP, verifyOTP, sendOTPEmail } from './otp.js';
import { sendSecurityAlert } from './alert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
app.set('trust proxy', true); // เชื่อใจ Chain ทั้งหมดของ Load Balancer เพื่อดึง IP ผู้ใช้ตัวจริง

// ─── Simulation Mode (สำหรับพรีเซนต์ Thesis) ──────────────────────
app.use((req, res, next) => {
  if (req.headers['x-simulation-ip'] && req.headers['x-admin-secret'] === 'vibe-thesis-2026') {
    Object.defineProperty(req, 'ip', { value: req.headers['x-simulation-ip'], configurable: true });
  }
  next();
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'vibe-secret-key-2026';
const ALTCHA_HMAC_KEY = process.env.ALTCHA_HMAC_KEY || 'vibe-altcha-secret-2026';

// ─── Security: HTTP Headers ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // ปิดชั่วคราวเพื่อให้รัน Vite dev server และ assets ได้สะดวก
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = ['http://localhost:5173'];
if (process.env.ALLOWED_ORIGIN) allowedOrigins.push(process.env.ALLOWED_ORIGIN);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// ─── Phase 3: Threat Detection Middleware ──────────────
app.use(threatDetectionMiddleware);

// ─── Security: Rapid Request Limiter ───────────────────────────
app.use(rapidRequestLimiter);

// ─── Global Behavioral Analysis & Impossible Travel ────────────────────────────
app.use(behavioralAnalysisMiddleware);

// ─── Adaptive Deception: Reverse Proxy to Honeypot Server (Port 5001) ───────────
app.use('/api', honeypotProxyMiddleware);

// ─── Security: Rate Limiter สำหรับ Auth API (กัน Brute Force) ────────────────
const authLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000,  // 15 นาที
  max: 10,                    // ไม่เกิน 10 ครั้งต่อ IP ใน 15 นาที
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' }
});

// ─── Security: Input Validation Rules ────────────────────────────────────────
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username ต้องมี 3-20 ตัวอักษร')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username ใช้ได้แค่ a-z, 0-9 และ _'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name ต้องมี 2-100 ตัวอักษร')
    .escape(),
  body('email')
    .trim()
    .isEmail().withMessage('รูปแบบ Email ไม่ถูกต้อง')
    .normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^[0-9+\-\s]{9,15}$/).withMessage('รูปแบบเบอร์โทรไม่ถูกต้อง'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password ต้องมีอย่างน้อย 8 ตัวอักษร')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password ต้องมีทั้งตัวอักษรและตัวเลข')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('รูปแบบ Email ไม่ถูกต้อง').normalizeEmail(),
  body('password').notEmpty().withMessage('กรุณากรอก Password')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => e.msg)
    });
  }
  next();
};

// ─── In-Memory Queue System ──────────────────────────────────────────────────
const concertQueues = new Map(); // concertId -> { users: Map<userId, {position, joinedAt}>, nextPosition: 1, releasedUpTo: 0 }

function getOrCreateQueue(concertId) {
  if (!concertQueues.has(concertId)) {
    concertQueues.set(concertId, { users: new Map(), nextPosition: 1, releasedUpTo: 0 });
  }
  return concertQueues.get(concertId);
}

// Auto-release users from queue in batches every 5 seconds
setInterval(() => {
  for (const [, queue] of concertQueues) {
    if (queue.users.size > 0 && queue.releasedUpTo < queue.nextPosition - 1) {
      queue.releasedUpTo = Math.min(queue.releasedUpTo + 3, queue.nextPosition - 1); // Release 3 users per batch
    }
  }
}, 5000);

// ─── Rate Limiting (Simple In-Memory) ────────────────────────────────────────
const rateLimitMap = new Map();
function rateLimit(maxRequests = 30, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    const entry = rateLimitMap.get(ip);
    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + windowMs;
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    next();
  };
}

app.use('/api/concerts/:id/join-queue', rateLimit(10, 60000));
// app.use('/api/tickets', rateLimit(5, 60000));

// ─── Middleware: Verify JWT Token ───────────────────────────────────────────
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: 'User no longer exists.' });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Verify Error:', err.message);
    res.status(401).json({ error: 'Invalid token.' });
  }
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admin only.' });
    }
  });
}

// ─── Auth: Register ──────────────────────────────────────────────────────────
app.post('/api/auth/register', authLimiter, registerValidation, validate, async (req, res) => {
  try {
    const { username, fullName, email, phone, password, honeypot } = req.body;

    // ─── Honeypot: ตรวจจับบอท ───────────────────────────────────────────────
    if (honeypot) {
      console.warn(`[🚨 BOT DETECTED] IP: ${req.ip} | Time: ${new Date().toISOString()} | Field: honeypot filled`);
      addRiskScore(req.ip, 'BOT_HONEYPOT', { method: 'POST', path: req.path, userAgent: req.headers['user-agent'] });
      // หลอกให้บอทคิดว่าสำเร็จ แต่ไม่บันทึกข้อมูลจริง
      return res.status(201).json({ token: 'fake-token', user: { id: 0, role: 'user' } });
    }
    // ────────────────────────────────────────────────────────────────────────

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail)
      return res.status(409).json({ error: 'Email already in use.' });

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername)
      return res.status(409).json({ error: 'Username already in use.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, fullName, email, phone, password: hashed } });
    const token = jwt.sign({ id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// ─── Auth: Login ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', authLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { email, password, behavior } = req.body;
    const ip = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      addRiskScore(ip, 'FAILED_LOGIN', { method: 'POST', path: '/api/auth/login', payload: { email }, userAgent });
      console.warn(`[⚠️  FAILED LOGIN] IP: ${ip} | Email: ${email} | RiskScore: ${getRiskScore(ip)}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      addRiskScore(ip, 'FAILED_LOGIN', { method: 'POST', path: '/api/auth/login', payload: { email }, userAgent });
      console.warn(`[⚠️  FAILED LOGIN] IP: ${ip} | Email: ${email} | RiskScore: ${getRiskScore(ip)}`);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ─── Auth: Verify OTP (Step-up Authentication) ──────────────────────────────
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, code, tempToken } = req.body;
    const ip = req.ip || 'unknown';

    // ตรวจสอบ tempToken
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
      if (!decoded._stepup) throw new Error('Invalid token type');
    } catch (e) {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }

    const result = verifyOTP(email, code);
    if (!result.success) {
      addRiskScore(ip, 'FAILED_LOGIN', { method: 'POST', path: '/api/auth/verify-otp', payload: { email }, userAgent: req.headers['user-agent'] });
      return res.status(400).json({ error: result.message });
    }

    // OTP ถูกต้อง → ออก Token จริง
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const token = jwt.sign({ id: user.id, username: user.username, fullName: user.fullName, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ [OTP Verified] IP: ${ip} | Email: ${email}`);
    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
});

// ─── Concerts: Get All ───────────────────────────────────────────────────────
app.get('/api/concerts', async (req, res) => {
  try {
    const concerts = await prisma.concert.findMany({ include: { zones: true, showtimes: true } });
    res.json(concerts.map(c => ({ ...c, tags: c.tags.split(',') })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch concerts' });
  }
});

// ─── Concerts: Get By ID ─────────────────────────────────────────────────────
app.get('/api/concerts/:id', async (req, res) => {
  try {
    const concert = await prisma.concert.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { zones: true, showtimes: true }
    });
    if (!concert) return res.status(404).json({ error: 'Concert not found' });
    res.json({ ...concert, tags: concert.tags.split(',') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch concert' });
  }
});

// ─── Seats: Get Booked Seats for a Concert ───────────────────────────────────
app.get('/api/concerts/:id/seats', async (req, res) => {
  try {
    const { showtimeId } = req.query;
    const where = {
      zone: { concertId: parseInt(req.params.id) }
    };
    if (showtimeId) {
      where.showtimeId = showtimeId;
    }
    const bookedSeats = await prisma.bookedSeat.findMany({
      where,
      select: { zoneId: true, row: true, col: true }
    });
    res.json(bookedSeats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booked seats' });
  }
});

// ─── Tickets: Get My Tickets ─────────────────────────────────────────────────
app.get('/api/tickets', verifyToken, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      include: {
        concert: true,
        showtime: true,
        bookedSeats: { include: { zone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets.map(t => ({
      ...t,
      concert: { ...t.concert, tags: t.concert.tags.split(',') }
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// ─── Tickets: Book Ticket ─────────────────────────────────────────────────────
app.post('/api/tickets', verifyToken, async (req, res) => {
  try {
    const { concertId, showtimeId, seats, holderName, holderEmail, holderPhone } = req.body;
    
    if (!concertId || !showtimeId || !seats || seats.length === 0)
      return res.status(400).json({ error: 'concertId, showtimeId and seats are required.' });

    // LIMIT CHECK: Max 3 seats per transaction
    if (seats.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 seats allowed per transaction.' });
    }

    const ticket = await prisma.$transaction(async (tx) => {
      // 1. DOUBLE-BOOKING CHECK (Race Condition Fix)
      const orConditions = seats.map(s => ({
        zoneId: s.zoneId,
        row: s.row,
        col: s.col
      }));
      
      const existingSeats = await tx.bookedSeat.findMany({
        where: {
          showtimeId: showtimeId,
          OR: orConditions
        }
      });
      
      if (existingSeats.length > 0) {
        throw new Error('SEAT_UNAVAILABLE');
      }

      // 2. PRICE TAMPERING FIX (Fetch real prices from DB)
      const zoneIds = [...new Set(seats.map(s => s.zoneId))];
      const dbZones = await tx.zone.findMany({ where: { id: { in: zoneIds } } });
      const zonePriceMap = {};
      dbZones.forEach(z => { zonePriceMap[z.id] = z.price; });

      let realTotalPaid = 0;
      for (const s of seats) {
        const actualPrice = zonePriceMap[s.zoneId];
        if (actualPrice === undefined) throw new Error('INVALID_ZONE');
        realTotalPaid += actualPrice;
      }

      // 3. CREATE TICKET
      return await tx.ticket.create({
        data: {
          userId: req.user.id,
          concertId,
          showtimeId,
          totalPaid: realTotalPaid,
          status: 'confirmed',
          holderName,
          holderEmail,
          holderPhone,
          bookedSeats: {
            create: seats.map(s => ({
              zoneId: s.zoneId,
              showtimeId,
              row: s.row,
              col: s.col
            }))
          }
        },
        include: {
          concert: true,
          showtime: true,
          bookedSeats: { include: { zone: true } }
        }
      });
    });

    res.status(201).json({
      ...ticket,
      concert: { ...ticket.concert, tags: ticket.concert.tags.split(',') }
    });
  } catch (err) {
    if (err.message === 'SEAT_UNAVAILABLE') {
      return res.status(409).json({ error: 'One or more selected seats are already booked.' });
    }
    if (err.message === 'INVALID_ZONE') {
      return res.status(400).json({ error: 'Invalid zone provided.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Booking failed.' });
  }
});

app.get('/api/tickets/:id', verifyToken, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        concert: true,
        showtime: true,
        user: { select: { fullName: true, email: true } },
        bookedSeats: { include: { zone: true } }
      }
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    // Ensure the ticket belongs to the requesting user (or user is admin)
    if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access to this ticket' });
    }

    res.json({
      ...ticket,
      concert: { ...ticket.concert, tags: ticket.concert.tags.split(',') }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ticket.' });
  }
});

// ─── User: Update Profile ────────────────────────────────────────────────────
app.put('/api/users/profile', verifyToken, async (req, res) => {
  try {
    const { username, fullName, email, phone, password } = req.body;
    if (!username || !fullName || !email || !phone) return res.status(400).json({ error: 'All fields except password are required.' });

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail && existingEmail.id !== req.user.id) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername && existingUsername.id !== req.user.id) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    const updateData = { username, fullName, email, phone };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    const token = jwt.sign({ id: updatedUser.id, username: updatedUser.username, fullName: updatedUser.fullName, email: updatedUser.email, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: updatedUser.id, username: updatedUser.username, fullName: updatedUser.fullName, email: updatedUser.email, phone: updatedUser.phone, role: updatedUser.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile update failed.' });
  }
});

// ─── Queue System Routes ─────────────────────────────────────────────────────
app.get('/api/concerts/:id/queue-status', verifyToken, async (req, res) => {
  try {
    const concertId = parseInt(req.params.id);
    const concert = await prisma.concert.findUnique({ where: { id: concertId }, select: { saleStartAt: true, status: true } });
    if (!concert) return res.status(404).json({ error: 'Concert not found' });

    const now = new Date();
    const saleStart = concert.saleStartAt ? new Date(concert.saleStartAt) : null;

    // If no saleStartAt is set, sale is always open
    if (!saleStart) {
      return res.json({ phase: 'open', message: 'Tickets are available now' });
    }

    // If sale hasn't started yet
    if (now < saleStart) {
      const timeUntilSale = Math.max(0, Math.floor((saleStart - now) / 1000));
      const queue = getOrCreateQueue(concertId);
      return res.json({
        phase: 'countdown',
        timeUntilSale,
        saleStartAt: saleStart.toISOString(),
        totalInQueue: queue.users.size
      });
    }

    // Sale has started — check queue
    const queue = getOrCreateQueue(concertId);
    const userId = req.user.id;
    const userEntry = queue.users.get(userId);

    if (!userEntry) {
      // User hasn't joined queue yet
      return res.json({
        phase: 'join',
        message: 'Sale is open! Join the queue.',
        totalInQueue: queue.users.size
      });
    }

    // User is in queue — check if released
    if (userEntry.position <= queue.releasedUpTo) {
      return res.json({
        phase: 'ready',
        message: "It's your turn! Select your seats.",
        queuePosition: userEntry.position,
        totalInQueue: queue.users.size
      });
    }

    // Still waiting
    return res.json({
      phase: 'waiting',
      queuePosition: userEntry.position,
      totalInQueue: queue.users.size,
      releasedUpTo: queue.releasedUpTo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get queue status' });
  }
});

app.post('/api/concerts/:id/join-queue', verifyToken, async (req, res) => {
  try {
    const concertId = parseInt(req.params.id);
    const concert = await prisma.concert.findUnique({ where: { id: concertId }, select: { saleStartAt: true } });
    if (!concert) return res.status(404).json({ error: 'Concert not found' });

    const now = new Date();
    const saleStart = concert.saleStartAt ? new Date(concert.saleStartAt) : null;

    // If sale hasn't started yet, can't join queue
    if (saleStart && now < saleStart) {
      return res.status(400).json({ error: 'Sale has not started yet' });
    }

    const queue = getOrCreateQueue(concertId);
    const userId = req.user.id;

    // Already in queue
    if (queue.users.has(userId)) {
      const entry = queue.users.get(userId);
      return res.json({ position: entry.position, totalInQueue: queue.users.size });
    }

    // Join queue
    const position = queue.nextPosition++;
    queue.users.set(userId, { position, joinedAt: new Date() });

    res.json({ position, totalInQueue: queue.users.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

// ─── Admin Routes ────────────────────────────────────────────────────────────
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const totalTickets = await prisma.ticket.count();
    const tickets = await prisma.ticket.findMany({ select: { totalPaid: true } });
    const totalRevenue = tickets.reduce((sum, t) => sum + t.totalPaid, 0);
    const totalConcerts = await prisma.concert.count();
    const totalUsers = await prisma.user.count();
    res.json({ totalRevenue, totalTickets, totalConcerts, totalUsers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/tickets', verifyAdmin, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        concert: { select: { title: true } },
        bookedSeats: { include: { zone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { tickets: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/concerts', verifyAdmin, async (req, res) => {
  try {
    const { title, artist, date, time, venue, location, status, priceRange, genre, description, image, tags, zones, saleStartAt, isFeatured, showtimes } = req.body;
    
    const concertData = {
      title, artist, date, time, venue, location, status, priceRange, genre, description,
      image: image || '/images/placeholder.jpg',
      tags: tags || 'Pop',
      saleStartAt: saleStartAt ? new Date(saleStartAt) : null,
      isFeatured: isFeatured || false
    };

    if (zones && Array.isArray(zones) && zones.length > 0) {
      concertData.zones = {
        create: zones.map(z => ({
          zoneId: z.zoneId,
          name: z.name,
          price: parseInt(z.price),
          color: z.color || '#f59e0b',
          rows: parseInt(z.rows) || 10,
          cols: parseInt(z.cols) || 20
        }))
      };
    }

    if (showtimes && Array.isArray(showtimes) && showtimes.length > 0) {
      concertData.showtimes = {
        create: showtimes.map(st => ({
          date: st.date,
          time: st.time
        }))
      };
    }

    const concert = await prisma.concert.create({ data: concertData, include: { zones: true, showtimes: true } });
    res.status(201).json(concert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create concert' });
  }
});

app.put('/api/concerts/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, artist, date, time, venue, location, status, priceRange, genre, description, image, tags, zones, saleStartAt, isFeatured, showtimes } = req.body;
    const concertId = parseInt(req.params.id);

    const concert = await prisma.concert.update({
      where: { id: concertId },
      data: { 
        title, artist, date, time, venue, location, status, priceRange, genre, description,
        ...(image && { image }),
        ...(tags && { tags }),
        saleStartAt: saleStartAt ? new Date(saleStartAt) : null,
        isFeatured: isFeatured !== undefined ? isFeatured : false
      }
    });

    if (zones && Array.isArray(zones)) {
      const existingZones = await prisma.zone.findMany({ where: { concertId } });
      const incomingIds = zones.map(z => z.id).filter(Boolean);
      const toDelete = existingZones.filter(z => !incomingIds.includes(z.id));
      
      for (const z of toDelete) {
        try {
          await prisma.zone.delete({ where: { id: z.id } });
        } catch(e) {
          console.warn('Could not delete zone, might have bookings:', z.id);
        }
      }
      
      for (const z of zones) {
        if (z.id) {
          await prisma.zone.update({
            where: { id: z.id },
            data: {
              zoneId: z.zoneId,
              name: z.name,
              price: parseInt(z.price),
              color: z.color || '#f59e0b',
              rows: parseInt(z.rows) || 10,
              cols: parseInt(z.cols) || 20
            }
          });
        } else {
          await prisma.zone.create({
            data: {
              zoneId: z.zoneId,
              name: z.name,
              price: parseInt(z.price),
              color: z.color || '#f59e0b',
              rows: parseInt(z.rows) || 10,
              cols: parseInt(z.cols) || 20,
              concertId: concertId
            }
          });
        }
      }
    }

    if (showtimes && Array.isArray(showtimes)) {
      const existingShowtimes = await prisma.showtime.findMany({ where: { concertId } });
      const incomingIds = showtimes.map(st => st.id).filter(Boolean);
      const toDelete = existingShowtimes.filter(st => !incomingIds.includes(st.id));
      
      for (const st of toDelete) {
        try {
          await prisma.showtime.delete({ where: { id: st.id } });
        } catch(e) {
          console.warn('Could not delete showtime, might have bookings:', st.id);
        }
      }
      
      for (const st of showtimes) {
        if (st.id) {
          await prisma.showtime.update({
            where: { id: st.id },
            data: {
              date: st.date,
              time: st.time
            }
          });
        } else {
          await prisma.showtime.create({
            data: {
              date: st.date,
              time: st.time,
              concertId: concertId
            }
          });
        }
      }
    }

    const updatedConcert = await prisma.concert.findUnique({ where: { id: concertId }, include: { zones: true, showtimes: true } });
    res.json(updatedConcert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update concert' });
  }
});

app.delete('/api/concerts/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.concert.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete concert' });
  }
});

app.put('/api/admin/concerts/:id/feature', verifyAdmin, async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const concert = await prisma.concert.update({
      where: { id: parseInt(req.params.id) },
      data: { isFeatured }
    });
    res.json(concert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feature status' });
  }
});

// ─── Phase 3: Security Dashboard APIs ───────────────────────────────────────

app.get('/api/security/logs', verifyAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    res.json(getRecentAttackLogs(limit));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attack logs' });
  }
});

app.get('/api/security/ip-risks', verifyAdmin, (req, res) => {
  try {
    res.json(getAllIpRisks());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch IP risks' });
  }
});


app.get('/api/security/distribution', verifyAdmin, (req, res) => {
  try {
    res.json(getRiskDistribution());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch risk distribution' });
  }
});


// ─── Security: Export CSV ────────────────────────────────────────────────────

// ─── Security: Summary Report ────────────────────────────────────────────────

// ─── 404 Handler: ตรวจจับการ Scan หา Hidden Paths ───────────────────────────
const SUSPICIOUS_PATHS = [
  '/wp-admin', '/wp-login.php',   // WordPress Admin
  '/.env', '/.git', '/.htaccess', // Configuration Files
  '/phpmyadmin', '/adminer',      // Database Management
  '/backup.zip', '/database.sql', // Backup Files
  '/config.php', '/config.yml',   // Config Files
  '/api/debug', '/api/test',      // Debug Endpoints
  '/shell.php', '/cmd.php',       // Web Shells
];

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // เสิร์ฟโฟลเดอร์ dist ที่เกิดจากคำสั่ง vite build
  app.use(express.static(path.join(__dirname, '../dist')));

  // สำหรับ API 404 Handler
  app.use('/api', (req, res) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    if (SUSPICIOUS_PATHS.some(p => req.path.toLowerCase().includes(p))) {
      addRiskScore(ip, 'PATH_SCAN', {
        method: req.method, path: req.path, userAgent: req.headers['user-agent']
      });
      console.warn(`🔍 [Path Scan] IP: ${ip} | Path: ${req.path} | RiskScore: ${getRiskScore(ip)}`);
    }
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Catch-all route คืนค่า index.html ให้ React Router จัดการ
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // สำหรับโหมด Development
  app.use((req, res) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    if (SUSPICIOUS_PATHS.some(p => req.path.toLowerCase().includes(p))) {
      addRiskScore(ip, 'PATH_SCAN', {
        method: req.method, path: req.path, userAgent: req.headers['user-agent']
      });
      console.warn(`🔍 [Path Scan] IP: ${ip} | Path: ${req.path} | RiskScore: ${getRiskScore(ip)}`);
    }
    res.status(404).json({ error: 'Not found' });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
