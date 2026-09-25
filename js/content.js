// All copy for the page. Brand "Northvane", aircraft "Kite", command layer "Meridian AI"
// are placeholders — swap freely. Layout / timing live in main.js + world.js.

export const BRAND = 'Northvane';

// Scroll scenes. `len` in vh (same lengths as the reference: 100 / 500 / 100).
// `stop` = where the page comes to rest inside the scene (fraction of len).
export const SCENES = [
  {
    id: 'intro', nav: null, len: 100, stop: 0,
    title: 'Guarding the sky with machines that think',
    titleClass: 'h0 hero-title',
    body: 'A jet-powered aircraft that flies, searches and reports on its own, across ground no crew could ever cover.',
    bodyPos: 'br', cta: { label: 'Scroll To Explore', icon: 'down', action: 'next' },
  },
  {
    id: 'specs', nav: 'Specs', len: 500, stop: 0.8,
    callouts: [
      { anchor: 'nacelle', side: 'r', y: 0.29, value: '410 km/h', label: 'Top speed' },
      { anchor: 'wingL', side: 'l', y: 0.40, value: '1,900 km', label: 'Range' },
      { anchor: 'body', side: 'r', y: 0.54, value: '2× GPU', label: 'Edge compute' },
      { anchor: 'nose', side: 'l', y: 0.66, value: 'VTOL', label: 'Launch & recovery' },
    ],
  },
  {
    id: 'swarm', nav: 'Swarm', len: 500, stop: 0.8,
    title: 'How the fleet<br>thinks together',
    body: 'Every Kite plans, flies and decides for itself, then shares what it learns, so a handful of aircraft can hold an entire region.',
    bodyPos: 'swarm',
    table: [
      ['Autonomy', 'Plans, flies and lands with no pilot in the loop'],
      ['Scale', 'Add aircraft without adding operators'],
      ['Teamwork', 'Units split tasks and hand off targets live'],
      ['Reach', 'Watches thousands of square kilometres at once'],
    ],
    tags: ['KTE007', 'KTE008', 'KTE009'],
  },
  {
    id: 'mission', nav: 'Mission', len: 500, stop: 0.8,
    title: 'Mission profile',
    body: 'Keep a wide sector under constant watch and flag intrusions, hazards and early warning signs the moment they appear.',
    bodyPos: 'mission', cta: { label: 'Launch Mission', icon: 'right', action: 'next' },
  },
  {
    id: 'flock', nav: 'Sync', len: 500, stop: 0.8,
    body: 'Each aircraft streams what it sees to the rest, so the fleet moves and reacts as a single network.',
    bodyPos: 'bl',
    hud: [
      ['SYSTEM CHECK…', 'dim'],
      ['EO / IR / LIDAR / THERMAL [OK]'],
      ['COMPUTE: 2 CORES / DUAL GPU [READY]'],
      ['MESH: MERIDIAN LINK [UP]'],
    ],
  },
  {
    id: 'detect', nav: 'Detection', len: 500, stop: 0.8,
    title: 'Live detection',
    body: 'Finds and labels tens of thousands of objects across the whole sector while it flies.',
    bodyPos: 'bl',
    hud: [
      ['SCAN MODE: ON', 'dim'],
      ['COORD: [36.1862°N / 118.4127°W]'],
      ['ALT 1,310M | SPEED 78 KM/H'],
      ['27 CAR / 3 TRUCK / 2 PERSON / 1 UAV'],
    ],
  },
  {
    id: 'thermal', nav: 'Detection', len: 500, stop: 0.8,
    title: 'Heat signature<br>found',
    badge: { text: 'M-1 Confirmed', color: 'yellow', after: 3.2 },
    body: 'Thermal cameras pick up an unusual hot spot with rising smoke, and an alert goes out on its own.',
    bodyPos: 'bl',
    hud: [
      ['ALERT: HEAT ANOMALY', 'yellow'],
      ['COORD: [36.1907°N / 118.4061°W]'],
      ['ZONE LOCKED'],
      ['RESPONDERS NOTIFIED'],
    ],
  },
  {
    id: 'ignition', nav: 'Detection', len: 500, stop: 0.8,
    title: 'Fire confirmed',
    body: 'The Kite reaches the hot spot and verifies open flame at the reported position.',
    bodyPos: 'bl',
    hud: [
      ['ALERT: HEAT ANOMALY', 'dim'],
      ['COORD: [36.1907°N / 118.4061°W]'],
      ['SIGNAL STRENGTH: 91%'],
      ['CLASS: ACTIVE FIRE'],
    ],
  },
  {
    id: 'meridian', nav: 'Meridian AI', len: 500, stop: 0.8,
    title: 'Meridian AI',
    body: 'The command layer that plans, assigns and tracks every aircraft in a mission.',
    bodyPos: 'bl',
    hud: [
      ['SURVEY AREA', 'yellow'],
      ['COORD: [36.1907°N / 118.4061°W]'],
      ['SIGNAL STRENGTH: 91%'],
      ['ALERT: POSSIBLE THREATS'],
    ],
  },
  {
    id: 'analysis', nav: 'Sys Analysis', len: 500, stop: 0.8,
    title: 'Assess and predict',
    body: 'With thermal imaging on board, the fleet maps the burn and models where it will spread next.',
    bodyPos: 'bl',
    hud: [
      ['SIGNAL STRENGTH: 91%', 'dim'],
      ['ALERT: POSSIBLE THREATS'],
      ['2 AIRCRAFT SENT TO ZONE'],
      [[['2 FIRES', 'red'], [' + '], ['1 BLOCKED ROAD', 'red'], [' FOUND']]],
    ],
  },
  {
    id: 'alerts', nav: 'Int Alerts', len: 500, stop: 0.8,
    title: 'Connected alerts',
    body: 'The right agencies hear about it through the channels they already use, so ground crews stay in sync.',
    bodyPos: 'bl',
    hud: [
      [[['2 AIRCRAFT', 'dim'], [' SENT TO ZONE', 'dim']]],
      [[['2 FIRES', 'red'], [' + '], ['1 BLOCKED ROAD', 'red'], [' FOUND']]],
      ['AGENCIES CONTACTED'],
      [[['AREA STATUS: '], ['HELD', 'green']]],
    ],
  },
  {
    id: 'coord', nav: 'Coordination', len: 500, stop: 0.8,
    title: 'Fleet coordination',
    body: 'Aircraft share out coverage between themselves to widen the watch and back up weak spots.',
    bodyPos: 'bl',
    hud: [
      ['2 AIRCRAFT SENT TO ZONE', 'dim'],
      [[['2 FIRES', 'red'], [' + '], ['1 BLOCKED ROAD', 'red'], [' FOUND']]],
      ['AGENCIES CONTACTED'],
      [[['AREA STATUS: '], ['HELD', 'green']]],
    ],
  },
  {
    id: 'support', nav: 'Coordination', len: 500, stop: 0.8,
    title: 'Backup dispatched',
    body: 'The fleet spots a gap in coverage and sends another aircraft to hold and secure the site.',
    bodyPos: 'bl',
    hud: [
      ['COORD: [36.1907°N / 118.4061°W]', 'dim'],
      ['AIRCRAFT SENT TO ZONE'],
      ['ON STATION'],
      [[['FIRE', 'red'], [' NEAR SUBSTATION']]],
    ],
  },
  {
    id: 'secured', nav: 'Coordination', len: 100, stop: 0,
    title: 'Site secured',
    badge: { text: 'M-2 Complete', color: 'green', after: 0.6 },
    body: 'After a close pass, the Kite confirms the threat and hands the site over to response teams.',
    bodyPos: 'bl',
    hud: [
      [[['FIRE', 'red'], [' NEAR SUBSTATION']]],
      [[['FIRE CREWS', 'green'], [' DISPATCHED']]],
      ['RISK LEVEL: LOW'],
      [[['AREA STATUS: '], ['SECURED', 'green']]],
    ],
  },
  {
    id: 'multi', nav: 'Response', len: 500, stop: 0.8,
    title: 'Many sites, one picture',
    body: 'Full awareness across several incidents at once, with the fleet rebalancing itself as conditions change.',
    bodyPos: 'bl-wide',
  },
];

