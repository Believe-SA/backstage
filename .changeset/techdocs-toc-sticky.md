---
'@backstage/plugin-techdocs': patch
---

Fixed the TechDocs reader layout so the navigation and table of contents stay in view beside the documentation as you scroll, a long navigation tree no longer covers the Previous and Next links, and the footer bar links are clickable again.

In browsers without support for scroll-driven CSS animations, the Previous and Next links stay at the end of the page instead of following you down it, so the navigation still has room to display in full.
