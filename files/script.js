/* ==========================================================================
   NARUTO UNDERDOGS CUP — Registration Page Script
   Vanilla JavaScript, modular functions, no dependencies.
   ========================================================================== */

'use strict';

/* -------------------------------------------------------------------------
   Google Apps Script endpoint (exact, provided)
   ------------------------------------------------------------------------- */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxmeQ0d3MGdUTDfUnVL1iy8qIM2XKHuXK9k643nA1WQsE7y0zSZi5APHs.../exec";

/* =========================================================================
   1. COUNTDOWN TIMER
   Target: 25 July 2026, 00:00:00 local time (matches start date)
   ========================================================================= */
(function initCountdown() {
  const TARGET_DATE = new Date('2026-07-25T00:00:00');

  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now = new Date();
    let diff = TARGET_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      els.days.textContent = '00';
      els.hours.textContent = '00';
      els.minutes.textContent = '00';
      els.seconds.textContent = '00';
      clearInterval(timerId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);
  }

  tick();
  const timerId = setInterval(tick, 1000);
})();

/* =========================================================================
   2. AMBIENT PARTICLE BACKGROUND (lightweight canvas)
   ========================================================================= */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
  }

  function createParticles() {
    const count = Math.min(60, Math.floor((width * height) / 45000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.6,
      speedY: Math.random() * 0.35 + 0.08,
      drift: Math.random() * 0.4 - 0.2,
      alpha: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.5 ? '255,138,61' : '224,39,44',
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.drift;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
    }
    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();

/* =========================================================================
   3. SCROLL REVEAL ANIMATIONS
   ========================================================================= */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

/* =========================================================================
   4. FILE DROP UI (Team Logo upload)
   ========================================================================= */
(function initFileDrop() {
  const dropZone = document.getElementById('fileDrop');
  const fileInput = document.getElementById('teamLogo');
  const dropText = document.getElementById('fileDropText');
  if (!dropZone || !fileInput) return;

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      dropText.textContent = fileInput.files[0].name;
    } else {
      dropText.textContent = 'Choose an image or drag it here';
    }
  });

  ['dragover', 'dragenter'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove('is-dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      dropText.textContent = e.dataTransfer.files[0].name;
    }
  });
})();

/* =========================================================================
   5. FORM VALIDATION
   ========================================================================= */
const Validators = {
  required(value) {
    return value.trim().length > 0;
  },
  email(value) {
    // Standard practical email pattern
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value.trim());
  },
  whatsapp(value) {
    // Accepts optional leading +, digits, spaces, dashes; 7-15 digits total
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  },
};

const REQUIRED_TEXT_FIELDS = [
  'teamName', 'captainName', 'captainUID', 'captainID',
  'player2Name', 'player2UID',
  'player3Name', 'player3UID',
  'player4Name', 'player4UID',
  'country', 'city',
];

function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`err-${fieldId}`);
  if (!input) return;

  if (message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    input.setAttribute('aria-invalid', 'false');
    if (errorEl) errorEl.textContent = '';
  }
}

function clearFieldState(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`err-${fieldId}`);
  if (!input) return;
  input.classList.remove('is-invalid', 'is-valid');
  if (errorEl) errorEl.textContent = '';
}

function validateForm(form) {
  let isValid = true;

  // Required simple text fields
  REQUIRED_TEXT_FIELDS.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (!Validators.required(input.value)) {
      setFieldError(id, 'This field is required.');
      isValid = false;
    } else {
      setFieldError(id, '');
    }
  });

  // Email
  const email = document.getElementById('email');
  if (!Validators.required(email.value)) {
    setFieldError('email', 'Email is required.');
    isValid = false;
  } else if (!Validators.email(email.value)) {
    setFieldError('email', 'Enter a valid email address.');
    isValid = false;
  } else {
    setFieldError('email', '');
  }

  // WhatsApp
  const whatsapp = document.getElementById('whatsapp');
  if (!Validators.required(whatsapp.value)) {
    setFieldError('whatsapp', 'WhatsApp number is required.');
    isValid = false;
  } else if (!Validators.whatsapp(whatsapp.value)) {
    setFieldError('whatsapp', 'Enter a valid WhatsApp number (7–15 digits).');
    isValid = false;
  } else {
    setFieldError('whatsapp', '');
  }

  // Agreement checkbox
  const agree = document.getElementById('agreeRules');
  const agreeError = document.getElementById('err-agreeRules');
  if (!agree.checked) {
    if (agreeError) agreeError.textContent = 'You must agree to the Tournament Rules to continue.';
    isValid = false;
  } else {
    if (agreeError) agreeError.textContent = '';
  }

  return isValid;
}

