// ==UserScript==
// @name        ViolentRipper
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @match       *://*/*
// @icon        https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/icon.png
// @grant       GM_xmlhttpRequest
// @version     4.3.1
// @author      crmbz0r
// @description Rips website contents (html, js, css, images & enhanced types), auto converts embedded stuff to correct local paths while preserving the original folder structure
// @exclude     https://github.com/*
// @exclude     https://raw.githubusercontent.com/*
// @exclude     https://gist.github.com/*
// @exclude     https://youtube.com/*
// @connect     self
// @connect     *
// @run-at      document-start
// @noframes
// @inject-into page
// @require     https://cdn.jsdelivr.net/npm/jszip@3.9.1/dist/jszip.min.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/state.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/styles.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/pathUtils.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/collector.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/fetcher.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/downloader.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/scanner.js
// @require     https://cdn.jsdelivr.net/gh/crmbz0r/ViolentRipper@main/lib/ui.js
// ==/UserScript==

// Define 'globalThis' & 'ViolentRipper' for engines that don't support it (non ViolentMonkey like Tampermonkey)
if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

if (typeof ViolentRipper === 'undefined') {
    console.error('[ViolentRipper] Fatal: ViolentRipper object not found. Check if @require files loaded correctly.');
    // Try to initialize manually or provide fallback
    globalThis.ViolentRipper = {
        getStyles: () => '',
        ui: {
            buildPanel: () => ({ panel: document.createElement('div') }),
            setupDrag: () => {},
            _updateAutoWatchPosition: () => {},
            toggleEnhancedMode: () => {}
        },
        state: {
            activeTypes: new Set(),
            autoWatchEnabled: false,
            enhancedMode: false,
            watchModeActive: false
        },
        scanner: {
            scan: () => console.log('[ViolentRipper] Scan called'),
            toggleWatchMode: () => console.log('[ViolentRipper] Toggle watch mode'),
            clear: () => console.log('[ViolentRipper] Clear called')
        },
        downloader: {
            downloadZip: () => console.log('[ViolentRipper] Download called')
        }
    };
}

; (function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        // Safety check: ensure all libraries loaded successfully
        if (!globalThis.ViolentRipper?.getStyles || !globalThis.ViolentRipper?.ui?.buildPanel) {
            console.error('[ViolentRipper] Fatal: Libraries failed to load. Check script includes.')
            return
        }

        const styleEl = document.createElement('style')
        styleEl.textContent = ViolentRipper.getStyles()
        document.head.appendChild(styleEl)

        const elements = ViolentRipper.ui.buildPanel()
        ViolentRipper.ui.setupDrag()

        // Initialize auto button position next to main button
        ViolentRipper.ui._updateAutoWatchPosition()

        // Load activeTypes from localStorage (per hostname)
        const savedActiveTypes = localStorage.getItem(ViolentRipper.state.activeTypesKey)
        if (savedActiveTypes) {
            try {
                const parsed = JSON.parse(savedActiveTypes)
                ViolentRipper.state.activeTypes = new Set(parsed)
            } catch (e) {
                // Use default activeTypes if parsing fails
            }
        }

        // Initialize enhanced mode UI state
        if (ViolentRipper.state.enhancedMode) {
            ViolentRipper.ui.toggleEnhancedMode(true)
            // Ensure enhanced types are in activeTypes if enhanced mode was saved
            ViolentRipper.state.activeTypes.add('archive')
            ViolentRipper.state.activeTypes.add('audio')
            ViolentRipper.state.activeTypes.add('video')
        }

        // Update chip visual states based on loaded activeTypes
        elements.panel.querySelectorAll('.ViolentRipper-chip').forEach(chip => {
            const t = chip.dataset.type
            if (t !== 'enhanced' && ViolentRipper.state.activeTypes.has(t)) {
                chip.className = `ViolentRipper-chip active-${t}`
            }
        })

        // Helper function to save activeTypes to localStorage
        const saveActiveTypes = () => {
            localStorage.setItem(
                ViolentRipper.state.activeTypesKey,
                JSON.stringify([...ViolentRipper.state.activeTypes])
            )
        }

        // Filter chips
        elements.panel.querySelectorAll('.ViolentRipper-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const t = chip.dataset.type, { activeTypes } = ViolentRipper.state
                if (t === 'enhanced') return // Skip enhanced toggle, handled separately
                if (activeTypes.has(t)) {
                    if (activeTypes.size === 1) return
                    activeTypes.delete(t); chip.className = 'ViolentRipper-chip'
                } else {
                    activeTypes.add(t); chip.className = `ViolentRipper-chip active-${t}`
                }
                saveActiveTypes()
            })
        })

        // Enhanced toggle chip
        if (elements.enhancedToggle) {
            elements.enhancedToggle.addEventListener('click', e => {
                e.stopPropagation()
                const s = ViolentRipper.state
                s.enhancedMode = !s.enhancedMode
                localStorage.setItem('ViolentRipper-enhancedMode', s.enhancedMode)
                ViolentRipper.ui.toggleEnhancedMode(s.enhancedMode)
                if (s.enhancedMode) {
                    // Add enhanced types to activeTypes when enabling
                    s.activeTypes.add('archive')
                    s.activeTypes.add('audio')
                    s.activeTypes.add('video')
                    // Update chip styles
                    const enhancedChips = elements.enhancedChipsContainer.querySelectorAll('.ViolentRipper-chip')
                    enhancedChips.forEach(chip => {
                        const t = chip.dataset.type
                        if (s.activeTypes.has(t)) {
                            chip.className = `ViolentRipper-chip active-${t}`
                        }
                    })
                }
            })
        }

        // Button events
        elements.closeBtn.addEventListener('click', () => elements.panel.classList.add('hidden'))
        elements.scanBtn.addEventListener('click', () => ViolentRipper.scanner.scan())
        elements.watchBtn.addEventListener('click', () => ViolentRipper.scanner.toggleWatchMode())
        elements.dlBtn.addEventListener('click', () => ViolentRipper.downloader.downloadZip())
        elements.clearBtn.addEventListener('click', () => ViolentRipper.scanner.clear())

        elements.autoWatchBtn.addEventListener('click', e => {
            e.stopPropagation()
            const s = ViolentRipper.state
            s.autoWatchEnabled = !s.autoWatchEnabled
            localStorage.setItem('ViolentRipper-autowatch', s.autoWatchEnabled)
            elements.autoWatchBtn.classList.toggle('enabled', s.autoWatchEnabled)
        })

        // Auto-start
        if (ViolentRipper.state.autoWatchEnabled) {
            setTimeout(() => {
                if (!ViolentRipper.state.watchModeActive) ViolentRipper.scanner.toggleWatchMode()
            }, 500)
        }
    })
})();
