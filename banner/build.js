const React = require("react");
const RDS = require("react-dom/server");
const fa = require("react-icons/fa");
const fs = require("fs");
const ic = (n, c = "#fff", s = 20) => RDS.renderToStaticMarkup(React.createElement(fa[n], { color: c, size: s }));
const C = { ink: "#0F172A", ink2: "#1E293B", navy: "#1E3A5F", teal: "#0D9488", tealL: "#5EEAD4", blue: "#2563EB", amber: "#F59E0B", violet: "#7C3AED", red: "#EF4444", grid: "#334155", mute: "#94A3B8", txt: "#E2E8F0" };
const F = "Inter, Helvetica, Arial, sans-serif";
const node = (x, y, r, fill, icon, is) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><g transform="translate(${x - is / 2},${y - is / 2})">${ic(icon, "#fff", is)}</g>`;
const text = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.s || 13}" font-weight="${o.w || 600}" fill="${o.c || C.txt}" text-anchor="${o.a || "middle"}"${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${t}</text>`;

let g = "";
// subtle dot grid background
for (let x = 20; x < 1584; x += 32) for (let y = 16; y < 396; y += 32) g += `<circle cx="${x}" cy="${y}" r="1.2" fill="#1E293B"/>`;

// --- top-left tagline (above photo zone) ---
g += text(48, 58, "TECHNICAL PROGRAM MANAGEMENT", { a: "start", s: 15, w: 700, c: C.tealL, ls: 3 });
g += text(48, 96, "× AGENTIC AI", { a: "start", s: 30, w: 800, c: "#fff" });
g += text(48, 126, "Where people, platforms and AI agents meet", { a: "start", s: 15, w: 500, c: C.mute });

// --- TPM hub ---
const hx = 650, hy = 208, R = 132;
const groups = [
  ["Engineering", "FaCode"], ["Product", "FaLightbulb"], ["Architecture", "FaSitemap"], ["Security", "FaShieldAlt"],
  ["SRE / Ops", "FaHeartbeat"], ["QA", "FaVial"], ["Business", "FaBriefcase"], ["Vendors", "FaHandshake"],
];
g += `<circle cx="${hx}" cy="${hy}" r="${R}" fill="none" stroke="${C.grid}" stroke-width="1.5" stroke-dasharray="4 5"/>`;
groups.forEach((gr, i) => {
  const a = (-90 + i * 45) * Math.PI / 180;
  const x = hx + R * Math.cos(a), y = hy + R * Math.sin(a);
  g += `<line x1="${hx}" y1="${hy}" x2="${x}" y2="${y}" stroke="${C.grid}" stroke-width="1.5"/>`;
});
groups.forEach((gr, i) => {
  const a = (-90 + i * 45) * Math.PI / 180;
  const x = hx + R * Math.cos(a), y = hy + R * Math.sin(a);
  g += node(x, y, 22, C.navy, gr[1], 20);
  const c = Math.cos(a), sn = Math.sin(a);
  let lx = x, ly = y, an = "middle";
  if (Math.abs(c) < 0.2) { ly = sn < 0 ? y - 30 : y + 40; }
  else { lx = x + (c > 0 ? 30 : -30); ly = y + 5; an = c > 0 ? "start" : "end"; }
  g += text(lx, ly, gr[0], { a: an, s: 13, w: 600 });
});
g += `<circle cx="${hx}" cy="${hy}" r="52" fill="${C.teal}"/><circle cx="${hx}" cy="${hy}" r="60" fill="none" stroke="${C.teal}" stroke-opacity=".35" stroke-width="6"/>`;
g += text(hx, hy + 2, "TPM", { s: 26, w: 800, c: "#fff" });
g += text(hx, hy + 22, "orchestrates", { s: 11, w: 500, c: "#CCFBF1" });

// --- bridge ---
g += `<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.tealL}"/></marker>
<marker id="ag" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${C.mute}"/></marker></defs>`;
g += `<line x1="880" y1="192" x2="958" y2="192" stroke="${C.tealL}" stroke-width="2" marker-end="url(#ar)"/>`;
g += `<line x1="958" y1="226" x2="880" y2="226" stroke="${C.mute}" stroke-width="2" marker-end="url(#ag)"/>`;
g += text(919, 182, "intent", { s: 11, w: 600, c: C.tealL });
g += text(919, 244, "telemetry", { s: 11, w: 600, c: C.mute });

// --- agentic SDLC racetrack ---
const x1 = 1040, x2 = 1460, y1 = 140, y2 = 290, rx = 75;
g += text(1250, 40, "THE AGENTIC SDLC", { s: 14, w: 700, c: C.tealL, ls: 3 });
g += `<rect x="${x1 - rx}" y="${y1}" width="${x2 - x1 + 2 * rx}" height="${y2 - y1}" rx="${rx}" fill="none" stroke="${C.grid}" stroke-width="3"/>`;
const top = [["Discover", "Discovery", "FaSearch", C.blue], ["Plan", "Planner", "FaClipboardList", C.blue], ["Build", "Coding", "FaCode", C.teal], ["Provision", "IaC", "FaServer", C.teal]];
const bot = [["Test", "Test", "FaVial", C.amber], ["Release", "Release", "FaRocket", C.amber], ["Operate", "SRE", "FaHeartbeat", C.violet], ["Report", "PMO", "FaChartLine", C.violet]];
const xs = [1040, 1180, 1320, 1460];
top.forEach((p, i) => {
  g += node(xs[i], y1, 25, p[3], p[2], 22);
  g += text(xs[i], y1 - 52, p[0], { s: 14, w: 700, c: "#fff" });
  g += text(xs[i], y1 - 35, p[1] + " agent", { s: 11, w: 500, c: C.mute });
});
bot.forEach((p, i) => {
  const x = xs[3 - i];
  g += node(x, y2, 25, p[3], p[2], 22);
  g += text(x, y2 + 46, p[0], { s: 14, w: 700, c: "#fff" });
  g += text(x, y2 + 63, p[1] + " agent", { s: 11, w: 500, c: C.mute });
});
// human gates: Plan->Build (top, between 1180 & 1320) and Release->Operate (bottom, between 1320 & 1180)
[[1250, y1], [1250, y2]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="13" fill="${C.red}" stroke="${C.ink}" stroke-width="3"/><g transform="translate(${x - 7},${y - 7})">${ic("FaLock", "#fff", 14)}</g>`; });
// center orchestrator
g += `<rect x="1150" y="183" width="200" height="64" rx="32" fill="${C.ink2}" stroke="${C.teal}" stroke-width="1.5"/>`;
g += `<g transform="translate(1166,199)">${ic("FaRobot", C.tealL, 32)}</g>`;
g += text(1268, 210, "Orchestrator", { s: 15, w: 700, c: "#fff" });
g += text(1268, 228, "+ 8 specialist agents", { s: 11, w: 500, c: C.mute });
// gate legend
g += `<circle cx="1528" cy="378" r="7" fill="${C.red}"/>` + text(1516, 382, "human approval gate", { a: "end", s: 11, w: 500, c: C.mute });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396"><rect width="1584" height="396" fill="${C.ink}"/>${g}</svg>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;background:${C.ink}}</style></head><body>${svg}</body></html>`;
fs.writeFileSync(__dirname + "/banner.html", html);
