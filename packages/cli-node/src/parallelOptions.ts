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

import { Command, OptionValues } from 'commander';
import {
  getDefaultParallelism,
  parseParallelismOption,
  type ParallelismOption,
} from '@backstage/cli-common';

type Options = {
  envVar?: string;
  optionDescription?: string;
  helpLabel?: string;
};

/**
 * Type helper for commands that use the --parallel option.
 * Use this to properly type your command's OptionValues.
 *
 * @public
 */
export interface ParallelOptionValues extends OptionValues {
  parallel?: ParallelismOption;
}

/**
 * Wires a common --parallel option and help text for commands that support
 * tuning parallelism.
 *
 * @example
 * ```ts
 * import { addParallelOption, type ParallelOptionValues } from '@backstage/cli-node';
 * import { parseParallelismOption, getDefaultParallelism } from '@backstage/cli-common';
 *
 * const command = new Command();
 * addParallelOption(command, { helpLabel: 'build parallelism' });
 *
 * // In action handler with proper typing:
 * export async function command(opts: ParallelOptionValues) {
 *   const parallelism = parseParallelismOption(
 *     opts.parallel,
 *     getDefaultParallelism({ envVar: 'BACKSTAGE_CLI_BUILD_PARALLEL', clampForCi: true })
 *   );
 *   // ... use parallelism
 * }
 * ```
 *
 * @public
 */
export function addParallelOption(
  command: Command,
  options: Options = {},
): void {
  const {
    envVar = 'BACKSTAGE_CLI_BUILD_PARALLEL',
    optionDescription = 'Override parallelism (false|true|<int>). Defaults to auto-detected CPUs.',
    helpLabel = 'parallelism',
  } = options;

  command.option('--parallel <value>', optionDescription);
  command.addHelpText(
    'after',
    `\nEnvironment:\n  ${envVar}=false|true|<int>  Control ${helpLabel} (default auto-detects CPUs).`,
  );
}
