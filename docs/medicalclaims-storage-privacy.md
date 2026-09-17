# Medical Claims storage and privacy ownership

## Starting state

This revision starts from branch `work`, commit `5d7e8d3`, AVA Platform v1.7.0 and
Medical Claims v7.6.0. It is an additive revision of the existing integrated module.

## Ownership map

| Data | Owner | Storage | Edit / delete authority | AVA backup |
| --- | --- | --- | --- | --- |
| Official cases | AVA/Admin | GAS official data and system cache | Admin edits/deletes source; user can only hide or create a personal overlay | Official source excluded; personal hidden IDs/overrides included |
| Official documents/assets | AVA/Admin | Official cloud/Firebase URLs and system cache | Admin manages source; user can only hide | Official source excluded; personal hidden IDs included |
| Personal cases | User | Personal LocalStorage record | That user can add/edit/delete; never written to official cloud | Included as personal metadata |
| Personal documents/images/PDF | User | User-selected registered provider | That user can save/open/delete after confirmation | Metadata and provider reference only; no Blob |
| Admin/system configuration | AVA/Admin | Official cache/GAS/Firebase configuration | Authenticated admin only | Excluded |

Hiding an official case or document writes only its stable ID into the user's personal hidden-ID
list. It never invokes Firebase, GAS, provider deletion or official-array mutation. Clearing personal
overrides makes the official source visible again.

## AVA Storage provider architecture

`ava-storage.js` owns `AVAStorage`, the platform registry and interface. A provider must expose a
stable ID and `saveFile()`, `resolveFile()`, `deletePersonalFile()` and `getMetadata()`; it may expose
`isAvailable()` so only working providers appear. Consumers call the registry by provider ID and do
not know provider implementation details.

The only currently available production provider is `local`, shown as **此裝置**. It stores private
Blobs in `AVA_USER_STORAGE_V1/files` IndexedDB and returns an opaque reference. Medical Claims stores
only ownership/display metadata in its existing personal metadata key. The legacy
`AVA_MED_USER_DOCUMENTS_V1/userFiles` store is read only as a backward-compatible migration source.

No Google Drive provider or production OAuth configuration exists in this AVA source, so Google
Drive is not shown and no fake integration is registered. A future platform provider can register
itself with `AVAStorage.registerProvider()` without changing Medical Claims business logic.

## Upload and delete flow

1. User selects files from **我的私人文件** or a personal case's **上載附件** action.
2. Medical Claims asks `AVAStorage.getAvailableProviders()` and renders only available providers.
3. User explicitly chooses a location.
4. `AVAStorage.saveFile()` saves to that user-owned provider.
5. Medical Claims records `source`, `storageProvider`, opaque provider reference/file ID, filename,
   MIME type, category, timestamps, case relationship and display order.
6. Open resolves the Blob/reference through the same provider. A missing local-only Blob produces a
   re-upload warning rather than a fake file.
7. Delete asks for confirmation, calls only that provider's `deletePersonalFile()`, then removes only
   personal metadata. It never touches official documents.

Legacy metadata is normalized on read. Legacy local Blobs are copied into the AVA local provider on
first successful resolve, preserving existing installations.

## Firebase boundary

Firebase **still handles** authenticated admin uploads of official cases/documents and existing
official/system assets. The original admin controls and cloud behavior remain.

Firebase **does not handle** uploads initiated from **我的私人文件**, personal cases, storage choice,
or AVA Storage. The personal upload path calls only `AVAStorage.saveFile()`; the Firebase upload
function rejects non-admin use.

**Personal User PDF/Image automatically uploaded to Ivan Firebase? NO.**

## Backup, restore and device transfer

AVA Backup remains the only orchestrator. It includes personal configuration, hidden official IDs,
personal overlays/cases, normalized personal file metadata, provider IDs/references and display
order. It excludes file Blobs, official/system caches, endpoints and auth.

For the local provider, a restored metadata record is explicitly marked missing because the Blob is
not in the JSON package. The UI tells the user the file was stored on another device and must be
re-uploaded. For a future cloud provider, metadata retains the provider reference and is not marked
missing; resolution can occur only after the user reconnects that provider. No private file is
copied to AVA/Firebase as part of backup or device transfer.