/* Live validation as the user types / blurs fields */
function attachLiveValidation() {
  const form = document.getElementById('regForm');
  if (!form) return;

  REQUIRED_TEXT_FIELDS.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => {
      if (!Validators.required(input.value)) {
        setFieldError(id, 'This field is required.');
      } else {
        setFieldError(id, '');
      }
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid') && Validators.required(input.value)) {
        setFieldError(id, '');
      }
    });
  });

  const email = document.getElementById('email');
  email.addEventListener('blur', () => {
    if (!Validators.required(email.value)) {
      setFieldError('email', 'Email is required.');
    } else if (!Validators.email(email.value)) {
      setFieldError('email', 'Enter a valid email address.');
    } else {
      setFieldError('email', '');
    }
  });

  const whatsapp = document.getElementById('whatsapp');
  whatsapp.addEventListener('blur', () => {
    if (!Validators.required(whatsapp.value)) {
      setFieldError('whatsapp', 'WhatsApp number is required.');
    } else if (!Validators.whatsapp(whatsapp.value)) {
      setFieldError('whatsapp', 'Enter a valid WhatsApp number (7–15 digits).');
    } else {
      setFieldError('whatsapp', '');
    }
  });

  const agree = document.getElementById('agreeRules');
  agree.addEventListener('change', () => {
    const agreeError = document.getElementById('err-agreeRules');
    if (agreeError) agreeError.textContent = agree.checked ? '' : 'You must agree to the Tournament Rules to continue.';
  });
}

/* =========================================================================
   6. COLLECT FORM DATA INTO JSON
   ========================================================================= */
function collectFormData(form) {
  const data = {
    teamName: form.teamName.value.trim(),
    captainName: form.captainName.value.trim(),
    captainUID: form.captainUID.value.trim(),
    captainID: form.captainID.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    email: form.email.value.trim(),
    player2Name: form.player2Name.value.trim(),
    player2UID: form.player2UID.value.trim(),
    player3Name: form.player3Name.value.trim(),
    player3UID: form.player3UID.value.trim(),
    player4Name: form.player4Name.value.trim(),
    player4UID: form.player4UID.value.trim(),
    substituteName: form.substituteName.value.trim(),
    substituteUID: form.substituteUID.value.trim(),
    country: form.country.value.trim(),
    city: form.city.value.trim(),
    logo: (form.teamLogo.files && form.teamLogo.files[0]) ? form.teamLogo.files[0].name : '',
  };
  return data;
}

/* =========================================================================
   7. SUBMIT REGISTRATION TO GOOGLE APPS SCRIPT
   ========================================================================= */
async function submitRegistration(formData) {
  // IMPORTANT: Google Apps Script web apps do not support CORS preflight
  // (OPTIONS) requests. Using 'text/plain' keeps this a "simple request"
  // so the browser sends the POST directly without a preflight check.
  // Apps Script still reads the raw body as JSON text via e.postData.contents
  // and JSON.parse() on the backend, so no data is lost.
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }

  // The Apps Script endpoint may return JSON or plain text; handle both gracefully.
  let result;
  try {
    result = await response.json();
  } catch (parseError) {
    // Not JSON — treat as a plain success response
    result = { status: 'ok' };
  }

  return result;
}

/* =========================================================================
   8. FORM SUBMIT HANDLER
   ========================================================================= */
function initFormSubmission() {
  const form = document.getElementById('regForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formStatus.textContent = '';
    formStatus.classList.remove('is-error');

    const isValid = validateForm(form);
    if (!isValid) {
      formStatus.textContent = 'Please fix the highlighted fields before submitting.';
      formStatus.classList.add('is-error');
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Disable button + show spinner
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    formStatus.textContent = 'Submitting your registration…';

    const formData = collectFormData(form);

    try {
      await submitRegistration(formData);
      formStatus.textContent = '';
      showSuccessScreen();
      form.reset();
      document.getElementById('fileDropText').textContent = 'Choose an image or drag it here';
      // Reset all field validation states
      [...REQUIRED_TEXT_FIELDS, 'email', 'whatsapp'].forEach(clearFieldState);
    } catch (error) {
      console.error('Registration submission failed:', error);
      formStatus.textContent =
        'We could not submit your registration. Please check your connection and try again.';
      formStatus.classList.add('is-error');
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

/* =========================================================================
   9. SUCCESS OVERLAY + CONFETTI
   ========================================================================= */
function showSuccessScreen() {
  const overlay = document.getElementById('successOverlay');
  if (!overlay) return;
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  launchConfetti();

  // Move focus into the dialog for accessibility
  const heading = document.getElementById('success-heading');
  if (heading) heading.setAttribute('tabindex', '-1'), heading.focus();
}

function hideSuccessScreen() {
  const overlay = document.getElementById('successOverlay');
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function launchConfetti() {
  const canvas = document.getElementById('confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  if (prefersReducedMotion) return;

  const colors = ['#ff7a2d', '#ffb347', '#e0272c', '#f0a94e', '#f4ece2'];
  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 2.5 + 2,
    speedX: Math.random() * 2 - 1,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 8 - 4,
  }));

  let frame = 0;
  const maxFrames = 240;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });

    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}

/* =========================================================================
   10. INIT
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  attachLiveValidation();
  initFormSubmission();

  const returnBtn = document.getElementById('returnBtn');
  if (returnBtn) {
    returnBtn.addEventListener('click', hideSuccessScreen);
  }
});
