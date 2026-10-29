# Reference model details

## Specialist agents

| # | Phase | Agent | Responsibilities |
|---|---|---|---|
| 1 | Discover | Discovery agent | Inventory, dependency graph, usage telemetry |
| 2 | Plan | Planner agent | Epics, stories, sequencing, risk register |
| 3 | Build | Coding agent | Code, Helm charts, schema conversion, SDK upgrades |
| 4 | Provision | IaC agent | Terraform modules, IAM, policy-as-code checks |
| 5 | Test | Test agent | Unit, integration, data-parity and canary checks |
| 6 | Release | Release agent | CI/CD pipelines, change requests, DNS cutover |
| 7 | Operate | SRE agent | Observability, drift detection, rollback triggers |
| 8 | Report | PMO agent | Dashboards, burndown, dependency and risk digests |

The **orchestrator agent** plans, delegates to the specialist agents and checks their output.

**Human approval gates:**
- After Plan: scope sign-off.
- Before Operate: production change approval.

Agents never apply production changes without an approved change request.

## Workload playbooks

### Kubernetes applications
Each service follows the same steps: Assess → Re-pipeline → Provision → Deploy → Verify → Cutover → Production & retire. Traffic moves from the legacy cluster to the target platform through weighted DNS. A human owns the production cutover decision.

### Datastores
All five variants share one pipeline: source DB → CDC / replication → stream / staging → target DB → parity checks. The variants are:
- Engine conversion (commercial SQL → PostgreSQL)
- Version upgrade / re-host
- Search cluster hardening and sunset
- Streaming / CDC topic migration and cluster merge
- File and object storage sync

Cutover windows are always scheduled by people.

### Serverless functions, batch jobs and tooling
A discovery-agent inventory feeds one decision: was this invoked in the last 90 days?
- **Yes, and owned:** migrate it.
- **Yes, but redundant:** consolidate it.
- **No:** retire it in stages, then clean up its IAM roles, schedules and logs, and archive the repo.

Nothing is deleted until cross-team ownership is confirmed.

### Legacy monolith
Strangler-fig extraction behind an internal routing facade, in five phases:
- **Phase 0:** foundation (SDK upgrades, infrastructure as code, zero-downtime deploys)
- **Phase 1:** platform landing
- **Phase 2:** component extraction
- **Phase 3:** data cutover
- **Phase 4:** decommission

## What changes for the TPM

| From | To |
|---|---|
| Chasing status | Agent-generated weekly telemetry |
| Code as the bottleneck | Decisions, access and approvals as the critical path |
| Static dependency lists | Agent-mapped blocked chains |
| Gut-feel progress | DORA metrics + agent acceptance rate |
