// ==UserScript==
// @name        ViolentRipper - state script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.2
// @author      crmbz0r
// @description The script for handling the different state settings
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    window.globalThis = window;
}

(function () {
    'use strict';
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
})();
