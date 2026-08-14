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

/** Id for the stylesheet appended after MkDocs Material CSS finishes loading. */
export const STICKY_LAYOUT_OVERRIDE_STYLE_ID =
  'techdocs-sticky-layout-overrides';

/**
 * Shadow-DOM / Backstage patches applied after MkDocs Material CSS loads.
 * Material already uses sticky sidebars; we only fix scrollport and chrome issues.
 */
export const stickyLayoutOverrideCss = `
@media screen and (min-width: 76.25em) {
  html,
  body {
    overflow: visible !important;
    height: auto !important;
    min-height: auto !important;
  }

  .md-container,
  .md-main,
  .md-main__inner {
    overflow: visible !important;
    height: auto !important;
  }

  .md-sidebar,
  .md-sidebar--primary,
  .md-sidebar--secondary {
    top: var(--techdocs-sidebar-top, 0px) !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    height: auto !important;
  }

  .md-sidebar .md-sidebar__scrollwrap {
    height: auto !important;
    max-height: none !important;
    overflow-y: visible !important;
    scrollbar-gutter: auto !important;
  }
}
`;

export function injectStickyLayoutOverrides(dom: Element): void {
  const head = dom.getElementsByTagName('head')[0];
  if (!head) {
    return;
  }

  if (head.querySelector(`#${STICKY_LAYOUT_OVERRIDE_STYLE_ID}`)) {
    return;
  }

  head.insertAdjacentHTML(
    'beforeend',
    `<style id="${STICKY_LAYOUT_OVERRIDE_STYLE_ID}">${stickyLayoutOverrideCss}</style>`,
  );
}

/** Offset sticky sidebars below Backstage header / entity tabs (light DOM). */
export function updateTechdocsSidebarTop(): void {
  const page = document.querySelector<HTMLElement>('.techdocs-reader-page');
  if (!page) {
    return;
  }

  const topPx = Math.max(page.getBoundingClientRect().top, 0);
  page.style.setProperty('--techdocs-sidebar-top', `${topPx}px`);
}
