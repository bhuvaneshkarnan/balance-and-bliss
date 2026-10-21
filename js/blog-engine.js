/**
 * Balance & Bliss - 110 Clinical Blog Automated Scheduling Engine
 * Auto-publishes Mon / Wed / Fri at midnight without manual intervention.
 */

(function () {
  'use strict';

  // Ensure dataset is loaded
  if (!window.BB_BLOGS_DATA || !Array.isArray(window.BB_BLOGS_DATA)) {
    console.warn("BB_BLOGS_DATA not found. Blog engine idle.");
    return;
  }

  const rawBlogs = window.BB_BLOGS_DATA;
  const now = new Date();

  // Evaluate publication status for all articles
  const blogs = rawBlogs.map(post => {
    const postDate = new Date(post.publishDate + "T00:00:00");
    const isPublished = postDate <= now;
    return {
      ...post,
      postDate,
      isPublished
    };
  });

  // Determine next scheduled release
  const upcomingPosts = blogs
    .filter(p => !p.isPublished)
    .sort((a, b) => a.postDate - b.postDate);
  const nextRelease = upcomingPosts.length > 0 ? upcomingPosts[0] : null;

  // Published posts count
  const publishedCount = blogs.filter(p => p.isPublished).length;

  // State
  let state = {
    mode: 'published', // 'published' or 'all'
    pillarId: 0,       // 0 for all pillars
    searchQuery: '',
    currentPage: 1,
    perPage: 9
  };

  // DOM Elements
  const container = document.getElementById('blog-engine-app');
  if (!container) return;

  function renderApp() {
    container.innerHTML = `
      <!-- Top Release Notice Banner -->
      ${nextRelease ? `
        <div class="next-release-banner reveal-on-scroll">
          <div class="next-release-badge">
            <span style="font-size: 1.1rem;">⏳</span> Auto-Publish Schedule (3x / Week)
          </div>
          <div class="next-release-title">
            Next Masterclass: <strong>${escapeHtml(nextRelease.title)}</strong> &bull; Releasing <em>${nextRelease.formattedDate}</em>
          </div>
        </div>
      ` : ''}

      <!-- Interactive Controls Box -->
      <div class="blog-controls-wrapper">
        <div class="blog-top-bar">
          <div class="blog-view-toggle">
            <button class="blog-toggle-btn ${state.mode === 'published' ? 'active' : ''}" data-mode="published">
              Published Guides (${publishedCount})
            </button>
            <button class="blog-toggle-btn ${state.mode === 'all' ? 'active' : ''}" data-mode="all">
              All 110 Masterclasses (Full Schedule)
            </button>
          </div>

          <div class="blog-search-wrap">
            <svg class="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              class="blog-search-input" 
              id="blog-search-input" 
              placeholder="Search by condition, heel pain, sciatica, diabetes..." 
              value="${escapeHtml(state.searchQuery)}"
            />
          </div>
        </div>

        <!-- Pillar Category Filter Chips -->
        <div class="blog-filter-chips" id="blog-filter-chips">
          <button class="blog-filter-chip ${state.pillarId === 0 ? 'active' : ''}" data-pillar="0">
            All Clinical Pillars
          </button>
          <button class="blog-filter-chip ${state.pillarId === 1 ? 'active' : ''}" data-pillar="1">
            Foot &amp; Heel Pain
          </button>
          <button class="blog-filter-chip ${state.pillarId === 2 ? 'active' : ''}" data-pillar="2">
            Sciatica &amp; Spine
          </button>
          <button class="blog-filter-chip ${state.pillarId === 3 ? 'active' : ''}" data-pillar="3">
            Diabetic Foot Care
          </button>
          <button class="blog-filter-chip ${state.pillarId === 4 ? 'active' : ''}" data-pillar="4">
            Circulation &amp; Veins
          </button>
          <button class="blog-filter-chip ${state.pillarId === 5 ? 'active' : ''}" data-pillar="5">
            Acupuncture &amp; Meridians
          </button>
          <button class="blog-filter-chip ${state.pillarId === 6 ? 'active' : ''}" data-pillar="6">
            Stress &amp; Insomnia
          </button>
          <button class="blog-filter-chip ${state.pillarId === 7 ? 'active' : ''}" data-pillar="7">
            Digestive Health
          </button>
          <button class="blog-filter-chip ${state.pillarId === 8 ? 'active' : ''}" data-pillar="8">
            Women's Health
          </button>
          <button class="blog-filter-chip ${state.pillarId === 9 ? 'active' : ''}" data-pillar="9">
            Tamil Padha Sigichai
          </button>
          <button class="blog-filter-chip ${state.pillarId === 10 ? 'active' : ''}" data-pillar="10">
            Drugless Philosophy
          </button>
        </div>
      </div>

      <!-- Results Meta Bar -->
      <div class="blog-results-meta" id="blog-results-meta">
        <!-- Rendered dynamically -->
      </div>

      <!-- Articles Grid -->
      <div class="blog-grid" id="blog-grid-output">
        <!-- Rendered dynamically -->
      </div>

      <!-- Pagination -->
      <div class="blog-pagination" id="blog-pagination-output">
        <!-- Rendered dynamically -->
      </div>
    `;

    bindEvents();
    renderFilteredResults();
  }

  function getFilteredArticles() {
    let list = blogs;

    // 1. Mode Filter
    if (state.mode === 'published') {
      list = list.filter(p => p.isPublished);
      // Newest published first
      list.sort((a, b) => b.postDate - a.postDate);
    } else {
      // All curriculum view: sorted by syllabus order
      list = [...list].sort((a, b) => a.id - b.id);
    }

    // 2. Pillar Filter
    if (state.pillarId > 0) {
      list = list.filter(p => p.pillar_id === state.pillarId);
    }

    // 3. Search Query Filter
    const query = state.searchQuery.toLowerCase().trim();
    if (query) {
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.short_title && p.short_title.toLowerCase().includes(query)) ||
        (p.condition && p.condition.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.lead && p.lead.toLowerCase().includes(query)) ||
        (p.keywords && p.keywords.toLowerCase().includes(query))
      );
    }

    return list;
  }

  function renderFilteredResults() {
    const filtered = getFilteredArticles();
    const metaContainer = document.getElementById('blog-results-meta');
    const gridContainer = document.getElementById('blog-grid-output');
    const paginationContainer = document.getElementById('blog-pagination-output');

    if (!metaContainer || !gridContainer || !paginationContainer) return;

    // Meta count
    const modeLabel = state.mode === 'published' ? 'Published Articles' : 'Curriculum Masterclasses';
    metaContainer.innerHTML = `
      <span>Showing <strong>${filtered.length}</strong> ${modeLabel}</span>
      <span>${state.mode === 'published' ? 'Scheduled 3x / Week (Mon, Wed, Fri)' : '110 Articles Complete Series'}</span>
    `;

    // Empty state
    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="blog-empty-state">
          <h3>No matching clinical guides found</h3>
          <p>Try searching for a different symptom (e.g., "heel pain", "sciatica", "acupuncture", "diabetes") or select a different pillar.</p>
          <button class="btn-pill btn-pill-dark" id="btn-reset-filters">Reset All Filters</button>
        </div>
      `;
      paginationContainer.innerHTML = '';
      const resetBtn = document.getElementById('btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.searchQuery = '';
          state.pillarId = 0;
          state.currentPage = 1;
          const searchInput = document.getElementById('blog-search-input');
          if (searchInput) searchInput.value = '';
          updatePillarChipsUI();
          renderFilteredResults();
        });
      }
      return;
    }

    // Pagination calculations
    const totalPages = Math.ceil(filtered.length / state.perPage) || 1;
    if (state.currentPage > totalPages) {
      state.currentPage = 1;
    }

    const startIndex = (state.currentPage - 1) * state.perPage;
    const pageItems = filtered.slice(startIndex, startIndex + state.perPage);

    // Render Cards
    gridContainer.innerHTML = pageItems.map(art => {
      const statusPill = art.isPublished 
        ? `<span class="status-pill-published">✓ Published &bull; ${art.formattedDate}</span>`
        : `<span class="status-pill-scheduled">⏳ Drops ${art.formattedDate}</span>`;

      return `
        <article class="blog-card reveal-on-scroll">
          <a href="/${art.slug}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
            <div class="blog-card-media">
              <img src="${art.image}" alt="${escapeHtml(art.title)}" loading="lazy">
            </div>
            <div class="blog-card-content">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem; flex-wrap: wrap;">
                <span class="blog-category-pill" style="margin-bottom: 0;">${escapeHtml(art.category)}</span>
                ${statusPill}
              </div>
              <h3 class="blog-card-title">
                ${escapeHtml(art.title)}
              </h3>
              <p class="blog-card-excerpt">
                ${escapeHtml(art.excerpt)}
              </p>
              <div class="blog-card-footer">
                <span>By Dr. M. Mehraj Abdullah</span>
                <span class="blog-read-link">Read Guide &rarr;</span>
              </div>
            </div>
          </a>
        </article>
      `;
    }).join('');

    // Render Pagination
    if (totalPages > 1) {
      let pageButtons = '';
      
      // Prev button
      pageButtons += `
        <button class="page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
          &larr; Prev
        </button>
      `;

      // Page numbers
      for (let p = 1; p <= totalPages; p++) {
        // Show smart pages window (first, last, and window around current)
        if (p === 1 || p === totalPages || (p >= state.currentPage - 2 && p <= state.currentPage + 2)) {
          pageButtons += `
            <button class="page-btn ${p === state.currentPage ? 'active' : ''}" data-page="${p}">
              ${p}
            </button>
          `;
        } else if (p === state.currentPage - 3 || p === state.currentPage + 3) {
          pageButtons += `<span style="padding: 0 0.25rem; color: var(--text-muted);">&bull;&bull;&bull;</span>`;
        }
      }

      // Next button
      pageButtons += `
        <button class="page-btn" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? 'disabled' : ''} aria-label="Next Page">
          Next &rarr;
        </button>
      `;

      paginationContainer.innerHTML = pageButtons;
    } else {
      paginationContainer.innerHTML = '';
    }
  }

  function bindEvents() {
    // Mode toggles
    const modeBtns = container.querySelectorAll('.blog-toggle-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.mode = e.target.getAttribute('data-mode');
        state.currentPage = 1;
        renderFilteredResults();
      });
    });

    // Pillar Filter chips
    const chipBtns = container.querySelectorAll('.blog-filter-chip');
    chipBtns.forEach(chip => {
      chip.addEventListener('click', (e) => {
        chipBtns.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        state.pillarId = parseInt(e.target.getAttribute('data-pillar'), 10) || 0;
        state.currentPage = 1;
        renderFilteredResults();
      });
    });

    // Search input (debounced)
    const searchInput = document.getElementById('blog-search-input');
    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = e.target.value;
          state.currentPage = 1;
          renderFilteredResults();
        }, 200);
      });
    }

    // Pagination clicks (delegated)
    const paginationContainer = document.getElementById('blog-pagination-output');
    if (paginationContainer) {
      paginationContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (btn && !btn.disabled) {
          const targetPage = parseInt(btn.getAttribute('data-page'), 10);
          if (targetPage && targetPage !== state.currentPage) {
            state.currentPage = targetPage;
            renderFilteredResults();
            const hubSection = document.querySelector('.blog-hub-section');
            if (hubSection) {
              hubSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    }
  }

  function updatePillarChipsUI() {
    const chipBtns = container.querySelectorAll('.blog-filter-chip');
    chipBtns.forEach(chip => {
      const pid = parseInt(chip.getAttribute('data-pillar'), 10) || 0;
      if (pid === state.pillarId) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderApp);
  } else {
    renderApp();
  }

})();
