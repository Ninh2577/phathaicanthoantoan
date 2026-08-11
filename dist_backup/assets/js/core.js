// assets/js/core.js — Satellite Medical Content Platform
// Vanilla JS only — No frameworks, no libraries

document.addEventListener('DOMContentLoaded', () => {
  initCurrentYear();
  initStickyHeader();
  initMobileMenu();
  initFAQAccordion();
  initSearchToggle();
  initNavActiveState();
});

// ─── Current Year ─────────────────────────────────────────────────
function initCurrentYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ─── Sticky Header Shadow ──────────────────────────────────────────
function initStickyHeader() {
  const header = document.querySelector('.skmd-header');
  if (!header) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    },
    { rootMargin: '-1px 0px 0px 0px', threshold: 0 }
  );

  const sentinel = document.getElementById('scroll-sentinel');
  if (sentinel) observer.observe(sentinel);
}

// ─── Mobile Menu (Drawer) ─────────────────────────────────────────
function initMobileMenu() {
  const toggleBtn  = document.querySelector('.skmd-menu-toggle');
  const drawer     = document.querySelector('.skmd-offcanvas');
  const closeBtn   = document.querySelector('.skmd-offcanvas__close');
  const backdrop   = document.querySelector('.skmd-offcanvas__backdrop');
  const drawerLinks = drawer ? drawer.querySelectorAll('[data-action="close-menu"]') : [];

  if (!toggleBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add('is-active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Move focus inside drawer
    const firstLink = drawer.querySelector('a, button');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    drawer.classList.remove('is-active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-active');
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  drawerLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-active')) {
      closeMenu();
    }
  });
}

// ─── FAQ Accordion ─────────────────────────────────────────────────
function initFAQAccordion() {
  const accordion = document.querySelector('.skmd-faq-accordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.skmd-faq__item');

  items.forEach(item => {
    const trigger = item.querySelector('.skmd-faq__trigger');
    const body    = item.querySelector('.skmd-faq__body');
    if (!trigger || !body) return;

    // Set initial ARIA
    const isOpen = item.classList.contains('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));

    trigger.addEventListener('click', () => {
      const open = item.classList.contains('is-open');

      // Close all
      items.forEach(i => {
        i.classList.remove('is-open');
        const t = i.querySelector('.skmd-faq__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!open) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        // Smooth focus
        trigger.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // Keyboard: Enter / Space
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
}

// ─── Search Toggle ─────────────────────────────────────────────────
function initSearchToggle() {
  const searchBtn   = document.querySelector('.skmd-search-toggle');
  const searchPanel = document.querySelector('.skmd-search-panel');
  const searchInput = document.querySelector('.skmd-search-input');
  const searchClose = document.querySelector('.skmd-search-close');

  if (!searchBtn || !searchPanel) return;

  function openSearch() {
    searchPanel.classList.add('is-active');
    searchBtn.setAttribute('aria-expanded', 'true');
    if (searchInput) searchInput.focus();
  }

  function closeSearch() {
    searchPanel.classList.remove('is-active');
    searchBtn.setAttribute('aria-expanded', 'false');
    searchBtn.focus();
  }

  searchBtn.addEventListener('click', () => {
    const isOpen = searchPanel.classList.contains('is-active');
    isOpen ? closeSearch() : openSearch();
  });

  if (searchClose) searchClose.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchPanel.classList.contains('is-active')) {
      closeSearch();
    }
  });
}

// ─── Nav Active State ─────────────────────────────────────────────
function initNavActiveState() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.skmd-menu__link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href !== '/' && path.startsWith(href)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}
