window.__ModuleLoader__.load({
  id: '@local/dsh-visual-sandbox',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Tab type identity. */
    const ID = '@local/dsh-visual-sandbox';
    /** Page kind. */
    const KIND = 'visual-sandbox';
    /** Locale namespace. */
    const NS = 'visual-sandbox';
    /** Host routes. */
    const ROUTE_STATE = '/api/plugin/visual-sandbox/state';
    const ROUTE_RENDER = '/api/plugin/visual-sandbox/render';
    const ROUTE_DISCOVER = '/api/plugin/visual-sandbox/discover';
    /** Poll cadence of an open panel. */
    const POLL_MS = 1500;
    /** Poll cadence of the conversation header open request. */
    const OPEN_POLL_MS = 3000;
    /** Grace period before a workspace preview falls back to region mode. */
    const INSPECTOR_GRACE_MS = 3500;
    /** Annotation cap. */
    const MAX_ANNOTATIONS = 30;

    /** Right-Sidebar service captured at apply time; slot components read it from here. */
    let sidebarService = null;
    /** Client connection service captured for Host route calls. */
    let connectionService = null;
    /** Authenticated desktop-carrier RPC caller, when available. */
    let rpcCall = null;

    /** Four clean viewports. */
    const MODES = [
      { id: 'web', label: 'Responsive', short: 'Web', icon: 'web', size: 'full' },
      { id: 'mobile', label: 'Mobile', short: 'Mobile', icon: 'mobile', size: '390 x 844' },
      { id: 'tablet', label: 'Tablet', short: 'Tablet', icon: 'tablet', size: '768 x 1024' },
      { id: 'desktop', label: 'Desktop', short: 'Desktop', icon: 'desktop', size: '1024 x 720' },
    ];
    const MODE_IDS = MODES.map((mode) => mode.id);
    /** Legacy platform values map onto the four modes. */
    const MODE_ALIASES = {
      'mobile-web': 'mobile',
      'mobile-app': 'mobile',
      'macos-app': 'desktop',
      'windows-app': 'desktop',
    };
    /** Logical app viewports for the fixed frames. */
    const VIEWPORTS = {
      mobile: { width: 390, height: 844 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1024, height: 720 },
    };
    /** Frame chrome sizes (screen pixels, never scaled). */
    const CHROME = {
      mobile: { width: 16, height: 22 },
      tablet: { width: 24, height: 22 },
      desktop: { width: 0, height: 32 },
    };
    /** Preview scale choices; numeric values are multipliers. */
    const ZOOM_OPTIONS = [
      { value: 'fit', label: 'Fit' },
      { value: '0.5', label: '50%' },
      { value: '0.75', label: '75%' },
      { value: '1', label: '100%' },
      { value: '1.1', label: '110%' },
      { value: '1.2', label: '120%' },
      { value: '1.25', label: '125%' },
      { value: '1.5', label: '150%' },
      { value: '2', label: '200%' },
    ];
    const ZOOM_VALUES = ZOOM_OPTIONS.map((entry) => entry.value);

    /** English copy; the client file stays ASCII-clean. */
    const EN = {
      tabTitle: 'Visual Sandbox',
      openAction: 'Visual Sandbox',
      openTitle: 'Open the Visual Sandbox workbench',
      guideDescription: 'Preview and annotate the current UI',
      sourcePlaceholder: 'Workspace HTML path or http://localhost:3000',
      chooseFile: 'Show detected workspace preview files',
      reload: 'Reload preview',
      modeLabel: 'Preview mode',
      interact: 'Interact',
      inspect: 'Inspect',
      inspectTitle: 'Use the preview normally',
      edit: 'Edit UI',
      editTitle: 'Select UI blocks to change',
      interactTitle: 'Use the preview normally',
      deviceLabel: 'Device & Type',
      sourceLabel: 'Source (Workspace or URL)',
      selectTool: 'Selection tool',
      selectTitle: 'Selection tool',
      zoomTitle: 'Preview scale',
      selectElement: 'Element',
      selectRegion: 'Region',
      versionLatest: 'Latest',
      visualReady: 'Visual Sandbox Ready',
      visualReadyBody: 'Open a workspace HTML file or a local URL to preview your UI.',
      elementOnlyHint: 'Element selection needs a workspace HTML preview. Choose Region or load an HTML file.',
      elementMissingHint: 'Element inspection did not attach. Choose Region to drag a selection.',
      regionHint: 'Drag a rectangle to select a region.',
      sendAll: 'Send All',
      sendAllTitle: 'Send all queued annotations to the chat composer',
      sendOne: 'Send to Chat',
      queuePin: '+ Queue Pin',
      cancel: 'Cancel',
      remove: 'Remove annotation',
      notePlaceholder: 'What should change in this section?',
      queueTitle: 'Annotations',
      sent: 'Sent',
      emptyPrompt: 'Open a workspace HTML file or a localhost URL to preview your UI.',
      emptyNoFiles: 'No previewable HTML files were found in this workspace yet.',
      loading: 'Loading preview...',
      loadFailed: 'The preview could not be loaded.',
      noWorkspace: 'This session has no workspace folder.',
      expand: 'Expand',
      expandTitle: 'Expand Narrow Containers: remove narrow demo max-width wrappers',
      expandUnavailable: 'Available for workspace HTML previews only',
      platformLabel: 'Viewport',
      fit: 'Fit',
      zoom: 'Zoom',
      crossOriginHint: 'Cross-origin preview: drag a rectangle to select a region.',
      inspectorMissing: 'Element inspection did not attach; drag a rectangle instead.',
      appOrigin: 'This is the Harness app itself; use a workspace file instead.',
      badProtocol: 'Only http:// and https:// addresses are supported.',
      badAddress: 'That address is not valid.',
      inserted: 'Inserted into the chat composer.',
      insertFailed: 'The chat composer did not accept the target. Open the chat input and try again.',
      queued: 'Pin queued.',
      clearedByAgent: 'Annotations cleared.',
      refreshedByAgent: 'Preview refreshed.',
      agentSwitched: 'Viewport switched by the agent.',
      capReached: 'At most 30 annotations are supported.',
      frameTitle: 'UI preview',
      closeTitle: 'Hide the Visual Sandbox workbench',
      versionLabel: 'Version',
    };

    const CSS = `
.dvs-root{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:12px}
.dvs-toolbar{flex:none;display:flex;flex-direction:column;gap:6px;padding:7px 8px;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dvs-topRow{display:flex;align-items:center;gap:5px;min-width:0;flex-wrap:nowrap}
.dvs-modes{display:inline-flex;height:28px;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;overflow:hidden;flex:none}
.dvs-modes button{height:27px;padding:0 4px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:9px;display:inline-flex;align-items:center;gap:3px;cursor:pointer;white-space:nowrap}
.dvs-modes button+button{border-left:.5px solid var(--dsw-alias-border-l1)}
.dvs-modes button:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent)}
.dvs-modes button[data-active=true]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);color:var(--dsw-alias-brand-primary)}
.dvs-modes button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dvs-expand{height:28px;box-sizing:border-box;padding:0 6px;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:9px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;flex:none}
.dvs-expand[data-active=true]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent);color:var(--dsw-alias-brand-primary)}
.dvs-expand:disabled{opacity:.4;cursor:default}
.dvs-meta{margin-left:auto;flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font:500 9px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dvs-row{display:flex;align-items:center;gap:5px;min-width:0}
.dvs-sourceWrap{position:relative;flex:1 1 auto;min-width:0;display:flex}
.dvs-source{flex:1 1 auto;min-width:0;height:30px;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:0 28px 0 8px;font:inherit;font-size:11px;outline:none}
.dvs-source:focus{border-color:var(--dsw-alias-brand-primary)}
.dvs-sourceChevron{position:absolute;right:1px;top:1px;width:26px;height:28px;border:0;border-radius:0 5px 5px 0;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.dvs-sourceChevron:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.dvs-iconBtn{width:30px;height:30px;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none;padding:0}
.dvs-iconBtn:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.dvs-iconBtn:disabled{opacity:.4;cursor:default}
.dvs-iconBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dvs-editToggle{display:inline-flex;height:30px;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;overflow:hidden;flex:none}
.dvs-editToggle button{height:29px;padding:0 8px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap}
.dvs-editToggle button+button{border-left:.5px solid var(--dsw-alias-border-l1)}
.dvs-editToggle button[data-active=true]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);color:var(--dsw-alias-brand-primary);font-weight:600}
.dvs-editToggle button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dvs-sendAll{height:30px;box-sizing:border-box;padding:0 8px;border:.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);border-radius:6px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font:inherit;font-size:10px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;flex:none}
.dvs-sendAll:disabled{opacity:.4;cursor:default}
.dvs-sendAll:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dvs-btn[data-active=true]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}
.dvs-versions{display:flex;align-items:center;gap:6px;min-width:0}
.dvs-versionsLabel{flex:none;color:var(--dsw-alias-label-secondary);font-size:9px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.dvs-versionsSelect{flex:1 1 auto;min-width:0;height:26px;box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;padding:0 6px;outline:none}
.dvs-versionsSelect:focus{border-color:var(--dsw-alias-brand-primary)}
.dvs-notice{flex:none;padding:5px 10px;border-bottom:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);font-size:11px;line-height:1.5;overflow-wrap:anywhere}
.dvs-notice[data-kind=error]{color:var(--dsw-alias-state-error-primary)}
.dvs-hint{flex:none;padding:4px 10px;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:1.5;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dvs-stageBox{position:relative;flex:1 1 auto;min-height:0;overflow:hidden;background-color:#f1f5f9;background-image:radial-gradient(circle,rgba(15,23,42,.14) 1px,transparent 1.2px);background-size:16px 16px}
.dvs-root[data-dark=true] .dvs-stageBox{background-color:#0f1117;background-image:radial-gradient(circle,rgba(148,163,184,.18) 1px,transparent 1.2px)}
.dvs-studio{position:absolute;inset:16px 0 0;overflow:hidden}
.dvs-studio[data-manual=true]{overflow:auto}
.dvs-frameHost{min-height:100%;display:flex;align-items:flex-start;justify-content:center;padding:0 12px 16px;box-sizing:border-box}
.dvs-responsiveHost{position:absolute;inset:0;display:flex;min-width:0;min-height:0}
.dvs-emptyCard{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:280px;padding:14px 16px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.dvs-emptyCard strong{display:block;margin-bottom:4px;color:var(--dsw-alias-label-primary);font-weight:600}
.dvs-viewport{position:relative;flex:none;min-width:0;min-height:0}
.dvs-responsiveHost .dvs-viewport{flex:1 1 auto;width:100%;height:100%}
.dvs-scale{position:absolute;top:0;left:0;transform-origin:top left;overflow:hidden;background:var(--dsw-alias-bg-base)}
.dvs-content{position:relative;width:100%;height:100%;overflow:hidden;background:var(--dsw-alias-bg-base)}
.dvs-frame{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#fff}
.dvs-overlay{position:absolute;inset:0;z-index:3;pointer-events:none}
.dvs-hoverBox{position:absolute;box-sizing:border-box;border:2px solid #2563eb;background:rgba(37,99,235,.08);border-radius:2px;pointer-events:none}
.dvs-hoverTag{position:absolute;max-width:92%;padding:2px 6px;border-radius:4px;background:#2563eb;color:#fff;font:600 10.5px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.dvs-pin{position:absolute;box-sizing:border-box;border:2px solid #f59e0b;background:rgba(245,158,11,.09);border-radius:2px;pointer-events:none}
.dvs-pinBadge{position:absolute;left:-2px;top:-2px;transform:translateY(-100%);min-width:20px;height:20px;box-sizing:border-box;padding:0 5px;border-radius:4px;background:#f59e0b;color:#111827;font:700 11px/20px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.35)}
.dvs-regionLayer{position:absolute;inset:0;pointer-events:auto;cursor:crosshair;touch-action:none}
.dvs-regionRect{position:absolute;box-sizing:border-box;border:2px dashed #2563eb;background:rgba(37,99,235,.12);border-radius:2px;pointer-events:none}
.dvs-popover{position:absolute;z-index:9;width:272px;box-sizing:border-box;display:flex;flex-direction:column;gap:7px;padding:9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-overlay);box-shadow:0 12px 34px rgba(0,0,0,.32);pointer-events:auto}
.dvs-popHead{display:flex;align-items:center;gap:5px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:10.5px}
.dvs-popBadge{flex:none;min-width:18px;height:18px;padding:0 4px;border-radius:3px;background:#f59e0b;color:#111827;font:700 10px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-align:center}
.dvs-popLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--dsw-alias-label-primary)}
.dvs-popMode{margin-left:auto;flex:none;font:600 9px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--dsw-alias-brand-primary)}
.dvs-note{width:100%;box-sizing:border-box;min-height:58px;max-height:140px;resize:vertical;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.45;padding:6px 7px;outline:none}
.dvs-note:focus{border-color:var(--dsw-alias-brand-primary)}
.dvs-popActions{display:flex;align-items:center;gap:6px}
.dvs-btn{height:27px;box-sizing:border-box;padding:0 8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10.5px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap}
.dvs-btn:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
.dvs-btnPrimary{border-color:transparent;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font-weight:600}
.dvs-btnPrimary:hover{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);filter:brightness(1.06)}
.dvs-popCancel{width:24px;height:27px;padding:0;margin-left:auto;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:14px;cursor:pointer;border-radius:4px}
.dvs-popCancel:hover{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 10%,transparent)}
.dvs-phoneFrame{position:relative;flex:none;box-sizing:border-box;border-radius:34px;background:#0b0d12;padding:14px 8px 8px;box-shadow:0 22px 55px rgba(0,0,0,.4),inset 0 0 0 1px #2a2e38}
.dvs-speaker{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:44px;height:4px;border-radius:2px;background:#2a2e38}
.dvs-tabletFrame{position:relative;flex:none;box-sizing:border-box;border-radius:22px;background:#0b0d12;padding:10px 12px 12px;box-shadow:0 20px 50px rgba(0,0,0,.4),inset 0 0 0 1px #2a2e38}
.dvs-tabletCam{position:absolute;top:4px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#2a2e38}
.dvs-desktopFrame{position:relative;flex:none;box-sizing:border-box;border-radius:10px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 20px 50px rgba(0,0,0,.32)}
.dvs-desktopBar{height:32px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:0 10px;background:var(--dsw-alias-bg-layer-2);border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dvs-traffic{display:flex;gap:6px;flex:none}
.dvs-traffic i{width:10px;height:10px;border-radius:50%;display:block;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18)}
.dvs-traffic .r{background:#ff5f57}
.dvs-traffic .y{background:#febc2e}
.dvs-traffic .g{background:#28c840}
.dvs-desktopTitle{flex:1;min-width:0;text-align:center;color:var(--dsw-alias-label-primary);font-size:11px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dvs-desktopSpacer{width:42px;flex:none}
.dvs-queue{flex:none;display:flex;flex-direction:column;min-height:0;max-height:34%;border-top:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.dvs-queueHead{flex:none;display:flex;align-items:center;gap:6px;height:30px;padding:0 8px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;text-align:left}
.dvs-queueHead:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent)}
.dvs-queueTitle{font-size:10px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.dvs-count{min-width:16px;height:16px;padding:0 5px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);color:var(--dsw-alias-brand-primary);font:600 10px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-align:center}
.dvs-chevron{margin-left:auto;transition:transform .12s ease}
.dvs-chevron[data-open=true]{transform:rotate(90deg)}
.dvs-queueList{min-height:0;overflow:auto;display:flex;flex-direction:column;gap:4px;padding:0 6px 6px}
.dvs-ann{display:flex;align-items:flex-start;gap:6px;padding:5px 6px;border:.5px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1)}
.dvs-annBadge{flex:none;min-width:18px;height:18px;padding:0 4px;border-radius:3px;background:#f59e0b;color:#111827;font:700 10px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-align:center;box-sizing:border-box}
.dvs-annBody{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.dvs-annSel{display:flex;align-items:center;gap:4px;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10.5px;color:var(--dsw-alias-label-primary)}
.dvs-annSelText{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dvs-platformTag{flex:none;font:600 9px/15px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:0 4px;border-radius:3px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}
.dvs-sentTag{flex:none;font:600 9px/15px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:0 4px;border-radius:3px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent);color:var(--dsw-alias-state-success-primary)}
.dvs-annNote{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:1.4;overflow-wrap:anywhere}
.dvs-annDel{flex:none;width:20px;height:20px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dvs-annDel:hover{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}
.dvs-titleRow{display:inline-flex;align-items:center;gap:7px;min-width:0;overflow:hidden}
.dvs-titleIcon{flex:none;opacity:.9}
.dvs-titleText{font-weight:600;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dvs-titleChevron{display:flex;align-items:center;color:var(--dsw-alias-label-secondary);opacity:.65;margin-left:1px}

/* Studio header */
.dvs-toolbar{flex:none;display:flex;flex-direction:column;gap:10px;padding:10px 12px 8px;border-bottom:0}
.dvs-controls{display:grid;grid-template-columns:minmax(88px,1fr) minmax(78px,.85fr) minmax(118px,1.5fr);gap:10px;min-width:0}
.dvs-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.dvs-fieldLabel{display:flex;align-items:center;gap:4px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:10.5px;font-weight:500;line-height:1.2}
.dvs-fieldLabel svg{opacity:.85}
.dvs-fieldControl{position:relative;display:flex;align-items:center;gap:6px;height:40px;box-sizing:border-box;min-width:0;padding:0 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);transition:border-color .12s ease,box-shadow .12s ease}
.dvs-fieldControl:hover{border-color:var(--dsw-alias-border-l2)}
.dvs-fieldControl:focus-within{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 62%,var(--dsw-alias-border-l1));box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent)}
.dvs-fieldIcon{display:flex;align-items:center;justify-content:center;flex:none;color:var(--dsw-alias-label-secondary)}
.dvs-fieldSelect{flex:1 1 auto;min-width:0;height:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1;padding:0 17px 0 0;outline:none;cursor:pointer;text-overflow:ellipsis}
.dvs-fieldSelect:disabled{color:var(--dsw-alias-label-secondary);cursor:default;opacity:.9}
.dvs-fieldChevron{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);pointer-events:none}
.dvs-sourceControl{padding-right:53px}
.dvs-sourceInput{flex:1 1 auto;min-width:0;height:100%;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;outline:none;padding:0}
.dvs-sourceInput::placeholder{color:var(--dsw-alias-label-secondary)}
.dvs-fieldButtons{position:absolute;right:3px;top:3px;bottom:3px;display:flex;align-items:center;gap:1px}
.dvs-fieldBtn{width:24px;height:100%;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dvs-fieldBtn:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent)}
.dvs-fieldBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dvs-actions{display:flex;align-items:center;flex-wrap:wrap;gap:6px;row-gap:6px;min-width:0}
.dvs-actionBtn{height:34px;box-sizing:border-box;flex:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 9px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;font-weight:500;white-space:nowrap;cursor:pointer}
.dvs-actionBtn:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent)}
.dvs-actionBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dvs-actionIcon{width:34px;padding:0}
.dvs-selectAction{position:relative;flex:none;display:inline-flex;align-items:center;gap:5px;height:34px;min-width:72px;box-sizing:border-box;padding:0 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer}
.dvs-selectAction:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent)}
.dvs-selectAction select{appearance:none;flex:1 1 auto;min-width:0;height:100%;padding:0 13px 0 0;border:0;background:transparent;color:inherit;font:inherit;font-size:11px;font-weight:500;outline:none;cursor:pointer}
.dvs-actionChevron{position:absolute;right:5px;top:50%;transform:translateY(-50%);display:flex;align-items:center;pointer-events:none;opacity:.8}
.dvs-sendAll{margin-left:auto;height:34px;box-sizing:border-box;flex:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 11px;border:0;border-radius:8px;background:linear-gradient(135deg,var(--dvs-accent,#4d6bfe),var(--dvs-accent-strong,#3f58e8));color:#fff;font:600 11px/1 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;white-space:nowrap;cursor:pointer;box-shadow:0 3px 10px color-mix(in srgb,var(--dvs-accent,#4d6bfe) 26%,transparent)}
.dvs-sendAll:hover:not(:disabled){filter:brightness(1.06)}
.dvs-sendAll:disabled{opacity:.42;box-shadow:none;cursor:default}
.dvs-sendAll:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dvs-hint{flex:none;margin:0 12px 8px;padding:6px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:1.5}

/* Canvas */
.dvs-stageBox{position:relative;flex:1 1 auto;min-height:0;display:flex;padding:0 12px 12px;background:var(--dsw-alias-bg-base);overflow:hidden}
.dvs-canvasCard{position:relative;flex:1 1 auto;min-width:0;min-height:0;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden;background-color:#fff;background-image:radial-gradient(circle,rgba(100,116,139,.18) 1.1px,transparent 1.2px);background-size:16px 16px}
.dvs-root[data-dark=true] .dvs-canvasCard{border-color:var(--dsw-alias-border-l2);background-color:#0f1117;background-image:radial-gradient(circle,rgba(148,163,184,.18) 1.1px,transparent 1.2px)}
.dvs-studio{position:absolute;inset:0;overflow:hidden}
.dvs-studio[data-scroll=true]{overflow:auto}
.dvs-studio[data-manual=true]{overflow:auto}
.dvs-frameHost{min-height:100%;display:flex;align-items:flex-start;justify-content:center;padding:16px 12px;box-sizing:border-box}
.dvs-readyCard{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(300px,calc(100% - 32px));box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:6px;padding:24px 22px 22px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-base);text-align:center;box-shadow:0 14px 38px rgba(15,23,42,.10)}
.dvs-readyCard h3{margin:2px 0 0;color:var(--dsw-alias-label-primary);font-size:17px;font-weight:700;letter-spacing:-.01em}
.dvs-readyCard p{margin:0;max-width:250px;color:var(--dsw-alias-label-secondary);font-size:12.5px;line-height:1.55}
.dvs-readyArt{display:block;margin-bottom:2px}

/* DeepSeek blue accent and integrated select fields */
.dvs-root{--dvs-accent:#4d6bfe;--dvs-accent-strong:#3f58e8;--dvs-accent-soft:color-mix(in srgb,#4d6bfe 10%,var(--dsw-alias-bg-base));--dvs-accent-line:color-mix(in srgb,#4d6bfe 38%,var(--dsw-alias-border-l1));--dsw-alias-brand-primary:#4d6bfe}
.dvs-headerMark,.dvs-titleIcon{display:flex;align-items:center;justify-content:center;flex:none;color:var(--dvs-accent)}
.dvs-titleIcon{opacity:1}
.dvs-fieldValue{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.2;pointer-events:none}
.dvs-selectControl{cursor:pointer}
.dvs-selectControl .dvs-fieldIcon,.dvs-selectControl .dvs-fieldChevron,.dvs-selectControl .dvs-fieldValue{pointer-events:none}
.dvs-selectControl[data-disabled=true]{background:var(--dsw-alias-bg-layer-1);cursor:default}
.dvs-selectControl[data-disabled=true] .dvs-fieldValue{color:var(--dsw-alias-label-secondary)}
.dvs-selectControl[data-disabled=true] .dvs-fieldIcon,.dvs-selectControl[data-disabled=true] .dvs-fieldChevron{opacity:.55}
.dvs-fieldSelectOverlay{position:absolute;inset:0;z-index:2;width:100%;height:100%;opacity:0;appearance:none;border:0;background:transparent;cursor:pointer;font-size:12px}
.dvs-fieldSelectOverlay:disabled{cursor:default}
.dvs-selectAction{min-width:88px}
.dvs-zoomAction{min-width:104px}
.dvs-selectAction[data-disabled=true]{opacity:.55;background:var(--dsw-alias-bg-layer-1);cursor:default}
.dvs-selectValue{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:11px;font-weight:500;text-align:left;pointer-events:none}
.dvs-selectAction > svg,.dvs-selectAction .dvs-actionChevron{pointer-events:none}
.dvs-selectOverlay{position:absolute;inset:0;z-index:2;width:100%;height:100%;opacity:0;appearance:none;border:0;background:transparent;cursor:pointer;font-size:11px}
.dvs-actionBtn[data-active=true]{border-color:var(--dvs-accent-line);background:var(--dvs-accent-soft);color:var(--dvs-accent-strong);font-weight:600}
.dvs-root[data-dark=true] .dvs-actionBtn[data-active=true]{border-color:var(--dvs-accent);background:color-mix(in srgb,var(--dvs-accent) 20%,transparent);color:#c7d2ff}
.dvs-sendAll{background:linear-gradient(135deg,var(--dvs-accent),var(--dvs-accent-strong));box-shadow:0 3px 10px color-mix(in srgb,var(--dvs-accent) 26%,transparent)}
.dvs-hoverBox{border-color:var(--dvs-accent);background:color-mix(in srgb,var(--dvs-accent) 8%,transparent)}
.dvs-hoverTag{background:var(--dvs-accent)}
.dvs-regionRect{border-color:var(--dvs-accent);background:color-mix(in srgb,var(--dvs-accent) 12%,transparent)}
.dvs-artWindow{fill:color-mix(in srgb,var(--dvs-accent) 9%,var(--dsw-alias-bg-base));stroke:var(--dvs-accent)}
.dvs-artBar{stroke:color-mix(in srgb,var(--dvs-accent) 35%,transparent)}
.dvs-artDot{fill:color-mix(in srgb,var(--dvs-accent) 55%,transparent)}
.dvs-artCode{stroke:var(--dvs-accent)}
.dvs-artSpark{fill:color-mix(in srgb,var(--dvs-accent) 75%,transparent)}
.dvs-artSparkSoft{fill:color-mix(in srgb,var(--dvs-accent) 45%,transparent)}
`;

    /** Inspector injected into workspace previews. It reports, never draws. */
    function inspectorMain() {
      if (window.__dshVisualSandboxInspector) return;
      window.__dshVisualSandboxInspector = true;
      var FLAG = '__dshVisualSandbox';
      var edit = false;
      var pins = [];
      var hoverFrame = 0;
      var lastPoint = null;

      function selectorOf(element) {
        if (!(element instanceof Element) || element === document.documentElement || element === document.body) return '';
        if (element.id) {
          var idSelector = '#' + (window.CSS && CSS.escape ? CSS.escape(element.id) : element.id.replace(/([^a-zA-Z0-9_-])/g, '\\$1'));
          try {
            if (document.querySelectorAll(idSelector).length === 1) return idSelector;
          } catch (error) {}
        }
        var parts = [];
        var node = element;
        var depth = 0;
        while (node && node.nodeType === 1 && depth < 8) {
          var tag = node.tagName.toLowerCase();
          if (node.id) {
            parts.unshift('#' + (window.CSS && CSS.escape ? CSS.escape(node.id) : node.id.replace(/([^a-zA-Z0-9_-])/g, '\\$1')));
            break;
          }
          var segment = tag;
          var parent = node.parentElement;
          if (parent !== null) {
            var index = 1;
            var sibling = node;
            while ((sibling = sibling.previousElementSibling) !== null) {
              if (sibling.tagName === node.tagName) index += 1;
            }
            segment += ':nth-of-type(' + index + ')';
          }
          parts.unshift(segment);
          if (parent === null || parent === document.body || parent === document.documentElement) break;
          node = parent;
          depth += 1;
        }
        return parts.join(' > ');
      }

      function labelOf(element) {
        var tag = element.tagName.toLowerCase();
        var text = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28);
        var className = typeof element.className === 'string' ? element.className : element.getAttribute('class') || '';
        var classes = className.trim().split(/\s+/).filter(Boolean).slice(0, 2);
        var label = tag;
        if (text.length > 0) label += ' "' + text + '"';
        if (classes.length > 0) label += ' .' + classes.join('.');
        return label;
      }

      function boxOf(element) {
        var rect = element.getBoundingClientRect();
        return { x: Math.round(rect.left), y: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
      }

      function textOf(element) {
        return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      }

      function htmlOf(element) {
        var html = element.outerHTML || '';
        if (html.length <= 1400) return html;
        var cut = html.slice(0, 1400);
        var end = cut.lastIndexOf('>');
        if (end > 300) cut = cut.slice(0, end + 1);
        return cut + '\n... [truncated]';
      }

      function stylesOf(element) {
        var computed = window.getComputedStyle(element);
        var keys = ['display','position','width','height','padding','margin','color','background-color','border','border-radius','font-family','font-size','font-weight','line-height','flex-direction','justify-content','align-items','gap','grid-template-columns','box-shadow','opacity','z-index'];
        var styles = {};
        for (var index = 0; index < keys.length; index += 1) {
          var value = computed.getPropertyValue(keys[index]);
          if (value && value.length > 0) styles[keys[index]] = value.slice(0, 220);
        }
        return styles;
      }

      function post(message) {
        try {
          message[FLAG] = true;
          window.parent.postMessage(message, '*');
        } catch (error) {}
      }

      function reportPins() {
        if (!edit || pins.length === 0) return;
        var geometry = [];
        for (var index = 0; index < pins.length; index += 1) {
          var pin = pins[index];
          var element = null;
          try {
            element = pin.selector ? document.querySelector(pin.selector) : null;
          } catch (error) {
            element = null;
          }
          if (element !== null) geometry.push({ id: pin.id, box: boxOf(element) });
        }
        if (geometry.length > 0) post({ type: 'pinGeometry', pins: geometry });
      }

      function reportHover(clientX, clientY) {
        if (!edit) return;
        var element = document.elementFromPoint(clientX, clientY);
        if (!(element instanceof Element) || element === document.documentElement || element === document.body) {
          post({ type: 'hover', hover: null });
          return;
        }
        post({ type: 'hover', hover: { box: boxOf(element), label: labelOf(element), selector: selectorOf(element) } });
      }

      function onMove(event) {
        if (!edit) return;
        lastPoint = { x: event.clientX, y: event.clientY };
        if (hoverFrame !== 0) return;
        hoverFrame = window.requestAnimationFrame(function () {
          hoverFrame = 0;
          if (lastPoint !== null) reportHover(lastPoint.x, lastPoint.y);
        });
      }

      function onDown(event) {
        if (!edit) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function onClick(event) {
        if (!edit) return;
        var element = event.target;
        if (!(element instanceof Element) || element === document.documentElement || element === document.body) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        post({
          type: 'pick',
          target: {
            selector: selectorOf(element),
            label: labelOf(element),
            html: htmlOf(element),
            text: textOf(element),
            box: boxOf(element),
            styles: stylesOf(element),
          },
        });
      }

      function onSelectStart(event) {
        if (!edit) return;
        event.preventDefault();
      }

      var style = document.createElement('style');
      style.textContent =
        'html[data-dsh-visual-sandbox-edit="1"],html[data-dsh-visual-sandbox-edit="1"] *{user-select:none !important;-webkit-user-select:none !important;cursor:pointer !important}' +
        'html[data-dsh-visual-sandbox-edit="1"] ::selection{background:transparent !important;color:inherit !important}';
      (document.head || document.documentElement).appendChild(style);

      document.addEventListener('pointermove', onMove, true);
      document.addEventListener('pointerdown', onDown, true);
      document.addEventListener('mousedown', onDown, true);
      document.addEventListener('click', onClick, true);
      document.addEventListener('selectstart', onSelectStart, true);
      document.addEventListener('pointerleave', function () { post({ type: 'hover', hover: null }); }, true);
      document.addEventListener('dragstart', function (event) { if (edit) event.preventDefault(); }, true);
      window.addEventListener('scroll', function () { reportPins(); }, true);
      window.addEventListener('resize', function () { reportPins(); });

      window.addEventListener('message', function (event) {
        var data = event.data;
        if (data === null || typeof data !== 'object' || data[FLAG] !== true) return;
        if (data.type === 'mode') {
          edit = data.edit === true;
          document.documentElement.setAttribute('data-dsh-visual-sandbox-edit', edit ? '1' : '0');
          if (!edit) post({ type: 'hover', hover: null });
        } else if (data.type === 'pins') {
          pins = Array.isArray(data.pins) ? data.pins : [];
          reportPins();
        } else if (data.type === 'ping') {
          post({ type: 'ready' });
        }
      });

      window.setTimeout(function () {
        post({ type: 'ready' });
      }, 0);
    }

    /** Base route URL. */
    function endpointFor(path) {
      try {
        return new URL(path, document.baseURI).href;
      } catch (error) {
        return path;
      }
    }

    /** Short-lived abort signal. */
    function deadline() {
      try {
        return AbortSignal.timeout(8000);
      } catch (error) {
        return undefined;
      }
    }

    /** Call one visual-sandbox Host operation over the desktop carrier. */
    async function rpcRequest(endpoint, payload) {
      if (rpcCall === null) return null;
      try {
        const result = await rpcCall('/api', 'plugin/visual-sandbox/rpc', { endpoint, payload });
        if (result !== null && typeof result === 'object' && result.ok === true && result.value !== null && typeof result.value === 'object') {
          return result.value;
        }
        if (result !== null && typeof result === 'object' && result.ok === false) {
          return { ok: false, error: result.error?.message ?? 'Host request failed' };
        }
        return null;
      } catch (error) {
        return null;
      }
    }

    /** GET JSON. */
    async function getJson(path) {
      try {
        const url = new URL(endpointFor(path));
        if (rpcCall !== null && url.pathname === ROUTE_STATE) {
          const value = await rpcRequest('state', { sessionId: url.searchParams.get('sessionId') ?? '', action: 'ping' });
          if (value !== null) return value;
        }
        const response = await fetch(endpointFor(path), { method: 'GET', headers: { accept: 'application/json' }, cache: 'no-store', credentials: 'include', signal: deadline() });
        if (!response.ok) return null;
        const body = await response.json();
        return body !== null && typeof body === 'object' ? body : null;
      } catch (error) {
        return null;
      }
    }

    /** POST JSON. */
    async function postJson(path, body) {
      try {
        const endpoint = path === ROUTE_STATE ? 'state' : path === ROUTE_RENDER ? 'render' : path === ROUTE_DISCOVER ? 'discover' : null;
        if (rpcCall !== null && endpoint !== null) {
          const value = await rpcRequest(endpoint, body);
          if (value !== null) return value;
        }
        const response = await fetch(endpointFor(path), {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store',
          credentials: 'include',
          signal: deadline(),
        });
        const parsed = await response.json().catch(() => null);
        if (!response.ok) {
          return { ok: false, error: parsed !== null && typeof parsed.error === 'string' ? parsed.error : `HTTP ${response.status}` };
        }
        return parsed !== null && typeof parsed === 'object' ? parsed : { ok: false, error: 'empty response' };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'network error' };
      }
    }

    /** Inject the inspector. */
    function withInspector(html) {
      const tag = `<script data-dsh-visual-sandbox-inspector>(${inspectorMain.toString()})();</${'script'}>`;
      const lower = html.toLowerCase();
      const index = lower.lastIndexOf('</body>');
      if (index < 0) return `${html}${tag}`;
      return html.slice(0, index) + tag + html.slice(index);
    }

    /** Inject the optional Expand Narrow Containers helper. */
    function withExpansion(html, expand) {
      if (!expand) return html;
      const style =
        '<style data-dsh-expand-narrow>' +
        'html,body{width:100%!important;min-height:100vh!important;max-width:none!important;margin-left:0!important;margin-right:0!important}' +
        'body *{max-width:none!important}' +
        'body > *,#root,#app,[class*="phone"],[class*="mobile"],[class*="device"],[class*="frame"],[class*="container"]{width:100%!important;max-width:100%!important;margin-left:0!important;margin-right:0!important}' +
        '</style>';
      const head = /<head\b[^>]*>/iu.exec(html);
      if (head !== null) {
        const index = head.index + head[0].length;
        return html.slice(0, index) + style + html.slice(index);
      }
      return style + html;
    }

    /** Sparkle glyph. */
    function SparkleGlyph(props) {
      const size = typeof props?.size === 'number' ? props.size : 13;
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M8 2.2l1.35 3.45L12.8 7l-3.45 1.35L8 11.8 6.65 8.35 3.2 7l3.45-1.35z', fill: 'currentColor' }),
        h('path', { d: 'M12.4 10.6l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45L10.4 12.6l1.45-.55z', fill: 'currentColor', opacity: .7 }),
      );
    }

    /** Small viewport glyphs. */
    function ViewportGlyph(props) {
      const common = { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } };
      if (props.id === 'mobile') {
        return h('svg', common, h('rect', { x: 4, y: 1.5, width: 8, height: 13, rx: 2, stroke: 'currentColor', strokeWidth: 1.3 }), h('path', { d: 'M7 12.8h2', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }));
      }
      if (props.id === 'tablet') {
        return h('svg', common, h('rect', { x: 2.5, y: 2, width: 11, height: 12, rx: 1.8, stroke: 'currentColor', strokeWidth: 1.3 }), h('path', { d: 'M7.5 12.8h1', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }));
      }
      if (props.id === 'desktop') {
        return h('svg', common, h('rect', { x: 1.5, y: 2.5, width: 13, height: 10, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.3 }), h('path', { d: 'M1.5 5.3h13', stroke: 'currentColor', strokeWidth: 1.1 }));
      }
      return h('svg', common, h('rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.3 }), h('path', { d: 'M1.5 5.5h13M4 4h.1M6 4h.1', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }));
    }

    /** Reload glyph. */
    function ReloadGlyph() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M13 5.7V2.6M13 5.7H9.9M13.2 8a5.2 5.2 0 1 1-1.7-3.9', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    }

    /** Chevron glyph. */
    function ChevronGlyph() {
      return h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M4 6l4 4 4-4', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    }

    /** Cursor glyph. */
    function CursorGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M4 2.5v10l2.9-2.9 1.8 3.6 2-.9-1.8-3.5h4.1z', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }));
    }

    /** Expand glyph. */
    function ExpandGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    }

    /** Pencil glyph for Edit UI. */
    function PencilGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M10.8 2.4l2.8 2.8-8.2 8.2-3.3.5.5-3.3z', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }),
        h('path', { d: 'M9.3 3.9l2.8 2.8', stroke: 'currentColor', strokeWidth: 1.3 }),
      );
    }

    /** Dashed selection rectangle. */
    function SelectGlyph() {
      return h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        h('rect', { x: 3, y: 3, width: 10, height: 10, rx: 1.5, stroke: 'currentColor', strokeWidth: 1.3, strokeDasharray: '2.4 1.8' }),
      );
    }

    /** Paper plane for Send All. */
    function SendGlyph() {
      return h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', { d: 'M2.2 7.2l11.3-4.4-3.3 11.4-2.7-4.5z', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }),
        h('path', { d: 'M7.5 9.7l3.3-4.1', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
      );
    }

    /** Magnifier with a plus, for the preview scale control. */
    function ZoomGlyph() {
      return h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        h('circle', { cx: 7, cy: 7, r: 4.4, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'M10.3 10.3L14 14M7 5v4M5 7h4', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
      );
    }

    /** Layers glyph for Version. */
    function LayersGlyph() {
      return h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        h('path', { d: 'M8 2.4l5.4 2.9L8 8.2 2.6 5.3z', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round' }),
        h('path', { d: 'M2.8 8.3L8 11.1l5.2-2.8M2.8 11.2L8 14l5.2-2.8', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    /** Link glyph for Source. */
    function LinkGlyph() {
      return h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        h('path', { d: 'M6.5 9.5l3-3M5.2 10.8l-1 1a2.4 2.4 0 01-3.4-3.4l2-2a2.4 2.4 0 013.4 0M10.8 5.2l1-1a2.4 2.4 0 013.4 3.4l-2 2a2.4 2.4 0 01-3.4 0', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      );
    }

    /** Globe glyph for the Source control. */
    function GlobeGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        h('circle', { cx: 8, cy: 8, r: 6, stroke: 'currentColor', strokeWidth: 1.2 }),
        h('path', { d: 'M2 8h12M8 2c2.1 2 2.1 10 0 12M8 2c-2.1 2-2.1 10 0 12', stroke: 'currentColor', strokeWidth: 1.05, strokeLinecap: 'round' }),
      );
    }

    /** Monitor glyph for Device & Type. */
    function MonitorGlyph() {
      return h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block', flex: 'none' } },
        h('rect', { x: 1.6, y: 2.4, width: 12.8, height: 9, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.2 }),
        h('path', { d: 'M5.5 14h5M8 11.4V14', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
      );
    }

    /** Empty-state illustration: a browser window with code and sparkles. */
    function ReadyArt() {
      return h('svg', { width: 86, height: 70, viewBox: '0 0 86 70', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('rect', { className: 'dvs-artWindow', x: 10, y: 12, width: 62, height: 46, rx: 8, strokeWidth: 2 }),
        h('path', { className: 'dvs-artBar', d: 'M10 23h62', strokeWidth: 1.6 }),
        h('circle', { className: 'dvs-artDot', cx: 17, cy: 18, r: 1.6 }),
        h('circle', { className: 'dvs-artDot', cx: 23, cy: 18, r: 1.6 }),
        h('path', { className: 'dvs-artCode', d: 'M33 31l-6 7 6 7M49 31l6 7-6 7M44 28l-4 20', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { className: 'dvs-artSpark', d: 'M72 8l1.6 4.1L78 13.7l-4.4 1.6L72 19.4l-1.6-4.1L66 13.7l4.4-1.6z' }),
        h('path', { className: 'dvs-artSparkSoft', d: 'M12 58l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z' }),
      );
    }

    /** Normalize one platform mode. */
    function normalizeMode(value) {
      const alias = typeof value === 'string' ? MODE_ALIASES[value] : undefined;
      const mode = alias ?? value;
      return MODE_IDS.includes(mode) ? mode : 'web';
    }

    /** Percentage box. */
    function percentBox(box, viewport) {
      const pct = (value, total) => (total > 0 ? Math.round((value / total) * 10000) / 100 : 0);
      const clamp = (value) => Math.min(100, Math.max(0, value));
      return {
        x: clamp(pct(box.x, viewport.width)),
        y: clamp(pct(box.y, viewport.height)),
        width: clamp(pct(box.width, viewport.width)),
        height: clamp(pct(box.height, viewport.height)),
      };
    }

    /** Region selector text. */
    function regionSelector(normalized) {
      return `region(${Math.round(normalized.x)}%, ${Math.round(normalized.y)}%, ${Math.round(normalized.width)}%, ${Math.round(normalized.height)}%)`;
    }

    /** Tag for one annotation. */
    function annotationTag(annotation) {
      if (annotation.mode === 'region') {
        return `[#${annotation.id} ${annotation.platformMode}: ${regionSelector(annotation.normalized)}]`;
      }
      return `[#${annotation.id} ${annotation.platformMode}: ${annotation.selector}]`;
    }

    /** Header entry: one button that opens the workbench, and closes it again. */
    function OpenSandboxButton(props) {
      const t = props.t;
      const sessionId = typeof props.sessionId === 'string' ? props.sessionId : '';
      const [visible, setVisible] = React.useState(false);

      const isVisible = () => {
        const sidebar = sidebarService;
        if (sidebar === null || sessionId.length === 0) return false;
        try {
          const mine = sidebar.tabsIn(sessionId).filter((tab) => tab.kind === KIND);
          return mine.length > 0 && sidebar.isExpanded();
        } catch (error) {
          return false;
        }
      };

      // Mirror the panel's committed state so the button can close what it opened.
      React.useEffect(() => {
        let stopped = false;
        const sync = () => {
          if (!stopped) setVisible(isVisible());
        };
        sync();
        const timer = window.setInterval(sync, 1200);
        const wake = () => {
          if (document.visibilityState === 'visible') sync();
        };
        document.addEventListener('visibilitychange', wake);
        window.addEventListener('focus', wake);
        return () => {
          stopped = true;
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', wake);
          window.removeEventListener('focus', wake);
        };
      }, [sessionId]);

      React.useEffect(() => {
        if (typeof props.sessionId !== 'string' || props.sessionId.length === 0) return undefined;
        const storageKey = `dsh-visual-sandbox:open:${props.sessionId}`;
        let honored = 0;
        try {
          honored = Number(window.sessionStorage.getItem(storageKey) ?? 0) || 0;
        } catch (error) {
          honored = 0;
        }
        let stopped = false;
        const tick = async () => {
          if (stopped || document.visibilityState !== 'visible') return;
          const remote = await getJson(`${ROUTE_STATE}?sessionId=${encodeURIComponent(props.sessionId)}`);
          if (stopped || remote === null || typeof remote.openSeq !== 'number' || remote.openSeq <= honored) return;
          honored = remote.openSeq;
          try {
            window.sessionStorage.setItem(storageKey, String(honored));
          } catch (error) {}
          try {
            props.openSandbox();
          } catch (error) {
            console.error('[visual-sandbox] panel open failed', error);
          }
        };
        void tick();
        const timer = window.setInterval(() => void tick(), OPEN_POLL_MS);
        const wake = () => {
          if (document.visibilityState === 'visible') void tick();
        };
        document.addEventListener('visibilitychange', wake);
        return () => {
          stopped = true;
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', wake);
        };
      }, [props.sessionId]);

      const toggle = () => {
        const sidebar = sidebarService;
        if (sidebar === null || sessionId.length === 0) {
          try {
            props.openSandbox();
          } catch (error) {
            console.error('[visual-sandbox] panel open failed', error);
          }
          return;
        }
        try {
          if (isVisible()) sidebar.toggleExpanded();
          else {
            sidebar.openTab(KIND);
            ensureExpanded(sidebar);
          }
        } catch (error) {
          console.error('[visual-sandbox] panel toggle failed', error);
        }
        window.setTimeout(() => setVisible(isVisible()), 160);
      };

      const title = visible ? t('closeTitle') : t('openTitle');
      return h(
        'button',
        {
          type: 'button',
          className: 'dvs-btn',
          'data-active': visible ? 'true' : 'false',
          'aria-pressed': visible ? 'true' : 'false',
          title,
          'aria-label': title,
          onClick: toggle,
        },
        h('span', { className: 'dvs-headerMark', 'aria-hidden': true }, h(SparkleGlyph, { size: 15 })),
      );
    }

    /** After an open intent, make sure the column actually shows (opening a tab may not expand it). */
    function ensureExpanded(sidebar) {
      window.setTimeout(() => {
        try {
          if (sidebar?.isExpanded?.() === false) sidebar.toggleExpanded();
        } catch (error) {}
      }, 420);
    }

    /** Tab title. */
    function VisualSandboxTitle(props) {
      return h('span', { className: 'dvs-titleRow' },
        h('span', { className: 'dvs-titleIcon', 'aria-hidden': true }, h(SparkleGlyph, { size: 15 })),
        h('span', { className: 'dvs-titleText' }, props.t('tabTitle')),
        h('span', { className: 'dvs-titleChevron', 'aria-hidden': true }, h(ChevronGlyph)));
    }

    /** Workbench tab. */
    function VisualSandboxBody(props) {
      const t = props.t;
      const sessionId = typeof props.sessionId === 'string' ? props.sessionId : '';
      const inputActions = props.inputActions;

      const [source, setSource] = React.useState(null);
      const [draft, setDraft] = React.useState('');
      const [files, setFiles] = React.useState([]);
      const [annotations, setAnnotations] = React.useState([]);
      const [mode, setMode] = React.useState('interact');
      const [selectionMode, setSelectionMode] = React.useState('element');
      const [platformMode, setPlatformMode] = React.useState('web');
      const [zoom, setZoom] = React.useState('fit');
      const [expand, setExpand] = React.useState(false);
      const [rawHtml, setRawHtml] = React.useState(null);
      const [versions, setVersions] = React.useState([]);
      const [activeVersion, setActiveVersion] = React.useState(null);
      const [reloadKey, setReloadKey] = React.useState(0);
      const [status, setStatus] = React.useState('idle');
      const [notice, setNotice] = React.useState(null);
      const [pending, setPending] = React.useState(null);
      const [noteDraft, setNoteDraft] = React.useState('');
      const [queueOpen, setQueueOpen] = React.useState(true);
      const [hover, setHover] = React.useState(null);
      const [pinBoxes, setPinBoxes] = React.useState({});
      const [regionDrag, setRegionDrag] = React.useState(null);
      const [frameReady, setFrameReady] = React.useState(false);
      const [inspectorMissing, setInspectorMissing] = React.useState(false);
      const [stageSize, setStageSize] = React.useState({ width: 0, height: 0 });
      const [contentSize, setContentSize] = React.useState({ width: 0, height: 0 });
      const [dark, setDark] = React.useState(false);

      const stageRef = React.useRef(null);
      const contentRef = React.useRef(null);
      const frameRef = React.useRef(null);
      const sourceInputRef = React.useRef(null);
      const noteRef = React.useRef(null);
      const drag = React.useRef(null);
      const live = React.useRef({});
      const resolvedRoot = React.useRef('');
      const skipSync = React.useRef(false);
      const seq = React.useRef({ refresh: null, clear: null, open: null, mode: null });
      const booted = React.useRef(false);
      const versionKey = React.useRef('');

      const workspace = typeof props.useWorkspaces === 'function'
        ? props.useWorkspaces((snapshot) => {
            const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
            return items.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId)) ?? null;
          })
        : null;
      const workspaceRoot = typeof workspace?.path === 'string' ? workspace.path : '';

      const metrics = VIEWPORTS[platformMode] ?? null;
      const chrome = CHROME[platformMode] ?? { width: 0, height: 0 };
      const availableWidth = Math.max(80, stageSize.width - 24 - chrome.width);
      const fitScale = metrics === null
        ? 1
        : Math.min(1, Math.max(0.1, availableWidth / metrics.width));
      const scale = metrics === null ? 1 : zoom === 'fit' ? fitScale : Number(zoom) || 1;
      const manual = metrics !== null && zoom !== 'fit';
      const displayWidth = metrics === null ? contentSize.width : metrics.width * scale;
      const displayHeight = metrics === null ? contentSize.height : metrics.height * scale;
      const frameWidth = displayWidth + chrome.width;
      const frameCentered = stageSize.width === 0 || frameWidth <= stageSize.width - 24;
      const frameHostStyle = { justifyContent: frameCentered ? 'center' : 'flex-start', alignItems: 'flex-start' };
      const scrollable = metrics !== null;
      const viewport = metrics ?? { width: Math.max(1, contentSize.width), height: Math.max(1, contentSize.height) };

      live.current = {
        sessionId,
        t,
        inputActions,
        workspaceRoot,
        source,
        annotations,
        platformMode,
        zoom,
        expand,
        mode,
        selectionMode,
        draft,
        viewport,
        scale,
        pending,
        noteDraft,
      };

      const sourceKey = (value) => (value === null ? '' : `${value.kind}:${value.value}`);
      const notify = (kind, text) => setNotice({ kind, text, at: Date.now() });
      const clearLocal = () => {
        live.current.annotations = [];
        setAnnotations([]);
        setPending(null);
        setNoteDraft('');
        setHover(null);
        setPinBoxes({});
      };
      const pushState = async () => {
        const current = live.current;
        if (current.sessionId.length === 0) return null;
        return postJson(ROUTE_STATE, {
          sessionId: current.sessionId,
          action: 'sync',
          source: current.source,
          annotations: current.annotations.filter((annotation) => annotation.pending !== true),
          platform: {
            platformMode: current.platformMode,
            zoom: current.zoom,
            expandContainers: current.expand,
          },
        });
      };
      const adoptSource = (next, options = {}) => {
        const previous = live.current.source;
        if (options.preserve !== true && previous !== null && sourceKey(previous) !== sourceKey(next)) clearLocal();
        live.current.source = next;
        setSource(next);
      };
      const applyVersions = (response) => {
        if (response === null || response === undefined) return;
        const list = Array.isArray(response.versions) ? response.versions : [];
        const key = list.map((item) => item.id).join(',');
        if (key !== versionKey.current) {
          versionKey.current = key;
          setVersions(list);
        }
        if (typeof response.version === 'number') setActiveVersion(response.version);
        else if (typeof response.activeVersion === 'number') setActiveVersion(response.activeVersion);
      };

      /** Ask the Host for a stored version and swap the preview to it. */
      const selectVersion = async (value) => {
        const id = Number(value);
        if (!Number.isFinite(id)) return;
        setStatus('loading');
        const response = await postJson(ROUTE_RENDER, { sessionId: live.current.sessionId, versionId: id });
        if (response === null || response.ok !== true) {
          setStatus('ready');
          notify('error', response?.error ?? t('loadFailed'));
          return;
        }
        adoptSource({ kind: 'file', value: response.path, title: response.title }, { preserve: true });
        setDraft(response.path);
        setRawHtml(response.html);
        applyVersions(response);
        setFrameReady(false);
        setHover(null);
        setPinBoxes({});
        setReloadKey((current) => current + 1);
        setStatus('ready');
      };

      const loadFile = async (path, options = {}) => {
        const clean = String(path ?? '').replace(/\\/gu, '/').replace(/^\.?\//u, '').trim();
        if (clean.length === 0) return false;
        setStatus('loading');
        setRawHtml(null);
        setFrameReady(false);
        setInspectorMissing(false);
        setHover(null);
        setPinBoxes({});
        const response = await postJson(ROUTE_RENDER, { sessionId: live.current.sessionId, root: resolvedRoot.current || workspaceRoot, path: clean });
        if (response === null || response.ok !== true) {
          setStatus('error');
          notify('error', response?.error ?? t('loadFailed'));
          return false;
        }
        adoptSource({ kind: 'file', value: response.path, title: response.title }, options);
        setDraft(response.path);
        setRawHtml(response.html);
        applyVersions(response);
        setReloadKey((value) => value + 1);
        setStatus('ready');
        return true;
      };
      const loadUrl = (input) => {
        const trimmed = String(input ?? '').trim();
        if (trimmed.length === 0) return false;
        let candidate = trimmed;
        if (!/^[a-z][a-z0-9+.-]*:/iu.test(candidate)) candidate = `http://${candidate}`;
        let url;
        try {
          url = new URL(candidate);
        } catch (error) {
          notify('error', t('badAddress'));
          return false;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          notify('error', t('badProtocol'));
          return false;
        }
        if (url.username.length > 0 || url.password.length > 0) {
          notify('error', t('badAddress'));
          return false;
        }
        try {
          if (url.origin === new URL(document.baseURI).origin) {
            notify('error', t('appOrigin'));
            return false;
          }
        } catch (error) {}
        const previous = live.current.source;
        const next = { kind: 'url', value: url.href, title: url.host };
        if (previous !== null && sourceKey(previous) !== sourceKey(next)) clearLocal();
        live.current.source = next;
        setSource(next);
        setDraft(url.href);
        setRawHtml(null);
        setFrameReady(false);
        setInspectorMissing(false);
        setHover(null);
        setPinBoxes({});
        setReloadKey((value) => value + 1);
        setStatus('ready');
        return true;
      };
      const looksLikeUrl = (value) => /^https?:\/\//iu.test(value) || /^(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?(?:\/|$)/iu.test(value);
      const loadFromInput = () => {
        const value = draft.trim();
        if (value.length === 0) return;
        if (looksLikeUrl(value)) loadUrl(value);
        else void loadFile(value);
      };
      const reloadPreview = () => {
        const current = live.current;
        if (current.source === null) {
          loadFromInput();
          return;
        }
        const value = typeof current.draft === 'string' ? current.draft.trim() : '';
        if (value.length > 0 && value !== current.source.value) {
          if (looksLikeUrl(value)) loadUrl(value);
          else void loadFile(value);
          return;
        }
        if (current.source.kind === 'file') {
          void loadFile(current.source.value, { preserve: true });
        } else {
          setReloadKey((value) => value + 1);
        }
      };
      const discover = async () => {
        const response = await postJson(ROUTE_DISCOVER, { sessionId, root: workspaceRoot });
        if (response === null || response.ok !== true) return [];
        if (typeof response.root === 'string' && response.root.length > 0) resolvedRoot.current = response.root;
        const found = Array.isArray(response.files) ? response.files : [];
        setFiles(found);
        return found;
      };
      const setModeAndSync = (next) => {
        settlePending();
        live.current.platformMode = next;
        setPlatformMode(next);
        setPending(null);
        setHover(null);
        setPinBoxes({});
      };
      const openPicker = () => {
        const input = sourceInputRef.current;
        if (input !== null) {
          if (typeof input.showPicker === 'function') {
            try {
              input.showPicker();
              return;
            } catch (error) {}
          }
          input.focus();
        }
      };

      React.useEffect(() => {
        const read = () => {
          try {
            if (document.documentElement?.getAttribute?.('data-theme') === 'dark') return true;
            const scheme = window.getComputedStyle(document.documentElement).colorScheme;
            if (typeof scheme === 'string' && scheme.toLowerCase().includes('dark')) return true;
            const bg = window.getComputedStyle(document.body).backgroundColor;
            const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/u.exec(bg);
            if (match === null) return false;
            const luminance = 0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3]);
            return luminance < 120;
          } catch (error) {
            return false;
          }
        };
        const update = () => setDark(read());
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
        try {
          observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
        } catch (error) {}
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener?.('change', update);
        return () => {
          observer.disconnect();
          media.removeEventListener?.('change', update);
        };
      }, []);

      React.useEffect(() => {
        if (sessionId.length === 0) return undefined;
        if (workspaceRoot.length > 0) resolvedRoot.current = '';
        let cancelled = false;
        const boot = async () => {
          const remote = await getJson(`${ROUTE_STATE}?sessionId=${encodeURIComponent(sessionId)}`);
          if (cancelled) return;
          let sourceLoaded = false;
          if (remote !== null && remote.ok === true) {
            applyVersions(remote);
            seq.current = {
              refresh: remote.refreshSeq ?? 0,
              clear: remote.clearSeq ?? 0,
              open: remote.openSeq ?? 0,
              mode: remote.modeSeq ?? 0,
            };
            if (MODE_IDS.includes(remote.platformMode)) setPlatformMode(remote.platformMode);
            if (ZOOM_VALUES.includes(remote.zoom)) setZoom(remote.zoom);
            if (typeof remote.expandContainers === 'boolean') setExpand(remote.expandContainers);
            const restored = remote.source;
            if (restored !== null && typeof restored === 'object') {
              skipSync.current = true;
              setSource(restored);
              setDraft(restored.value);
              if (Array.isArray(remote.annotations)) {
                live.current.annotations = remote.annotations;
                setAnnotations(remote.annotations);
              }
              if (restored.kind === 'file') {
                sourceLoaded = await loadFile(restored.value, { preserve: true });
                if (!sourceLoaded) {
                  live.current.source = null;
                  setSource(null);
                  setDraft('');
                }
              } else if (restored.kind === 'url') {
                setReloadKey((value) => value + 1);
                setStatus('ready');
                sourceLoaded = true;
              }
            }
          }
          const found = await discover();
          if (cancelled) return;
          if (live.current.source?.kind === 'file' && found.length > 0) {
            const currentEntry = found.find((entry) => entry.path === live.current.source.value);
            const newest = found[0];
            if (
              currentEntry !== undefined
              && newest !== undefined
              && newest.path !== currentEntry.path
              && Number(newest.mtime) > Number(currentEntry.mtime)
            ) {
              sourceLoaded = await loadFile(newest.path, { preserve: true });
              if (sourceLoaded) setNotice(null);
            }
          }
          if (!sourceLoaded && live.current.source === null && found.length > 0) {
            booted.current = true;
            if (await loadFile(found[0].path, { preserve: true })) setNotice(null);
          }
        };
        void boot();
        return () => {
          cancelled = true;
        };
      }, [sessionId, workspaceRoot]);

      React.useEffect(() => {
        if (sessionId.length === 0) return undefined;
        let stopped = false;
        const tick = async () => {
          if (stopped || document.visibilityState !== 'visible') return;
          const remote = await getJson(`${ROUTE_STATE}?sessionId=${encodeURIComponent(sessionId)}`);
          if (stopped || remote === null || remote.ok !== true) return;
          applyVersions(remote);
          if (seq.current.refresh === null) {
            seq.current = { refresh: remote.refreshSeq ?? 0, clear: remote.clearSeq ?? 0, open: remote.openSeq ?? 0, mode: remote.modeSeq ?? 0 };
            return;
          }
          if (typeof remote.modeSeq === 'number' && remote.modeSeq > seq.current.mode) {
            seq.current.mode = remote.modeSeq;
            settlePending();
            if (MODE_IDS.includes(remote.platformMode)) setPlatformMode(remote.platformMode);
            if (ZOOM_VALUES.includes(remote.zoom)) setZoom(remote.zoom);
            if (typeof remote.expandContainers === 'boolean') setExpand(remote.expandContainers);
            setPending(null);
            setHover(null);
            setPinBoxes({});
            setNotice({ kind: 'info', text: t('agentSwitched'), at: Date.now() });
          }
          if (typeof remote.refreshSeq === 'number' && remote.refreshSeq > seq.current.refresh) {
            seq.current.refresh = remote.refreshSeq;
            const remoteSource = remote.source;
            if (remoteSource !== null && typeof remoteSource === 'object' && sourceKey(remoteSource) !== sourceKey(live.current.source)) {
              skipSync.current = true;
              adoptSource(remoteSource);
              setDraft(remoteSource.value);
              if (remoteSource.kind === 'file') void loadFile(remoteSource.value, { preserve: false });
              else {
                setRawHtml(null);
                setReloadKey((value) => value + 1);
                setStatus('ready');
              }
            } else {
              reloadPreview();
            }
            notify('info', t('refreshedByAgent'));
          }
          if (typeof remote.clearSeq === 'number' && remote.clearSeq > seq.current.clear) {
            seq.current.clear = remote.clearSeq;
            clearLocal();
            setNotice({ kind: 'info', text: t('clearedByAgent'), at: Date.now() });
          }
        };
        const timer = window.setInterval(() => void tick(), POLL_MS);
        const wake = () => {
          if (document.visibilityState === 'visible') void tick();
        };
        document.addEventListener('visibilitychange', wake);
        window.addEventListener('focus', wake);
        return () => {
          stopped = true;
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', wake);
          window.removeEventListener('focus', wake);
        };
      }, [sessionId]);

      React.useEffect(() => {
        let stopped = false;
        const refresh = async () => {
          if (stopped || document.visibilityState !== 'visible') return;
          const found = await discover();
          if (!stopped && live.current.source === null && live.current.draft.trim().length === 0 && found.length > 0) {
            void loadFile(found[0].path, { preserve: true });
          }
        };
        const timer = window.setInterval(() => void refresh(), 6000);
        return () => {
          stopped = true;
          window.clearInterval(timer);
        };
      }, [workspaceRoot]);

      React.useEffect(() => {
        if (skipSync.current) {
          skipSync.current = false;
          return undefined;
        }
        if (live.current.source === null) return undefined;
        const timer = window.setTimeout(() => void pushState(), 250);
        return () => window.clearTimeout(timer);
      }, [annotations, source, platformMode, zoom, expand]);

      React.useEffect(() => {
        const node = stageRef.current;
        if (node === null) return undefined;
        const update = () => setStageSize({ width: node.clientWidth, height: node.clientHeight });
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
      }, []);

      React.useEffect(() => {
        if (metrics !== null) return undefined;
        const node = contentRef.current;
        if (node === null) return undefined;
        const update = () => setContentSize({ width: node.clientWidth, height: node.clientHeight });
        update();
        const observer = new ResizeObserver(update);
        observer.observe(node);
        return () => observer.disconnect();
      }, [platformMode, source?.kind, reloadKey]);

      React.useEffect(() => {
        const onMessage = (event) => {
          const frame = frameRef.current;
          if (frame === null || event.source !== frame.contentWindow) return;
          const data = event.data;
          if (data === null || typeof data !== 'object' || data.__dshVisualSandbox !== true) return;
          if (data.type === 'ready') {
            setFrameReady(true);
            setInspectorMissing(false);
          } else if (data.type === 'hover') {
            setHover(data.hover ?? null);
          } else if (data.type === 'pick' && data.target !== undefined) {
            addPendingElement(data.target);
          } else if (data.type === 'pinGeometry' && Array.isArray(data.pins)) {
            const next = {};
            for (const pin of data.pins) {
              if (pin !== null && typeof pin === 'object' && typeof pin.id === 'number' && pin.box) next[pin.id] = pin.box;
            }
            setPinBoxes(next);
          }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
      }, []);

      React.useEffect(() => {
        const frame = frameRef.current;
        if (frame === null || frame.contentWindow === null) return;
        try {
          frame.contentWindow.postMessage(
            { __dshVisualSandbox: true, type: 'mode', edit: mode === 'edit' && (source?.kind === 'file') && !inspectorMissing && selectionMode === 'element' },
            '*',
          );
          const pins = pinList().map((pin) => ({ id: pin.id, selector: pin.selector }));
          frame.contentWindow.postMessage({ __dshVisualSandbox: true, type: 'pins', pins }, '*');
        } catch (error) {}
      }, [mode, selectionMode, frameReady, reloadKey, platformMode, annotations.length]);

      React.useEffect(() => {
        setFrameReady(false);
        setInspectorMissing(false);
        setHover(null);
        setPinBoxes({});
      }, [reloadKey, expand]);

      React.useEffect(() => {
        if (source === null || source.kind !== 'file' || frameReady || rawHtml === null) return undefined;
        const timer = window.setTimeout(() => setInspectorMissing(true), INSPECTOR_GRACE_MS);
        return () => window.clearTimeout(timer);
      }, [source, frameReady, rawHtml]);

      React.useEffect(() => {
        if (notice === null || notice.kind === 'error') return undefined;
        const timer = window.setTimeout(() => {
          setNotice((current) => (current !== null && current.at === notice.at ? null : current));
        }, 4200);
        return () => window.clearTimeout(timer);
      }, [notice]);

      React.useEffect(() => {
        if (pending === null) return undefined;
        const timer = window.setTimeout(() => noteRef.current?.focus(), 0);
        return () => window.clearTimeout(timer);
      }, [pending]);

      const pinList = () => live.current.annotations.filter((annotation) => annotation.platformMode === live.current.platformMode);

      const settlePending = () => {
        const current = live.current;
        if (current.pending === null) return;
        const annotation = current.annotations.find((entry) => entry.id === current.pending);
        if (annotation === undefined) {
          setPending(null);
          return;
        }
        const note = current.noteDraft.trim();
        if (note.length > 0) {
          const next = current.annotations.map((entry) =>
            entry.id === annotation.id ? { ...entry, note, pending: false, sent: false } : entry,
          );
          current.annotations = next;
          setAnnotations(next);
        } else {
          const next = current.annotations.filter((entry) => entry.id !== annotation.id);
          current.annotations = next;
          setAnnotations(next);
        }
        setPending(null);
        setNoteDraft('');
      };

      const addPendingBase = (base) => {
        settlePending();
        const current = live.current;
        if (current.annotations.length >= MAX_ANNOTATIONS) {
          notify('error', t('capReached'));
          return null;
        }
        const id = current.annotations.reduce((max, annotation) => Math.max(max, annotation.id), 0) + 1;
        const annotation = {
          id,
          note: '',
          platformMode: current.platformMode,
          viewport: { width: Math.round(current.viewport.width), height: Math.round(current.viewport.height) },
          normalized: base.normalized,
          box: base.box,
          selector: base.selector,
          label: base.label ?? '',
          html: base.html ?? '',
          text: base.text ?? '',
          styles: base.styles ?? {},
          mode: base.mode,
          pending: true,
          sent: false,
          createdAt: Date.now(),
        };
        const next = [...current.annotations, annotation];
        current.annotations = next;
        setAnnotations(next);
        setPending(id);
        setNoteDraft('');
        setQueueOpen(true);
        return annotation;
      };

      const addPendingElement = (target) => {
        if (target === null || typeof target !== 'object' || typeof target.selector !== 'string') return;
        const current = live.current;
        if (current.viewport.width <= 0 || current.viewport.height <= 0) return;
        addPendingBase({
          normalized: percentBox(target.box ?? { x: 0, y: 0, width: 0, height: 0 }, current.viewport),
          box: target.box ?? { x: 0, y: 0, width: 0, height: 0 },
          selector: target.selector,
          label: target.label,
          html: target.html,
          text: target.text,
          styles: target.styles,
          mode: 'element',
        });
      };

      const addPendingRegion = (box) => {
        const current = live.current;
        if (current.viewport.width <= 0 || current.viewport.height <= 0) return;
        const normalized = percentBox(box, current.viewport);
        if (normalized.width < 0.5 || normalized.height < 0.5) return;
        addPendingBase({
          normalized,
          box: { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) },
          selector: regionSelector(normalized),
          label: 'Region',
          html: '',
          text: '',
          styles: {},
          mode: 'region',
        });
      };

      const updateAnnotation = (id, patch) => {
        const current = live.current;
        const next = current.annotations.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
        current.annotations = next;
        setAnnotations(next);
      };

      const insertText = (text) => {
        const current = live.current;
        try {
          const span = current.inputActions?.captureInsertion?.();
          if (span === undefined) return false;
          return current.inputActions.insertText(text, span) === true;
        } catch (error) {
          return false;
        }
      };

      const sendPending = () => {
        const current = live.current;
        const id = current.pending;
        if (id === null) return;
        const annotation = current.annotations.find((entry) => entry.id === id);
        if (annotation === undefined) return;
        const note = current.noteDraft.trim();
        updateAnnotation(id, { note, pending: false, sent: true });
        setPending(null);
        setNoteDraft('');
        const delivered = insertText(`${annotationTag({ ...annotation, note })} \n`);
        void pushState();
        notify(delivered ? 'info' : 'error', delivered ? t('inserted') : t('insertFailed'));
      };

      const queuePending = () => {
        const current = live.current;
        const id = current.pending;
        if (id === null) return;
        const annotation = current.annotations.find((entry) => entry.id === id);
        if (annotation === undefined) return;
        updateAnnotation(id, { note: current.noteDraft.trim(), pending: false, sent: false });
        setPending(null);
        setNoteDraft('');
        notify('info', t('queued'));
      };

      const cancelPending = () => {
        const current = live.current;
        if (current.pending === null) return;
        const next = current.annotations.filter((entry) => entry.id !== current.pending);
        current.annotations = next;
        setAnnotations(next);
        setPending(null);
        setNoteDraft('');
      };

      const removeAnnotation = (id) => {
        const current = live.current;
        const next = current.annotations.filter((entry) => entry.id !== id);
        current.annotations = next;
        setAnnotations(next);
        if (current.pending === id) {
          setPending(null);
          setNoteDraft('');
        }
      };

      const sendAll = () => {
        const current = live.current;
        const unsent = current.annotations.filter((annotation) => annotation.pending !== true && annotation.sent !== true);
        if (unsent.length === 0) return;
        const text = `${unsent.map(annotationTag).join('\n')}\n`;
        const delivered = insertText(text);
        const ids = new Set(unsent.map((annotation) => annotation.id));
        const next = current.annotations.map((annotation) => (ids.has(annotation.id) ? { ...annotation, sent: true } : annotation));
        current.annotations = next;
        setAnnotations(next);
        void pushState();
        notify(delivered ? 'info' : 'error', delivered ? t('inserted') : t('insertFailed'));
      };

      const currentPending = pending === null ? null : annotations.find((annotation) => annotation.id === pending) ?? null;
      const queued = annotations.filter((annotation) => annotation.pending !== true);
      const unsent = queued.filter((annotation) => annotation.sent !== true);
      const elementEnabled = mode === 'edit' && source?.kind === 'file' && !inspectorMissing && selectionMode === 'element';
      const regionEnabled = mode === 'edit' && source !== null && selectionMode === 'region';
      const responsive = platformMode === 'web';
      const canExpand = platformMode !== 'mobile';
      const expandAvailable = source?.kind === 'file';

      const boxFor = (annotation) => {
        if (annotation.mode === 'region') {
          return {
            x: (annotation.normalized.x / 100) * displayWidth,
            y: (annotation.normalized.y / 100) * displayHeight,
            width: (annotation.normalized.width / 100) * displayWidth,
            height: (annotation.normalized.height / 100) * displayHeight,
          };
        }
        const liveBox = pinBoxes[annotation.id] ?? annotation.box;
        return { x: liveBox.x * scale, y: liveBox.y * scale, width: liveBox.width * scale, height: liveBox.height * scale };
      };

      const pinStyle = (annotation) => {
        const box = boxFor(annotation);
        return { left: `${box.x}px`, top: `${box.y}px`, width: `${Math.max(0, box.width)}px`, height: `${Math.max(0, box.height)}px` };
      };

      const popoverPosition = (annotation) => {
        const box = boxFor(annotation);
        const width = 272;
        const left = Math.max(4, Math.min(box.x, displayWidth - width - 4));
        let top = box.y + box.height + 8;
        if (top > displayHeight - 180) top = Math.max(4, box.y - 176);
        return { left: `${left}px`, top: `${top}px` };
      };

      const onRegionDown = (event) => {
        if (!regionEnabled) return;
        const rect = event.currentTarget.getBoundingClientRect();
        drag.current = { pointerId: event.pointerId, start: { x: event.clientX - rect.left, y: event.clientY - rect.top } };
        event.currentTarget.setPointerCapture(event.pointerId);
        setRegionDrag({ x: drag.current.start.x, y: drag.current.start.y, width: 0, height: 0 });
      };
      const onRegionMove = (event) => {
        const state = drag.current;
        if (state === null || state.pointerId !== event.pointerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        setRegionDrag({
          x: Math.min(state.start.x, point.x),
          y: Math.min(state.start.y, point.y),
          width: Math.abs(point.x - state.start.x),
          height: Math.abs(point.y - state.start.y),
        });
      };
      const onRegionUp = (event) => {
        const state = drag.current;
        drag.current = null;
        setRegionDrag(null);
        if (state === null || state.pointerId !== event.pointerId) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const box = {
          x: Math.min(state.start.x, point.x),
          y: Math.min(state.start.y, point.y),
          width: Math.abs(point.x - state.start.x),
          height: Math.abs(point.y - state.start.y),
        };
        if (box.width < 6 || box.height < 6) return;
        const designBox = { x: box.x / scale, y: box.y / scale, width: box.width / scale, height: box.height / scale };
        addPendingRegion(designBox);
      };

      const onSourceChange = (event) => {
        const value = event.target.value;
        setDraft(value);
        const match = files.find((file) => file.path === value);
        if (match !== undefined && (source === null || source.value !== value)) {
          void loadFile(value);
        }
      };

      const chooseSelection = (value) => {
        setSelectionMode(value);
        setHover(null);
        setRegionDrag(null);
      };

      const selectionHint = (() => {
        if (mode !== 'edit' || source === null) return null;
        if (selectionMode === 'element') {
          if (source.kind === 'url') return t('elementOnlyHint');
          if (source.kind === 'file' && inspectorMissing) return t('elementMissingHint');
          return null;
        }
        if (selectionMode === 'region') {
          return source.kind === 'url' ? t('crossOriginHint') : t('regionHint');
        }
        return null;
      })();

      const renderToolbar = () => {
        const fileVersions = source?.kind === 'file'
          ? versions.filter((entry) => entry?.source?.kind === 'file' && entry.source.value === source.value)
          : [];
        const latestVersion = fileVersions.length > 0 ? fileVersions[fileVersions.length - 1].id : null;
        const activeEntry = fileVersions.find((entry) => String(entry.id) === String(activeVersion));
        const versionValue = fileVersions.length > 0 ? String((activeEntry ?? fileVersions[fileVersions.length - 1]).id) : '';
        const versionDisabled = fileVersions.length === 0;
        const versionTitle = (entry) => `v${entry.id} - ${new Date(entry.at).toLocaleTimeString()} - ${entry.title}`;
        const versionOptions = fileVersions.length > 0
          ? fileVersions.map((entry) => ({ value: String(entry.id), label: entry.id === latestVersion ? `v${entry.id} (latest)` : `v${entry.id}`, title: versionTitle(entry) }))
          : [{ value: '', label: t('versionLatest'), title: t('versionLatest') }];
        const selectedVersion = versionOptions.find((entry) => entry.value === versionValue) ?? versionOptions[versionOptions.length - 1];
        const deviceLabel = MODES.find((entry) => entry.id === platformMode)?.label ?? 'Responsive';
      const fitPercent = Math.round(fitScale * 100);
      const zoomOptions = ZOOM_OPTIONS.map((entry) => (entry.value === 'fit' ? { ...entry, label: `Fit (${fitPercent}%)` } : entry));
      const currentZoom = responsive ? 'fit' : zoom;
      const zoomLabel = responsive ? 'Fit' : (zoomOptions.find((entry) => entry.value === zoom)?.label ?? 'Fit');
        return h(
          'div',
          { className: 'dvs-toolbar' },
          h(
            'div',
            { className: 'dvs-controls' },
            h(
              'div',
              { className: 'dvs-field' },
              h('span', { className: 'dvs-fieldLabel' }, h(MonitorGlyph), t('deviceLabel')),
              h(
                'div',
                { className: 'dvs-fieldControl dvs-selectControl' },
                h('span', { className: 'dvs-fieldIcon' }, h(ViewportGlyph, { id: platformMode })),
                h('span', { className: 'dvs-fieldValue' }, deviceLabel),
                h('span', { className: 'dvs-fieldChevron', 'aria-hidden': true }, h(ChevronGlyph)),
                h(
                  'select',
                  {
                    className: 'dvs-fieldSelectOverlay',
                    value: platformMode,
                    'aria-label': t('deviceLabel'),
                    onChange: (event) => setModeAndSync(event.target.value),
                  },
                  MODES.map((entry) => h('option', { key: entry.id, value: entry.id, title: entry.size }, entry.label)),
                ),
              ),
            ),
            h(
              'div',
              { className: 'dvs-field' },
              h('span', { className: 'dvs-fieldLabel' }, h(LayersGlyph), t('versionLabel')),
              h(
                'div',
                {
                  className: 'dvs-fieldControl dvs-selectControl',
                  'data-disabled': versionDisabled ? 'true' : 'false',
                  title: selectedVersion.title,
                },
                h('span', { className: 'dvs-fieldIcon' }, h(LayersGlyph)),
                h('span', { className: 'dvs-fieldValue' }, selectedVersion.label),
                h('span', { className: 'dvs-fieldChevron', 'aria-hidden': true }, h(ChevronGlyph)),
                h(
                  'select',
                  {
                    className: 'dvs-fieldSelectOverlay',
                    value: versionValue,
                    disabled: versionDisabled,
                    'aria-label': t('versionLabel'),
                    onChange: (event) => {
                      if (event.target.value.length > 0) void selectVersion(event.target.value);
                    },
                  },
                  versionOptions.map((entry) => h('option', { key: entry.value, value: entry.value, title: entry.title }, entry.label)),
                ),
              ),
            ),
            h(
              'div',
              { className: 'dvs-field dvs-fieldSource' },
              h('span', { className: 'dvs-fieldLabel' }, h(LinkGlyph), t('sourceLabel')),
              h(
                'div',
                { className: 'dvs-fieldControl dvs-sourceControl' },
                h('span', { className: 'dvs-fieldIcon' }, h(GlobeGlyph)),
                h('input', {
                  ref: sourceInputRef,
                  list: 'dvs-preview-files',
                  className: 'dvs-sourceInput',
                  type: 'text',
                  value: draft,
                  placeholder: t('sourcePlaceholder'),
                  spellCheck: false,
                  'aria-label': t('sourcePlaceholder'),
                  onChange: onSourceChange,
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      loadFromInput();
                    }
                  },
                }),
                h(
                  'div',
                  { className: 'dvs-fieldButtons' },
                  h('button', { type: 'button', className: 'dvs-fieldBtn', title: t('reload'), 'aria-label': t('reload'), onClick: reloadPreview }, h(ReloadGlyph)),
                  h('button', { type: 'button', className: 'dvs-fieldBtn', title: t('chooseFile'), 'aria-label': t('chooseFile'), onClick: openPicker }, h(ChevronGlyph)),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'dvs-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'dvs-actionBtn',
                'data-active': mode === 'interact' ? 'true' : 'false',
                title: t('inspectTitle'),
                onClick: () => setMode('interact'),
              },
              h(CursorGlyph),
              t('inspect'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dvs-actionBtn',
                'data-active': mode === 'edit' ? 'true' : 'false',
                title: t('editTitle'),
                onClick: () => setMode('edit'),
              },
              h(PencilGlyph),
              t('edit'),
            ),
            h(
              'div',
              { className: 'dvs-selectAction', title: t('selectTitle') },
              h(SelectGlyph),
              h('span', { className: 'dvs-selectValue' }, selectionMode === 'region' ? t('selectRegion') : t('selectElement')),
              h('span', { className: 'dvs-actionChevron', 'aria-hidden': true }, h(ChevronGlyph)),
              h(
                'select',
                {
                  className: 'dvs-selectOverlay',
                  value: selectionMode,
                  'aria-label': t('selectTool'),
                  onChange: (event) => chooseSelection(event.target.value),
                },
                h('option', { value: 'element' }, t('selectElement')),
                h('option', { value: 'region' }, t('selectRegion')),
              ),
            ),
            h(
              'div',
              { className: 'dvs-selectAction dvs-zoomAction', title: t('zoomTitle'), 'data-disabled': responsive ? 'true' : 'false' },
              h(ZoomGlyph),
              h('span', { className: 'dvs-selectValue' }, zoomLabel),
              h('span', { className: 'dvs-actionChevron', 'aria-hidden': true }, h(ChevronGlyph)),
              h(
                'select',
                {
                  className: 'dvs-selectOverlay',
                  value: currentZoom,
                  disabled: responsive,
                  'aria-label': t('zoomTitle'),
                  onChange: (event) => setZoom(event.target.value),
                },
                zoomOptions.map((entry) => h('option', { key: entry.value, value: entry.value }, entry.label)),
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dvs-actionBtn dvs-actionIcon',
                'data-active': expand ? 'true' : 'false',
                'aria-pressed': expand ? 'true' : 'false',
                disabled: !canExpand || !expandAvailable,
                title: !expandAvailable ? t('expandUnavailable') : t('expandTitle'),
                onClick: () => setExpand((value) => !value),
              },
              h(ExpandGlyph),
            ),
            h(
              'button',
              { type: 'button', className: 'dvs-sendAll', title: t('sendAllTitle'), disabled: unsent.length === 0, onClick: sendAll },
              h(SendGlyph),
              `${t('sendAll')} (${unsent.length})`,
            ),
          ),
          h('datalist', { id: 'dvs-preview-files' }, files.map((file) => h('option', { key: file.path, value: file.path }))),
        );
      };

      const renderContent = () => {
        if (source === null || (source.kind === 'file' && rawHtml === null)) return null;
        if (source.kind === 'url') {
          return h('iframe', {
            key: reloadKey,
            className: 'dvs-frame',
            title: t('frameTitle'),
            src: source.value,
            sandbox: 'allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox',
            ref: frameRef,
          });
        }
        return h('iframe', {
          key: reloadKey,
          className: 'dvs-frame',
          title: t('frameTitle'),
          srcDoc: withInspector(withExpansion(rawHtml, expand)),
          sandbox: 'allow-scripts allow-forms allow-modals allow-popups',
          ref: frameRef,
          onLoad: () => {
            const frame = frameRef.current;
            try {
              frame?.contentWindow?.postMessage({ __dshVisualSandbox: true, type: 'ping' }, '*');
            } catch (error) {}
          },
        });
      };

      const renderOverlay = () => {
        const pins = pinList();
        const hoverStyle = hover === null
          ? null
          : {
              left: `${hover.box.x * scale}px`,
              top: `${hover.box.y * scale}px`,
              width: `${Math.max(0, hover.box.width * scale)}px`,
              height: `${Math.max(0, hover.box.height * scale)}px`,
            };
        const tagStyle = hover === null
          ? null
          : {
              left: `${Math.max(2, (hover.box.x + Math.min(12, hover.box.width / 2)) * scale)}px`,
              top: `${Math.max(2, hover.box.y * scale - 19)}px`,
            };
        return h(
          'div',
          { className: 'dvs-overlay' },
          pins.map((annotation) =>
            h(
              'div',
              { key: annotation.id, className: 'dvs-pin', style: pinStyle(annotation) },
              h('span', { className: 'dvs-pinBadge' }, `#${annotation.id}`),
            ),
          ),
          regionEnabled
            ? h(
                'div',
                { className: 'dvs-regionLayer', onPointerDown: onRegionDown, onPointerMove: onRegionMove, onPointerUp: onRegionUp, onPointerCancel: onRegionUp },
                regionDrag !== null
                  ? h('div', { className: 'dvs-regionRect', style: { left: `${regionDrag.x}px`, top: `${regionDrag.y}px`, width: `${regionDrag.width}px`, height: `${regionDrag.height}px` } })
                  : null,
              )
            : null,
          hover !== null && currentPending === null && hoverStyle !== null
            ? h('div', { className: 'dvs-hoverBox', style: hoverStyle }, h('span', { className: 'dvs-hoverTag', style: tagStyle }, hover.label))
            : null,
          currentPending !== null
            ? h(
                'div',
                { className: 'dvs-popover', style: popoverPosition(currentPending), role: 'dialog', 'aria-label': t('notePlaceholder') },
                h(
                  'div',
                  { className: 'dvs-popHead' },
                  h('span', { className: 'dvs-popBadge' }, `#${currentPending.id}`),
                  h('span', { className: 'dvs-popLabel' }, currentPending.label || currentPending.selector),
                  h('span', { className: 'dvs-popMode' }, currentPending.platformMode),
                  h('button', { type: 'button', className: 'dvs-popCancel', title: t('cancel'), 'aria-label': t('cancel'), onClick: cancelPending }, '\u00d7'),
                ),
                h('textarea', {
                  ref: noteRef,
                  className: 'dvs-note',
                  value: noteDraft,
                  placeholder: t('notePlaceholder'),
                  onChange: (event) => setNoteDraft(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendPending();
                    } else if (event.key === 'Escape') {
                      event.preventDefault();
                      cancelPending();
                    }
                  },
                }),
                h(
                  'div',
                  { className: 'dvs-popActions' },
                  h('button', { type: 'button', className: 'dvs-btn', onClick: queuePending }, t('queuePin')),
                  h('button', { type: 'button', className: 'dvs-btn dvs-btnPrimary', onClick: sendPending }, t('sendOne')),
                ),
              )
            : null,
        );
      };

      const renderViewport = () => {
        const content = h('div', { className: 'dvs-content', ref: contentRef }, renderContent());
        const scaleStyle = responsive
          ? { width: '100%', height: '100%', transform: 'none' }
          : { width: `${metrics.width}px`, height: `${metrics.height}px`, transform: `scale(${scale})` };
        const viewportNode = h(
          'div',
          { className: 'dvs-viewport', style: responsive ? { width: '100%', height: '100%' } : { width: `${displayWidth}px`, height: `${displayHeight}px` } },
          h('div', { className: 'dvs-scale', style: scaleStyle }, content),
          renderOverlay(),
        );
        if (responsive) return h('div', { className: 'dvs-responsiveHost' }, viewportNode);
        if (platformMode === 'mobile') {
          return h(
            'div',
            { className: 'dvs-phoneFrame', style: { width: `${displayWidth + 16}px`, height: `${displayHeight + 22}px` } },
            h('span', { className: 'dvs-speaker', 'aria-hidden': true }),
            viewportNode,
          );
        }
        if (platformMode === 'tablet') {
          return h(
            'div',
            { className: 'dvs-tabletFrame', style: { width: `${displayWidth + 24}px`, height: `${displayHeight + 22}px` } },
            h('span', { className: 'dvs-tabletCam', 'aria-hidden': true }),
            viewportNode,
          );
        }
        return h(
          'div',
          { className: 'dvs-desktopFrame', style: { width: `${displayWidth}px`, height: `${displayHeight + 32}px` } },
          h(
            'div',
            { className: 'dvs-desktopBar' },
            h('span', { className: 'dvs-traffic', 'aria-hidden': true }, h('i', { className: 'r' }), h('i', { className: 'y' }), h('i', { className: 'g' })),
            h('span', { className: 'dvs-desktopTitle' }, source?.title || t('frameTitle')),
            h('span', { className: 'dvs-desktopSpacer', 'aria-hidden': true }),
          ),
          viewportNode,
        );
      };

      const renderQueue = () => {
        if (queued.length === 0) return null;
        return h(
          'div',
          { className: 'dvs-queue' },
          h(
            'button',
            { type: 'button', className: 'dvs-queueHead', 'aria-expanded': queueOpen ? 'true' : 'false', onClick: () => setQueueOpen((value) => !value) },
            h('span', { className: 'dvs-chevron', 'data-open': queueOpen ? 'true' : 'false', 'aria-hidden': true }, '\u203a'),
            h('span', { className: 'dvs-queueTitle' }, t('queueTitle')),
            h('span', { className: 'dvs-count' }, String(queued.length)),
          ),
          queueOpen
            ? h(
                'div',
                { className: 'dvs-queueList' },
                queued.map((annotation) =>
                  h(
                    'div',
                    { key: annotation.id, className: 'dvs-ann' },
                    h('span', { className: 'dvs-annBadge' }, `#${annotation.id}`),
                    h(
                      'span',
                      { className: 'dvs-annBody' },
                      h(
                        'span',
                        { className: 'dvs-annSel' },
                        h('span', { className: 'dvs-platformTag' }, annotation.platformMode),
                        h('span', { className: 'dvs-annSelText', title: annotation.selector }, annotation.selector),
                        annotation.sent === true ? h('span', { className: 'dvs-sentTag' }, t('sent')) : null,
                      ),
                      annotation.note.length > 0 ? h('span', { className: 'dvs-annNote' }, annotation.note) : null,
                    ),
                    h('button', { type: 'button', className: 'dvs-annDel', title: t('remove'), 'aria-label': `${t('remove')} #${annotation.id}`, onClick: () => removeAnnotation(annotation.id) }, '\u00d7'),
                  ),
                ),
              )
            : null,
        );
      };

      const empty = source === null || (source.kind === 'file' && rawHtml === null && status !== 'ready');
      return h(
        'section',
        { className: 'dvs-root', 'aria-label': t('tabTitle'), 'data-dark': dark ? 'true' : 'false' },
        renderToolbar(),
        notice !== null
          ? h('div', { className: 'dvs-notice', 'data-kind': notice.kind, role: notice.kind === 'error' ? 'alert' : 'status' }, notice.text)
          : null,
        selectionHint !== null ? h('div', { className: 'dvs-hint' }, selectionHint) : null,
        h(
          'div',
          { className: 'dvs-stageBox' },
          h(
            'div',
            { className: 'dvs-canvasCard', ref: stageRef },
            h(
              'div',
              { className: 'dvs-studio', 'data-manual': manual ? 'true' : 'false', 'data-scroll': scrollable ? 'true' : 'false' },
              empty
                ? h(
                    'div',
                    { className: 'dvs-readyCard' },
                    h(ReadyArt),
                    h('h3', null, status === 'loading' ? t('loading') : t('visualReady')),
                    h('p', null, status === 'loading' ? (draft || t('loading')) : t('visualReadyBody')),
                  )
                : responsive
                  ? renderViewport()
                  : h('div', { className: 'dvs-frameHost', style: frameHostStyle }, renderViewport()),
            ),
          ),
        ),
        renderQueue(),
      );
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'connection'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN }), 'visual-sandbox: locale');
        const t = ctx.locale.bind(NS);
        sidebarService = ctx.sidebarRight;
        try {
          connectionService = ctx.get('connection') ?? null;
        } catch (error) {
          connectionService = null;
        }
        try {
          rpcCall = connectionService?.rpc?.call === undefined ? null : connectionService.rpc.call.bind(connectionService.rpc);
        } catch (error) {
          rpcCall = null;
        }

        ctx.effect(() => {
          const element = document.createElement('style');
          element.setAttribute('data-dsh-plugin', 'visual-sandbox');
          element.textContent = CSS;
          document.head.append(element);
          return () => element.remove();
        }, 'visual-sandbox: styles');

        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: ID,
              kind: KIND,
              multiple: false,
              priority: 'extension',
              title: () => t('tabTitle'),
              guide: [
                {
                  id: 'open',
                  order: 45,
                  title: () => t('tabTitle'),
                  description: () => t('guideDescription'),
                  icon: SparkleGlyph,
                },
              ],
            }),
          'visual-sandbox: tab type',
        );

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab', () =>
              ctx.slots.register({ name: 'sidebar.right.pane.tab', key: ID, locale: NS }, VisualSandboxBody),
            ),
          'visual-sandbox: tab body',
        );

        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab.title', () =>
              ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: ID, locale: NS }, VisualSandboxTitle),
            ),
          'visual-sandbox: tab title',
        );

        ctx.effect(
          () =>
            ctx.slots.inject('conversation.session.header.utilities', () =>
              ctx.slots.register(
                {
                  name: 'conversation.session.header.utilities',
                  id: 'visual-sandbox',
                  order: -40,
                  locale: NS,
                  label: () => t('openAction'),
                  inject: () => ({
                    openSandbox: () => {
                      ctx.sidebarRight.openTab(KIND);
                    },
                  }),
                },
                OpenSandboxButton,
              ),
            ),
          'visual-sandbox: toolbar entry',
        );

        // The panel is the point of the plugin, so it opens itself once a Session is
        // on screen. A later close is the user's choice and is not overridden.
        ctx.effect(() => {
          let settled = false;
          const attempt = () => {
            if (settled) return;
            try {
              const mounted = ctx.sidebarRight?.mounted?.getSnapshot?.();
              if (typeof mounted !== 'string' || mounted.length === 0) return;
              ctx.sidebarRight.openTab(KIND);
              ensureExpanded(ctx.sidebarRight);
              settled = true;
            } catch (error) {
              settled = false;
            }
          };
          attempt();
          const timer = window.setInterval(attempt, 900);
          return () => window.clearInterval(timer);
        }, 'visual-sandbox: default open');
      },
    };
  },
});
