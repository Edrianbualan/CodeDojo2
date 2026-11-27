import assert from "node:assert/strict";
import { test } from "node:test";

const base = process.env.CODEDOJO_TEST_URL ?? "http://localhost:3000";

test("Academy pages display real lessons, assessments and journey choices", async () => {
  for (const [path, headings] of [
    [
      "/journey",
      ["Learn Programming", "Practice Challenges", "Continue Learning"],
    ],
    [
      "/learn",
      ["CodeDojo Academy", "View Python course", "View JavaScript course"],
    ],
    [
      "/learn/python/hello",
      [
        "What you’ll learn",
        "Worked examples",
        "Mark as Complete",
        "Next Lesson",
        "Open DojoSensei",
      ],
    ],
    ["/learn/javascript/module-1", ["Mini project", "Submit assessment"]],
    [
      "/learn/javascript/final",
      ["Final course assessment", "Submit assessment"],
    ],
  ]) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200, path);
    const html = (await response.text()).replaceAll("<!-- -->", "");
    for (const heading of headings)
      assert.ok(html.includes(heading), path + " missing " + heading);
    assert.doesNotMatch(html, /"answer":\d/);
  }
  assert.equal((await fetch(new URL("/learn/sql", base))).status, 404);
});

test("landing page serves the demo and security headers", async () => {
  const response = await fetch(new URL("/", base));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const html = await response.text();
  assert.match(html, /<h1[^>]*>Master the Art <em>of Code\.<\/em><\/h1>/);
  assert.match(html, /What does this code print\?/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/terms"/);
});

test("legal pages and missing routes return the correct status", async () => {
  for (const [path, status, title] of [
    ["/privacy", 200, "Privacy"],
    ["/terms", 200, "Terms"],
    ["/missing-page", 404, "Page not found"],
  ]) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, status);
    assert.ok((await response.text()).includes(title));
  }
});

test("practice renders a session setup and dashboard requires an account", async () => {
  const practice = await fetch(new URL("/practice/output", base), {
    redirect: "manual",
  });
  if (process.env.CODEDOJO_AUTH_CONFIGURED === "true") {
    assert.equal(practice.status, 307);
    assert.equal(practice.headers.get("location"), "/login");
  } else {
    assert.equal(practice.status, 200);
    const html = await practice.text();
    assert.match(html, /Predict the Output/);
    assert.match(html, /Start session/);
    assert.match(html, /Expert/);
    assert.match(html, /50/);
  }
  const dashboard = await fetch(new URL("/dashboard", base), {
    redirect: "manual",
  });
  assert.equal(dashboard.status, 307);
  assert.equal(dashboard.headers.get("location"), "/login");
});

test("training setup is reachable and applies validated session settings", async () => {
  const setup = await fetch(new URL("/practice/setup", base));
  assert.equal(setup.status, 200);
  assert.match(await setup.text(), /Start Training/);
  const configured = await fetch(
    new URL(
      "/practice/output?language=JavaScript&difficulty=Expert&length=5&mode=written&minutes=0&random=off&sound=off&tutor=off",
      base,
    ),
    { redirect: "manual" },
  );
  if (process.env.CODEDOJO_AUTH_CONFIGURED === "true") {
    assert.equal(configured.status, 307);
    const next = new URL(
      configured.headers.get("location"),
      base,
    ).searchParams.get("next");
    assert.match(next, /^\/practice\/output\?/);
    assert.match(next, /length=5/);
  } else {
    assert.equal(configured.status, 200);
    const html = await configured.text();
    assert.match(html, /Question <!-- -->1<!-- --> of <!-- -->5/);
    assert.match(html, /Printed number/);
    assert.doesNotMatch(html, />Open DojoSensei</);
  }
});
