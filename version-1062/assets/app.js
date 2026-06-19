(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function joinPath(root, path) {
    return String(root || "./") + String(path || "").replace(/^\.\//, "");
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initGlobalSearch() {
    var inputs = selectAll("[data-search-input]");
    var data = window.__MOVIE_SEARCH_INDEX || [];
    var root = document.body.getAttribute("data-root") || "./";
    if (!inputs.length || !data.length) {
      return;
    }

    function render(panel, query) {
      var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      var results = data.filter(function (item) {
        var text = item.search.toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 8);
      if (!results.length) {
        panel.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
        panel.classList.add("is-open");
        return;
      }
      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + joinPath(root, item.url) + '">' +
          '<img src="' + joinPath(root, item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
          '<span><strong>' + escapeHtml(item.title) + '</strong>' +
          '<small>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.genre) + '</small></span>' +
          '</a>';
      }).join("");
      panel.classList.add("is-open");
    }

    inputs.forEach(function (input) {
      var box = input.closest(".search-box");
      var panel = box ? box.querySelector("[data-search-panel]") : null;
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        render(panel, input.value);
      });
      input.addEventListener("focus", function () {
        render(panel, input.value);
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".search-box")) {
        selectAll("[data-search-panel]").forEach(function (panel) {
          panel.classList.remove("is-open");
        });
      }
    });
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var cards = selectAll(".movie-card-item", list);
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-meta")).toLowerCase();
        card.classList.toggle("is-hidden-card", query && text.indexOf(query) === -1);
      });
    });
  }

  window.initMoviePlayer = function (source, videoId) {
    var video = document.getElementById(videoId);
    var overlay = document.querySelector("[data-play-overlay]");
    var loaded = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function markPlaying() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function safePlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function loadAndPlay() {
      markPlaying();
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            safePlay();
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", safePlay, { once: true });
          video.load();
        } else {
          video.src = source;
          video.addEventListener("loadedmetadata", safePlay, { once: true });
          video.load();
        }
      } else {
        safePlay();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener("play", markPlaying);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
  });
})();
