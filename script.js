// sitio: animaciones, reveals, lightbox, sticky header, accesibilidad global
(function(){
  "use strict";


  // 2) IntersectionObserver for reveal animations
  function initReveal(){
    const io = new IntersectionObserver((items) => {
      items.forEach(i => {
        if(i.isIntersecting) {
          i.target.classList.add('is-visible');
          io.unobserve(i.target);
        }
      });
    }, { root: null, threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // 3) Lightbox for images (blogs/obras)
  function initLightbox(){
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `<button aria-label="Cerrar" class="lb-close" style="position:absolute;right:28px;top:22px;background:#fff;border-radius:50%;width:44px;height:44px;border:none;font-size:18px;">✕</button><img alt="" />`;
    document.body.appendChild(lb);
    const imgEl = lb.querySelector('img');
    const closeBtn = lb.querySelector('.lb-close');

    function open(src, alt='') {
      imgEl.src = src;
      imgEl.alt = alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      lb.classList.remove('open');
      imgEl.src = '';
      document.body.style.overflow = '';
    }

    document.addEventListener('click', e=>{
      // open when clicking blog/obra images
      const photo = e.target.closest('.blog-photo, .obra-foto-card .servicio-content, .servicio-foto-card .detalle-figure, .thumb img, .detalle-figure img');
      if(photo){
        const src = photo.style && photo.style.backgroundImage ? photo.style.backgroundImage.replace(/url\(|\)|'|"/g,'') : (photo.querySelector('img') && photo.querySelector('img').src);
        if(src) { open(src, photo.getAttribute('alt') || '') }
      }
      if(e.target.matches('.lb-close') || e.target === lb) close();
    });

    document.addEventListener('keydown', e=> {
      if(e.key === 'Escape' && lb.classList.contains('open')) close();
    });
  }

  // 4) Smooth scrolling for anchors and servicio-link
  function initSmoothScroll(){
    document.addEventListener('click', (e)=> {
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      const id = a.getAttribute('href').slice(1);
      if(!id) return;
      const target = document.getElementById(id);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  // 5) Enhance forms: simple client-side validation highlight
  function initForms(){
    document.addEventListener('submit', e=>{
      const f = e.target;
      if(!f.matches('form')) return;
      // check required inputs quickly and add focused outline
      const invalid = Array.from(f.querySelectorAll('[required]')).filter(i=>!i.value.trim());
      invalid.forEach(i => {
        i.animate([{ boxShadow: '0 0 0 4px rgba(255,90,90,0.12)'},{ boxShadow: 'none' }], { duration:320 });
      });
    });
  }

  // 6) Add lazy loading fallback for backgrounds via data-bg
  function initLazyBackgrounds(){
    document.querySelectorAll('[data-bg]').forEach(el => {
      const src = el.dataset.bg;
      if(!src) return;
      const img = new Image();
      img.onload = () => el.style.backgroundImage = `url("${src}")`;
      img.src = src;
    });
  }

  // 7) Misc: make .container-inner wrapper if missing in sections with full-bleed
  function ensureContainerInner(){
    document.querySelectorAll('section.full-bleed > .container').forEach(c=>{
      if(!c.querySelector(':scope > .container-inner')){
        const inner = document.createElement('div');
        inner.className = 'container-inner';
        while(c.firstChild) inner.appendChild(c.firstChild);
        c.appendChild(inner);
      }
    });
  }

  // init on ready
  document.addEventListener('DOMContentLoaded', ()=>{
    ensureContainerInner();
    initStickyHeader();
    initReveal();
    initLightbox();
    initSmoothScroll();
    initForms();
    initLazyBackgrounds();

    // pequeñas animaciones por carga para secciones comunes
    (function initSectionLoadAnimations(){
      if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const classes = ['.privacy-card', '.intro-text', '.privacy-cta', '.content-wide'];
      const els = Array.from(document.querySelectorAll(classes.join(',')));
      els.forEach((el, i) => {
        // evita re-animar elementos ya procesados
        if(el.classList.contains('animate-text')) return;
        el.style.animationDelay = (i * 80) + 'ms';
        // forzar repint breve antes de añadir la clase
        requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add('animate-text')));
      });
    })();
  });

})();



  const focusableSelector = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function trapFocus(container){
    const nodes = Array.from(container.querySelectorAll(focusableSelector));
    if(!nodes.length) return () => {};
    const first = nodes[0], last = nodes[nodes.length-1];
    function handle(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }

  let releaseTrap = null;
  // helper functions for focus trap are above; mobile menu initialization
  // is handled below in initMobileMenuSafe — removed duplicate/broken handlers.
/* -------------------------
   Mobile menu — init seguro aunque header sea injectado dinámicamente
   - delegación click + focus trap
   ------------------------- */
(function initMobileMenuSafe(){
  if (window.__mobileMenuSafeInit) return;
  window.__mobileMenuSafeInit = true;

  function buildMobileFromDesktop(header){
    const mobile = header.querySelector('#mobile-menu');
    const mainNav = header.querySelector('.main-nav');
    if (mobile && !mobile.querySelector('.mobile-nav-panel')) {
      const panel = document.createElement('div');
      panel.className = 'mobile-nav-panel';
      panel.innerHTML = '<button class="mobile-close" aria-label="Cerrar menú">✕</button>';
      // Siempre usar los enlaces fijos para el menú móvil, para evitar inconsistencias
      panel.insertAdjacentHTML('beforeend','<nav class="mobile-links">\
        <a class="nav-link" href="index.html">Inicio</a>\
        <a class="nav-link" href="sobrenosotros.html">Sobre Nosotros</a>\
        <a class="nav-link" href="servicios.html">Servicios</a>\
        <a class="nav-link" href="obras.html">Obras</a>\
        <a class="nav-link" href="contacto.html">Contacto</a>\
        <a class="nav-link" href="cotizacion.html">Cotizaciones</a>\
        <a class="nav-link" href="blog.html">Blog</a>\
        <a class="nav-link" href="privacidad.html">Privacidad</a>\
      </nav>');
      mobile.appendChild(panel);
    }
    return mobile;
  }

  function initForHeader(header){
    if (!header) return;
    const toggle = header.querySelector('.nav-toggle');
    const mobile = buildMobileFromDesktop(header);
    if (!toggle || !mobile) return;

    function openMenu(){
      mobile.setAttribute('aria-hidden','false');
      mobile.classList.add('open');
      toggle.setAttribute('aria-expanded','true');
      document.documentElement.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
      // Animación escalonada para los enlaces
      const links = mobile.querySelectorAll('.nav-link');
      links.forEach((a, i) => {
        a.style.setProperty('--link-delay', (i * 60 + 80) + 'ms');
        a.style.animation = 'none'; // reset
        // Forzar reflow para reiniciar animación
        void a.offsetWidth;
        a.style.animation = '';
      });
      const first = mobile.querySelector('.nav-link, button, a');
      if (first) first.focus();
    }
    function closeMenu(){
      mobile.setAttribute('aria-hidden','true');
      mobile.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
      document.documentElement.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      toggle.focus();
    }

    if (!toggle.__mobileMenuBound) {
      toggle.__mobileMenuBound = true;
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        (expanded ? closeMenu : openMenu)();
      });
    }

    mobile.addEventListener('click', (ev) => {
      if (ev.target === mobile) closeMenu();
      if (ev.target.closest('.mobile-close')) closeMenu();
      if (ev.target.classList.contains('nav-link')) closeMenu();
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && mobile.getAttribute('aria-hidden') === 'false') closeMenu();
    });
  }

  // init on existing header if present
  initForHeader(document.getElementById('site-header') || document.querySelector('header.site-header'));

  // watch for dynamically injected header (header.html)
  const observer = new MutationObserver((mutations)=> {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!(n instanceof HTMLElement)) continue;
        if (n.matches && (n.matches('header.site-header') || n.querySelector('.nav-toggle'))) {
          initForHeader(n);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // also init when header injected into #site-header
  const siteHeaderEl = document.getElementById('site-header');
  if (siteHeaderEl) {
    const obs2 = new MutationObserver(()=> initForHeader(siteHeaderEl));
    obs2.observe(siteHeaderEl, { childList: true, subtree: true });
  }
})();
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.getElementById('mobile-menu');
  const closeBtn = mobile?.querySelector('.mobile-close');

  if (!toggle || !mobile) return;

  const openMenu = () => {
    mobile.setAttribute('aria-hidden','false');
    mobile.classList.add('open');
    toggle.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
    // opcional: focus al primer enlace
    const first = mobile.querySelector('.nav-link');
    if (first) first.focus();
  };

  const closeMenu = () => {
    mobile.setAttribute('aria-hidden','true');
    mobile.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
    toggle.focus();
  };

  toggle.addEventListener('click', (e)=> {
    e.preventDefault();
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener('click', (e)=> { e.preventDefault(); closeMenu(); });
  mobile.addEventListener('click', (e)=> { if (e.target === mobile) closeMenu(); });
  document.addEventListener('keydown', (e)=> { if (e.key === 'Escape') closeMenu(); });
})();