import express from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-jwt-key-for-coaching-hub';

app.use(express.json());

// --- Setup Supabase vs SQLite ---
const supabaseUrl = process.env.SUPABASE_URL;
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
    CREATE TABLE IF NOT EXISTS institutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      logo TEXT,
      address TEXT,
      location TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      demo_video_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institute_id INTEGER NOT NULL,
      teacher_name TEXT NOT NULL,
      teacher_image TEXT,
      subject TEXT NOT NULL,
      batch_name TEXT NOT NULL,
      batch_timing TEXT,
      batch_duration TEXT,
      start_date TEXT,
      fee_structure TEXT,
      FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
    );
  `);

  ensureMasterAdmin();
}

// Authentication Middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    (req as any).user = user;
    next();
  });
};

const requireRole = (role: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((req as any).user?.role !== role) {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
      return;
    }
    next();
  };
};

/* --- API ROUTES --- */

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔑 Login attempt for: ${username}`);
  
  let user;

  try {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('app_users').select('*').eq('username', username).maybeSingle();
      if (error) {
        console.error('❌ Supabase login query error:', error.message);
      }
      if (data) {
        user = { id: data.id, username: data.username, password: data.password_hash, role: data.role };
      }
    } else {
      user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    }
    
    if (user && bcrypt.compareSync(password, user.password)) {
      console.log(`✅ Login successful for: ${username} (${user.role})`);
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
      res.json({ token, role: user.role });
    } else {
      console.log(`❌ Login failed for: ${username} - ${!user ? 'User not found' : 'Invalid password'}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err: any) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/master/institutes', authenticateToken, requireRole('MASTER'), async (req, res) => {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('institutes')
      .select('*, app_users (username)');
    if (error) return res.status(500).json({ error: error.message });
    // Flatten result to match frontend expectation
    const formatted = data.map((d: any) => ({ ...d, username: d.app_users?.username }));
    res.json(formatted);
  } else {
    const institutes = db.prepare('SELECT institutes.*, users.username FROM institutes JOIN users ON institutes.user_id = users.id').all();
    res.json(institutes);
  }
});

app.post('/api/master/institutes', authenticateToken, requireRole('MASTER'), async (req, res) => {
  const { name, logo } = req.body;
  if (!name) return res.status(400).json({ error: 'Institute name is required' });

  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const username = `${name.toLowerCase().replace(/\s+/g, '')}${uniqueId}`;
  const password = Math.random().toString(36).slice(-8);
  const hash = bcrypt.hashSync(password, 10);

  if (isSupabaseEnabled) {
    // 1. Create sub-admin
    const { data: userData, error: userError } = await supabase.from('app_users')
      .insert({ username, password_hash: hash, role: 'SUB_ADMIN' }).select().single();
    if (userError) return res.status(500).json({ error: userError.message });
    
    // 2. Create institute
    const { data: instData, error: instError } = await supabase.from('institutes')
      .insert({ user_id: userData.id, name, logo: logo || '' }).select().single();
    if (instError) return res.status(500).json({ error: instError.message });

    res.json({ message: 'Institute generated successfully', credentials: { id: instData.id, username, password } });
  } else {
    const tx = db.transaction(() => {
      const userRes = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hash, 'SUB_ADMIN');
      const userId = userRes.lastInsertRowid;
      const instRes = db.prepare('INSERT INTO institutes (user_id, name, logo) VALUES (?, ?, ?)').run(userId, name, logo || '');
      return { id: instRes.lastInsertRowid, username, password };
    });
    try {
      res.json({ message: 'Institute generated successfully', credentials: tx() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
  const { name, logo, address, location, phone, email, website, demo_video_url } = req.body;
  
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('institutes')
      .update({ name, logo, address, location, phone, email, website, demo_video_url })
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } else {
    try {
      db.prepare(`
        UPDATE institutes SET 
          name = ?, logo = ?, address = ?, location = ?, phone = ?, email = ?, website = ?, demo_video_url = ?
        WHERE user_id = ?
      `).run(name, logo, address, location, phone, email, website, demo_video_url, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
  const { teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure } = req.body;
  
  if (isSupabaseEnabled) {
    const { data: inst } = await supabase.from('institutes').select('id').eq('user_id', userId).single();
    const { data, error } = await supabase.from('batches').insert({
      institute_id: inst.id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id: data.id });
  } else {
    const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
    try {
      const result = db.prepare(`
        INSERT INTO batches (institute_id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(institute.id, teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure);
      res.json({ success: true, id: result.lastInsertRowid });
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

app.get('/api/public/institutes', async (req, res) => {
  const { subject } = req.query;
  
  if (isSupabaseEnabled) {
    const { data: institutes } = await supabase.from('institutes').select('*, batches(*)');
    let results = institutes || [];
    if (subject) {
      const s = String(subject).toLowerCase();
      results = results.filter((inst: any) => inst.batches.some((b: any) => b.subject.toLowerCase().includes(s)));
    }
    res.json(results);
  } else {
    let institutes = db.prepare('SELECT * FROM institutes').all() as any[];
    const allBatches = db.prepare('SELECT * FROM batches').all() as any[];
    institutes = institutes.map(inst => {
      inst.batches = allBatches.filter(b => b.institute_id === inst.id);
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
    const { data: institute, error } = await supabase.from('institutes').select('*, batches(*)').eq('id', id).single();
    if (error || !institute) return res.status(404).json({ error: 'Institute not found' });
    res.json(institute);
  } else {
    const institute = db.prepare('SELECT * FROM institutes WHERE id = ?').get(id) as any;
    if (!institute) return res.status(404).json({ error: 'Institute not found' });
    institute.batches = db.prepare('SELECT * FROM batches WHERE institute_id = ?').all(id);
    res.json(institute);
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
