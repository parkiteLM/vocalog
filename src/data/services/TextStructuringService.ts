export interface StructuredEntryData {
  cleanedEntry: string;
  category: 'Task' | 'Reflection' | 'Event' | 'Note';
  actionItems: string[];
  title: string;
  summary: string;
}

class TextStructuringService {
  /**
   * List of conversational filler words and verbal hesitation tokens.
   * Matches optional leading/trailing commas so that e.g. ", uh," or "uh," cleanly vanishes.
   */
  private readonly fillerWordRegex =
    /(?:,\s*)?\b(um|uh|er|ah|you know|sort of|kind of|basically|literally|i mean)\b(?:\s*,)?/gi;

  /**
   * 'like' is treated carefully so it is only removed when used as a conversational filler,
   * avoiding stripping 'like' in expressions such as 'I like this' or 'look like'.
   */
  private readonly fillerLikeRegex =
    /(?:,\s*like\s*,|(?<=[.!?]\s+|^)like\s*,?|\s+like,\s*)/gi;

  /**
   * Strips hesitation tokens and conversational filler words from speech transcripts,
   * normalizes whitespace, and restores proper sentence capitalization.
   */
  removeFillerWords(text: string): string {
    if (!text || text.trim().length === 0) {
      return '';
    }

    let cleaned = text;

    // 1. Remove targeted conversational 'like' patterns
    cleaned = cleaned.replace(this.fillerLikeRegex, ' ');

    // 2. Remove standard filler words (along with surrounding comma pairs)
    cleaned = cleaned.replace(this.fillerWordRegex, ' ');

    // 3. Clean up residual comma artifacts, spaces before punctuation, etc.
    cleaned = cleaned
      .replace(/,\s*,+/g, ',') // Multiple commas -> single comma
      .replace(/([.!?])\s*,\s*/g, '$1 ') // Punctuation followed by comma -> remove comma
      .replace(/\s+([,.:;!?])/g, '$1') // Space before punctuation -> remove
      .replace(/([,])\s*([.!?])/g, '$2') // Comma immediately preceding sentence terminator -> terminator
      .replace(/\s{2,}/g, ' ') // Multiple spaces -> single space
      .trim();

    // 4. Remove leading punctuation (dots, commas, ellipsis, dashes) if left at the beginning
    cleaned = cleaned.replace(/^[,\s;:.!?–—-]+/, '').trim();

    // 5. Restore proper capitalization at the beginning of the text and after sentence terminators
    cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => {
      return `${prefix}${char.toUpperCase()}`;
    });

