# Phase 1 — Tool and Sandbox Execution Analysis

Status: **PROPOSED / OWNER DECISION REQUIRED**

## 1. Question

Does the first production release need arbitrary repository code execution to perform a useful AI PR review?

## 2. Option A — No arbitrary execution in initial release

The first release operates on GitHub APIs, repository snapshots/content, static parsing, retrieval, and model reasoning. No agent can execute arbitrary repository commands, run project tests, start build systems, or access a shell.

Advantages:
- substantially smaller trust boundary;
- easier multi-tenant isolation;
- fewer credential/network escape paths;
- simpler cost/reliability model;
- easier evaluator isolation;
- aligns with the product's core value: evidence-backed review of changes and context.

Limitations:
- cannot directly execute project tests or build commands;
- some runtime-dependent defects will require human/CI evidence.

## 3. Option B — Sandboxed execution in initial release

Provide bounded test/build/static-analysis execution in isolated workers with explicit network, CPU, memory, filesystem, time, and credential controls.

Advantages:
- stronger evidence for behavioral/test findings;
- can validate proposed fixes or run targeted checks.

Costs/risks:
- major security boundary;
- untrusted repository code becomes executable;
- requires sandbox lifecycle, egress controls, secret isolation, artifact limits, cleanup, and evaluator separation;
- significantly more operational complexity.

## 4. Option C — Hybrid, only for trusted opt-in repositories

Support execution only when a repository administrator explicitly enables it and the execution environment passes additional policy checks.

Advantages: preserves a path to stronger evidence without making execution universal.

Costs: still requires the full sandbox architecture and creates a second operating mode.

## 5. Recommendation

Use **Option A for the initial production release**.

Design the `tools` boundary so a future execution capability can be added without changing agent contracts. When execution is later justified by evaluation evidence, introduce it as a separate capability with explicit authorization and an isolated execution service.

The reviewer should distinguish between:

- evidence observed directly from repository/API/static analysis;
- evidence supplied by CI or external checks;
- evidence produced by future sandbox execution.

A finding must never claim execution-based evidence unless such execution actually occurred.

## 6. Owner decision

The product owner should explicitly approve A, B, or C before the tool capability boundary becomes an implementation contract.
