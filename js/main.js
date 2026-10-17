/**
 * BALANCE AND BLISS HEALING THERAPIES & ACADEMY
 * Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initScrollProgressBar();
  initBackToTop();
  initCardSpotlight();
  initAnimatedCounters();
  initGalleryCarousel();
  initLightbox();
  initFaqAccordion();
  initForms();
  initServiceDetails();
  initScrollSpy();
  initScrollReveal();
  initActiveNav();
});

/* ==========================================================================
   1. Sticky Header & Scroll Spy
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initActiveNav() {
  const path = window.location.pathname;
  let page = path.split('/').pop();
  if (!page || page === '') page = 'index.html';

  const navLinks = document.querySelectorAll('.nav-menu .nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('#')[0];

    if (linkPage === page || (!linkPage && page === 'index.html' && href.startsWith('#'))) {
      if (linkPage === page) {
        link.classList.add('active');
      }
    } else if (linkPage && linkPage !== page) {
      link.classList.remove('active');
    }
  });
}

function initScrollSpy() {
  const path = window.location.pathname;
  let page = path.split('/').pop();
  if (page && page !== 'index.html' && page !== '') return;

  const sections = document.querySelectorAll('section[id], body[id]');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  if (!sections.length || !navLinks.length) return;

  const onScroll = () => {
    let currentId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentId}` || href === `index.html#${currentId}`) {
          link.classList.add('active');
        } else if (href.startsWith('#') || href.startsWith('index.html#')) {
          link.classList.remove('active');
        }
      });
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ==========================================================================
   1b. Scroll Reveal Blurred Animation
   ========================================================================== */
function initScrollReveal() {
  const autoSelectors = [
    '.section-title',
    '.section-eyebrow',
    '.hero-text-wrap',
    '.subpage-title',
    '.subpage-subtitle',
    '.subpage-hero-meta',
    '.service-card',
    '.journey-card',
    '.testimonial-card',
    '.condition-column',
    '.condition-domain-card',
    '.package-plan-card',
    '.equipment-card',
    '.value-card',
    '.pillar-card',
    '.gallery-card',
    '.faq-item',
    '.contact-info-card',
    '.contact-form-card',
    '.service-detailed-row',
    '.visit-preparation-box',
    '.conditions-bottom-card'
  ];

  // Auto-tag elements that don't have a reveal class
  document.querySelectorAll(autoSelectors.join(', ')).forEach(el => {
    if (!el.classList.contains('reveal-on-scroll') && 
        !el.classList.contains('reveal-scale') && 
        !el.classList.contains('reveal-blur') &&
        !el.classList.contains('reveal-blur-left') &&
        !el.classList.contains('reveal-blur-right')) {
      el.classList.add('reveal-blur');
      
      // Auto stagger grid children
      if (el.parentElement) {
        const parent = el.parentElement;
        if (parent.classList.contains('services-grid') || 
            parent.classList.contains('journey-grid') || 
            parent.classList.contains('testimonials-grid') || 
            parent.classList.contains('conditions-grid') ||
            parent.classList.contains('packages-grid') ||
            parent.classList.contains('equipment-grid') ||
            parent.classList.contains('values-grid') ||
            parent.classList.contains('approach-pillars-grid') ||
            parent.classList.contains('conditions-directory-grid')) {
          const siblings = Array.from(parent.children);
          const idx = siblings.indexOf(el);
          if (idx >= 0 && idx < 6) {
            el.classList.add('delay-' + (idx + 1));
          }
        }
      }
    }
  });

  const reveals = document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-blur, .reveal-blur-left, .reveal-blur-right');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -65px 0px',
      threshold: 0.12
    });

    let initialStagger = 180;
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        setTimeout(() => {
          el.classList.add('revealed');
        }, initialStagger);
        initialStagger += 130;
      } else {
        observer.observe(el);
      }
    });
  } else {
    reveals.forEach(el => el.classList.add('revealed'));
  }
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer || !backdrop) return;

  const toggleDrawer = () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const openDrawer = () => {
    drawer.classList.add('open');
    backdrop.classList.add('active');
    toggleBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    toggleBtn.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', toggleDrawer);
  backdrop.addEventListener('click', closeDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. Gallery Carousel & Controls
   ========================================================================== */
function initGalleryCarousel() {
  const container = document.querySelector('.gallery-track-container');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  if (!container || !prevBtn || !nextBtn) return;

  const scrollAmount = 380; // card width + gap

  prevBtn.addEventListener('click', () => {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

/* ==========================================================================
   4. Lightbox Modal
   ========================================================================== */
function initLightbox() {
  const cards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;

  if (!cards.length || !lightbox || !lightboxImg) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Spa Gallery View';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   5. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other open items
      items.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      // Toggle current
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });

  // Open first item by default
  if (items[0]) {
    items[0].classList.add('active');
  }
}

/* ==========================================================================
   6. Forms Handling & Toast Notifications
   ========================================================================== */
function initForms() {
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = contactForm.querySelector('#first-name')?.value.trim() || 'Guest';
      const lastName = contactForm.querySelector('#last-name')?.value.trim() || '';
      const phone = contactForm.querySelector('#phone')?.value.trim() || '';
      const subject = contactForm.querySelector('#subject')?.value.trim() || 'Consultation Request';
      const message = contactForm.querySelector('#message')?.value.trim() || '';

      const fullName = `${firstName} ${lastName}`.trim();
      const waMessage = `Hello Dr. Mehraj Abdullah, I would like to book a consultation at Balance and Bliss Healing Therapies.\n\n` +
        `• Name: ${fullName}\n` +
        (phone ? `• Phone: ${phone}\n` : '') +
        `• Primary Concern / Service: ${subject}\n` +
        (message ? `• Notes / Details: ${message}` : '');

      const waUrl = `https://wa.me/918838452088?text=${encodeURIComponent(waMessage)}`;

      showToast(`Thank you, ${firstName}! Opening WhatsApp to confirm your appointment...`);
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 900);

      contactForm.reset();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! You have been successfully subscribed to our newsletter.');
      newsletterForm.reset();
    });
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-icon">✓</span> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   7. Service Details Modal
   ========================================================================== */
function initServiceDetails() {
  const serviceCards = document.querySelectorAll('.service-card');
  const serviceDetails = {
    'Foot Reflexology': 'Targeted neurological reflex zone therapy stimulating nerve endings in the feet that directly correspond to bodily organs, activating systemic balance and natural healing.',
    'Acupuncture Therapy': 'Classical meridian balancing using fine sterile needles and acupoint stimulation to unblock Qi, stimulate endorphins, and resolve acute and chronic ailments.',
    'Spine & Sciatica Relief': 'Specialized clinical protocols targeting lumbar pain, cervical spondylosis, frozen shoulder, and sciatic nerve pain without surgical or pharmaceutical intervention.',
    'Internal Organ Wellness': 'Restorative reflexology protocols aiding digestion, chronic gastritis, stomach ulcers, respiratory wellness, and metabolic homeostasis.',
    'Hormonal & Women\'s Health': 'Gentle, supportive non-drug therapies designed to promote pelvic blood circulation, relieve menstrual stress, and support reproductive wellness.',
    'Circulation & Vitality': 'Therapeutic pressure techniques focused on improving venous return for varicose veins, reducing edema, relieving tinnitus, and reviving systemic vitality.'
  };

  const modal = document.getElementById('clinical-modal');
  const openModalBtn = document.getElementById('open-clinical-modal');
  const closeModalBtn = document.getElementById('close-clinical-modal');

  const openModal = () => {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      openModal();
    });
  });
}

