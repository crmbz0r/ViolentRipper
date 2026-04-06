// ==UserScript==
// @name         Violent Ripper
// @namespace    https://github.com/crmbz0r/violent-ripper
// @version      4.2.0
// @description  Rips websites using correct local paths and preserves the original folder structure
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      *
// @run-at       document-start
// @noframes
// @inject-into  page
// @require      https://cdn.jsdelivr.net/npm/jszip@3.9.1/dist/jszip.min.js
//
// @require      file:///A:/Violentmonkey/violent-ripper/lib/state.js
//
// @require      https://raw.githubusercontent.com/crmbz0r/violent-ripper/refs/heads/main/lib/state.js
//
// @require      .../lib/state.js
// @require      .../lib/styles.js
// @require      .../lib/pathUtils.js
// @require      .../lib/collector.js
// @require      .../lib/fetcher.js
// @require      .../lib/downloader.js
// @require      .../lib/scanner.js
// @require      .../lib/ui.js
// ==/UserScript==

; (function () {
    'use strict'

    document.addEventListener('DOMContentLoaded', function () {
        GM_addStyle(ViolentRipper.getStyles())

        const elements = ViolentRipper.ui.buildPanel()
        ViolentRipper.ui.setupDrag()

        // Filter chips
        elements.panel.querySelectorAll('.jsripper-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const t = chip.dataset.type, { activeTypes } = ViolentRipper.state
                if (activeTypes.has(t)) {
                    if (activeTypes.size === 1) return
                    activeTypes.delete(t); chip.className = 'jsripper-chip'
                } else {
                    activeTypes.add(t); chip.className = `jsripper-chip active-${t}`
                }
            })
        })

        // Button events
        elements.btn.addEventListener('click', () => elements.panel.classList.toggle('hidden'))
        elements.closeBtn.addEventListener('click', () => elements.panel.classList.add('hidden'))
        elements.scanBtn.addEventListener('click', () => ViolentRipper.scanner.scan())
        elements.watchBtn.addEventListener('click', () => ViolentRipper.scanner.toggleWatchMode())
        elements.dlBtn.addEventListener('click', () => ViolentRipper.downloader.downloadZip())
        elements.clearBtn.addEventListener('click', () => ViolentRipper.scanner.clear())

        elements.autoWatchBtn.addEventListener('click', e => {
            e.stopPropagation()
            const s = ViolentRipper.state
            s.autoWatchEnabled = !s.autoWatchEnabled
            localStorage.setItem('violentripper-autowatch', s.autoWatchEnabled)
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
