import { test } from "node:test";
import assert from "node:assert/strict";
import { clientHealth } from "../features/business-os/client-crm/utils/health.ts";
import type { Client } from "../features/business-os/client-crm/utils/schema.ts";

const NOW = new Date("2026-06-25T00:00:00Z");

function client(overrides: Partial<Client> = {}): Client {
  return {
    id: "c1",
    name: "Acme",
    company: "",
    email: "",
    phone: "",
    status: "active",
    value: 0,
    lastContact: "",
    notes: "",
    tags: [],
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

test("active + recent contact is Healthy", () => {
  const h = clientHealth(client({ status: "active", lastContact: "2026-06-20" }), NOW);
  assert.equal(h.score, 90); // 70 + 20
  assert.equal(h.label, "Healthy");
});

test("churned + stale contact is Critical", () => {
  const h = clientHealth(client({ status: "churned", lastContact: "2026-01-01" }), NOW);
  assert.ok(h.score < 30);
  assert.equal(h.label, "Critical");
});

test("score is clamped to 0-100", () => {
  const h = clientHealth(client({ status: "active", lastContact: "2026-06-25" }), NOW);
  assert.ok(h.score <= 100 && h.score >= 0);
});

test("lead with no contact is Steady", () => {
  const h = clientHealth(client({ status: "lead", lastContact: "" }), NOW);
  assert.equal(h.score, 50);
  assert.equal(h.label, "Steady");
});
