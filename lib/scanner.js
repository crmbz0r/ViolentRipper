// ==UserScript==
// @name        ViolentRipper - scanner script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.2
// @author      crmbz0r
// @description The script for the main and watcher scanning functions
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    window.globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.scanner = {

        async _processFile(url, type, localPath) {
            const result = await ViolentRipper.fetcher.fetchBinary(url)
            const pu = ViolentRipper.pathUtils
            let finalData = result.data
            if (type === 'html' && result.text)
                finalData = new TextEncoder().encode(pu.rewriteHtmlPaths(result.text, url, localPath))
            else if (type === 'css' && result.text)
                finalData = new TextEncoder().encode(pu.rewriteCssPaths(result.text, url, localPath))
            ViolentRipper.state.collectedFiles[url] = { path: localPath, type, data: finalData }
            return finalData
        },

        async scan() {
            const s = ViolentRipper.state, ui = ViolentRipper.ui, el = ui.elements
            Object.keys(s.collectedFiles).forEach(k => delete s.collectedFiles[k])
            s.urlToLocalPath.clear(); s.processedUrls.clear()
            ui.updateStats()
            el.dlBtn.disabled = true; el.scanBtn.disabled = true
            ui.addLog(`[${new Date().toLocaleTimeString()}] Starte Scan auf ${location.hostname} …`, 'info')

            const { allUrls, typeMap } = ViolentRipper.collector.collectAll()
            ui.addLog(`${allUrls.length} Files found, building path-mapping…`, 'info')
            for (const url of allUrls) s.urlToLocalPath.set(url, ViolentRipper.pathUtils.getLocalPathFromUrl(url))

            let ok = 0, fail = 0
            for (const url of allUrls) {
                const type = typeMap.get(url)
                const localPath = s.urlToLocalPath.get(url)
                try {
                    const data = await this._processFile(url, type, localPath)
                    ui.addLog(`✓ ${localPath} (${(data.length / 1024).toFixed(1)} KB)`, `ok-${type}`)
                    ok++
                } catch (e) {
                    ui.addLog(`✗ ${localPath} — ${e.message}`, 'err')
                    fail++
                }
                ui.updateStats()
            }
            ui.addLog(`Fertig: ${ok} OK, ${fail} Error.`, 'info')
            if (ok > 0) el.dlBtn.disabled = false
            el.scanBtn.disabled = false
        },

        async processSingleUrl(url) {
            const s = ViolentRipper.state
            if (s.processedUrls.has(url)) return
            s.processedUrls.add(url)
            const type = ViolentRipper.collector.getTypeForUrl(url)
            if (!type || !s.activeTypes.has(type)) return
            const localPath = ViolentRipper.pathUtils.getLocalPathFromUrl(url)
            s.urlToLocalPath.set(url, localPath)
            try {
                await this._processFile(url, type, localPath)
                ViolentRipper.ui.addLog(`👁 ✓ ${localPath}`, `ok-${type}`)
                ViolentRipper.ui.updateStats()
            } catch (e) {
                console.warn('ViolentRipper watch mode error:', e.message)
            }
        },

        async toggleWatchMode() {
            const s = ViolentRipper.state, ui = ViolentRipper.ui, el = ui.elements
            if (s.watchToggleLock) return
            s.watchToggleLock = true
            try {
                if (s.watchModeActive) {
                    s.watchModeActive = false
                    el.watchBtn.classList.remove('watch-active')
                    el.watchBtn.textContent = '👁 Watch'
                    el.dlBtn.disabled = Object.keys(s.collectedFiles).length === 0
                    ui.addLog('✅ Watch Mode stopped.', 'info')
                    if (s.performanceObserver) { s.performanceObserver.disconnect(); s.performanceObserver = null }
                } else {
                    s.watchModeActive = true
                    el.watchBtn.classList.add('watch-active')
                    el.watchBtn.textContent = '🔴 Watching'
                    el.dlBtn.disabled = true
                    ui.addLog('🔴 Watch Mode active - auto collecting new content...', 'info')
                    const { allUrls } = ViolentRipper.collector.collectAll()
                    ui.addLog(`🔍 Initial Scan: ${allUrls.length} Files found`, 'info')
                    await Promise.all(allUrls.map(u => this.processSingleUrl(u)))
                    ui.addLog('✅ Initial scan done, waiting for new content...', 'info')
                    s.performanceObserver = new PerformanceObserver(list => {
                        for (const entry of list.getEntries()) {
                            try {
                                const url = new URL(entry.name, location.origin).href
                                if (new URL(url).origin === location.origin) this.processSingleUrl(url)
                            } catch { }
                        }
                    })
                    s.performanceObserver.observe({ entryTypes: ['resource'] })
                }
            } finally {
                s.watchToggleLock = false
            }
        },

        clear() {
            const s = ViolentRipper.state, ui = ViolentRipper.ui
            if (s.watchModeActive) this.toggleWatchMode()
            ui.elements.logEl.innerHTML = ''
            Object.keys(s.collectedFiles).forEach(k => delete s.collectedFiles[k])
            s.urlToLocalPath.clear(); s.processedUrls.clear()
            ui.updateStats()
            ui.elements.dlBtn.disabled = true
        },
    }
})();
