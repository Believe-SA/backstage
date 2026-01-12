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
import {
  applyParallelismFactor,
  getDefaultParallelism,
  parseParallelismOption,
} from './parallelism';

describe('parseParallelismOption', () => {
  const defaultParallelism = 8;

  it('coerces boolean and nullish to defaults', () => {
    expect(parseParallelismOption(true, defaultParallelism)).toBe(
      defaultParallelism,
    );
    expect(parseParallelismOption(false, defaultParallelism)).toBe(1);
    expect(parseParallelismOption(null, defaultParallelism)).toBe(
      defaultParallelism,
    );
    expect(parseParallelismOption(undefined, defaultParallelism)).toBe(
      defaultParallelism,
    );
  });

  it('coerces number and numeric string', () => {
    expect(parseParallelismOption(3, defaultParallelism)).toBe(3);
    expect(parseParallelismOption('4', defaultParallelism)).toBe(4);
  });

  it('rejects invalid inputs', () => {
    expect(() => parseParallelismOption('on', defaultParallelism)).toThrow(
      "Parallel option value 'on' is not a boolean or integer",
    );
    expect(() => parseParallelismOption(2.5, defaultParallelism)).toThrow(
      "Parallel option value '2.5' is not a boolean or integer",
    );
    expect(() => parseParallelismOption('2.5', defaultParallelism)).toThrow(
      "Parallel option value '2.5' is not a boolean or integer",
    );
  });
});

describe('applyParallelismFactor', () => {
  it('applies factor with floor and minimum of 1', () => {
    expect(applyParallelismFactor(8, 0.5)).toBe(4);
    expect(applyParallelismFactor(1, 0.5)).toBe(1);
    expect(applyParallelismFactor(4, 0)).toBe(1);
  });
});

describe('getDefaultParallelism', () => {
  const originalEnv = process.env.BACKSTAGE_CLI_BUILD_PARALLEL;
  const originalCi = process.env.CI;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.BACKSTAGE_CLI_BUILD_PARALLEL;
    } else {
      process.env.BACKSTAGE_CLI_BUILD_PARALLEL = originalEnv;
    }
    if (originalCi === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = originalCi;
    }
  });

  it('uses half of availableParallelism by default', () => {
    const expected = Math.max(Math.ceil(os.availableParallelism() / 2), 1);
    expect(getDefaultParallelism()).toBe(expected);
  });

  it('honors explicit override', () => {
    expect(
      getDefaultParallelism({
        explicitParallelism: 3,
      }),
    ).toBe(3);
  });

  it('honors env override', () => {
    process.env.BACKSTAGE_CLI_BUILD_PARALLEL = '5';
    expect(getDefaultParallelism()).toBe(5);
  });

  it('clamps in CI when env is unset', () => {
    process.env.CI = 'true';
    const warned: string[] = [];
    const value = getDefaultParallelism({
      ciMax: 2,
      warnOnClamp: msg => warned.push(msg),
    });
    expect(value).toBe(2);
    expect(warned.length).toBe(1);
  });

  it('does not clamp when env override is set', () => {
    process.env.CI = 'true';
    process.env.BACKSTAGE_CLI_BUILD_PARALLEL = '6';
    const value = getDefaultParallelism({
      ciMax: 2,
      warnOnClamp: () => {
        throw new Error('should not warn');
      },
    });
    expect(value).toBe(6);
  });
});
