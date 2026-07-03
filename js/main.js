/**
 * Main Controller Script
 * Orchestrates Lenis smooth scroll, GSAP ScrollTriggers, Lucide Icons,
 * Custom cursor interaction, UI modals, and floating animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Selector and Lucide Icons
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    const icon = themeToggleBtn.querySelector('i');
    if (icon) icon.setAttribute('data-lucide', 'moon');
  }
  
  lucide.createIcons();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
        lucide.createIcons();
      }
    });
  }

  // 2. Initialize Lenis Smooth Scroll (only on non-touch desktop screens for optimal native mobile scroll)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
  let lenis = null;

  if (!isTouchDevice) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
    });

    // Connect Lenis to requestAnimationFrame
    const raf = (time) => {
      if (lenis) lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      if (lenis) lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // 3. Custom Cursor & Glow Blob Follower
  const cursor = document.getElementById('custom-cursor');
  const glow = document.getElementById('cursor-glow');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentCursorX = mouseX;
  let currentCursorY = mouseY;
  let currentGlowX = mouseX;
  let currentGlowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth interpolation loop for custom cursor elements
  function updateCursorPhysics() {
    // Custom cursor (slight interpolation for trailing effect, or instant)
    currentCursorX += (mouseX - currentCursorX) * 0.25;
    currentCursorY += (mouseY - currentCursorY) * 0.25;
    
    if (cursor) {
      cursor.style.transform = `translate3d(${currentCursorX}px, ${currentCursorY}px, 0) translate(-50%, -50%)`;
    }

    // Glow blob (high lag interpolation for premium fluid slide)
    currentGlowX += (mouseX - currentGlowX) * 0.05;
    currentGlowY += (mouseY - currentGlowY) * 0.05;
    
    if (glow) {
      glow.style.transform = `translate3d(${currentGlowX}px, ${currentGlowY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(updateCursorPhysics);
  }
  updateCursorPhysics();

  // Scale cursor on hover targets
  const hoverTargets = 'a, button, .glass-card, .skill-category-btn, .skill-badge, .form-control';
  document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      const isLight = document.body.classList.contains('light-theme');
      cursor.style.width = '44px';
      cursor.style.height = '44px';
      cursor.style.backgroundColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 240, 255, 0.1)';
      cursor.style.border = isLight ? '1px solid #000000' : '1px solid var(--accent-cyan)';
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.style.width = '32px';
      cursor.style.height = '32px';
      cursor.style.backgroundColor = 'transparent';
      cursor.style.border = 'none';
    }
  });

  // Track hover coordinate grid details on glass-cards for hover glow position
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const glowElement = card.querySelector('.hover-glow');
      if (glowElement) {
        glowElement.style.left = `${x}px`;
        glowElement.style.top = `${y}px`;
      }
    });
  });

  // Mobile Navigation toggle menu
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.setAttribute('data-lucide', 'x');
      } else {
        icon.setAttribute('data-lucide', 'menu');
      }
      lucide.createIcons();
    });

    // Close menu when links are clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
      });
    });
  }

  // 4. Hero Section Typewriter Intro Loop Sequence
  const heroTitle = document.getElementById('hero-typewriter-title');
  const phrases = [
    "Hello.",
    "I'm Nisarg Dobariya.",
    "I analyze threat vectors.",
    "I perform vulnerability audits.",
    "I practice penetration testing.",
    "I solve security challenges."
  ];
  let phraseIndex = 0;

  function typeSequence() {
    if (!heroTitle) return;
    const text = phrases[phraseIndex];
    
    // Animate text fade out, rewrite, fade in
    gsap.to(heroTitle, {
      opacity: 0,
      y: -15,
      duration: 0.5,
      onComplete: () => {
        heroTitle.innerHTML = `<span class="glow-gradient-text">${text}</span>`;
        gsap.to(heroTitle, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            // Next sequence after 2s delay
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeSequence, 2200);
          }
        });
      }
    });
  }
  // Start sequence
  typeSequence();

  // Parallax tracking mouse shifts for floating hero icons
  window.addEventListener('mousemove', (e) => {
    const depthElements = document.querySelectorAll('.floating-obj');
    const x = (window.innerWidth - e.clientX * 2) / 100;
    const y = (window.innerHeight - e.clientY * 2) / 100;

    depthElements.forEach(el => {
      const speed = el.getAttribute('data-speed') || 0.05;
      gsap.to(el, {
        x: x * speed * 30,
        y: y * speed * 30,
        duration: 1,
        ease: 'power2.out'
      });
    });
  });

  // 5. GSAP Scroll Trigger Animations
  
  // Section Titles Reveal
  document.querySelectorAll('.section-title-wrap').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out'
    });
  });

  // About cards sequence
  gsap.from('.about-card', {
    scrollTrigger: {
      trigger: '.about-grid',
      start: 'top 75%'
    },
    y: 40,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out'
  });

  // About stats numerical counter triggers
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    gsap.fromTo(stat, 
      { textContent: 0 },
      {
        textContent: target,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: function() {
          stat.innerHTML = Math.floor(stat.textContent) + (target === 20 || target === 15 || target === 40 ? '+' : '');
        }
      }
    );
  });

  // Timeline Progress bar scroll height
  const timelineProgress = document.getElementById('timeline-scroll-bar');
  if (timelineProgress) {
    gsap.to(timelineProgress, {
      scrollTrigger: {
        trigger: '.timeline-container',
        start: 'top 25%',
        end: 'bottom 75%',
        scrub: true
      },
      height: '100%',
      ease: 'none'
    });
  }

  // Active state timeline nodes during scroll tracking
  document.querySelectorAll('.timeline-item').forEach(item => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => item.classList.add('active'),
        onEnterBack: () => item.classList.add('active'),
        onLeave: () => item.classList.remove('active'),
        onLeaveBack: () => item.classList.remove('active')
      }
    });
  });

  // Projects slide/zoom lists
  document.querySelectorAll('.project-item').forEach(project => {
    gsap.from(project.querySelector('.project-info'), {
      scrollTrigger: {
        trigger: project,
        start: 'top 80%'
      },
      opacity: 0,
      x: -50,
      duration: 1,
      ease: 'power2.out'
    });

    gsap.from(project.querySelector('.project-showcase'), {
      scrollTrigger: {
        trigger: project,
        start: 'top 80%'
      },
      opacity: 0,
      x: 50,
      duration: 1,
      ease: 'power2.out'
    });
  });

  // Research tabs control
  const tabBtns = document.querySelectorAll('.research-tab-btn');
  const tabPanes = document.querySelectorAll('.research-tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = `tab-${btn.dataset.tab}`;
      const pane = document.getElementById(tabId);
      if (pane) {
        pane.classList.add('active');
      }
    });
  });

  // Experience accordion action
  const expCards = document.querySelectorAll('.experience-card');
  expCards.forEach(card => {
    card.addEventListener('click', () => {
      // If already active, close it
      if (card.classList.contains('active')) {
        card.classList.remove('active');
      } else {
        // Close others, open this
        expCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
      // Re-trigger scroll positions just in case size shift pushes items
      setTimeout(() => ScrollTrigger.refresh(), 500);
    });
  });

  // Certificates drawer popup modal preview trigger
  const certCards = document.querySelectorAll('.certificate-card');
  const certLightbox = document.getElementById('cert-lightbox');
  const modalImg = document.getElementById('cert-modal-image');
  const modalTitle = document.getElementById('cert-modal-title');
  const modalIssuer = document.getElementById('cert-modal-issuer');
  const modalDownload = document.getElementById('cert-modal-download');
  const btnClose = document.getElementById('btn-modal-close');

  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.getAttribute('data-cert-img');
      const title = card.getAttribute('data-cert-title');
      const issuer = card.getAttribute('data-cert-issuer');
      const pdf = card.getAttribute('data-cert-pdf');
      
      if (modalImg) modalImg.src = img;
      if (modalTitle) modalTitle.textContent = title;
      if (modalIssuer) modalIssuer.textContent = issuer;
      if (modalDownload) modalDownload.href = pdf || '#';
      
      if (certLightbox) {
        certLightbox.classList.add('active');
        lenis.stop(); // Stop scroll when lightbox active
      }
    });
  });

  const closeModal = () => {
    if (certLightbox) {
      certLightbox.classList.remove('active');
      lenis.start(); // Restore scrolling
    }
  };

  if (btnClose) {
    btnClose.addEventListener('click', closeModal);
  }
  if (certLightbox) {
    certLightbox.addEventListener('click', (e) => {
      if (e.target === certLightbox) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Achievements section numeric counter triggers
  const achNumbers = document.querySelectorAll('.achievement-number');
  achNumbers.forEach(ach => {
    const target = parseInt(ach.getAttribute('data-target'));
    gsap.fromTo(ach, 
      { textContent: 0 },
      {
        textContent: target,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: ach,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: function() {
          ach.innerHTML = Math.floor(ach.textContent) + (target === 15 ? '+' : '');
        }
      }
    );
  });

  // Floating icon physics drifting logic inside Tech Stack section
  const stormWrap = document.getElementById('icon-storm-wrap');
  const stormIcons = document.querySelectorAll('.floating-tech-icon');
  
  if (stormWrap) {
    // Generate initial randomized physics drift states
    const drifts = Array.from(stormIcons).map(icon => ({
      element: icon,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      baseLeft: parseFloat(icon.style.left),
      baseTop: parseFloat(icon.style.top)
    }));

    let wrapMouseX = null;
    let wrapMouseY = null;

    stormWrap.addEventListener('mousemove', (e) => {
      const rect = stormWrap.getBoundingClientRect();
      wrapMouseX = e.clientX - rect.left;
      wrapMouseY = e.clientY - rect.top;
    });

    stormWrap.addEventListener('mouseleave', () => {
      wrapMouseX = null;
      wrapMouseY = null;
    });

    function driftPhysics() {
      const rect = stormWrap.getBoundingClientRect();
      
      drifts.forEach(item => {
        // Apply passive speed drift
        item.x += item.vx;
        item.y += item.vy;

        // Apply bounce logic inside boundaries
        const elRect = item.element.getBoundingClientRect();
        const iconWidthPercent = (elRect.width / rect.width) * 100;
        const iconHeightPercent = (elRect.height / rect.height) * 100;
        
        const currentLeftPercent = item.baseLeft + (item.x / rect.width) * 100;
        const currentTopPercent = item.baseTop + (item.y / rect.height) * 100;

        if (currentLeftPercent < 5 || currentLeftPercent > 90 - iconWidthPercent) {
          item.vx *= -1;
        }
        if (currentTopPercent < 5 || currentTopPercent > 90 - iconHeightPercent) {
          item.vy *= -1;
        }

        // Apply cursor repelling logic if cursor is active inside the zone
        if (wrapMouseX !== null && wrapMouseY !== null) {
          const elCenterX = (currentLeftPercent / 100) * rect.width + elRect.width / 2;
          const elCenterY = (currentTopPercent / 100) * rect.height + elRect.height / 2;
          
          const dx = wrapMouseX - elCenterX;
          const dy = wrapMouseY - elCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            // Apply pushes away from mouse cursor
            const pushForce = (120 - distance) / 120;
            item.x -= (dx / distance) * pushForce * 8;
            item.y -= (dy / distance) * pushForce * 8;
          }
        }

        // Apply transformations
        item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      });

      requestAnimationFrame(driftPhysics);
    }
    requestAnimationFrame(driftPhysics);
  }

  // Back to top helper function (handles desktop Lenis and mobile native scroll)
  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back to top button implementation
  const backToTop = document.getElementById('btn-back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      scrollToTop();
    });
  }

  // Logo scroll to top helper
  const logoBtn = document.getElementById('header-logo');
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTop();
    });
  }

  // 6. Contact Form validation and submit mock terminal pipeline
  const contactForm = document.getElementById('secure-contact-form');
  const btnSubmit = document.getElementById('btn-submit-form');
  const statusSuccess = document.getElementById('status-success');
  const statusError = document.getElementById('status-error');

  if (contactForm && btnSubmit) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Animate submit button to show loading
      const btnSpan = btnSubmit.querySelector('span');
      const origText = btnSpan.textContent;
      btnSpan.textContent = "ESTABLISHING HANDSHAKE...";
      btnSubmit.style.opacity = '0.7';
      btnSubmit.style.pointerEvents = 'none';
      
      if (statusSuccess) statusSuccess.style.display = 'none';
      if (statusError) statusError.style.display = 'none';

      // Capture actual values
      const formData = {
        name: document.getElementById('form-name').value,
        email: document.getElementById('form-email').value,
        message: document.getElementById('form-msg').value
      };

      // FormSubmit AJAX execution
      fetch("https://formsubmit.co/ajax/dobariyanisarg@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response not OK');
      })
      .then(data => {
        btnSubmit.style.opacity = '1';
        btnSubmit.style.pointerEvents = 'all';
        btnSpan.textContent = origText;
        
        if (statusSuccess) {
          statusSuccess.style.display = 'flex';
          statusSuccess.classList.add('success');
        }
        contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          if (statusSuccess) statusSuccess.style.display = 'none';
        }, 5000);
      })
      .catch(error => {
        btnSubmit.style.opacity = '1';
        btnSubmit.style.pointerEvents = 'all';
        btnSpan.textContent = origText;
        
        if (statusError) {
          statusError.style.display = 'flex';
          statusError.classList.add('error');
        }
      });
    });
  }
});
