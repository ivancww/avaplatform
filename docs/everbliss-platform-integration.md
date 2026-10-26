# EverBliss AVA Platform integration

## Registration and ownership

EverBliss is registered once in `MODULE_REGISTRY` as App ID `everbliss` and
remains independently deployed. AVA Platform owns discovery, navigation, and
the common AVA User return surface. EverBliss owns its customer journey, local
presentation settings, Official product dataset, calculations, and app-specific
Admin interface.

- Production Front: `https://ivancww.github.io/everbliss/?avaEntry=frontend`
- Production User Edit: `https://ivancww.github.io/everbliss/?avaEntry=user`
- Production Admin: `https://ivancww.github.io/everbliss/?avaEntry=admin`
- Front return: `https://ivancww.github.io/avaplatform/`
- User return: `https://ivancww.github.io/avaplatform/?avaSurface=user`
- Admin return: `https://ivancww.github.io/avaplatform/?avaSurface=admin`
- EverBliss release: `v0.4.0`, PR6 merge `ae8d578b2c0fdc28ff2a671b48387089af7e8805`

The v0.4.0 User route edits the same customer Frontstage in place, supports
Preview, Return to Edit, Save Local, and persists User Overrides. Live QA passed
these User Edit checks, including applying saved overrides in Frontstage. The
Platform registry enables the canonical User entry and User settings. The
Platform return route is generic for Independent Apps: an initialized,
onboarded browser User entering with `?avaSurface=user` opens `我的流程`;
first-time browser visits retain the install/onboarding flow. Production
verification of this Platform routing change remains pending merge and deploy.

## Admin status

The EverBliss repository adapter now uses `AVA_PLATFORM_ADMIN_ENDPOINT`, the
`ava-admin-session-v1` proof/session contract, and the Platform
`exchangeAdminSession` flow. Platform Admin capability
remains disabled (`admin:false`, `adminSettings:false`). Production Admin
readiness is pending EverBliss GAS deployment, endpoint configuration,
`AVA_ADMIN_APP_IDS=everbliss` configuration in Platform GAS, live AVA Studio
proof exchange, and protected Official Read verification. This Platform PR
does not deploy either GAS project or change the Platform allowlist. Never put
server-side credentials in browser code.

## Homepage and update feeds

The Homepage card uses the Official `homepage_cards` schema with
`module_key=everbliss`; routing and capabilities remain registry-owned. The
existing Official `update_notifications` feed supports user-facing EverBliss
announcements when appropriate. Platform does not clear EverBliss storage or
own its service-worker/build-ID forced-update behavior.

`integrationVersion` records the reviewed source integration baseline, not the
App release version. It now references the EverBliss PR6 merge SHA above.

## Verification and remaining gates

Live EverBliss v0.4.0 QA confirmed the same Frontstage, direct editing,
Preview, return to Edit, local save, reopen persistence, Frontstage override
rendering, journey presentation editing, feature visibility/order, section
reset, Official-layer protection, and preserved customer state. The only
failed EverBliss QA gate was Return AVA landing on `install.html?install=1`;
this PR repairs the Platform entry gate. Since the Platform production site
cannot run this branch until it is deployed, live verification of the repaired
return path remains pending merge/deploy.

Admin stays disabled until the production GAS and live authorization checks
listed above pass. This PR keeps Platform at `v1.14.5`; it does not make a
second version bump within the same unreleased PR.
