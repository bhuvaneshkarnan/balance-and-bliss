/**
 * BALANCE AND BLISS HEALING THERAPIES & ACADEMY
 * Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
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
  const reveals = document.querySelectorAll('.reveal-on-scroll, .reveal-scale');
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
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    reveals.forEach(el => observer.observe(el));
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