// Map-mode region chips per scene (colour + text + icon)
export const MAP_TAGS = {
  meridian: { text: 'SURVEY AREA', color: 'yellow', icon: 'alert' },
  analysis: { text: 'ACTIVE THREATS', color: 'red', icon: 'alert' },
  alerts: { text: 'CREWS ON SITE', color: 'green', icon: 'shield' },
  coord: { text: 'PROTECTED AREA', color: 'yellow', icon: 'alert' },
  support: { text: 'ALERT AREA', color: 'red', icon: 'alert' },
  secured: { text: 'AREA SECURED', color: 'green', icon: 'shield' },
};

export const SERVICE_TAGS = ['FIRE CREWS', 'MEDICAL', 'UTILITY CO.', 'POLICE', 'COUNTY OPS'];

export const MULTI_TAGS = [
  { text: 'CREWS ON SITE', color: 'green' },
  { text: 'AREA SECURED', color: 'green' },
  { text: 'ROAD CLEARED', color: 'green' },
  { text: 'POWER BACK', color: 'green' },
  { text: 'SEARCH COMPLETE', color: 'green' },
];

export const DETECT_LABELS = [
  'VEHICLE', 'CAMPFIRE', 'PERSON', 'POWER LINE', 'ROAD BLOCK', 'TOWER', 'MOTORBIKE', 'VEHICLE',
  'CAMPFIRE', 'ROAD BLOCK', 'TOWER', 'PERSON', 'VEHICLE', 'CAMPFIRE', 'POWER LINE', 'MOTORBIKE',
  'VEHICLE', 'CAMPFIRE', 'ROAD BLOCK', 'TOWER', 'VEHICLE', 'CAMPFIRE',
];

