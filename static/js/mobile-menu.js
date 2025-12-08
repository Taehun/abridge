// Mobile menu toggle functionality
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  if (!menuToggle || !mobileMenu) return;

  let scrollPosition = 0;

  // Toggle menu
  function openMenu() {
    // Save scroll position before fixing body
    scrollPosition = window.pageYOffset;
    document.body.style.top = -scrollPosition + 'px';
    mobileMenu.classList.add('active');
    if (menuOverlay) menuOverlay.classList.add('active');
    document.body.classList.add('menu-open');
    // ARIA attributes for screen readers
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    // Enable focus trap
    mobileMenu.addEventListener('keydown', trapFocus);
    // Focus first focusable element in menu for accessibility
    const firstFocusable = mobileMenu.querySelector('input, a[href], button');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu(returnFocus, restoreScroll) {
    mobileMenu.classList.remove('active');
    if (menuOverlay) menuOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    // ARIA attributes for screen readers
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    // Remove focus trap
    mobileMenu.removeEventListener('keydown', trapFocus);
    // Restore scroll position only if requested
    if (restoreScroll !== false) {
      window.scrollTo(0, scrollPosition);
    }
    // Return focus to toggle button only when explicitly requested
    if (returnFocus) menuToggle.focus();
  }

  // Focus trap to keep Tab key within menu when open
  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = mobileMenu.querySelectorAll(
      'a[href], button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Open menu
  menuToggle.addEventListener('click', openMenu);

  // Close menu when clicking overlay
  if (menuOverlay) {
    menuOverlay.addEventListener('click', function() {
      closeMenu(true);
    });
  }

  // Handle menu link clicks with event delegation (no need to re-attach on SPA navigation)
  mobileMenu.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const url = new URL(href, window.location.origin);
    // Normalize paths by removing trailing slashes
    const linkPath = url.pathname.replace(/\/$/, '') || '/';
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    // If same page, close menu immediately
    if (linkPath === currentPath) {
      closeMenu(false, true);
    }
  });

  // Close menu after SPA navigation completes
  document.addEventListener('spa:navigate', function() {
    if (document.body.classList.contains('menu-open')) {
      closeMenu(false, false);
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu(true);
    }
  });
})();
