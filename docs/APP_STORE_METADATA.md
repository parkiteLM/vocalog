# VocaLog — App Store & Google Play Store Submission Package

This document contains production-ready copy, metadata, categorization descriptions, and privacy declarations required when submitting VocaLog to the **Apple App Store** and **Google Play Console**.

---

## 1. App Store Metadata (Apple iOS & iPadOS)

* **App Name:** VocaLog: Private Voice Journal
* **Subtitle (Max 30 characters):** Voice Journal & AI Bullet Log
* **Primary Category:** Productivity
* **Secondary Category:** Lifestyle
* **Age Rating:** 4+

### Keywords (Max 100 characters, comma-separated)
```
voice journal,audio diary,bullet journal,whisper,speech to text,offline notes,private diary,memo,bujo
```

### Promotional Text (Max 170 characters)
Speak your mind and let on-device AI organize your thoughts into bullet tasks, events, reflections, and notes. 100% offline, zero cloud tracking, completely private.

### App Store Description (Max 4,000 characters)
```text
VocaLog is the 100% private voice journal designed for thinkers, builders, and creators. Speak naturally without self-editing—VocaLog uses an on-device AI speech engine to transcribe, clean verbal filler words, and organize your rambles into clean Bullet Journal entries in seconds.

NO CLOUD. NO TRACKING. 100% ON-DEVICE PRIVACY.
Unlike traditional voice apps that upload your sensitive thoughts to third-party cloud servers, VocaLog processes 100% of your audio locally on your phone using quantized Whisper AI. Your voice never leaves your device. No user accounts, no analytics, no external APIs.

AUTOMATIC BULLET JOURNAL TAGGING & CATEGORIZATION
VocaLog automatically identifies your speech intent and organizes entries using the proven Bullet Journal method:

• TASK (Teal): Action items, errands, and to-dos. VocaLog automatically detects verbs like "need to", "remember to", or "submit" and extracts actionable bullet checklists from your voice note.
○ EVENT (Cyan): Scheduled appointments, meetings, dinners, and milestones triggered by phrases like "tomorrow at 10 AM" or "meeting with Sarah".
✦ REFLECTION (Purple): Emotional check-ins, gratitude, and personal insights recognized from introspective reflections like "I feel proud of" or "lesson learned".
— NOTE (Amber): Ideas, facts, quotes, and everyday observations that don't fit into a rigid calendar or to-do box.

ZERO FILLER WORDS. CRYSTAL CLEAR NOTES.
Speak freely without worrying about "um", "uh", "like", or stuttering. VocaLog’s built-in NLP engine strips conversational filler words and cleans punctuation, giving you polished, publication-ready daily logs.

SMART STORAGE MANAGEMENT (21-DAY AUDIO RETENTION)
Audio recordings can consume gigabytes of storage over time. VocaLog's intelligent retention automatically prunes local audio files after 21 days while keeping your formatted text transcripts, summaries, and action checklists saved permanently in your private database forever.

DATA OWNERSHIP & INSTANT EXPORT
Your journal belongs to you. Export your entire history at any time with one tap:
- Export as Markdown for Obsidian, Notion, Bear, and Logseq.
- Export as standard JSON for custom backups and scripts.

ONE-TAP WIDGET & QUICK LOGGING
Capture fleeting thoughts instantly from your Home Screen with our deep-linked quick-record shortcut.

VOCALOG PRO FEATURES
Unlock unlimited customization with VocaLog Pro:
- Custom audio retention windows (7 days, 14 days, 60 days, or Keep Forever).
- Priority on-device processing.
- Advanced export formats.

Subscription terms: Payment is charged to your Apple ID account upon confirmation of purchase. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing cycle. Manage your subscription in your App Store Account Settings.

Privacy Policy: 100% on-device local storage. No data collected.
Terms of Use: https://vocalog.app/terms
```

---

## 2. Google Play Store Listing (Android)

* **App Title (Max 30 characters):** VocaLog: Private Voice Journal
* **Short Description (Max 80 characters):**
```text
100% offline voice journal. On-device AI turns your voice into bullet notes.
```

