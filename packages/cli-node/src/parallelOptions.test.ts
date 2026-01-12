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

import { Command } from 'commander';
import { addParallelOption, type ParallelOptionValues } from './parallelOptions';

describe('addParallelOption', () => {
  it('adds --parallel option to command', () => {
    const command = new Command();
    addParallelOption(command);

    const opts = command.parse(['--parallel', '4'], { from: 'user' }).opts();
    expect(opts.parallel).toBe('4');
  });

  it('adds custom help text with default env var', () => {
    const command = new Command();
    addParallelOption(command, { helpLabel: 'build parallelism' });

    const helpText = command.helpInformation();
    expect(helpText).toContain('--parallel <value>');
    expect(helpText).toContain('BACKSTAGE_CLI_BUILD_PARALLEL');
    expect(helpText).toContain('build parallelism');
  });

  it('adds custom help text with custom env var', () => {
    const command = new Command();
    addParallelOption(command, {
      envVar: 'CUSTOM_PARALLEL',
      helpLabel: 'custom parallelism',
    });

    const helpText = command.helpInformation();
    expect(helpText).toContain('CUSTOM_PARALLEL');
    expect(helpText).toContain('custom parallelism');
  });

  it('uses custom option description', () => {
    const command = new Command();
    addParallelOption(command, {
      optionDescription: 'Custom description for parallelism',
    });

    const helpText = command.helpInformation();
    expect(helpText).toContain('Custom description for parallelism');
  });

  it('does not return a value (void)', () => {
    const command = new Command();
    const result = addParallelOption(command);
    expect(result).toBeUndefined();
  });
});

describe('ParallelOptionValues', () => {
  it('extends OptionValues with parallel property', () => {
    const command = new Command();
    addParallelOption(command);

    const parsed = command.parse(['--parallel', '2'], { from: 'user' });
    const opts: ParallelOptionValues = parsed.opts();

    expect(opts.parallel).toBe('2');
    // Should be assignable to OptionValues
    expect(opts).toHaveProperty('parallel');
  });

  it('allows parallel to be undefined', () => {
    const command = new Command();
    addParallelOption(command);

    const parsed = command.parse([], { from: 'user' });
    const opts: ParallelOptionValues = parsed.opts();

    expect(opts.parallel).toBeUndefined();
  });
});
