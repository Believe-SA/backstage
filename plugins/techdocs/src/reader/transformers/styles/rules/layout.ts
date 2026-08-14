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

const APP_SIDEBAR_WIDTH_PINNED = '224px';
const APP_SIDEBAR_WIDTH_COLLAPSED = '72px';

export default ({ theme, sidebar }: RuleOptions) => `

/*==================  Layout  ==================*/

/* mkdocs material v9 compat */
.md-nav__title {
  color: var(--md-default-fg-color);
}

/*
  Material paints its own surfaces on these. Let them show whatever Backstage
  page the reader is embedded in instead. .md-footer is deliberately not in this
  list - it is sticky, so it has to stay opaque where it covers the document.
*/
.md-nav__title,
.md-footer,
.md-footer-meta {
  background-color: unset;
}

.md-grid {
  max-width: 100%;
  margin: 0;
}

.md-nav {
  font-size: calc(var(--md-typeset-font-size) * 0.9);
}
.md-nav__link:not(:has(svg)) {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.md-nav__link:has(svg) > .md-ellipsis {
  flex-grow: 1;
}
.md-nav__icon {
  height: 20px !important;
  width: 20px !important;
  margin-left:${theme.spacing(1)}px;
}
.md-nav__icon svg {
  margin: 0;
  width: 20px !important;
  height: 20px !important;
}
.md-nav__icon:after {
  width: 20px !important;
  height: 20px !important;
}
.md-status--updated::after {
  -webkit-mask-image: var(--md-status--updated);
  mask-image: var(--md-status--updated);
}

.md-nav__item--active > .md-nav__link, a.md-nav__link--active {
  text-decoration: underline;
  color: var(--md-typeset-a-color);
}
.md-nav__link--active > .md-status:after {
  background-color: var(--md-typeset-a-color);
}
.md-nav__link[href]:hover > .md-status:after {
  background-color: var(--md-accent-fg-color);
}

.md-main__inner {
  margin-top: 0;
  display: flex;
  height: auto;
}

@supports selector(::-webkit-scrollbar) {
  [dir=ltr] .md-sidebar__inner {
      padding-right: calc(100% - 15.1rem);
  }
}

.md-content {
  flex-grow: 1;
  min-width: 0;
  max-width: none;
  margin-left: 0;
}

/*
  Keep the Previous / Next links reachable without measuring anything from
  JavaScript. Sticky leaves the footer in flow, so it takes the width of the
  reader column for free and settles at the end of the document once that
  scrolls into view; its containing block is .md-container, which spans the
  whole page.

  Only the links themselves are painted and only they catch pointer events, so
  the rest of the parked bar neither hides nor blocks the document underneath.
  .md-footer-meta opts back in, otherwise its social and custom links would be
  dead - that was the flaw in the old blanket pointer-events rule.
*/
.md-footer {
  position: sticky;
  bottom: 0;
  pointer-events: none;
}
.md-footer-meta,
.md-footer-nav__link,
.md-footer__link {
  pointer-events: auto;
}

.md-footer__title {
  background-color: unset;
}
.md-footer-nav__link, .md-footer__link {
  width: auto;
  min-width: var(--techdocs-sidebar-width, 16rem);
  background-color: var(--md-default-bg-color);
}

.md-dialog {
  background-color: unset;
}

/*
  Desktop: sidebars stay in flow and stick to the Backstage page scrollport.
  Only the nav itself scrolls, so short trees show no scrollbar at all.
  Narrower viewports keep Material's own off-canvas drawer, which is fixed
  positioned - do not make those sticky.
*/
@media screen and (min-width: 76.25em) {
  /*
    :not([hidden]) is load bearing twice over: it outranks Material's own
    display rule on the TOC, and it keeps the mkdocs "hide: navigation" and
    "hide: toc" front matter working — mkdocs marks those sidebars [hidden]
    and relies on the UA display:none, which any author display would beat.

    The blog plugin nests a second sidebar inside the content column, which
    Material lays out full width and static. Its rule ties with ours on
    specificity and we are later in the cascade, so exclude it by hand.
  */
  .md-sidebar:not([hidden]):not(.md-sidebar--post),
  .md-sidebar--secondary:not([hidden]) {
    position: sticky;
    top: 0;
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: var(--techdocs-sidebar-width, 16rem);
    height: auto;
    max-height: 100dvh;
    padding-bottom: 0;
  }
  .md-sidebar .md-sidebar__scrollwrap {
    width: var(--techdocs-sidebar-width, 16rem);
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    overflow-y: auto;
  }
  .md-sidebar .md-nav {
    margin-bottom: 0;
  }
}

@media screen and (max-width: 76.1875em) {
  .md-nav {
    transition: none !important;
    background-color: var(--md-default-bg-color)
  }
  .md-nav--primary .md-nav__title {
    cursor: auto;
    color: var(--md-default-fg-color);
    font-weight: 700;
    white-space: normal;
    line-height: 1rem;
    height: auto;
    display: flex;
    flex-flow: column;
    row-gap: 1.6rem;
    padding: 1.2rem .8rem .8rem;
    background-color: var(--md-default-bg-color);
  }
  .md-nav--primary .md-nav__title~.md-nav__list {
    box-shadow: none;
  }
  .md-nav--primary .md-nav__title ~ .md-nav__list > :first-child {
    border-top: none;
  }
  .md-nav--primary .md-nav__title .md-nav__button {
    display: none;
  }
  .md-nav--primary .md-nav__title .md-nav__icon {
    color: var(--md-default-fg-color);
    position: static;
    height: auto;
    margin: 0 0 0 -0.2rem;
  }
  .md-nav--primary > .md-nav__title [for="none"] {
    padding-top: 0;
  }
  .md-nav--primary .md-nav__item {
    border-top: none;
  }
  .md-nav--primary :is(.md-nav__title,.md-nav__item) {
    font-size : var(--md-typeset-font-size);
  }
  .md-nav .md-source {
    display: none;
  }

  .md-sidebar {
    height: 100%;
  }
  .md-sidebar--primary {
    width: var(--techdocs-sidebar-width, 16rem) !important;
    z-index: 200;
    left: ${
      sidebar.isPinned
        ? `calc(-1 * var(--techdocs-sidebar-width, 16rem) + var(--techdocs-sidebar-closed-offset-pinned, ${APP_SIDEBAR_WIDTH_PINNED}))`
        : `calc(-1 * var(--techdocs-sidebar-width, 16rem) + var(--techdocs-sidebar-closed-offset-collapsed, ${APP_SIDEBAR_WIDTH_COLLAPSED}))`
    } !important;
  }
  .md-sidebar--secondary:not([hidden]) {
    display: none;
  }

  [data-md-toggle=drawer]:checked~.md-container .md-sidebar--primary {
    transform: translateX(var(--techdocs-sidebar-open-translate, var(--techdocs-sidebar-width, 16rem)));
  }

  .md-content {
    max-width: 100%;
    margin-left: 0;
  }

  .md-header__button {
    margin: 0.4rem 0;
    margin-left: 0.4rem;
    padding: 0;
  }

  .md-overlay {
    left: 0;
  }

  .md-footer {
    position: static;
    padding-left: 0;
  }
  .md-footer-nav__link, .md-footer__link {
    min-width: 0;
  }
  .md-footer-nav__link {
    /* footer links begin to overlap at small sizes without setting width */
    width: 50%;
  }
}

@media screen and (max-width: 600px) {
  .md-sidebar--primary {
    left: calc(-1 * var(--techdocs-sidebar-width, 16rem)) !important;
    width: var(--techdocs-sidebar-width, 16rem);
  }
}


@media print {
  .md-sidebar,
  #toggle-sidebar {
    display: none;
  }

  .md-content {
    margin: 0;
    width: 100%;
    max-width: 100%;
  }
}
`;
