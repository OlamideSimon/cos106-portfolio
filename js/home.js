/* ==========================================================================
   home.js — the homepage only
   1. A greeting that changes with the visitor's time of day
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
