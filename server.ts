import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-jwt-key-for-coaching-hub';

app.use(express.json());

// --- Setup Razorpay ---
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// --- Setup Supabase vs SQLite ---
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseEnabled = Boolean(supabaseUrl && supabaseKey);
let supabase: any = null;
let db: any = null;

// Initialization function to ensure a Master Admin exists
async function ensureMasterAdmin() {
  const masterUsername = 'admin';
  const masterPassword = 'admin123';
  const role = 'MASTER';

  if (isSupabaseEnabled) {
    try {
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('id, password_hash')
        .eq('username', masterUsername)
        .maybeSingle();

      const hash = bcrypt.hashSync(masterPassword, 10);

      if (!existingUser) {
        console.log('👷 Supabase: No Master Admin found. Creating default...');
        const { error } = await supabase
          .from('app_users')
          .insert({ username: masterUsername, password_hash: hash, role });
        
        if (error) console.error('❌ Failed to create default master in Supabase:', error.message);
        else console.log('✅ Default Master Admin created in Supabase -> [admin : admin123]');
      } else {
        // Double check if the password is valid for the 'admin' user
        if (!bcrypt.compareSync(masterPassword, existingUser.password_hash)) {
          console.log('📝 Supabase: Default admin found but password hash is legacy/invalid. Updating...');
          const { error } = await supabase
            .from('app_users')
            .update({ password_hash: hash })
            .eq('id', existingUser.id);
          
          if (error) console.error('❌ Failed to update admin password:', error.message);
          else console.log('✅ Default Master Admin password updated to "admin123"');
        }
      }
    } catch (err) {
      console.error('❌ Supabase initialization error:', err);
    }
  } else {
    const existingMaster = db.prepare('SELECT id, password FROM users WHERE username = ?').get(masterUsername);
    const masterHash = bcrypt.hashSync(masterPassword, 10);
    
    if (!existingMaster) {
      db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(masterUsername, masterHash, 'MASTER');
      console.log('✅ Default Master Admin created in SQLite -> [admin : admin123]');
    } else if (!bcrypt.compareSync(masterPassword, existingMaster.password)) {
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(masterHash, existingMaster.id);
      console.log('✅ Default Master Admin password updated in SQLite -> [admin : admin123]');
    }
  }
}

if (isSupabaseEnabled) {
  console.log('🔗 Supabase configured. Using PostgreSQL database.');
  supabase = createClient(supabaseUrl!, supabaseKey!);
  ensureMasterAdmin();
} else {
  console.log('⚠️ Supabase keys missing. Falling back to local SQLite.');
  db = new Database('platform.db');
  db.pragma('journal_mode = WAL');

  // Define Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('MASTER', 'SUB_ADMIN'))
    );
    CREATE TABLE IF NOT EXISTS institute_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT (datetime('now')) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS institutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      address TEXT,
      location TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      whatsapp_number TEXT,
      latitude REAL,
      longitude REAL,
      is_featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES institute_categories(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id INTEGER NOT NULL,
      category_id INTEGER,
      teacher_name TEXT NOT NULL,
      teacher_image TEXT,
      subject TEXT NOT NULL,
      batch_name TEXT NOT NULL,
      batch_timing TEXT,
      batch_duration TEXT,
      start_date TEXT,
      fee_structure TEXT,
      status TEXT DEFAULT 'running',
      mode TEXT DEFAULT 'Offline',
      medium TEXT,
      board_target TEXT,
      total_seats INTEGER,
      available_seats INTEGER,
      syllabus_pdf TEXT,
      teacher_bio TEXT,
      curriculum TEXT,
      FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT DEFAULT 'announcement',
      FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      size TEXT,
      format TEXT DEFAULT 'PDF',
      url TEXT,
      FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS faculty (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      image_url TEXT,
      qualifications TEXT,
      bio TEXT,
      experience TEXT,
      FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS batch_faculty (
      batch_id INTEGER NOT NULL,
      faculty_id INTEGER NOT NULL,
      PRIMARY KEY (batch_id, faculty_id),
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      institute_id TEXT,
      batch_id TEXT,
      type TEXT DEFAULT 'INSTITUTE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, institute_id, batch_id)
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      batch_id TEXT NOT NULL,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      amount REAL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);


  // Migrations for existing DBs
  try { db.exec('ALTER TABLE batches ADD COLUMN next_class_time TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN zoom_link TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE institutes ADD COLUMN whatsapp_number TEXT'); } catch(e) {}
  try { db.exec("ALTER TABLE batches ADD COLUMN status TEXT DEFAULT 'running'"); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN medium TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN board_target TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN total_seats INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN available_seats INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN syllabus_pdf TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN teacher_bio TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN curriculum TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE batches ADD COLUMN category_id INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE institutes ADD COLUMN latitude REAL'); } catch(e) {}
  try { db.exec('ALTER TABLE institutes ADD COLUMN longitude REAL'); } catch(e) {}
  try { db.exec('ALTER TABLE faculty ADD COLUMN qualifications TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE faculty ADD COLUMN bio TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE faculty ADD COLUMN experience TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE institutes ADD COLUMN is_featured INTEGER DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE institutes ADD COLUMN rating REAL DEFAULT 0'); } catch(e) {}
  try { db.exec('ALTER TABLE institutes ADD COLUMN category_id INTEGER REFERENCES institute_categories(id) ON DELETE SET NULL'); } catch(e) {}
  try { db.exec('CREATE TABLE IF NOT EXISTS institute_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'); } catch(e) {}
  try { db.exec('CREATE TABLE IF NOT EXISTS platform_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, keywords TEXT)'); } catch(e) {}
  try { db.exec("INSERT OR IGNORE INTO platform_settings (id, title, description, keywords) VALUES (1, 'VidyaNation', 'A premium multi-tenant platform for students to explore coaching institutes.', 'education, coaching, institutes, learning')"); } catch(e) {}
  try { db.exec('CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, user_id TEXT, username TEXT, details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'); } catch(e) {}
  
  // Seed some categories if empty
  try {
    const cats = db.prepare('SELECT count(*) as count FROM institute_categories').get() as any;
    if (cats.count === 0) {
      const insert = db.prepare('INSERT INTO institute_categories (name) VALUES (?)');
      ['Coaching', 'School', 'College', 'Computer Center'].forEach(c => insert.run(c));
    }
  } catch(e) {}

  ensureMasterAdmin();
}

// Authentication Middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('⚠️ No token provided in request');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  jwt.verify(token, SECRET_KEY, async (err, user) => {
    if (!err && user) {
      (req as any).user = user;
      return next();
    }

    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (data && data.user && !error) {
          (req as any).user = { id: data.user.id, email: data.user.email, role: 'STUDENT' };
          return next();
        }
      } catch (e) {
        console.error('Supabase token verification failed', e);
      }
    }

    console.error('❌ JWT Verify Error:', err?.message || 'Invalid token');
    res.status(403).json({ error: 'Forbidden: Invalid token' });
  });
};

