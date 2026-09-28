# Critical Illness independent-module integration

## Boundary and source of truth

Critical Illness remains the independently owned `ivancww/critical-illness-`
repository and deployment. AVA Platform registers navigation and management
metadata only; it does not copy Critical Illness source, product logic,
calculations, premium logic, Claim Rules, Guided Flow, Direct Plans, data,
media, or User Editor behavior.

The registered source baseline is the merged Critical Illness integration-
readiness commit `278ed69a089c4747f274490bacdf07593c30f17d` from PR #2.

## Entry contract and current availability

The merged Independent App implements the canonical Front/User entry contract:

- Front: `?avaEntry=frontend` opens the customer Frontstage.
- User: `?avaEntry=user` opens that same Frontstage with User/Edit permission,
  including Preview and Save Local.
- Admin: unsupported; the Platform registry declares `admin: false` and does
  not create an Admin route.

The canonical live deployment cannot currently be established. GitHub reports
that `ivancww/critical-illness-` has no configured Pages deployment, its merged
tree contains CI but no deployment workflow, and the expected project-site
candidate returned HTTP 404. The registry therefore uses the existing
`deployment-pending` safe fallback with no fabricated `entry` or `entryModes`
URL. Front and User cards are registered once and remain visible, but opening
either entry reports that the independent deployment is unavailable.

After a live deployment is established, Platform must replace the pending
state with the canonical deployed URL and these exact destinations:

| AVA surface | Destination |
| --- | --- |
| Frontstage | `<canonical-deployment>?avaEntry=frontend` |
| 我的流程 / User | `<canonical-deployment>?avaEntry=user` |

Only then may the corresponding live Front/User readiness checks be marked
PASS.

## Return to AVA, PWA and ownership

Critical Illness uses its merged caller-provided return context. Platform must
launch it from the originating AVA surface so the App can return to that
surface; Platform does not add a hard-coded `../avaplatform/` URL or a second
return mechanism. The current Platform change does not alter the independent
App's PWA, service worker, storage, Backup/Restore, Media-reference, or
Local-first implementations.

The Platform card, registry and User directory are entry points only. Product,
calculation, premium, benefit, Claim Rules, Health Program, content, Guided
Flow, Direct Plans, Customer Presentation, User Override, structured local
data, Backup/Restore and media-reference ownership remain with Critical
Illness.
