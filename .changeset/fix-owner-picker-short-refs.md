---
'@backstage/plugin-catalog-react': patch
---

Fixed the catalog owner filter silently ignoring owner refs that omit the kind, such as `team-a`. Opening such a link showed unfiltered results and dropped the filter from the URL. The ref is now resolved as a group and the filter is applied.
