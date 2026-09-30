# AVA single Home Screen PWA architecture — Independent App gateway

## Decision and current scope

AVA Platform is the sole user-facing installed PWA identity. Its manifest uses `id`, `start_url`
and `scope` `/avaplatform/`, `display: standalone`, the AVA name, and AVA icons. The root service
worker is deliberately registered only at `/avaplatform/`; it cannot control sibling GitHub Pages
project paths such as `/medical/`, `/5pay-saving-plan/`, or `/critical-illness-/`.

The normal launch model is therefore **one AVA Home Screen icon**, followed by an AVA-owned Module
Gateway. Independent repositories remain independently deployed and continue to own business logic,
data, calculations and their own service workers. A module's own installable manifest is not part of
the normal AVA user journey.

For the mandatory deployment update behavior, see the canonical [Automatic Official App Shell Update
Standard](MOTHER-RULES.md#automatic-official-app-shell-update-standard). The Platform Shell and each
Independent App Shell update from its own deployment lifecycle; this PWA scope/gateway architecture
does not couple their deployment identities or use the Central Official Version Manifest to discover
new runtime code.

## Root cause and platform limits

Manifest scope defines which top-level URLs belong to the installed web application. Directly
navigating the AVA top-level window from `/avaplatform/` to an independent app path leaves that scope. A service
worker's registration scope is a separate control boundary and the AVA worker likewise cannot be
registered above its GitHub Pages project directory without a server-provided broader
`Service-Worker-Allowed` header.

Consequently, changing `target`, removing `_blank`, or using `location.assign()` cannot make the
sibling path part of the AVA PWA. On Android, an out-of-scope top-level navigation leaves the
installed WebAPK/standalone context and is handled as a browser or custom-tab page; that is why the
user can see the independent page title and `ivancww.github.io` chrome. `_blank`/`window.open()`
would additionally create a new browsing context and must not be the module launcher. Android and
iPadOS decide the browser chrome for an out-of-scope top-level navigation; application code cannot
guarantee that it remains standalone.

GitHub Pages exposes the repositories as sibling static project paths. It provides no reverse proxy
or rewrite layer capable of serving independently deployed apps at an AVA-owned path. Widening the
manifest alone also does not widen the AVA service worker and would make one project claim unrelated
sibling paths.

## AVA-owned gateway

The Platform registry launches the reviewed Medical, 5PAY Saving, and Critical Illness destinations
through `module-gateway.html`. The gateway's `mode` parameter is an AVA-owned routing detail and the
embedded app receives the canonical `avaEntry` parameter. The existing CIApp fixture remains
backward-compatible with its legacy `mode` parameter.

| App | Frontstage gateway | User gateway | Admin gateway |
| --- | --- | --- | --- |
| Medical | `module-gateway.html?module=medical&mode=frontend` | `module-gateway.html?module=medical&mode=user` | `module-gateway.html?module=medical&mode=admin&avaAdminLaunch=…` |
| 5PAY Saving | `module-gateway.html?module=5pay&mode=frontend` | `module-gateway.html?module=5pay&mode=user` | `module-gateway.html?module=5pay&mode=admin&avaAdminLaunch=…` |
| Critical Illness | `module-gateway.html?module=critical-illness&mode=frontend` | `module-gateway.html?module=critical-illness&mode=user` | `module-gateway.html?module=critical-illness&mode=admin&avaAdminLaunch=…` |

For a conforming Independent App, the gateway passes `?avaEntry=frontend`, `?avaEntry=user`, or
`?avaEntry=admin` to the independent deployment, and the registry and gateway allowlist enable only
declared and verified capabilities. Admin launches require the Platform-issued app-bound one-time
ticket; the gateway does not authenticate or mint a grant.

The gateway keeps the top-level document under `/avaplatform/` and loads each independently deployed
app in a same-origin iframe. The GitHub Pages project paths share the
`ivancww.github.io` origin; the live responses were checked before implementation and
does not send `X-Frame-Options` or a blocking CSP `frame-ancestors` directive. The allowlist accepts
only registered module/mode pairs. A persistent AVA-owned return control navigates the same top-level
context home; the gateway also intercepts existing same-origin “返回 AVA” links and accepts the
allowlisted `ava:return` message so it does not create a nested AVA frame. No `_blank` or
`window.open()` is used for registered App launches. Admin launches carry the Platform-issued,
App-bound, one-time `avaAdminLaunch` ticket only to the selected Admin deployment; the gateway
removes it from the top-level history URL before loading the iframe. The iframe uses
`referrerpolicy="same-origin"`: this preserves the AVA gateway path and `avaSurface` for the
Independent App's Return-to-AVA contract without sending the one-time ticket to another origin.

This is an embedding/integration layer, not a source copy: no CIApp source, business rules or data
are stored or cached by AVA. CIApp continues to execute from `/CIApp/`; its service worker may control
that iframe and remains scoped to its own project path.

## Storage, security and compatibility implications

- `localStorage` and IndexedDB are origin-scoped, not manifest- or path-scoped. Both project sites
  already use `https://ivancww.github.io`; embedding does not migrate, rename or delete app data.
  Repositories must continue to use unique keys/database names to avoid collisions.
- Shell update and Shell-cache retirement must preserve those User/Local stores. The update contract
  does not permit blanket LocalStorage or IndexedDB deletion as a cache strategy.
- Same-origin iframe execution preserves each app's current storage and cloud calls. Safari privacy
  restrictions for third-party frames do not apply while both remain on the same origin.
- The gateway intentionally does not apply an iframe `sandbox`, because doing so could change
  downloads, storage, authentication, service-worker and document behavior. This means a module is
  trusted same-origin code and can reach its parent. The gateway is therefore an allowlisted
  integration boundary, not a hostile-code sandbox: only reviewed AVA modules with compatible
  frame behavior should be registered.
- The fixed AVA return bar consumes vertical space. Each app remains responsive in the remaining
  viewport and should be checked for modal sizing, scrolling, keyboard behavior and safe areas.
- If a future module sends `X-Frame-Options` or CSP `frame-ancestors` that blocks AVA, the gateway
  must reject/fallback rather than silently open Safari.

## Validation boundary and rollout

Automated browser checks can prove the gateway top-level URL stays `/avaplatform/`, each app renders from
its independent deployment, all three modes are passed, return navigation stays in the same browsing
context, and no horizontal overflow/blocking console error is introduced. Desktop browser emulation
cannot prove Android or iPadOS Home Screen chrome behavior. Physical installed-Android and
installed-iPad runs are required before calling the standalone acceptance gate PASS.

For each registered module, evaluate frame
headers, top-navigation assumptions, authentication, downloads/uploads, camera/file pickers, modals,
storage/service-worker behavior and all Frontstage/User/Admin routes. Register only compatible
modules in the same allowlisted gateway. For long-term server-controlled routing, move AVA and
modules behind a custom domain/reverse proxy that can expose module deployments below a shared AVA
URL namespace; GitHub Pages alone cannot provide that routing layer.

The QR code points to AVA's canonical `/avaplatform/` start URL. This gives Android's installed-PWA
navigation capture a chance to launch the installed AVA when supported, while an uninstalled browser
visit falls through to the existing install instructions. iOS/iPadOS does not provide a web API that
can force a QR scan in Safari to open an existing Home Screen web app; the user must complete Add to
Home Screen and then launch the AVA icon. A browser tab showing `ivancww.github.io` therefore means
the installed Home Screen app was not the active launch context; it is not evidence that the gateway
made an active standalone PWA leave standalone mode.

## References used for the study

- W3C Web App Manifest, scope member: <https://www.w3.org/TR/appmanifest/#scope-member>
- MDN, manifest scope: <https://developer.mozilla.org/en-US/docs/Web/Manifest/Reference/scope>
- MDN, service worker registration scope: <https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register>
- GitHub Pages project-site paths: <https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages>
- Apple, configuring Home Screen web apps: <https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html>
- Chrome Developers, installed-PWA navigation management: <https://developer.chrome.com/docs/capabilities/pwa-navigation-management>
