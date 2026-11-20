---
'@backstage/plugin-auth-backend': patch
---

Confidential clients, which authenticate with a `clientSecret`, now keep the same refresh token instead of getting a new one on every refresh. This fixes clients such as MCP gateways that refresh concurrently with the same token, where all but the first request failed with `invalid_grant`. Public clients still get a new refresh token on every refresh.
