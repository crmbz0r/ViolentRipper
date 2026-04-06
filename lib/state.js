; (function () {
    'use strict'
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    const _stored = (() => {
        try { return JSON.parse(localStorage.getItem('violentripper-position') || '{}') } catch { return {} }
    })()

    ViolentRipper.state = {
        collectedFiles: {},
        urlToLocalPath: new Map(),
        processedUrls: new Set(),
        activeTypes: new Set(['js', 'css', 'html', 'img']),
        watchModeActive: false,
        watchToggleLock: false,
        performanceObserver: null,
        autoWatchEnabled: localStorage.getItem('violentripper-autowatch') === 'true',
        buttonX: _stored.btn ? _stored.btn.x : (_stored.x || 24),
        buttonY: _stored.btn ? _stored.btn.y : (_stored.y || 24),
    }
})()