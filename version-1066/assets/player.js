(function () {
    function setStatus(player, message, state) {
        var status = player.querySelector('[data-player-status]');
        if (!status) {
            return;
        }
        status.textContent = message;
        status.classList.toggle('is-ready', state === 'ready');
        status.classList.toggle('is-error', state === 'error');
    }

    function initializePlayer(player) {
        var video = player.querySelector('video');
        var stream = player.getAttribute('data-stream');
        var playButton = player.querySelector('[data-play-button]');
        var playToggle = player.querySelector('[data-play-toggle]');
        var muteToggle = player.querySelector('[data-mute-toggle]');
        var fullscreenButton = player.querySelector('[data-fullscreen]');
        var hlsInstance = null;

        if (!video || !stream) {
            setStatus(player, '影片暂不可播', 'error');
            return;
        }

        function markReady() {
            setStatus(player, '可以播放', 'ready');
        }

        function markError() {
            setStatus(player, '播放失败，请稍后再试', 'error');
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, markReady);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    setStatus(player, '正在重新连接', 'error');
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    setStatus(player, '正在恢复播放', 'error');
                } else {
                    markError();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', markReady, { once: true });
        } else {
            setStatus(player, '视频格式暂不支持', 'error');
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    setStatus(player, '点击视频继续播放', 'error');
                });
            }
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                playVideo();
            } else {
                video.pause();
            }
        }

        function updatePlayState() {
            var playing = !video.paused && !video.ended;
            player.classList.toggle('is-playing', playing);
            if (playToggle) {
                playToggle.textContent = playing ? '暂停' : '播放';
            }
        }

        if (playButton) {
            playButton.addEventListener('click', togglePlay);
        }

        if (playToggle) {
            playToggle.addEventListener('click', togglePlay);
        }

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updatePlayState);
        video.addEventListener('pause', updatePlayState);
        video.addEventListener('ended', updatePlayState);
        video.addEventListener('error', markError);

        if (muteToggle) {
            muteToggle.addEventListener('click', function () {
                video.muted = !video.muted;
                muteToggle.textContent = video.muted ? '取消静音' : '静音';
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(initializePlayer);
})();
