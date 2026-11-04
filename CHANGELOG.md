# Changelog

All notable changes to Visual Sandbox are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
