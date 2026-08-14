---
'@backstage/plugin-techdocs': patch
---

Fix TechDocs reader layout so the navigation and table of contents sit beside the documentation column on wide screens and stay in view while scrolling, instead of being pinned to the viewport and repositioned from JavaScript. On narrow screens the navigation keeps its slide-out drawer behaviour.

**BREAKING** The documentation footer is no longer pinned to the bottom of the viewport, so the Previous and Next links now sit at the end of the page rather than always being on screen. Custom reader styling that relied on the navigation, table of contents or footer being fixed to the viewport will need updating.

The footer, footer meta and navigation title no longer paint their own background, so they take on the colour of whatever page the reader is embedded in.

Fixed a malformed rule in the generated reader stylesheet that silently discarded the rule that followed it, so the reader body font and the keyboard-key colours now follow the Backstage theme.
