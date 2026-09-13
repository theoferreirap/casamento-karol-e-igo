/**
 * WEDDING EDITORIAL INTERACTIVE SCRIPTS
 * Complete Luxury Features & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroVideo();
  initCountdown();
  initAntesDoSim();
  initRSVP();
  initGifts();
  initGallery();
  initCalendar();
  initAudioPlayer();
  initScrollAnimations();
  initMobileMenu();
});

/* ==========================================================================
   1. NAVBAR SCROLL EFFECT
   ========================================================================== */
function initNavbar() {
  const nav = document.querySelector('.luxury-nav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. REAL-TIME COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  // Wedding Date: 16 de Outubro de 2027 às 19:00
  const weddingDate = new Date('2027-10-16T19:00:00-03:00').getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function update() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   3. RSVP FORM & CONFIRMATION MODAL
   ========================================================================== */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  const modal = document.getElementById('rsvp-success-modal');
  const closeModalBtn = document.getElementById('close-rsvp-modal');
  const whatsappBtn = document.getElementById('rsvp-whatsapp-btn');
  const radioCards = document.querySelectorAll('.rsvp-radio-card');

  // Radio button active state
  radioCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      radio.checked = true;
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('guest-name').value.trim();
      const phone = document.getElementById('guest-phone').value.trim();
      const attendance = form.querySelector('input[name="attending"]:checked')?.value || 'sim';
      const message = document.getElementById('guest-message') ? document.getElementById('guest-message').value.trim() : '';

      if (!name) {
        showToast('Por favor, informe o seu nome completo.');
        return;
      }

      // Save to localStorage for demo persistence
      const rsvpData = {
        name,
        phone,
        attendance,
        message,
        date: new Date().toISOString()
      };
      localStorage.setItem('wedding_rsvp_' + encodeURIComponent(name), JSON.stringify(rsvpData));

      // Prepare WhatsApp message
      const isAttending = attendance === 'sim';
      const statusText = isAttending ? '✨ *PRESENÇA CONFIRMADA!*' : '😔 *NÃO PODEREI COMPARECER*';
      let waText = `${statusText}\n\n`;
      waText += `*Convidado(a):* ${name}\n`;
      if (phone) waText += `*Telefone:* ${phone}\n`;
      if (message) waText += `*Mensagem aos noivos:* "${message}"\n`;

      const encodedWa = encodeURIComponent(waText);
      // Número de WhatsApp oficial dos noivos
      const waNumber = '5531986435807';
      const waUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedWa}`;

      if (whatsappBtn) {
        whatsappBtn.href = waUrl;
      }

      // Update modal text depending on attendance
      const modalTitle = document.getElementById('rsvp-modal-title');
      const modalMessage = document.getElementById('rsvp-modal-msg');
      if (modalTitle && modalMessage) {
        if (isAttending) {
          modalTitle.textContent = 'Presença confirmada com sucesso!';
          modalMessage.textContent = 'Redirecionando para o WhatsApp dos noivos...';
        } else {
          modalTitle.textContent = 'Agradecemos o seu carinho!';
          modalMessage.textContent = 'Redirecionando para o WhatsApp dos noivos...';
        }
      }

      // Open success modal and toast
      if (modal) modal.classList.add('active');
      showToast('Abrindo WhatsApp para envio da confirmação...');

      // Redirect immediately to WhatsApp
      window.open(waUrl, '_blank');

      form.reset();
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

/* ==========================================================================
   4. PRESENTES: COPIAR ENDEREÇO & PIX
   ========================================================================== */
function initGifts() {
  window.copyAddressText = function() {
    const address = "Rua Martinica, 432, Ap 1002 Bloco 1, Santa Branca, Belo Horizonte - MG";
    navigator.clipboard.writeText(address).then(() => {
      const btn = document.getElementById('copy-addr-btn');
      const textSpan = document.getElementById('copy-addr-text');
      if (textSpan) textSpan.innerHTML = '✓ Endereço Copiado!';
      showToast('Endereço de entrega copiado para a área de transferência! ✨');
      setTimeout(() => {
        if (textSpan) textSpan.innerHTML = 'Copiar Endereço';
      }, 3000);
    }).catch(() => {
      showToast('Rua Martinica, 432, Ap 1002 Bloco 1, Santa Branca - BH');
    });
  };

  window.copyPixKeyText = function() {
    const pixKey = "122.475.946-03";
    navigator.clipboard.writeText(pixKey).then(() => {
      const btn = document.getElementById('copy-pix-direct-btn');
      const textSpan = document.getElementById('copy-pix-direct-text');
      if (textSpan) textSpan.innerHTML = '✓ Chave Pix Copiada!';
      showToast('Chave Pix copiada com sucesso! (Karolina Teixeira Fonseca) ✨');
      setTimeout(() => {
        if (textSpan) textSpan.innerHTML = 'Copiar Chave Pix';
      }, 3000);
    }).catch(() => {
      showToast('Chave Pix copiada para a área de transferência! ✨');
    });
  };
}

/* ==========================================================================
   5. PHOTO GALLERY LIGHTBOX
   ========================================================================== */
function initGallery() {
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || !lightboxImg || galleryItems.length === 0) return;

  const images = Array.from(galleryItems).map(item => ({
    src: item.getAttribute('data-full') || item.querySelector('img').src,
    alt: item.querySelector('img').alt || 'Fotografia do casal'
  }));

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNext);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation & ESC
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight' && images.length > 0) showNext();
    if (e.key === 'ArrowLeft' && images.length > 0) showPrev();
  });

  // Lightbox helper for dynamic moments
  window.openLightboxFromMoment = function(src, alt = 'Fotografia do momento') {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
}

/* ==========================================================================
   5.5. ÁLBUM DINÂMICO "UM POUCO DE NÓS"
   ========================================================================== */
async function initAntesDoSim() {
  const container = document.getElementById('moments-container');
  if (!container) return;

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
      }
    }

    if (Array.isArray(moments) && moments.length > 0) {
      renderMomentsPublic(moments, container);
    }
  } catch (err) {
    const localSaved = localStorage.getItem('wedding_moments_list');
    if (localSaved) {
      const moments = JSON.parse(localSaved);
      if (Array.isArray(moments) && moments.length > 0) {
        renderMomentsPublic(moments, container);
      }
    }
  }
}

function renderMomentsPublic(moments, container) {
  container.className = "grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 reveal-on-scroll";
  container.innerHTML = moments.map((m) => `
    <div class="gallery-item aspect-[4/5] rounded-sm border border-champagne-gold/25 shadow-sm" onclick="openLightboxFromMoment('${m.imageUrl}', '${m.title ? m.title.replace(/'/g, "\\'") : 'Um Pouco de Nós'}')">
      <img src="${m.imageUrl}" alt="${m.title || 'Um Pouco de Nós'}" class="object-cover w-full h-full" loading="lazy">
      <div class="gallery-overlay">
        <div class="gallery-zoom-icon">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
          </svg>
        </div>
      </div>
    </div>
  `).join('');

  // Re-observe newly rendered elements
  if (typeof initScrollAnimations === 'function') {
    initScrollAnimations();
  }
}

/* ==========================================================================
   6. CALENDAR INTEGRATION (Google Calendar & Apple/Outlook .ICS)
   ========================================================================== */
function initCalendar() {
  const gcalBtn = document.getElementById('add-to-gcal');
  const icalBtn = document.getElementById('download-ical');

  const eventTitle = "Casamento Igo & Karolina";
  const eventDetails = "Celebração do nosso amor e casamento. Cerimônia às 19:00.";
  const eventLocation = "Igreja Batista Getsêmani Missão Venda Nova - Rua Benjamim Alves, 15 - Minas Caixa, Belo Horizonte - MG, 31610-370";
  const startDate = "20271016T220000Z"; // UTC for 19:00 BRT
  const endDate = "20271017T070000Z"; // UTC for 04:00 BRT next day

  if (gcalBtn) {
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(eventLocation)}&sf=true&output=xml`;
    gcalBtn.href = gcalUrl;
    gcalBtn.target = "_blank";
  }

  if (icalBtn) {
    icalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding Editorial//PT',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `SUMMARY:${eventTitle}`,
        `DESCRIPTION:${eventDetails}`,
        `LOCATION:${eventLocation}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Casamento_Igo_e_Karolina.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Convite salvo para o seu calendário!');
    });
  }
}

/* ==========================================================================
   7. AMBIENT AUDIO PLAYER (Duas Metades — Jorge & Mateus)
   ========================================================================== */
function initAudioPlayer() {
  const audioBtn = document.getElementById('ambient-audio-toggle');
  const bgAudio = document.getElementById('bg-audio');
  const waves = document.getElementById('music-waves');
  const statusText = document.getElementById('audio-status-text');

  if (!audioBtn) return;

  let isPlaying = false;
  let audioCtx = null;
  let masterGain = null;
  let chordsInterval = null;

  // Harmonious romantic acoustic progression inspired by "Duas Metades" (D - A/C# - Bm - G)
  function createRomanticAtmosphere() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.008, audioCtx.currentTime); // Volume suave ambiente (< 9%)
    masterGain.connect(audioCtx.destination);

    // D major chord progression (D - F#m - Bm - G)
    const chordProgressions = [
      [293.66, 369.99, 440.00, 587.33], // D maj
      [277.18, 369.99, 440.00, 554.37], // F#m / C#
      [246.94, 293.66, 369.99, 493.88], // Bm
      [196.00, 246.94, 293.66, 392.00]  // G maj
    ];

    let chordIndex = 0;

    function playChord() {
      if (!isPlaying || !audioCtx) return;
      const notes = chordProgressions[chordIndex];
      chordIndex = (chordIndex + 1) % chordProgressions.length;

      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (!isPlaying || !audioCtx) return;
          const osc = audioCtx.createOscillator();
          const noteGain = audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

          const now = audioCtx.currentTime;
          noteGain.gain.setValueAtTime(0, now);
          noteGain.gain.linearRampToValueAtTime(0.008, now + 1.0);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 4.3);
        }, i * 200);
      });
    }

    playChord();
    chordsInterval = setInterval(playChord, 3600);
  }

  function playMusic() {
    isPlaying = true;
    if (waves) waves.classList.remove('paused');
    if (statusText) statusText.textContent = 'Duas Metades: Tocando';

    if (bgAudio) {
      bgAudio.volume = 0.08; // Volume suave ambiente em 8% (< 9%)
      bgAudio.play().then(() => {
        showToast('Tocando: Duas Metades — Jorge & Mateus (Volume Suave)');
      }).catch((err) => {
        console.log('Audio autoplay/source notice:', err);
        if (!audioCtx) createRomanticAtmosphere();
        else if (audioCtx.state === 'suspended') audioCtx.resume();
        showToast('Tocando: Duas Metades — Jorge & Mateus (Volume Suave)');
      });
    } else {
      if (!audioCtx) createRomanticAtmosphere();
      else if (audioCtx.state === 'suspended') audioCtx.resume();
      showToast('Tocando: Duas Metades — Jorge & Mateus (Volume Suave)');
    }
  }

  function pauseMusic() {
    isPlaying = false;
    if (bgAudio) bgAudio.pause();
    if (audioCtx) audioCtx.suspend();
    if (waves) waves.classList.add('paused');
    if (statusText) statusText.textContent = 'Duas Metades: Pausada';
    showToast('Música pausada');
  }

  audioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isPlaying) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  // Attempt instant autoplay on page load
  playMusic();

  // Also bind to any early user action (scroll, touch, click, mousemove) to ensure sound starts
  const autoPlayEvents = ['click', 'touchstart', 'scroll', 'mousemove', 'wheel', 'keydown'];
  const handleFirstInteraction = () => {
    if (!isPlaying) {
      playMusic();
    }
    autoPlayEvents.forEach(evt => {
      window.removeEventListener(evt, handleFirstInteraction);
      document.removeEventListener(evt, handleFirstInteraction);
    });
  };

  autoPlayEvents.forEach(evt => {
    window.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
    document.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
  });
}

/* ==========================================================================
   8. INTERSECTION OBSERVER - SCROLL REVEAL
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once animated, unobserve for performance
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   9. MOBILE MENU
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const menuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !menuOverlay) return;

  function openMenu() {
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   10. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   11. HERO VIDEO BACKGROUND CONTROLLER
   ========================================================================== */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const toggleBtn = document.getElementById('hero-video-toggle');
  const playIcon = document.getElementById('video-play-icon');
  const pauseIcon = document.getElementById('video-pause-icon');

  if (!video || !toggleBtn) return;

  // Attempt auto play
  video.play().catch(() => {
    // Autoplay prevented by browser, show play icon
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
  });

  toggleBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      showToast('Vídeo em reprodução');
    } else {
      video.pause();
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      showToast('Vídeo pausado');
    }
  });
}