/* ==========================================================================
   8. Top Scroll Progress Indicator
   ========================================================================== */
function initScrollProgressBar() {
  let bar = document.querySelector('.scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);
  }

  let ticking = false;
  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  updateProgress();
}

/* ==========================================================================
   9. Floating Back-to-Top Button
   ========================================================================== */
function initBackToTop() {
  let btn = document.querySelector('.back-to-top-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', 'Back to top of page');
    btn.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>`;
    document.body.appendChild(btn);
  }

  let ticking = false;
  const checkScroll = () => {
    if (window.scrollY > 380) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(checkScroll);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  checkScroll();
}

/* ==========================================================================
   10. Interactive Card Spotlight Cursor Tracking
   ========================================================================== */
function initCardSpotlight() {
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cardSelectors = [
      '.card-interactive',
      '.service-card',
      '.journey-card',
      '.condition-column',
      '.condition-domain-card',
      '.package-plan-card',
      '.value-card',
      '.pillar-card',
      '.equipment-card',
      '.clinic-highlight-item',
      '.contact-info-card',
      '.contact-form-card'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(', '));
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }
}

/* ==========================================================================
   11. Interactive Animated Number Counters
   ========================================================================== */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll(
    '.credential-value, .journey-num, .pillar-num, .package-plan-price, .meta-pill, [data-counter]'
  );

  if (!counterElements.length) return;

  const animateElement = (el) => {
    if (el.dataset.counterDone) return;

    let targetTextNode = null;
    let rawText = '';

    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && /\d+/.test(node.nodeValue)) {
        targetTextNode = node;
        rawText = node.nodeValue.trim();
        break;
      }
    }

    if (!targetTextNode) {
      rawText = el.innerText.trim();
    }

    if (!rawText) return;

    // Skip registration numbers, years, phone numbers
    if (rawText.includes('ATAMA') || rawText.includes('ATMA') || rawText.includes('2025') || rawText.includes('2026') || rawText.includes('8838')) {
      return;
    }

    const match = rawText.match(/^([^0-9]*)([\d,]+)(.*)$/s);
    if (!match) return;

    const prefix = match[1];
    const rawNum = match[2].replace(/,/g, '');
    const suffix = match[3];
    const target = parseInt(rawNum, 10);

    // Animate valid counter values (1 to 5000)
    if (isNaN(target) || target <= 0 || target > 5000) return;

    el.dataset.counterDone = 'true';
    const isZeroPadded = match[2].length === 2 && match[2].startsWith('0');
    const hasComma = match[2].includes(',');
    const duration = 2400;
    const startTime = performance.now();

    const formatNumber = (num) => {
      let str = num.toString();
      if (hasComma) str = num.toLocaleString('en-IN');
      if (isZeroPadded && str.length === 1) str = '0' + str;
      return str;
    };

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic for a tactile, smooth, readable count
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      const formatted = `${prefix}${formatNumber(current)}${suffix}`;

      if (targetTextNode) {
        targetTextNode.nodeValue = targetTextNode.nodeValue.startsWith(' ') ? ` ${formatted}` : formatted;
      } else {
        el.innerText = formatted;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        const finalFormatted = `${prefix}${formatNumber(target)}${suffix}`;
        if (targetTextNode) {
          targetTextNode.nodeValue = targetTextNode.nodeValue.startsWith(' ') ? ` ${finalFormatted}` : finalFormatted;
        } else {
          el.innerText = finalFormatted;
        }
      }
    };

    requestAnimationFrame(updateCounter);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateElement(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.2
    });

    counterElements.forEach(el => observer.observe(el));
  } else {
    counterElements.forEach(el => animateElement(el));
  }
}

