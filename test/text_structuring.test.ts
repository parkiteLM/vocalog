import { textStructuringService } from '../src/data/services/TextStructuringService';

describe('TextStructuringService (Zero-Cost Local NLP Engine)', () => {
  describe('removeFillerWords', () => {
    it('strips hesitation tokens (um, uh, er, ah)', () => {
      const raw = 'Um, today was, uh, really productive and er I finished my tasks.';
      const cleaned = textStructuringService.removeFillerWords(raw);
      expect(cleaned).toBe('Today was really productive and I finished my tasks.');
    });

    it('strips conversational filler phrases (you know, kind of, sort of, basically, literally, i mean)', () => {
      const raw = 'I mean, it was sort of difficult, but you know, basically we made it.';
      const cleaned = textStructuringService.removeFillerWords(raw);
      expect(cleaned).toBe('It was difficult, but we made it.');
    });

    it('preserves words that contain filler substrings (alike, likely, unlike, hum)', () => {
      const raw = 'It is very likely that they are unlike each other, yet look alike.';
      const cleaned = textStructuringService.removeFillerWords(raw);
      expect(cleaned).toBe('It is very likely that they are unlike each other, yet look alike.');
    });

    it('restores proper sentence capitalization and cleans punctuation artifacts', () => {
      const raw = 'um... so I talked to John. uh, next steps are ready!';
      const cleaned = textStructuringService.removeFillerWords(raw);
      expect(cleaned).toMatch(/^So I talked to John\.\s*Next steps are ready!/);
    });

    it('handles empty strings or whitespace safely', () => {
      expect(textStructuringService.removeFillerWords('')).toBe('');
      expect(textStructuringService.removeFillerWords('   ')).toBe('');
    });
  });

  describe('classifyCategory', () => {
    it('correctly classifies Task entries', () => {
      const text = 'I need to call Dr. Smith and schedule my dental appointment by Friday.';
      expect(textStructuringService.classifyCategory(text)).toBe('Task');
    });

    it('correctly classifies Event entries', () => {
      const text = 'Meeting with the design team tomorrow at 3pm for project kickoff.';
      expect(textStructuringService.classifyCategory(text)).toBe('Event');
    });

    it('correctly classifies Reflection entries', () => {
      const text = 'I felt really grateful for my family today. I realized that slowing down brings peace.';
      expect(textStructuringService.classifyCategory(text)).toBe('Reflection');
    });

    it('falls back to Note for general observations or facts', () => {
      const text = 'Water boils at 100 degrees Celsius and freezes at zero.';
      expect(textStructuringService.classifyCategory(text)).toBe('Note');
    });
  });

  describe('extractActionItems', () => {
    it('extracts actionable bullet items from conversational speech', () => {
      const text =
        'I really need to finish the quarterly budget report. Also remember to send the slide deck to Michael. Tomorrow is Tuesday.';
      const items = textStructuringService.extractActionItems(text);

      expect(items).toContain('Finish the quarterly budget report');
      expect(items).toContain('Send the slide deck to Michael');
      expect(items).not.toContain('Tomorrow is Tuesday');
    });

    it('detects imperative starting verbs as action items', () => {
      const text = 'Call Dr. Evans. Buy fresh groceries for dinner.';
      const items = textStructuringService.extractActionItems(text);

      expect(items).toContain('Call Dr. Evans');
      expect(items).toContain('Buy fresh groceries for dinner');
    });

    it('ignores non-actionable sentences and returns empty array when no actions exist', () => {
      const text = 'The weather was sunny and the walk was refreshing.';
      const items = textStructuringService.extractActionItems(text);
      expect(items).toEqual([]);
    });
  });

  describe('generateTitle & generateSummary', () => {
    it('generates a concise 3-6 word title', () => {
      const text = 'Finished the architectural redesign for the client application.';
      const title = textStructuringService.generateTitle(text, 'Task');

      expect(title.split(/\s+/).length).toBeLessThanOrEqual(6);
      expect(title.length).toBeGreaterThan(0);
    });

    it('generates a clean 1-2 sentence executive summary', () => {
      const text =
        'First sentence here. Second sentence explains the outcome. Third sentence is extra detail.';
      const summary = textStructuringService.generateSummary(text);

      expect(summary).toBe('First sentence here. Second sentence explains the outcome.');
    });
  });

  describe('structureRawTranscript (Full Local Pipeline)', () => {
    it('structures a raw spontaneous voice transcript into a complete domain payload', () => {
      const raw =
        'Um, so today I really need to call Sarah about the contract. Uh, remember to send her the updated invoice.';
      const result = textStructuringService.structureRawTranscript(raw);

      expect(result.cleanedEntry).not.toContain('Um');
      expect(result.cleanedEntry).not.toContain('Uh');
      expect(result.category).toBe('Task');
      expect(result.actionItems.length).toBeGreaterThanOrEqual(1);
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.summary.length).toBeGreaterThan(0);
    });
  });
});
