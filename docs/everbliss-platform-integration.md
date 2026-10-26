# EverBliss AVA Platform integration

## Registration and ownership

EverBliss is registered once in `MODULE_REGISTRY` as App ID `everbliss` and
remains an independently deployed App. AVA Platform owns discovery,
navigation, the Platform Homepage card, and common AVA Studio launch context.
EverBliss owns its customer journey, local presentation settings, Official
product dataset, calculations, and app-specific Admin interface.

- Production Front: `https://ivancww.github.io/everbliss/?avaEntry=frontend`
- App-owned User Edit route: `https://ivancww.github.io/everbliss/?avaEntry=user`
- App-owned Admin route: `https://ivancww.github.io/everbliss/?avaEntry=admin`
- Front return: `https://ivancww.github.io/avaplatform/`
- User return: `https://ivancww.github.io/avaplatform/?avaSurface=user`
- Admin return: `https://ivancww.github.io/avaplatform/?avaSurface=admin`
- Verified EverBliss release: `v0.3.0`, build `aa026bd2f41304fe2a26e0b39acc255d0d0541a2`

The Platform registry currently enables only `frontend`. The deployed `user`
route is an independent User Edit page, while the AVA Mother Rules require
User mode to edit the same Frontstage in place (Edit → Preview → Save Local).
Keep Platform `user` capability disabled until EverBliss conforms and passes
the live persistence/readiness gates. No Platform-side User configuration is
created; EverBliss User Overrides remain in the EverBliss origin.

The deployed Admin URL denies direct entry without a valid proof. However, the
current EverBliss `gas/Code.gs` expects `AVA_ADMIN_VERIFY_URL` and
`AVA_ADMIN_VERIFY_TOKEN` and calls a verifier contract that differs from the
current Platform `exchangeAdminSession` / `verifyAdminSession` contract used by
mature Apps. Consequently Platform `admin` capability remains disabled; do
not add `everbliss` to `AVA_ADMIN_APP_IDS` or claim authorized Admin readiness
until the EverBliss backend adapter is migrated, deployed and verified against
the current contract. Platform GAS endpoint:
`https://script.google.com/macros/s/AKfycbzVf1fuxcq8GPSOzS8WvcAtubqaawFj0rbVjxe0LOLKfwbYkRZf7Vs61Q0T73UG6dznww/exec`.
The adapter should use a server-side `AVA_PLATFORM_ADMIN_ENDPOINT` property for
that URL; Platform GAS must preserve its existing `AVA_ADMIN_APP_IDS` list and
include `everbliss`. The deployed EverBliss Script Properties and Platform
allowlist were not accessible for verification in this task. The current repo
source's `AVA_ADMIN_VERIFY_URL` / `AVA_ADMIN_VERIFY_TOKEN` contract is not the
current Platform contract. Never place any server-side token in browser code.

## Homepage and update feeds

The Homepage card was added to the existing Official `homepage_cards` schema
with `module_key=everbliss`; routing still comes from `MODULE_REGISTRY`. It is
visible by default and follows the same card visibility/customization model as
other Official Apps. The live Platform Google Sheet is `AVA-Platform` (`1-p_DCV5RDI9AzN3ZiVPlsCJXx47vMYJ96bT8LTawKvk`),
with tabs `homepage_cards`, `update_notifications`, and `homepage_settings`.
The existing card rows are Official Homepage presentation data, not a second
App registry. Platform App discovery and capability remain registry-owned.

EverBliss's app version is owned by its `release.json` and release process;
`integrationVersion` in the Platform registry is source integration metadata,
not an App version. The existing Official `update_notifications` feed supports
`new_app` and `app_update` rows with `app_id` and `version`. Publish a row there
for a user-facing EverBliss announcement/update when appropriate; there is no
separate EverBliss update system. AVA Platform does not clear EverBliss storage
or own its service worker/build-ID forced-update behavior.

## Verification and remaining gates

Verified against the live deployment: Front opens and displays the customer
journey; Front returns to AVA; `release.json` reports `v0.3.0` and the expected
build ID; User route opens the current EverBliss User Edit; Admin route without
proof shows `ADMIN ACCESS DENIED · FAIL CLOSED` and links to AVA Studio.

Not verified in this Platform-only change: live AVA User in-place editing,
preview/save persistence from that surface, PWA-to-App navigation on physical
iPad, AVA Studio-to-EverBliss browser-bound Admin proof exchange, an
EverBliss-authorized Official read, EverBliss GAS Script Properties, or
production equivalence between the deployed GAS version and PR5 source.

Before enabling User: update EverBliss User route to the canonical Frontstage
Edit → Preview → Save Local contract and verify it live. Before enabling Admin:
update and deploy the EverBliss GAS adapter to call the existing Platform
`exchangeAdminSession` endpoint with `AVA_ADMIN_APP_IDS=everbliss` configured
in Platform GAS, then verify proof exchange and server-side authorization.
The AVA Platform Apps registry, Homepage card, and Platform version change in
this PR do not deploy Platform GAS or EverBliss GAS.
