---
'@backstage/plugin-catalog-import': patch
---

The catalog-import API now loads `@octokit/rest` and `yaml` when submitting a pull request, instead of including them in the initial bundle.
