(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".nav-toggle");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = header.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search[data-target]"));
        inputs.forEach(function (input) {
            var target = document.querySelector(input.getAttribute("data-target"));
            if (!target) {
                return;
            }
            input.addEventListener("input", function () {
                var terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                var cards = Array.prototype.slice.call(target.querySelectorAll(".video-card"));
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    var matched = terms.every(function (term) {
                        return haystack.indexOf(term) !== -1;
                    });
                    card.classList.toggle("is-filter-hidden", !matched);
                });
            });
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("moviePlayer");
        var cover = document.querySelector(".player-cover");
        var loaded = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });
})();