    // Ensure first letter of the overall text is capitalized
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }

  /**
   * Splits text into sentences, protecting common abbreviations like Dr., Mr., etc.
   */
  private splitSentences(text: string): string[] {
    // Temporarily replace abbreviations
    const protectedText = text
      .replace(/\bDr\./g, 'Dr_DOT_')
      .replace(/\bMr\./g, 'Mr_DOT_')
      .replace(/\bMrs\./g, 'Mrs_DOT_')
      .replace(/\bMs\./g, 'Ms_DOT_')
      .replace(/\bvs\./g, 'vs_DOT_')
      .replace(/\betc\./g, 'etc_DOT_');

    const rawSentences = protectedText.split(/(?<=[.!?])\s+/);

    return rawSentences
      .map((s) => s.replace(/_DOT_/g, '.').trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Classifies transcript into Bullet Journal categories (Task, Reflection, Event, Note)
   * based on lexical intent, verbs, and grammatical indicators.
   */
  classifyCategory(text: string): 'Task' | 'Reflection' | 'Event' | 'Note' {
    const lower = text.toLowerCase();

    let taskScore = 0;
    let eventScore = 0;
    let reflectionScore = 0;

    // Task indicators
    const taskTriggers = [
      /\b(need to|have to|must|don't forget|remember to|make sure to)\b/g,
      /\b(call|email|send|buy|order|finish|submit|fix|review|prepare|clean|ship|update)\b/g,
      /\b(deadline|todo|to-do|action item|task)\b/g,
    ];
    for (const pattern of taskTriggers) {
      const matches = lower.match(pattern);
      if (matches) taskScore += matches.length * 2;
    }

    // Event indicators (calendar & temporal appointments)
    const eventTriggers = [
      /\b(tomorrow at|tonight at|meeting with|dinner with|lunch with|coffee with)\b/g,
      /\b(calendar|appointment|conference|flight|scheduled for|interview at|party at)\b/g,
      /\b(at \d{1,2}(?::\d{2})?\s*(?:am|pm))\b/g,
    ];
    for (const pattern of eventTriggers) {
      const matches = lower.match(pattern);
      if (matches) eventScore += matches.length * 3;
    }

    // Reflection indicators (introspective personal thoughts)
    const reflectionTriggers = [
      /\b(i feel|i felt|feeling|grateful|gratitude|thankful)\b/g,
      /\b(i realized|realizing|thinking about|wondering|worried about|anxious|proud)\b/g,
      /\b(lesson learned|in hindsight|self reflection|growth|peaceful|happy with myself)\b/g,
    ];
    for (const pattern of reflectionTriggers) {
      const matches = lower.match(pattern);
      if (matches) reflectionScore += matches.length * 2;
    }

    if (taskScore > eventScore && taskScore > reflectionScore && taskScore >= 2) {
      return 'Task';
    }
    if (eventScore > taskScore && eventScore > reflectionScore && eventScore >= 2) {
      return 'Event';
    }
    if (reflectionScore > taskScore && reflectionScore > eventScore && reflectionScore >= 2) {
      return 'Reflection';
    }

    // Fallback to highest non-zero score or Note
    if (taskScore > 0 && taskScore >= eventScore && taskScore >= reflectionScore) {
      return 'Task';
    }
    if (eventScore > 0 && eventScore >= reflectionScore) {
      return 'Event';
    }
    if (reflectionScore > 0) {
      return 'Reflection';
    }

    return 'Note';
  }

  /**
   * Extracts actionable checklist bullet items from conversational transcript.
   * Identifies imperative commitments and normalizes them into clean to-do strings.
   */
  extractActionItems(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const sentences = this.splitSentences(text);
    const actionItems: string[] = [];

    // Trigger patterns for conversational commitments
    const actionPatterns = [
      /(?:i\s+)?(?:really\s+)?(?:need to|have to|must|gotta)\s+(.+)/i,
      /(?:don't forget to|remember to|make sure to)\s+(.+)/i,
      /(?:follow up (?:with|on))\s+(.+)/i,
      /(?:(?:schedule|set up|book)\s+(?:a\s+)?(?:meeting|call|flight|appointment|dinner)\s+with\s+.+)/i,
    ];

    // Imperative verb starters
    const imperativeStarters =
      /^(call|email|send|buy|order|finish|submit|fix|review|prepare|clean|ship|update|schedule)\s+(.+)/i;

    for (const sentence of sentences) {
      let matchedAction: string | null = null;

      for (const pattern of actionPatterns) {
        const match = sentence.match(pattern);
        if (match && match[1]) {
          matchedAction = match[1].trim();
          break;
        } else if (match && match[0]) {
          matchedAction = match[0].trim();
          break;
        }
      }

      if (!matchedAction) {
        const impMatch = sentence.match(imperativeStarters);
        if (impMatch) {
          matchedAction = sentence;
        }
      }

      if (matchedAction) {
        // Strip trailing punctuation
        let item = matchedAction.replace(/[.!?]+$/, '').trim();

        // Capitalize first character
        if (item.length > 0) {
          item = item.charAt(0).toUpperCase() + item.slice(1);
        }

        // Avoid very short fragments (< 6 chars) or duplicate items
        if (item.length >= 6 && !actionItems.includes(item)) {
          actionItems.push(item);
        }
      }
    }

    return actionItems;
  }

  /**
   * Generates a concise, meaningful title (3–6 words) without invoking external cloud APIs.
   */
  generateTitle(cleanedText: string, category: string): string {
    if (!cleanedText || cleanedText.trim().length === 0) {
      return `${category} Entry`;
    }

    // Split on first punctuation break (period, exclamation, question mark, or colon)
    const firstClause = cleanedText.split(/[.!?:]/)[0].trim();

    // Strip conversational preambles
    const trimmedClause = firstClause
      .replace(
        /^(so\s+today\s+|today\s+|i\s+was\s+thinking\s+about\s+|i\s+just\s+wanted\s+to\s+say\s+that\s+|just\s+wanted\s+to\s+note\s+that\s+|i\s+realized\s+that\s+)/i,
        ''
      )
      .trim();

    const words = trimmedClause.split(/\s+/);

    if (words.length <= 6) {
      return trimmedClause.charAt(0).toUpperCase() + trimmedClause.slice(1);
    }

    // Take the first 5 words
    const titleCandidate = words.slice(0, 5).join(' ');
    return titleCandidate.charAt(0).toUpperCase() + titleCandidate.slice(1);
  }

  /**
   * Generates a concise 1–2 sentence executive summary of the entry.
   */
  generateSummary(cleanedText: string): string {
    if (!cleanedText || cleanedText.trim().length === 0) {
      return '';
    }

    const sentences = this.splitSentences(cleanedText);

    if (sentences.length <= 2) {
      return sentences.join(' ');
    }

    // Return first 2 sentences as concise summary
    return `${sentences[0]} ${sentences[1]}`;
  }

  /**
   * Executes the full local structuring pipeline on a raw transcript.
   * Completely local, deterministic, and instant ($0.00 cost).
   */
  structureRawTranscript(rawTranscript: string): StructuredEntryData {
    const cleanedEntry = this.removeFillerWords(rawTranscript);
    const category = this.classifyCategory(cleanedEntry);
    const actionItems = this.extractActionItems(cleanedEntry);
    const title = this.generateTitle(cleanedEntry, category);
    const summary = this.generateSummary(cleanedEntry);

    return {
      cleanedEntry,
      category,
      actionItems,
      title,
      summary,
    };
  }
}

export const textStructuringService = new TextStructuringService();

