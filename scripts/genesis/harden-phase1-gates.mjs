#!/usr/bin/env node

/**
 * One-time/idempotent Genesis ledger migration for Phase 1 gate hardening.
 *
 * Run from the repository root with the official Genesis CLI installed:
 *   node scripts/genesis/harden-phase1-gates.mjs
 *   genesis plan check .
 *
 * The script changes only the executable command gate for P1-01..P1-20.
 * It does not approve the plan, change requirements, dependencies, decisions,
 * task ownership, or any Genesis workflow receipt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const projectPath = path.join(ROOT, '.genesis', 'project.json');
const backupPath = path.join(ROOT, '.genesis', 'project.json.pre-gate-hardening.bak');

const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
const tasks = project.tasks ?? [];
const expected = Array.from({ length: 20 }, (_, i) => `P1-${String(i + 1).padStart(2, '0')}`);

for (const id of expected) {
  const task = tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Missing canonical task ${id}`);
  const commandGates = (task.gates ?? []).filter((gate) => gate.kind === 'command');
  if (commandGates.length !== 1) throw new Error(`${id} must have exactly one command gate; found ${commandGates.length}`);
}

const original = fs.readFileSync(projectPath, 'utf8');
if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, original, 'utf8');

for (const id of expected) {
  const task = tasks.find((item) => item.id === id);
  const commandGate = task.gates.find((gate) => gate.kind === 'command');
  commandGate.command = `node scripts/genesis/phase1-gate-runner.mjs ${id}`;
  commandGate.status = 'pending';
  commandGate.evidence = null;
}

project.project.updated_at = new Date().toISOString();
project.checkpoint = {
  ...(project.checkpoint ?? {}),
  status: 'phase1-gates-hardened-awaiting-genesis-plan-check',
};

fs.writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}\n`, 'utf8');
console.log(`Hardened ${expected.length} Phase 1 command gates.`);
console.log(`Backup: ${path.relative(ROOT, backupPath)}`);
console.log('Next: genesis plan check .');
