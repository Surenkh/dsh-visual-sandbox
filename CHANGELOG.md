# Changelog

All notable changes to Visual Sandbox are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-11-06

### Changed

- **Studio header redesign.** The panel now opens on a three-field header — **Device & Type**,
  **Version**, and **Source (Workspace or URL)** — with an **Inspect / Edit UI / Select** action
  row and a DeepSeek-blue **Send All** button. The previous sparkle mark is restored in the
  panel title and the chat header.
- **DeepSeek blue accent.** Active controls, focus rings, hover highlight, Send All, platform
  tags and the empty-state illustration now use DeepSeek blue instead of purple.
- **Integrated dropdown fields.** Device & Type and Version render their selected value inside
  the same bordered field as Source; the native select is an invisible full-field overlay, so
  the whole control is clickable and the text no longer sits in a separate native box.
- **Preview scale.** Fixed frames can now be shown at Fit, 50%, 75%, 100%, 110%, 120%, 125%,
  150% or 200%. Above the available canvas the studio pans and scrolls, which makes the Mobile
  frame comfortable to inspect at actual size or closer. Responsive stays full-bleed.
- **Desktop transport fix.** The panel state, source, version history and annotation sync now
  travel over the Connection RPC bridge. The desktop renderer runs from `dsh-app://`, so its
  same-origin HTTP fetch could not reach the Host routes and the workbench previously stayed
  empty; the same Host operations are now dispatched through the authenticated carrier.
- **Connection readiness.** Both halves declare `connection` as a dependency. The bridge no
  longer depends on the service happening to be ready when the panel's `apply` runs, which
  removes the intermittent 404/empty workbench after a restart.
- **Source fallback.** If the saved preview path cannot be rendered, the panel clears it and
  loads the newest discovered file, and a boot-time discovery that finds a newer workspace
  file supersedes an older saved source. A missing file now returns a precise 404 instead of a
  generic size error.
- **Fit to width, centered.** Fit used the smaller of width and height, so a tall Mobile frame
  shrank to roughly two thirds and a Desktop frame wasted vertical space. Fixed frames now fit
  the available width, scroll vertically, and stay centered until they genuinely overflow.
- **Dotted studio canvas.** The preview lives in a rounded, dotted canvas card with a centered
  **Visual Sandbox Ready** card (browser/code illustration, title and guidance) before a source
  loads.
- **Version defaults to latest.** Workspace files list their real render history, newest first,
  with the latest selected by default. With no history the field is disabled and shows
  **Latest**.
- **Select tool.** The control now offers only **Element** and **Region**, with **Element** as
  the default and clear hints when element inspection is unavailable.

### Notes

- The reference layout's **Bulk** control and bottom **Screenshots** strip are intentionally
  not part of the studio; the header, canvas, and empty state are the visual model.

### Added

- **Version history** — every distinct render of a preview file is snapshotted on the
  Host (sha-256 deduped, 8 versions / 8 MB per Session). A `Version` dropdown under the
  source bar flips the preview between them instantly, without touching disk.
- The version list travels in the state payload, so the dropdown survives a panel
  remount and follows agent-triggered renders.

### Changed

- **The composer `Preview` button is gone.** The header sparkle is now the single
  control: it opens the panel, and closes it when the panel is showing.

### Fixed

- Opening the panel always lands on the newest preview for the Session instead of
  restoring a stale source, and an empty workbench auto-loads the newest workspace file.

## [1.2.0] - 2026-11-05

### Added

- **Composer `Preview` button** — a toggle in the chat input row that reveals or
  hides the right-hand panel. It reads the real sidebar state, so closing the tab
  by hand clears its pressed state too.
- **Open by default** — the panel opens itself once a Session is on screen. If you
  close it, it stays closed; the button is the force-open path.
- `ensureExpanded()` guards every open intent so a newly opened tab cannot land in
  a collapsed column.

### Fixed

- **Edit UI was inert.** The injected inspector was emitted as a bare function
  declaration (`function inspectorMain() { … }`) and therefore never executed. The
  frame never announced itself, edit mode silently fell back to region dragging,
  and hovering or clicking a block did nothing. The script is now emitted as an
  invoked IIFE.

## [1.1.0] - 2026-11-04

### Added

- Four preview frames: Responsive, Mobile (390 × 844), Tablet (768 × 1024) and
  Desktop (1024 × 720), with per-frame annotations.
- Fit / 50% / 75% / 100% zoom, manual panning and the Expand Narrow Containers helper.
- `Edit UI` / `Interact` modes, hover outlines with selector tags, and a pin popover
  per annotation.
- Host tools `open_visual_sandbox`, `get_visual_annotations`,
  `clear_visual_annotations` and `refresh_visual_sandbox`.
- A per-agent prompt section that carries annotations plus the surgical-edit rule.

## [1.0.0] - 2026-11-03

### Added

- First working version: workspace HTML preview, element inspection, annotation
  queue and `Send All` into the chat composer.
