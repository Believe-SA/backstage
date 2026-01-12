/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import os from 'os';

export type ParallelismOption = boolean | string | number | null | undefined;

type GetDefaultParallelismOptions = {
  envVar?: string;
  envValue?: ParallelismOption;
  explicitParallelism?: ParallelismOption;
  clampForCi?: boolean;
  ciMax?: number;
  warnOnClamp?: (message: string) => void;
};

const DEFAULT_ENV_VAR = 'BACKSTAGE_CLI_BUILD_PARALLEL';
const DEFAULT_CI_MAX = 16;

/**
 * Coerce a parallelism option (env string/boolean/number) to a positive integer.
 */
export function parseParallelismOption(
  parallel: ParallelismOption,
  defaultParallelism: number,
): number {
  if (parallel === undefined || parallel === null) {
    return defaultParallelism;
  }
  if (typeof parallel === 'boolean') {
    return parallel ? defaultParallelism : 1;
  }
  if (typeof parallel === 'number') {
    if (!Number.isInteger(parallel) || parallel < 1) {
      throw Error(
        `Parallel option value '${parallel}' is not a boolean or integer`,
      );
    }
    return parallel;
  }
  if (typeof parallel === 'string') {
    if (parallel === 'true') {
      return parseParallelismOption(true, defaultParallelism);
    }
    if (parallel === 'false') {
      return parseParallelismOption(false, defaultParallelism);
    }
    const parsed = Number(parallel);
    if (Number.isInteger(parsed)) {
      return parseParallelismOption(parsed, defaultParallelism);
    }
  }

  throw Error(
    `Parallel option value '${parallel}' is not a boolean or integer`,
  );
}

/**
 * Compute a default parallelism based on available CPUs and optional overrides.
 */
export function getDefaultParallelism(
  options: GetDefaultParallelismOptions = {},
) {
  const {
    envVar = DEFAULT_ENV_VAR,
    envValue = process.env[envVar],
    explicitParallelism,
    clampForCi = true,
    ciMax = DEFAULT_CI_MAX,
    warnOnClamp = message => console.warn(message),
  } = options;

  const base = Math.max(Math.ceil(os.availableParallelism() / 2), 1);
  let parallelism: number;
  if (explicitParallelism !== undefined && explicitParallelism !== null) {
    parallelism = parseParallelismOption(explicitParallelism, base);
  } else if (envValue !== undefined) {
    parallelism = parseParallelismOption(envValue, base);
  } else {
    parallelism = base;
  }

  if (
    envValue === undefined &&
    explicitParallelism === undefined &&
    clampForCi &&
    isCi() &&
    parallelism > ciMax
  ) {
    warnOnClamp(
      `Clamped default parallelism to ${ciMax} in CI. Set ${envVar} to override.`,
    );
    return ciMax;
  }

  return parallelism;
}

/**
 * Apply a factor to a base parallelism to derive worker count.
 */
export function applyParallelismFactor(parallelism: number, factor = 1) {
  const effective = Math.max(Math.floor(parallelism * factor), 1);
  return effective;
}

function isCi() {
  const value = process.env.CI;
  if (!value) {
    return false;
  }
  return value !== '0' && value.toLowerCase() !== 'false';
}
