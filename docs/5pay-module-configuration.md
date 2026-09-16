# 5Pay Module Configuration

## Boundary

AVA Platform manages configuration only. 5Pay continues to own its scenarios, renderer, fixed and gap pages, navigation, answer state, calculations, business rules and Firebase image consumption. The first migration phase deliberately does not remove the existing 5Pay dashboards.

## Scope mapping

| AVA surface | Scope | 5Pay areas |
| --- | --- | --- |
| 我的流程 → 5Pay | `personal` | Scenario/flow, questions/pages/options, Gap, compound-time text, Jar labels and Blueprint text/image |
| AVA Studio → Apps → 5Pay | `official` | All user areas plus Mapping, system parameters and Cloud/Google Sheet sync configuration |

Personal overrides and official defaults have separate storage keys and editor entry points. Restoring personal configuration never changes official configuration.

## Storage and migration

The adapter owns these namespaced keys:

* `ava:modules:5pay:user-config`
* `ava:modules:5pay:official-config`
* `ava:modules:5pay:schema-version`
* `ava:modules:5pay:legacy-snapshot`

On its first personal load, the adapter checks known legacy user-config keys. It copies the original value into the legacy snapshot before migrating it into the versioned envelope. It never deletes the legacy source. Future migrations enter through `migrate()`.

The envelope keeps 5Pay data under `data` without translating it into a platform-wide workflow schema:

```json
{
  "schemaVersion": 1,
  "moduleId": "5pay",
  "scope": "personal",
  "updatedAt": "ISO-8601 timestamp",
  "data": {}
}
```

## Adapter contract

`modules/5pay-adapter.js` registers metadata and separate user/admin section definitions, then implements `load()`, `resolve()`, `save()`, `restoreDefault()`, `export()`, `import()` and `migrate()`. `resolve()` overlays personal fields on the official default and is the read boundary intended for the 5Pay frontend. Platform core discovers the adapter through `window.AVAModules`; 5Pay-specific section knowledge therefore remains outside the backup and shell code.

## Universal backup and transfer

`platform-backup.js` makes one AVA package containing allow-listed platform personal data and the `export()` result of every registered adapter. Restore delegates module payloads to each adapter's `migrate()` and `import()` methods. There is intentionally no per-module backup UI.

The device-transfer screen is only an architecture entry point in this phase. A later transfer service will place the AVA package in a transfer session and encode only its short-lived token in a QR code; configuration data is not embedded directly in the QR code.

## Deferred work

5Pay runtime consumption, authenticated server persistence, real Cloud/Google Sheet synchronization and QR transfer sessions require integration endpoints in their respective applications. Existing 5Pay User/Admin dashboards must remain available until those integrations and cross-repository regression tests pass.
