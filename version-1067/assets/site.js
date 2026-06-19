(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
        hydrateSearchQuery();
    });

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var container = root.parentElement.querySelector("[data-card-container]");
            if (!container) {
                container = document;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll(".js-filter-card"));
            var input = root.querySelector("[data-search-input]");
            var year = root.querySelector("[data-year-select]");
            var category = root.querySelector("[data-category-select]");
            var count = root.querySelector("[data-result-count]");

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var categoryValue = category ? category.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.category,
                        card.dataset.tags,
                        card.dataset.year
                    ].join(" ").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesYear = !yearValue || card.dataset.year === yearValue;
                    var matchesCategory = !categoryValue || card.dataset.category === categoryValue;
                    var isVisible = matchesQuery && matchesYear && matchesCategory;
                    card.classList.toggle("is-hidden", !isVisible);
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [input, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-play]");
            var source = player.getAttribute("data-src");
            var initialized = false;

            if (!video || !source) {
                return;
            }

            function initialize() {
                if (initialized) {
                    return;
                }
                initialized = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return;
                }
                video.src = source;
            }

            function start() {
                initialize();
                video.setAttribute("controls", "controls");
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!initialized) {
                    start();
                }
            });
        });
    }

    function hydrateSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        var year = params.get("year");
        var input = document.querySelector("[data-search-input]");
        var yearSelect = document.querySelector("[data-year-select]");
        if (query && input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (year && yearSelect) {
            yearSelect.value = year;
            yearSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }
})();
