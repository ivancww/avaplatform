# AVA Medical Reserve independent-app registration

## Source of truth

Medical Reserve remains the independent `ivancww/medicalreserve` repository and
owns its runtime, calculations, User Layer, deployment, version, Service
Worker and shell-update lifecycle. The Platform contains only the registry
entry and generic discovery/launch behavior; it does not copy Medical Reserve
HTML, JavaScript, CSS, calculation logic or a shell snapshot.

The registration is pinned for metadata to the verified `main` source commit
`9e4e481bf85d3c8f55825ff8e1be36dc35500f93`. The canonical production
deployment is `https://ivancww.github.io/medicalreserve/`, currently serving
Medical Reserve `v1.1.1` from the repository's Pages deployment.

## Current Platform mechanism

Medical Reserve is registered once in the inline `MODULE_REGISTRY` in
`index.html`. The current Mother schema derives Front, User and AVA Studio
Admin surfaces from its declared `capabilities`, `roleVisibility` and
`entryModes`; no separate app lists or Platform-owned app runtime are used.

| Surface | Canonical destination |
| --- | --- |
| Frontstage | `https://ivancww.github.io/medicalreserve/?avaEntry=frontend` |
| User / 我的流程 | `https://ivancww.github.io/medicalreserve/?avaEntry=user` |
| Admin (capability and authorization required) | `https://ivancww.github.io/medicalreserve/?avaEntry=admin` |

The repository identity is `ivancww/medicalreserve`; the registry schema does
not add a non-standard repository field. `integrationVersion` records the
verified independent main commit for registration traceability.

## Ownership and update boundary

Medical Reserve's own Service Worker registers with `updateViaCache: 'none'`,
checks for updates on launch, activates waiting workers with `skipWaiting()`,
claims clients, bounds `controllerchange` reload, and cleans only its own shell
caches. The Platform launch hook may call the target app's own registration
`update()` when the canonical destination is opened, but the Platform Service
Worker does not own or cache `/medicalreserve/`.

Therefore a future Medical Reserve release such as `v1.1.2` requires only a
Medical Reserve deployment. It does not require an AVA Platform redeploy,
Platform version bump, registry SHA change, or copied app files.

Medical Reserve's production Frontstage owns the persistent `返回 AVA` link to
`https://ivancww.github.io/avaplatform/`. Invalid or unsupported Platform entry
surfaces fail safely through the registry capability checks; Platform does not
fabricate Admin capability or create a separate deployment.
