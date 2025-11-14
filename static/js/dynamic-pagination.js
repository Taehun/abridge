(function() {
  'use strict';

  function adjustArticleVisibility() {
    // Only apply dynamic pagination on the first page (homepage)
    // Check if we're on page 2, 3, etc. by looking at the URL
    const isFirstPage = !window.location.pathname.includes('/page/');
    if (!isFirstPage) {
      return; // Don't apply dynamic pagination on other pages
    }

    const articles = document.querySelectorAll('main > div > article');
    if (articles.length === 0) return;

    // First, make all articles visible to measure them
    articles.forEach(article => {
      article.style.display = '';
    });

    // Measure actual article heights
    const articleHeights = [];
    articles.forEach(article => {
      const height = article.offsetHeight;
      articleHeights.push(height);
    });

    const viewportHeight = window.innerHeight;
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    const headerHeight = header ? header.offsetHeight : 60;
    const footerHeight = footer ? footer.offsetHeight : 100;

    // Available height for articles (account for pagination nav too)
    const availableHeight = viewportHeight - headerHeight - footerHeight - 100;

    // Calculate how many articles fit
    let optimalCount = 0;
    let accumulatedHeight = 0;
    for (let i = 0; i < articleHeights.length; i++) {
      if (accumulatedHeight + articleHeights[i] <= availableHeight) {
        accumulatedHeight += articleHeights[i];
        optimalCount++;
      } else {
        break;
      }
    }

    // Ensure at least 1 article is shown
    optimalCount = Math.max(1, optimalCount);

    console.log('Viewport height:', viewportHeight);
    console.log('Available height:', availableHeight);
    console.log('Optimal article count:', optimalCount);
    console.log('Total articles available:', articles.length);

    // Hide articles beyond the optimal count
    articles.forEach((article, index) => {
      if (index < optimalCount) {
        article.style.display = '';
      } else {
        article.style.display = 'none';
      }
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
      const later = () => {
        clearTimeout(timeout);
        func();
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adjustArticleVisibility);
  } else {
    adjustArticleVisibility();
  }

  window.addEventListener('resize', debounce(adjustArticleVisibility, 250));
})();
