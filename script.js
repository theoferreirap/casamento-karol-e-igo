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
  // Wedding Date: 24 de Outubro de 2026 às 16:30
  const weddingDate = new Date('2026-10-24T16:30:00-03:00').getTime();

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
   4. GIFT REGISTRY & EXPERIENCES MODAL
   ========================================================================== */
function initGifts() {
  const giftModal = document.getElementById('gift-modal');
  const closeGiftModal = document.getElementById('close-gift-modal');
  const giftButtons = document.querySelectorAll('.btn-gift');
  const pixKeyCopyBtn = document.getElementById('copy-pix-btn');
  const pixKeyInput = document.getElementById('pix-key-input');
  const giftItemTitle = document.getElementById('gift-modal-item-title');
  const giftItemValue = document.getElementById('gift-modal-item-val');
  const giftForm = document.getElementById('gift-form');

  giftButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-gift-title') || 'Presente Especial';
      const value = btn.getAttribute('data-gift-value') || 'Valor Livre';

      if (giftItemTitle) giftItemTitle.textContent = title;
      if (giftItemValue) giftItemValue.textContent = value;

      if (giftModal) giftModal.classList.add('active');
    });
  });

  if (closeGiftModal && giftModal) {
    closeGiftModal.addEventListener('click', () => {
      giftModal.classList.remove('active');
    });
  }

  if (giftModal) {
    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) giftModal.classList.remove('active');
    });
  }

  // Copy Pix Key
  if (pixKeyCopyBtn && pixKeyInput) {
    pixKeyCopyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pixKeyInput.value).then(() => {
        const originalText = pixKeyCopyBtn.innerHTML;
        pixKeyCopyBtn.innerHTML = `
          <svg class="w-4 h-4 text-emerald-600 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg> Chave Copiada!
        `;
        showToast('Chave Pix copiada para a área de transferência!');
        setTimeout(() => {
          pixKeyCopyBtn.innerHTML = originalText;
        }, 2500);
      }).catch(() => {
        pixKeyInput.select();
        document.execCommand('copy');
        showToast('Chave Pix copiada!');
      });
    });
  }

  if (giftForm) {
    giftForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Agradecemos de coração pelo seu carinho e generosidade!');
      setTimeout(() => {
        if (giftModal) giftModal.classList.remove('active');
        giftForm.reset();
      }, 1500);
    });
  }
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
   5.5. ÁLBUM DINÂMICO "ANTES DO SIM"
   ========================================================================== */
async function initAntesDoSim() {
  const container = document.getElementById('moments-container');
  if (!container) return;

  try {
    const res = await fetch('/api/moments?t=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    const moments = data.moments;

    if (Array.isArray(moments) && moments.length > 0) {
      renderMomentsPublic(moments, container);
    }
  } catch (err) {
    console.log('Utilizando momentos pré-renderizados locais:', err);
  }
}

function renderMomentsPublic(moments, container) {
  container.innerHTML = moments.map((m) => `
    <div class="moment-entry reveal-on-scroll">
      <div class="moment-img-col">
        <div class="moment-img-frame" onclick="openLightboxFromMoment('${m.imageUrl}', '${m.title ? m.title.replace(/'/g, "\\'") : 'Momento'}')">
          <div class="moment-img-wrapper aspect-[4/5]">
            <img src="${m.imageUrl}" alt="${m.title || 'Momento antes do sim'}" loading="lazy">
          </div>
        </div>
      </div>
      <div class="moment-text-col">
        ${m.date ? `<span class="moment-badge-year">${m.date}</span>` : ''}
        ${m.title ? `<h3 class="moment-title-text">${m.title}</h3>` : ''}
        ${m.caption ? `<p class="moment-caption-text">${m.caption}</p>` : ''}
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

  const eventTitle = "Casamento Karolina & Igo";
  const eventDetails = "Celebração do nosso amor e casamento. Cerimônia às 16:30 seguida de recepção e jantar.";
  const eventLocation = "Villa Felicitá - Alameda das Hortênsias, 1200 - Serra da Cantareira, SP";
  const startDate = "20261024T193000Z"; // UTC for 16:30 BRT
  const endDate = "20261025T070000Z"; // UTC for 04:00 BRT next day

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
      link.setAttribute('download', 'Casamento_Karolina_e_Igo.ics');
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
    masterGain.gain.setValueAtTime(0.025, audioCtx.currentTime);
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
          noteGain.gain.linearRampToValueAtTime(0.02, now + 1.0);
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
      bgAudio.volume = 0.20; // Volume suave ambiente (20%)
      bgAudio.play().then(() => {
        showToast('Tocando: Duas Metades — Jorge & Mateus');
      }).catch((err) => {
        console.log('Audio autoplay/source notice:', err);
        if (!audioCtx) createRomanticAtmosphere();
        else if (audioCtx.state === 'suspended') audioCtx.resume();
        showToast('Tocando: Duas Metades — Jorge & Mateus');
      });
    } else {
      if (!audioCtx) createRomanticAtmosphere();
      else if (audioCtx.state === 'suspended') audioCtx.resume();
      showToast('Tocando: Duas Metades — Jorge & Mateus');
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
