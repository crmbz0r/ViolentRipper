// ==UserScript==
// @name        ViolentRipper - state script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.5
// @author      crmbz0r
// @description The script for handling the different state settings
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    // File type extension constants
    const ARCHIVE_EXTS = ['.exe', '.msi', '.rar', '.zip', '.7z']
    const AUDIO_EXTS = ['.wav', '.mp3', '.flac', '.m4a']
    const VIDEO_EXTS = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.m4v']

    ViolentRipper.state = {
        collectedFiles: {},
        urlToLocalPath: new Map(),
        processedUrls: new Set(),
        activeTypes: new Set(['js', 'css', 'html', 'img']),
        watchModeActive: false,
        watchToggleLock: false,
        performanceObserver: null,
        autoWatchEnabled: localStorage.getItem('ViolentRipper-autowatch') === 'true',
        enhancedMode: localStorage.getItem('ViolentRipper-enhancedMode') === 'true',
        positionKey: `ViolentRipper-position-${location.hostname}`,
        activeTypesKey: `ViolentRipper-activeTypes-${location.hostname}`,
        // Export extension constants for use in other modules
        ARCHIVE_EXTS,
        AUDIO_EXTS,
        VIDEO_EXTS,
    }
})();
