// Define globalThis for engines that don't support it (non ViolentMonkey like Tampermonkey)
if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict'
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.state = {
        collectedFiles: {},
        urlToLocalPath: new Map(),
        processedUrls: new Set(),
        activeTypes: new Set(['js', 'css', 'html', 'img']),
        watchModeActive: false,
        watchToggleLock: false,
        performanceObserver: null,
        autoWatchEnabled: localStorage.getItem('ViolentRipper-autowatch') === 'true',
        positionKey: `ViolentRipper-position-${location.hostname}`,
    }
})()