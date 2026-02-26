# Permissions Declaration — SanchezMotors
**App package:** `com.tuinsomnia.sanchezmotors`
**Prepared for:** Google Play Store Review
**Date:** 2026-02-26

---

## android.permission.READ_MEDIA_IMAGES

**Why we request it:**
SanchezMotors is a workshop management app that requires technicians to attach photographic evidence to work orders. Users may choose an existing photo from their device gallery (instead of taking a new one with the camera) when documenting vehicle inspection slots (front, rear, left side, right side, interior front, interior rear) or attaching evidence photos to individual repair tasks.

**How it is used:**
- When the user taps "Galería" in the photo picker dialog, the app opens the system image picker via `expo-image-picker` to let the user select an existing image from their library.
- The selected image URI is stored locally on the device (AsyncStorage + local file path). No image is uploaded to a server.
- Access is only requested at the moment the user explicitly triggers the gallery picker — the app never reads media in the background.

**Alternatives considered:**
The camera-only flow (`android.permission.CAMERA`) covers new photos, but workshops frequently receive vehicles where prior damage photos were already taken by the client or by other staff on a different device and shared via WhatsApp. Allowing gallery selection avoids forcing a duplicate re-photograph.

---

## android.permission.READ_MEDIA_VIDEO

**Why we request it:**
`READ_MEDIA_VIDEO` is requested as part of the standard media access group required by Android 13+ (API 33) when integrating `expo-image-picker` and `expo-media-library`. The permission is declared in the manifest to remain compatible with the scoped media storage model introduced in Android 13.

**How it is used:**
The app does **not** record, play back, or process video files at any point. No video content is accessed or displayed within the app. The permission is present solely because the underlying Expo SDK libraries (`expo-image-picker`, `expo-media-library`) include it in their permission group declaration for forward-compatibility with the Android media picker API surface.

**Alternatives considered:**
Removing `READ_MEDIA_VIDEO` individually while keeping `READ_MEDIA_IMAGES` is not straightforward with the current Expo SDK version (Expo ~54) because the media library plugin declares them as a group. A future update will scope this down using `READ_MEDIA_VISUAL_USER_SELECTED` (already declared) as the primary mechanism once full Expo SDK support stabilizes.

---

## Summary table

| Permission | Required for core feature | Background access | Data leaves device |
|---|---|---|---|
| `READ_MEDIA_IMAGES` | Yes — gallery photo selection for inspection & task evidence | No | No |
| `READ_MEDIA_VIDEO` | No — SDK dependency declaration only | No | No |

---

## Contact

For questions regarding this declaration, contact the app developer at the Google Play Console account associated with `com.tuinsomnia.sanchezmotors`.
