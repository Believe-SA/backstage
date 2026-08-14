---
date: 2026-01-15
categories:
  - Layout
---

# A post with a nested sidebar

Blog post pages render a second navigation sidebar _inside_ the content column,
in addition to the usual primary navigation and table of contents.

<!-- more -->

## Why this page exists

The reader styles position the sidebars at the wide breakpoint. That selector
also matches the nested post sidebar, which MkDocs Material lays out itself at a
tying specificity. The reader stylesheet is injected after Material's, so it
used to win that tie and reshape a sidebar it was never meant to touch. This
page makes the result visible instead of theoretical.

## What to look at

- The back link and post metadata should sit in their own column beside the post
  body, the way Material renders them on a wide screen.
- They should not be clipped to the height of the window, and should not grow a
  scrollbar of their own.
- The primary navigation and the table of contents should behave exactly as they
  do on an ordinary documentation page.
- On a narrow screen the metadata should stack above the post body instead.

## Filler

Everything below is here so that the page scrolls, which is what makes sticky
positioning observable at all.

### Scrolling behaviour

A sticky element only reveals itself once there is somewhere to scroll to. On a
short page every sidebar sits at its natural position and nothing moves, so a
page of this length is the smallest useful test. Scroll to the bottom and the
footer should settle at the end of the document rather than floating over it.

### Sidebar height

When a navigation tree is taller than the window, the sidebar caps at the height
of the viewport and the tree scrolls inside it. When the tree is short, the
sidebar shrinks to fit and shows no scrollbar at all. Both cases are worth
checking, because the difference between them is where phantom scrollbars tend
to appear.

### Table of contents

The table of contents on the right follows the same rules as the navigation on
the left. It sticks to the top of the reading area, caps at the window height,
and scrolls internally only when the list of headings is long enough to need it.

### Footer links

The previous and next links stay reachable while reading. Only the links
themselves are painted, so the rest of the bar lets the document show through
and stays out of the way of clicks on the text underneath.

### Narrow screens

Below the wide breakpoint the navigation becomes a drawer that slides in from
the side, the table of contents is hidden, and the footer returns to the end of
the document. None of that should be affected by the presence of a blog.
