/* ==========================================================================
   projects.js — the Projects page
   1. The projects, stored as an array of objects
   2. Filtering by sector and searching by text
   3. Rendering the cards into the page
   ========================================================================== */

'use strict';

/* 1. Project data ---------------------------------------------------------- */

const projects = [
  {
    title: "After6 Nature's Place",
    sector: 'wellness',
    sectorLabel: 'Health & wellness',
    year: 2025,
    role: 'Frontend developer',
    description:
      'A content and courses platform for natural living and wellness, with a bold editorial hero. I built the frontend from the design to a working site.',
    image: 'assets/images/projects/after6-natures-place.webp',
    url: 'https://after6-nature-1.onrender.com',
  },
  {
    title: 'EUN Eldercare & Wellness Consults',
    sector: 'wellness',
    sectorLabel: 'Health & wellness',
    year: 2025,
    role: 'Frontend developer',
    description:
      'A healthcare consultancy site for elder-care and wellness services in Port Harcourt, with a clean, trustworthy design.',
    image: 'assets/images/projects/eun-eldercare.webp',
    url: 'https://eunvip-eldercareandhealthspa.com',
  },
  {
    title: 'EUN Afro Atlantic-Pacific',
    sector: 'business',
    sectorLabel: 'Business & trade',
    year: 2025,
    role: 'Frontend developer',
    description:
      'A site for a B2B import and export company, "Connecting Markets Across Africa and Beyond", covering 11+ business sectors.',
    image: 'assets/images/projects/eun-afro-atlantic-pacific.webp',
    url: 'https://www.eun-afro-atlantic-pacific.org',
  },
  {
    title: 'Atinuke Olukunle',
    sector: 'education',
    sectorLabel: 'Education',
    year: 2025,
    role: 'Frontend developer',
    description:
      'A studio for makers and learners in Abuja ("Sparkle. Savor. Learn."), offering academic tutoring and hands-on creative arts, from baking to bead making.',
    image: 'assets/images/projects/atinuke-olukunle.webp',
    url: 'https://atinuke-olukunle.onrender.com',
  },
  {
    title: 'Ekidor Global Mart',
    sector: 'business',
    sectorLabel: 'Business & trade',
    year: 2026,
    role: 'Full-stack developer',
    description:
      'An e-commerce store for handcrafted beads, jewellery and lifestyle accessories, with a full shop, wishlist and collections.',
    image: 'assets/images/projects/ekidor-global-mart.webp',
    url: 'https://ekidor-global-mart-theta.vercel.app/',
    inProgress: true,
  },
  {
    title: 'Wedding Messages: Omolola & Tolulope',
    sector: 'events',
    sectorLabel: 'Events',
    year: 2026,
    role: 'Frontend developer',
    description:
      "A digital guest book for a couple's wedding. Guests leave messages, share memories and browse well-wishes on one elegant page.",
    image: 'assets/images/projects/wedding-messages.webp',
    url: 'https://wedding-messages-sable.vercel.app/',
  },
];

/* 2. Filtering and search -------------------------------------------------- */

// The page's current choices. Every change updates this object, then calls render().
const state = {
  sector: 'all',
  query: '',
};

function matchesFilters(project) {
  const inSector = state.sector === 'all' || project.sector === state.sector;
  const searchableText = `${project.title} ${project.description} ${project.sectorLabel}`.toLowerCase();
  const matchesQuery = searchableText.includes(state.query.trim().toLowerCase());
  return inSector && matchesQuery;
}

/* 3. Rendering ------------------------------------------------------------- */

const grid = document.getElementById('project-grid');
const resultsCount = document.getElementById('results-count');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('[data-filter]');
const searchInput = document.getElementById('project-search');

// Builds the HTML for one card. The data above is written by me (not typed in
// by visitors), so it's safe to place in a template literal.
function createCard(project, index) {
  const badge = project.inProgress ? '<span class="project-card__badge">In progress</span>' : '';

  return `
    <article class="project-card" style="animation-delay: ${index * 70}ms">
      <figure class="project-card__media">
        <img src="${project.image}" alt="Screenshot of the ${project.title} website" width="1280" height="800" loading="lazy">
        ${badge}
      </figure>
      <div class="project-card__body">
        <ul class="project-card__meta tag-list" aria-label="Project details">
          <li class="tag tag--accent">${project.sectorLabel}</li>
          <li class="tag">${project.year}</li>
          <li class="tag">${project.role}</li>
        </ul>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="project-card__actions">
          <a class="btn btn--small" href="${project.url}" target="_blank" rel="noopener noreferrer">
            Visit live site <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>`;
}

function render() {
  const visible = projects.filter(matchesFilters);

  grid.innerHTML = visible.map(createCard).join('');
  emptyState.hidden = visible.length > 0;
  resultsCount.textContent = `Showing ${visible.length} of ${projects.length} projects`;

  // Mark which filter button is active, for both sighted and screen-reader users.
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === state.sector));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.sector = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  render();
});

document.getElementById('clear-filters').addEventListener('click', () => {
  state.sector = 'all';
  state.query = '';
  searchInput.value = '';
  render();
  searchInput.focus();
});

render();
