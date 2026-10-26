import { describe, it, expect } from 'vitest';
import { expandQuery, extractGradeBands, hasGradeIntent, scoreMentorForQuery, normalizeGrade } from '../utils/smartSearch';

describe('smartSearch utilities', () => {
  describe('expandQuery', () => {
    it('expands music synonyms', () => {
      const expanded = expandQuery('guitar');
      expect(expanded).toContain('music');
    });

    it('expands handwork synonyms', () => {
      const expanded = expandQuery('knitting');
      expect(expanded).toContain('handwork');
    });

    it('expands therapeutic synonyms', () => {
      const expanded = expandQuery('therapy');
      expect(expanded).toContain('therapeutic');
    });

    it('expands German music synonyms', () => {
      const expanded = expandQuery('gitarre');
      expect(expanded).toContain('music');
    });

    it('expands German handwork synonyms', () => {
      const expanded = expandQuery('handarbeit');
      expect(expanded).toContain('handwork');
    });

    it('returns original query when no synonyms match', () => {
      const expanded = expandQuery('xyz123');
      expect(expanded).toContain('xyz123');
    });
  });

  describe('normalizeGrade', () => {
    it('normalizes "5th grade" to "grade 5"', () => {
      expect(normalizeGrade('5th grade')).toBe('grade 5');
    });

    it('normalizes "grade 5" to "grade 5"', () => {
      expect(normalizeGrade('grade 5')).toBe('grade 5');
    });

    it('normalizes "year 5" to "grade 5"', () => {
      expect(normalizeGrade('year 5')).toBe('grade 5');
    });

    it('normalizes "class 5" to "grade 5"', () => {
      expect(normalizeGrade('class 5')).toBe('grade 5');
    });

    it('normalizes "level 5" to "grade 5"', () => {
      expect(normalizeGrade('level 5')).toBe('grade 5');
    });

    it('normalizes German "5. klasse" to "grade 5"', () => {
      expect(normalizeGrade('5. klasse')).toBe('grade 5');
    });

    it('normalizes German "klasse 5" to "grade 5"', () => {
      expect(normalizeGrade('klasse 5')).toBe('grade 5');
    });
  });

  describe('extractGradeBands', () => {
    it('extracts grade band for "grade 5"', () => {
      const bands = extractGradeBands('grade 5');
      expect(bands).toContain('Feeling / Heart (Ages 7-14)');
    });

    it('extracts grade band for "year 1"', () => {
      const bands = extractGradeBands('year 1');
      expect(bands).toContain('Willing / Hands (Ages 0-7)');
    });

    it('extracts grade band for "12th grade"', () => {
      const bands = extractGradeBands('12th grade');
      expect(bands).toContain('Thinking / Head (Ages 14-21)');
    });

    it('extracts grade band for "fifth grade"', () => {
      const bands = extractGradeBands('fifth grade');
      expect(bands).toContain('Feeling / Heart (Ages 7-14)');
    });

    it('extracts grade band for German "fünfte klasse"', () => {
      const bands = extractGradeBands('fünfte klasse');
      expect(bands).toContain('Feeling / Heart (Ages 7-14)');
    });

    it('extracts grade band for "kindergarten"', () => {
      const bands = extractGradeBands('kindergarten');
      expect(bands).toContain('Willing / Hands (Ages 0-7)');
    });

    it('extracts grade band for "high school"', () => {
      const bands = extractGradeBands('high school');
      expect(bands).toContain('Thinking / Head (Ages 14-21)');
    });

    it('returns empty array for no grade intent', () => {
      const bands = extractGradeBands('music teacher');
      expect(bands).toEqual([]);
    });
  });

  describe('hasGradeIntent', () => {
    it('returns true for grade queries', () => {
      expect(hasGradeIntent('grade 5')).toBe(true);
      expect(hasGradeIntent('year 3')).toBe(true);
      expect(hasGradeIntent('kindergarten')).toBe(true);
    });

    it('returns false for non-grade queries', () => {
      expect(hasGradeIntent('music teacher')).toBe(false);
      expect(hasGradeIntent('handwork')).toBe(false);
    });
  });

  describe('scoreMentorForQuery', () => {
    const mockMentor = {
      name: 'Anna Müller',
      bio: 'Music teacher specializing in piano and flute',
      location: 'Berlin, Germany',
      gradeLevel: 'Feeling / Heart (Ages 7-14)',
      specialties: ['Music', 'Piano'],
      topicTags: ['music', 'piano'],
    };

    it('returns high score for exact name match', () => {
      const score = scoreMentorForQuery(mockMentor, 'Anna Müller');
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('returns score for specialty match', () => {
      const score = scoreMentorForQuery(mockMentor, 'piano');
      expect(score).toBeGreaterThan(0);
    });

    it('returns score for grade match', () => {
      const score = scoreMentorForQuery(mockMentor, 'grade 5');
      expect(score).toBeGreaterThan(0);
    });

    it('returns 0 for no match', () => {
      const score = scoreMentorForQuery(mockMentor, 'xyz123');
      expect(score).toBe(0);
    });
  });
});