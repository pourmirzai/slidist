[ERR-001] 🔴 | DevOps | SW registration failed
Root Cause: Incomplete/malformed sw.js
Solution: Complete rewrite of sw.js with proper PWA structure
Impact: PWA service worker now registers correctly, enabling offline functionality
Date: 2025-12-03
Files: sw.js

[ERR-002] 🔴 | Code-Quality | Image upload TypeError: Cannot read properties of undefined (reading 'includes')
Root Cause: Missing null/undefined checks on file and file.type in isValidImageType and incorrect config property reference
Solution: Added robust checks in js/utils.js and corrected config key
Impact: Image uploads now work without errors, improving user experience
Date: 2025-12-03
Files: js/utils.js

[ERR-003] 🔴 | Code-Quality | Broken pagination (all content on one slide)
Root Cause: CONFIG.SLIDE_SIZE was undefined, leading to maxContentHeight being NaN
Solution: Corrected logic in js/textProcessor.js to use CONFIG.SLIDE_FORMATS[settings.format] for slide dimensions
Impact: Pagination now works correctly, displaying content properly across slides
Date: 2025-12-03
Files: js/textProcessor.js

[AVOID-001] ❌ Theme selector UI failure
Why Failed: JS-generated DOM structure in setupThemeSelector did not match the CSS selectors/expectations
Alternative: Always verify JS-generated DOM structure against expected CSS/HTML
Files: js/slideGenerator.js
Date: 2025-12-03