# VocaLog — Google Play Console Publishing & Post-Review Playbook

This document captures the current Google Play Store submission status, in-app subscription product configurations, closed testing tester management, and the 14-day production approval checklist.

---

## 1. Current Submission Status

* **Status:** **In Review** (Automated scanning & Google Play policy review underway).
* **Package Name:** `com.vocalog.app`
* **Release Track:** Closed Testing (Alpha Track)
* **Release Version:** `1.0.0 (1)`
* **App Bundle (`.aab`):** `android/app/build/outputs/bundle/release/app-release.aab`
* **Signing Keystore:** `android/app/vocalog-upload-key.keystore` (Alias: `vocalog-upload`, valid until April 2054)
* **Live Privacy Policy:** [https://parkitelm.github.io/vocalog/privacy.html](https://parkitelm.github.io/vocalog/privacy.html)
* **Public Web Portal:** [https://parkitelm.github.io/vocalog/](https://parkitelm.github.io/vocalog/)

---

## 2. In-App Subscriptions (VocaLog Pro) Configuration

In Google Play Console, navigate to **Monetize with Play** > **Products** > **Subscriptions**:

### Tier 1: Monthly Membership
* **Product ID:** `vocalog_pro_monthly`
* **Name:** `VocaLog Pro Monthly`
* **Billing Period:** Monthly (Auto-renewing)
* **Price:** **$3.49 USD** (adjust local currencies automatically)
* **Free Trial:** **3 Days**
* **Grace Period:** 7 Days (recommended)
* **Status:** Active / Ready for purchase

### Tier 2: Annual Special (Ongoing Continuous Rate)
* **Product ID:** `vocalog_pro_annual`
* **Name:** `VocaLog Pro Annual Special`
* **Billing Period:** Yearly (Auto-renewing)
* **Price:** **$35.00 USD** (~$2.92 / month, saving ~16%)
* **Promotion Type:** Ongoing standard rate (not a temporary discount)
* **Status:** Active / Ready for purchase

### Subscription Features Highlight:
* Custom Audio Retention: 7, 14, 60 Days, or Keep Forever / Never Purge.
* Continuous Feature Access: Active subscribers automatically receive all future app updates, new AI speech models, and upcoming features at no extra cost.

---

## 3. Closed Testing & 14-Day Tester Requirement Playbook

Google requires new personal developer accounts to maintain **at least 12 testers opted-in for 14 continuous days** before Production release access is unlocked.

### Step-by-Step Tester Setup:
1. Navigate to **Testing** > **Closed testing** > **Alpha track** > **Testers** tab.
2. Under **Email lists**, click **Create email list**.
3. Name your list (e.g. `VocaLog Beta Testers`).
4. Add 12–15 Gmail addresses of testers (friends, colleagues, or testing community members).
5. Scroll down to **How testers join your test** and copy the links:
   * **Join on Android:** `https://play.google.com/store/apps/details?id=com.vocalog.app`
   * **Join on the Web:** `https://play.google.com/apps/testing/com.vocalog.app`
6. Send the invitation message below to your testers.

### Tester Email / Invitation Template:
> **Subject:** Invitation to test VocaLog (100% Private Voice Journal) on Android
>
> Hi [Name],
>
> I've been developing **VocaLog**, an on-device AI voice journal that automatically transcribes and organizes spoken thoughts into Bullet Journal tasks, events, reflections, and notes—completely offline with zero cloud tracking.
>
> Could you please help test it for Google Play's 14-day testing period?
>
> 1. Click this link to opt into the test: **https://play.google.com/apps/testing/com.vocalog.app**
> 2. Click **"Become a tester"**.
> 3. Download the app directly from the Google Play Store on your Android phone.
> 4. Keep the app installed on your phone for 14 days.
>
> Thank you so much for your support!

---

## 4. Production Application Checklist (Day 14)

Once 12 testers have been opted in for 14 continuous days:
1. Return to the **Dashboard** in Google Play Console.
2. The **"Apply for Production"** button will turn blue and active.
3. Click **Apply for Production**.
4. Answer Google's 4 short questions regarding your test:
   * *How did you recruit testers?* (e.g., "Personal network of productivity enthusiasts, friends, and family").
   * *What feedback did you receive?* (e.g., "Users praised the fast on-device Whisper transcription speed and the automatic Bullet Journal categorization").
   * *What changes did you make based on feedback?* (e.g., "Optimized lock screen widgets, safe area insets on edge-to-edge screens, and daily email digest formatting").
5. Click **Submit**. Google typically grants Production access within 24–48 hours.
6. Once approved, click **Release** > **Production** > **Create new release**, select your verified `app-release.aab` bundle, and launch globally!

---

## 5. Security & Keystore Backup

* **Keystore Location:** `android/app/vocalog-upload-key.keystore`
* **Keystore Alias:** `vocalog-upload`
* **Keystore Password:** Protected in `android/gradle.properties` (ignored in `.gitignore`)
* **Critical Reminder:** Make a secure offline backup of `vocalog-upload-key.keystore` to an encrypted external drive or password manager. If this file is lost, you will not be able to publish future updates to Google Play.