const requireRole = (role: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (user?.role !== role) {
      console.warn(`⚠️ Role mismatch: Expected ${role}, got ${user?.role || 'none'}`);
      res.status(403).json({ error: `Forbidden: Insufficient privileges. Expected ${role}` });
      return;
    }
    next();
  };
};

// --- AUDIT LOGS ---
async function logAudit(action: string, user_id: string | number, username: string, details: string) {
  try {
    if (isSupabaseEnabled) {
      await supabase.from('audit_logs').insert({ action, user_id: String(user_id), username, details });
    } else {
      db.prepare('INSERT INTO audit_logs (action, user_id, username, details) VALUES (?, ?, ?, ?)').run(String(user_id), username, details);
    }
  } catch(e) {
    console.error('Audit log failed', e);
  }
}

app.get('/api/master/audit-logs', authenticateToken, requireRole('MASTER'), async (req, res) => {
  try {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) return res.status(500).json({ error: error.message });
      res.json(data || []);
    } else {
      res.json(db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100').all());
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/master/stats', authenticateToken, requireRole('MASTER'), async (req, res) => {
  try {
    const start = Date.now();
    let rowCount = 0;
    
    if (isSupabaseEnabled) {
      const tables = ['app_users', 'institutes', 'batches', 'enrollments', 'audit_logs'];
      for (const table of tables) {
        try {
          const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
          if (!error) rowCount += (count || 0);
        } catch (e) {}
      }
    } else {
      const tables = ['users', 'institutes', 'batches', 'enrollments', 'audit_logs'];
      for (const table of tables) {
        try {
          const res = db.prepare(`SELECT count(*) as count FROM ${table}`).get() as any;
          rowCount += res.count;
        } catch (e) {}
      }
    }
    
    const latency = Date.now() - start;
    
    res.json({
      database_rows: rowCount,
      database_limit: 10000,
      media_assets_gb: 1.2,
      status: 'Online',
      latency: latency
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* --- API ROUTES --- */

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  console.log(`🔑 Login attempt for: ${cleanUsername}`);
  
  let user;

  try {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('app_users').select('*').eq('username', cleanUsername).maybeSingle();
      if (error) {
        console.error('❌ Supabase login query error:', error.message);
      }
      if (data) {
        user = { id: data.id, username: data.username, password: data.password_hash, role: data.role };
      }
    } else {
      user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername) as any;
    }
    
    if (user && bcrypt.compareSync(cleanPassword, user.password)) {
      console.log(`✅ Login successful for: ${cleanUsername} (${user.role})`);
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
      await logAudit('LOGIN', user.id, user.username, `Successful login by ${user.role}`);
      res.json({ token, role: user.role });
    } else {
      console.log(`❌ Login failed for: ${cleanUsername} - ${!user ? 'User not found' : 'Invalid password'}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err: any) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/master/institutes', authenticateToken, requireRole('MASTER'), async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase.from('institutes')
        .select('*, app_users!inner(username), institute_categories(name)');
      
      if (error) {
        console.error('❌ Supabase Master Institutes Fetch Error:', error);
        // Fallback: Try without categories if the relationship is missing
        if (error.message.includes('relationship') || error.message.includes('institute_categories')) {
          console.warn('⚠️ Retrying without categories join...');
          const { data: fallbackData, error: fallbackError } = await supabase.from('institutes')
            .select('*, app_users!inner(username)');
          
          if (fallbackError) throw fallbackError;
          const formatted = (fallbackData || []).map((d: any) => ({ 
            ...d, 
            username: d.app_users?.username,
            category_name: 'Unknown' 
          }));
          return res.json(formatted);
        }
        return res.status(500).json({ error: error.message });
      }

      // Flatten result to match frontend expectation
      const formatted = (data || []).map((d: any) => ({ 
        ...d, 
        username: d.app_users?.username,
        category_name: d.institute_categories?.name || 'Uncategorized'
      }));
      res.json(formatted);
    } catch (err: any) {
      console.error('❌ System error during master fetch:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    const institutes = db.prepare(`
      SELECT institutes.*, users.username, institute_categories.name as category_name 
      FROM institutes 
      JOIN users ON institutes.user_id = users.id
      LEFT JOIN institute_categories ON institutes.category_id = institute_categories.id
    `).all();
    res.json(institutes);
  }
});

app.post('/api/master/institutes', authenticateToken, requireRole('MASTER'), async (req: any, res) => {
  const { name, logo, category_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Institute name is required' });

  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const username = `${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}${uniqueId}`;
  const password = Math.random().toString(36).slice(-8);
  const hash = bcrypt.hashSync(password, 10);

  if (isSupabaseEnabled) {
    try {
      // 1. Create sub-admin
      const { data: userData, error: userError } = await supabase.from('app_users')
        .insert({ username: username, password_hash: hash, role: 'SUB_ADMIN' }).select().maybeSingle();
      
      if (userError) {
        console.error('❌ Supabase creation error:', userError);
        return res.status(500).json({ error: userError.message });
      }
      
      if (!userData) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      // 2. Create institute
      const { data: instData, error: instError } = await supabase.from('institutes')
        .insert({ user_id: userData.id, name, logo: logo || '', category_id: category_id || null }).select().maybeSingle();
      
      if (instError) {
        console.error('❌ Supabase institute creation error:', instError);
        return res.status(500).json({ error: instError.message });
      }

      await logAudit('CREATE_INSTITUTE', req.user.id, req.user.username, `Created institute: ${name}`);
      res.json({ message: 'Institute generated successfully', credentials: { id: instData.id, username, password } });
    } catch (err: any) {
      console.error('❌ System error during institute creation:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    const tx = db.transaction(() => {
      const userRes = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hash, 'SUB_ADMIN');
      const userId = userRes.lastInsertRowid;
      const instRes = db.prepare('INSERT INTO institutes (user_id, name, logo, category_id) VALUES (?, ?, ?, ?)').run(userId, name, logo || '', category_id || null);
      return { id: instRes.lastInsertRowid, username, password };
    });
    try {
      const credentials = tx();
      await logAudit('CREATE_INSTITUTE', req.user.id, req.user.username, `Created institute: ${name}`);
      res.json({ message: 'Institute generated successfully', credentials });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/master/institutes/:id', authenticateToken, requireRole('MASTER'), async (req: any, res) => {
  const instId = req.params.id;
  const { name, logo, is_featured, category_id } = req.body;
  
  if (isSupabaseEnabled) {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (category_id !== undefined) updateData.category_id = category_id;

    const { error } = await supabase.from('institutes').update(updateData).eq('id', instId);
    if (error) return res.status(500).json({ error: error.message });
    await logAudit('UPDATE_INSTITUTE', req.user.id, req.user.username, `Updated institute ${instId}`);
    res.json({ success: true });
  } else {
    try {
      if (is_featured !== undefined) {
        db.prepare('UPDATE institutes SET is_featured = ? WHERE id = ?').run(is_featured ? 1 : 0, instId);
      }
      if (name !== undefined && logo !== undefined) {
        db.prepare('UPDATE institutes SET name = ?, logo = ?, category_id = ? WHERE id = ?').run(name, logo, category_id || null, instId);
      } else if (category_id !== undefined) {
        db.prepare('UPDATE institutes SET category_id = ? WHERE id = ?').run(category_id || null, instId);
      }
      await logAudit('UPDATE_INSTITUTE', req.user.id, req.user.username, `Updated institute ${instId}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/master/institutes/:id', authenticateToken, requireRole('MASTER'), async (req: any, res) => {
  const instId = req.params.id;
  
  if (isSupabaseEnabled) {
    // Need to find the user_id first to delete from app_users as well
    const { data: inst } = await supabase.from('institutes').select('name, user_id').eq('id', instId).single();
    if (inst) {
      // CASCADE should handle institutes deletion if app_users is deleted, but let's be explicit if needed
      // Actually, standard setup usually cascades from user to institute
      const { error } = await supabase.from('app_users').delete().eq('id', inst.user_id);
      if (error) return res.status(500).json({ error: error.message });
      await logAudit('DELETE_INSTITUTE', req.user.id, req.user.username, `Deleted institute: ${inst.name}`);
    }
    res.json({ success: true });
  } else {
    try {
      const inst = db.prepare('SELECT name, user_id FROM institutes WHERE id = ?').get(instId) as any;
      if (inst) {
        db.prepare('DELETE FROM users WHERE id = ?').run(inst.user_id);
        await logAudit('DELETE_INSTITUTE', req.user.id, req.user.username, `Deleted institute: ${inst.name}`);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

// --- INSTITUTE CATEGORIES (MASTER ONLY) ---
app.get('/api/master/institute-categories', authenticateToken, requireRole('MASTER'), async (req, res) => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('institute_categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    res.json(db.prepare('SELECT * FROM institute_categories ORDER BY name').all());
  }
});

app.post('/api/master/institute-categories', authenticateToken, requireRole('MASTER'), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('institute_categories').insert({ name }).select().maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    try {
      const result = db.prepare('INSERT INTO institute_categories (name) VALUES (?)').run(name);
      res.json({ id: result.lastInsertRowid, name });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/master/institute-categories/:id', authenticateToken, requireRole('MASTER'), async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  if (isSupabaseEnabled) {
    const { error } = await supabase.from('institute_categories').update({ name }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    try {
      db.prepare('UPDATE institute_categories SET name = ? WHERE id = ?').run(name, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/master/institute-categories/:id', authenticateToken, requireRole('MASTER'), async (req, res) => {
  const { id } = req.params;

  if (isSupabaseEnabled) {
    const { error } = await supabase.from('institute_categories').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    try {
      db.prepare('DELETE FROM institute_categories WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

// --- PUBLIC (Home) ---
app.get('/api/public/seo-settings', async (req, res) => {
  try {
    if (isSupabaseEnabled) {
      const { data } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle();
      res.json(data || { title: 'VidyaNation', description: '', keywords: '' });
    } else {
      const data = db.prepare('SELECT * FROM platform_settings WHERE id = 1').get();
      res.json(data || { title: 'VidyaNation', description: '', keywords: '' });
    }
  } catch (err: any) {
    res.json({ title: 'VidyaNation', description: '', keywords: '' });
  }
});

app.get('/api/public/institute-categories', async (req, res) => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('institute_categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } else {
    res.json(db.prepare('SELECT * FROM institute_categories ORDER BY name').all());
  }
});

app.get('/api/institute/profile', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('institutes').select('*').eq('user_id', userId).single();
    if (error) return res.status(404).json({ error: 'Not found' });
    res.json(data || null);
  } else {
    res.json(db.prepare('SELECT * FROM institutes WHERE user_id = ?').get(userId));
  }
});

app.put('/api/institute/profile', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const { name, description, logo, address, location, phone, email, website, whatsapp_number, latitude, longitude } = req.body;
  
  if (isSupabaseEnabled) {
    // Only update allowed fields to avoid metadata conflicts
    const updateData: any = { name, description, logo, address, location, phone, email, website, whatsapp_number, latitude, longitude };
    
    const { error } = await supabase.from('institutes')
      .update(updateData)
      .eq('user_id', userId);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    try {
      db.prepare(`
        UPDATE institutes SET 
          name = ?, description = ?, logo = ?, address = ?, location = ?, phone = ?, email = ?, website = ?, whatsapp_number = ?, latitude = ?, longitude = ?
        WHERE user_id = ?
      `).run(name, description, logo, address, location, phone, email, website, whatsapp_number, latitude, longitude, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.get('/api/institute/enrollments', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  if (isSupabaseEnabled) {
    try {
      const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
      if (!inst) return res.status(404).json({ error: 'Institute not found' });
      
      let { data, error } = await supabase
        .from('enrollments')
        .select(`
          created_at, 
          razorpay_payment_id, 
          student_id,
          amount,
          batches!inner (batch_name, institute_id, fee_structure)
        `)
        .eq('batches.institute_id', inst.id)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error && (error.code === 'PGRST204' || error.code === '42703')) {
        // Fallback if amount column doesn't exist
        const fallbackQuery = await supabase
          .from('enrollments')
          .select(`
            created_at, 
            razorpay_payment_id, 
            student_id,
            batches!inner (batch_name, institute_id, fee_structure)
          `)
          .eq('batches.institute_id', inst.id)
          .order('created_at', { ascending: false })
          .limit(200);
        data = fallbackQuery.data;
        error = fallbackQuery.error;
      }
      
      if (error) {
        console.error('Supabase fetch enrollments error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Fetch student profiles manually since foreign key relations are nested via auth.users
      const studentIds = [...new Set((data || []).map(e => e.student_id))].filter(Boolean);
      let profilesMap: Record<string, any> = {};
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('id, full_name, phone_number, photo_url, current_class, education_level')
          .in('id', studentIds);
        
        if (profiles) {
          profiles.forEach((p: any) => {
            profilesMap[p.id] = p;
          });
        }
      }
      
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        student_profiles: profilesMap[item.student_id] || { full_name: 'Unknown User' },
        batches: {
          ...item.batches,
          name: item.batches?.batch_name || 'Unnamed Batch'
        }
      }));
      res.json(formattedData);
    } catch (err: any) {
      console.error('System error:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    // SQLite implementation
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    if (!institute) return res.status(404).json({ error: 'Institute not found' });
    
    let localData;
    try {
      localData = db.prepare(`
        SELECT e.id, e.created_at, e.razorpay_payment_id, e.student_id, e.amount, b.batch_name as name
        FROM enrollments e
        JOIN batches b ON e.batch_id = b.id
        WHERE b.institute_id = ?
        ORDER BY e.created_at DESC
        LIMIT 200
      `).all(institute.id);
    } catch (e: any) {
      if (e.message && e.message.includes('has no column named amount')) {
        localData = db.prepare(`
          SELECT e.id, e.created_at, e.razorpay_payment_id, e.student_id, b.batch_name as name
          FROM enrollments e
          JOIN batches b ON e.batch_id = b.id
          WHERE b.institute_id = ?
          ORDER BY e.created_at DESC
          LIMIT 200
        `).all(institute.id);
      } else {
        throw e;
      }
    }
    
    // In local sqlite we don't have student profiles
    const formatted = localData.map((d: any) => ({
      ...d,
      created_at: d.created_at,
      razorpay_payment_id: d.razorpay_payment_id,
      amount: d.amount,
      student_profiles: { full_name: 'Local User', phone_number: 'N/A' },
      batches: { name: d.name }
    }));
    res.json(formatted);
  }
});

app.get('/api/master/enrollments', authenticateToken, requireRole('MASTER'), async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      let { data, error } = await supabase
        .from('enrollments')
        .select(`
          created_at, 
          razorpay_payment_id,
          student_id,
          amount,
          batches:batch_id (batch_name, institute_id, fee_structure, institutes (name))
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error && (error.code === 'PGRST204' || error.code === '42703')) {
        const fallbackQuery = await supabase
          .from('enrollments')
          .select(`
            created_at, 
            razorpay_payment_id,
            student_id,
            batches:batch_id (batch_name, institute_id, fee_structure, institutes (name))
          `)
          .order('created_at', { ascending: false })
          .limit(200);
        data = fallbackQuery.data;
        error = fallbackQuery.error;
      }
      
      if (error) {
        console.error('Supabase fetch enrollments error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Fetch student profiles manually
      const studentIds = [...new Set((data || []).map(e => e.student_id))].filter(Boolean);
      let profilesMap: Record<string, any> = {};
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('id, full_name, phone_number, photo_url, current_class, education_level')
          .in('id', studentIds);
        
        if (profiles) {
          profiles.forEach((p: any) => {
            profilesMap[p.id] = p;
          });
        }
      }
      
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        student_profiles: profilesMap[item.student_id] || { full_name: 'Unknown User' },
        batches: {
          ...item.batches,
          name: item.batches?.batch_name || 'Unnamed Batch'
        }
      }));
      res.json(formattedData);
    } catch (err: any) {
      console.error('System error:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    let localData;
    try {
      localData = db.prepare(`
        SELECT e.id, e.created_at, e.razorpay_payment_id, e.amount, e.student_id, b.batch_name as batch_name, i.name as institute_name
        FROM enrollments e
        JOIN batches b ON e.batch_id = b.id
        JOIN institutes i ON b.institute_id = i.id
        ORDER BY e.created_at DESC
        LIMIT 200
      `).all();
    } catch (e: any) {
      if (e.message && e.message.includes('has no column named amount')) {
        localData = db.prepare(`
          SELECT e.id, e.created_at, e.razorpay_payment_id, e.student_id, b.batch_name as batch_name, i.name as institute_name
          FROM enrollments e
          JOIN batches b ON e.batch_id = b.id
          JOIN institutes i ON b.institute_id = i.id
          ORDER BY e.created_at DESC
          LIMIT 200
        `).all();
      } else {
        throw e;
      }
    }
    
    const formatted = localData.map((d: any) => ({
      ...d,
      created_at: d.created_at,
      razorpay_payment_id: d.razorpay_payment_id,
      amount: d.amount,
      student_profiles: { full_name: 'Local User', phone_number: 'N/A' },
      batches: { 
        name: d.batch_name,
        institutes: { name: d.institute_name }
      }
    }));
    res.json(formatted);
  }
});

app.get('/api/institute/batches', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    if (!inst) return res.status(404).json({ error: 'Institute not found' });
    const { data: batches } = await supabase.from('batches').select('*').eq('institute_id', inst.id);
    res.json(batches || []);
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    if (!institute) return res.status(404).json({ error: 'Institute not found' });
    res.json(db.prepare('SELECT * FROM batches WHERE institute_id = ?').all(institute.id));
  }
});

app.post('/api/institute/batches', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const { category_id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure, status, mode, medium, board_target, total_seats, available_seats, syllabus_pdf, teacher_bio, curriculum, faculty_ids } = req.body;
  
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data: batch, error } = await supabase.from('batches').insert({
      institute_id: inst.id, category_id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure, status, mode, medium, board_target, total_seats, available_seats, syllabus_pdf, teacher_bio, curriculum: typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum)
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // Add faculty relationships
    if (faculty_ids && faculty_ids.length > 0) {
      const mappings = faculty_ids.map((fid: any) => ({ batch_id: batch.id, faculty_id: fid }));
      await supabase.from('batch_faculty').insert(mappings);
    }

    res.json({ success: true, id: batch.id });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    try {
      const result = db.prepare(`
        INSERT INTO batches (institute_id, category_id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure, status, mode, medium, board_target, total_seats, available_seats, syllabus_pdf, teacher_bio, curriculum)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(institute.id, category_id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure, status || 'running', mode || 'Offline', medium, board_target, total_seats, available_seats, syllabus_pdf, teacher_bio, typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum));
      
      const batchId = result.lastInsertRowid;
      
      // Add faculty relationships
      if (faculty_ids && faculty_ids.length > 0) {
        const insertFaculty = db.prepare('INSERT INTO batch_faculty (batch_id, faculty_id) VALUES (?, ?)');
        const insertMany = db.transaction((ids) => {
          for (const fid of ids) insertFaculty.run(batchId, fid);
        });
        insertMany(faculty_ids);
      }
      
      res.json({ success: true, id: batchId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.delete('/api/institute/batches/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const batchId = req.params.id;
  
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    await supabase.from('batches').delete().eq('id', batchId).eq('institute_id', inst.id);
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('DELETE FROM batches WHERE id = ? AND institute_id = ?').run(batchId, institute.id);
    res.json({ success: true });
  }
});

app.put('/api/institute/batches/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const batchId = req.params.id;
  const { faculty_ids, curriculum, ...otherUpdates } = req.body;
  
  const allowedFields = [
    'category_id', 'teacher_name', 'teacher_image', 'subject', 'batch_name', 
    'batch_timing', 'batch_duration', 'start_date', 'fee_structure', 'status', 
    'mode', 'medium', 'board_target', 'total_seats', 'available_seats', 
    'syllabus_pdf', 'teacher_bio'
  ];
  
  const updates: any = {};
  for (const field of allowedFields) {
    if (otherUpdates[field] !== undefined) {
      updates[field] = otherUpdates[field];
    }
  }

  if (curriculum) {
    updates.curriculum = typeof curriculum === 'string' ? curriculum : JSON.stringify(curriculum);
  }

  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    
    // Update main batch info
    const { error } = await supabase.from('batches')
      .update(updates)
      .eq('id', batchId)
      .eq('institute_id', inst.id);
    if (error) return res.status(500).json({ error: error.message });

    // Update faculty relations if provided
    if (faculty_ids) {
      await supabase.from('batch_faculty').delete().eq('batch_id', batchId);
      if (faculty_ids.length > 0) {
        const mappings = faculty_ids.map((fid: any) => ({ batch_id: batchId, faculty_id: fid }));
        await supabase.from('batch_faculty').insert(mappings);
      }
    }

    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    
    // Begin transaction for local DB
    const transaction = db.transaction(() => {
      // Update batch columns
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        db.prepare(`UPDATE batches SET ${setClause} WHERE id = ? AND institute_id = ?`).run(...values, batchId, institute.id);
      }

      // Update faculty relations
      if (faculty_ids) {
        db.prepare('DELETE FROM batch_faculty WHERE batch_id = ?').run(batchId);
        const insertFaculty = db.prepare('INSERT INTO batch_faculty (batch_id, faculty_id) VALUES (?, ?)');
        for (const fid of faculty_ids) {
          insertFaculty.run(batchId, fid);
        }
      }
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.get('/api/institute/notices', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  try {
    if (isSupabaseEnabled) {
      const { data: inst, error: instError } = await supabase.from('institutes').select('id').eq('user_id', userId).maybeSingle();
      if (instError || !inst) return res.status(404).json({ error: 'Institute not found' });
      
      const { data: notices, error: noticeError } = await supabase.from('notices').select('*').eq('institute_id', inst.id).order('created_at', { ascending: false });
      if (noticeError) return res.status(500).json({ error: noticeError.message });
      res.json(notices || []);
    } else {
      const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
      if (!institute) return res.status(404).json({ error: 'Institute not found' });
      res.json(db.prepare('SELECT * FROM notices WHERE institute_id = ? ORDER BY id DESC').all(institute.id));
    }
  } catch (err: any) {
    console.error('❌ Notice fetch error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/institute/notices', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const { title, date, description, type } = req.body;
  
  if (!title || !date || !description) {
    return res.status(400).json({ error: 'Title, date, and description are required' });
  }

  try {
    if (isSupabaseEnabled) {
      const { data: inst, error: instError } = await supabase.from('institutes').select('id').eq('user_id', userId).maybeSingle();
      if (instError || !inst) return res.status(404).json({ error: 'Institute not found' });
      
      const { data, error } = await supabase.from('notices').insert({ 
        institute_id: inst.id, 
        title, 
        date, 
        description, 
        type: type || 'announcement' 
      }).select().maybeSingle();
      
      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true, id: data?.id });
    } else {
      const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
      if (!institute) return res.status(404).json({ error: 'Institute not found' });
      
      const result = db.prepare('INSERT INTO notices (institute_id, title, date, description, type) VALUES (?, ?, ?, ?, ?)')
        .run(institute.id, title, date, description, type || 'announcement');
      res.json({ success: true, id: result.lastInsertRowid });
    }
  } catch (err: any) {
    console.error('❌ Notice creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/institute/notices/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const noticeId = req.params.id;
  const { title, date, description, type } = req.body;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { error } = await supabase.from('notices').update({ title, date, description, type }).eq('id', noticeId).eq('institute_id', inst.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('UPDATE notices SET title = ?, date = ?, description = ?, type = ? WHERE id = ? AND institute_id = ?').run(title, date, description, type, noticeId, institute.id);
    res.json({ success: true });
  }
});

app.delete('/api/institute/notices/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const noticeId = req.params.id;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    await supabase.from('notices').delete().eq('id', noticeId).eq('institute_id', inst.id);
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('DELETE FROM notices WHERE id = ? AND institute_id = ?').run(noticeId, institute.id);
    res.json({ success: true });
  }
});

app.get('/api/institute/documents', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data: docs } = await supabase.from('documents').select('*').eq('institute_id', inst.id);
    res.json(docs || []);
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    res.json(db.prepare('SELECT * FROM documents WHERE institute_id = ?').all(institute.id));
  }
});

app.post('/api/institute/documents', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const { title, size, format, url } = req.body;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data, error } = await supabase.from('documents').insert({ institute_id: inst.id, title, size, format, url }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id: data.id });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    const result = db.prepare('INSERT INTO documents (institute_id, title, size, format, url) VALUES (?, ?, ?, ?, ?)').run(institute.id, title, size, format || 'PDF', url);
    res.json({ success: true, id: result.lastInsertRowid });
  }
});

app.put('/api/institute/documents/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const docId = req.params.id;
  const { title, size, format, url } = req.body;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { error } = await supabase.from('documents').update({ title, size, format, url }).eq('id', docId).eq('institute_id', inst.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('UPDATE documents SET title = ?, size = ?, format = ?, url = ? WHERE id = ? AND institute_id = ?').run(title, size, format, url, docId, institute.id);
    res.json({ success: true });
  }
});

app.delete('/api/institute/documents/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const docId = req.params.id;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    await supabase.from('documents').delete().eq('id', docId).eq('institute_id', inst.id);
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('DELETE FROM documents WHERE id = ? AND institute_id = ?').run(docId, institute.id);
    res.json({ success: true });
  }
});

app.get('/api/institute/categories', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    if (!inst) return res.status(404).json({ error: 'Institute not found' });
    const { data: categories } = await supabase.from('categories').select('*').eq('institute_id', inst.id);
    res.json(categories || []);
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    if (!institute) return res.status(404).json({ error: 'Institute not found' });
    res.json(db.prepare('SELECT * FROM categories WHERE institute_id = ?').all(institute.id));
  }
});

app.post('/api/institute/categories', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data, error } = await supabase.from('categories').insert({ institute_id: inst.id, name, color }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id: data.id });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    const result = db.prepare('INSERT INTO categories (institute_id, name, color) VALUES (?, ?, ?)').run(institute.id, name, color);
    res.json({ success: true, id: result.lastInsertRowid });
  }
});

app.put('/api/institute/categories/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const catId = req.params.id;
  const { name, color } = req.body;
  
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { error } = await supabase.from('categories').update({ name, color }).eq('id', catId).eq('institute_id', inst.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('UPDATE categories SET name = ?, color = ? WHERE id = ? AND institute_id = ?').run(name, color, catId, institute.id);
    res.json({ success: true });
  }
});

app.delete('/api/institute/categories/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const catId = req.params.id;
  
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    await supabase.from('categories').delete().eq('id', catId).eq('institute_id', inst.id);
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('DELETE FROM categories WHERE id = ? AND institute_id = ?').run(catId, institute.id);
    res.json({ success: true });
  }
});

