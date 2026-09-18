# AVA single Home Screen PWA architecture — CIApp proof of concept

## Decision and current scope

AVA Platform is the sole user-facing installed PWA identity. Its manifest uses `id`, `start_url`
and `scope` `/avaplatform/`, `display: standalone`, the AVA name, and AVA icons. The root service
worker is deliberately registered only at `/avaplatform/`; it cannot control sibling GitHub Pages
project paths such as `/CIApp/`.

The normal launch model is therefore **one AVA Home Screen icon**, followed by an AVA-owned Module
Gateway. Independent repositories remain independently deployed and continue to own business logic,
data, calculations and their own service workers. A module's own installable manifest is not part of
the normal AVA user journey.

## Root cause and platform limits

Manifest scope defines which top-level URLs belong to the installed web application. Directly
navigating the AVA top-level window from `/avaplatform/` to `/CIApp/` leaves that scope. A service
worker's registration scope is a separate control boundary and the AVA worker likewise cannot be
registered above its GitHub Pages project directory without a server-provided broader
`Service-Worker-Allowed` header.

Consequently, changing `target`, removing `_blank`, or using `location.assign()` cannot make the
sibling path part of the AVA PWA. `_blank`/`window.open()` would additionally create a new browsing
context and must not be the module launcher. iPadOS decides the browser chrome for an out-of-scope
top-level navigation; application code cannot guarantee that it remains standalone.

GitHub Pages exposes the repositories as sibling static project paths. It provides no reverse proxy
or rewrite layer capable of serving independently deployed CIApp at an AVA-owned path. Widening the
manifest alone also does not widen the AVA service worker and would make one project claim unrelated
sibling paths.

## Proof-of-concept gateway

The CIApp registry destinations now remain inside AVA scope:

| AVA entry | Gateway URL | Embedded independent URL |
| --- | --- | --- |
| Frontstage | `module-gateway.html?module=ciapp&mode=frontend` | `../CIApp/?mode=frontend` |
| User | `module-gateway.html?module=ciapp&mode=user` | `../CIApp/?mode=user` |
| Admin | `module-gateway.html?module=ciapp&mode=admin` | `../CIApp/?mode=admin` |

The gateway keeps the top-level document under `/avaplatform/` and loads the independently deployed
CIApp in a same-origin iframe. The live GitHub Pages response was checked before implementation and
does not send `X-Frame-Options` or a blocking CSP `frame-ancestors` directive. The allowlist accepts
only registered module/mode pairs. A persistent AVA-owned return control navigates the same top-level
context home; the gateway also intercepts CIApp's existing same-origin “返回 AVA” link so it does not
create a nested AVA frame. No `_blank` or `window.open()` is used.

This is an embedding/integration layer, not a source copy: no CIApp source, business rules or data
are stored or cached by AVA. CIApp continues to execute from `/CIApp/`; its service worker may control
that iframe and remains scoped to `/CIApp/`.

## Storage, security and compatibility implications

- `localStorage` and IndexedDB are origin-scoped, not manifest- or path-scoped. Both project sites
  already use `https://ivancww.github.io`; embedding does not migrate, rename or delete CIApp data.
  Repositories must continue to use unique keys/database names to avoid collisions.
- Same-origin iframe execution preserves CIApp's current storage and cloud calls. Safari privacy
  restrictions for third-party frames do not apply while both remain on the same origin.
- The gateway intentionally does not apply an iframe `sandbox`, because doing so could change
  downloads, storage, authentication, service-worker and document behavior. This means a module is
  trusted same-origin code and can reach its parent. Only reviewed AVA modules should be registered.
- The fixed AVA return bar consumes vertical space. CIApp remains responsive in the remaining
  viewport and should be checked for modal sizing, scrolling, keyboard behavior and safe areas.
- If a future module sends `X-Frame-Options` or CSP `frame-ancestors` that blocks AVA, the gateway
  must reject/fallback rather than silently open Safari.

## Validation boundary and rollout

Automated browser POC can prove the gateway top-level URL stays `/avaplatform/`, CIApp renders from
its independent deployment, all three modes are passed, return navigation stays in the same browsing
context, and no horizontal overflow/blocking console error is introduced. Desktop browser emulation
cannot prove iPadOS Home Screen chrome behavior. A physical installed-iPad run is required before
calling the standalone acceptance gate PASS.

Do not roll this out en masse. After CIApp passes installed-iPad QA, evaluate each module for frame
headers, top-navigation assumptions, authentication, downloads/uploads, camera/file pickers, modals,
storage/service-worker behavior and all Frontstage/User/Admin routes. Register only compatible
modules in the same allowlisted gateway. For long-term server-controlled routing, move AVA and
modules behind a custom domain/reverse proxy that can expose module deployments below a shared AVA
URL namespace; GitHub Pages alone cannot provide that routing layer.

## References used for the study

- W3C Web App Manifest, scope member: <https://www.w3.org/TR/appmanifest/#scope-member>
- MDN, manifest scope: <https://developer.mozilla.org/en-US/docs/Web/Manifest/Reference/scope>
- MDN, service worker registration scope: <https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register>
- GitHub Pages project-site paths: <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
