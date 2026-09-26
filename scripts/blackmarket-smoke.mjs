// Run after: $env:HW2_BUILD_DIR='.next-blackmarket'; npm run build
// Uses a temporary file store and its own server. Never touches the real DB.
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const dataDir = await mkdtemp(path.join(tmpdir(), "hw2-blackmarket-test-"));
const now = Date.now();
const fixture = (code, coins = 0, completedTasks = []) => ({
  code,
  handle: code,
  coins,
  completedTasks,
  progress: {},
  createdAt: now,
  updatedAt: now,
});
await writeFile(
  path.join(dataDir, "hc-players.json"),
  JSON.stringify({
    "HW2-TEST-ALPHA": fixture("HW2-TEST-ALPHA"),
    "HW2-TEST-OTHER": fixture("HW2-TEST-OTHER", 500),
    "HW2-TEST-BUYER": fixture("HW2-TEST-BUYER", 100, ["bm-dead-drop"]),
  }),
);
const base = "http://127.0.0.1:3107";
const env = {
  ...process.env,
  DATABASE_URL: "",
  HW2_DATA_DIR: dataDir,
  HW2_BUILD_DIR: ".next-blackmarket",
  HC_SESSION_SECRET: "isolated-blackmarket-tests-only-secret-2026",
  HC_SEED_CODE: "HW2-TEST-ALPHA",
};
let server,
  logs = "";
