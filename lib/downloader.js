// ==UserScript==
// @name        ViolentRipper - downloader script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.3
// @author      crmbz0r
// @description The script for packing everything together into a zip file ready to download
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.downloader = {
        async downloadZip() {
            const { ui, state } = ViolentRipper
            const { elements } = ui
            elements.dlBtn.disabled = true
            ui.addLog('Packing ZIP …', 'info')

            const zip = new JSZip()
            const root = zip.folder(location.hostname)
            for (const file of Object.values(state.collectedFiles)) root.file(file.path, file.data)

            try {
                const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
                const ts = new Date().toISOString().replaceAll(/[:.]/g, '-').slice(0, 19)
                const filename = `${location.hostname}_full_${ts}.zip`
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = filename; a.style.display = 'none'
                document.body.appendChild(a)
                a.click()
                a.remove()
                setTimeout(() => URL.revokeObjectURL(url), 1000)
                ui.addLog(`✓ "${filename}" (${(blob.size / 1024).toFixed(1)} KB) getting saved...`, 'ok-html')
            } catch (e) {
                ui.addLog(`ZIP-Error: ${e.message}`, 'err')
            }
            elements.dlBtn.disabled = false
        },
    }
})();
