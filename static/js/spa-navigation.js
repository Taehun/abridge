// SPA-like navigation - only update main content, keep header/footer
(function() {
  // Check if browser supports required APIs
  if (!window.history || !window.fetch) return;

  // Handle link clicks
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external links, anchors, and special links
    if (link.target === '_blank' ||
        link.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http') && !href.startsWith(window.location.origin)) {
      return;
    }

    // Skip search form submission
    if (link.closest('form')) return;

    e.preventDefault();
    navigateTo(href);
  });

  // Handle browser back/forward
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.href) {
      loadPage(e.state.href, false);
    }
  });

  function navigateTo(href) {
    // Normalize URL
    const url = new URL(href, window.location.origin);

    // Don't navigate to same page
    if (url.pathname === window.location.pathname) {
      if (url.hash) {
        window.location.hash = url.hash;
      }
      return;
    }

    loadPage(url.href, true);
  }

  function loadPage(href, pushState) {
    // Show loading state
    document.body.classList.add('page-loading');
    const main = document.querySelector('main');
    if (main) {
      main.style.opacity = '0.5';
      main.style.transition = 'opacity 0.15s ease';
    }

    fetch(href)
      .then(function(response) {
        if (!response.ok) throw new Error('Network response was not ok');
        // Security: Validate Content-Type to prevent non-HTML injection
        var contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
          throw new Error('Invalid content type: expected text/html');
        }
        return response.text();
      })
      .then(function(html) {
        // Parse the new page
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Update main content
        const newMain = doc.querySelector('main');
        const currentMain = document.querySelector('main');

        if (newMain && currentMain) {
          // Fade out, replace, fade in
          currentMain.style.opacity = '0';

          setTimeout(function() {
            currentMain.innerHTML = newMain.innerHTML;
            currentMain.style.opacity = '1';

            // Update page title
            const newTitle = doc.querySelector('title');
            if (newTitle) {
              document.title = newTitle.textContent;
            }

            // Update URL
            if (pushState) {
              history.pushState({ href: href }, '', href);
            }

            // Scroll to top
            window.scrollTo(0, 0);

            // Re-initialize any scripts that need it
            reinitialize();

            document.body.classList.remove('page-loading');
          }, 150);
        } else {
          // Fallback to normal navigation
          window.location.href = href;
        }
      })
      .catch(function(error) {
        console.error('SPA navigation error:', error);
        // Fallback to normal navigation
        window.location.href = href;
      });
  }

  function reinitialize() {
    // Trigger custom event for other scripts to handle their own re-initialization
    document.dispatchEvent(new CustomEvent('spa:navigate'));
  }

  // Save initial state
  history.replaceState({ href: window.location.href }, '', window.location.href);
})();