function start() {
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "-p",
      "3107",
      "-H",
      "127.0.0.1",
    ],
    { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (v) => {
    logs += v;
  });
  server.stderr.on("data", (v) => {
    logs += v;
  });
}
async function ready() {
  for (let n = 0; n < 60; n++) {
    try {
      const res = await fetch(`${base}/login`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not start: ${logs}`);
}
async function stop() {
  if (server && server.exitCode === null) {
    const exited = new Promise((r) => server.once("exit", r));
    server.kill();
    await exited;
  }
}
async function login(code) {
  const res = await fetch(`${base}/api/hc/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  assert.equal(res.status, 200);
  return res.headers.getSetCookie()[0].split(";")[0];
}
async function api(cookie, url, body, expected = 200) {
  const res = await fetch(base + url, {
    method: body ? "POST" : "GET",
    headers: { cookie, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  assert.equal(res.status, expected, `${url}: ${JSON.stringify(data)}`);
  return data;
}
let browser;
try {
  start();
  await ready();
  assert.equal((await fetch(`${base}/api/blackmarket`)).status, 401);
  const alpha = await login("HW2-TEST-ALPHA"),
    other = await login("HW2-TEST-OTHER");
  const market = (body, status = 200) =>
    api(alpha, "/api/blackmarket", body, status);
  const claim = (taskId, answer) =>
    api(alpha, "/api/hc/claim", { taskId, answer });
  const locked = await market();
  assert.equal(locked.unlocked, false);
  await market({ action: "purchase", service: "pageghost" }, 403);
  await api(alpha, "/api/hc/progress", {
    progress: {
      unlockedRoutes: ["/hidden-wiki-2/blackmarket"],
      tokens: { blackmarket: true },
      blackmarket: { membership: true },
      coins: 99999,
      completedTasks: ["bm-dead-drop"],
    },
  });
  assert.equal(
    (await market()).unlocked,
    false,
    "client progress cannot unlock market",
  );
  assert.equal((await claim("bm-dead-drop", "wrong")).ok, false);
  await Promise.all(
    Array.from({ length: 4 }, () => claim("bm-dead-drop", "ASH-17-MIRROR")),
  );
  assert.equal((await market()).coins, 50);
  await Promise.all(
    Array.from({ length: 6 }, () =>
      market({ action: "purchase", service: "pageghost", price: 0 }),
    ),
  );
  let state = await market();
  assert.equal(state.coins, 0);
  assert.equal(state.market.orders.length, 1);
  await market({ action: "purchase", service: "cardforge" }, 409);
  await market({ action: "password" }, 403);
  const foreign = await api(other, "/api/blackmarket");
  assert.notEqual(
    state.codes["/hidden-wiki-2/events/guestbook"],
    foreign.codes["/hidden-wiki-2/events/guestbook"],
  );
  await market(
    {
      action: "message",
      service: "pageghost",
      text: foreign.codes["/hidden-wiki-2/events/guestbook"],
      requestId: randomUUID(),
    },
    400,
  );
  const message = (service, text, requestId = randomUUID()) =>
    market({ action: "message", service, text, requestId });
  const codes = state.codes;
  await message("pageghost", codes["/hidden-wiki-2/events/guestbook"]);
  await message("pageghost", codes["/hidden-wiki-2/forum/deadletters"]);
  assert.ok((await market()).market.patches.includes("mailbox-v1"));
  const compared = await market({
    action: "compare",
    a: codes["/hidden-wiki-2/events/guestbook"],
    b: codes["/hidden-wiki-2/forum/deadletters"],
  });
  assert.equal(compared.comparison.match, true);
  assert.equal(compared.comparison.samePage, false);
  for (const [task, answer] of [
    ["ms-01", "9912"],
    ["ms-02", "p@geGh0st2024"],
    ["ms-04", "dc-0077"],
    ["pz-01", "42.6977"],
    ["pz-02", "mirror"],
  ])
    await claim(task, answer);
  assert.equal((await market()).coins, 400);
  for (const service of ["cardforge", "celltrace", "live-eye", "bruteforce"])
    await market({ action: "purchase", service });
  assert.equal((await market()).coins, 50);
  await message("cardforge", codes["/hidden-wiki-2/events/tickets"]);
  await message("bruteforce", codes["/hidden-wiki-2/leaks/passwords"]);
  assert.equal((await market({ action: "password" })).password, "g0th.g1rl!26");
  await market(
    {
      action: "message",
      service: "celltrace",
      text: "+123456789",
      requestId: randomUUID(),
    },
    400,
  );
  const requestId = randomUUID();
  await Promise.all(
    Array.from({ length: 5 }, () =>
      message("celltrace", "+359 88 *** 1221", requestId),
    ),
  );
  state = await market();
  assert.equal(state.coins, 40);
  assert.equal(
    state.market.orders
      .find((o) => o.service === "celltrace")
      .messages.filter((m) => m.from === "player").length,
    1,
  );
  await message("celltrace", "+359 88 *** 1221");
  assert.equal((await market()).coins, 40);
  await message("live-eye", codes["/hidden-wiki-2/red-room/signal-log"]);
  assert.equal(
    (await market()).market.orders
      .find((o) => o.service === "live-eye")
      .messages.at(-1).artifact.suspicious,
    true,
  );
  await api(alpha, "/api/terminal", {
    cmd: "patch",
    args: ["install", "mailbox-v1"],
  });
  assert.ok(
    (
      await api(alpha, "/api/terminal", { cmd: "mailbox", args: [] })
    ).lines.some((line) => line.includes("стая 9")),
  );
  await market({ action: "reset" });
  assert.equal((await market()).market.installed.length, 0);
  assert.equal((await market()).market.orders.length, 5);
  assert.equal(
    (await api(alpha, "/api/terminal", { cmd: "mailbox", args: [] })).success,
    false,
  );
  await api(alpha, "/api/hc/progress", {
    progress: { blackmarket: {}, coins: 900000 },
  });
  state = await market();
  assert.equal(state.coins, 40);
  assert.equal(state.market.membership, true);
  const csrf = await fetch(`${base}/api/blackmarket`, {
    method: "POST",
    headers: {
      cookie: alpha,
      origin: "https://untrusted.example",
      "content-type": "application/json",
    },
    body: JSON.stringify({ action: "reset" }),
  });
  assert.equal(csrf.status, 403);
  console.log(
    "PASS API: mission, server locks, double-claim, concurrent purchase, balance, recovery, personal codes, phone fees, decoy, patches, CSRF",
  );

  await stop();
  start();
  await ready();
  state = await market();
  assert.equal(state.coins, 40);
  assert.equal(state.market.orders.length, 5);
  assert.equal(state.market.membership, true);
  const persisted = JSON.parse(
    await readFile(path.join(dataDir, "hc-players.json"), "utf8"),
  );
  assert.equal(persisted["HW2-TEST-OTHER"].coins, 500);
  console.log("PASS persistence after server restart and player isolation");

  if (process.argv.includes("--browser")) {
    const { chromium } = await import("playwright-core");
    browser = await chromium.launch({
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
    });
    const setSession = async (cookie) => {
      const index = cookie.indexOf("=");
      await context.addCookies([
        {
          name: cookie.slice(0, index),
          value: cookie.slice(index + 1),
          url: base,
        },
      ]);
    };
    await setSession(other);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    for (const sub of [
      "",
      "/services",
      "/services/pageghost",
      "/inbox",
      "/weapons",
      "/substances",
      "/policy",
    ]) {
      await page.goto(`${base}/hidden-wiki-2/blackmarket${sub}`);
      await page.getByRole("link", { name: /ОТВОРИ МИСИЯТА/ }).waitFor();
    }
    await page.getByRole("link", { name: /ОТВОРИ МИСИЯТА/ }).click();
    const mission = page.locator("#bm-dead-drop");
    await mission.locator("input").fill("ASH-17-MIRROR");
    await mission.getByRole("button", { name: "ПОДАЙ", exact: true }).click();
    await mission.getByRole("link", { name: /BLACKMARKET Е ОТКЛЮЧЕН/ }).click();
    await page.getByRole("heading", { name: /Липсващото/ }).waitFor();
    await setSession(alpha);
    await page.goto(`${base}/hidden-wiki-2/blackmarket`);
    await page.getByRole("heading", { name: /Липсващото/ }).waitFor();
    await page.screenshot({
      path: path.join(dataDir, "blackmarket-desktop.png"),
      fullPage: true,
    });
    await page.goto(`${base}/hidden-wiki-2/blackmarket/inbox?thread=pageghost`);
    await page.getByRole("button", { name: "ИЗПРАТИ", exact: true }).waitFor();
    await page
      .getByRole("textbox", { name: "Задание до изпълнителя" })
      .fill(codes["/hidden-wiki-2/leaks/docs"]);
    await page.getByRole("button", { name: "ИЗПРАТИ", exact: true }).click();
    await page
      .getByText("Редакция / транспортен опис", { exact: true })
      .waitFor();
    await page.goto(`${base}/hidden-wiki-2/leaks/passwords`);
    await page.getByRole("button", { name: "АНАЛИЗИРАЙ GOTHGIRL" }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "g0th.g1rl!26" })
      .waitFor();
    await page.goto(`${base}/hidden-wiki-2/events/tickets`);
    await page.getByRole("heading", { name: "Картата е приета." }).waitFor();
    const buyer = await login("HW2-TEST-BUYER");
    await setSession(buyer);
    await page.goto(`${base}/hidden-wiki-2/blackmarket/services/pageghost`);
    await page.getByRole("button", { name: /ПЛАТИ 50 HC/ }).click();
    await page.waitForURL("**/inbox?thread=pageghost");
    await page.getByText(/Готов съм да изпълня задачата/).waitFor();
    await page.goto(`${base}/hidden-wiki-2/blackmarket/services/celltrace`);
    await page.getByRole("button", { name: /ПЛАТИ 150 HC/ }).waitFor();
    assert.equal(
      await page.getByRole("button", { name: /ПЛАТИ 150 HC/ }).isDisabled(),
      true,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    for (const sub of [
      "",
      "/services",
      "/services/pageghost",
      "/weapons",
      "/substances",
      "/policy",
      "/inbox",
    ]) {
      await page.goto(`${base}/hidden-wiki-2/blackmarket${sub}`);
      await page.locator("main h1").waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
        `Mobile overflow: ${sub}`,
      );
      const evidenceButton = page.getByRole("button", {
        name: "Улики",
        exact: true,
      });
      const buttonBox = await evidenceButton.boundingBox();
      assert.ok(
        buttonBox && buttonBox.x + buttonBox.width <= 391,
        "Mobile toolbar controls must remain on screen",
      );
    }
    await page.goto(`${base}/hidden-wiki-2/blackmarket`);
    await page.getByRole("heading", { name: /Липсващото/ }).waitFor();
    await page.screenshot({
      path: path.join(dataDir, "blackmarket-mobile.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      `PASS browser: locked routes, desktop/mobile, live purchase, inbox reply, password tool, member card; screenshots: ${dataDir}`,
    );
  }
  console.log(`All Blackmarket checks passed. Test data: ${dataDir}`);
} catch (error) {
  console.error(error);
  console.error(logs.slice(-4000));
  process.exitCode = 1;
} finally {
  await browser?.close();
  await stop();
}
