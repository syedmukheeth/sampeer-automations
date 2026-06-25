import { test } from "node:test";
import assert from "node:assert/strict";
import { projectFlag } from "../features/business-os/project-dashboard/utils/status.ts";
import type { Project } from "../features/business-os/project-dashboard/utils/schema.ts";

const NOW = new Date("2026-06-25T00:00:00Z");

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Site",
    client: "",
    status: "in_progress",
    progress: 50,
    startDate: "",
    dueDate: "",
    value: 0,
    notes: "",
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

test("delivered when status delivered", () => {
  assert.equal(projectFlag(project({ status: "delivered" }), NOW), "delivered");
});

test("delivered when progress 100", () => {
  assert.equal(projectFlag(project({ progress: 100 }), NOW), "delivered");
});

test("overdue when due date has passed", () => {
  assert.equal(projectFlag(project({ dueDate: "2026-06-01", progress: 40 }), NOW), "overdue");
});

test("at risk when progress trails schedule", () => {
  // Halfway through the window but only 10% done.
  const f = projectFlag(project({ startDate: "2026-06-01", dueDate: "2026-07-01", progress: 10 }), NOW);
  assert.equal(f, "at_risk");
});

test("on track when progress matches schedule", () => {
  const f = projectFlag(project({ startDate: "2026-06-01", dueDate: "2026-07-01", progress: 80 }), NOW);
  assert.equal(f, "on_track");
});
