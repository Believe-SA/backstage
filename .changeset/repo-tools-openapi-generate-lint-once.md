---
'@backstage/repo-tools': patch
---

The `package schema openapi generate` command no longer needs Yarn to apply lint fixes to the generated code, since it now runs the Backstage CLI installed in your project directly. Server generation lints and formats the generated files in a single pass instead of two. Client generation now removes duplicate imports before the generated files are linted and formatted.
