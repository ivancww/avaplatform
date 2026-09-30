# AVA Automatic Official App Update Standard

This document is part of the AVA Mother Standard and defines the required update behaviour for AVA Platform and every AVA Independent App in browser and installed PWA / standalone use.

## 1. Required product behaviour

Every AVA deployment must support automatic Official App Shell updates.

Required behaviour:

Official deployment publishes a new version
→ User later opens or reopens that Platform or Independent App
→ that product automatically discovers and loads the newest deployed app shell
→ no manual user intervention is required.

Users must not need to clear browser cache, delete site data, add query-string cache busters such as `?v=`, reinstall the PWA, repeatedly refresh, or manually edit or supply a version identifier.

This requirement applies independently to AVA Platform and every Independent App.

## 2. Independent deployment ownership

AVA Platform owns its own deployment and app-shell update lifecycle.

Each Independent App owns its own deployment and app-shell update lifecycle.

Versions must not be coupled between repositories. A Platform release must not require an Independent App cache/version change, and an Independent App release must not require Platform or unrelated Apps to redeploy.

Each product independently discovers and activates its own newest Official deployment.

App-shell update ownership is separate from the Central Official Version Manifest used for Official datasets. Dataset versions and deployed app-shell versions must not be conflated.

## 3. Service Worker and cache requirements

Where Service Worker or PWA caching is used:

1. Navigation and `index.html` must not be indefinitely trapped behind stale cache-first behaviour.
2. New deployments must be discoverable automatically.
3. Old app-shell caches must be retired safely.
4. New service workers must activate safely.
5. Implementations may use `updateViaCache: 'none'`, `skipWaiting()`, `clients.claim()`, network-first navigation, generated asset revisions, deployment-aware cache naming, or equivalent mechanisms where appropriate.
6. This standard defines required behaviour, not one mandatory implementation.
7. Update correctness must not depend on a developer manually changing a cache-version string for each release.
8. Implementations must not create infinite reload loops, repeated `controllerchange` reloads, destructive migration behaviour, or stale-index lock-in.

Cache cleanup applies to Service Worker / HTTP app-shell caches only unless a separate explicit migration requires otherwise.

## 4. Local-first data safety

Automatic app-shell update must preserve User Local Data.

It must not delete or reset, unless a separately designed and explicitly authorized migration requires it:

- LocalStorage User Overrides.
- IndexedDB structured User data.
- User-created Pages.
- Page order and visibility.
- User settings and preferences.
- Portable backup references.
- Media metadata and references.
- App-specific Local-first User data.

Service Worker cache cleanup is separate from User Data cleanup.

Automatic update must not use `localStorage.clear()`, `indexedDB.deleteDatabase()`, blanket storage deletion, or an equivalent destructive reset as a normal update mechanism.

Official Layer / User Layer separation and User Override precedence continue to apply throughout update activation.

## 5. Installed PWA / standalone requirement

Installed PWA / standalone mode must also receive Official app-shell updates safely.

When a new deployment exists:

- the current session may continue safely when appropriate;
- on reopen or controlled activation, the newest version becomes active;
- at most one controlled reload may occur where technically required;
- no reload loop is permitted;
- offline fallback remains available where applicable.

A conforming implementation must not require PWA reinstallation to receive routine Official updates.

## 6. Build and version diagnostics

Apps may expose a build identifier for diagnostics.

Preferred automatically generated identifiers include:

- deployment commit SHA;
- generated build timestamp;
- generated asset revision;
- deployment version.

Manually maintained release identifiers must not be required for update correctness.

## 7. Automatic Update Gate

Automatic update is part of AVA Independent App readiness and compliance checking.

Verify:

1. Latest deployment is discoverable automatically.
2. A stale service worker cannot indefinitely trap the old app shell.
3. Browser reload or reopen can reach the latest deployment.
4. Installed PWA / standalone mode can reach the latest deployment.
5. No manual cache-busting, site-data clearing, reinstall, or manually supplied version is required.
6. User Local-first data survives app-shell update.
7. No infinite or repeated reload loop is introduced.
8. The product updates independently of AVA Platform and other Independent Apps.

Use the standard AVA validation statuses:

- **PASS** — the stated update check was actually executed and passed.
- **FAIL** — the check was executed and an unresolved failure remains.
- **BLOCKED** — the check could not be executed because of an environment, runtime, deployment, permission, credential, or infrastructure limitation.
- **NOT APPLICABLE** — the check genuinely does not apply to the product or change.
- **NOT VERIFIED** — the requirement applies but has not yet been executed or demonstrated.

Do not convert an unexecuted update check into PASS.

## 8. Relationship to other Mother Standards

This standard supplements, and must be applied together with:

- `docs/MOTHER-RULES.md` for Platform/App ownership, Local-first behaviour, Official/User separation, integration readiness, and dataset version coordination;
- `docs/single-home-screen-pwa-architecture.md` for AVA PWA scope and Independent App service-worker ownership;
- Root `AGENTS.md` for implementation, validation, reporting, and stopping-point enforcement.

Independent App source code remains outside AVA Platform. This standard does not authorize modifying an Independent App repository merely because its compliance is being assessed.