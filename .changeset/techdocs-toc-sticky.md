---
'@backstage/plugin-techdocs': patch
---

Fix TechDocs reader layout so the navigation and table of contents sit beside the documentation column on wide screens and stay in view while scrolling, instead of being pinned to the viewport and repositioned from JavaScript. On narrow screens the navigation keeps its slide-out drawer behaviour.

The Previous and Next links stay at the bottom of the screen while you read and settle at the end of the page once you reach it, as before, but the reader no longer needs JavaScript to size and position them. Links and icons in the footer bar below them are now clickable; previously they were not.

**BREAKING** Custom reader styling that relied on the navigation, table of contents or footer being fixed to the viewport will need updating.

The navigation title and the bar below the Previous and Next links no longer paint their own background, so they take on the colour of whatever page the reader is embedded in.

Fixed a malformed rule in the generated reader stylesheet that silently discarded the rule that followed it, so the reader body font and the keyboard-key colours now follow the Backstage theme.
