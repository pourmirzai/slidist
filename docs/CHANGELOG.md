[2025-12-03] - Fixed cover slide image display issue

Changed Files:
- js/slideGenerator.js

Changes:
- Fixed property name mismatch that prevented author's photo and cover background from displaying on title slides.
- Corrected `bgImage` and `authImage` references to match actual ImageHandler properties (`backgroundImage` and `authorImage`).

[2025-12-03] - Critical Bug Fixes and UI/UX Improvements

Changed Files:
- sw.js
- index.html
- js/utils.js
- js/slideGenerator.js
- js/textProcessor.js
- js/storage.js
- docs/memory.md
- docs/CHANGELOG.md

Changes:
- Resolved all console errors (SW registration, favicon 404, image upload TypeError).
- Completely removed broken export settings functionality.
- Fixed critical bug in slide pagination/text fitting.
- Restored preview lightbox functionality.
- Reordered UI: Title slide is now the first tab.
- Added content statistics (word count, slide count, etc.) to the preview section.
- Fixed color theme loading/application.
- Relocated bullet point settings to the Design tab.
- Created and populated `docs/memory.md` with critical learnings.