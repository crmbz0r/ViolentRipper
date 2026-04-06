; (function () {
    'use strict'
    globalThis.ViolentRipper = globalThis.ViolentRipper || {}

    ViolentRipper.getStyles = function () {
        const { buttonX, buttonY } = ViolentRipper.state
        return `
      #violentripper-btn {
        position: fixed; bottom: ${buttonY}px; right: ${buttonX}px; left: auto; top: auto;
        z-index: 2147483647; background: #1a1a2e; color: #e0e0ff;
        border: 1px solid #4a4aff; border-radius: 10px; padding: 10px 18px;
        font: 600 13px/1 monospace; cursor: pointer;
        box-shadow: 0 4px 16px rgba(74,74,255,.35); user-select: none;
        transition: left .2s, bottom .2s;
      }
      #violentripper-btn:hover  { background: #2a2a4e; }
      #violentripper-btn:active { transform: scale(.96); }
      #violentripper-btn.dragging { opacity: 0.7; cursor: grabbing; }
      #violentripper-autowatch {
        position: fixed; bottom: ${buttonY}px; right: ${buttonX + 100}px;
        z-index: 2147483647; background: #1a1a2e; color: #e0e0ff;
        border: 1px solid #4a4aff; border-radius: 8px; padding: 10px 5px;
        font: 600 11px monospace; cursor: pointer; user-select: none;
        display: flex; align-items: center; gap: 5px;
        box-shadow: 0 4px 16px rgba(74,74,255,.35);
      }
      #violentripper-autowatch:hover           { background: #2a2a4e; }
      #violentripper-autowatch.enabled         { background: #1a3a1a; border-color: #4aaa4a; color: #66dd66; }
      #violentripper-autowatch.enabled::before { content: '✓ '; }
      #violentripper-panel {
        position: fixed; bottom: 72px; right: 24px; z-index: 2147483647;
        background: #0f0f1a; color: #c8c8ff; border: 1px solid #4a4aff;
        border-radius: 12px; width: 420px; max-height: 520px;
        display: flex; flex-direction: column; font: 12px/1.5 monospace;
        box-shadow: 0 8px 32px rgba(0,0,0,.6); overflow: hidden;
      }
      #violentripper-panel.hidden   { display: none; }
      #violentripper-panel.dragging { opacity: 0.8; cursor: grabbing; }
      #violentripper-header {
        padding: 10px 14px; background: #1a1a2e; border-bottom: 1px solid #2a2a4e;
        display: flex; align-items: center; justify-content: space-between;
        font-weight: 700; font-size: 13px; color: #a0a0ff;
      }
      #violentripper-close { cursor: pointer; color: #666; font-size: 16px; line-height: 1; }
      #violentripper-close:hover { color: #ff6666; }
      #violentripper-filters {
        display: flex; gap: 6px; padding: 8px 14px;
        background: #12122a; border-bottom: 1px solid #2a2a4e; flex-wrap: wrap;
      }
      .violentripper-chip {
        display: flex; align-items: center; gap: 5px; background: #1e1e3a;
        border: 1px solid #3a3a6a; border-radius: 20px; padding: 4px 10px;
        font: 600 11px monospace; cursor: pointer; user-select: none;
        color: #888; margin-bottom: 4px; transition: background .12s, border-color .12s;
      }
      .violentripper-chip.active-js   { background: #1a2e1a; border-color: #4aaa4a; color: #66dd66; }
      .violentripper-chip.active-css  { background: #2a1a2e; border-color: #aa4aff; color: #cc88ff; }
      .violentripper-chip.active-html { background: #2e2a1a; border-color: #ffaa4a; color: #ffcc66; }
      .violentripper-chip.active-img  { background: #1a2e2e; border-color: #4a9aff; color: #66cfff; }
      .violentripper-chip .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
      .active-js   .dot { background: #66dd66; }
      .active-css  .dot { background: #cc88ff; }
      .active-html .dot { background: #ffcc66; }
      .active-img  .dot { background: #66cfff; }
      #violentripper-stats {
        display: flex; gap: 10px; padding: 6px 14px; background: #0f0f1a;
        border-bottom: 1px solid #1a1a2e; font-size: 11px; color: #555577; flex-wrap: wrap;
      }
      .violentripper-stat span        { font-weight: 700; }
      .violentripper-stat.s-js   span { color: #66dd66; }
      .violentripper-stat.s-css  span { color: #cc88ff; }
      .violentripper-stat.s-html span { color: #ffcc66; }
      .violentripper-stat.s-img  span { color: #66cfff; }
      #violentripper-log {
        flex: 1; overflow-y: auto; padding: 10px 14px;
        font-size: 11px; line-height: 1.6; color: #8888cc;
      }
      #violentripper-log .ok-js   { color: #66dd88; }
      #violentripper-log .ok-css  { color: #cc88ff; }
      #violentripper-log .ok-html { color: #ffcc66; }
      #violentripper-log .ok-img  { color: #66cfff; }
      #violentripper-log .err     { color: #ff7777; }
      #violentripper-log .info    { color: #88aaff; }
      #violentripper-footer {
        padding: 10px 14px; background: #1a1a2e;
        border-top: 1px solid #2a2a4e; display: flex; gap: 8px;
      }
      .violentripper-action {
        flex: 1; background: #2a2a5e; color: #a0a0ff;
        border: 1px solid #4a4aff; border-radius: 6px;
        padding: 7px 0; font: 600 11px monospace;
        cursor: pointer; text-align: center; transition: background .15s;
      }
      .violentripper-action:hover    { background: #3a3a7e; }
      .violentripper-action:disabled { opacity: .4; cursor: default; }
      .violentripper-action.watch-active {
        background: #3e1a1a; border-color: #ff4a4a; color: #ff8888;
        animation: violentripper-pulse 1.2s infinite;
      }
      @keyframes violentripper-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(255,74,74,.4); }
        50%       { box-shadow: 0 0 8px 4px rgba(255,74,74,.2); }
      }
    `
    }
})()