app.get('/api/institute/faculty', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data: faculty } = await supabase.from('faculty').select('*').eq('institute_id', inst.id);
    res.json(faculty || []);
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    res.json(db.prepare('SELECT * FROM faculty WHERE institute_id = ?').all(institute.id));
  }
});

app.post('/api/institute/faculty', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const { name, subject, image_url, qualifications, bio, experience } = req.body;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data, error } = await supabase.from('faculty').insert({ institute_id: inst.id, name, subject, image_url, qualifications, bio, experience }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id: data.id });
  } else {
    try {
      const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
      if (!institute) return res.status(404).json({ error: 'Institute not found for this user' });
      
      const result = db.prepare('INSERT INTO faculty (institute_id, name, subject, image_url, qualifications, bio, experience) VALUES (?, ?, ?, ?, ?, ?, ?)').run(institute.id, name, subject, image_url, qualifications, bio, experience);
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (err: any) {
      console.error('❌ Faculty creation error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
});

app.put('/api/institute/faculty/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const facultyId = req.params.id;
  const { name, subject, image_url, qualifications, bio, experience } = req.body;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { error } = await supabase.from('faculty').update({ name, subject, image_url, qualifications, bio, experience }).eq('id', facultyId).eq('institute_id', inst.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('UPDATE faculty SET name = ?, subject = ?, image_url = ?, qualifications = ?, bio = ?, experience = ? WHERE id = ? AND institute_id = ?').run(name, subject, image_url, qualifications, bio, experience, facultyId, institute.id);
    res.json({ success: true });
  }
});

app.delete('/api/institute/faculty/:id', authenticateToken, requireRole('SUB_ADMIN'), async (req, res) => {
  const userId = (req as any).user.id;
  const facultyId = req.params.id;
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    await supabase.from('faculty').delete().eq('id', facultyId).eq('institute_id', inst.id);
    res.json({ success: true });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    db.prepare('DELETE FROM faculty WHERE id = ? AND institute_id = ?').run(facultyId, institute.id);
    res.json({ success: true });
  }
});

