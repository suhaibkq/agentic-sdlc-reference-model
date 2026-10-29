// Renders banner.html to a 2x PNG (3168x792 = LinkedIn 1584x396 @2x)
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1584, height: 396 }, deviceScaleFactor: 2 });
  await p.goto("file://" + __dirname + "/banner.html", { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(600);
  await p.screenshot({ path: __dirname + "/LinkedIn-Banner-Agentic-TPM.png" });
  await b.close();
})();
