# Private Workflow Adapters

Tax AI can act as a public framework shell while production workflows remain private. This boundary lets a private workflow expose safe metadata and review summaries without copying proprietary parsing rules, customer data or credentials into the open source repository.

## Boundary

Public Tax AI may contain:

- adapter contracts
- safe manifests
- workflow status snapshots
- review summaries
- aggregation summaries
- demo data

Private workflow repositories should contain:

- source-specific parsers
- customer deployment rules
- term mapping libraries
- reconciliation policy
- delivery automation
- real customer files and credentials

## Contract

Public adapters should provide two things:

1. `PrivateWorkflowAdapterManifest`
   - adapter identity and version
   - workflow type and supported sources
   - public capabilities
   - private capability categories
   - snapshot safety contract

2. `WorkflowAdapterSnapshot`
   - workflow status
   - safe metrics
   - review summaries
   - aggregation summaries

Snapshots must not include customer data or credentials. A Tax AI implementation should reject adapter snapshots when the manifest declares unsafe payloads.

## Initial Use Case

The first private-core target is cross-border ecommerce finance preparation:

```text
Amazon Settlement file
-> private parser and term mapper
-> private review policy
-> safe manifest and snapshot
-> Tax AI public review/dashboard surface
```

The public repository keeps the framework active and reviewable while the commercial workflow remains private.
