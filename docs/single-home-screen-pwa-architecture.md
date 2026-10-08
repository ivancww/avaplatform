# AVA root navigation scope experiment

PR #42 now tests direct top-level navigation on the existing
`https://ivancww.github.io` origin. This supersedes the production gateway target.
Option B infrastructure remains paused; no new domain, edge or artifact store
is required for this experiment. No Independent App source is copied/restored.

## Navigation and independent ownership

Manifest `scope` is `/`. Existing `id` and `start_url` remain `./`, resolving to
`/avaplatform/` at the canonical production manifest URL. Display is standalone.
Ordinary scope covers same-origin sibling paths without `scope_extensions`.
The root scope necessarily includes other projects on this GitHub account;
it is not a browser-enforced disjoint path allowlist.

The existing frozen Platform registry is the launch allowlist:

| App | Canonical destination | Entries |
| --- | --- | --- |
| Medical | `https://ivancww.github.io/medical/` | frontend/user/admin |
| Saving | `https://ivancww.github.io/5pay-saving-plan/` | frontend/user/admin |
| Critical Illness | `https://ivancww.github.io/critical-illness-/` | frontend/user/admin |

`openModule` resolves only registered enabled/visible, capability-permitted
entries and uses `window.location.assign`. It does not create an iframe, popup,
new tab or intentional browser handoff. Browser mode remains ordinary navigation.
The old gateway file remains for historical/legacy direct links; these three
production launches no longer use it.

## Service Workers and data

Manifest navigation scope is separate from SW control scope. Platform continues
registering `./sw.js` with `scope: './'`: `/avaplatform/` in production.
No root worker or broader Service-Worker-Allowed header is introduced.
Its existing fetch filter bypasses sibling App paths, including scripts/workers.
Each App keeps its own repository, deployment, source, logic, storage and worker.

This experiment does not modify `sw.js` or redesign automatic updates. Compliance
with the Mother Automatic Official App Shell Update Standard is a separate,
unfinished gate; the current stable cache name is not proof of complete compliance.
No Platform/App or dataset/shell version coupling is introduced.

LocalStorage and IndexedDB are origin-scoped. The origin remains unchanged;
no migration, clearing, database deletion or global cache deletion is added.
Homepage PR #37 placement/restore, User Overrides, profile, backup and media
references remain unchanged. Namespaces prevent accidental collisions but do not
isolate hostile same-origin code. Reviewed Apps are trusted; same-origin storage
and sessionStorage access is not blocked by manifest/SW paths or repository ownership.

## Authentication and Return

Admin still requires Platform authentication and `issueAdminSession(module.id)`.
Only the one-time app-bound `avaAdminLaunch` ticket is added to the selected
App's Admin URL. Platform session token/password/App Grant is never serialized
into the destination or launch metadata. Query transport remains for existing
App compatibility; Apps must promptly consume/remove it and avoid logging,
referrer leakage and sensitive shell caching. Their live exchange/grant checks
are not newly physically certified by this experiment.

Platform prepares its current URL before launch:

- Front: remove `avaSurface`, including stale user/admin/frontend values.
- User: `avaSurface=user`.
- Admin: `avaSurface=admin`.

The canonical Return targets are `/avaplatform/`, `/avaplatform/?avaSurface=user`
and `/avaplatform/?avaSurface=admin`. Platform accepts explicit return URLs;
User restores its directory. Admin with no Platform session opens Studio login;
a present session permits the directory, but the backend still validates its
lifetime/authorization before issuing another App ticket or protected operation.
A local session string or `avaEntry=admin` grants no authority.

Existing Apps may consume the prepared referrer context. Persistent Return on
all internal App pages, explicit non-referrer context and full mode restoration
remain App-owned validation/follow-up; this Platform-only run does not alter Apps.
It does not guarantee their existing buttons or internal links are compliant.

## Physical gate and deployment caveat

All installed-device results remain NOT VERIFIED. Test Android and iPad/iPadOS,
including BOTH existing AVA Home Screen icon and a separate fresh test installation.
Do not delete an existing installation/data or use reinstall as the update solution.
Determine whether the existing installation adopts the expanded scope.

For each App: AVA icon -> Front/User/supported Admin -> complete customer/internal
journey -> another App where supported -> Return AVA. Verify no chrome, address
bar, domain or custom tab throughout, same-window navigation, correct return mode,
independent updates, local-data survival, offline/reconnect and no reload loop.

Platform-only Cloudflare preview is not production-equivalent: its different
origin does not put canonical GitHub App paths inside its installed scope.
A preview can validate launcher code, not this cross-path installed-PWA experiment.
PR must not be merged or reported as physical PASS on that evidence.

Historical PR #22 kept copied App paths under `/avaplatform/modules/` in scope.
Restoring those sources violates current ownership rules. This experiment instead
keeps independently deployed sibling Apps and expands only navigation membership.

References: [manifest scope](https://www.w3.org/TR/appmanifest/#scope-member),
[Apple Home Screen scope behavior](https://developer.apple.com/videos/play/wwdc2023/10120/).
