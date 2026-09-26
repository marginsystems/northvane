import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MENU } from './content.js';

function Menu({ icons }) {
  return (
    <>
      <div className="menu-scrim" data-close="" />
      <aside className="menu-panel">
        <button className="menu-close" data-close="" aria-label="Close menu">
          <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <ul className="menu-links" id="menu-links">
          {MENU.links.map((l, i) => (
            <li key={l.label}>
              <button data-go={l.go} style={{ transitionDelay: `${0.1 + i * 0.05}s` }}>{l.label}</button>
            </li>
          ))}
        </ul>
        <div className="menu-extras" id="menu-extras">
          {MENU.extras.map((e) => (
            <button key={e.title} data-contact="">
              <b dangerouslySetInnerHTML={{ __html: `${e.title} ${icons.arrowUR}` }} />
              <span>{e.text}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}

function ContactModal() {
  return (
    <>
      <div className="modal-scrim" data-close="" />
      <div className="modal-panel">
        <button className="menu-close" data-close="" aria-label="Close">
          <svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <h2 className="h2" id="modal-title">Contact Us</h2>
        <form className="form" id="contact-form" noValidate>
          <div className="field"><label htmlFor="f-name">Name</label><input id="f-name" name="name" maxLength={120} required /><span className="err" /></div>
          <div className="field"><label htmlFor="f-company">Company</label><input id="f-company" name="company" maxLength={160} required /><span className="err" /></div>
          <div className="field"><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" maxLength={254} required /><span className="err" /></div>
          <div className="field"><label htmlFor="f-msg">Message</label><textarea id="f-msg" name="message" maxLength={4000} rows={4} required /><span className="err" /></div>
          <button className="pill submit" type="submit">Submit Form <span className="arr">→</span></button>
          <p className="form-note mono" id="form-note" />
        </form>
      </div>
    </>
  );
}

// Hosts stay #menu and #modal. Open and close still flip bridge flags in the same turn as the click.
export function mountMenu(doc, { icons }) {
  const $ = (s, r = doc) => r.querySelector(s);
  flushSync(() => { createRoot($('#menu')).render(<Menu icons={icons} />); });
  flushSync(() => { createRoot($('#modal')).render(<ContactModal />); });
}

if (import.meta.hot) import.meta.hot.decline();
