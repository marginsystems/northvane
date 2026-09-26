import { SCENES, MULTI_TAGS, SERVICE_TAGS, DETECT_LABELS, USE_CASES, GLOBE_TEXT, GLOBE_EVENTS, AUTONOMY, FOUNDERS, FOOTER } from './content.js';

function splitChars(html) {
  return html.split(/<br\s*\/?>/i).map((line) => line.split(' ').map((w) =>
    `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="char">${c}</span>`).join('')}</span>`
  ).join('<span class="char"> </span>')).join('<br>');
}
function hudLine(item) {
  if (Array.isArray(item[0])) return item[0].map(([t, c]) => `<span class="${c ? 'c-' + c : ''}">${t}</span>`).join('');
  const [t, c] = item; return `<span class="${c ? 'c-' + c : ''}">${t}</span>`;
}
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

// Call during boot, or later from a layout effect once the nodes exist.
// Story overlays and tail sections stay imperative. Header and the scroll spacer stay in main.
export function mountStory(doc, { icons, onJump }) {
  const $ = (s, r = doc) => r.querySelector(s);
  const overlay = $('#overlay');
  const sceneEls = SCENES.map((s) => {
    const el = doc.createElement('div');
    el.className = 'sc' + (s.hud ? ' has-hud' : '');
    el.dataset.id = s.id;
    let html = '';
    if (s.title) {
      html += `<div class="sc-title"><h1 class="${s.titleClass || 'h0'} t">${splitChars(s.title)}</h1>${s.badge ? `<span class="badge ${s.badge.color}">${s.badge.text}</span>` : ''}</div>`;
    }
    if (s.body) {
      html += `<div class="sc-body pos-${s.bodyPos}"><p class="h3">${s.body}</p>`;
      if (s.table) html += `<div class="sc-table body-l">${s.table.map(([a, b]) => `<div class="row"><span>${a}</span><span>${b}</span></div>`).join('')}</div>`;
      if (s.cta) html += `<button class="pill" data-action="${s.cta.action}">${s.cta.label}${icons[s.cta.icon]}</button>`;
      html += '</div>';
    }
    if (s.hud) html += `<div class="hud mono">${s.hud.map((l) => `<div class="ln">${hudLine(l)}</div>`).join('')}</div>`;
    if (s.callouts) html += s.callouts.map((c, i) => `<div class="callout ${c.side}" data-i="${i}"><span class="v">${splitChars(c.value)}</span> <span class="k">${splitChars(c.label)}</span></div>`).join('');
    el.innerHTML = html;
    overlay.appendChild(el);
    return el;
  });

  const labels = $('#labels');
  const lines = $('#lines');
  const droneTags = SCENES[2].tags.map((t) => { const d = doc.createElement('div'); d.className = 'tag tag-drone'; d.textContent = t; d.style.opacity = 0; labels.appendChild(d); return d; });
  const swarmPath = doc.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  swarmPath.setAttribute('fill', 'none'); swarmPath.setAttribute('stroke', 'rgba(255,255,255,.75)'); swarmPath.setAttribute('stroke-dasharray', '3 4'); swarmPath.setAttribute('stroke-width', '1'); swarmPath.style.opacity = 0; swarmPath.style.transition = 'opacity .5s';
  lines.appendChild(swarmPath);
  const calloutLines = SCENES[1].callouts.map(() => {
    const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    const l = doc.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('stroke', 'rgba(255,255,255,.55)'); l.setAttribute('stroke-width', '1');
    const c = doc.createElementNS('http://www.w3.org/2000/svg', 'rect'); c.setAttribute('width', 4); c.setAttribute('height', 4); c.setAttribute('fill', '#fff');
    g.append(l, c); g.style.opacity = 0; g.style.transition = 'opacity .4s'; lines.appendChild(g); return { g, l, c, len: 0 };
  });
  const dboxes = DETECT_LABELS.map((t) => { const d = doc.createElement('div'); d.className = 'dbox'; d.innerHTML = `<span>${t} ${80 + Math.floor(Math.random() * 5)}%</span>`; labels.appendChild(d); return d; });
  const chipMain = doc.createElement('div'); chipMain.className = 'tag tag-chip yellow'; chipMain.style.opacity = 0; labels.appendChild(chipMain);
  const svcTags = SERVICE_TAGS.map((t) => { const d = doc.createElement('div'); d.className = 'svc'; d.innerHTML = `<span class="svc-l">${t}</span><i class="svc-line"></i><b class="svc-pt"></b>`; labels.appendChild(d); return d; });
  const multiChips = MULTI_TAGS.map((t) => { const d = doc.createElement('div'); d.className = `tag tag-chip small ${t.color}`; d.innerHTML = `${icons.shield}<span>${t.text}</span>`; d.style.opacity = 0; labels.appendChild(d); return d; });

  const navLabels = [...new Set(SCENES.map((s) => s.nav).filter(Boolean))];
  const sceneNav = $('#scene-nav');
  const navItems = navLabels.map((label) => {
    const b = doc.createElement('button'); b.className = 'sn-item'; b.innerHTML = `<i class="tick"></i><span class="lbl">${label}</span>`; b.setAttribute('aria-label', label);
    b.addEventListener('click', () => onJump(SCENES.findIndex((s) => s.nav === label)));
    sceneNav.appendChild(b); return b;
  });

  return { sceneEls, droneTags, swarmPath, calloutLines, dboxes, chipMain, svcTags, multiChips, sceneNav, navItems, navLabels };
}

// Fills the sections under the WebGL story. Those nodes are direct children of #main;
// a wrapper inside #main would sit under pointer-events: none and the page would not receive clicks.
export function mountTail(doc, { icons }) {
  const $ = (s, r = doc) => r.querySelector(s);
  const casesRow = $('#cases-row');
  const caseEls = USE_CASES.map((c, i) => {
    const d = doc.createElement('div'); d.className = 'case' + (i === 0 ? ' is-active' : '');
    d.innerHTML = `<img src="${c.img}" alt="" loading="lazy"><div class="case-copy"><h3>${c.title}</h3><p>${c.text}</p></div>`;
    d.addEventListener('click', () => caseEls.forEach((e, k) => e.classList.toggle('is-active', k === i)));
    casesRow.appendChild(d); return d;
  });
  $('#globe-text').textContent = GLOBE_TEXT;
  const globeLabels = GLOBE_EVENTS.map((e) => { const d = doc.createElement('div'); d.className = 'glabel'; d.textContent = e.text; d.style.opacity = 0; $('#globe-labels').appendChild(d); return d; });
  $('#auto-title').innerHTML = AUTONOMY.title;
  $('#auto-body').textContent = AUTONOMY.body;
  $('#auto-cta').innerHTML = `${AUTONOMY.cta}${icons.target}`;
  $('#founders-text').textContent = FOUNDERS.text;
  $('#logos').innerHTML = FOUNDERS.logos.map(logoSVG).join('');
  $('#footer-cta').textContent = FOOTER.cta;
  $('#footer-btn').innerHTML = `${FOOTER.button} ${icons.right}`;
  $('#footer-copy').textContent = `${FOOTER.copy} ${new Date().getFullYear()}`;
  $('#footer-links').innerHTML = FOOTER.links.map((l) => `<a href="#" data-contact-link>${l}</a>`).join('');
  const views = [
    { name: 'globe', el: $('#globe-view'), sec: $('#globe') },
    { name: 'auto', el: $('#auto-view'), sec: $('#autonomy') },
    { name: 'land', el: $('#land-view'), sec: $('#footer') },
  ];
  return { globeLabels, views, caseEls };
}

if (import.meta.hot) import.meta.hot.decline();
