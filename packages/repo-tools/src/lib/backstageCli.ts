/*
 * Copyright 2026 The Backstage Authors
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

import { targetPaths } from '@backstage/cli-common';
import fs from 'fs-extra';
import { createRequire } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';

/**
 * Returns the command that runs the Backstage CLI installed in the target
 * project, to be followed by the CLI arguments.
 *
 * @remarks
 *
 * The CLI is found with Node.js module resolution from the project root and
 * run with the current Node.js binary, so that it works with any package
 * manager.
 */
export function backstageCliCommand(): string[] {
  const projectRequire = createRequire(targetPaths.resolveRoot('package.json'));

  let pkgPath: string;
  try {
    pkgPath = projectRequire.resolve('@backstage/cli/package.json');
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `Could not find @backstage/cli in the project at ${targetPaths.rootDir}, it must be installed to lint and format files`,
      );
    }
    throw error;
  }

  const { bin } = fs.readJsonSync(pkgPath);
  return [
    process.execPath,
    resolvePath(dirname(pkgPath), bin['backstage-cli']),
  ];
}
