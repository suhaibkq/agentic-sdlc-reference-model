const React = require("react");
const RDS = require("react-dom/server");
const fa = require("react-icons/fa");
const fs = require("fs");
const ic = (n, c = "#fff", s = 28) => RDS.renderToStaticMarkup(React.createElement(fa[n], { color: c, size: s }));

const C = { ink: "#0F172A", ink2: "#1E293B", teal: "#0D9488", tealL: "#5EEAD4", blue: "#2563EB", amber: "#F59E0B", violet: "#7C3AED", green: "#10B981", red: "#EF4444", slate: "#475569", muted: "#64748B", card: "#F1F5F9", line: "#CBD5E1" };

// ---- agent ring (SVG) ----
const phases = [
  ["Discover", "FaSearch", C.blue], ["Plan", "FaClipboardList", C.blue], ["Build", "FaCode", C.teal], ["Provision", "FaServer", C.teal],
  ["Test", "FaVial", C.amber], ["Release", "FaRocket", C.amber], ["Operate", "FaHeartbeat", C.violet], ["Report", "FaChartLine", C.violet],
];
const R = 150, cx = 210, cy = 210;
let ring = `<svg width="420" height="420" viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.line}" stroke-width="3" stroke-dasharray="6 6"/>`;
phases.forEach((p, i) => {
  const a = (-90 + i * 45) * Math.PI / 180;
  const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
  ring += `<circle cx="${x}" cy="${y}" r="32" fill="${p[2]}"/>
  <g transform="translate(${x - 15},${y - 15})">${ic(p[1], "#fff", 30)}</g>`;
  const lx = cx + (R + 56) * Math.cos(a), ly = cy + (R + 56) * Math.sin(a) + 6;
});
// human gates between Plan->Build (i=1.5) and Release->Operate (i=5.5)
[1.5, 5.5].forEach(k => {
  const a = (-90 + k * 45) * Math.PI / 180;
  const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
  ring += `<circle cx="${x}" cy="${y}" r="17" fill="${C.red}" stroke="#fff" stroke-width="3"/><g transform="translate(${x - 9},${y - 9})">${ic("FaLock", "#fff", 18)}</g>`;
});
ring += `<circle cx="${cx}" cy="${cy}" r="78" fill="${C.ink}"/>
<g transform="translate(${cx - 20},${cy - 46})">${ic("FaRobot", C.tealL, 40)}</g>
<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="17" font-weight="700" fill="#fff" font-family="Inter, Helvetica, Arial">Orchestrator</text>
<text x="${cx}" y="${cy + 38}" text-anchor="middle" font-size="13" fill="#94A3B8" font-family="Inter, Helvetica, Arial">+ 8 specialist agents</text>
</svg>`;
// phase labels placed in HTML around ring for crisp text
const labels = phases.map((p, i) => {
  const a = (-90 + i * 45) * Math.PI / 180;
  const x = cx + (R + 58) * Math.cos(a), y = cy + (R + 50) * Math.sin(a);
  return `<div class="pl" style="left:${x - 60}px;top:${y - 11}px">${p[0]}</div>`;
}).join("");