app.get('/api/public/institutes', async (req, res) => {
  const { subject } = req.query;
  
  if (isSupabaseEnabled) {
    const { data: institutes } = await supabase.from('institutes').select('*, batches(*), categories(*), institute_categories(name)');
    let results = (institutes || []).map((inst: any) => ({
      ...inst,
      category_name: inst.institute_categories?.name
    }));
    if (subject) {
      const s = String(subject).toLowerCase();
      results = results.filter((inst: any) => inst.batches.some((b: any) => b.subject.toLowerCase().includes(s)));
    }
    res.json(results);
  } else {
    let institutes = db.prepare(`
      SELECT institutes.*, institute_categories.name as category_name 
      FROM institutes 
      LEFT JOIN institute_categories ON institutes.category_id = institute_categories.id
    `).all() as any[];
    const allBatches = db.prepare('SELECT * FROM batches').all() as any[];
    const allCategories = db.prepare('SELECT * FROM categories').all() as any[];
    institutes = institutes.map(inst => {
      inst.batches = allBatches.filter(b => b.institute_id === inst.id);
      inst.categories = allCategories.filter(c => c.institute_id === inst.id);
      return inst;
    });
    if (subject) {
      const s = String(subject).toLowerCase();
      institutes = institutes.filter(inst => inst.batches.some((b: any) => b.subject.toLowerCase().includes(s)));
    }
    res.json(institutes);
  }
});

