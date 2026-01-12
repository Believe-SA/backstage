# @backstage/cli-node

This library provides utilities for building CLI tools for Backstage.

The difference between this library and `@backstage/cli-common` is that this library is more feature rich with a larger dependency tree, with less concern for bundle size and installation speed. The `@backstage/cli-common` package on the other hand is intended to be extremely slim and only provide minimal features for use in tools like `@backstage/create-app`.

## Documentation

- [Backstage Readme](https://github.com/backstage/backstage/blob/master/README.md)
- [Backstage Documentation](https://backstage.io/docs)

## Parallelism helper

For build/lint/packaging commands, prefer the shared helper from `@backstage/cli-common`:

```ts
import {
  getDefaultParallelism,
  applyParallelismFactor,
} from '@backstage/cli-common';

const base = getDefaultParallelism({
  envVar: 'BACKSTAGE_CLI_BUILD_PARALLEL', // env override (false|true|int)
  clampForCi: true, // applies a modest cap in CI when env is unset
});
const workers = applyParallelismFactor(base, 0.5); // e.g. repo build uses 0.5
```

Common factors today:

- repo build: `0.5`
- versions:bump: `4`
- lint: `min(envParallelism, items.length)` (worker_threads)

For CI, set `BACKSTAGE_CLI_BUILD_PARALLEL` explicitly (e.g. `=2`) to avoid oversubscription. Future CLI flags (e.g. `--max-threads`) can feed into `explicitParallelism` on the helper.
