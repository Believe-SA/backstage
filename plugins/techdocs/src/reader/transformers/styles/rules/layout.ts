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

const TECHDOCS_SIDEBAR_WIDTH = '16rem';
// Height of the parked footer bar. Measured at 79px with the default theme and
// rounded up, so the sidebars always clear the Previous / Next links. Erring
// high only widens the gap; erring low would hide the links, because Material
// gives .md-sidebar a stacking order the footer does not have.
const TECHDOCS_FOOTER_HEIGHT = '5rem';
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
/*
  These are painted opaque so they stay readable over the document, which means
  the box must not outgrow the sidebar column it sits in. The link is a flex
  item with an auto basis and its title is only capped by a percentage
  max-width, so without a ceiling a long adjacent-page title sizes the box to
  its text and drags an opaque strip across the article.
*/
.md-footer-nav__link, .md-footer__link {
  width: auto;
  min-width: ${TECHDOCS_SIDEBAR_WIDTH};
  max-width: ${TECHDOCS_SIDEBAR_WIDTH};
  background-color: var(--md-default-bg-color);
}

.md-dialog {
  background-color: unset;
}

/*
  Grows the nav to exactly the space between the top of the sidebar column and
  the parked footer. See the animation-range note below for why this is exact
  rather than an approximation - nothing here is animated for its own sake.
*/
@keyframes techdocs-sidebar-fill {
  from {
    max-height: 0;
  }
  to {
    max-height: calc(100dvh - ${TECHDOCS_FOOTER_HEIGHT});
  }
}

/*
  Desktop: the sidebar column stays in normal flow and the scrollwrap inside it
  sticks to the Backstage page scrollport. Only the nav itself scrolls, so short
  trees show no scrollbar at all. Narrower viewports keep Material's own
  off-canvas drawer, which is fixed positioned - do not make those sticky.
*/
@media screen and (min-width: 76.25em) {
  /*
    :not([hidden]) is load bearing: it keeps the mkdocs "hide: navigation" and
    "hide: toc" front matter working — mkdocs marks those sidebars [hidden] and
    relies on the UA display:none, which any author display would beat.

    Matching --primary and --secondary by name leaves the blog plugin's
    .md-sidebar--post alone; Material lays that one out inside the content
    column and wants it static.

    The column must stay in flow, and must NOT be sticky: it is the subject of
    the view timeline below, and view progress follows an element's rendered
    position, so a sticky subject would never leave the viewport and its
    timeline would stretch across the whole document.
  */
  .md-sidebar--primary:not([hidden]),
  .md-sidebar--secondary:not([hidden]) {
    position: static;
    /*
      Material aligns the column to flex-start, which makes it only as tall as
      the nav. The scrollwrap sticks within this column, so that would leave it
      no travel at all and the nav would simply scroll away with the page.
    */
    align-self: stretch;
    flex-shrink: 0;
    width: ${TECHDOCS_SIDEBAR_WIDTH};
    height: auto;
    max-height: none;
    padding-bottom: 0;
    view-timeline-name: --techdocs-sidebar;
    view-timeline-axis: block;
  }

  /*
    The nav has to stop exactly where the footer parks, or a long tree hides the
    Previous / Next links. That distance is "viewport height - footer - how far
    the column top still sits below the viewport top", and the last term is the
    one plain CSS cannot name: sticky can clamp a position but never derive a
    height from it, and anchor() resolves once and is then only translated.

    A view timeline supplies it. For a subject that is not itself sticky, offset
    x into the "cover" range means the subject's top sits exactly x above the
    bottom of the viewport, so interpolating max-height from 0 to
    (100dvh - footer) across "cover <footer>" to "cover 100dvh" evaluates to
    100dvh - footer - <column top>, which is the free space, exactly. Starting
    at "cover <footer>" rather than 0% is what makes it exact: that is the point
    where the free space crosses zero.

    Once the column scrolls off the top, animation-fill-mode pins the end value,
    which is the same answer the stuck state needs. Where scroll-driven
    animations are unsupported the animation has no duration and settles on that
    same end value, so the static max-height below is what everyone else gets.
  */
  .md-sidebar--primary:not([hidden]) > .md-sidebar__scrollwrap,
  .md-sidebar--secondary:not([hidden]) > .md-sidebar__scrollwrap {
    position: sticky;
    top: 0;
    width: ${TECHDOCS_SIDEBAR_WIDTH};
    max-height: calc(100dvh - ${TECHDOCS_FOOTER_HEIGHT});
    overflow-y: auto;
    animation: techdocs-sidebar-fill linear both;
    animation-timeline: --techdocs-sidebar;
    animation-range: cover ${TECHDOCS_FOOTER_HEIGHT} cover 100dvh;
  }
  .md-sidebar .md-nav {
    margin-bottom: 0;
  }
}

/*
  Parking the footer only pays off where the nav can be measured against it.
  Without scroll-driven animations there is no way to know how much room is
  left above the parked bar, and the nav would run underneath the Previous /
  Next links on the first screenful. So do not park it there at all: the footer
  returns to the end of the document, which is where Material puts it, and the
  sidebars get the whole viewport because nothing is covering them any more.
  Everything stays reachable - the links by scrolling to the end of the page.
*/
@supports not (animation-timeline: view()) {
  @media screen and (min-width: 76.25em) {
    .md-footer {
      position: static;
    }
    .md-sidebar--primary:not([hidden]) > .md-sidebar__scrollwrap,
    .md-sidebar--secondary:not([hidden]) > .md-sidebar__scrollwrap {
      /*
        The keyframes still apply here: with no timeline the animation has no
        duration and its fill lands on the end value, which would keep
        reserving a band for a footer that is no longer parked. An animated
        value outranks a normal declaration, so the max-height below only takes
        effect once the animation is off.
      */
      animation: none;
      max-height: 100dvh;
    }
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
    width: ${TECHDOCS_SIDEBAR_WIDTH} !important;
    z-index: 200;
    left: ${
      sidebar.isPinned
        ? `calc(-1 * ${TECHDOCS_SIDEBAR_WIDTH} + var(--techdocs-sidebar-closed-offset-pinned, ${APP_SIDEBAR_WIDTH_PINNED}))`
        : `calc(-1 * ${TECHDOCS_SIDEBAR_WIDTH} + var(--techdocs-sidebar-closed-offset-collapsed, ${APP_SIDEBAR_WIDTH_COLLAPSED}))`
    } !important;
  }
  .md-sidebar--secondary:not([hidden]) {
    display: none;
  }

  [data-md-toggle=drawer]:checked~.md-container .md-sidebar--primary {
    transform: translateX(var(--techdocs-sidebar-open-translate, ${TECHDOCS_SIDEBAR_WIDTH}));
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
    left: calc(-1 * ${TECHDOCS_SIDEBAR_WIDTH}) !important;
    width: ${TECHDOCS_SIDEBAR_WIDTH};
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
