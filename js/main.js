/* ==========================================================================
   main.js — behaviour shared by every page
   1. Light / dark theme toggle (remembered with localStorage)
   2. Mobile navigation menu
   3. Header shadow once the page scrolls
   4. Reveal sections as they scroll into view (IntersectionObserver)
   5. Current year in the footer
   ========================================================================== */

'use strict';

/* 1. Theme toggle ---------------------------------------------------------- */

const THEME_KEY = 'os-theme';
const themeButton = document.querySelector('[data-theme-toggle]');

// The <head> of every page already applied the saved theme before the page
// was drawn (so it never flashes the wrong colours). This function keeps the
// button's label in step with whichever theme is showing.
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeButton) {
    const next = theme === 'dark' ? 'light' : 'dark';
    themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
    themeButton.setAttribute('title', `Switch to ${next} theme`);
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (error) {
    // Storage can be blocked (private browsing). The theme still changes for this visit.
  }
}

applyTheme(document.documentElement.dataset.theme || 'light');
if (themeButton) {
  themeButton.addEventListener('click', toggleTheme);
}

/* 2. Mobile navigation ----------------------------------------------------- */

const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.getElementById('site-nav');

function setMenuOpen(isOpen) {
  if (!menuButton || !nav) return;
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  nav.classList.toggle('is-open', isOpen);
}

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  // Close the menu when a link is chosen...
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  // ...when Escape is pressed (and give focus back to the button)...
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  // ...when the visitor clicks anywhere outside the header...
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setMenuOpen(false);
  });

  // ...and when the screen grows past the phone layout.
  const desktopQuery = window.matchMedia('(min-width: 821px)');
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

/* 3. Header shadow on scroll ---------------------------------------------- */

const header = document.querySelector('.site-header');

function updateHeader() {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* 4. Reveal on scroll ------------------------------------------------------ */

// Elements with the class "reveal" start faded and lowered (see styles.css).
// The observer adds "is-visible" once 15% of an element is on screen, and
// then stops watching it, so each element animates only once.
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );
  revealElements.forEach((element) => observer.observe(element));
} else {
  // Very old browsers: just show everything.
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

/* 5. Footer year ----------------------------------------------------------- */

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});
