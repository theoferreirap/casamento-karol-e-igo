import { upload } from './blob-client.js';

// Admin Dashboard JavaScript for Igo & Karolina - Um Pouco de Nós (Apenas Fotos)
document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const logoutBtn = document.getElementById('logout-btn');

  const addForm = document.getElementById('add-moment-form');
  const fileInput = document.getElementById('file-input');
  const dropzone = document.getElementById('dropzone');
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const dropzonePreview = document.getElementById('dropzone-preview');
  const previewImg = document.getElementById('preview-img');
  const removeFileBtn = document.getElementById('remove-file-btn');
  const submitBtn = document.getElementById('submit-moment-btn');
  const submitBtnText = document.getElementById('submit-btn-text');
  const uploadStatus = document.getElementById('upload-status');
  const momentsList = document.getElementById('moments-list');
  const momentsCountBadge = document.getElementById('moments-count-badge');

  const DEFAULT_PRESET_MOMENTS = [
    { id: 'moment-1', imageUrl: 'foto-1.jpg', order: 1 },
    { id: 'moment-2', imageUrl: 'foto-2.jpg', order: 2 },
    { id: 'moment-3', imageUrl: 'foto-3.jpg', order: 3 },
    { id: 'moment-4', imageUrl: 'foto-4.jpg', order: 4 },
    { id: 'moment-5', imageUrl: 'foto-5.jpg', order: 5 },
    { id: 'moment-6', imageUrl: 'foto-6.jpg', order: 6 },
    { id: 'moment-7', imageUrl: 'foto-7.jpg', order: 7 },
    { id: 'moment-8', imageUrl: 'foto-8.jpg', order: 8 }
  ];

  let currentMoments = [];
  let selectedFile = null;
  let authToken = localStorage.getItem('wedding_admin_token') || '';

  // Toast Notification System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast show';
    if (type === 'error') {
      toast.style.borderColor = '#E53E3E';
      toast.style.color = '#9B2C2C';
    }
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Check auth state on load
  if (authToken) {
    showDashboard();
    loadMoments();
  } else {
    showLogin();
  }

  function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
  }

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value.trim();
    if (!password) return;

    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<span>Verificando...</span>';

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Não foi possível autenticar no servidor.');
      }

      authToken = data.token;
      localStorage.setItem('wedding_admin_token', authToken);
      showToast('Login realizado com sucesso!');
      showDashboard();
      loadMoments();
    } catch (err) {
      showToast(err.message || 'Erro ao autenticar. Tente novamente.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>Entrar no Painel</span>';
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('wedding_admin_token');
    authToken = '';
    showToast('Sessão encerrada.');
    showLogin();
  });

  // Drag and Drop & File Upload handling
  dropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione apenas arquivos de imagem.', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 25MB.', 'error');
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      dropzonePrompt.classList.add('hidden');
      dropzonePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '';
    dropzonePrompt.classList.remove('hidden');
    dropzonePreview.classList.add('hidden');
  });

  // Upload directly to Vercel Blob
  async function uploadFileToBlob(file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blob = await upload(
      `um-pouco-de-nos/${Date.now()}-${safeName}`,
      file,
      {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ token: authToken })
      }
    );

    if (!blob || !blob.url) {
      throw new Error('O Vercel Blob não retornou a URL da foto.');
    }

    return blob.url;
  }

  // Add Moment Form Submit (Photo Only)
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast('Por favor, selecione uma foto para publicar.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtnText.textContent = 'Enviando foto...';
    uploadStatus.textContent = 'Processando imagem...';

    try {
      const imageUrl = await uploadFileToBlob(selectedFile);

      submitBtnText.textContent = 'Salvando no álbum...';
      uploadStatus.textContent = 'Publicando no álbum...';

      const newMoment = {
        id: 'moment-' + Date.now(),
        imageUrl,
        order: currentMoments.length + 1,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(newMoment)
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || 'A foto foi enviada, mas não foi salva no álbum.');
      }

      currentMoments.push(result.moment || newMoment);
      saveMomentsLocally(currentMoments);

      showToast('Foto adicionada ao álbum com sucesso!');
      
      // Reset form
      addForm.reset();
      selectedFile = null;
      fileInput.value = '';
      dropzonePrompt.classList.remove('hidden');
      dropzonePreview.classList.add('hidden');
      uploadStatus.textContent = '';
      renderMomentsList(currentMoments);
    } catch (err) {
      console.error(err);
      showToast('Erro ao publicar foto: ' + (err.message || 'Tente novamente.'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Publicar Foto no Álbum';
      uploadStatus.textContent = '';
    }
  });

  function saveMomentsLocally(moments) {
    localStorage.setItem('wedding_moments_list', JSON.stringify(moments));
  }

  // Load Moments list
  async function loadMoments() {
    try {
      let moments = [];
      const res = await fetch('/api/moments?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.moments) && data.moments.length > 0) {
          moments = data.moments;
        }
      }

      if (moments.length === 0) {
        const localSaved = localStorage.getItem('wedding_moments_list');
        if (localSaved) {
          moments = JSON.parse(localSaved);
        } else {
          moments = [...DEFAULT_PRESET_MOMENTS];
        }
      }

      currentMoments = moments;
      renderMomentsList(currentMoments);
    } catch (err) {
      const localSaved = localStorage.getItem('wedding_moments_list');
      currentMoments = localSaved ? JSON.parse(localSaved) : [...DEFAULT_PRESET_MOMENTS];
      renderMomentsList(currentMoments);
    }
  }

  // Render Moments in Dashboard (Photos Only)
  function renderMomentsList(moments) {
    momentsCountBadge.textContent = `${moments.length} foto${moments.length === 1 ? '' : 's'}`;

    if (moments.length === 0) {
      momentsList.innerHTML = `
        <div class="text-center py-12 text-stone font-light text-sm">
          Nenhuma foto cadastrada ainda. Selecione uma foto acima para publicar!
        </div>
      `;
      return;
    }

    momentsList.innerHTML = moments.map((m, index) => `
      <div class="p-4 sm:p-5 bg-ivory border border-champagne-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm transition-all hover:border-champagne-gold/50">
        
        <!-- Thumbnail & Order Badge -->
        <div class="flex items-center gap-4 min-w-0">
          <span class="font-serif text-lg text-champagne-gold font-medium w-8 text-center bg-white py-1 rounded border border-champagne-gold/20 shadow-xs">
            #${index + 1}
          </span>
          <img src="${m.imageUrl}" alt="Foto ${index + 1}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border border-champagne-gold/30 flex-shrink-0 shadow-sm">
          
          <div class="min-w-0">
            <span class="font-serif text-lg sm:text-xl text-espresso font-medium block">
              Foto #${index + 1}
            </span>
            <span class="text-xs text-stone font-light block">
              Posição ${index + 1} na galeria do site
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <!-- Move Up -->
          <button onclick="moveMoment(${index}, -1)" ${index === 0 ? 'disabled' : ''} class="p-2.5 border border-champagne-gold/30 rounded hover:bg-white text-stone hover:text-espresso disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Mover para cima">
            ▲
          </button>
          <!-- Move Down -->
          <button onclick="moveMoment(${index}, 1)" ${index === moments.length - 1 ? 'disabled' : ''} class="p-2.5 border border-champagne-gold/30 rounded hover:bg-white text-stone hover:text-espresso disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Mover para baixo">
            ▼
          </button>
          <!-- Delete -->
          <button onclick="deleteMoment('${m.id}', ${index + 1})" class="px-3.5 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded text-xs uppercase tracking-wider transition-colors">
            Excluir Foto
          </button>
        </div>

      </div>
    `).join('');
  }

  // Move Moment Up / Down
  window.moveMoment = async function(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentMoments.length) return;

    const previousMoments = currentMoments.map(moment => ({ ...moment }));
    const temp = currentMoments[index];
    currentMoments[index] = currentMoments[targetIndex];
    currentMoments[targetIndex] = temp;

    // Update orders
    currentMoments.forEach((m, idx) => m.order = idx + 1);
    saveMomentsLocally(currentMoments);
    renderMomentsList(currentMoments);

    try {
      const res = await fetch('/api/moments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ moments: currentMoments })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Não foi possível salvar a nova ordem.');
      showToast('Ordem das fotos atualizada!');
    } catch (err) {
      currentMoments = previousMoments;
      saveMomentsLocally(currentMoments);
      renderMomentsList(currentMoments);
      showToast(err.message || 'Não foi possível salvar a nova ordem.', 'error');
    }
  };

  // Delete Moment
  window.deleteMoment = async function(id, photoNum) {
    if (!confirm(`Tem certeza que deseja excluir a Foto #${photoNum} do álbum?`)) {
      return;
    }

    try {
      const res = await fetch('/api/moments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Não foi possível excluir a foto.');

      currentMoments = currentMoments.filter(m => m.id !== id);
      currentMoments.forEach((m, idx) => m.order = idx + 1);
      saveMomentsLocally(currentMoments);
      renderMomentsList(currentMoments);
      showToast('Foto excluída com sucesso!');
    } catch (err) {
      showToast(err.message || 'Não foi possível excluir a foto.', 'error');
    }
  };
});
