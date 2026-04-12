// Define globalThis for engines that don't support it (non ViolentMonkey like Tampermonkey)
if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict'
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.downloader = {
        async downloadZip() {
            const { ui, state } = ViolentRipper
            const { elements } = ui
            elements.dlBtn.disabled = true
            ui.addLog('Erstelle ZIP …', 'info')

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
                ui.addLog(`✓ "${filename}" (${(blob.size / 1024).toFixed(1)} KB) wird heruntergeladen.`, 'ok-html')
            } catch (e) {
                ui.addLog(`ZIP-Fehler: ${e.message}`, 'err')
            }
            elements.dlBtn.disabled = false
        },
    }
})()