app.get('/api/public/institutes/:id', async (req, res) => {
  const id = req.params.id;
  
  if (isSupabaseEnabled) {
    const { data: institute, error } = await supabase.from('institutes')
      .select('*, batches(*), faculty(*), notices(*), documents(*), categories(*), institute_categories(name)')
      .eq('id', id)
      .single();
    if (error || !institute) return res.status(404).json({ error: 'Institute not found' });
    
    // Flatten category name
    const result = {
      ...institute,
      category_name: institute.institute_categories?.name
    };
    res.json(result);
  } else {
    const institute = db.prepare(`
      SELECT institutes.*, institute_categories.name as category_name 
      FROM institutes 
      LEFT JOIN institute_categories ON institutes.category_id = institute_categories.id
      WHERE institutes.id = ?
    `).get(id) as any;
    if (!institute) return res.status(404).json({ error: 'Institute not found' });
    institute.batches = db.prepare('SELECT * FROM batches WHERE institute_id = ?').all(id);
    institute.categories = db.prepare('SELECT * FROM categories WHERE institute_id = ?').all(id);
    institute.faculty = db.prepare('SELECT * FROM faculty WHERE institute_id = ?').all(id);
    institute.notices = db.prepare('SELECT * FROM notices WHERE institute_id = ? ORDER BY id DESC').all(id);
    institute.documents = db.prepare('SELECT * FROM documents WHERE institute_id = ?').all(id);
    res.json(institute);
  }
});

