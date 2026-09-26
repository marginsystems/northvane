import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { USE_CASES, GLOBE_TEXT, GLOBE_EVENTS, AUTONOMY, FOUNDERS, FOOTER } from './content.js';

function logoSVG({ name, style }) {
  const fonts = {
    wide: `font-family:var(--sans);font-weight:600;letter-spacing:.32em;font-size:15px`,
    round: `font-family:var(--sans);font-weight:500;letter-spacing:-.02em;font-size:30px`,
    mono: `font-family:var(--mono);font-weight:500;letter-spacing:.24em;font-size:16px`,
    serif: `font-family:Georgia,serif;font-style:italic;font-size:24px`,
    mark: `font-family:var(--sans);font-weight:600;letter-spacing:.14em;font-size:15px`,
    thin: `font-family:var(--sans);font-weight:400;letter-spacing:.4em;font-size:14px`,
    bold: `font-family:var(--sans);font-weight:600;letter-spacing:-.05em;font-size:28px`,
  };
  const w = Math.max(120, name.length * (style === 'round' || style === 'bold' ? 16 : 14) + (style === 'wide' || style === 'thin' ? name.length * 5 : 0));
  const mark = style === 'mark' ? `<path d="M4 26 L14 8 L24 26 Z" fill="none" stroke="currentColor" stroke-width="2"/>` : style === 'round' ? `<circle cx="12" cy="19" r="8" fill="none" stroke="currentColor" stroke-width="2.2"/>` : '';
  const x = mark ? 34 : 0;
  return `<svg viewBox="0 0 ${w + x} 38" aria-label="${name}"><g fill="currentColor">${mark}<text x="${x}" y="27" style="${fonts[style]}">${name}</text></g></svg>`;
}

function Cases() {
  const [active, setActive] = useState(0);
  return (
    <>
      <h2 className="h3 cases-title">One platform, many missions.</h2>
      <div className="cases-row" id="cases-row">
        {USE_CASES.map((c, i) => (
          <div key={c.title} className={'case' + (i === active ? ' is-active' : '')} onClick={() => setActive(i)}>
            <img src={c.img} alt="" loading="lazy" />
            <div className="case-copy"><h3>{c.title}</h3><p>{c.text}</p></div>
          </div>
        ))}
      </div>
    </>
  );
}

function Globe({ onLabels }) {
  return (
    <>
      <h2 className="h2 globe-text" id="globe-text">{GLOBE_TEXT}</h2>
      <div className="view globe-view" id="globe-view" />
      <div
        className="globe-labels"
        id="globe-labels"
        ref={(node) => {
          if (!node) return;
          const labels = [...node.children];
          labels.forEach((el) => { el.style.opacity = '0'; });
          onLabels(labels);
        }}
      >
        {GLOBE_EVENTS.map((e) => <div key={e.text} className="glabel">{e.text}</div>)}
      </div>
    </>
  );
}

function Autonomy({ icons }) {
  return (
    <>
      <div className="view auto-view" id="auto-view" />
      <div className="auto-copy">
        <h2 className="h3b" id="auto-title" dangerouslySetInnerHTML={{ __html: AUTONOMY.title }} />
        <p className="body-l" id="auto-body">{AUTONOMY.body}</p>
        <button className="pill" data-contact="" id="auto-cta" dangerouslySetInnerHTML={{ __html: `${AUTONOMY.cta}${icons.target}` }} />
      </div>
    </>
  );
}

function Founders() {
  return (
    <>
      <p className="body-s founders-text" id="founders-text">{FOUNDERS.text}</p>
      <div className="logos" id="logos" dangerouslySetInnerHTML={{ __html: FOUNDERS.logos.map(logoSVG).join('') }} />
    </>
  );
}

function Footer({ icons }) {
  return (
    <>
      <div className="footer-mark" aria-hidden="true">
        <svg viewBox="0 0 1400 220" preserveAspectRatio="xMidYMid meet">
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M40 190 A95 95 0 0 1 230 190" />
            <path d="M80 190 L135 150 L190 190" />
            <path d="M80 160 L135 120 L190 160" />
          </g>
          <text x="265" y="190" fill="none" stroke="currentColor" strokeWidth="3">Northvane</text>
        </svg>
      </div>
      <div className="view land-view" id="land-view" />
      <div className="footer-bottom">
        <div className="footer-cta">
          <p className="h3" id="footer-cta">{FOOTER.cta}</p>
          <button className="pill pill-sm" data-contact="" id="footer-btn" dangerouslySetInnerHTML={{ __html: `${FOOTER.button} ${icons.right}` }} />
        </div>
        <p className="mono footer-copy" id="footer-copy">{`${FOOTER.copy} ${new Date().getFullYear()}`}</p>
        <div className="footer-links" id="footer-links">
          {FOOTER.links.map((l) => <a key={l} href="#" data-contact-link="">{l}</a>)}
        </div>
      </div>
    </>
  );
}

// Each root is an existing child of #main. A wrapper inside #main would sit under
// pointer-events: none and the cases and footer would not receive clicks.
// The scroll spacer stays where main.js sizes it.
export function mountTail(doc, { icons }) {
  const $ = (s, r = doc) => r.querySelector(s);
  const globeLabels = [];
  const takeLabels = (nodes) => {
    globeLabels.length = 0;
    globeLabels.push(...nodes);
  };
  flushSync(() => { createRoot($('#cases')).render(<Cases />); });
  flushSync(() => { createRoot($('#globe')).render(<Globe onLabels={takeLabels} />); });
  flushSync(() => { createRoot($('#autonomy')).render(<Autonomy icons={icons} />); });
  flushSync(() => { createRoot($('#founders')).render(<Founders />); });
  flushSync(() => { createRoot($('#footer')).render(<Footer icons={icons} />); });
  const views = [
    { name: 'globe', el: $('#globe-view'), sec: $('#globe') },
    { name: 'auto', el: $('#auto-view'), sec: $('#autonomy') },
    { name: 'land', el: $('#land-view'), sec: $('#footer') },
  ];
  return { globeLabels, views };
}

if (import.meta.hot) import.meta.hot.decline();
