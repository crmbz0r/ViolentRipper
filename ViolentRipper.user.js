// ==UserScript==
// @name         ViolentRipper
// @namespace    https://github.com/crmbz0r/ViolentRipper
// @version      4.2.0.45
// @description  Rips websites using correct local paths and preserves the original folder structure
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-start
// @noframes
// @inject-into  page
// @require      https://cdn.jsdelivr.net/npm/jszip@3.9.1/dist/jszip.min.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/state.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/styles.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/pathUtils.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/collector.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/fetcher.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/downloader.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/scanner.js
// @require      https://raw.githubusercontent.com/crmbz0r/ViolentRipper/refs/heads/main/lib/ui.js
// ==/UserScript==

; (function () {
    'use strict'

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

        // Filter chips
        elements.panel.querySelectorAll('.ViolentRipper-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const t = chip.dataset.type, { activeTypes } = ViolentRipper.state
                if (activeTypes.has(t)) {
                    if (activeTypes.size === 1) return
                    activeTypes.delete(t); chip.className = 'ViolentRipper-chip'
                } else {
                    activeTypes.add(t); chip.className = `ViolentRipper-chip active-${t}`
                }
            })
        })

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
})()
