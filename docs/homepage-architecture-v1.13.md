# AVA Homepage, installation and cloud architecture (v1.13.0)

## Ownership and merge model

The homepage is `Official Cloud Default + official-card Personal Overrides + Personal Cards`. Official cards use an independent `areaId` and `order`; category is only searchable metadata. The three homepage areas remain layout containers and accept unlimited cards. Normal mode shows four cards per area, while edit mode shows all cards. Personal state stays in `ava:platform:homepage-preference` and is never sent by the official cloud writer.

A cloud card missing from a newer official response is not reconstructed from a stale local override. Hiding a module card only records `visible: false`; the production Module Registry, permissions and Toolbox remain unchanged.

## Installation and onboarding

The single initial-user URL is `install.html?install=1`. It is an installation gateway, not authentication. Apple browsers receive Add to Home Screen instructions; Android browsers use `beforeinstallprompt` when available and otherwise receive browser-menu instructions. No user or module data is initialized there.

A new standalone launch reads the official homepage cloud before requesting the user's name. Cloud failure presents Retry rather than claiming the bundled fallback is current. Existing users render their local state first. Module launches publish a narrow lifecycle handshake in session storage; each independent module remains responsible for its own first required cloud read, local-first version check, merge rules and business data.

## Admin boundary

AVA Studio requires a short-lived GAS-signed session. The password is sent to GAS only for authentication and is never stored in the sheet, local storage or repository. A protected write validates the session again, replaces only `homepage_cards`, retains supported settings, and increments `homepage_version`. Module-connected cards cannot be completely deleted in Studio; redundant presentation-only cards can.

`gas/Code.gs` is deployment source, not an automatically deployed production change. Read actions remain compatible with `health` and `getHomepageConfig`.

## Third-party component

`qrcode.min.js` is QRCode.js 1.0.0 (MIT, Kazuhiko Arase / davidshimjs) and is vendored so the installation QR remains available offline without sending its URL to a third-party QR service.
