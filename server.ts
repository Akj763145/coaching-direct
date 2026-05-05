import express from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-jwt-key-for-coaching-hub';

app.use(express.json());

// --- Setup SQLite ---
const db = new Database('platform.db');
db.pragma('journal_mode = WAL');

// Define Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('MASTER', 'SUB_ADMIN', 'USER')),
    email TEXT UNIQUE
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

// Initialization function to ensure a Master Admin exists
function ensureMasterAdmin() {
  const masterUsername = 'admin';
  const masterPassword = 'admin123';
  const role = 'MASTER';

  const existingMaster = db.prepare('SELECT id, password FROM users WHERE username = ?').get(masterUsername) as any;
  const masterHash = bcrypt.hashSync(masterPassword, 10);
  
  if (!existingMaster) {
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(masterUsername, masterHash, 'MASTER');
    console.log('✅ Default Master Admin created in SQLite -> [admin : admin123]');
  } else if (!bcrypt.compareSync(masterPassword, existingMaster.password)) {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(masterHash, existingMaster.id);
    console.log('✅ Default Master Admin password updated in SQLite -> [admin : admin123]');
  }
}

ensureMasterAdmin();

// --- Google OAuth Routes ---

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

app.get('/api/auth/google/url', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured in environment' });
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  res.json({ url: `${rootUrl}?${qs.toString()}` });
});

app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    // 1. Exchange code for tokens
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    };

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const tokenData = await tokenRes.json();
    const { id_token, access_token } = tokenData;

    if (!access_token) {
      console.error('❌ Google token exchange failed:', tokenData);
      return res.status(401).send('Authentication failed: Could not get access token');
    }

    // 2. Get user info
    const userRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`);
    const googleUser = await userRes.json();
    const email = googleUser.email;

    if (!email) {
      return res.status(401).send('Authentication failed: Email not provided by Google');
    }

    // 3. Sync user with local DB
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      const result = db.prepare('INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)').run(
        email, 'OAUTH_USER', 'USER', email
      );
      user = { id: result.lastInsertRowid, username: email, role: 'USER', email: email };
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

    res.send(`
      <html>
        <body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F5F5F7;">
          <div style="text-align: center; background: white; padding: 40px; rounded: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            <div style="width: 48px; height: 48px; border: 3px solid #0071E3; border-top-color: transparent; border-radius: 50%; animate: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h2 style="margin: 0; color: #1D1D1F;">Authentication Successful</h2>
            <p style="color: #86868B;">Signing you in... You can close this window if it doesn't close automatically.</p>
          </div>
          <script>
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}', role: '${(user as any).role}', email: '${(user as any).email}' }, '*');
            setTimeout(() => window.close(), 1000);
          </script>
          <style>
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('❌ Google OAuth error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

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
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  console.log(`🔑 Login attempt for: ${cleanUsername}`);
  
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername) as any;
  
  if (user && user.password && bcrypt.compareSync(cleanPassword, user.password)) {
    console.log(`✅ Login successful for: ${cleanUsername} (${user.role})`);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, role: user.role });
  } else {
    console.log(`❌ Login failed for: ${cleanUsername} - ${!user ? 'User not found' : 'Invalid password or password-less account'}`);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/master/institutes', authenticateToken, requireRole('MASTER'), (req, res) => {
  const institutes = db.prepare('SELECT institutes.*, users.username FROM institutes JOIN users ON institutes.user_id = users.id').all();
  res.json(institutes);
});

app.post('/api/master/institutes', authenticateToken, requireRole('MASTER'), (req, res) => {
  const { name, logo } = req.body;
  if (!name) return res.status(400).json({ error: 'Institute name is required' });

  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const username = `${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}${uniqueId}`;
  const password = Math.random().toString(36).slice(-8);
  const hash = bcrypt.hashSync(password, 10);

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
});

app.get('/api/institute/profile', authenticateToken, requireRole('SUB_ADMIN'), (req, res) => {
  const userId = (req as any).user.id;
  res.json(db.prepare('SELECT * FROM institutes WHERE user_id = ?').get(userId));
});

app.put('/api/institute/profile', authenticateToken, requireRole('SUB_ADMIN'), (req, res) => {
  const userId = (req as any).user.id;
  const { name, logo, address, location, phone, email, website, demo_video_url } = req.body;
  
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
});

app.get('/api/institute/batches', authenticateToken, requireRole('SUB_ADMIN'), (req, res) => {
  const userId = (req as any).user.id;
  const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
  if (!institute) return res.status(404).json({ error: 'Institute not found' });
  res.json(db.prepare('SELECT * FROM batches WHERE institute_id = ?').all(institute.id));
});

app.post('/api/institute/batches', authenticateToken, requireRole('SUB_ADMIN'), (req, res) => {
  const userId = (req as any).user.id;
  const { teacher_name, teacher_image, subject, batch_name, batch_timing, batch_duration, start_date, fee_structure } = req.body;
  
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
});

app.delete('/api/institute/batches/:id', authenticateToken, requireRole('SUB_ADMIN'), (req, res) => {
  const userId = (req as any).user.id;
  const batchId = req.params.id;
  
  const institute = db.prepare('SELECT id FROM institutes WHERE user_id = ?').get(userId) as any;
  db.prepare('DELETE FROM batches WHERE id = ? AND institute_id = ?').run(batchId, institute.id);
  res.json({ success: true });
});

app.get('/api/public/institutes', async (req, res) => {
  const { subject } = req.query;
  
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
});

app.get('/api/public/institutes/:id', async (req, res) => {
  const id = req.params.id;
  
  const institute = db.prepare('SELECT * FROM institutes WHERE id = ?').get(id) as any;
  if (!institute) return res.status(404).json({ error: 'Institute not found' });
  institute.batches = db.prepare('SELECT * FROM batches WHERE institute_id = ?').all(id);
  res.json(institute);
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
