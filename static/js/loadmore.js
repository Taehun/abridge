// Load More Button Pagination
(function() {
  'use strict';
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
      .finally(function() {
        loading = false;
        btn.classList.remove('loading');
        btn.disabled = false;
      });
  });
})();
