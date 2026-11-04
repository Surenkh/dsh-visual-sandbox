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
      edit: 'Edit UI',
      editTitle: 'Select UI blocks to change',
      interactTitle: 'Use the preview normally',
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
      trigger: 'Preview',
      triggerShow: 'Show the Visual Sandbox panel',
      triggerHide: 'Hide the Visual Sandbox panel',
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
.dvs-trigger{display:inline-flex;align-items:center;gap:5px;height:30px;box-sizing:border-box;padding:0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;flex:none}
.dvs-trigger:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent)}
.dvs-trigger[data-active=true]{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}
.dvs-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dvs-triggerText{display:inline;max-width:72px;overflow:hidden;text-overflow:ellipsis}
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
.dvs-titleRow{display:inline-flex;align-items:center;gap:5px;min-width:0;overflow:hidden}
.dvs-titleIcon{flex:none;opacity:.9}
.dvs-titleText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
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

    /** GET JSON. */
    async function getJson(path) {
      try {
        const response = await fetch(endpointFor(path), { method: 'GET', headers: { accept: 'application/json' }, cache: 'no-store', signal: deadline() });
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
        const response = await fetch(endpointFor(path), {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store',
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

    /** Header entry. */
    function OpenSandboxButton(props) {
      const t = props.t;
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
      return h(
        'button',
        {
          type: 'button',
          className: 'dvs-btn',
          title: t('openTitle'),
          'aria-label': t('openTitle'),
          onClick: () => {
            try {
              props.openSandbox();
            } catch (error) {
              console.error('[visual-sandbox] panel open failed', error);
            }
          },
        },
        h(SparkleGlyph, { size: 14 }),
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

    /** Chat-composer entry: reveal or hide the right panel. */
    function SandboxToggle(props) {
      const t = props.t;
      const given = typeof props.sessionId === 'string' ? props.sessionId : '';
      const [visible, setVisible] = React.useState(false);

      const currentSession = () => {
        if (given.length > 0) return given;
        const mounted = sidebarService?.mounted?.getSnapshot?.();
        return typeof mounted === 'string' ? mounted : '';
      };

      const isVisible = () => {
        const sidebar = sidebarService;
        const sessionId = currentSession();
        if (sidebar === null || sessionId.length === 0) return false;
        try {
          const mine = sidebar.tabsIn(sessionId).filter((tab) => tab.kind === KIND);
          return mine.length > 0 && sidebar.isExpanded();
        } catch (error) {
          return false;
        }
      };

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
      }, [given]);

      const toggle = () => {
        const sidebar = sidebarService;
        const sessionId = currentSession();
        if (sidebar === null || sessionId.length === 0) return;
        try {
          const mine = sidebar.tabsIn(sessionId).filter((tab) => tab.kind === KIND);
          if (mine.length > 0) sidebar.toggleExpanded();
          else {
            sidebar.openTab(KIND);
            ensureExpanded(sidebar);
          }
        } catch (error) {
          console.error('[visual-sandbox] panel toggle failed', error);
        }
        window.setTimeout(() => setVisible(isVisible()), 140);
      };

      const title = visible ? t('triggerHide') : t('triggerShow');
      return h(
        'button',
        {
          type: 'button',
          className: 'dvs-trigger',
          'data-active': visible ? 'true' : 'false',
          'aria-pressed': visible ? 'true' : 'false',
          title,
          'aria-label': title,
          onClick: toggle,
        },
        h(SparkleGlyph, { size: 13 }),
        h('span', { className: 'dvs-triggerText' }, t('trigger')),
      );
    }

    /** Tab title. */
    function VisualSandboxTitle(props) {
      return h('span', { className: 'dvs-titleRow' },
        h(SparkleGlyph, { size: 13, className: 'dvs-titleIcon' }),
        h('span', { className: 'dvs-titleText' }, props.t('tabTitle')));
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
      const [platformMode, setPlatformMode] = React.useState('web');
      const [zoom, setZoom] = React.useState('fit');
      const [expand, setExpand] = React.useState(false);
      const [rawHtml, setRawHtml] = React.useState(null);
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
      const skipSync = React.useRef(false);
      const seq = React.useRef({ refresh: null, clear: null, open: null, mode: null });
      const booted = React.useRef(false);

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
      const availableHeight = Math.max(80, stageSize.height - 32 - chrome.height);
      const fitScale = metrics === null
        ? 1
        : Math.min(1, Math.max(0.1, availableWidth / metrics.width), Math.max(0.1, availableHeight / metrics.height));
      const scale = metrics === null ? 1 : zoom === 'fit' ? fitScale : Number(zoom) || 1;
      const manual = metrics !== null && zoom !== 'fit';
      const displayWidth = metrics === null ? contentSize.width : metrics.width * scale;
      const displayHeight = metrics === null ? contentSize.height : metrics.height * scale;
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
      const loadFile = async (path, options = {}) => {
        const clean = String(path ?? '').replace(/\\/gu, '/').replace(/^\.?\//u, '').trim();
        if (clean.length === 0) return false;
        setStatus('loading');
        setRawHtml(null);
        setFrameReady(false);
        setInspectorMissing(false);
        setHover(null);
        setPinBoxes({});
        const response = await postJson(ROUTE_RENDER, { sessionId: live.current.sessionId, root: workspaceRoot, path: clean });
        if (response === null || response.ok !== true) {
          setStatus('error');
          notify('error', response?.error ?? t('loadFailed'));
          return false;
        }
        adoptSource({ kind: 'file', value: response.path, title: response.title }, options);
        setDraft(response.path);
        setRawHtml(response.html);
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
        let cancelled = false;
        const boot = async () => {
          const remote = await getJson(`${ROUTE_STATE}?sessionId=${encodeURIComponent(sessionId)}`);
          if (cancelled) return;
        let hasInitialSource = false;
          if (remote !== null && remote.ok === true) {
            seq.current = {
              refresh: remote.refreshSeq ?? 0,
              clear: remote.clearSeq ?? 0,
              open: remote.openSeq ?? 0,
              mode: remote.modeSeq ?? 0,
            };
            if (MODE_IDS.includes(remote.platformMode)) setPlatformMode(remote.platformMode);
            if (remote.zoom === 'fit' || remote.zoom === '0.5' || remote.zoom === '0.75' || remote.zoom === '1') setZoom(remote.zoom);
            if (typeof remote.expandContainers === 'boolean') setExpand(remote.expandContainers);
            const restored = remote.source;
            if (restored !== null && typeof restored === 'object') {
              hasInitialSource = true;
              skipSync.current = true;
              setSource(restored);
              setDraft(restored.value);
              if (Array.isArray(remote.annotations)) {
                live.current.annotations = remote.annotations;
                setAnnotations(remote.annotations);
              }
              if (restored.kind === 'file') {
                void loadFile(restored.value, { preserve: true });
              } else if (restored.kind === 'url') {
                setReloadKey((value) => value + 1);
                setStatus('ready');
              }
            }
          }
          const found = await discover();
          if (cancelled) return;
          if (!booted.current && !hasInitialSource && live.current.source === null && found.length > 0) {
            booted.current = true;
            void loadFile(found[0].path, { preserve: true });
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
          if (seq.current.refresh === null) {
            seq.current = { refresh: remote.refreshSeq ?? 0, clear: remote.clearSeq ?? 0, open: remote.openSeq ?? 0, mode: remote.modeSeq ?? 0 };
            return;
          }
          if (typeof remote.modeSeq === 'number' && remote.modeSeq > seq.current.mode) {
            seq.current.mode = remote.modeSeq;
            settlePending();
            if (MODE_IDS.includes(remote.platformMode)) setPlatformMode(remote.platformMode);
            if (remote.zoom === 'fit' || remote.zoom === '0.5' || remote.zoom === '0.75' || remote.zoom === '1') setZoom(remote.zoom);
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
            { __dshVisualSandbox: true, type: 'mode', edit: mode === 'edit' && (source?.kind === 'file') && !inspectorMissing },
            '*',
          );
          const pins = pinList().map((pin) => ({ id: pin.id, selector: pin.selector }));
          frame.contentWindow.postMessage({ __dshVisualSandbox: true, type: 'pins', pins }, '*');
        } catch (error) {}
      }, [mode, frameReady, reloadKey, platformMode, annotations.length]);

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
      const regionEnabled = mode === 'edit' && source !== null && (source.kind === 'url' || (source.kind === 'file' && inspectorMissing));
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

      const renderToolbar = () => {
        const fixed = metrics;
        const meta = responsive
          ? `${Math.max(0, Math.round(contentSize.width))} x ${Math.max(0, Math.round(contentSize.height))} | 100%`
          : `${viewport.width} x ${viewport.height} | ${Math.round(scale * 100)}%`;
        return h(
          'div',
          { className: 'dvs-toolbar' },
          h(
            'div',
            { className: 'dvs-topRow' },
            h(
              'div',
              { className: 'dvs-modes', role: 'group', 'aria-label': t('platformLabel') },
              MODES.map((entry) =>
                h(
                  'button',
                  {
                    key: entry.id,
                    type: 'button',
                    'data-active': platformMode === entry.id ? 'true' : 'false',
                    'aria-pressed': platformMode === entry.id ? 'true' : 'false',
                    title: `${entry.label} - ${entry.size}`,
                    onClick: () => setModeAndSync(entry.id),
                  },
                  h(ViewportGlyph, { id: entry.icon }),
                  entry.label,
                ),
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dvs-expand',
                'data-active': expand ? 'true' : 'false',
                'aria-pressed': expand ? 'true' : 'false',
                disabled: !canExpand || !expandAvailable,
                title: !expandAvailable ? t('expandUnavailable') : t('expandTitle'),
                onClick: () => setExpand((value) => !value),
              },
              h(ExpandGlyph),
              t('expand'),
            ),
            h('span', { className: 'dvs-meta', title: `${fixed ? '' : 'Fluid'} ${meta}` }, meta),
          ),
          h(
            'div',
            { className: 'dvs-row' },
            h(
              'span',
              { className: 'dvs-sourceWrap' },
              h('input', {
                ref: sourceInputRef,
                list: 'dvs-preview-files',
                className: 'dvs-source',
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
              h('button', { type: 'button', className: 'dvs-sourceChevron', title: t('chooseFile'), 'aria-label': t('chooseFile'), onClick: openPicker }, h(ChevronGlyph)),
            ),
            h('datalist', { id: 'dvs-preview-files' }, files.map((file) => h('option', { key: file.path, value: file.path }))),
            h('button', { type: 'button', className: 'dvs-iconBtn', title: t('reload'), 'aria-label': t('reload'), onClick: reloadPreview }, h(ReloadGlyph)),
            h(
              'div',
              { className: 'dvs-editToggle', role: 'group', 'aria-label': t('modeLabel') },
              h('button', { type: 'button', 'data-active': mode === 'interact' ? 'true' : 'false', title: t('interactTitle'), onClick: () => setMode('interact') }, h(CursorGlyph), t('interact')),
              h('button', { type: 'button', 'data-active': mode === 'edit' ? 'true' : 'false', title: t('editTitle'), onClick: () => setMode('edit') }, h(SparkleGlyph, { size: 12 }), t('edit')),
            ),
            h(
              'button',
              { type: 'button', className: 'dvs-sendAll', title: t('sendAllTitle'), disabled: unsent.length === 0, onClick: sendAll },
              `${t('sendAll')} (${unsent.length})`,
            ),
          ),
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
        mode === 'edit' && source !== null && (source.kind === 'url' || inspectorMissing)
          ? h('div', { className: 'dvs-hint' }, source.kind === 'url' ? t('crossOriginHint') : t('inspectorMissing'))
          : null,
        h(
          'div',
          { className: 'dvs-stageBox', ref: stageRef },
          h(
            'div',
            { className: 'dvs-studio', 'data-manual': manual ? 'true' : 'false' },
            empty
              ? h(
                  'div',
                  { className: 'dvs-emptyCard' },
                  h('strong', null, status === 'loading' ? t('loading') : t('emptyPrompt')),
                  h('span', null, files.length === 0 && status !== 'loading' ? t('emptyNoFiles') : ''),
                )
              : responsive
                ? renderViewport()
                : h('div', { className: 'dvs-frameHost' }, renderViewport()),
          ),
        ),
        renderQueue(),
      );
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN }), 'visual-sandbox: locale');
        const t = ctx.locale.bind(NS);
        sidebarService = ctx.sidebarRight;

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
                  order: -27,
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

        ctx.effect(
          () =>
            ctx.slots.inject('conversation.input.right', () =>
              ctx.slots.register(
                {
                  name: 'conversation.input.right',
                  id: 'visual-sandbox-toggle',
                  order: -20,
                  locale: NS,
                  label: () => t('trigger'),
                },
                SandboxToggle,
              ),
            ),
          'visual-sandbox: composer toggle',
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
