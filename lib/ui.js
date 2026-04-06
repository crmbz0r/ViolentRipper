; (function () {
    'use strict'
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.ui = {
        elements: {},

        buildPanel() {
            const s = ViolentRipper.state

            const btn = document.createElement('button')
            btn.id = 'ViolentRipper-btn'; btn.textContent = '⇣V↬Ripper'
            document.body.appendChild(btn)

            const autoWatchBtn = document.createElement('div')
            autoWatchBtn.id = 'ViolentRipper-autowatch'
            autoWatchBtn.textContent = 'Auto'
            autoWatchBtn.title = 'Auto-start watch mode on page load'
            autoWatchBtn.classList.toggle('enabled', s.autoWatchEnabled)
            document.body.appendChild(autoWatchBtn)

            const panel = document.createElement('div')
            panel.id = 'ViolentRipper-panel'; panel.className = 'hidden'
            panel.innerHTML = `
        <div id="ViolentRipper-header">
          Violent Ripper <span style="font-size:10px;color:#555;font-weight:400;margin-left:6px;">v5.0</span>
          <span id="ViolentRipper-close">✕</span>
        </div>
        <div id="ViolentRipper-filters">
          <div class="ViolentRipper-chip active-js"   data-type="js">  <span class="dot"></span> .js</div>
          <div class="ViolentRipper-chip active-css"  data-type="css"> <span class="dot"></span> .css</div>
          <div class="ViolentRipper-chip active-html" data-type="html"><span class="dot"></span> .html</div>
          <div class="ViolentRipper-chip active-img"  data-type="img"> <span class="dot"></span> Bilder</div>
        </div>
        <div id="ViolentRipper-stats">
          <div class="ViolentRipper-stat s-js">  JS: <span id="stat-js">0</span></div>
          <div class="ViolentRipper-stat s-css"> CSS: <span id="stat-css">0</span></div>
          <div class="ViolentRipper-stat s-html">HTML: <span id="stat-html">0</span></div>
          <div class="ViolentRipper-stat s-img"> Bilder: <span id="stat-img">0</span></div>
          <div class="ViolentRipper-stat" style="margin-left:auto;">Gesamt: <span id="stat-total">0</span></div>
        </div>
        <div id="ViolentRipper-log"></div>
        <div id="ViolentRipper-footer">
          <button class="ViolentRipper-action" id="ViolentRipper-scan">🔍 Scannen</button>
          <button class="ViolentRipper-action" id="ViolentRipper-watch">👁 Watch</button>
          <button class="ViolentRipper-action" id="ViolentRipper-download" disabled>📦 ZIP laden</button>
          <button class="ViolentRipper-action" id="ViolentRipper-clear">🗑 Clear</button>
        </div>
      `
            document.body.appendChild(panel)

            this.elements = {
                btn, autoWatchBtn, panel,
                logEl: panel.querySelector('#ViolentRipper-log'),
                closeBtn: panel.querySelector('#ViolentRipper-close'),
                scanBtn: panel.querySelector('#ViolentRipper-scan'),
                watchBtn: panel.querySelector('#ViolentRipper-watch'),
                dlBtn: panel.querySelector('#ViolentRipper-download'),
                clearBtn: panel.querySelector('#ViolentRipper-clear'),
                statEls: {
                    js: panel.querySelector('#stat-js'),
                    css: panel.querySelector('#stat-css'),
                    html: panel.querySelector('#stat-html'),
                    img: panel.querySelector('#stat-img'),
                    total: panel.querySelector('#stat-total'),
                },
            }
            this._loadPositions()
            return this.elements
        },

        setupDrag() {
            const { btn, panel } = this.elements
            let isDraggingBtn = false, isDraggingPanel = false
            let dragTarget = null, dragOffsetX = 0, dragOffsetY = 0

            btn.addEventListener('mousedown', e => {
                if (panel.contains(e.target)) return
                isDraggingBtn = true; dragTarget = btn
                btn.classList.add('dragging')
                dragOffsetX = e.clientX - btn.offsetLeft
                dragOffsetY = e.clientY - btn.offsetTop
                e.preventDefault()
            })

            const header = panel.querySelector('#ViolentRipper-header')
            if (header) {
                header.style.cursor = 'move'
                header.addEventListener('mousedown', e => {
                    if (e.target.id === 'ViolentRipper-close') return
                    isDraggingPanel = true; dragTarget = panel
                    panel.classList.add('dragging')
                    dragOffsetX = e.clientX - panel.offsetLeft
                    dragOffsetY = e.clientY - panel.offsetTop
                    e.preventDefault()
                })
            }

            document.addEventListener('mousemove', e => {
                if (!isDraggingBtn && !isDraggingPanel) return
                const newX = e.clientX - dragOffsetX, newY = e.clientY - dragOffsetY
                if (dragTarget === btn) {
                    btn.style.right = 'auto'; btn.style.bottom = 'auto'
                    btn.style.left = newX + 'px'; btn.style.top = newY + 'px'
                    this._updatePanelPosition()
                } else {
                    panel.style.right = 'auto'; panel.style.bottom = 'auto'
                    panel.style.left = newX + 'px'; panel.style.top = newY + 'px'
                }
            })

            document.addEventListener('mouseup', () => {
                if (isDraggingBtn || isDraggingPanel) this._savePositions()
                if (isDraggingBtn) { isDraggingBtn = false; btn.classList.remove('dragging'); this._updatePanelPosition() }
                if (isDraggingPanel) { isDraggingPanel = false; panel.classList.remove('dragging') }
                dragTarget = null
            })
        },

        _updatePanelPosition() {
            const { btn, panel } = this.elements
            const rect = btn.getBoundingClientRect()
            panel.style.right = 'auto'; panel.style.bottom = 'auto'
            panel.style.left = rect.left + 'px'
            panel.style.top = Math.max(10, rect.top - 540) + 'px'
        },

        _savePositions() {
            const { btn, panel } = this.elements
            const b = btn.getBoundingClientRect(), p = panel.getBoundingClientRect()
            localStorage.setItem('ViolentRipper-position', JSON.stringify({
                btn: { x: window.innerWidth - b.right, y: window.innerHeight - b.bottom },
                panel: { x: window.innerWidth - p.right, y: window.innerHeight - p.top },
            }))
        },

        _loadPositions() {
            try {
                const pos = JSON.parse(localStorage.getItem('ViolentRipper-position') || '{}')
                if (pos.panel) {
                    const { panel } = this.elements
                    panel.style.right = 'auto'; panel.style.bottom = 'auto'
                    panel.style.left = pos.panel.x + 'px'; panel.style.top = pos.panel.y + 'px'
                }
            } catch { }
        },

        addLog(msg, cls = '') {
            const line = document.createElement('div')
            if (cls) line.className = cls
            line.textContent = msg
            const { logEl } = this.elements
            logEl.appendChild(line)
            logEl.scrollTop = logEl.scrollHeight
        },

        updateStats() {
            const counts = { js: 0, css: 0, html: 0, img: 0, total: 0 }
            for (const file of Object.values(ViolentRipper.state.collectedFiles)) {
                counts[file.type]++; counts.total++
            }
            const { statEls } = this.elements
            for (const t of ['js', 'css', 'html', 'img']) statEls[t].textContent = counts[t]
            statEls.total.textContent = counts.total
        },
    }
})()
