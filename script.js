/* Divas del Norte — script.js
   1. Modo oscuro   2. Menú móvil   3. Volver arriba   4. Toast
   5. Revelado al hacer scroll + enlace activo en nav
   6. Formulario de reserva + validaciones   7. Integración WhatsApp */

   document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. MODO OSCURO ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
  
    themeToggle.setAttribute('aria-pressed', html.classList.contains('dark-mode'));
  
    themeToggle.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark-mode');
      localStorage.setItem('ddn-theme', isDark ? 'dark' : 'light');
      themeToggle.setAttribute('aria-pressed', isDark);
    });
  
    /* ---------- 2. MENÚ MÓVIL ---------- */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
  
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
  
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  
    /* ---------- 3. VOLVER ARRIBA ---------- */
    const backToTop = document.getElementById('backToTop');
    backToTop.style.transition = 'opacity .3s ease';
    backToTop.style.opacity = '0';
    backToTop.style.pointerEvents = 'none';
  
    window.addEventListener('scroll', () => {
      const show = window.scrollY > 400;
      backToTop.style.opacity = show ? '1' : '0';
      backToTop.style.pointerEvents = show ? 'auto' : 'none';
    });
  
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  
    /* ---------- 4. TOAST ---------- */
    const toast = document.getElementById('toast');
    let toastTimer;
  
    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
    }
  
    /* ---------- 5. REVELADO AL HACER SCROLL + NAV ACTIVA ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
  
    revealEls.forEach(el => revealObserver.observe(el));
  
    const navAnchors = document.querySelectorAll('.nav-link');
    const trackedSections = document.querySelectorAll('main section[id], header#top');
  
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => a.classList.toggle('active', a.dataset.section === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
  
    trackedSections.forEach(sec => navObserver.observe(sec));
  
    /* ---------- 6. FORMULARIO DE RESERVA — VALIDACIONES ---------- */
    const form = document.getElementById('bookingForm');
    const dateInput = document.getElementById('date');
  
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;
    dateInput.setAttribute('min', minDate);
  
    const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÑáéíóúñÜü\s]+$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_REGEX = /^[0-9+\s()-]{7,15}$/;
  
    const fields = {
      fullName: {
        el: document.getElementById('fullName'),
        errorEl: document.getElementById('fullNameError'),
        validate(value) {
          if (!value.trim()) return 'Por favor ingresa tu nombre completo.';
          if (!NAME_REGEX.test(value.trim())) return 'El nombre solo puede contener letras y espacios.';
          return '';
        }
      },
      email: {
        el: document.getElementById('email'),
        errorEl: document.getElementById('emailError'),
        validate(value) {
          if (!value.trim()) return 'Por favor ingresa tu correo electrónico.';
          if (!EMAIL_REGEX.test(value.trim())) return 'Ingresa un correo electrónico válido.';
          return '';
        }
      },
      phone: {
        el: document.getElementById('phone'),
        errorEl: document.getElementById('phoneError'),
        validate(value) {
          if (!value.trim()) return 'Por favor ingresa tu número de celular.';
          if (!PHONE_REGEX.test(value.trim())) return 'Ingresa un número de celular válido.';
          return '';
        }
      },
      service: {
        el: document.getElementById('service'),
        errorEl: document.getElementById('serviceError'),
        validate(value) {
          if (!value) return 'Selecciona un servicio.';
          return '';
        }
      },
      date: {
        el: document.getElementById('date'),
        errorEl: document.getElementById('dateError'),
        validate(value) {
          if (!value) return 'Selecciona una fecha.';
          if (value < minDate) return 'La fecha no puede ser anterior a hoy.';
          return '';
        }
      },
      time: {
        el: document.getElementById('time'),
        errorEl: document.getElementById('timeError'),
        validate(value) {
          if (!value) return 'Selecciona un horario.';
          return '';
        }
      }
    };
  
    function validateField(key) {
      const { el, errorEl, validate } = fields[key];
      const message = validate(el.value);
      errorEl.textContent = message;
      el.classList.toggle('invalid', Boolean(message));
      return !message;
    }
  
    Object.keys(fields).forEach(key => {
      const { el } = fields[key];
      el.addEventListener('blur', () => validateField(key));
      el.addEventListener('input', () => {
        if (el.classList.contains('invalid')) validateField(key);
      });
    });
  
    /* ---------- 7. ENVÍO DEL FORMULARIO + WHATSAPP ---------- */
    const WHATSAPP_NUMBER = '59160042152'; // Bolivia (591) + 60042152
  
    form.addEventListener('submit', (event) => {
      event.preventDefault();
  
      let isValid = true;
      Object.keys(fields).forEach(key => {
        if (!validateField(key)) isValid = false;
      });
  
      if (!isValid) {
        showToast('Revisa los campos marcados en rojo.');
        return;
      }
  
      const data = {
        fullName: fields.fullName.el.value.trim(),
        email: fields.email.el.value.trim(),
        phone: fields.phone.el.value.trim(),
        service: fields.service.el.value,
        date: fields.date.el.value,
        time: fields.time.el.value
      };
  
      const [y, m, d] = data.date.split('-');
      const formattedDate = `${d}/${m}/${y}`;
  
      const message =
        `Hola Divas del Norte, quiero reservar una cita ✨%0A%0A` +
        `*Nombre:* ${data.fullName}%0A` +
        `*Correo:* ${data.email}%0A` +
        `*Celular:* ${data.phone}%0A` +
        `*Servicio:* ${data.service}%0A` +
        `*Fecha:* ${formattedDate}%0A` +
        `*Hora:* ${data.time}`;
  
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  
      showToast('Excelente, cita reservada.');
      window.open(whatsappUrl, '_blank', 'noopener');
  
      form.reset();
      Object.keys(fields).forEach(key => {
        fields[key].errorEl.textContent = '';
        fields[key].el.classList.remove('invalid');
      });
    });
  
    document.getElementById('year').textContent = new Date().getFullYear();
  });