---
'@backstage/plugin-techdocs': patch
---

Fix TechDocs reader layout so the navigation and table of contents sit beside the documentation column on wide screens and stay in view while scrolling, instead of being pinned to the viewport and repositioned from JavaScript. On narrow screens the navigation keeps its slide-out drawer behaviour.

Fixed a malformed rule in the generated reader stylesheet that silently dropped part of it, so the documentation footer background and keyboard-key colours now follow the Backstage theme.
