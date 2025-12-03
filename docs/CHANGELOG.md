[2025-12-03] - Added reading time display on cover slide

Changed Files:
- js/utils.js
- js/slideGenerator.js

Changes:
- Added `calculateReadingTime` utility function to calculate approximate reading time based on 200 WPM
- Modified `drawTitleSlide` method to accept and display reading time on the cover slide
- Integrated reading time calculation in `previewSlides` method before generating the title slide
- Reading time is displayed below the subtitle (or title if no subtitle) with a book emoji icon

[2025-12-03] - Removed Advanced section from application

Changed Files:
- index.html
- js/config.js

Changes:
- Completely removed the "Advanced" tab and all its UI components from the application
- Removed the "Advanced" tab button from the navigation
- Removed the "Content Statistics" section that displayed word count, reading time, and slide count
- Removed the "Settings Management" section that included import/export and clear settings functionality
- Removed JavaScript event listeners for updating content stats in real-time
- Added missing STORAGE_KEY to CONFIG object for proper storage functionality
- Application now has 4 tabs instead of 5: Title, Content, Design, and Help
- All remaining functionality preserved and working correctly

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