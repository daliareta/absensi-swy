import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');
const JWT_SECRET = process.env.JWT_SECRET || 'nettrack-secret-key';

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('Admin', 'NOC', 'Engineer', 'Teknisi', 'Manager')) NOT NULL,
    area TEXT,
    specialization TEXT
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    check_in_time TEXT,
    check_out_time TEXT,
    location_id INTEGER,
    latitude REAL,
    longitude REAL,
    description TEXT,
    scanned_by INTEGER, -- Admin who scanned the tech
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(location_id) REFERENCES locations(id),
    FOREIGN KEY(scanned_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    problem_type TEXT NOT NULL,
    area TEXT,
    description TEXT,
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) NOT NULL,
    status TEXT CHECK(status IN ('Open', 'On Progress', 'Pending', 'Selesai', 'Cancel')) DEFAULT 'Open',
    assigned_to INTEGER,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(assigned_to) REFERENCES users(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    heading REAL,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Offline',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tracking_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    heading REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    shift_type TEXT CHECK(shift_type IN ('Pagi', 'Siang', 'Malam', 'Off')) NOT NULL,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS timesheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    activity TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migrations: Ensure columns exist if tables were created in previous versions
try { db.exec("ALTER TABLE users ADD COLUMN area TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN specialization TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE tickets ADD COLUMN area TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE attendance ADD COLUMN scanned_by INTEGER;"); } catch (e) {}
try { db.exec("ALTER TABLE tracking ADD COLUMN heading REAL;"); } catch (e) {}

// Seed initial admin user if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@sanwanay.com');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Administrator', 'admin@sanwanay.com', hashedPassword, 'Admin'
  );
  
  // Seed a sample location
  db.prepare('INSERT INTO locations (name, qr_code, latitude, longitude) VALUES (?, ?, ?, ?)').run(
    'Kantor Pusat Jambu Karya', 'LOC-HQ-001', -6.1015, 106.5085
  );

  // Seed Technicians with Areas and Specializations
  const techPass = bcrypt.hashSync('tech123', 10);
  const techs = [
    ['Budi Kemiri', 'tech1@sanwanay.com', 'Desa Kemiri', 'Maintenance'],
    ['Sandi Kemiri', 'tech2@sanwanay.com', 'Desa Lontar', 'Maintenance'],
    ['Agus Jambu', 'tech3@sanwanay.com', 'Desa Jambu Karya', 'Maintenance'],
    ['Dedi Jambu', 'tech4@sanwanay.com', 'Desa Daon', 'Maintenance'],
    ['Iwan Jalur', 'tech5@sanwanay.com', 'All Area', 'Jalur'],
    ['Roni Jalur', 'tech6@sanwanay.com', 'All Area', 'Jalur']
  ];

  techs.forEach(([name, email, area, spec]) => {
    db.prepare('INSERT INTO users (name, email, password, role, area, specialization) VALUES (?, ?, ?, "Teknisi", ?, ?)').run(
      name, email, techPass, area, spec
    );
  });

  // Seed some attendance data
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  db.prepare('INSERT INTO attendance (user_id, date, check_in_time, check_out_time, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)').run(
    2, yesterday, '07:55:00', '17:05:00', -6.1015, 106.5085
  );
  db.prepare('INSERT INTO attendance (user_id, date, check_in_time, latitude, longitude) VALUES (?, ?, ?, ?, ?)').run(
    2, today, '08:02:00', -6.1015, 106.5085
  );
  db.prepare('INSERT INTO attendance (user_id, date, check_in_time, latitude, longitude) VALUES (?, ?, ?, ?, ?)').run(
    3, today, '07:50:00', -6.1015, 106.5085
  );

  // Seed some shifts
  db.prepare('INSERT INTO shifts (user_id, date, shift_type, start_time, end_time) VALUES (?, ?, ?, ?, ?)').run(
    2, today, 'Pagi', '08:00', '17:00'
  );
  db.prepare('INSERT INTO shifts (user_id, date, shift_type, start_time, end_time) VALUES (?, ?, ?, ?, ?)').run(
    3, today, 'Pagi', '08:00', '17:00'
  );
  db.prepare('INSERT INTO shifts (user_id, date, shift_type, start_time, end_time) VALUES (?, ?, ?, ?, ?)').run(
    4, today, 'Siang', '13:00', '22:00'
  );

  // Seed some timesheets
  db.prepare('INSERT INTO timesheets (user_id, date, activity, duration, status) VALUES (?, ?, ?, ?, ?)').run(
    2, yesterday, 'Maintenance jaringan di Desa Kemiri', 120, 'Approved'
  );
  db.prepare('INSERT INTO timesheets (user_id, date, activity, duration, status) VALUES (?, ?, ?, ?, ?)').run(
    2, yesterday, 'Instalasi pelanggan baru', 180, 'Approved'
  );
  db.prepare('INSERT INTO timesheets (user_id, date, activity, duration, status) VALUES (?, ?, ?, ?, ?)').run(
    3, today, 'Pengecekan ODP', 60, 'Pending'
  );
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      const user = db.prepare('SELECT id, role, email, name FROM users WHERE id = ?').get(decoded.id) as any;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, area: user.area, specialization: user.specialization } });
  });

  // Employee Management
  app.get('/api/users', authenticateToken, (req: any, res) => {
    const users = db.prepare('SELECT id, name, email, role, area, specialization FROM users').all();
    res.json(users);
  });

  app.post('/api/users', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, email, password, role, area, specialization } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      db.prepare('INSERT INTO users (name, email, password, role, area, specialization) VALUES (?, ?, ?, ?, ?, ?)').run(
        name, email, hashedPassword, role, area, specialization
      );
      res.json({ message: 'User created' });
    } catch (e) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
    const id = req.params.id;
    
    try {
      const transaction = db.transaction(() => {
        // Delete related records first to avoid foreign key constraints
        db.prepare('DELETE FROM attendance WHERE user_id = ? OR scanned_by = ?').run(id, id);
        db.prepare('DELETE FROM tickets WHERE assigned_to = ? OR created_by = ?').run(id, id);
        db.prepare('DELETE FROM tracking WHERE user_id = ?').run(id);
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
      });
      transaction();
      res.json({ message: 'User deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Gagal menghapus user karena data terkait masih ada' });
    }
  });

  // Admin/NOC scanning technician QR
  app.post('/api/attendance/scan', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'NOC') return res.status(403).json({ error: 'Only Admin or NOC can scan' });
    const { tech_id, type, latitude, longitude } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const tech = db.prepare('SELECT id FROM users WHERE id = ?').get(tech_id);
    if (!tech) return res.status(404).json({ error: 'Teknisi tidak ditemukan (ID tidak valid)' });

    try {
      if (type === 'Masuk') {
        db.prepare(`
          INSERT INTO attendance (user_id, date, check_in_time, latitude, longitude, scanned_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(tech_id, today, new Date().toLocaleTimeString(), latitude, longitude, req.user.id);

        db.prepare(`
          INSERT OR REPLACE INTO tracking (user_id, latitude, longitude, status, last_update)
          VALUES (?, ?, ?, 'Aktif', CURRENT_TIMESTAMP)
        `).run(tech_id, latitude, longitude);
      } else {
        db.prepare(`
          UPDATE attendance 
          SET check_out_time = ? 
          WHERE user_id = ? AND date = ? AND check_out_time IS NULL
        `).run(new Date().toLocaleTimeString(), tech_id, today);

        db.prepare(`
          UPDATE tracking SET status = 'Offline', last_update = CURRENT_TIMESTAMP WHERE user_id = ?
        `).run(tech_id);
      }
      res.json({ message: 'Attendance recorded' });
    } catch (error) {
      console.error('Scan error:', error);
      res.status(500).json({ error: 'Gagal mencatat absensi' });
    }
  });

  // Attendance
  app.get('/api/attendance', authenticateToken, (req: any, res) => {
    let attendance;
    if (req.user.role === 'Admin' || req.user.role === 'NOC' || req.user.role === 'Manager') {
      attendance = db.prepare(`
        SELECT a.*, u.name as user_name, l.name as location_name 
        FROM attendance a 
        JOIN users u ON a.user_id = u.id 
        LEFT JOIN locations l ON a.location_id = l.id
        ORDER BY a.id DESC
      `).all();
    } else {
      attendance = db.prepare(`
        SELECT a.*, u.name as user_name, l.name as location_name 
        FROM attendance a 
        JOIN users u ON a.user_id = u.id 
        LEFT JOIN locations l ON a.location_id = l.id
        WHERE a.user_id = ?
        ORDER BY a.id DESC
      `).all(req.user.id);
    }
    res.json(attendance);
  });

  app.post('/api/attendance/check-in', authenticateToken, (req: any, res) => {
    const { qr_code, latitude, longitude } = req.body;
    const location = db.prepare('SELECT * FROM locations WHERE qr_code = ?').get(qr_code) as any;

    if (!location) return res.status(400).json({ error: 'QR Code tidak valid' });

    // Simple distance check (approx 100m)
    // In a real app, use Haversine formula
    const dist = Math.sqrt(Math.pow(location.latitude - latitude, 2) + Math.pow(location.longitude - longitude, 2));
    if (dist > 1000) { // Disabled for testing
      return res.status(400).json({ error: 'Anda terlalu jauh dari lokasi kantor' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(req.user.id, today);

    if (existing) return res.status(400).json({ error: 'Anda sudah absen hari ini' });

    db.prepare(`
      INSERT INTO attendance (user_id, date, check_in_time, location_id, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, today, new Date().toLocaleTimeString(), location.id, latitude, longitude);

    // Update tracking status
    db.prepare(`
      INSERT OR REPLACE INTO tracking (user_id, latitude, longitude, status, last_update)
      VALUES (?, ?, ?, 'On Site', CURRENT_TIMESTAMP)
    `).run(req.user.id, latitude, longitude);

    res.json({ message: 'Absen masuk berhasil' });
  });

  app.post('/api/attendance/check-out', authenticateToken, (req: any, res) => {
    const { description, latitude, longitude } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const result = db.prepare(`
      UPDATE attendance 
      SET check_out_time = ?, description = ? 
      WHERE user_id = ? AND date = ? AND check_out_time IS NULL
    `).run(new Date().toLocaleTimeString(), description, req.user.id, today);

    if (result.changes === 0) return res.status(400).json({ error: 'Gagal absen pulang. Pastikan sudah absen masuk.' });

    // Update tracking status
    db.prepare(`
      UPDATE tracking SET status = 'Offline', last_update = CURRENT_TIMESTAMP WHERE user_id = ?
    `).run(req.user.id);

    res.json({ message: 'Absen pulang berhasil' });
  });

  // Tickets
  app.get('/api/tickets', authenticateToken, (req: any, res) => {
    let tickets;
    if (req.user.role === 'Teknisi') {
      tickets = db.prepare(`
        SELECT t.*, u.name as assigned_name 
        FROM tickets t 
        LEFT JOIN users u ON t.assigned_to = u.id 
        WHERE t.assigned_to = ? OR t.assigned_to IS NULL
        ORDER BY t.id DESC
      `).all(req.user.id);
    } else {
      tickets = db.prepare(`
        SELECT t.*, u.name as assigned_name 
        FROM tickets t 
        LEFT JOIN users u ON t.assigned_to = u.id 
        ORDER BY t.id DESC
      `).all();
    }
    res.json(tickets);
  });

  app.post('/api/tickets', authenticateToken, (req: any, res) => {
    const { customer_name, customer_id, address, phone, problem_type, area, description, priority, assigned_to } = req.body;
    const assignedToValue = assigned_to || null;
    db.prepare(`
      INSERT INTO tickets (customer_name, customer_id, address, phone, problem_type, area, description, priority, assigned_to, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(customer_name, customer_id, address, phone, problem_type, area, description, priority, assignedToValue, req.user.id);
    res.json({ message: 'Tiket berhasil dibuat' });
  });

  app.patch('/api/tickets/:id', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    const completed_at = status === 'Selesai' ? new Date().toISOString() : null;
    db.prepare('UPDATE tickets SET status = ?, completed_at = ? WHERE id = ?').run(status, completed_at, req.params.id);
    res.json({ message: 'Status tiket diperbarui' });
  });

  // Tracking
  app.get('/api/tracking', authenticateToken, (req, res) => {
    const tracking = db.prepare(`
      SELECT t.*, u.name as user_name, u.role 
      FROM tracking t 
      JOIN users u ON t.user_id = u.id
    `).all();
    res.json(tracking);
  });

  app.post('/api/tracking/update', authenticateToken, (req: any, res) => {
    const { latitude, longitude, heading } = req.body;
    
    // Update current position
    db.prepare(`
      INSERT OR REPLACE INTO tracking (user_id, latitude, longitude, heading, status, last_update)
      VALUES (?, ?, ?, ?, 'Aktif', CURRENT_TIMESTAMP)
    `).run(req.user.id, latitude, longitude, heading);

    // Log to history for performance review
    db.prepare(`
      INSERT INTO tracking_history (user_id, latitude, longitude, heading)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, latitude, longitude, heading);

    res.json({ message: 'Lokasi diperbarui' });
  });

  // API to get technician movement history
  app.get('/api/tracking/history/:userId', authenticateToken, (req, res) => {
    const history = db.prepare(`
      SELECT * FROM tracking_history 
      WHERE user_id = ? AND timestamp >= date('now', '-1 day')
      ORDER BY timestamp ASC
    `).all(req.params.userId);
    res.json(history);
  });

  // Users (for assignment)
  app.get('/api/users/technicians', authenticateToken, (req, res) => {
    const techs = db.prepare("SELECT id, name FROM users WHERE role IN ('Teknisi', 'Engineer')").all();
    res.json(techs);
  });

  // Shifts
  app.get('/api/shifts', authenticateToken, (req: any, res) => {
    let shifts;
    if (req.user.role === 'Admin' || req.user.role === 'NOC' || req.user.role === 'Manager') {
      shifts = db.prepare(`
        SELECT s.*, u.name as user_name 
        FROM shifts s 
        JOIN users u ON s.user_id = u.id 
        ORDER BY s.date DESC, s.id DESC
      `).all();
    } else {
      shifts = db.prepare(`
        SELECT s.*, u.name as user_name 
        FROM shifts s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.user_id = ?
        ORDER BY s.date DESC, s.id DESC
      `).all(req.user.id);
    }
    res.json(shifts);
  });

  app.post('/api/shifts', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { user_id, date, shift_type, start_time, end_time } = req.body;
    try {
      db.prepare(`
        INSERT INTO shifts (user_id, date, shift_type, start_time, end_time)
        VALUES (?, ?, ?, ?, ?)
      `).run(user_id, date, shift_type, start_time, end_time);
      res.json({ message: 'Shift created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create shift' });
    }
  });

  app.delete('/api/shifts/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      db.prepare('DELETE FROM shifts WHERE id = ?').run(req.params.id);
      res.json({ message: 'Shift deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete shift' });
    }
  });

  // Timesheets
  app.get('/api/timesheets', authenticateToken, (req: any, res) => {
    let timesheets;
    if (req.user.role === 'Admin' || req.user.role === 'NOC' || req.user.role === 'Manager') {
      timesheets = db.prepare(`
        SELECT t.*, u.name as user_name 
        FROM timesheets t 
        JOIN users u ON t.user_id = u.id 
        ORDER BY t.date DESC, t.id DESC
      `).all();
    } else {
      timesheets = db.prepare(`
        SELECT t.*, u.name as user_name 
        FROM timesheets t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.user_id = ?
        ORDER BY t.date DESC, t.id DESC
      `).all(req.user.id);
    }
    res.json(timesheets);
  });

  app.post('/api/timesheets', authenticateToken, (req: any, res) => {
    const { date, activity, duration } = req.body;
    try {
      db.prepare(`
        INSERT INTO timesheets (user_id, date, activity, duration)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, date, activity, duration);
      res.json({ message: 'Timesheet submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit timesheet' });
    }
  });

  app.patch('/api/timesheets/:id/status', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { status } = req.body;
    try {
      db.prepare('UPDATE timesheets SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ message: 'Timesheet status updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update timesheet status' });
    }
  });

  // Stats
  app.get('/api/stats', authenticateToken, (req, res) => {
    const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as any;
    const openTickets = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'Open'").get() as any;
    const activeTechs = db.prepare("SELECT COUNT(*) as count FROM tracking WHERE status != 'Offline'").get() as any;
    const todayAttendance = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ?").get(new Date().toISOString().split('T')[0]) as any;

    res.json({
      totalTickets: totalTickets.count,
      openTickets: openTickets.count,
      activeTechs: activeTechs.count,
      todayAttendance: todayAttendance.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
