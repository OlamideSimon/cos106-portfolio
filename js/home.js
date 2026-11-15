/* ==========================================================================
   home.js — the homepage only
   1. A greeting that changes with the visitor's time of day
   2. Numbers that count up when the stats scroll into view
   ========================================================================== */

'use strict';

/* 1. Time-of-day greeting -------------------------------------------------- */

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const greetingElement = document.querySelector('[data-greeting]');
if (greetingElement) {
  const hour = new Date().getHours();
  greetingElement.textContent = `${getGreeting(hour)}, and welcome`;
}

/* 2. Count-up numbers ------------------------------------------------------ */

// Animates an element's number from 0 up to its data-count value.
// requestAnimationFrame runs the update once per screen refresh, and the
// ease-out curve makes the count slow down as it reaches the target.
function countUp(element) {
  const target = Number(element.dataset.count);
  const duration = 1400;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('[data-count]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  // The HTML holds the real numbers (so they're right without JavaScript);
  // start them at 0 here so the count-up doesn't flash the final value first.
  counters.forEach((counter) => {
    counter.textContent = '0';
    counterObserver.observe(counter);
  });
}
