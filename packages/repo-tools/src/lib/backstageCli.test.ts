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

import { createMockDirectory } from '@backstage/backend-test-utils';
import { backstageCliCommand } from './backstageCli';

const mockDir = createMockDirectory();

// Jest caches failed module lookups per directory, so each case has its own root
let mockRoot = '';

jest.mock('@backstage/cli-common', () => ({
  ...jest.requireActual('@backstage/cli-common'),
  targetPaths: {
    get rootDir() {
      return mockDir.resolve(mockRoot);
    },
    resolveRoot: (...paths: string[]) => mockDir.resolve(mockRoot, ...paths),
  },
}));

describe('backstageCliCommand', () => {
  it('runs the CLI of the project with the current Node.js binary', () => {
    mockDir.setContent({
      'with-cli': {
        'package.json': '{}',
        node_modules: {
          '@backstage': {
            cli: {
              'package.json': JSON.stringify({
                bin: { 'backstage-cli': 'bin/backstage-cli' },
              }),
            },
          },
        },
      },
      'without-cli': { 'package.json': '{}' },
    });

    mockRoot = 'with-cli';
    expect(backstageCliCommand()).toEqual([
      process.execPath,
      mockDir.resolve('with-cli/node_modules/@backstage/cli/bin/backstage-cli'),
    ]);

    mockRoot = 'without-cli';
    expect(() => backstageCliCommand()).toThrow(
      `Could not find @backstage/cli in the project at ${mockDir.resolve(
        'without-cli',
      )}`,
    );
  });
});
