// ==UserScript==
// @name        ViolentRipper - ui script
// @namespace   https://github.com/crmbz0r/ViolentRipper
// @version     1.4
// @author      crmbz0r
// @description The script for creating the buttons, menu, ui stuff etc
// ==/UserScript==

if (typeof globalThis === 'undefined') {
    var globalThis = window;
}

(function () {
    'use strict';
    globalThis.ViolentRipper = globalThis.ViolentRipper || {};

    ViolentRipper.ui = {
        elements: {},

        buildPanel() {
            const s = ViolentRipper.state;

            const btn = document.createElement("button");
            btn.id = "ViolentRipper-btn";
            btn.textContent = "⇣V↬Ripper";
            document.body.appendChild(btn);

            const autoWatchBtn = document.createElement("div");
            autoWatchBtn.id = "ViolentRipper-autowatch";
            autoWatchBtn.textContent = "Λʋτо";
            autoWatchBtn.title = "Auto-start watch mode on page load";
            autoWatchBtn.classList.toggle("enabled", s.autoWatchEnabled);
            document.body.appendChild(autoWatchBtn);

            const panel = document.createElement("div");
            panel.id = "ViolentRipper-panel";
            panel.className = "hidden";
            panel.innerHTML = `
        <div id="ViolentRipper-header">
          Violent Ripper <span style="font-size:10px;color:#555;font-weight:400;margin-left:6px;">v4.3.0</span>
          <span id="ViolentRipper-close">✕</span>
        </div>
        <div id="ViolentRipper-filters">
          <div class="ViolentRipper-chip active-js"   data-type="js">  <span class="dot"></span> .js</div>
          <div class="ViolentRipper-chip active-css"  data-type="css"> <span class="dot"></span> .css</div>
          <div class="ViolentRipper-chip active-html" data-type="html"><span class="dot"></span> .html</div>
          <div class="ViolentRipper-chip active-img"  data-type="img"> <span class="dot"></span> Images</div>
          <div class="ViolentRipper-chip ViolentRipper-enhanced-toggle" data-type="enhanced">⚡ Enhanced</div>
          <div class="ViolentRipper-enhanced-chips" style="display:none;">
            <div class="ViolentRipper-chip active-archive" data-type="archive"> <span class="dot"></span> Archives</div>
            <div class="ViolentRipper-chip active-audio"  data-type="audio"> <span class="dot"></span> Audio</div>
            <div class="ViolentRipper-chip active-video"  data-type="video"> <span class="dot"></span> Video</div>
          </div>
        </div>
        <div id="ViolentRipper-stats">
          <div class="ViolentRipper-stat s-js">  JS: <span id="stat-js">0</span></div>
          <div class="ViolentRipper-stat s-css"> CSS: <span id="stat-css">0</span></div>
          <div class="ViolentRipper-stat s-html">HTML: <span id="stat-html">0</span></div>
          <div class="ViolentRipper-stat s-img"> Bilder: <span id="stat-img">0</span></div>
          <div class="ViolentRipper-stat s-archive" style="display:none;">Arch: <span id="stat-archive">0</span></div>
          <div class="ViolentRipper-stat s-audio" style="display:none;">Audio: <span id="stat-audio">0</span></div>
          <div class="ViolentRipper-stat s-video" style="display:none;">Video: <span id="stat-video">0</span></div>
          <div class="ViolentRipper-stat" style="margin-left:auto;">Total: <span id="stat-total">0</span></div>
        </div>
        <div id="ViolentRipper-log"></div>
        <div id="ViolentRipper-footer">
          <button class="ViolentRipper-action" id="ViolentRipper-scan">🔍 Scan</button>
          <button class="ViolentRipper-action" id="ViolentRipper-watch">👁 Watch</button>
          <button class="ViolentRipper-action" id="ViolentRipper-download" disabled>📦 Save ZIP</button>
          <button class="ViolentRipper-action" id="ViolentRipper-clear">🗑 Clear</button>
        </div>
      `;
            document.body.appendChild(panel);

            this.elements = {
                btn,
                autoWatchBtn,
                panel,
                logEl: panel.querySelector("#ViolentRipper-log"),
                closeBtn: panel.querySelector("#ViolentRipper-close"),
                scanBtn: panel.querySelector("#ViolentRipper-scan"),
                watchBtn: panel.querySelector("#ViolentRipper-watch"),
                dlBtn: panel.querySelector("#ViolentRipper-download"),
                clearBtn: panel.querySelector("#ViolentRipper-clear"),
                statEls: {
                    js: panel.querySelector("#stat-js"),
                    css: panel.querySelector("#stat-css"),
                    html: panel.querySelector("#stat-html"),
                    img: panel.querySelector("#stat-img"),
                    archive: panel.querySelector("#stat-archive"),
                    audio: panel.querySelector("#stat-audio"),
                    video: panel.querySelector("#stat-video"),
                    total: panel.querySelector("#stat-total"),
                },
                enhancedToggle: panel.querySelector(".ViolentRipper-enhanced-toggle"),
                enhancedChipsContainer: panel.querySelector(".ViolentRipper-enhanced-chips"),
                enhancedStatEls: {
                    archive: panel.querySelector(".ViolentRipper-stat.s-archive"),
                    audio: panel.querySelector(".ViolentRipper-stat.s-audio"),
                    video: panel.querySelector(".ViolentRipper-stat.s-video"),
                },
            };
            this._loadPositions();
            return this.elements;
        },

        setupDrag() {
            const { btn, panel } = this.elements;
            let isDraggingBtn = false,
                isDraggingPanel = false;
            let dragTarget = null,
                dragOffsetX = 0,
                dragOffsetY = 0;
            let btnPending = false,
                panelPending = false;
            let mouseDownX = 0,
                mouseDownY = 0;
            const DRAG_THRESHOLD = 5; // pixels

            btn.addEventListener("mousedown", (e) => {
                if (panel.contains(e.target)) return;
                const rect = btn.getBoundingClientRect();
                // Anchor to left/top coords if still using CSS right/bottom (fresh page)
                if (!btn.style.left || btn.style.left === 'auto') {
                    btn.style.right = 'auto';
                    btn.style.bottom = 'auto';
                    btn.style.left = rect.left + 'px';
                    btn.style.top = rect.top + 'px';
                }
                btnPending = true;
                dragOffsetX = e.clientX - rect.left;
                dragOffsetY = e.clientY - rect.top;
                mouseDownX = e.clientX;
                mouseDownY = e.clientY;
                e.preventDefault();
            });

            const header = panel.querySelector("#ViolentRipper-header");
            if (header) {
                header.style.cursor = "move";
                header.addEventListener("mousedown", (e) => {
                    if (e.target.id === "ViolentRipper-close") return;
                    panelPending = true;
                    dragOffsetX = e.clientX - panel.offsetLeft;
                    dragOffsetY = e.clientY - panel.offsetTop;
                    mouseDownX = e.clientX;
                    mouseDownY = e.clientY;
                    e.preventDefault();
                });
            }

            document.addEventListener("mousemove", (e) => {
                // Only begin dragging once movement exceeds threshold
                if (btnPending && !isDraggingBtn) {
                    if (
                        Math.abs(e.clientX - mouseDownX) > DRAG_THRESHOLD ||
                        Math.abs(e.clientY - mouseDownY) > DRAG_THRESHOLD
                    ) {
                        isDraggingBtn = true;
                        dragTarget = btn;
                        btn.classList.add("dragging");
                    }
                }
                if (panelPending && !isDraggingPanel) {
                    if (
                        Math.abs(e.clientX - mouseDownX) > DRAG_THRESHOLD ||
                        Math.abs(e.clientY - mouseDownY) > DRAG_THRESHOLD
                    ) {
                        isDraggingPanel = true;
                        dragTarget = panel;
                        panel.classList.add("dragging");
                    }
                }
                if (!isDraggingBtn && !isDraggingPanel) return;
                const newX = e.clientX - dragOffsetX,
                    newY = e.clientY - dragOffsetY;
                if (dragTarget === btn) {
                    btn.style.right = "auto";
                    btn.style.bottom = "auto";
                    btn.style.left = newX + "px";
                    btn.style.top = newY + "px";
                    this._updateAutoWatchPosition();
                    this._updatePanelPosition();
                } else {
                    panel.style.right = "auto";
                    panel.style.bottom = "auto";
                    panel.style.left = newX + "px";
                    panel.style.top = newY + "px";
                }
            });

            document.addEventListener("mouseup", () => {
                if (btnPending) {
                    if (!isDraggingBtn) {
                        // Clean click with no movement — toggle menu
                        panel.classList.toggle("hidden");
                    } else {
                        // Was a real drag — clean up
                        isDraggingBtn = false;
                        btn.classList.remove("dragging");
                        this._updatePanelPosition();
                        this._updateAutoWatchPosition();
                        this._savePositions();
                    }
                    btnPending = false;
                    dragTarget = null;
                }
                if (panelPending) {
                    if (isDraggingPanel) {
                        isDraggingPanel = false;
                        panel.classList.remove("dragging");
                        this._savePositions();
                    }
                    panelPending = false;
                    dragTarget = null;
                }
            });
        },

        _updateAutoWatchPosition() {
            const { btn, autoWatchBtn } = this.elements;
            const rect = btn.getBoundingClientRect();
            autoWatchBtn.style.right = 'auto';
            autoWatchBtn.style.bottom = 'auto';
            autoWatchBtn.style.left = (rect.left - autoWatchBtn.offsetWidth - 10) + 'px'
            autoWatchBtn.style.top = rect.top + 'px';
        },

        _updatePanelPosition() {
            const { btn, panel } = this.elements;
            const rect = btn.getBoundingClientRect();
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = rect.left + 'px';
            panel.style.top = Math.max(10, rect.top - 540) + 'px';
        },

        _savePositions() {
            const { btn, panel } = this.elements;
            const b = btn.getBoundingClientRect(),
                p = panel.getBoundingClientRect();
            localStorage.setItem(
                ViolentRipper.state.positionKey,
                JSON.stringify({
                    btn: {
                        x: window.innerWidth - b.right,
                        y: window.innerHeight - b.bottom,
                    },
                    panel: {
                        x: window.innerWidth - p.right,
                        y: window.innerHeight - p.top,
                    },
                }),
            );
        },

        _loadPositions() {
            try {
                const pos = JSON.parse(
                    localStorage.getItem(ViolentRipper.state.positionKey) || "{}",
                );
                if (pos.btn) {
                    const { btn } = this.elements;
                    btn.style.right = 'auto';
                    btn.style.bottom = 'auto';
                    btn.style.left = (window.innerWidth - pos.btn.x - btn.offsetWidth) + 'px';
                    btn.style.top = (window.innerHeight - pos.btn.y - btn.offsetHeight) + 'px';
                    this._updateAutoWatchPosition();
                    this._updatePanelPosition();
                } else {
                    // New site: convert CSS right/bottom to left/top after layout is ready
                    requestAnimationFrame(() => {
                        const { btn } = this.elements;
                        const rect = btn.getBoundingClientRect();
                        btn.style.right = 'auto';
                        btn.style.bottom = 'auto';
                        btn.style.left = rect.left + 'px';
                        btn.style.top = rect.top + 'px';
                        this._updateAutoWatchPosition();
                    });
                }
            } catch { }
        },

        addLog(msg, cls = "") {
            const line = document.createElement("div");
            if (cls) line.className = cls;
            line.textContent = msg;
            const { logEl } = this.elements;
            logEl.appendChild(line);
            logEl.scrollTop = logEl.scrollHeight;
        },

        updateStats() {
            const counts = { js: 0, css: 0, html: 0, img: 0, archive: 0, audio: 0, video: 0, total: 0 };
            for (const file of Object.values(ViolentRipper.state.collectedFiles)) {
                counts[file.type]++;
                counts.total++;
            }
            const { statEls, enhancedStatEls } = this.elements;
            const enhancedMode = ViolentRipper.state.enhancedMode;
            for (const t of ["js", "css", "html", "img"])
                statEls[t].textContent = counts[t];
            for (const t of ["archive", "audio", "video"]) {
                if (statEls[t]) statEls[t].textContent = counts[t];
                if (enhancedStatEls[t]) {
                    enhancedStatEls[t].style.display = enhancedMode ? '' : 'none';
                }
            }
            statEls.total.textContent = counts.total;
        },

        toggleEnhancedMode(show) {
            const { enhancedToggle, enhancedChipsContainer, enhancedStatEls } = this.elements;
            if (show) {
                enhancedToggle.classList.add('enhanced-active');
                enhancedChipsContainer.style.display = '';
                for (const t of ["archive", "audio", "video"]) {
                    if (enhancedStatEls[t]) enhancedStatEls[t].style.display = '';
                }
            } else {
                enhancedToggle.classList.remove('enhanced-active');
                enhancedChipsContainer.style.display = 'none';
                for (const t of ["archive", "audio", "video"]) {
                    if (enhancedStatEls[t]) enhancedStatEls[t].style.display = 'none';
                }
            }
            this.updateStats();
        },
    };
})();
