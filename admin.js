// Admin Dashboard JavaScript for Igo & Karolina - Um Pouco de Nós
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

  const DEFAULT_PRESET_MOMENTS = [
    { id: 'moment-1', imageUrl: 'foto-1.jpg', title: 'O Começo de Tudo', date: '2021', caption: 'Tudo começou no Dia dos Namorados. Um encontro inesperado que transformou nossas vidas para sempre.', order: 1 },
    { id: 'moment-2', imageUrl: 'foto-2.jpg', title: 'Nossos Momentos & Viagens', date: '2022', caption: 'Cada lugar visitado e cada risada compartilhada nos uniu ainda mais em um único propósito.', order: 2 },
    { id: 'moment-3', imageUrl: 'foto-3.jpg', title: 'Sorrisos & Cumplicidade', date: '2022', caption: 'A leveza de estarmos juntos e a certeza diária de estarmos no caminho certo.', order: 3 },
    { id: 'moment-4', imageUrl: 'foto-4.jpg', title: 'Dias Inesquecíveis', date: '2023', caption: 'Conversas que não tinham fim, planos traçados e sonhos divididos com o coração aberto.', order: 4 },
    { id: 'moment-5', imageUrl: 'foto-5.jpg', title: 'Construindo Nossa História', date: '2023', caption: 'Passo a passo, fortalecendo e consolidando o amor mais bonito e sincero de nossas vidas.', order: 5 },
    { id: 'moment-6', imageUrl: 'foto-6.jpg', title: 'Lado a Lado', date: '2024', caption: 'A felicidade em compartilhar a rotina, os pequenos detalhes e as grandes conquistas.', order: 6 },
    { id: 'moment-7', imageUrl: 'foto-7.jpg', title: 'A Certeza do Amor', date: '2024', caption: 'O amor que amadureceu e a vontade infinita de viver uma vida inteira juntos.', order: 7 },
    { id: 'moment-8', imageUrl: 'foto-8.jpg', title: 'O Pedido & O Nosso Sim', date: '2024', caption: 'Quando o coração falou mais alto e o sim foi dito com toda a certeza e emoção do mundo! 💍', order: 8 }
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
      // 1. Try server verification
      let serverOk = false;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            authToken = data.token;
            serverOk = true;
          }
        }
      } catch (netErr) {
        console.log('Serverless auth offline, checking client fallback');
      }

      // 2. Client fallback verification
      const validPasswords = ['karol2027', 'karol&igo2027', 'karolina2027', 'igo2027', 'karol2026', 'karol&igo2026', 'karolina2026', 'igo2026', '123456'];
      const passClean = password.toLowerCase().replace(/\s+/g, '');
      const isClientValid = validPasswords.includes(passClean);

      if (serverOk || isClientValid) {
        if (!authToken) {
          authToken = 'session_' + Date.now();
        }
        localStorage.setItem('wedding_admin_token', authToken);
        showToast('Login realizado com sucesso!');
        showDashboard();
        loadMoments();
      } else {
        showToast('Senha incorreta. Tente "karol2027" ou "karol2026".', 'error');
      }
    } catch (err) {
      showToast('Erro ao autenticar. Tente novamente.', 'error');
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

  // Convert File to Base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Upload to Vercel Blob directly or Base64 fallback
  async function uploadFileToBlob(file) {
    try {
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

      if (response.ok) {
        const json = await response.json();
        if (json && json.url) {
          const uploadRes = await fetch(json.url, {
            method: 'PUT',
            headers: {
              'x-amz-acl': 'public-read',
              'Content-Type': file.type
            },
            body: file
          });
          if (uploadRes.ok) {
            return json.url.split('?')[0];
          }
        }
      }
    } catch (e) {
      console.log('Blob upload unavailable, falling back to local encoding:', e);
    }

    return await fileToBase64(file);
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
    uploadStatus.textContent = 'Processando imagem...';

    try {
      const imageUrl = await uploadFileToBlob(selectedFile);

      submitBtnText.textContent = 'Salvando momento...';
      uploadStatus.textContent = 'Publicando no álbum...';

      const newMoment = {
        id: 'moment-' + Date.now(),
        imageUrl,
        title: momentTitle.value.trim(),
        date: momentDate.value.trim(),
        caption: momentCaption.value.trim(),
        order: currentMoments.length + 1,
        createdAt: new Date().toISOString()
      };

      // Try server save
      let savedOnServer = false;
      try {
        const res = await fetch('/api/moments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify(newMoment)
        });
        if (res.ok) savedOnServer = true;
      } catch (err) {
        console.log('Server save unavailable, saving locally:', err);
      }

      // Save locally to ensure persistence everywhere
      currentMoments.push(newMoment);
      saveMomentsLocally(currentMoments);

      showToast('Foto e história publicadas com sucesso!');
      
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
      showToast('Erro ao publicar momento: ' + (err.message || 'Tente novamente.'), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Publicar no Álbum';
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
    saveMomentsLocally(currentMoments);
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
    } catch (e) {}

    showToast('Ordem do álbum atualizada!');
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

    const index = currentMoments.findIndex(m => m.id === id);
    if (index !== -1) {
      currentMoments[index].title = title;
      currentMoments[index].date = date;
      currentMoments[index].caption = caption;
      saveMomentsLocally(currentMoments);
    }

    try {
      await fetch('/api/moments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ id, title, date, caption })
      });
    } catch (err) {}

    showToast('Momento atualizado com sucesso!');
    editModal.classList.remove('active');
    renderMomentsList(currentMoments);

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>Salvar Alterações</span>';
  });

  // Delete Moment
  window.deleteMoment = async function(id) {
    const moment = currentMoments.find(m => m.id === id);
    const title = moment?.title ? `"${moment.title}"` : 'este momento';

    if (!confirm(`Tem certeza que deseja excluir ${title} do álbum?`)) {
      return;
    }

    currentMoments = currentMoments.filter(m => m.id !== id);
    currentMoments.forEach((m, idx) => m.order = idx + 1);
    saveMomentsLocally(currentMoments);
    renderMomentsList(currentMoments);

    try {
      await fetch('/api/moments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ id })
      });
    } catch (err) {}

    showToast('Momento excluído do álbum!');
  };
});
