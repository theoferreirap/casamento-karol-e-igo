const { put, list, del } = require('@vercel/blob');
const { verifyToken } = require('./auth');

const DB_FILENAME = 'moments-db.json';

// Default initial moments using couple photos
const INITIAL_MOMENTS = [
  {
    id: 'moment-1',
    imageUrl: 'historia-1.jpg',
    title: 'O Primeiro Olhar',
    date: 'Junho de 2021',
    caption: 'Tudo começou no Dia dos Namorados. Um caldo, um doce e um olhar que mudou tudo para sempre.',
    order: 1,
    createdAt: '2021-06-12T19:00:00.000Z'
  },
  {
    id: 'moment-2',
    imageUrl: 'historia-2.jpg',
    title: 'Nossos Momentos & Cumplicidade',
    date: '2022 — 2023',
    caption: 'Conversas que não tinham fim, risadas sinceras e a certeza de que caminhávamos na mesma direção.',
    order: 2,
    createdAt: '2022-09-15T15:30:00.000Z'
  },
  {
    id: 'moment-3',
    imageUrl: 'historia-3.jpg',
    title: 'O Pedido & O Nosso Sim',
    date: '2024',
    caption: 'Quando o amor transbordou e a resposta mais fácil e bonita de nossas vidas foi dita: Sim, para sempre! 💍',
    order: 3,
    createdAt: '2024-05-20T20:00:00.000Z'
  }
];

// In-memory fallback if no Vercel Blob token is set
let localMemoryDb = [...INITIAL_MOMENTS];

// Helper to fetch database from Vercel Blob
async function getMomentsFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return localMemoryDb;
  }

  try {
    const { blobs } = await list({ prefix: DB_FILENAME });
    const dbBlob = blobs.find(b => b.pathname === DB_FILENAME);

    if (!dbBlob) {
      // Initialize DB on Blob
      await saveMomentsToBlob(INITIAL_MOMENTS);
      return INITIAL_MOMENTS;
    }

    const response = await fetch(dbBlob.url + '?t=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) return INITIAL_MOMENTS;
    const data = await response.json();
    return Array.isArray(data) ? data : INITIAL_MOMENTS;
  } catch (err) {
    console.error('Erro ao ler moments do Blob:', err);
    return localMemoryDb;
  }
}

// Helper to save moments to Vercel Blob
async function saveMomentsToBlob(moments) {
  localMemoryDb = moments;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  try {
    await put(DB_FILENAME, JSON.stringify(moments, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });
  } catch (err) {
    console.error('Erro ao salvar moments no Blob:', err);
  }
}

// Check admin auth from headers
function checkAuth(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return verifyToken(token);
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

  // GET: Public fetch of all moments
  if (req.method === 'GET') {
    try {
      const moments = await getMomentsFromBlob();
      // Sort by order ascending
      moments.sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.status(200).json({ moments });
    } catch (err) {
      console.error('GET moments error:', err);
      return res.status(500).json({ error: 'Erro ao buscar momentos.' });
    }
  }

  // All other methods require authentication
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'Não autorizado. Faça login no painel.' });
  }

  // POST: Create a new moment
  if (req.method === 'POST') {
    try {
      const { imageUrl, title, caption, date } = req.body || {};

      if (!imageUrl) {
        return res.status(400).json({ error: 'A foto do momento é obrigatória.' });
      }

      const moments = await getMomentsFromBlob();
      const nextOrder = moments.length > 0 ? Math.max(...moments.map(m => m.order || 0)) + 1 : 1;

      const newMoment = {
        id: 'moment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        imageUrl: imageUrl.trim(),
        title: (title || '').trim(),
        caption: (caption || '').trim(),
        date: (date || '').trim(),
        order: nextOrder,
        createdAt: new Date().toISOString()
      };

      moments.push(newMoment);
      await saveMomentsToBlob(moments);

      return res.status(201).json({
        success: true,
        moment: newMoment,
        message: 'Momento publicado com sucesso!'
      });
    } catch (err) {
      console.error('POST moment error:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar momento.' });
    }
  }

  // PUT: Update single moment OR reorder all moments
  if (req.method === 'PUT') {
    try {
      const { moments: updatedList, id, title, caption, date, order, imageUrl } = req.body || {};
      let currentMoments = await getMomentsFromBlob();

      // Bulk reordering
      if (Array.isArray(updatedList)) {
        // Map order based on list position
        const reordered = updatedList.map((item, index) => ({
          ...item,
          order: index + 1
        }));
        await saveMomentsToBlob(reordered);
        return res.status(200).json({ success: true, moments: reordered });
      }

      // Single item update
      if (!id) {
        return res.status(400).json({ error: 'ID do momento não informado.' });
      }

      const index = currentMoments.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Momento não encontrado.' });
      }

      currentMoments[index] = {
        ...currentMoments[index],
        title: title !== undefined ? title.trim() : currentMoments[index].title,
        caption: caption !== undefined ? caption.trim() : currentMoments[index].caption,
        date: date !== undefined ? date.trim() : currentMoments[index].date,
        order: order !== undefined ? Number(order) : currentMoments[index].order,
        imageUrl: imageUrl !== undefined ? imageUrl.trim() : currentMoments[index].imageUrl,
        updatedAt: new Date().toISOString()
      };

      await saveMomentsToBlob(currentMoments);
      return res.status(200).json({
        success: true,
        moment: currentMoments[index],
        message: 'Momento atualizado com sucesso!'
      });
    } catch (err) {
      console.error('PUT moment error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar momento.' });
    }
  }

  // DELETE: Remove a moment and delete blob if applicable
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body || req.query || {};

      if (!id) {
        return res.status(400).json({ error: 'ID do momento não informado.' });
      }

      let currentMoments = await getMomentsFromBlob();
      const momentToDelete = currentMoments.find(m => m.id === id);

      if (!momentToDelete) {
        return res.status(404).json({ error: 'Momento não encontrado.' });
      }

      // Delete from Vercel Blob if it was an uploaded blob url
      if (
        process.env.BLOB_READ_WRITE_TOKEN &&
        momentToDelete.imageUrl &&
        momentToDelete.imageUrl.includes('public.blob.vercel-storage.com')
      ) {
        try {
          await del(momentToDelete.imageUrl);
        } catch (delErr) {
          console.warn('Erro ao deletar imagem do Blob:', delErr);
        }
      }

      currentMoments = currentMoments.filter(m => m.id !== id);
      // Re-index order
      currentMoments.forEach((m, idx) => {
        m.order = idx + 1;
      });

      await saveMomentsToBlob(currentMoments);
      return res.status(200).json({
        success: true,
        message: 'Momento excluído com sucesso!'
      });
    } catch (err) {
      console.error('DELETE moment error:', err);
      return res.status(500).json({ error: 'Erro ao excluir momento.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
};