const ws = [
  ["FaCubes", C.blue, "Kubernetes apps", "A per-service migration factory: re-pipeline, IaC, deploy, verify, cut over"],
  ["FaDatabase", C.teal, "Datastores", "Convert → replicate (CDC) → validate parity → human-scheduled cutover"],
  ["FaBolt", C.amber, "Serverless & batch", "Usage telemetry decides: migrate, consolidate or retire"],
  ["FaLayerGroup", C.violet, "Legacy monolith", "Strangler-fig extraction, with agents mapping undocumented code first"],
];
const shifts = [
  ["FaClipboardCheck", "Chasing status", "Agent-generated weekly telemetry"],
  ["FaCodeBranch", "Code as the bottleneck", "Decisions, access & approvals as the critical path"],
  ["FaProjectDiagram", "Static dependency lists", "Agent-mapped blocked chains"],
  ["FaTachometerAlt", "Gut-feel progress", "DORA metrics + agent acceptance rate"],
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;font-family:Inter,Helvetica,Arial,sans-serif;background:#fff;color:${C.ink}}
.hero{background:${C.ink};color:#fff;padding:56px 64px 40px;position:relative;height:368px;overflow:hidden}
.kick{color:${C.tealL};font-weight:700;font-size:18px;letter-spacing:3px}
h1{font-size:58px;line-height:1.04;font-weight:800;margin-top:18px;letter-spacing:-1px}
.sub{font-size:23px;color:#CBD5E1;margin-top:14px;line-height:1.35;max-width:700px}
.net{position:absolute;right:40px;top:40px}
.stats{display:flex;gap:16px;padding:0 64px;margin-top:-34px;position:relative}
.st{flex:1;background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,.14);padding:18px 20px}
.st b{display:block;font-size:40px;font-weight:800;line-height:1}
.st span{font-size:15px;color:${C.slate};margin-top:6px;display:block}
.mid{display:flex;gap:28px;padding:38px 64px 0}
.ringwrap{position:relative;width:420px;height:420px;flex:none}
.pl{position:absolute;width:120px;text-align:center;font-size:15px;font-weight:700;color:${C.ink2}}
.h2{font-size:15px;font-weight:700;letter-spacing:2.5px;color:${C.muted};margin-bottom:14px}
.ws{display:flex;gap:14px;align-items:flex-start;background:${C.card};border-radius:14px;padding:14px 16px;margin-bottom:12px}
.ic{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.ws h3{font-size:19px;font-weight:700}
.ws p{font-size:15px;color:${C.slate};line-height:1.35;margin-top:3px}
.shift{padding:26px 64px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sh{display:flex;align-items:center;gap:14px;border:2px solid ${C.card};border-radius:14px;padding:13px 16px}
.sh .from{font-size:15px;color:${C.muted};text-decoration:line-through}
.sh .to{font-size:17px;font-weight:700;color:${C.ink};line-height:1.25;margin-top:2px}
.tag{margin-top:20px;text-align:center;font-size:22px;font-weight:700;color:${C.teal};font-style:italic}
.foot{position:absolute;left:0;right:0;bottom:0;height:104px;background:${C.ink};display:flex;align-items:center;justify-content:space-between;padding:0 64px;color:#fff}
.foot .n{font-size:24px;font-weight:700}
.foot .r{font-size:15px;color:#94A3B8;margin-top:4px}
.cta{display:flex;align-items:center;gap:12px;background:${C.teal};padding:14px 22px;border-radius:40px;font-size:18px;font-weight:700}
</style></head><body>
<div class="hero">
  <div class="kick">AGENTIC AI × TECHNICAL PROGRAM MANAGEMENT</div>
  <h1>Autonomous AI Agents<br>in the AI-Driven SDLC</h1>
  <div class="sub">A reference model for large cloud re-platforming programs, from Kubernetes apps to a legacy monolith</div>
  <svg class="net" width="230" height="250" viewBox="0 0 230 250">
    ${[[40,40],[170,60],[90,120],[190,170],[60,210]].map((p,i,a)=>"").join("")}
    <line x1="60" y1="50" x2="180" y2="80" stroke="#334155" stroke-width="2"/><line x1="60" y1="50" x2="100" y2="140" stroke="#334155" stroke-width="2"/>
    <line x1="180" y1="80" x2="100" y2="140" stroke="#334155" stroke-width="2"/><line x1="100" y1="140" x2="190" y2="200" stroke="#334155" stroke-width="2"/>
    <line x1="100" y1="140" x2="50" y2="220" stroke="#334155" stroke-width="2"/><line x1="180" y1="80" x2="190" y2="200" stroke="#334155" stroke-width="2"/>
    ${[[60,50,C.teal,"FaRobot"],[180,80,"#1E3A5F","FaCode"],[100,140,"#1E3A5F","FaDatabase"],[190,200,"#1E3A5F","FaCloud"],[50,220,"#1E3A5F","FaShieldAlt"]].map(n=>`<circle cx="${n[0]}" cy="${n[1]}" r="26" fill="${n[2]}"/><g transform="translate(${n[0]-12},${n[1]-12})">${ic(n[3],"#fff",24)}</g>`).join("")}
  </svg>
</div>
<div class="stats">
  <div class="st"><b>4</b><span>migration workstreams</span></div>
  <div class="st"><b style="color:${C.blue}">761</b><span>work items in scope</span></div>
  <div class="st"><b style="color:${C.teal}">8</b><span>specialist AI agents</span></div>
  <div class="st"><b style="color:${C.red}">2</b><span>human approval gates</span></div>
</div>
<div class="mid">
  <div>
    <div class="h2">THE AGENTIC SDLC LOOP</div>
    <div class="ringwrap">${ring}${labels}</div>
  </div>
  <div style="flex:1">
    <div class="h2">ONE MODEL, FOUR WORKLOADS</div>
    ${ws.map(w => `<div class="ws"><div class="ic" style="background:${w[1]}">${ic(w[0], "#fff", 24)}</div><div><h3>${w[2]}</h3><p>${w[3]}</p></div></div>`).join("")}
  </div>
</div>
<div class="shift">
  <div class="h2">HOW THE TPM ROLE SHIFTS</div>
  <div class="grid">
    ${shifts.map(s => `<div class="sh"><div class="ic" style="background:${C.ink2};width:44px;height:44px">${ic(s[0], C.tealL, 20)}</div><div><div class="from">${s[1]}</div><div class="to">${s[2]}</div></div></div>`).join("")}
  </div>
  <div class="tag">Agents accelerate the build. TPMs own the decisions.</div>
</div>
<div class="foot">
  <div><div class="n">Suhaib Khalid</div><div class="r">Senior Technical Program Manager · PMP · PMI-ACP · AWS SA</div></div>
  <div class="cta">${ic("FaFolderOpen", "#fff", 20)} Full deck in my Projects</div>
</div>
</body></html>`;
fs.writeFileSync(__dirname + "/flyer.html", html);
console.log("html ok");
