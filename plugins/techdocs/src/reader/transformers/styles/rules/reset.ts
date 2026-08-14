/*
 * Copyright 2022 The Backstage Authors
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

import { RuleOptions } from './types';

export default ({ theme }: RuleOptions) => `
/*==================  Reset  ==================*/

/*
  Material uses overflow on html/body so the shadow tree becomes its own
  scrollport; sticky sidebars then track that inner scroller instead of the
  Backstage page.
*/
html,
body {
  overflow: visible;
  height: auto;
}

body {
  --md-text-color: var(--md-default-fg-color);
  --md-text-link-color: var(--md-accent-fg-color);
  --md-text-font-family: ${theme.typography.fontFamily};
  font-family: var(--md-text-font-family);
  background-color: unset;
  /* Material uses flex + min-height 100% — creates a nested scrollport in shadow DOM */
  display: block;
  min-height: auto;
}
`;
