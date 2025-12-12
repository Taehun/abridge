// Mobile menu toggle functionality
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  if (!menuToggle || !mobileMenu) return;

  // Toggle menu
  function openMenu() {
    mobileMenu.classList.add('active');
    if (menuOverlay) menuOverlay.classList.add('active');
    // ARIA attributes for screen readers
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    // Enable focus trap
    mobileMenu.addEventListener('keydown', trapFocus);
    // Focus first focusable element in menu for accessibility
    const firstFocusable = mobileMenu.querySelector('input, a[href], button');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu(returnFocus) {
    mobileMenu.classList.remove('active');
    if (menuOverlay) menuOverlay.classList.remove('active');
    // ARIA attributes for screen readers
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    // Remove focus trap
    mobileMenu.removeEventListener('keydown', trapFocus);
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

  // Close menu when clicking outside (fallback for overlay z-index issues)
  document.addEventListener('click', function(e) {
    if (!mobileMenu.classList.contains('active')) return;

    // If click is inside menu or on toggle button, don't close
    if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;

    closeMenu(false);
  });

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
      closeMenu(false);
    }
  });

  // Close menu when search form is submitted
  const searchForm = mobileMenu.querySelector('form[name="goSearch"]');
  if (searchForm) {
    searchForm.addEventListener('submit', function() {
      closeMenu(false);
    });
  }

  // Close menu when search is executed (custom event from search scripts)
  document.addEventListener('search:submit', function() {
    if (mobileMenu.classList.contains('active')) {
      closeMenu(false);
    }
  });

  // Close menu after SPA navigation completes
  document.addEventListener('spa:navigate', function() {
    if (mobileMenu.classList.contains('active')) {
      closeMenu(false);
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMenu(true);
    }
  });
})();
