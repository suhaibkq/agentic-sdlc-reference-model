const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const path = require("path");

const THEME = {
  name: "Agentic SDLC",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0F172A", lt1: "FFFFFF", dk2: "1E293B", lt2: "F1F5F9",
    accent1: "0D9488", accent2: "2563EB", accent3: "F59E0B",
    accent4: "10B981", accent5: "EF4444", accent6: "7C3AED",
    hlink: "2563EB", folHlink: "7C3AED",
  },
};
const K = {
  ink: "0F172A", ink2: "1E293B", slate: "475569", muted: "64748B", line: "CBD5E1",
  card: "F1F5F9", card2: "E2E8F0", white: "FFFFFF",
  teal: "0D9488", tealL: "CCFBF1", blue: "2563EB", blueL: "DBEAFE",
  amber: "F59E0B", amberL: "FEF3C7", green: "10B981", greenL: "D1FAE5",
  red: "EF4444", redL: "FEE2E2", violet: "7C3AED", violetL: "EDE9FE", gray: "94A3B8",
};
const FOOT = "Autonomous AI Agents in the AI-Driven SDLC  |  Suhaib Khalid";

const iconCache = {};
async function icon(name, color = "FFFFFF") {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  iconCache[key] = "image/png;base64," + buf.toString("base64");
  return iconCache[key];
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Suhaib Khalid";
pres.title = "Autonomous AI Agents and Their Role in the AI-Driven SDLC";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };

pres.defineSlideMaster({
  title: "CONTENT", background: { color: K.white },
  objects: [
    { text: { text: FOOT, options: { x: 0.5, y: 5.3, w: 6, h: 0.25, fontSize: 9, color: K.muted, margin: 0 } } },
  ],
  slideNumber: { x: 9.1, y: 5.3, w: 0.4, h: 0.25, fontSize: 9, color: K.muted, align: "right" },
});
pres.defineSlideMaster({ title: "DARK", background: { color: K.ink } });

// ---------- helpers ----------
function T(slide, text, opts) { slide.addText(text, Object.assign({ isTextBox: true, fontFace: "Calibri", margin: 0, valign: "top" }, opts)); }
function title(slide, t, sub) {
  T(slide, t, { x: 0.5, y: 0.28, w: 9, h: 0.5, fontSize: 24, bold: true, color: K.ink });
  if (sub) T(slide, sub, { x: 0.5, y: 0.78, w: 9, h: 0.3, fontSize: 12, color: K.slate });
}
function rect(slide, x, y, w, h, fill, opts = {}) {
  slide.addShape(opts.round === false ? pres.shapes.RECTANGLE : pres.shapes.ROUNDED_RECTANGLE,
    Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: opts.lineColor || fill, width: opts.lineW || 0.75 }, rectRadius: opts.r ?? 0.08 }, opts.extra || {}));
}
async function circ(slide, x, y, d, fill, ic, icColor = "FFFFFF") {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
  const p = d * 0.24;
  slide.addImage({ data: await icon(ic, icColor), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
function arrow(slide, x1, y1, x2, y2, color = K.gray, w = 1.5, dash) {
  slide.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: x2 < x1, flipV: y2 < y1, line: { color, width: w, endArrowType: "triangle", dashType: dash || "solid" } });
}
function line(slide, x1, y1, x2, y2, color = K.gray, w = 1, dash) {
  slide.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: x2 < x1, flipV: y2 < y1, line: { color, width: w, dashType: dash || "solid" } });
}
function pill(slide, x, y, w, text, fill, color) {
  rect(slide, x, y, w, 0.24, fill, { r: 0.12 });
  T(slide, text, { x, y, w, h: 0.24, fontSize: 9, bold: true, color, align: "center", valign: "middle" });
}
function donut(slide, x, y, d, vals, colors, center, sub) {
  slide.addChart(pres.charts.DOUGHNUT, [{ name: "Status", labels: ["Done", "In progress", "Blocked", "Not started"], values: vals }],
    { x, y, w: d, h: d, holeSize: 66, chartColors: colors, showLegend: false, showValue: false, showPercent: false, showLabel: false, dataBorder: { pt: 1, color: "FFFFFF" } });
  T(slide, center, { x, y: y + d / 2 - 0.27, w: d, h: 0.36, fontSize: 20, bold: true, color: K.ink, align: "center" });
  T(slide, sub, { x, y: y + d / 2 + 0.08, w: d, h: 0.22, fontSize: 9, color: K.muted, align: "center" });
}
function legend(slide, x, y, items) {
  items.forEach((it, i) => {
    slide.addShape(pres.shapes.OVAL, { x, y: y + i * 0.24 + 0.06, w: 0.12, h: 0.12, fill: { color: it[1] }, line: { color: it[1] } });
    T(slide, it[0], { x: x + 0.2, y: y + i * 0.24, w: 2, h: 0.24, fontSize: 10, color: K.ink2, valign: "middle" });
  });
}
// waterfall drawn with shapes: start, -closed, +added, end
function waterfall(slide, x, y, w, h, start, closed, added, end, ttl) {
  T(slide, ttl, { x, y, w, h: 0.25, fontSize: 11, bold: true, color: K.ink });
  const top = y + 0.45, base = y + h - 0.3, ch = base - top;
  const max = Math.max(start, end + 0) * 1.0;
  const sc = v => (v / max) * ch;
  const bw = w / 4 * 0.58, gap = w / 4;
  const bars = [
    { lab: "Start of week", v: start, y0: base - sc(start), hh: sc(start), c: K.blue, t: String(start) },
    { lab: "Completed", v: closed, y0: base - sc(start), hh: Math.max(sc(closed), 0.03), c: K.green, t: "−" + closed },
    { lab: "Scope added", v: added, y0: base - sc(start - closed), hh: Math.max(sc(added), 0.03), c: K.amber, t: "+" + added },
    { lab: "End of week", v: end, y0: base - sc(end), hh: sc(end), c: K.violet, t: String(end) },
  ];
  line(slide, x, base, x + w, base, K.line, 1);
  bars.forEach((b, i) => {
    const bx = x + i * gap + (gap - bw) / 2;
    slide.addShape(pres.shapes.RECTANGLE, { x: bx, y: b.y0, w: bw, h: b.hh, fill: { color: b.c }, line: { color: b.c } });
    T(slide, b.t, { x: bx - 0.2, y: b.y0 - 0.24, w: bw + 0.4, h: 0.22, fontSize: 11, bold: true, color: K.ink, align: "center" });
    T(slide, b.lab, { x: x + i * gap, y: base + 0.05, w: gap, h: 0.22, fontSize: 9, color: K.muted, align: "center" });
    if (i < 3) {
      const ny = i === 0 ? b.y0 : i === 1 ? b.y0 + b.hh : b.y0;
      const nx = x + (i + 1) * gap + (gap - bw) / 2;
      line(slide, bx + bw, ny, nx, ny, K.gray, 0.75, "dash");
    }
  });
}
function hbars(slide, x, y, w, rows, ttl, labW = 2.1) {
  T(slide, ttl, { x, y, w, h: 0.25, fontSize: 11, bold: true, color: K.ink });
  const rh = 0.34, bwMax = w - labW - 0.55;
  rows.forEach((r, i) => {
    const yy = y + 0.38 + i * rh;
    T(slide, r[0], { x, y: yy, w: labW - 0.1, h: 0.24, fontSize: 10, color: K.ink2, align: "right", valign: "middle" });
    rect(slide, x + labW, yy + 0.04, bwMax, 0.16, K.card2, { r: 0.08 });
    if (r[1] > 0) rect(slide, x + labW, yy + 0.04, Math.max(bwMax * r[1] / 100, 0.16), 0.16, r[2] || K.teal, { r: 0.08 });
    T(slide, r[3] || (r[1].toFixed(0) + "%"), { x: x + labW + bwMax + 0.08, y: yy, w: 0.5, h: 0.24, fontSize: 10, bold: true, color: K.ink, valign: "middle" });
  });
}
function kpi(slide, x, y, w, val, lab, col) {
  rect(slide, x, y, w, 0.95, K.card);
  T(slide, val, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.45, fontSize: 24, bold: true, color: col });
  T(slide, lab, { x: x + 0.15, y: y + 0.56, w: w - 0.3, h: 0.32, fontSize: 10, color: K.slate });
}
function section(n, ttl, sub, ic) {
  return (async () => {
    const s = pres.addSlide({ masterName: "DARK" });
    T(s, "WORKSTREAM " + n, { x: 0.8, y: 1.55, w: 6, h: 0.3, fontSize: 13, bold: true, color: K.teal, charSpacing: 3 });
    T(s, ttl, { x: 0.8, y: 1.9, w: 6.6, h: 1.3, fontSize: 34, bold: true, color: K.white });
    T(s, sub, { x: 0.8, y: 3.3, w: 6.2, h: 0.8, fontSize: 14, color: "CBD5E1" });
    await circ(s, 7.6, 1.7, 1.7, K.teal, ic);
    return s;
  })();
}

