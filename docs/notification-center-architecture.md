# AVA Platform Official Update Feed and Notification Center

The Official Update Feed and Notification Center are AVA Platform capabilities. The existing AVA Studio / GAS Web App remains the single Official Cloud path; Independent Apps provide integration metadata only and do not create AVA-wide notification centers.

## Official Sheet contract

The existing Google Sheet tab `update_notifications` is consumed as-is. Its exact headers are:

`notification_id`, `type`, `app_id`, `title`, `summary`, `version`, `published_at`, `active`, `show_popup`, `action_type`, `sort_order`

Supported `type` values are `new_app`, `app_update`, `platform_update`, and `announcement`. Supported `action_type` values are `view_app`, `view_update`, `add_to_home`, and `none`. User read/unread/prompted state is never written to the Sheet.

The GAS code validates rows and ignores malformed records for reads. The secured Studio write path validates the same contract and requires the existing short-lived Admin session. It does not create or rename the Sheet.

## Local-first flow

The Homepage renders from its existing local Official cache and User Layer first. Notification sync runs in the background and falls back to the notification Last Known Good cache or an empty feed. Failure never blocks or clears Homepage data. One prompt may be shown for newly eligible `show_popup` records; prompting does not mark a record read. User read and prompted IDs are stored under `ava:platform:notification-state-v1` and remain device/User-local.

The platform backup package includes that state key, but not copies of Official notification content. Restore therefore preserves handled notification history without turning Official content into User-owned backup data.

## GAS deployment boundary

This repository change updates `gas/Code.gs`; it does not deploy the live GAS Web App. An authorized operator must update the existing GAS project with this file, preserve its Script Properties and existing deployment, and deploy a new version of that same Web App deployment. Do not create a second deployment or expose the endpoint in User UI. Verify `?action=getNotifications` returns `{success:true,data:{notifications:[...]}}`, and verify the existing Homepage config and authenticated Studio actions still work.
