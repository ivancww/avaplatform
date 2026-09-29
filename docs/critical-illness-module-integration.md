# Critical Illness independent-module integration

## Boundary and source of truth

Critical Illness remains the independently owned `ivancww/critical-illness-`
repository and deployment. AVA Platform registers navigation and management
metadata only; it does not copy Critical Illness source, product logic,
calculations, premium logic, Claim Rules, Guided Flow, Direct Plans, data,
media, or User Editor behavior.

The registered source baseline is the merged Critical Illness Admin-capability
commit `af77e1c1122a921779c390e67a046766fa900492` from PR #5.

## Entry contract and verified deployment

The merged Independent App implements the canonical Front/User entry contract:

- Front: `?avaEntry=frontend` opens the customer Frontstage.
- User: `?avaEntry=user` opens that same Frontstage with User/Edit permission,
  including Preview and Save Local.
- Admin: `?avaEntry=admin` opens the Independent App's Admin surface after the
  existing AVA Platform Unified Admin Authentication launch and App-grant
  exchange. Critical Illness uses App ID `critical-illness` and the
  `official-write` operation for Official writes.

The verified canonical production deployment is:

`https://ivancww.github.io/critical-illness-/`

The successful GitHub Pages deployment is sourced from the merged Admin
implementation `af77e1c1122a921779c390e67a046766fa900492`. The registry uses
the existing canonical deployment and registers Critical Illness exactly once.

The exact Platform destinations are:

| AVA surface | Destination |
| --- | --- |
| Frontstage | `https://ivancww.github.io/critical-illness-/?avaEntry=frontend` |
| 我的流程 / User | `https://ivancww.github.io/critical-illness-/?avaEntry=user` |
| AVA Studio / Admin | `https://ivancww.github.io/critical-illness-/?avaEntry=admin` |

Invalid non-empty `avaEntry` values render the Independent App's safe
unavailable-entry behavior. Admin authorization remains subject to the
existing Platform Unified Admin Authentication contract; the entry query alone
does not grant permission.

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
