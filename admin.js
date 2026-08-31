// Admin Dashboard JavaScript for Karol & Igo - Antes do Sim
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
  const momentTitle = document.getElementById('moment-title');
  const momentDate = document.getElementById('moment-date');
  const momentCaption = document.getElementById('moment-caption');
  const submitBtn = document.getElementById('submit-moment-btn');
  const submitBtnText = document.getElementById('submit-btn-text');
  const uploadStatus = document.getElementById('upload-status');
  const momentsList = document.getElementById('moments-list');
  const momentsCountBadge = document.getElementById('moments-count-badge');

  const editModal = document.getElementById('edit-modal');
  const closeEditModalBtn = document.getElementById('close-edit-modal');
  const editForm = document.getElementById('edit-moment-form');
  const editIdInput = document.getElementById('edit-moment-id');
  const editTitleInput = document.getElementById('edit-title');
  const editDateInput = document.getElementById('edit-date');
  const editCaptionInput = document.getElementById('edit-caption');

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
    verifyAuthToken(authToken);
  } else {
    showLogin();
  }

  async function verifyAuthToken(token) {
    try {
      const res = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showDashboard();
        loadMoments();
      } else {
        localStorage.removeItem('wedding_admin_token');
        authToken = '';
        showLogin();
      }
    } catch (e) {
      // Offline fallback
      showDashboard();
      loadMoments();
    }
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

      const data = await res.json();
      if (res.ok && data.token) {
        authToken = data.token;
        localStorage.setItem('wedding_admin_token', authToken);
        showToast('Login realizado com sucesso!');
        showDashboard();
        loadMoments();
      } else {
        showToast(data.error || 'Senha incorreta.', 'error');
      }
    } catch (err) {
      showToast('Erro ao conectar com o servidor.', 'error');
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

  // Upload to Vercel Blob directly
  async function uploadFileToBlob(file) {
    // 1. Request client upload token via our /api/upload endpoint
    const response = await fetch(`/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        type: 'blob.generate-client-token',
        payload: {
          pathname: `um-pouco-de-nos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          callbackUrl: window.location.origin + '/api/upload',
          clientPayload: JSON.stringify({ token: authToken })
        }
      })
    });

    if (!response.ok) {
      // Fallback: If running in static/local preview mode without Vercel Blob credentials, convert to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }

    const json = await response.json();

    // 2. Upload file directly to Vercel Blob
    const uploadRes = await fetch(json.url, {
      method: 'PUT',
      headers: {
        'x-amz-acl': 'public-read',
        'Content-Type': file.type
      },
      body: file
    });

    if (!uploadRes.ok) {
      throw new Error('Falha no upload para o Vercel Blob.');
    }

    return json.url.split('?')[0];
  }

  // Add Moment Form Submit
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast('Por favor, selecione uma foto para o momento.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtnText.textContent = 'Enviando foto...';
    uploadStatus.textContent = 'Enviando imagem em alta resolução para a nuvem...';

    try {
      const imageUrl = await uploadFileToBlob(selectedFile);

      submitBtnText.textContent = 'Salvando momento...';
      uploadStatus.textContent = 'Registrando detalhes no álbum...';

      const momentData = {
        imageUrl,
        title: momentTitle.value.trim(),
        date: momentDate.value.trim(),
        caption: momentCaption.value.trim()
      };

      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(momentData)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Foto e história publicadas com sucesso!');
        // Reset form
        addForm.reset();
        selectedFile = null;
        fileInput.value = '';
        dropzonePrompt.classList.remove('hidden');
        dropzonePreview.classList.add('hidden');
        uploadStatus.textContent = '';
        loadMoments();
      } else {
        showToast(data.error || 'Erro ao salvar momento.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao publicar momento: ' + (err.message || 'Tente novamente.'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Publicar no Álbum';
      uploadStatus.textContent = '';
    }
  });

  // Load Moments list
  async function loadMoments() {
    try {
      const res = await fetch('/api/moments?t=' + Date.now());
      const data = await res.json();
      currentMoments = Array.isArray(data.moments) ? data.moments : [];
      renderMomentsList(currentMoments);
    } catch (err) {
      console.error('Erro ao carregar momentos:', err);
      momentsList.innerHTML = '<div class="text-center py-8 text-red-700 text-sm">Não foi possível carregar os momentos.</div>';
    }
  }

  // Render Moments in Dashboard
  function renderMomentsList(moments) {
    momentsCountBadge.textContent = `${moments.length} foto${moments.length === 1 ? '' : 's'}`;

    if (moments.length === 0) {
      momentsList.innerHTML = `
        <div class="text-center py-12 text-stone font-light text-sm">
          Nenhum momento cadastrado ainda. Use o formulário acima para publicar a primeira foto!
        </div>
      `;
      return;
    }

    momentsList.innerHTML = moments.map((m, index) => `
      <div class="p-4 sm:p-5 bg-ivory border border-champagne-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm transition-all hover:border-champagne-gold/50">
        
        <!-- Thumbnail & Info -->
        <div class="flex items-center gap-4 min-w-0">
          <span class="font-serif text-lg text-champagne-gold font-medium w-6 text-center">
            ${index + 1}
          </span>
          <img src="${m.imageUrl}" alt="${m.title || 'Foto'}" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-champagne-gold/30 flex-shrink-0">
          
          <div class="min-w-0">
            <h4 class="font-serif text-lg sm:text-xl text-espresso font-medium truncate">
              ${m.title || 'Sem título'}
            </h4>
            ${m.date ? `<span class="text-xs uppercase tracking-widest text-champagne-gold font-medium block">${m.date}</span>` : ''}
            <p class="text-xs text-stone font-light line-clamp-2 mt-0.5">
              ${m.caption || 'Sem legenda'}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <!-- Move Up -->
          <button onclick="moveMoment(${index}, -1)" ${index === 0 ? 'disabled' : ''} class="p-2 border border-champagne-gold/30 rounded hover:bg-white text-stone hover:text-espresso disabled:opacity-30 disabled:cursor-not-allowed" title="Mover para cima">
            ▲
          </button>
          <!-- Move Down -->
          <button onclick="moveMoment(${index}, 1)" ${index === moments.length - 1 ? 'disabled' : ''} class="p-2 border border-champagne-gold/30 rounded hover:bg-white text-stone hover:text-espresso disabled:opacity-30 disabled:cursor-not-allowed" title="Mover para baixo">
            ▼
          </button>
          <!-- Edit -->
          <button onclick="openEditModal('${m.id}')" class="px-3 py-1.5 border border-champagne-gold/40 rounded text-xs uppercase tracking-wider hover:bg-white text-espresso transition-colors">
            Editar
          </button>
          <!-- Delete -->
          <button onclick="deleteMoment('${m.id}')" class="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded text-xs uppercase tracking-wider transition-colors">
            Excluir
          </button>
        </div>

      </div>
    `).join('');
  }

  // Move Moment Up / Down
  window.moveMoment = async function(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentMoments.length) return;

    const temp = currentMoments[index];
    currentMoments[index] = currentMoments[targetIndex];
    currentMoments[targetIndex] = temp;

    // Update orders
    currentMoments.forEach((m, idx) => m.order = idx + 1);
    renderMomentsList(currentMoments);

    try {
      await fetch('/api/moments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ moments: currentMoments })
      });
      showToast('Ordem do álbum atualizada!');
    } catch (e) {
      showToast('Erro ao salvar nova ordem.', 'error');
      loadMoments();
    }
  };

  // Open Edit Modal
  window.openEditModal = function(id) {
    const moment = currentMoments.find(m => m.id === id);
    if (!moment) return;

    editIdInput.value = moment.id;
    editTitleInput.value = moment.title || '';
    editDateInput.value = moment.date || '';
    editCaptionInput.value = moment.caption || '';

    editModal.classList.add('active');
  };

  closeEditModalBtn.addEventListener('click', () => {
    editModal.classList.remove('active');
  });

  // Save Edit Form
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const title = editTitleInput.value.trim();
    const date = editDateInput.value.trim();
    const caption = editCaptionInput.value.trim();

    const saveBtn = document.getElementById('save-edit-btn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Salvando...</span>';

    try {
      const res = await fetch('/api/moments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ id, title, date, caption })
      });

      if (res.ok) {
        showToast('Momento atualizado com sucesso!');
        editModal.classList.remove('active');
        loadMoments();
      } else {
        const err = await res.json();
        showToast(err.error || 'Erro ao atualizar momento.', 'error');
      }
    } catch (err) {
      showToast('Erro ao atualizar momento.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>Salvar Alterações</span>';
    }
  });

  // Delete Moment
  window.deleteMoment = async function(id) {
    const moment = currentMoments.find(m => m.id === id);
    const title = moment?.title ? `"${moment.title}"` : 'este momento';

    if (!confirm(`Tem certeza que deseja excluir ${title} do álbum?`)) {
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

      if (res.ok) {
        showToast('Momento excluído do álbum!');
        loadMoments();
      } else {
        const err = await res.json();
        showToast(err.error || 'Erro ao excluir momento.', 'error');
      }
    } catch (err) {
      showToast('Erro ao excluir momento.', 'error');
    }
  };
});
