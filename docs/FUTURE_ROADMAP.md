# VocaLog — Future Product Roadmap

This document captures upcoming features, enhancements, and architectural expansions planned for future versions of VocaLog beyond the initial MVP store release.

---

## 1. Multilingual Speech-to-Text & Global Localization (High Priority)
* **Goal:** Enable users worldwide to record voice notes in their native language with automatic detection and translated transcription.
* **Key Tasks:**
  - [ ] **Multilingual Whisper Weights:** Transition default asset from `ggml-tiny.en.bin` to multilingual `ggml-tiny.bin` (or provide on-demand downloads for `tiny` / `base` multilingual weights).
  - [ ] **Language Selection & Auto-Detection:**
    - Option for `"auto"` language detection in Whisper configuration.
    - Explicit language preference selector in Settings modal (e.g., English, Spanish, French, German, Japanese, Chinese, Hindi, Portuguese, etc.).
  - [ ] **Multilingual NLP Categorization:**
    - Expand `TextStructuringService.ts` trigger dictionaries for `Task`, `Event`, `Reflection`, and `Note` to recognize keywords in Spanish (*tengo que, reunión con, me siento*), French (*il faut, rendez-vous avec, je me sens*), German (*ich muss, treffen mit, ich fühle*), and other major languages.
  - [ ] **Multilingual Filler Word Stripping:**
    - Expand filler word regex patterns to strip conversational pauses across languages (*eh, este, pues, bueno* in Spanish; *euh, bah, genre* in French; *äh, also, quasi* in German).

---

## 2. iOS Native WidgetKit Extension (Phase 3 & 4 of Widget Plan)
* **Goal:** Provide native Apple iOS Lock Screen and Home Screen widgets using Apple's `WidgetKit` framework.
* **Key Tasks:**
  - [ ] Generate native iOS Xcode project via `expo prebuild`.
  - [ ] Implement Swift `WidgetExtension` for `accessoryCircular` (lock screen widget under clock).
  - [ ] Add iOS 18 `ControlWidget` lock screen button replacement for camera/flashlight.
  - [ ] Wire widget URLs directly to `vocalog://record`.

---

## 3. Advanced Search & Historical Filtering
* **Goal:** Allow users to instantly search through years of archived notes.
* **Key Tasks:**
  - [ ] **SQLite Full-Text Search (FTS5):** Index `raw_transcript`, `cleaned_entry`, `title`, and `summary` for sub-millisecond keyword queries.
  - [ ] **Category Filter Chips in Feed:** Quick filter toggle at the top of the feed to isolate only Tasks, Events, Reflections, or Notes.
  - [ ] **Global Search Screen:** Search modal with instant highlighting of matching words.

---

## 4. Voice Search & Audio Playback Enhancements
* **Goal:** Enhance daily replay and audio review experience.
* **Key Tasks:**
  - [ ] **Variable Playback Speed:** 1.25x, 1.5x, and 2.0x audio replay for recordings within the 21-day retention window.
  - [ ] **Audio Waveform Visualization:** Visual scrubber bar showing amplitude waves during playback.

---

## 5. Wearable & Smartwatch Companions
* **Goal:** Ultra-fast voice logging directly from wrists.
* **Key Tasks:**
  - [ ] **Wear OS Tile & Complication (Android):** 1-tap tile on Galaxy Watch, Pixel Watch, and Wear OS devices to trigger phone recording.
  - [ ] **Apple Watch Complication (watchOS):** Quick-record complication linking via watchOS companion target.

---

## 6. Daily Email Digest (Text & Raw Transcript Only)
* **Goal:** Enable users to email a clean summary of their daily messages/notes directly from the app with a single tap.
* **Constraints & Privacy:** Includes *only* formatted cleaned prose and raw transcript text; absolutely *no* audio files are included or transmitted.
* **Key Tasks:**
  - [ ] **Digest Formatter:** Generate structured plain-text / Markdown daily summary containing formatted text, summaries, action checklists, and raw transcripts.
  - [ ] **Email Integration:** Trigger system native email client via `mailto:` URL scheme with pre-filled subject and body (or scheduled daily digest via background task).
  - [ ] **UI Entrypoints:** Add "Email Daily Digest" button in the daily feed header and Settings modal.

---

## 7. Biometric App Lock & Enhanced Privacy
* **Goal:** Extra layer of security for personal introspective reflections and confidential to-dos.
* **Key Tasks:**
  - [ ] Face Unlock / Fingerprint authentication before opening the app via `expo-local-authentication`.
  - [ ] Option to disguise app notification previews.
