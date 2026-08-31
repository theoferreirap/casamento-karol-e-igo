const { handleUpload } = require('@vercel/blob/client');
const { verifyToken } = require('./auth');

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate the user token passed in clientPayload or header
        let token = '';
        try {
          if (clientPayload) {
            const parsed = JSON.parse(clientPayload);
            token = parsed.token;
          }
        } catch (e) {}

        if (!token) {
          const authHeader = req.headers.authorization || '';
          token = authHeader.replace('Bearer ', '').trim();
        }

        if (!verifyToken(token)) {
          throw new Error('Não autorizado. Faça login novamente.');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB max
          tokenPayload: JSON.stringify({ authorizedAt: Date.now() })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload concluído no Vercel Blob:', blob.url);
      }
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Erro no upload handler:', error);
    return res.status(400).json({ error: error.message || 'Erro ao processar upload.' });
  }
};
