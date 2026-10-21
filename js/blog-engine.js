/**
 * Balance & Bliss - 110 Clinical Blog Automated Scheduling Engine
 * Auto-publishes Mon / Wed / Fri at 06:00 AM IST without manual intervention.
 * Displays clean category pill on the left and understated publication date on the right.
 */

(function () {
  'use strict';

  // Ensure dataset is loaded
  if (!window.BB_BLOGS_DATA || !Array.isArray(window.BB_BLOGS_DATA)) {
    console.warn("BB_BLOGS_DATA not found. Blog engine idle.");
    return;
  }

  const rawBlogs = window.BB_BLOGS_DATA;

  // Support silent testing via URL param (?testDate=YYYY-MM-DD) for developers if needed
  function getEffectiveNow() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const testParam = urlParams.get('testDate') || urlParams.get('previewDate');
      if (testParam) {
        const parsed = testParam.includes('T') ? new Date(testParam) : new Date(testParam + "T06:00:00+05:30");
        if (!isNaN(parsed.getTime())) return parsed;
      }
    } catch (e) {
      // Fallback
    }
    return new Date();
  }

  const effectiveNow = getEffectiveNow();

  // Evaluate publication status
  function evaluateBlogs(currentTime) {
    const currentMs = currentTime.getTime();
    return rawBlogs.map(post => {
      const isoStr = post.publishDateTime || (post.publishDate + "T06:00:00+05:30");
      const postTimestamp = new Date(isoStr).getTime();
      const isPublished = postTimestamp <= currentMs;
      return {
        ...post,
        postTimestamp,
        isPublished
      };
    });
  }

  let blogs = evaluateBlogs(effectiveNow);

  const PILLAR_CONFIG = [
    { id: 1, name: "Foot & Heel Pain" },
    { id: 2, name: "Sciatica & Spine" },
    { id: 3, name: "Diabetic Foot Care" },
    { id: 4, name: "Circulation & Veins" },
    { id: 5, name: "Acupuncture & Meridians" },
    { id: 6, name: "Stress & Insomnia" },
    { id: 7, name: "Digestive Health" },
    { id: 8, name: "Women's Health" },
    { id: 9, name: "Tamil Padha Sigichai" },
    { id: 10, name: "Drugless Philosophy" }
  ];

  // State
  let state = {
    mode: 'published', // 'published' or 'all'
    pillarId: 0,       // 0 for all pillars
    searchQuery: '',
    currentPage: 1,
    perPage: 9
  };

  const container = document.getElementById('blog-engine-app');
  if (!container) return;

  function getPillarCounts() {
    const pool = state.mode === 'published' ? blogs.filter(p => p.isPublished) : blogs;
    const counts = {};
    pool.forEach(p => {
      counts[p.pillar_id] = (counts[p.pillar_id] || 0) + 1;
    });
    return counts;
  }

  function renderPillarChips() {
    const chipsContainer = document.getElementById('blog-filter-chips');
    if (!chipsContainer) return;

    const counts = getPillarCounts();

    // If currently selected pillar has 0 published posts in this mode, reset to All (0)
    if (state.pillarId > 0 && !counts[state.pillarId]) {
      state.pillarId = 0;
    }

    let chipsHtml = `
      <button class="blog-filter-chip ${state.pillarId === 0 ? 'active' : ''}" data-pillar="0">
        All Clinical Pillars
      </button>
    `;

    PILLAR_CONFIG.forEach(pillar => {
      // ONLY render chip if this category actually contains posted articles in this mode
      if (counts[pillar.id] && counts[pillar.id] > 0) {
        const isActive = state.pillarId === pillar.id ? 'active' : '';
        chipsHtml += `
          <button class="blog-filter-chip ${isActive}" data-pillar="${pillar.id}">
            ${escapeHtml(pillar.name)}
          </button>
        `;
      }
    });

    chipsContainer.innerHTML = chipsHtml;

    // Attach click listeners to the dynamically rendered chips
    const chipBtns = chipsContainer.querySelectorAll('.blog-filter-chip');
    chipBtns.forEach(chip => {
      chip.addEventListener('click', (e) => {
        chipBtns.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.pillarId = parseInt(e.currentTarget.getAttribute('data-pillar'), 10) || 0;
        state.currentPage = 1;
        renderFilteredResults();
      });
    });
  }

  function renderApp() {
    blogs = evaluateBlogs(effectiveNow);
    const publishedCount = blogs.filter(p => p.isPublished).length;

    container.innerHTML = `
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
              placeholder="Search heel pain, sciatica, diabetes, stress..." 
              value="${escapeHtml(state.searchQuery)}"
            />
          </div>
        </div>

        <!-- Pillar Category Filter Chips (Dynamically shown only when posts exist) -->
        <div class="blog-filter-chips" id="blog-filter-chips"></div>
      </div>

      <!-- Results Meta Bar -->
      <div class="blog-results-meta" id="blog-results-meta"></div>

      <!-- Articles Grid -->
      <div class="blog-grid" id="blog-grid-output"></div>

      <!-- Pagination -->
      <div class="blog-pagination" id="blog-pagination-output"></div>
    `;

    bindControls();
    renderPillarChips();
    renderFilteredResults();
  }

  function getFilteredArticles() {
    let list = blogs;

    // 1. Mode Filter
    if (state.mode === 'published') {
      list = list.filter(p => p.isPublished);
      // Newest published first
      list.sort((a, b) => b.postTimestamp - a.postTimestamp);
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
      <span>${state.mode === 'published' ? 'Scheduled: Mon, Wed, Fri' : '110 Articles Complete Series'}</span>
    `;

    // Empty state
    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="blog-empty-state">
          <h3>No matching clinical guides found</h3>
          <p>Try searching for a different symptom or switch back to All Clinical Pillars.</p>
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
          renderPillarChips();
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
      // Clean, understated date on right side:
      const dateDisplay = art.isPublished 
        ? `<time class="blog-card-date" datetime="${art.publishDateTime || (art.publishDate + 'T06:00:00+05:30')}">${art.formattedDate}</time>`
        : `<time class="blog-card-date" datetime="${art.publishDateTime || (art.publishDate + 'T06:00:00+05:30')}" style="color: var(--accent-gold); font-weight: 600;">Drops ${art.formattedDate}</time>`;

      return `
        <article class="blog-card reveal-on-scroll">
          <a href="/${art.slug}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
            <div class="blog-card-media">
              <img src="${art.image}" alt="${escapeHtml(art.title)}" loading="lazy">
            </div>
            <div class="blog-card-content">
              <div class="blog-card-meta-top">
                <span class="blog-category-pill" title="${escapeHtml(art.category)}">${escapeHtml(art.category)}</span>
                ${dateDisplay}
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
      
      pageButtons += `
        <button class="page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Previous Page">
          &larr; Prev
        </button>
      `;

      for (let p = 1; p <= totalPages; p++) {
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

  function bindControls() {
    // Mode toggles
    const modeBtns = container.querySelectorAll('.blog-toggle-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.mode = e.currentTarget.getAttribute('data-mode');
        state.currentPage = 1;
        renderPillarChips();
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