export const USE_CASES = [
  {
    title: 'Wildfire Front',
    text: 'Kite aircraft find ignition points early, track the fire line, watch over nearby homes and keep escape roads open until crews have it contained.',
    img: 'assets/case-wildfire.jpg',
  },
  {
    title: 'Border Watch',
    text: 'Autonomous units follow movement across long, empty frontiers, read hazardous weather and hold key areas steady when conditions turn.',
    img: 'assets/case-border.jpg',
  },
  {
    title: 'Grid Under Threat',
    text: 'The fleet ring-fences critical sites, isolates the danger, protects the surrounding area and supports crews while power is restored.',
    img: 'assets/case-grid.jpg',
  },
];

export const GLOBE_TEXT = 'Northvane flies long legs over huge territory, and has proven itself across very different missions.';

export const GLOBE_EVENTS = [
  { text: 'POWER BACK ONLINE', lat: 34, lon: -112 },
  { text: 'FLOOD ZONE CLEARED', lat: 41, lon: -95 },
  { text: 'EVACUATION ASSISTED', lat: 47, lon: -121 },
  { text: 'HIKER LOCATED', lat: 38, lon: -106 },
  { text: 'ROAD REOPENED', lat: 30, lon: -97 },
  { text: 'FIRE HELD', lat: 36, lon: -119 },
];

export const AUTONOMY = {
  title: 'See it fly<br>for real',
  body: 'Watch the full system run a live mission. Slots are limited, so ask for one and we will be in touch.',
  cta: 'Book a Demo',
};

export const FOUNDERS = {
  text: 'Our team comes from launch vehicles, consumer hardware, robotics, autonomy research and flight-test programs, and from operators who have used this kind of equipment in the field.',
  // Fictional wordmarks rendered as SVG text in main.js
  logos: [
    { name: 'ORBITAL WORKS', style: 'wide' },
    { name: 'lumen', style: 'round' },
    { name: 'KESTREL', style: 'mono' },
    { name: 'Axiom Labs', style: 'serif' },
    { name: 'SKYFORGE', style: 'mark' },
    { name: 'PARALLAX', style: 'thin' },
    { name: 'Vector/9', style: 'bold' },
    { name: 'FIELDLINE', style: 'wide' },
  ],
};

export const MENU = {
  links: [
    { label: 'Kite', go: 'specs' },
    { label: 'Meridian AI', go: 'meridian' },
    { label: 'Relay', go: 'flock' },
    { label: 'Atlas', go: '#globe' },
    { label: 'About Us', go: '#founders' },
  ],
  extras: [
    { title: "We're hiring", text: 'Join the engineers building aircraft that look after people.' },
    { title: 'Partner Program', text: 'We work with agencies responsible for large territories. Places are limited.' },
  ],
};

export const FOOTER = {
  cta: 'Want to talk to us?',
  button: 'Contact Us',
  copy: '© Northvane Inc.',
  links: ['Notes', 'Privacy Policy', 'Terms of Use'],
};
