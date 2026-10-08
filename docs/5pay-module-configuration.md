# 5PAY Saving Plan independent-app integration boundary

## Source and deployment

5PAY Saving Plan remains the independently deployed
`ivancww/5pay-saving-plan` application. Its verified readiness merge is
`d02a6825be76c4a447ee9162b55837774b7ea715`. The stable production deployment
is:

`https://ivancww.github.io/5pay-saving-plan/`

The merged Saving Unified Admin implementation is
`0545eb67aa21922f04b695d581cb8a88c470e4c2`. Its secured Saving GAS is deployed
independently and is configured to use the AVA Platform Unified Admin
Authentication endpoint.

AVA Platform contains only registry metadata and common navigation entries. It
does not copy Saving source, P1–P7 flow pages, User Editor controls,
calculations, Product Logic, GAS/data, media implementation, or workflow into
this repository.

## Registered capabilities and entries

| AVA surface | Capability | Destination |
| --- | --- | --- |
| Home / favourites / tool library | Frontstage | `https://ivancww.github.io/5pay-saving-plan/?avaEntry=frontend` |
| 我的流程 | User/Edit | `https://ivancww.github.io/5pay-saving-plan/?avaEntry=user` |
| AVA Studio | Admin | `https://ivancww.github.io/5pay-saving-plan/?avaEntry=admin` |

The Platform registry declares `frontend: true`, `user: true`, and
`admin: true`. Home launches the actual Saving Frontstage. 我的流程 launches
the actual same Frontstage in User/Edit Mode; Saving owns **Edit → Preview →
Save Local** and its User Local Overrides. AVA Studio launches Admin through
the existing Platform Admin session and `issueAdminSession("5pay")`; the Platform
adds only the one-time `avaAdminLaunch` ticket to the Admin destination.
Platform does not create a second Saving workspace or editor.

Saving is launched by direct same-window, top-level navigation to its registered
canonical deployment. AVA's navigation manifest scope is `/`; its worker remains
scoped to `/avaplatform/`. No gateway is used for this production App.

Platform prepares its own return context before launch: Front removes
`avaSurface`; User/Admin preserve `avaSurface=user` / `avaSurface=admin`.
The canonical Front return is `/avaplatform/`, never `avaSurface=frontend`.
Saving's current return integration can consume AVA referrer context; reliable
explicit Return from every internal page remains an App-owned follow-up and
is not claimed fixed by this Platform-only experiment.

## Ownership and boundaries

- Saving remains the owner of its repository, source, independent deployment,
  business/calculation/product logic, P1–P7 workflow, User Local Overrides,
  media references and media rendering, and structured portable User data.
- Saving owns the Admin UI, `publish_content` validation, Official Sheet writes,
  and the `official-write` App-grant verification. Platform only owns registry
  capability declaration, Studio navigation, and launch issuance.
- Saving's independent PWA manifest and service worker remain Saving-owned.
  AVA Platform does not cache or serve Saving source as Platform source.
- Saving media remains reference/metadata-based with safe unavailable behavior;
  the current app has no connected Cloud Media Provider. Platform does not
  fabricate one.
- Existing AVA Platform Home, User Layer, Area, Folder, notification, backup,
  and reset architecture remains the owner of common Platform behavior.

The pre-existing vendored `modules/5pay` files are legacy compatibility
material, not the registered Saving deployment or production Admin authority.
They are not expanded, revived, or copied from the Independent App by this
integration. The Platform registry targets only
`https://ivancww.github.io/5pay-saving-plan/`.
