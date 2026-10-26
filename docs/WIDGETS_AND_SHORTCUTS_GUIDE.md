# VocaLog: Lock Screen Widgets & Shortcuts Guide

This guide provides step-by-step instructions for users on **Android** and **iOS** to set up 1-tap lock screen access, pull-down quick settings tiles, and desktop widgets to capture voice notes instantly without unlocking their device.

---

## Part 1: Android Setup Guide

Android offers three fast ways to capture voice notes from the lock screen and home screen:

### Option 1: Lock Screen Pull-Down Tile (Fastest — All Android Versions)
*Capture voice notes directly from your lock screen without opening your app drawer.*

1. **Wake your phone** to display the Lock Screen.
2. **Swipe down twice** from the top of the screen to reveal the full **Quick Settings** panel.
3. Tap the **Pencil / Edit** icon (usually at the bottom right or top right depending on phone brand).
4. Scroll down through available tiles to find **"Record Note"** (with the teal VocaLog microphone icon).
5. **Drag and drop** the **Record Note** tile into your active top tiles.
6. Tap **Done** or the back arrow to save.
7. **To Use:** Whenever you need to record a thought, swipe down on your lock screen and tap **Record Note**. The shade collapses and VocaLog opens directly into an active recording session.

---

### Option 2: Lock Screen Corner Shortcut (Android 14 & 15)
*Assign VocaLog directly to the bottom-left or bottom-right corner of your lock screen.*

1. Open your phone's **Settings**.
2. Tap **Wallpaper & Style** (or **Display $\rightarrow$ Lock Screen** depending on device).
3. Tap **Lock Screen**, then look for **Shortcuts**.
4. Select either the **Left Shortcut** or **Right Shortcut**.
5. Scroll through your installed apps and select **VocaLog** $\rightarrow$ choose **"Record Note"**.
6. **To Use:** From the lock screen, press and swipe the VocaLog corner icon to begin recording immediately.

---

### Option 3: 1-Tap Home Screen Desktop Widget
*Place a dedicated quick-record button directly on your phone's home screen.*

1. Navigate to your home screen and **long-press on an empty space**.
2. Tap **Widgets** in the menu that appears.
3. Scroll down or search for **VocaLog**.
4. Touch and hold the **VocaLog Quick Record** widget (1x1 circular mic button).
5. Drag it onto your home screen and release.
6. **To Use:** Tap the widget at any time to instantly trigger voice capture.

---

### Option 4: App Icon Quick Actions
*Long-press shortcut on your home screen or app drawer.*

1. **Touch and hold** the VocaLog app icon on your home screen.
2. A pop-up menu appears with two instant actions:
   * **Record:** Starts an immediate voice recording session.
   * **Today:** Jumps directly to today's Daily Feed.
3. **Tip:** You can touch and drag either of these shortcuts directly onto your home screen to create standalone 1-tap app icons!

---

## Part 2: Apple iOS Setup Guide (iPhone & iPad)

Apple iOS provides lock screen widgets (iOS 16+), Control Center quick toggles, Action Button support (iPhone 15 Pro & 16 series), and lock screen button replacements (iOS 18+).

### Option 1: Lock Screen Widget (iOS 16, 17, 18)
*Add a circular or rectangular 1-tap widget directly below the lock screen clock.*

1. **Wake your iPhone** and unlock it with Face ID / Touch ID, but **do not swipe up** (remain on the Lock Screen).
2. **Press and hold** the Lock Screen until the **Customize** button appears at the bottom.
3. Tap **Customize**, then select your **Lock Screen**.
4. Tap the **widget box** directly below the digital clock.
5. In the widget drawer, scroll down and tap **VocaLog** (or **Shortcuts** if using custom URL action).
6. Tap or drag the **VocaLog Quick Record** widget to add it to your lock screen.
7. Tap **Done** in the top right corner.
8. **To Use:** Tap the widget on your lock screen to immediately launch VocaLog and start recording.

---

### Option 2: Lock Screen Control Replacement (iOS 18+)
*Replace the default Flashlight or Camera buttons in the bottom corners of your Lock Screen.*

1. **Press and hold** the Lock Screen until the **Customize** button appears.
2. Tap **Customize**, then tap **Lock Screen**.
3. Tap the **minus (`-`) icon** on either the Flashlight or Camera button to remove it.
4. Tap the **plus (`+`) icon** to add a new control.
5. Search for **VocaLog** or choose **Open App / Shortcut** $\rightarrow$ select **VocaLog Record** (`vocalog://record`).
6. Tap **Done** in the top right corner.
7. **To Use:** Press the corner button from your lock screen to instantly start a recording session.

---

### Option 3: Action Button Setup (iPhone 15 Pro, 15 Pro Max, 16 Series)
*Capture voice notes instantly with the physical hardware Action Button on the side of your iPhone.*

1. Open **Settings** on your iPhone.
2. Tap **Action Button**.
3. Swipe across to select **Shortcut**.
4. Tap the selection menu beneath "Shortcut" and choose **Open URL**.
5. Type or paste:
   ```
   vocalog://record
   ```
6. **To Use:** Press and hold the physical Action Button at any time (even while your phone screen is completely black) to wake your phone and start recording instantly.

---

### Option 4: Control Center Pull-Down Tile (All iOS Versions)
*Access quick recording with a swipe down from the top-right corner of your screen.*

1. Open your iPhone's **Shortcuts** app.
2. Tap **`+`** (New Shortcut) $\rightarrow$ Add Action $\rightarrow$ search for **Open URLs**.
3. Enter `vocalog://record` and name the shortcut **"VocaLog Record"**.
4. Go to **Settings $\rightarrow$ Control Center** (or in iOS 18, swipe down Control Center, tap `+`, and add the shortcut control).
5. **To Use:** Swipe down from the top-right corner of your screen from any app or lock screen and tap the tile to record.

---

## Technical Reference: Supported Deep Link URIs

Both Android and iOS widgets and shortcuts interact directly with VocaLog via standard URL schemes:

| URI Scheme | Action Triggered |
| :--- | :--- |
| **`vocalog://record`** | Immediately opens VocaLog and triggers microphone recording. |
| **`vocalog://today`** | Navigates to today's date in the Daily Feed. |
| **`vocalog://settings`** | Opens the Settings & Privacy modal. |

