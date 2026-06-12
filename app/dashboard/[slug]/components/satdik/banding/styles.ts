export const SATDIK_BANDING_STYLES = `
  .sbc-root { font-family: 'Geist', 'DM Sans', 'Helvetica Neue', sans-serif; color: #2a2a28; }

  .sbc-hd { margin-bottom: 18px; }
  .sbc-hd h2 { margin: 0 0 3px; font-size: 17px; font-weight: 600; letter-spacing: -0.2px; color: #1e1e1c; }
  .sbc-hd p  { margin: 0; font-size: 12.5px; color: #9a9990; }

  .sbc-ctrls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; align-items: flex-start; }

  .sbc-tabs { display: flex; border: 1px solid #dddcd4; border-radius: 7px; overflow: hidden; }
  .sbc-tab {
    font-size: 12px; padding: 5px 13px; border: none;
    background: #fafaf8; color: #9a9990; cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .sbc-tab.on { background: #2a2a28; color: #f0eeea; }

  .sbc-dl-all {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; padding: 5px 11px;
    border: 1px solid #dddcd4; border-radius: 7px;
    background: #fafaf8; color: #3a3a38;
    cursor: pointer; margin-left: auto;
    transition: background 0.12s, border-color 0.12s;
  }
  .sbc-dl-all:hover { background: #f0f0ea; border-color: #b0afa8; }
  .sbc-dl-all:active { transform: scale(0.98); }
  .sbc-dl-all:disabled { opacity: 0.5; cursor: default; }

  .sbc-chart-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sbc-chart-title { margin: 0; font-size: 12.5px; font-weight: 600; color: #5a5a58; letter-spacing: 0.1px; text-transform: uppercase; }
  .sbc-dl-btn {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; padding: 3px 8px;
    border: 1px solid #dddcd4; border-radius: 5px;
    background: #fff; color: #9a9990; cursor: pointer;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    flex-shrink: 0;
  }
  .sbc-dl-btn:hover { background: #f5f4f0; border-color: #b0afa8; color: #3a3a38; }
  .sbc-dl-btn:active { transform: scale(0.97); }

  .sbc-cb-wrap { position: relative; }
  .sbc-cb-trigger {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; padding: 5px 10px;
    border: 1px solid #dddcd4; border-radius: 7px;
    background: #fafaf8; color: #3a3a38;
    cursor: pointer; user-select: none; white-space: nowrap;
  }
  .sbc-cb-trigger:hover { border-color: #b0afa8; }
  .sbc-cb-trigger.open { border-color: #4e9e7a; background: #f0f8f4; }
  .sbc-cb-caret { font-size: 10px; color: #9a9990; transition: transform 0.15s; }
  .sbc-cb-trigger.open .sbc-cb-caret { transform: rotate(180deg); }
  .sbc-cb-dot { width: 6px; height: 6px; border-radius: 50%; background: #4e9e7a; flex-shrink: 0; }
  .sbc-cb-panel {
    position: absolute; top: calc(100% + 6px); left: 0; z-index: 99;
    background: #ffffff; border: 1px solid #dddcd4; border-radius: 10px;
    padding: 6px; min-width: 180px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .sbc-cb-group { display: flex; flex-direction: column; gap: 1px; }
  .sbc-cb-divider { height: 1px; background: #e8e7e0; margin: 4px 2px; }
  .sbc-cb-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 8px; border-radius: 6px;
    cursor: pointer; user-select: none; transition: background 0.1s;
  }
  .sbc-cb-item:hover { background: #f5f4f0; }
  .sbc-cb-item.checked .sbc-cb-box, .sbc-cb-item.partial .sbc-cb-box { background: #2a2a28; border-color: #2a2a28; }
  .sbc-cb-box {
    width: 14px; height: 14px; border-radius: 3px;
    border: 1.5px solid #c0bfb8; background: #fff;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.1s, border-color 0.1s;
  }
  .sbc-cb-check, .sbc-cb-dash { font-size: 9px; color: #fff; font-weight: 700; line-height: 1; }
  .sbc-cb-label { font-size: 12px; color: #3a3a38; }
  .sbc-cb-all .sbc-cb-label { font-weight: 600; }

  .sbc-charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 14px; }
  .sbc-chart-block { background: #fafaf8; border: 1px solid #e8e7e0; border-radius: 12px; padding: 16px 16px 12px; }

  .sbc-inline-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e8e7e0; }
  .sbc-leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #9a9990; }
  .sbc-leg-swatch { width: 20px; height: 8px; border-radius: 2px; flex-shrink: 0; }

  .sbc-stats-wrap { background: #fafaf8; border: 1px solid #e8e7e0; border-radius: 12px; padding: 14px 16px; }
  .sbc-stats-title { font-size: 12.5px; font-weight: 600; color: #5a5a58; letter-spacing: 0.1px; text-transform: uppercase; margin: 0 0 12px; }
  .sbc-stats-col-hd { font-size: 11px; font-weight: 600; color: #b0afa8; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #e8e7e0; }
  .sbc-stat-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0efea; gap: 8px; }
  .sbc-stat-row:last-child { border-bottom: none; }
  .sbc-stat-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #5a5a58; min-width: 110px; }
  .sbc-swatch { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .sbc-stat-nums { display: flex; align-items: center; gap: 5px; font-size: 12px; }
  .sbc-num { font-variant-numeric: tabular-nums; font-weight: 500; color: #2a2a28; min-width: 28px; text-align: right; }
  .sbc-arrow { color: #c0bfb8; font-size: 11px; }
  .sbc-delta { font-size: 10.5px; font-weight: 600; padding: 1px 5px; border-radius: 5px; white-space: nowrap; }
  .sbc-delta.up      { background: #e6f2eb; color: #3a7a52; }
  .sbc-delta.down    { background: #f7e8e8; color: #a04040; }
  .sbc-delta.neutral { background: #f0efea; color: #808078; }
  .sbc-divider { width: 1px; background: #e8e7e0; margin: 0 16px; }

  @media (max-width: 560px) {
    .sbc-divider { display: none; }
    .sbc-dl-all span { display: none; }
  }
`;
