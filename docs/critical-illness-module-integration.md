# Critical Illness independent-module integration

## Boundary and source of truth

Critical Illness remains the independently owned `ivancww/critical-illness-`
repository and deployment. AVA Platform registers navigation and management
metadata only; it does not copy Critical Illness source, product logic,
calculations, premium logic, Claim Rules, Guided Flow, Direct Plans, data,
media, or User Editor behavior.

The registered source baseline is the merged Critical Illness integration-
readiness commit `278ed69a089c4747f274490bacdf07593c30f17d` from PR #2.

## Entry contract and verified deployment

The merged Independent App implements the canonical Front/User entry contract:

- Front: `?avaEntry=frontend` opens the customer Frontstage.
- User: `?avaEntry=user` opens that same Frontstage with User/Edit permission,
  including Preview and Save Local.
- Admin: unsupported; the Platform registry declares `admin: false` and does
  not create an Admin route.

The verified canonical production deployment is:

`https://ivancww.github.io/critical-illness-/`

The successful GitHub Pages deployment is sourced from
`2903eed4e59cd852aa42ecd9d8726115c7717b3a`; the live base URL,
`index.html`, Front entry, and User entry return HTTP 200. The registry uses
the existing canonical deployment and registers Critical Illness exactly once.

The exact Platform destinations are:

| AVA surface | Destination |
| --- | --- |
| Frontstage | `https://ivancww.github.io/critical-illness-/?avaEntry=frontend` |
| 我的流程 / User | `https://ivancww.github.io/critical-illness-/?avaEntry=user` |

Invalid non-empty `avaEntry` values render the Independent App's safe
unavailable-entry behavior. The deployed source declares no Admin capability.

## Return to AVA, PWA and ownership

Critical Illness uses its merged caller-provided return context. Platform
preserves `avaSurface=user` or `avaSurface=admin` in the AVA document URL
immediately before launching those modes, so the browser referrer carries the
originating AVA surface. Frontstage uses the AVA root context. Platform does
not add a hard-coded `../avaplatform/` URL or a second return mechanism. The
current Platform change does not alter the independent App's PWA, service
worker, storage, Backup/Restore, Media-reference, or Local-first
implementations.

The Platform card, registry and User directory are entry points only. Product,
calculation, premium, benefit, Claim Rules, Health Program, content, Guided
Flow, Direct Plans, Customer Presentation, User Override, structured local
data, Backup/Restore and media-reference ownership remain with Critical
Illness.