### Full Description (Max 4,000 characters)
```text
Speak your mind freely. VocaLog turns your spoken thoughts into structured Bullet Journal entries using 100% on-device AI. 

No cloud uploads. No account required. Your audio and thoughts never leave your phone.

WHY VOCALOG?
Most voice recorder apps leave you with endless audio recordings you never replay. VocaLog bridges the gap between quick voice capture and structured daily journaling by automatically transcribing, cleaning filler words, and categorizing your thoughts into clean bullet points.

100% OFFLINE SPEECH RECOGNITION
Powered by an on-device quantized Whisper speech model, VocaLog delivers high-accuracy speech-to-text without internet access. Whether on an airplane, in the subway, or offline in the woods, your voice journal works seamlessly with zero cloud lag and zero data charges.

INTELLIGENT BULLET JOURNAL CATEGORIZATION
VocaLog's natural language engine analyzes your speech and automatically tags each entry:

• TASK: Captures to-dos and action items. Automatically extracts checklist bullet points when you say things like "need to email", "buy groceries", or "finish presentation".
○ EVENT: Detects temporal commitments and meetings (e.g. "dinner tomorrow at 7 PM" or "standup with engineering team").
✦ REFLECTION: Identifies emotional observations, gratitude, and introspective thoughts (e.g. "feeling grateful for", "I realized", "in hindsight").
— NOTE: Serves as the flexible home for spontaneous ideas, quotes, observations, and facts.

AUTOMATIC FILLER WORD REMOVAL
VocaLog cleans conversational pauses like "um", "uh", "er", "you know", and "like", providing you with readable, formatted journal logs ready for review.

SMART 21-DAY STORAGE CLEANUP
Voice files can quickly clutter your phone's memory. VocaLog keeps the high-fidelity audio recording for 21 days for playback and then automatically cleans the audio file while keeping your text transcripts, titles, summaries, and action items stored permanently in your local database.

COMPLETE DATA FREEDOM
Export your journal entries anytime to Markdown (compatible with Obsidian, Notion, and Logseq) or structured JSON. No lock-in, ever.

VOCALOG PRO
Upgrade to customize your audio retention schedule (7 days, 14 days, 60 days, or Keep Forever) and support independent, private software development.
```

---

## 3. App Store Privacy & Data Safety Declarations

### Apple App Store Privacy Nutrition Label:
* **Data Used to Track You:** None (0).
* **Data Linked to You:** None (0).
* **Data Not Linked to You:** Diagnostics (Crash data for fatal crashes only, if opted-in via OS).
* **Audio Data:** *Not Collected*. Audio is processed strictly in temporary device RAM and local app sandboxed storage via hardware decoders. Zero audio bytes are transmitted over the internet.

### Google Play Data Safety Section:
* **Does your app collect or share user data?** No.
* **Is data encrypted in transit?** App runs completely offline; no data is sent to external servers.
* **Audio files:** Stored strictly on-device in app-private storage (`/data/user/0/com.vocalog.app`). Never shared with third parties.
* **User account:** Not required.

---

## 4. App Review Notes (For Apple & Google Reviewers)

```text
To the App Review Team:

VocaLog is designed with a strict, privacy-first, 100% on-device architecture.

Key verification details for testing:
1. No account creation or login is required. The app opens directly to the Daily Feed.
2. Speech-to-text transcription uses a local, quantized Whisper model packaged directly inside the app bundle (assets/models/ggml-tiny.en.bin). No external API calls or network connections are made during transcription.
3. You can test voice recording and transcription in complete Airplane Mode without Wi-Fi or cellular connectivity.
4. Voice Tagging:
   - Say: "I need to call Dr. Smith tomorrow at 9 AM" -> automatically classified as Task with extracted action item.
   - Say: "Meeting with client tomorrow at 2 PM" -> automatically classified as Event.
   - Say: "I felt really peaceful walking through the park this morning" -> automatically classified as Reflection.
5. In-app purchases for VocaLog Pro can be tested with standard StoreKit / Google Play Billing sandbox accounts.
```

