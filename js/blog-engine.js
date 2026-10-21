/**
 * Balance & Bliss - 110 Clinical Blog Automated Scheduling Engine
 * Auto-publishes Mon / Wed / Fri at 06:00 AM IST without manual intervention.
 * Includes interactive date testing simulator & URL preview parameter (?testDate=YYYY-MM-DD).
 */

(function () {
  'use strict';

  // Ensure dataset is loaded
  if (!window.BB_BLOGS_DATA || !Array.isArray(window.BB_BLOGS_DATA)) {
    console.warn("BB_BLOGS_DATA not found. Blog engine idle.");
    return;
  }

  const rawBlogs = window.BB_BLOGS_DATA;

  // Check URL param or session storage for simulated date
  function getEffectiveNow() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const testParam = urlParams.get('testDate') || urlParams.get('previewDate');
      if (testParam) {
        const parsed = testParam.includes('T') ? new Date(testParam) : new Date(testParam + "T06:00:00+05:30");
        if (!isNaN(parsed.getTime())) return parsed;
      }
      const sessionDate = sessionStorage.getItem('bb_simulated_date');
      if (sessionDate) {
        const parsed = new Date(sessionDate);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    } catch (e) {
      // Fallback
    }
    return new Date();
  }

  let effectiveNow = getEffectiveNow();
  let isSimulated = effectiveNow.toISOString().split('T')[0] !== new Date().toISOString().split('T')[0];

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

  // State
  let state = {
    mode: 'published', // 'published' or 'all'
    pillarId: 0,       // 0 for all pillars
    searchQuery: '',
    currentPage: 1,
    perPage: 9,
    showSimulator: isSimulated
  };

  const container = document.getElementById('blog-engine-app');
  if (!container) return;

  function renderApp() {
    blogs = evaluateBlogs(effectiveNow);

    const upcomingPosts = blogs
      .filter(p => !p.isPublished)
      .sort((a, b) => a.postTimestamp - b.postTimestamp);
    const nextRelease = upcomingPosts.length > 0 ? upcomingPosts[0] : null;
    const publishedCount = blogs.filter(p => p.isPublished).length;

    container.innerHTML = `
      <!-- Top Release Notice Banner -->
      ${nextRelease ? `
        <div class="next-release-banner reveal-on-scroll">
          <div class="next-release-badge">
            <span style="font-size: 1.15rem;">⏳</span> Auto-Publish Schedule (Mon &bull; Wed &bull; Fri at 6:00 AM IST)
          </div>
          <div class="next-release-title">
            Next Masterclass: <strong>${escapeHtml(nextRelease.title)}</strong> &bull; Auto-Releasing <em>${nextRelease.formattedDate}</em>
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

          <div style="display: flex; gap: 0.75rem; align-items: center; flex-grow: 1; justify-content: flex-end; flex-wrap: wrap;">
            <div class="blog-search-wrap">
              <svg class="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                class="blog-search-input" 
                id="blog-search-input" 
                placeholder="Search heel pain, sciatica, diabetes..." 
                value="${escapeHtml(state.searchQuery)}"
              />
            </div>

            <!-- Date Test Simulator Button -->
            <button class="btn-pill ${isSimulated ? 'btn-pill-gold' : 'btn-pill-dark'}" id="btn-toggle-simulator" style="font-size: 0.8rem; padding: 0.65rem 1.15rem; background: ${isSimulated ? 'var(--accent-gold)' : 'var(--bg-sand-light)'}; color: var(--text-espresso); border: 1px solid var(--border-light);">
              🗓️ ${isSimulated ? 'Testing Mode Active' : 'Test Date Schedule'}
            </button>
          </div>
        </div>

        <!-- Testing & Schedule Simulator Panel -->
        <div id="blog-simulator-panel" style="display: ${state.showSimulator ? 'block' : 'none'}; background: var(--bg-cream); border: 1.5px dashed var(--accent-gold); border-radius: var(--radius-sm); padding: 1.25rem 1.5rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
            <div>
              <strong style="color: var(--text-espresso); font-size: 0.95rem;">🗓️ Date & Time Schedule Simulator:</strong>
              <span style="font-size: 0.88rem; color: var(--text-dark-secondary); margin-left: 0.5rem;">
                Simulated Clock: <strong>${effectiveNow.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at 06:00 AM IST</strong>
              </span>
            </div>
            ${isSimulated ? `
              <button id="btn-reset-simulator" class="btn-pill btn-pill-dark" style="font-size: 0.75rem; padding: 0.35rem 0.85rem;">
                ↺ Reset to Real Live Time
              </button>
            ` : ''}
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-espresso);">Quick Test:</span>
            <button class="btn-sim-date btn-pill" data-date="2026-10-21" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Live Today (Oct 21) &bull; 6 Posts
            </button>
            <button class="btn-sim-date btn-pill" data-date="2026-10-23" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Test Fri Oct 23 &bull; Post 7 Unlocks
            </button>
            <button class="btn-sim-date btn-pill" data-date="2026-10-26" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Test Mon Oct 26 &bull; Post 8 Unlocks
            </button>
            <button class="btn-sim-date btn-pill" data-date="2026-10-28" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Test Wed Oct 28 &bull; Post 9 Unlocks
            </button>
            <button class="btn-sim-date btn-pill" data-date="2026-10-30" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Test Fri Oct 30 &bull; Post 10 Unlocks
            </button>
            <button class="btn-sim-date btn-pill" data-date="2026-11-30" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Test End Nov &bull; 23 Posts
            </button>
            <button class="btn-sim-date btn-pill" data-date="2027-06-25" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid var(--border-light);">
              Test All 110 Posts Live
            </button>
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
      <div class="blog-results-meta" id="blog-results-meta"></div>

      <!-- Articles Grid -->
      <div class="blog-grid" id="blog-grid-output"></div>

      <!-- Pagination -->
      <div class="blog-pagination" id="blog-pagination-output"></div>
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
      <span>Showing <strong>${filtered.length}</strong> ${modeLabel} ${isSimulated ? '<span style="color: var(--accent-gold); font-weight: 700;">(Simulation Mode Active)</span>' : ''}</span>
      <span>${state.mode === 'published' ? 'Scheduled: Mon, Wed, Fri at 6:00 AM IST' : '110 Articles Complete Series'}</span>
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
        : `<span class="status-pill-scheduled">⏳ Drops ${art.formattedDate} (6 AM IST)</span>`;

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

    // Simulator Toggle
    const simToggleBtn = document.getElementById('btn-toggle-simulator');
    const simPanel = document.getElementById('blog-simulator-panel');
    if (simToggleBtn && simPanel) {
      simToggleBtn.addEventListener('click', () => {
        state.showSimulator = !state.showSimulator;
        simPanel.style.display = state.showSimulator ? 'block' : 'none';
      });
    }

    // Quick Simulation Buttons
    const simDateBtns = container.querySelectorAll('.btn-sim-date');
    simDateBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetDate = e.target.getAttribute('data-date');
        effectiveNow = new Date(targetDate + "T06:00:00+05:30");
        isSimulated = true;
        sessionStorage.setItem('bb_simulated_date', effectiveNow.toISOString());
        renderApp();
      });
    });

    // Reset Simulation Button
    const resetSimBtn = document.getElementById('btn-reset-simulator');
    if (resetSimBtn) {
      resetSimBtn.addEventListener('click', () => {
        sessionStorage.removeItem('bb_simulated_date');
        // Clear url params without reload
        const url = new URL(window.location);
        url.searchParams.delete('testDate');
        url.searchParams.delete('previewDate');
        window.history.replaceState({}, '', url);
        effectiveNow = new Date();
        isSimulated = false;
        state.showSimulator = false;
        renderApp();
      });
    }

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
