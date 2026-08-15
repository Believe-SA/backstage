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

import { renderHook } from '@testing-library/react';
import { useStylesTransformer } from './transformer';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import { ReactNode } from 'react';
import postcss from 'postcss';

describe('Transformers > Styles', () => {
  it('should return a function that injects all styles into a given dom element', () => {
    const { result } = renderHook(() => useStylesTransformer());

    const dom = document.createElement('html');
    dom.innerHTML = '<head></head>';
    result.current(dom); // calling styles transformer

    const style = dom.querySelector('head > style');

    expect(style).toHaveTextContent(
      '/*================== Variables ==================*/',
    );
    expect(style).toHaveTextContent(
      '/*================== Reset ==================*/',
    );
    expect(style).toHaveTextContent(
      '/*================== Layout ==================*/',
    );
    expect(style).toHaveTextContent(
      '/*================== Typeset ==================*/',
    );
    expect(style).toHaveTextContent(
      '/*================== Animations ==================*/',
    );
    expect(style).toHaveTextContent(
      '/*================== Extensions ==================*/',
    );
    expect(style).toHaveTextContent(
      '/*================== Palette ==================*/',
    );
  });

  it('should not emit CSS a parser would silently drop', () => {
    const { result } = renderHook(() => useStylesTransformer());
    const dom = document.createElement('html');
    dom.innerHTML = '<head></head>';
    result.current(dom);

    const style = dom.querySelector('head > style');
    const stray = postcss
      .parse(style!.textContent!)
      .nodes.filter(node => node.type === 'decl')
      .map(
        node =>
          `${node.prop} at line ${node.source?.start?.line} of the generated stylesheet`,
      );

    expect(stray).toEqual([]);
  });

  it('should stick sidebars to the page scrollport only on wide viewports', () => {
    const { result } = renderHook(() => useStylesTransformer());
    const dom = document.createElement('html');
    dom.innerHTML = '<head></head>';
    result.current(dom);
    const css = dom.querySelector('head > style')!.textContent!;

    // The shadow tree must not become its own scrollport, otherwise sticky
    // sidebars track it instead of the Backstage page.
    expect(css).toMatch(/html\s*\{[^}]*overflow:\s*clip/s);
    expect(css).toMatch(/body\s*\{[^}]*overflow:\s*visible/s);
    expect(css).toMatch(/\.md-main__inner\s*\{[^}]*display:\s*flex/s);

    const desktop = css.match(
      /@media screen and \(min-width: 76\.25em\)\s*\{[\s\S]*?\n\}/,
    )![0];

    // The column carries the view timeline, so it must stay in flow: a sticky
    // subject never leaves the viewport and its timeline would then span the
    // whole document instead of one viewport height. It also has to stretch,
    // or the scrollwrap that sticks inside it gets no travel at all.
    expect(desktop).toMatch(
      /\.md-sidebar--primary:not\(\[hidden\]\),\s*\.md-sidebar--secondary:not\(\[hidden\]\) \{[^}]*position:\s*static/s,
    );
    expect(desktop).toMatch(/align-self:\s*stretch/);
    expect(desktop).toMatch(/view-timeline-name:\s*--techdocs-sidebar/);

    // Sticky moved onto the scrollwrap, and is scoped to the wide breakpoint;
    // narrower viewports keep Material's fixed off-canvas drawer.
    expect(desktop).toMatch(
      /\.md-sidebar__scrollwrap \{[^}]*position:\s*sticky/s,
    );
    expect(css).not.toMatch(/^\.md-sidebar\s*\{[^}]*position:\s*sticky/ms);
    expect(css).toMatch(
      /@media screen and \(max-width: 76\.1875em\)\s*\{[\s\S]*?\.md-sidebar--secondary:not\(\[hidden\]\)/,
    );
    expect(css).not.toMatch(/\.md-footer\s*\{[^}]*position:\s*fixed/s);
  });

  it('should keep the footer reachable without pinning it to the viewport', () => {
    const { result } = renderHook(() => useStylesTransformer());
    const dom = document.createElement('html');
    dom.innerHTML = '<head></head>';
    result.current(dom);
    const css = dom.querySelector('head > style')!.textContent!;

    // Sticky keeps the footer in flow, so it needs no JavaScript to size it.
    expect(css).toMatch(/\.md-footer\s*\{[^}]*position:\s*sticky/s);
    expect(css).toMatch(/\.md-footer\s*\{[^}]*bottom:\s*0/s);

    // Only the links are painted and clickable; the rest of the parked bar
    // must neither hide nor block the document scrolling underneath it.
    expect(css).toMatch(/\.md-footer\s*\{[^}]*pointer-events:\s*none/s);
    expect(css).toMatch(
      /\.md-footer-nav__link, \.md-footer__link \{[^}]*background-color:\s*var\(--md-default-bg-color\)/s,
    );
    // Footer meta opts back in, otherwise its own links would be dead.
    expect(css).toMatch(
      /\.md-footer-meta,\s*\.md-footer-nav__link,\s*\.md-footer__link \{[^}]*pointer-events:\s*auto/s,
    );

    // The links park in the sidebar columns, so the nav must stop above them.
    // The static max-height is what browsers without scroll-driven animations
    // fall back to, and is also the value the timeline settles on once the
    // column has scrolled off the top.
    expect(css).toMatch(
      /@media screen and \(min-width: 76\.25em\)[\s\S]*?max-height:\s*calc\(100dvh - 5rem\)/,
    );

    // Before that, the nav is grown to exactly the gap above the parked footer.
    // Both ends of the range must agree with the reserved band, or the nav
    // reaches the links: the range has to start where free space hits zero.
    expect(css).toMatch(
      /@keyframes techdocs-sidebar-fill \{[^@]*to \{\s*max-height:\s*calc\(100dvh - 5rem\)/s,
    );
    expect(css).toMatch(/animation-range:\s*cover 5rem cover 100dvh/);

    // Parking the footer is only safe where that measurement is available.
    // Without it the nav cannot know where to stop, so the footer has to go
    // back to the end of the document rather than sit on top of the nav.
    const fallback = css.match(
      /@supports not \(animation-timeline: view\(\)\) \{[\s\S]*?\n\}/,
    )![0];
    expect(fallback).toMatch(/\.md-footer \{[^}]*position:\s*static/s);
    expect(fallback).toMatch(/max-height:\s*100dvh/);
  });

  it('should use headers relative font-size value as the factor for the md-typeset variable', () => {
    const theme = createTheme({
      typography: {
        h1: {
          fontSize: '20rem',
        },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useStylesTransformer(), { wrapper });

    const dom = document.createElement('html');
    dom.innerHTML = `<head></head>`;
    result.current(dom); // calling styles transformer

    const style = dom.querySelector('head > style');
    expect(style).not.toBeNull();

    const h1 = style!.textContent?.match(/\.md-typeset h1 {.*?}/s);
    expect(h1).toHaveLength(1);
    expect(h1![0]).toContain(
      'font-size: calc(20 * var(--md-typeset-font-size));',
    );
  });

  it('should resolve header sizes that are variables', () => {
    document.body.style.setProperty('--font-size-h1', '20rem');
    const theme = createTheme({
      typography: {
        h1: {
          fontSize: 'var(--font-size-h1)',
        },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useStylesTransformer(), { wrapper });

    const dom = document.createElement('html');
    dom.innerHTML = `<head></head>`;
    result.current(dom); // calling styles transformer

    const style = dom.querySelector('head > style');
    expect(style).not.toBeNull();

    const h1 = style!.textContent?.match(/\.md-typeset h1 {.*?}/s);
    expect(h1).toHaveLength(1);
    expect(h1![0]).toContain(
      'font-size: calc(20 * var(--md-typeset-font-size));',
    );
  });

  it('should convert pixel header sizes to REM and reduce by 60%', () => {
    const theme = createTheme({
      typography: {
        htmlFontSize: 16,
        h1: {
          fontSize: 100,
        },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useStylesTransformer(), { wrapper });

    const dom = document.createElement('html');
    dom.innerHTML = `<head></head>`;
    result.current(dom); // calling styles transformer

    const style = dom.querySelector('head > style');
    expect(style).not.toBeNull();

    const h1 = style!.textContent?.match(/\.md-typeset h1 {.*?}/s);
    expect(h1).toHaveLength(1);
    expect(h1![0]).toContain(
      // 100px / 16px * 0.6 = 3.75rem
      'font-size: calc(3.75 * var(--md-typeset-font-size));',
    );
  });
});
