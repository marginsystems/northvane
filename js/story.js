import { SCENES, MULTI_TAGS, SERVICE_TAGS, DETECT_LABELS } from './content.js';

function splitChars(html) {
  return html.split(/<br\s*\/?>/i).map((line) => line.split(' ').map((w) =>
    `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="char">${c}</span>`).join('')}</span>`
  ).join('<span class="char"> </span>')).join('<br>');
}
function hudLine(item) {
  if (Array.isArray(item[0])) return item[0].map(([t, c]) => `<span class="${c ? 'c-' + c : ''}">${t}</span>`).join('');
  const [t, c] = item; return `<span class="${c ? 'c-' + c : ''}">${t}</span>`;
}
// Story overlays stay imperative. Header and the scroll spacer stay in main.
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

if (import.meta.hot) import.meta.hot.decline();