app.get('/api/public/batches/:id', async (req, res) => {
  const id = req.params.id;
  if (isSupabaseEnabled) {
    const { data: batch, error } = await supabase.from('batches').select('*, institutes(name, id), categories(*)').eq('id', id).single();
    if (error || !batch) return res.status(404).json({ error: 'Not found' });
    
    // Fetch related faculty via join
    const { data: batchFaculty, error: facultyError } = await supabase
      .from('batch_faculty')
      .select('faculty(*)')
      .eq('batch_id', id);

    const teachers = (batchFaculty || []).map((bf: any) => bf.faculty);
    const syllabus = typeof batch.curriculum === 'string' ? JSON.parse(batch.curriculum) : batch.curriculum;
    const category = batch.categories; // This will be the joined category object
    res.json({ ...batch, institute_name: (batch as any).institutes?.name, teachers, syllabus, category });
  } else {
    try {
      const batch = db.prepare(`
        SELECT b.*, i.name as institute_name, c.name as category_name, c.color as category_color 
        FROM batches b 
        JOIN institutes i ON b.institute_id = i.id 
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `).get(id) as any;
      if (!batch) return res.status(404).json({ error: 'Not found' });
      
      const syllabus = typeof batch.curriculum === 'string' ? JSON.parse(batch.curriculum) : batch.curriculum;
      const category = batch.category_name ? { name: batch.category_name, color: batch.category_color } : null;
      
      // Fetch teachers via junction table
      const teachers = db.prepare(`
        SELECT f.* 
        FROM faculty f 
        JOIN batch_faculty bf ON f.id = bf.faculty_id 
        WHERE bf.batch_id = ?
      `).all(id);
      
      res.json({ ...batch, teachers: teachers || [], syllabus, category });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  }
});

app.get('/api/public/reviews', async (req, res) => {
  const { institute_id } = req.query;
  if (!institute_id) return res.status(400).json({ error: 'institute_id is required' });

  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('reviews').select('*').eq('institute_id', institute_id).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } else {
    res.json([]);
  }
});

