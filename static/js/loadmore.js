// Load More Button Pagination
(function() {
  'use strict';

  // Force fresh navigation for home links (bypass bfcache)
  document.querySelectorAll('a.home-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      location.href = this.href;
    });
  });

  var btn = document.getElementById('load-more-btn');
  if (!btn) return;

  var grid = document.querySelector('.post-grid');
  var currentPage = +btn.dataset.currentPage || 1;
  var totalPages = +btn.dataset.totalPages || 1;
  var baseUrl = btn.dataset.baseUrl || '';
  var uglyUrls = btn.dataset.uglyUrls === 'true';
  var loading = false;

  function getUrl(page) {
    var url = baseUrl + page + '/';
    return uglyUrls ? url + 'index.html' : url;
  }

  function resetLoadingState() {
    loading = false;
    btn.classList.remove('loading');
    btn.disabled = false;
  }

  // Reset loading state on page show (handles bfcache)
  window.addEventListener('pageshow', function(event) {
    resetLoadingState();
    // If page was restored from cache, also reset currentPage
    if (event.persisted) {
      currentPage = +btn.dataset.currentPage || 1;
      if (currentPage < totalPages) {
        btn.style.display = '';
      }
    }
  });

  btn.addEventListener('click', function() {
    if (loading || currentPage >= totalPages) return;
    loading = true;
    btn.classList.add('loading');
    btn.disabled = true;

    fetch(getUrl(currentPage + 1))
      .then(function(r) { return r.text(); })
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var posts = doc.querySelectorAll('.post-grid > article');
        posts.forEach(function(post) {
          var clone = post.cloneNode(true);
          clone.classList.add('post-card-enter');
          grid.appendChild(clone);
          requestAnimationFrame(function() {
            clone.classList.add('post-card-enter-active');
          });
        });
        currentPage++;
        if (currentPage >= totalPages) {
          btn.style.display = 'none';
        }
      })
      .catch(function(e) { console.error('Load more error:', e); })
      .finally(resetLoadingState);
  });
})();
