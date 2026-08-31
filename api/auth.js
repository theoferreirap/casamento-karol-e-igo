const crypto = require('crypto');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.BLOB_READ_WRITE_TOKEN || 'wedding-editorial-secret-key-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'karol&igo2026';

// Helper to sign session token
function generateToken() {
  const payload = {
    role: 'admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };
  const strPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(strPayload).digest('base64url');
  return `${strPayload}.${signature}`;
}

// Helper to verify token
function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [strPayload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(strPayload).digest('base64url');
  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(strPayload, 'base64url').toString('utf8'));
    if (payload.expiresAt < Date.now()) return false;
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { password } = req.body || {};

      if (!password) {
        return res.status(400).json({ error: 'Senha não informada.' });
      }

      // Check against configured environment password OR standard defaults
      const validPasswords = [
        process.env.ADMIN_PASSWORD,
        'karol2026',
        'karol&igo2026',
        'karolina2026'
      ].filter(Boolean);

      const isMatch = validPasswords.some(validPass => {
        const enteredBuffer = Buffer.from(password.trim().toLowerCase());
        const validBuffer = Buffer.from(validPass.trim().toLowerCase());
        if (enteredBuffer.length !== validBuffer.length) return false;
        return crypto.timingSafeEqual(enteredBuffer, validBuffer);
      });

      if (!isMatch) {
        return res.status(401).json({ error: 'Senha incorreta. Tente "karol2026".' });
      }

      const token = generateToken();
      return res.status(200).json({
        success: true,
        token,
        message: 'Autenticado com sucesso!'
      });
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(500).json({ error: 'Erro interno ao autenticar.' });
    }
  }

  // GET: verify current token
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (verifyToken(token)) {
      return res.status(200).json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
};

module.exports.verifyToken = verifyToken;
