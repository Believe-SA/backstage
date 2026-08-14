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

import {
  injectStickyLayoutOverrides,
  STICKY_LAYOUT_OVERRIDE_STYLE_ID,
  updateTechdocsSidebarTop,
} from './injectStickyLayoutOverrides';

describe('injectStickyLayoutOverrides', () => {
  it('appends sticky override stylesheet after Material CSS loads', () => {
    const dom = document.createElement('html');
    dom.innerHTML = '<head><link rel="stylesheet" href="main.css"></head>';

    injectStickyLayoutOverrides(dom);

    const style = dom.querySelector(`#${STICKY_LAYOUT_OVERRIDE_STYLE_ID}`);
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('overflow-y: visible !important');
    expect(style?.textContent).toContain('max-height: none !important');
    expect(style?.textContent).not.toContain('100svh');
  });

  it('does not inject duplicate override stylesheets', () => {
    const dom = document.createElement('html');
    dom.innerHTML = '<head></head>';

    injectStickyLayoutOverrides(dom);
    injectStickyLayoutOverrides(dom);

    expect(
      dom.querySelectorAll(`#${STICKY_LAYOUT_OVERRIDE_STYLE_ID}`),
    ).toHaveLength(1);
  });
});

describe('updateTechdocsSidebarTop', () => {
  it('writes the reader page top offset into a CSS custom property', () => {
    const page = document.createElement('main');
    page.className = 'techdocs-reader-page';
    document.body.appendChild(page);

    page.getBoundingClientRect = () =>
      ({
        top: 96,
      } as DOMRect);

    updateTechdocsSidebarTop();

    expect(page.style.getPropertyValue('--techdocs-sidebar-top')).toBe('96px');

    page.remove();
  });
});
