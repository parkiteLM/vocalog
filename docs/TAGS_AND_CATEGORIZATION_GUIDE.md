# VocaLog Voice Tags & NLP Categorization Guide

VocaLog uses an on-device Natural Language Processing (NLP) structuring engine to automatically categorize spoken journal entries into 4 distinct **Bullet Journal (BuJo)** categories. 

All processing runs 100% locally on the device with zero cloud latency, zero server costs, and complete privacy.

---

## The 4 Bullet Journal Categories

```
+---------------------------------------------------------------------------------------+
|  CATEGORY    |  BADGE COLOR  |  SYMBOL  |  PRIMARY PURPOSE                             |
+---------------------------------------------------------------------------------------+
|  Task        |  Neon Teal    |    •     |  Actionable to-dos, deadlines, work tasks    |
|  Event       |  Cyan         |    ○     |  Calendar dates, meetings, scheduled times   |
|  Reflection  |  Purple       |    ✦     |  Introspective thoughts, feelings, gratitude |
|  Note        |  Amber        |    —     |  Facts, observations, quotes, ideas          |
+---------------------------------------------------------------------------------------+
```

---

## 1. Task (`•`)
* **Badge Color:** `#2DD4BF` (Neon Teal)
* **Purpose:** Captures actionable items that require completion. Automatically extracts checklist bullet items for easy review.

### Spoken Trigger Keywords & Phrases
* **Action verbs:** *need to*, *have to*, *must*, *don't forget to*, *remember to*, *make sure to*
* **Imperative verbs:** *call*, *email*, *send*, *buy*, *order*, *finish*, *submit*, *fix*, *review*, *prepare*, *clean*, *ship*, *update*, *schedule*, *write*
* **Task nouns:** *deadline*, *todo*, *to-do*, *action item*, *task*, *errand*

### Examples
> *"I need to email David the updated slide deck before 5 PM today and make sure to copy the engineering leads."*  
> **Output:** Category: `Task` | Action Items: `["Email David the updated slide deck before 5 PM today", "Copy the engineering leads"]`

---

## 2. Event (`○`)
* **Badge Color:** `#06B6D4` (Cyan)
* **Purpose:** Captures appointments, temporal milestones, gatherings, and calendar commitments.

### Spoken Trigger Keywords & Phrases
* **Temporal markers:** *tomorrow at*, *tonight at*, *scheduled for*, *at [time] AM/PM*
* **Social / professional gatherings:** *meeting with*, *dinner with*, *lunch with*, *coffee with*, *call with*
* **Calendar nouns:** *calendar*, *appointment*, *conference*, *flight*, *interview at*, *party at*, *presentation at*

### Examples
> *"Meeting with the marketing team tomorrow at 10 AM in conference room B to discuss Q4 launch goals."*  
> **Output:** Category: `Event` | Summary: *"Meeting with marketing team tomorrow at 10 AM to discuss Q4 launch goals."*

---

## 3. Reflection (`✦`)
* **Badge Color:** `#A855F7` (Purple)
* **Purpose:** Captures emotional awareness, introspective thoughts, gratitude, lessons learned, and personal growth.

### Spoken Trigger Keywords & Phrases
* **Emotional state:** *I feel*, *I felt*, *feeling*, *grateful for*, *gratitude*, *thankful for*, *peaceful*, *proud of*
* **Cognitive insights:** *I realized*, *realizing*, *thinking about*, *wondering about*, *worried about*, *anxious about*, *happy with myself*
* **Growth markers:** *lesson learned*, *in hindsight*, *self reflection*, *personal growth*

### Examples
> *"I felt really proud of how the product demo went today. In hindsight, practicing the introduction beforehand made a huge difference."*  
> **Output:** Category: `Reflection` | Summary: *"Proud of the product demo and recognized value of practicing introduction."*

---

## 4. Note (`—`)
* **Badge Color:** `#F59E0B` (Amber)
* **Purpose:** Captures ideas, observations, facts, quotes, and miscellaneous memories that are not explicitly to-dos or calendar events.

### Trigger Mechanism
* Serves as the **natural fallback** when speech contains descriptive observations or general logging without dominant task imperatives or scheduled times.

### Examples
> *"Interesting insight from the audio book: consistency beats intensity every single time when forming long-term habits."*  
> **Output:** Category: `Note` | Summary: *"Consistency beats intensity when forming long-term habits."*

---

## Automatic Text Cleaning & Structuring

Beyond categorization, VocaLog automatically applies zero-latency NLP transformations:
1. **Filler Word Removal:** Eliminates *um*, *uh*, *er*, *ah*, conversational *like*, *you know*, *basically*, *actually*, *literally*, *I mean*, and *sort of*.
2. **Punctuation & Grammar Correction:** Restores clean capitalization, strips trailing commas, and formats sentences cleanly.
3. **Executive Summary Synthesis:** Generates a concise single-sentence summary for rapid feed scanning.
4. **Action Item Extraction:** Isolates actionable checklist items from long rambles so you never lose a to-do.
