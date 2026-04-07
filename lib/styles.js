; (function () {
  'use strict'
  globalThis.ViolentRipper = globalThis.ViolentRipper || {}

  ViolentRipper.getStyles = function () {
    return `
      #ViolentRipper-btn {
        position: fixed; bottom: 24px; right: 24px; left: auto; top: auto;
        z-index: 2147483647; background: #1a1a2e; color: #e0e0ff;
        border: 1px solid #4a4aff; border-radius: 10px; padding: 10px 18px;
        font: 600 13px/1 monospace; cursor: pointer;
        box-shadow: 0 4px 16px rgba(74,74,255,.35); user-select: none;
        transition: left .2s, bottom .2s;
      }
      #ViolentRipper-btn:hover  { background: #2a2a4e; }
      #ViolentRipper-btn:active { transform: scale(.96); }
      #ViolentRipper-btn.dragging { opacity: 0.7; cursor: grabbing; }
      #ViolentRipper-autowatch {
        position: fixed; left: 0; top: 0;
        z-index: 2147483647; background: #1a1a2e; color: #e0e0ff;
        border: 1px solid #4a4aff; border-radius: 8px; padding: 10px 5px;
        font: 600 11px monospace; cursor: pointer; user-select: none;
        display: flex; align-items: center; gap: 5px;
        box-shadow: 0 4px 16px rgba(74,74,255,.35);
      }
      #ViolentRipper-autowatch:hover           { background: #2a2a4e; }
      #ViolentRipper-autowatch.enabled         { background: #1a3a1a; border-color: #4aaa4a; color: #66dd66; }
      #ViolentRipper-panel {
        position: fixed; bottom: 72px; right: 24px; z-index: 2147483647;
        background: #0f0f1a; color: #c8c8ff; border: 1px solid #4a4aff;
        border-radius: 12px; width: 420px; max-height: 520px;
        display: flex; flex-direction: column; font: 12px/1.5 monospace;
        box-shadow: 0 8px 32px rgba(0,0,0,.6); overflow: hidden;
      }
      #ViolentRipper-panel.hidden   { display: none; }
      #ViolentRipper-panel.dragging { opacity: 0.8; cursor: grabbing; }
      #ViolentRipper-header {
        padding: 10px 14px; background: #1a1a2e; border-bottom: 1px solid #2a2a4e;
        display: flex; align-items: center; justify-content: space-between;
        font-weight: 700; font-size: 13px; color: #a0a0ff;
      }
      #ViolentRipper-close { cursor: pointer; color: #666; font-size: 16px; line-height: 1; }
      #ViolentRipper-close:hover { color: #ff6666; }
      #ViolentRipper-filters {
        display: flex; gap: 6px; padding: 8px 14px;
        background: #12122a; border-bottom: 1px solid #2a2a4e; flex-wrap: wrap;
      }
      .ViolentRipper-chip {
        display: flex; align-items: center; gap: 5px; background: #1e1e3a;
        border: 1px solid #3a3a6a; border-radius: 20px; padding: 4px 10px;
        font: 600 11px monospace; cursor: pointer; user-select: none;
        color: #888; margin-bottom: 4px; transition: background .12s, border-color .12s;
      }
      .ViolentRipper-chip.active-js   { background: #1a2e1a; border-color: #4aaa4a; color: #66dd66; }
      .ViolentRipper-chip.active-css  { background: #2a1a2e; border-color: #aa4aff; color: #cc88ff; }
      .ViolentRipper-chip.active-html { background: #2e2a1a; border-color: #ffaa4a; color: #ffcc66; }
      .ViolentRipper-chip.active-img  { background: #1a2e2e; border-color: #4a9aff; color: #66cfff; }
      .ViolentRipper-chip .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
      .active-js   .dot { background: #66dd66; }
      .active-css  .dot { background: #cc88ff; }
      .active-html .dot { background: #ffcc66; }
      .active-img  .dot { background: #66cfff; }
      #ViolentRipper-stats {
        display: flex; gap: 10px; padding: 6px 14px; background: #0f0f1a;
        border-bottom: 1px solid #1a1a2e; font-size: 11px; color: #555577; flex-wrap: wrap;
      }
      .ViolentRipper-stat span        { font-weight: 700; }
      .ViolentRipper-stat.s-js   span { color: #66dd66; }
      .ViolentRipper-stat.s-css  span { color: #cc88ff; }
      .ViolentRipper-stat.s-html span { color: #ffcc66; }
      .ViolentRipper-stat.s-img  span { color: #66cfff; }
      #ViolentRipper-log {
        flex: 1; overflow-y: auto; padding: 10px 14px;
        font-size: 11px; line-height: 1.6; color: #8888cc;
      }
      #ViolentRipper-log .ok-js   { color: #66dd88; }
      #ViolentRipper-log .ok-css  { color: #cc88ff; }
      #ViolentRipper-log .ok-html { color: #ffcc66; }
      #ViolentRipper-log .ok-img  { color: #66cfff; }
      #ViolentRipper-log .err     { color: #ff7777; }
      #ViolentRipper-log .info    { color: #88aaff; }
      #ViolentRipper-footer {
        padding: 10px 14px; background: #1a1a2e;
        border-top: 1px solid #2a2a4e; display: flex; gap: 8px;
      }
      .ViolentRipper-action {
        flex: 1; background: #2a2a5e; color: #a0a0ff;
        border: 1px solid #4a4aff; border-radius: 6px;
        padding: 7px 0; font: 600 11px monospace;
        cursor: pointer; text-align: center; transition: background .15s;
      }
      .ViolentRipper-action:hover    { background: #3a3a7e; }
      .ViolentRipper-action:disabled { opacity: .4; cursor: default; }
      .ViolentRipper-action.watch-active {
        background: #3e1a1a; border-color: #ff4a4a; color: #ff8888;
        animation: ViolentRipper-pulse 1.2s infinite;
      }
      @keyframes ViolentRipper-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255,74,74,.4); }
        50%       { box-shadow: 0 0 8px 4px rgba(255,74,74,.2); }
      }
    `;
  }
})()