app.post('/api/public/reviews', async (req, res) => {
  const { institute_id, student_id, student_name, rating, review_text, batch_id } = req.body;
  if (!institute_id || !rating) return res.status(400).json({ error: 'institute_id and rating are required' });

  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('reviews').insert({
      institute_id,
      student_id: student_id || 'anonymous',
      student_name: student_name || null,
      rating: parseInt(rating),
      review_text,
      batch_id: batch_id || null
    }).select().single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, review: data });
  } else {
    res.status(501).json({ error: 'Reviews only supported on Supabase' });
  }
});

// Administrative Review Management
app.get('/api/institute/reviews', authenticateToken, async (req: any, res) => {
  if (!isSupabaseEnabled) return res.status(501).json({ error: 'Supabase not enabled' });
  
  try {
    const userId = req.user.id;
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    if (!inst) return res.status(404).json({ error: 'Institute not found' });

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('institute_id', inst.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/institute/reviews/:id/reply', authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { reply_text } = req.body;
  
  if (!isSupabaseEnabled) return res.status(501).json({ error: 'Supabase not enabled' });
  
  try {
    const userId = req.user.id;
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    if (!inst) return res.status(404).json({ error: 'Institute not found' });

    const { data, error } = await supabase
      .from('reviews')
      .update({ reply_text })
      .eq('id', id)
      .eq('institute_id', inst.id) // Ensure security
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/institute/reviews/:id/flag', authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { is_flagged } = req.body;
  
  if (!isSupabaseEnabled) return res.status(501).json({ error: 'Supabase not enabled' });
  
  try {
    const userId = req.user.id;
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    if (!inst) return res.status(404).json({ error: 'Institute not found' });

    const { data, error } = await supabase
      .from('reviews')
      .update({ is_flagged })
      .eq('id', id)
      .eq('institute_id', inst.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-razorpay-order', authenticateToken, async (req: any, res) => {
  try {
    const studentId = req.user.id;
    const { batchId, couponCode } = req.body;
    
    if (!batchId) {
      return res.status(400).json({ error: 'batchId is required' });
    }

    let basePrice = 0;
    if (isSupabaseEnabled) {
      const { data: batch } = await supabase.from('batches').select('fee_structure').eq('id', batchId).single();
      if (batch && batch.fee_structure) {
        basePrice = Number(batch.fee_structure.replace(/[^0-9]/g, ''));
      }
    } else {
      const batch = db.prepare('SELECT fee_structure FROM batches WHERE id = ?').get(batchId) as any;
      if (batch && batch.fee_structure) {
        basePrice = Number(batch.fee_structure.replace(/[^0-9]/g, ''));
      }
    }

    if (isNaN(basePrice) || basePrice < 0) {
       basePrice = 0; // Default or free if not parsable
    }

    let discountAmount = 0;
    if (couponCode) {
      const formattedCode = String(couponCode).trim().toUpperCase();
      const validCodes: Record<string, { type: 'percentage' | 'flat', value: number }> = {
        'DIWALI20': { type: 'percentage', value: 20 },
        'FLAT500': { type: 'flat', value: 500 }
      };
      const code = validCodes[formattedCode];
      if (code) {
        if (code.type === 'percentage') {
          discountAmount = (basePrice * code.value) / 100;
        } else {
          discountAmount = code.value;
        }
      }
    }

    let finalPrice = Math.max(0, basePrice - discountAmount);
    
    if (finalPrice <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0. Free batches bypass razorpay.' });
    }

    const options = {
      amount: Math.round(finalPrice * 100), // convert INR to paise
      currency: "INR",
      receipt: `rcpt_${batchId}`.substring(0, 40),
      notes: {
        batch_id: String(batchId),
        student_id: String(studentId)
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({ id: order.id, amount: order.amount });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: error?.error?.description || error.message || 'Razorpay order creation failed' });
  }
});

app.get('/api/student/enrollments', async (req: any, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let userId = null;

  if (isSupabaseEnabled) {
    // Verify using Supabase auth
    const { data: userAuth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userAuth.user) {
      return res.status(403).json({ error: 'Forbidden: Invalid Supabase token' });
    }
    userId = userAuth.user.id;
  } else {
    // Verify using local JWT
    try {
      const decoded: any = jwt.verify(token, SECRET_KEY);
      userId = decoded.id;
    } catch(err) {
      return res.status(403).json({ error: 'Forbidden: Invalid local token' });
    }
  }

  if (isSupabaseEnabled) {
    try {
      let { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, 
          batch_id, 
          created_at, 
          enrollment_date,
          razorpay_payment_id,
          batches:batch_id(
            id,
            batch_name, 
            teacher_name, 
            mode, 
            next_class_time, 
            zoom_link,
            institutes(name, logo)
          )
        `)
        .eq('student_id', userId)
        .eq('status', 'active');
      
      if (error && (error.code === 'PGRST204' || error.code === '42703')) {
        const fallbackRes = await supabase
          .from('enrollments')
          .select(`
            id, 
            batch_id, 
            created_at, 
            razorpay_payment_id,
            batches:batch_id(
              id,
              batch_name, 
              teacher_name, 
              mode, 
              next_class_time, 
              zoom_link,
              institutes(name, logo)
            )
          `)
          .eq('student_id', userId)
          .eq('status', 'active');
        data = fallbackRes.data;
        error = fallbackRes.error;
      }
      
      const { data: profileData } = await supabase
        .from('student_profiles')
        .select('id, full_name, phone_number, email, dob, age, photo_url, current_class')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Supabase fetch enrollments error:', error);
        if (error.code === '42P01') {
          // Table missing, fallback to sqlite
          console.warn('Supabase enrollments missing on select, fallback to sqlite');
          const localData = db.prepare(`
            SELECT id, batch_id, created_at, razorpay_payment_id
            FROM enrollments
            WHERE student_id = ? AND status = 'active'
          `).all(userId);
          
          let formatted: any[] = [];
          if (localData.length > 0) {
            const batchIds = localData.map((d: any) => d.batch_id);
            const { data: batchesData } = await supabase
              .from('batches')
              .select('id, batch_name, teacher_name, mode, next_class_time, zoom_link, institutes(name, logo)')
              .in('id', batchIds);
              
            const batchesMap = new Map((batchesData || []).map((b: any) => [b.id, b]));
            
            formatted = localData.map((d: any) => {
              const b = batchesMap.get(d.batch_id) || {} as any;
              return {
                id: d.id,
                batch_id: d.batch_id,
                created_at: d.created_at,
                razorpay_payment_id: d.razorpay_payment_id,
                batches: {
                  name: b.batch_name || 'Unknown Batch',
                  teacher_name: b.teacher_name,
                  mode: b.mode,
                  next_class_time: b.next_class_time,
                  zoom_link: b.zoom_link,
                  institutes: b.institutes || null
                }
              };
            });
          }
          
          const profileFallback = profileData || {};
          formatted = formatted.map(f => ({ ...f, student_profiles: profileFallback }));
          return res.json(formatted);
        }
        throw error;
      }
      
      const formattedData = (data || []).map((item: any) => ({
        ...item,
        student_profiles: profileData || {},
        batches: {
          ...item.batches,
          name: item.batches?.batch_name || 'Unnamed Batch'
        }
      }));
      return res.json(formattedData);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    try {
      const localData = db.prepare(`
        SELECT e.id, e.batch_id, e.created_at, e.razorpay_payment_id,
               b.batch_name as name, b.teacher_name, b.mode, b.next_class_time, b.zoom_link
        FROM enrollments e
        JOIN batches b ON e.batch_id = b.id
        WHERE e.student_id = ? AND e.status = 'active'
      `).all(userId);
      
      const formatted = localData.map((d: any) => ({
        id: d.id,
        batch_id: d.batch_id,
        created_at: d.created_at,
        razorpay_payment_id: d.razorpay_payment_id,
        batches: {
          name: d.name,
          teacher_name: d.teacher_name,
          mode: d.mode,
          next_class_time: d.next_class_time,
          zoom_link: d.zoom_link
        }
      }));
      res.json(formatted);
    } catch (err: any) {
      console.error('Local enrollments error:', err);
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/verify-enrollment', authenticateToken, async (req: any, res) => {
  try {
    const studentId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, batch_id } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid Payment Signature. Enrollment failed.' });
    }

    // Verify order metadata from Razorpay servers
    let amount = 0;
    try {
      const order = await razorpay.orders.fetch(razorpay_order_id);
      if (!order.notes || order.notes.batch_id !== String(batch_id) || order.notes.student_id !== String(studentId)) {
        console.error("Order metadata mismatch spoofing attempt detected");
        return res.status(400).json({ success: false, error: 'Order metadata verification failed' });
      }
      amount = Number(order.amount) / 100; // stored in INR
    } catch (e: any) {
      console.error("Razorpay order fetch failed:", e);
      return res.status(500).json({ success: false, error: 'Payment verification failed at provider' });
    }

    if (isSupabaseEnabled) {
      // Use supabase
      const { error } = await supabase.from('enrollments').insert({
        student_id: studentId,
        batch_id,
        razorpay_payment_id,
        amount,
        status: 'active'
      });
      if (error) {
        if (error.code === 'PGRST204' || error.code === '42703') { // Column not found error
          console.warn('Supabase enrollments table missing amount column, inserting without amount.', error);
          const fallbackRes = await supabase.from('enrollments').insert({
            student_id: studentId,
            batch_id,
            razorpay_payment_id,
            status: 'active'
          });
          if (fallbackRes.error) {
            console.error('Supabase fallback insert error:', fallbackRes.error);
            if (fallbackRes.error.code === '42P01') {
              db.prepare(`INSERT INTO enrollments (id, student_id, batch_id, razorpay_payment_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)`).run(crypto.randomUUID(), studentId, batch_id, razorpay_payment_id, amount, 'active');
            } else {
              throw fallbackRes.error;
            }
          }
        }
        else if (error.code === '42P01') {
          // Table doesn't exist
          console.warn('Supabase enrollments table does not exist, falling back to SQLite.', error);
          db.prepare(`INSERT INTO enrollments (id, student_id, batch_id, razorpay_payment_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)`).run(crypto.randomUUID(), studentId, batch_id, razorpay_payment_id, amount, 'active');
        } else {
          throw error;
        }
      }
    } else {
      // Use SQLite
      try {
        db.prepare(`INSERT INTO enrollments (id, student_id, batch_id, razorpay_payment_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)`).run(crypto.randomUUID(), studentId, batch_id, razorpay_payment_id, amount, 'active');
      } catch (e: any) {
        if (e.message && e.message.includes('has no column named amount')) {
          db.prepare(`INSERT INTO enrollments (id, student_id, batch_id, razorpay_payment_id, status) VALUES (?, ?, ?, ?, ?)`).run(crypto.randomUUID(), studentId, batch_id, razorpay_payment_id, 'active');
        } else {
          throw e;
        }
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('Verify enrollment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- SEO SETTINGS ---
app.get('/api/master/seo-settings', authenticateToken, requireRole('MASTER'), async (req, res) => {
  try {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      res.json(data || { title: 'VidyaNation', description: '', keywords: '' });
    } else {
      const data = db.prepare('SELECT * FROM platform_settings WHERE id = 1').get();
      res.json(data || { title: 'VidyaNation', description: '', keywords: '' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/master/seo-settings', authenticateToken, requireRole('MASTER'), async (req: any, res) => {
  const { title, description, keywords } = req.body;
  try {
    if (isSupabaseEnabled) {
      const { error } = await supabase.from('platform_settings').upsert({ id: 1, title, description, keywords });
      if (error) return res.status(500).json({ error: error.message });
      await logAudit('UPDATE_SEO', req.user.id, req.user.username, `Updated SEO settings (Title: ${title})`);
      res.json({ success: true });
    } else {
      db.prepare('INSERT INTO platform_settings (id, title, description, keywords) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, description=excluded.description, keywords=excluded.keywords').run(title, description, keywords);
      await logAudit('UPDATE_SEO', req.user.id, req.user.username, `Updated SEO settings (Title: ${title})`);
      res.json({ success: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      try {
        const htmlPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(htmlPath)) {
          return res.status(404).send('Not built yet');
        }
        
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Fetch SEO settings for dynamic injection
        let seo;
        try {
          if (isSupabaseEnabled) {
            const { data } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle();
            seo = data;
          } else {
            seo = db.prepare('SELECT * FROM platform_settings WHERE id = 1').get();
          }

          if (seo) {
            const title = seo.title || 'VidyaNation';
            const description = seo.description || '';
            const keywords = seo.keywords || '';

            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace('</head>', `
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
</head>`);
          }
        } catch (seoErr) {
          console.error('Meta injection data fetch error:', seoErr);
        }

        res.send(html);
      } catch (err) {
        console.error('Meta injection error:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