(async () => {
  // ===== 1. Title =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    // agent constellation motif
    const nodes = [[7.9, 1.2], [8.9, 2.0], [7.4, 2.6], [8.6, 3.4], [7.7, 4.1], [9.2, 4.4]];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [1, 2]];
    edges.forEach(e => line(s, nodes[e[0]][0], nodes[e[0]][1], nodes[e[1]][0], nodes[e[1]][1], "334155", 1));
    const ics = ["FaRobot", "FaCode", "FaDatabase", "FaCloud", "FaShieldAlt", "FaChartLine"];
    for (let i = 0; i < nodes.length; i++) await circ(s, nodes[i][0] - 0.28, nodes[i][1] - 0.28, 0.56, i === 0 ? K.teal : "1E3A5F", ics[i]);
    T(s, "AGENTIC SDLC  ·  CLOUD MIGRATION REFERENCE MODEL", { x: 0.7, y: 1.0, w: 6.5, h: 0.3, fontSize: 11, bold: true, color: K.teal, charSpacing: 2 });
    T(s, "Autonomous AI Agents", { x: 0.7, y: 1.4, w: 6.6, h: 0.75, fontSize: 40, bold: true, color: K.white });
    T(s, "and Their Role in the AI-Driven Software Development Lifecycle", { x: 0.7, y: 2.15, w: 6.4, h: 0.9, fontSize: 22, color: "E2E8F0" });
    T(s, "Kubernetes applications  ·  Datastores  ·  Serverless & batch workloads  ·  Legacy monolith modernization",
      { x: 0.7, y: 3.25, w: 6.4, h: 0.5, fontSize: 12, color: "94A3B8" });
    T(s, [{ text: "Suhaib Khalid", options: { bold: true, color: K.white, breakLine: true } },
          { text: "Senior Technical Program Manager  ·  PMP · PMI-ACP · AWS Solutions Architect", options: { color: "94A3B8" } }],
      { x: 0.7, y: 4.35, w: 6.4, h: 0.55, fontSize: 11 });
    s.addNotes("Reference model for applying autonomous AI agents across the SDLC of a large enterprise cloud re-platforming program. Metrics are anonymized, point-in-time illustrations of program scale.");
  }

  // ===== 2. Program at a glance =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "One program, four very different migration problems",
      "Anonymized Q4 snapshot of an enterprise move to a hardened Kubernetes cloud platform (≈ 4 weeks into the quarter)");
    kpi(s, 0.5, 1.25, 2.1, "761", "work items across 63 epics", K.ink);
    kpi(s, 2.73, 1.25, 2.1, "131", "delivered / verified (17%)", K.green);
    kpi(s, 4.96, 1.25, 2.1, "77", "in active development", K.blue);
    kpi(s, 7.19, 1.25, 2.3, "19", "blocked — mostly on decisions & access, not code", K.red);
    const ws = [
      ["Kubernetes applications", "435 items · 9 epics", "FaCubes", K.blue],
      ["Datastores", "174 items · 16 epics", "FaDatabase", K.teal],
      ["Serverless, batch & tooling", "133 items · 29 epics", "FaBolt", K.amber],
      ["Legacy monolith", "19 items · 9 epics", "FaLayerGroup", K.violet],
    ];
    for (let i = 0; i < 4; i++) {
      const y = 2.45 + i * 0.66;
      await circ(s, 0.5, y, 0.5, ws[i][3], ws[i][2]);
      T(s, ws[i][0], { x: 1.12, y: y + 0.02, w: 2.6, h: 0.26, fontSize: 13, bold: true, color: K.ink });
      T(s, ws[i][1], { x: 1.12, y: y + 0.27, w: 2.6, h: 0.22, fontSize: 10, color: K.muted });
    }
    s.addChart(pres.charts.BAR, [
      { name: "Done", labels: ["Kubernetes apps", "Datastores", "Serverless & batch", "Legacy monolith"], values: [6.9, 35.1, 22.6, 52.6] },
      { name: "In progress", labels: ["Kubernetes apps", "Datastores", "Serverless & batch", "Legacy monolith"], values: [5.1, 8.0, 29.3, 10.5] },
      { name: "Blocked", labels: ["Kubernetes apps", "Datastores", "Serverless & batch", "Legacy monolith"], values: [1.4, 6.9, 0.8, 0] },
      { name: "Not started", labels: ["Kubernetes apps", "Datastores", "Serverless & batch", "Legacy monolith"], values: [86.6, 50.0, 47.3, 36.9] },
    ], {
      x: 3.9, y: 2.3, w: 5.6, h: 2.9, barDir: "bar", barGrouping: "percentStacked", catAxisOrientation: "maxMin",
      chartColors: [K.green, K.blue, K.red, "CBD5E1"], showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: "+mn-lt",
      catAxisLabelFontSize: 10, catAxisLabelColor: K.ink2, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true,
      valGridLine: { style: "none" }, catGridLine: { style: "none" }, barGapWidthPct: 45,
      showTitle: true, title: "Status mix by workstream (% of scope)", titleFontSize: 11, titleColor: K.ink, titleFontFace: "+mn-lt",
    });
    s.addNotes("Totals: 435 + 174 + 133 + 19 = 761 work items. Done 30 + 61 + 30 + 10 = 131. In progress 22 + 14 + 39 + 2 = 77. Blocked 6 + 12 + 1 + 0 = 19.");
  }

  // ===== 3. Agentic SDLC reference model =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Agentic SDLC: specialist agents in every phase",
      "Each phase is a loop of plan → act → verify, with a human approval gate before anything reaches production");
    const ph = [
      ["Discover", "Discovery agent", "Inventory, dependency graph, usage telemetry", "FaSearch", K.blue],
      ["Plan", "Planner agent", "Epics, stories, sequencing, risk register", "FaClipboardList", K.blue],
      ["Build", "Coding agent", "Code, Helm charts, schema conversion, SDK upgrades", "FaCode", K.teal],
      ["Provision", "IaC agent", "Terraform modules, IAM, policy-as-code checks", "FaServer", K.teal],
      ["Test", "Test agent", "Unit, integration, data-parity, canary checks", "FaVial", K.amber],
      ["Release", "Release agent", "CI/CD pipelines, change requests, DNS cutover", "FaRocket", K.amber],
      ["Operate", "SRE agent", "Observability, drift detection, rollback triggers", "FaHeartbeat", K.violet],
      ["Report", "PMO agent", "Dashboards, burndown, dependency & risk digests", "FaChartLine", K.violet],
    ];
    const cw = 2.1, chh = 1.62, gx = 0.2;
    for (let i = 0; i < 8; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 0.5 + col * (cw + gx), y = 1.3 + row * (chh + 0.32);
      rect(s, x, y, cw, chh, K.card);
      await circ(s, x + 0.15, y + 0.15, 0.48, ph[i][4], ph[i][3]);
      T(s, (i + 1) + ". " + ph[i][0], { x: x + 0.72, y: y + 0.16, w: cw - 0.8, h: 0.24, fontSize: 13, bold: true, color: K.ink });
      T(s, ph[i][1], { x: x + 0.72, y: y + 0.4, w: cw - 0.8, h: 0.22, fontSize: 10, bold: true, color: ph[i][4] });
      T(s, ph[i][2], { x: x + 0.15, y: y + 0.76, w: cw - 0.3, h: 0.75, fontSize: 11, color: K.slate });
      if (col < 3) arrow(s, x + cw + 0.02, y + chh / 2, x + cw + gx - 0.02, y + chh / 2, K.gray, 1.25);
    }
    // human gates on Plan->Build and Release->Operate arrows
    for (const gy of [1.3 + chh / 2, 1.3 + chh + 0.32 + chh / 2]) await circ(s, 5.0 - 0.17, gy - 0.17, 0.34, K.red, "FaLock");
    await circ(s, 0.5, 4.93, 0.24, K.red, "FaLock");
    T(s, "Human approval gate: scope sign-off before build; production change approval before operate", { x: 0.82, y: 4.93, w: 8, h: 0.24, fontSize: 10, color: K.slate, valign: "middle" });
    s.addNotes("Human gates sit after Plan (scope approval) and after Release (production change approval). Agents never apply production changes without an approved change request.");
  }

  // ===== 4. Agent architecture network diagram =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Reference architecture: orchestrator, agents and tools",
      "Agents reach enterprise systems through tool connectors (e.g., Model Context Protocol), never through standing credentials");
    // human
    await circ(s, 0.55, 2.55, 0.62, K.ink2, "FaUserTie");
    T(s, "TPM / Engineer", { x: 0.2, y: 3.2, w: 1.35, h: 0.22, fontSize: 10, bold: true, color: K.ink, align: "center" });
    T(s, "intent, approvals", { x: 0.2, y: 3.42, w: 1.35, h: 0.2, fontSize: 9, color: K.muted, align: "center" });
    arrow(s, 1.25, 2.86, 2.0, 2.86, K.ink2, 1.5);
    // orchestrator
    rect(s, 2.05, 2.2, 1.7, 1.32, K.teal);
    await circ(s, 2.65, 2.3, 0.5, "0F766E", "FaRobot");
    T(s, "Orchestrator agent", { x: 2.1, y: 2.85, w: 1.6, h: 0.24, fontSize: 11, bold: true, color: K.white, align: "center" });
    T(s, "plans, delegates, verifies", { x: 2.1, y: 3.08, w: 1.6, h: 0.22, fontSize: 9, color: "CCFBF1", align: "center" });
    // specialist agents column
    const ag = [["Discovery", "FaSearch"], ["Coding", "FaCode"], ["IaC", "FaServer"], ["Test", "FaVial"], ["Release", "FaRocket"], ["PMO / Reporting", "FaChartLine"]];
    for (let i = 0; i < ag.length; i++) {
      const y = 1.22 + i * 0.54;
      rect(s, 4.35, y, 1.75, 0.44, K.blueL);
      await circ(s, 4.42, y + 0.05, 0.34, K.blue, ag[i][1]);
      T(s, ag[i][0] + " agent", { x: 4.85, y, w: 1.25, h: 0.44, fontSize: 10, bold: true, color: K.ink, valign: "middle" });
      line(s, 3.75, 2.86, 4.35, y + 0.22, K.teal, 1);
    }
    // tool layer
    rect(s, 6.55, 1.2, 2.95, 3.85, K.card, { r: 0.06 });
    T(s, "TOOL CONNECTORS", { x: 6.7, y: 1.28, w: 2.6, h: 0.22, fontSize: 9, bold: true, color: K.muted, charSpacing: 2 });
    const tools = [["Source control & PRs", "FaGitAlt"], ["CI/CD pipelines", "FaSyncAlt"], ["Terraform / IaC state", "FaCubes"], ["Work tracker & CMDB", "FaClipboardList"],
      ["Observability & logs", "FaHeartbeat"], ["Secrets manager", "FaKey"], ["Team chat", "FaComments"]];
    for (let i = 0; i < tools.length; i++) {
      const y = 1.55 + i * 0.49;
      await circ(s, 6.72, y, 0.36, K.slate, tools[i][1]);
      T(s, tools[i][0], { x: 7.18, y, w: 2.25, h: 0.36, fontSize: 10, color: K.ink2, valign: "middle" });
    }
    arrow(s, 6.12, 2.86, 6.53, 2.86, K.slate, 1.5);
    arrow(s, 6.53, 3.2, 6.12, 3.2, K.slate, 1.5);
    // guardrail band
    rect(s, 0.5, 4.55, 5.6, 0.5, K.redL);
    await circ(s, 0.6, 4.62, 0.36, K.red, "FaShieldAlt");
    T(s, "Guardrails: least-privilege IAM · policy-as-code (OPA) · branch protection · change-request approval · full audit trail",
      { x: 1.05, y: 4.55, w: 5.0, h: 0.5, fontSize: 10, color: "7F1D1D", valign: "middle" });
  }

  // ===== Section 1 =====
  await section(1, "Kubernetes application migration", "Containerized services move from a legacy cluster to a hardened target platform: pipelines, IaC, ingress and DNS cutover.", "FaCubes");

  // ===== 6. K8s workflow + network =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Kubernetes apps: a repeatable per-service migration factory",
      "Same 7-step path for every service; agents do the repetitive build work and humans own the cutover decision");
    // workflow chevrons
    const st = [["Assess", "Discovery"], ["Re-pipeline", "Coding"], ["Provision", "IaC"], ["Deploy", "Release"], ["Verify", "Test"], ["Cutover", "Release"], ["Prod & retire", "Human"]];
    const w = 1.27;
    st.forEach((p, i) => {
      const x = 0.5 + i * (w + 0.02);
      s.addShape(i === 0 ? pres.shapes.PENTAGON : pres.shapes.CHEVRON, { x, y: 1.25, w, h: 0.62, fill: { color: i === 6 ? K.ink2 : i % 2 ? K.blue : "1D4ED8" }, line: { color: K.white, width: 1 } });
      T(s, p[0], { x: x + 0.24, y: 1.25, w: w - 0.42, h: 0.62, fontSize: 10, bold: true, color: K.white, align: "center", valign: "middle" });
      T(s, p[1] + (p[1] === "Human" ? " gate" : " agent"), { x, y: 1.92, w, h: 0.2, fontSize: 9, color: p[1] === "Human" ? "B91C1C" : K.blue, align: "center", bold: true });
    });
    // network diagram
    rect(s, 0.5, 2.4, 9.0, 2.75, K.card, { r: 0.06 });
    T(s, "MIGRATION TOPOLOGY", { x: 0.65, y: 2.48, w: 3, h: 0.2, fontSize: 9, bold: true, color: K.muted, charSpacing: 2 });
    // users
    await circ(s, 0.75, 3.45, 0.55, K.slate, "FaUsers");
    T(s, "Clients", { x: 0.6, y: 4.02, w: 0.85, h: 0.2, fontSize: 9, color: K.ink2, align: "center" });
    // DNS
    await circ(s, 1.85, 3.45, 0.55, K.amber, "FaGlobe");
    T(s, "DNS (weighted)", { x: 1.55, y: 4.02, w: 1.15, h: 0.2, fontSize: 9, color: K.ink2, align: "center" });
    arrow(s, 1.32, 3.72, 1.83, 3.72, K.gray);
    // legacy cluster
    rect(s, 3.05, 2.75, 2.5, 1.0, K.white, { lineColor: K.line });
    await circ(s, 3.15, 2.92, 0.42, K.gray, "FaCube");
    T(s, [{ text: "Legacy cluster", options: { bold: true, breakLine: true } }, { text: "old pipelines · shared ingress", options: { color: K.muted, fontSize: 9 } }],
      { x: 3.65, y: 2.88, w: 1.85, h: 0.6, fontSize: 10, color: K.ink });
    // target cluster
    rect(s, 3.05, 4.0, 2.5, 1.0, K.white, { lineColor: K.teal, lineW: 1.5 });
    await circ(s, 3.15, 4.17, 0.42, K.teal, "FaCubes");
    T(s, [{ text: "Target platform", options: { bold: true, breakLine: true } }, { text: "private ingress · GitOps · IaC", options: { color: K.muted, fontSize: 9 } }],
      { x: 3.65, y: 4.13, w: 1.85, h: 0.6, fontSize: 10, color: K.ink });
    arrow(s, 2.42, 3.6, 3.03, 3.25, K.gray, 1.25, "dash");
    arrow(s, 2.42, 3.85, 3.03, 4.5, K.teal, 2);
    T(s, "traffic shift", { x: 2.25, y: 4.35, w: 0.8, h: 0.2, fontSize: 8, color: K.teal, italic: true });
    // agent loop
    rect(s, 6.0, 2.75, 3.35, 2.25, K.white, { lineColor: K.line });
    T(s, "Where agents add leverage", { x: 6.15, y: 2.85, w: 3.1, h: 0.24, fontSize: 11, bold: true, color: K.ink });
    T(s, [
      { text: "Generate pipeline workflows & Helm values per service", options: { bullet: true, breakLine: true } },
      { text: "Detect Terraform state drift before apply", options: { bullet: true, breakLine: true } },
      { text: "Watch canary latency; recommend rollback on gateway timeouts", options: { bullet: true, breakLine: true } },
      { text: "Draft change requests with evidence attached", options: { bullet: true } },
    ], { x: 6.15, y: 3.15, w: 3.1, h: 1.8, fontSize: 10.5, color: K.slate, paraSpaceAfter: 4 });
  }

  // ===== 7. K8s telemetry =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Kubernetes apps: early in the curve, velocity accelerating",
      "435 items (77 deliverable stories/tasks + 349 sub-tasks); one week of status telemetry");
    donut(s, 0.5, 1.3, 2.2, [30, 22, 6, 377], [K.green, K.blue, K.red, "CBD5E1"], "6.9%", "30 of 435 done");
    legend(s, 0.6, 3.6, [["Done 30", K.green], ["In progress 22", K.blue], ["Blocked 6", K.red], ["Not started 377", "CBD5E1"]]);
    waterfall(s, 3.05, 1.25, 3.2, 2.35, 74, 18, 8, 64, "Weekly net-flux burndown (open items)");
    // WoW velocity
    s.addChart(pres.charts.BAR, [{ name: "Items touched", labels: ["Week 41", "Week 42", "Week 43"], values: [23, 25, 52] }], {
      x: 3.0, y: 3.75, w: 3.3, h: 1.45, barDir: "col", chartColors: [K.blue], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 9, dataLabelColor: K.ink,
      valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, catAxisLabelFontSize: 9, catAxisLabelColor: K.slate, catAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt",
      showTitle: true, title: "Week-over-week items touched", titleFontSize: 10, titleColor: K.ink, titleFontFace: "+mn-lt", showLegend: false, barGapWidthPct: 60, valAxisMaxVal: 65,
    });
    // risks
    rect(s, 6.55, 1.25, 2.95, 3.95, K.card);
    T(s, "Risks surfaced in weekly telemetry", { x: 6.7, y: 1.35, w: 2.7, h: 0.25, fontSize: 11, bold: true, color: K.ink });
    const rk = [["HIGH", K.red, "Legacy service retirement waits on a business decision about active users"],
      ["MED", K.amber, "Staging DNS cutover rolled back after private-ingress gateway timeouts"],
      ["MED", K.amber, "Message-broker sunset decision has held 2 services for ~300 days"],
      ["LOW", K.blue, "Change-approval lead time on cutover requests"]];
    rk.forEach((r, i) => {
      const y = 1.72 + i * 0.85;
      pill(s, 6.7, y, 0.55, r[0], r[1], K.white);
      T(s, r[2], { x: 7.33, y: y - 0.03, w: 2.1, h: 0.8, fontSize: 10, color: K.slate });
    });
  }

  // ===== Section 2 =====
  await section(2, "Migrating a variety of datastores", "Relational, search, streaming, file and object stores: each needs its own pattern for conversion, replication, validation and cutover.", "FaDatabase");

  // ===== 9. Datastore patterns =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Datastores: one pipeline, five pattern variants",
      "Agents generate the conversion and validation artifacts; the cutover window is always a human-scheduled event");
    // pipeline diagram
    const nodes = [["Source DB", "FaDatabase", K.gray], ["CDC / replication", "FaExchangeAlt", K.blue], ["Stream / staging", "FaStream", K.blue], ["Target DB", "FaDatabase", K.teal], ["Parity checks", "FaCheckDouble", K.green]];
    for (let i = 0; i < nodes.length; i++) {
      const x = 0.7 + i * 1.85;
      await circ(s, x, 1.3, 0.62, nodes[i][2], nodes[i][1]);
      T(s, nodes[i][0], { x: x - 0.45, y: 1.96, w: 1.52, h: 0.22, fontSize: 10, bold: true, color: K.ink, align: "center" });
      if (i < 4) arrow(s, x + 0.66, 1.61, x + 1.81, 1.61, K.gray, 1.5);
    }
    T(s, "schema-conversion agent", { x: 2.25, y: 1.18, w: 1.6, h: 0.2, fontSize: 8.5, italic: true, color: K.teal, align: "center" });
    T(s, "test agent: row counts, checksums", { x: 6.2, y: 1.18, w: 2.0, h: 0.2, fontSize: 8.5, italic: true, color: K.green, align: "center" });
    // pattern table
    const rows = [
      [{ text: "Pattern", options: { bold: true, color: K.white, fill: { color: K.ink2 } } }, { text: "Example scope", options: { bold: true, color: K.white, fill: { color: K.ink2 } } }, { text: "What the agent produces", options: { bold: true, color: K.white, fill: { color: K.ink2 } } }],
      ["Engine conversion", "Commercial SQL → PostgreSQL (2 APIs)", "Schema & query rewrite, data-copy scripts, cutover runbook"],
      ["Version upgrade / re-host", "PostgreSQL upgrade on managed RDS", "Upgrade plan, parameter diff, pre-checks"],
      ["Search cluster", "Elasticsearch auth hardening & v5 sunset", "Client code for basic-auth, secrets wiring, index audit"],
      ["Streaming / CDC", "Kafka topic migration & cluster merge", "Connector configs, topic mapping, observability"],
      ["File & object storage", "Network file system volume sync; buckets", "Cross-account copy jobs, mount-target switch plan"],
    ];
    s.addTable(rows, { x: 0.5, y: 2.45, w: 9.0, colW: [2.0, 3.1, 3.9], fontSize: 10, fontFace: "Calibri", color: K.ink2, border: { type: "solid", pt: 0.5, color: K.line }, rowH: 0.42, valign: "middle", margin: 0.06, fill: { color: K.white } });
  }

  // ===== 10. Datastore telemetry =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Datastores: furthest along, and where dependency chains bite",
      "174 items across 16 epics; 12 blocked items are almost all chained prerequisites");
    donut(s, 0.5, 1.3, 2.0, [61, 14, 12, 87], [K.green, K.blue, K.red, "CBD5E1"], "35.1%", "61 of 174 done");
    legend(s, 0.6, 3.45, [["Done 61", K.green], ["In progress 14", K.blue], ["Blocked 12", K.red], ["Not started 87", "CBD5E1"]]);
    hbars(s, 2.85, 1.25, 3.9, [
      ["Service datastore re-host", 100, K.green], ["Postgres upgrade & prep", 81], ["Search audit cluster", 71.4], ["Search v5 sunset", 57.1],
      ["Replication infra prep", 33.3], ["Kafka topic merge", 30.8], ["Search datastores", 19.0, K.amber], ["Engine conversion", 0, K.gray, "0%"],
    ], "Completion by epic", 1.85);
    // dependency chain
    rect(s, 6.95, 1.25, 2.55, 3.95, K.card);
    T(s, "Blocked dependency chain", { x: 7.08, y: 1.33, w: 2.35, h: 0.25, fontSize: 11, bold: true, color: K.ink });
    const ch = [["Provision new DB instance", K.red], ["Convert schema & queries", K.amber], ["Migrate data", K.amber], ["Cut over to PostgreSQL", K.amber]];
    ch.forEach((c, i) => {
      const y = 1.72 + i * 0.68;
      rect(s, 7.1, y, 2.25, 0.46, K.white, { lineColor: c[1], lineW: 1.25 });
      T(s, c[0], { x: 7.18, y, w: 2.1, h: 0.46, fontSize: 10, color: K.ink, valign: "middle" });
      if (i < 3) arrow(s, 8.22, y + 0.47, 8.22, y + 0.67, K.slate, 1.25);
    });
    T(s, "One missing prerequisite holds 6 downstream items for 77 days", { x: 7.08, y: 4.48, w: 2.35, h: 0.6, fontSize: 10, italic: true, color: "B91C1C" });
  }

  // ===== Section 3 =====
  await section(3, "Serverless functions, batch jobs and platform tooling", "The long tail: functions, scheduled jobs, build agents, deploy targets, snapshots and buckets. Migrate, modernize or retire.", "FaBolt");

  // ===== 12. Misc workflow: decision tree =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Long tail: agents make migrate-or-retire evidence-based",
      "Usage telemetry, ownership and dependencies decide each workload's path; humans confirm before anything is deleted");
    // inventory node
    await circ(s, 0.6, 2.45, 0.7, K.amber, "FaListAlt");
    T(s, "Discovery agent inventory", { x: 0.25, y: 3.2, w: 1.4, h: 0.4, fontSize: 10, bold: true, color: K.ink, align: "center" });
    // decision diamond
    s.addShape(pres.shapes.DIAMOND, { x: 1.95, y: 2.2, w: 1.5, h: 1.2, fill: { color: K.ink2 }, line: { color: K.ink2 } });
    T(s, "Invoked in last 90 days?", { x: 2.12, y: 2.4, w: 1.16, h: 0.8, fontSize: 10, bold: true, color: K.white, align: "center", valign: "middle" });
    arrow(s, 1.35, 2.8, 1.93, 2.8, K.gray);
    // branches
    const br = [
      { y: 1.3, lab: "YES · owned", t: "Migrate / re-platform", d: "Re-pipeline to target platform; IaC generated", c: K.blue, ic: "FaExchangeAlt" },
      { y: 2.45, lab: "YES · duplicate", t: "Consolidate", d: "Fold into a service or managed scheduler", c: K.teal, ic: "FaCompressArrowsAlt" },
      { y: 3.6, lab: "NO", t: "Retire", d: "Staged decommission, then clean IAM roles, schedules, logs; archive repo", c: K.red, ic: "FaArchive" },
    ];
    for (const b of br) {
      arrow(s, 3.47, 2.8, 4.25, b.y + 0.4, K.gray, 1.25);
      T(s, b.lab, { x: 3.5, y: b.y + 0.08, w: 0.85, h: 0.18, fontSize: 8, bold: true, color: K.slate });
      rect(s, 4.3, b.y, 2.55, 0.92, K.card);
      await circ(s, 4.4, b.y + 0.2, 0.5, b.c, b.ic);
      T(s, b.t, { x: 5.0, y: b.y + 0.08, w: 1.8, h: 0.26, fontSize: 12, bold: true, color: K.ink });
      T(s, b.d, { x: 5.0, y: b.y + 0.34, w: 1.8, h: 0.55, fontSize: 9, color: K.slate });
    }
    // workload types
    rect(s, 7.15, 1.3, 2.35, 3.22, K.ink2);
    T(s, "Workload types in scope", { x: 7.3, y: 1.4, w: 2.1, h: 0.25, fontSize: 11, bold: true, color: K.white });
    const wt = [["Serverless functions", "FaBolt"], ["Batch & cron jobs", "FaClock"], ["CI build agents", "FaHammer"], ["Deployment targets", "FaRocket"], ["Volume snapshots", "FaHdd"], ["Object-storage buckets", "FaBoxes"], ["Legacy core networking", "FaNetworkWired"]];
    for (let i = 0; i < wt.length; i++) {
      const y = 1.75 + i * 0.39;
      s.addImage({ data: await icon(wt[i][1], "5EEAD4"), x: 7.32, y: y + 0.05, w: 0.22, h: 0.22 });
      T(s, wt[i][0], { x: 7.65, y, w: 1.8, h: 0.32, fontSize: 10, color: "E2E8F0", valign: "middle" });
    }
    rect(s, 0.5, 4.65, 9.0, 0.48, K.amberL);
    T(s, "Guardrail: nothing is deleted until cross-team ownership is confirmed. One orphan-batch-job cleanup waited 60 days on exactly that audit.",
      { x: 0.65, y: 4.65, w: 8.7, h: 0.48, fontSize: 10.5, color: "78350F", valign: "middle" });
  }

  // ===== 13. Misc telemetry =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Long-tail workloads: highest throughput of the four streams",
      "133 items across 29 epics; 13 items closed in one week, with 31 function retirements in flight");
    donut(s, 0.5, 1.3, 2.0, [30, 39, 1, 63], [K.green, K.blue, K.red, "CBD5E1"], "22.6%", "30 of 133 done");
    legend(s, 0.6, 3.45, [["Done 30", K.green], ["In progress 39", K.blue], ["Blocked 1", K.red], ["Not started 63", "CBD5E1"]]);
    hbars(s, 2.85, 1.25, 3.55, [
      ["Legacy core networking", 75], ["CI build agents", 60], ["Deployment targets", 55.6], ["Volume snapshots", 50],
      ["Object-storage buckets", 28.6, K.amber], ["Orphan batch jobs", 25, K.amber], ["Function retirement", 0, K.blue, "31 WIP"],
    ], "Completion by epic", 1.75);
    waterfall(s, 6.6, 1.25, 2.9, 2.4, 54, 13, 3, 44, "Weekly net-flux burndown");
    rect(s, 6.6, 3.95, 2.9, 1.2, K.greenL);
    T(s, [{ text: "12 functions retired in one week", options: { bold: true, breakLine: true } },
          { text: "across staging and production, with IAM roles, event schedules and log subscriptions cleaned up in the same change.", options: {} }],
      { x: 6.72, y: 4.02, w: 2.7, h: 1.08, fontSize: 10, color: "065F46" });
  }

  // ===== Section 4 =====
  await section(4, "Modernizing a legacy monolith", "A decades-old, semi-manual platform (config-managed servers, hand-run deploys) moves to the target platform, one component at a time.", "FaLayerGroup");

  // ===== 15. Strangler fig =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Legacy monolith: agent-assisted strangler-fig extraction",
      "A routing facade shifts traffic component by component, so the legacy system shrinks while the business keeps running");
    // monolith block
    rect(s, 0.5, 1.3, 2.8, 3.25, K.card2, { lineColor: K.gray });
    T(s, "LEGACY MONOLITH", { x: 0.6, y: 1.36, w: 2.6, h: 0.22, fontSize: 9, bold: true, color: K.slate, charSpacing: 2 });
    const comps = ["Core services", "Pricing & calculation engine", "Inventory synchronization", "External API integration", "Database", "Monitoring & alerting"];
    comps.forEach((c, i) => {
      rect(s, 0.65, 1.66 + i * 0.47, 2.5, 0.38, K.white, { lineColor: K.line });
      T(s, c, { x: 0.75, y: 1.66 + i * 0.47, w: 2.35, h: 0.38, fontSize: 10, color: K.ink2, valign: "middle" });
    });
    // facade
    rect(s, 3.75, 2.2, 1.3, 1.3, K.amber);
    await circ(s, 4.15, 2.3, 0.5, "B45309", "FaRandom");
    T(s, "Routing facade", { x: 3.75, y: 2.85, w: 1.3, h: 0.25, fontSize: 10, bold: true, color: K.white, align: "center" });
    T(s, "internal ingress", { x: 3.75, y: 3.08, w: 1.3, h: 0.22, fontSize: 9, color: "FEF3C7", align: "center" });
    arrow(s, 3.73, 2.85, 3.32, 2.85, K.gray, 1.5, "dash");
    arrow(s, 5.07, 2.85, 5.5, 2.85, K.teal, 2);
    // target
    rect(s, 5.55, 1.3, 1.6, 3.25, K.tealL, { lineColor: K.teal });
    T(s, "TARGET PLATFORM", { x: 5.6, y: 1.36, w: 1.5, h: 0.22, fontSize: 9, bold: true, color: "0F766E", charSpacing: 1 });
    ["Core svc", "Pricing", "Inventory"].forEach((c, i) => {
      rect(s, 5.7, 1.7 + i * 0.6, 1.3, 0.45, K.teal);
      T(s, c, { x: 5.7, y: 1.7 + i * 0.6, w: 1.3, h: 0.45, fontSize: 10, bold: true, color: K.white, align: "center", valign: "middle" });
    });
    T(s, "…extracted one at a time", { x: 5.6, y: 3.55, w: 1.5, h: 0.4, fontSize: 9, italic: true, color: "0F766E", align: "center" });
    // agent roles
    T(s, "Agent roles", { x: 7.45, y: 1.3, w: 2, h: 0.25, fontSize: 12, bold: true, color: K.ink });
    const roles = [["FaBook", "Code-comprehension agent", "maps undocumented modules & call paths"], ["FaCode", "Coding agent", "cloud SDK upgrades across many repos"],
      ["FaServer", "IaC agent", "config-management playbooks → Terraform"], ["FaRocket", "Release agent", "zero-downtime deploy patterns"]];
    for (let i = 0; i < roles.length; i++) {
      const y = 1.65 + i * 0.75;
      await circ(s, 7.45, y, 0.42, K.violet, roles[i][0]);
      T(s, [{ text: roles[i][1], options: { bold: true, color: K.ink, breakLine: true } }, { text: roles[i][2], options: { color: K.slate } }],
        { x: 7.95, y: y - 0.03, w: 1.6, h: 0.72, fontSize: 9.5 });
    }
    rect(s, 0.5, 4.7, 9.0, 0.45, K.violetL);
    T(s, "Security win: the architecture review found the platform needed no internet-facing load balancer, so a perimeter risk was removed instead of migrated.",
      { x: 0.65, y: 4.7, w: 8.7, h: 0.45, fontSize: 10, color: "4C1D95", valign: "middle" });
  }

  // ===== 16. Monolith roadmap =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Legacy monolith: foundation done first, extraction follows",
      "19 items in 9 epics; 90% of foundation stories and tasks complete, with zero blockers");
    donut(s, 0.5, 1.3, 2.0, [10, 2, 0, 7], [K.green, K.blue, K.red, "CBD5E1"], "52.6%", "10 of 19 done");
    legend(s, 0.6, 3.45, [["Done 10", K.green], ["In progress 2", K.blue], ["Blocked 0", K.red], ["Backlog epics 7", "CBD5E1"]]);
    // timeline
    const ph = [
      ["Phase 0", "Foundation", "SDK upgrades in 5 teams, config-mgmt repo moved, zero-downtime deploys, QA infra as code", "DONE", K.green],
      ["Phase 1", "Platform landing", "Terraform into a central environments repo; ingress hardening; policy exceptions", "IN PROGRESS", K.blue],
      ["Phase 2", "Extraction", "Core services, pricing, inventory sync, external APIs", "PLANNED", K.gray],
      ["Phase 3", "Data cutover", "Database cutover & validation; monitoring re-platform", "PLANNED", K.gray],
      ["Phase 4", "Decommission", "Retire legacy servers and pipelines", "PLANNED", K.gray],
    ];
    const x0 = 2.9, y0 = 1.5, step = 0.72;
    line(s, x0 + 0.13, y0 + 0.13, x0 + 0.13, y0 + 4 * step + 0.13, K.line, 2);
    ph.forEach((p, i) => {
      const y = y0 + i * step;
      s.addShape(pres.shapes.OVAL, { x: x0, y, w: 0.26, h: 0.26, fill: { color: p[4] }, line: { color: K.white, width: 2 } });
      T(s, p[0] + " · " + p[1], { x: x0 + 0.45, y: y - 0.02, w: 3.0, h: 0.26, fontSize: 12, bold: true, color: K.ink });
      pill(s, x0 + 3.55, y, 1.0, p[3], p[4] === K.gray ? K.card2 : p[4], p[4] === K.gray ? K.slate : K.white);
      T(s, p[2], { x: x0 + 0.45, y: y + 0.24, w: 5.6, h: 0.4, fontSize: 10, color: K.slate });
    });
  }

  // ===== 17. AI-driven program governance + projection =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "Governance: agents turn tracker data into weekly decisions",
      "The pattern: a PMO agent queries the work tracker weekly; the TPM reviews, edits and publishes");
    // loop
    const lp = [["Query tracker", "FaDatabase"], ["Compute deltas", "FaCalculator"], ["Render dashboards", "FaChartPie"], ["Draft highlights", "FaComments"], ["TPM review", "FaUserCheck"]];
    for (let i = 0; i < lp.length; i++) {
      const y = 1.3 + i * 0.75;
      await circ(s, 0.6, y, 0.5, i === 4 ? K.ink2 : K.violet, lp[i][1]);
      T(s, lp[i][0], { x: 1.2, y: y + 0.1, w: 1.6, h: 0.3, fontSize: 11, bold: true, color: K.ink });
      if (i < 4) arrow(s, 0.85, y + 0.52, 0.85, y + 0.73, K.gray, 1.25);
    }
    // projection chart
    s.addChart(pres.charts.LINE, [
      { name: "Actual open items", labels: ["W42", "W43", "W44", "W45", "W46", "W47", "W48", "W49", "W50", "W51", "W52", "W53"], values: [206, 180, null, null, null, null, null, null, null, null, null, null] },
      { name: "Projection at W43 net burn (−26/wk)", labels: ["W42", "W43", "W44", "W45", "W46", "W47", "W48", "W49", "W50", "W51", "W52", "W53"], values: [null, 180, 154, 128, 102, 76, 50, 24, 0, null, null, null] },
      { name: "Ideal to quarter end", labels: ["W42", "W43", "W44", "W45", "W46", "W47", "W48", "W49", "W50", "W51", "W52", "W53"], values: [null, 180, 162, 144, 126, 108, 90, 72, 54, 36, 18, 0] },
    ], {
      x: 2.9, y: 1.2, w: 4.0, h: 3.95, chartColors: [K.ink, K.teal, K.gray], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 5,
      showLegend: true, legendPos: "b", legendFontSize: 9, legendFontFace: "+mn-lt", catAxisLabelFontSize: 9, valAxisLabelFontSize: 9, catAxisLabelColor: K.slate, valAxisLabelColor: K.slate,
      catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" }, valAxisMinVal: 0, valAxisMaxVal: 220,
      showTitle: true, title: "Program burndown projection (weekly-flux items, all streams)", titleFontSize: 10, titleColor: K.ink, titleFontFace: "+mn-lt",
    });
    // combined waterfall
    waterfall(s, 7.1, 1.25, 2.4, 2.3, 206, 39, 13, 180, "All streams, one week");
    rect(s, 7.1, 3.85, 2.4, 1.3, K.card);
    T(s, [{ text: "Agent-generated artifacts", options: { bold: true, breakLine: true, color: K.ink } },
          { text: "Status & weekly dashboards, burndowns, dependency maps, risk registers, chat-ready highlights", options: { color: K.slate } }],
      { x: 7.22, y: 3.93, w: 2.2, h: 1.15, fontSize: 9.5 });
    s.addNotes("Projection is illustrative: it extends the single observed week (206 → 180 open weekly-flux items; 39 closed, 13 added) at a constant net burn of 26 items per week. Ideal line burns the same 180 items evenly to quarter end.");
  }

  // ===== 18. Lessons / guardrails =====
  {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, "What agents changed, and what they did not",
      "Code stopped being the bottleneck; decisions, access and approvals became the critical path");
    const cols = [
      ["Agents accelerate", K.green, "FaBolt", ["Repetitive per-service build work (pipelines, Helm, Terraform)", "Cross-repo upgrades and schema conversion", "Inventory and usage analysis of the long tail", "Weekly status, burndown and risk reporting"]],
      ["Humans still own", K.blue, "FaUserCheck", ["Scope approval and sequencing trade-offs", "Production change approval and cutover windows", "Business decisions (retire vs. keep for active users)", "Architecture calls, e.g. removing public ingress"]],
      ["New critical path", K.red, "FaExclamationTriangle", ["Business decisions: up to ~300 days blocked", "Credentials & secrets provisioning", "Policy-as-code exceptions and IAM reviews", "Ownership audits before any deletion"]],
    ];
    for (let i = 0; i < 3; i++) {
      const x = 0.5 + i * 3.08;
      rect(s, x, 1.3, 2.85, 3.85, K.card);
      await circ(s, x + 0.18, 1.45, 0.55, cols[i][1], cols[i][2]);
      T(s, cols[i][0], { x: x + 0.85, y: 1.55, w: 1.95, h: 0.35, fontSize: 15, bold: true, color: K.ink });
      T(s, cols[i][3].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < 3 } })),
        { x: x + 0.2, y: 2.2, w: 2.5, h: 2.8, fontSize: 11.5, color: K.slate, paraSpaceAfter: 8 });
    }
  }

  // ===== 19. Closing =====
  {
    const s = pres.addSlide({ masterName: "DARK" });
    T(s, "Measuring an agentic SDLC", { x: 0.7, y: 0.5, w: 8.6, h: 0.6, fontSize: 30, bold: true, color: K.white });
    T(s, "Track agent impact with the same delivery metrics engineering already trusts", { x: 0.7, y: 1.1, w: 8.6, h: 0.3, fontSize: 13, color: "94A3B8" });
    const m = [["FaStopwatch", "Lead time for changes", "Story start → production"], ["FaRocket", "Deployment frequency", "Per service, per week"],
      ["FaUndo", "Change failure rate", "Rollbacks per cutover"], ["FaHeartbeat", "Time to restore", "Detection → rollback"],
      ["FaRobot", "Agent acceptance rate", "Agent PRs merged without rework"], ["FaHourglassHalf", "Blocked-days on critical path", "Decision & access latency"]];
    for (let i = 0; i < 6; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.7 + col * 2.95, y = 1.75 + row * 1.35;
      rect(s, x, y, 2.75, 1.15, K.ink2);
      await circ(s, x + 0.15, y + 0.17, 0.5, i >= 4 ? K.teal : "1E3A5F", m[i][0]);
      T(s, m[i][1], { x: x + 0.78, y: y + 0.15, w: 1.9, h: 0.5, fontSize: 12, bold: true, color: K.white });
      T(s, m[i][2], { x: x + 0.78, y: y + 0.65, w: 1.9, h: 0.4, fontSize: 10, color: "94A3B8" });
    }
    T(s, "DORA metrics + two agent-specific measures  ·  Suhaib Khalid  ·  linkedin.com/in/suhaibq", { x: 0.7, y: 4.75, w: 8.6, h: 0.3, fontSize: 10, color: "64748B" });
  }

  await pres.writeFile({ fileName: path.join(__dirname, "Autonomous-AI-Agents-SDLC.pptx") });
  console.log("ok");
})();
