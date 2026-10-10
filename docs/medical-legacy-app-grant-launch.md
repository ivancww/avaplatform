# Medical Legacy App Grant launch compatibility

Medical is temporarily routed through the existing Platform GAS V6 legacy
contract while its Admin surface migrates from `ava-admin-session-v1`:

1. AVA Studio still authenticates once and keeps the Platform Admin Session.
2. The Medical registry entry declares `adminLaunchContract:
   ava-legacy-app-grant-v1`.
3. The Platform frontend calls the existing `issueAppLaunch` route only for
   Medical and places the resulting one-time ticket in the Medical Admin URL.
4. Medical GAS exchanges the ticket with the existing `exchangeAppLaunch`
   route and verifies App Grants with `verifyAppGrant` before Official Writes.

All other Admin-capable Apps continue using the existing
`issueAdminSession` browser-bound launch path. This frontend compatibility PR
depends on the Medical App PR titled `fix: migrate Medical Admin to
CRM-compatible App Grant`; neither PR changes Platform GAS V6, Script
Properties, CRM, Mother Rules or production deployment.
