import { describe, it, expect } from 'vitest';
import { cosineSimilarity, jaccardWordSimilarity } from '../../utils/similarity';
import { generateFallbackAttributes, generateFallbackEmbedding } from '../aiFallback';
import { sanitizeInput, validateImageFile } from '../../utils/security';

describe('Vector Cosine Similarity', () => {
  it('should return 1 for identical vectors', () => {
    const vec = [0.5, 0.5, 0.5, 0.5];
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1.0);
  });

  it('should return 0 for orthogonal vectors', () => {
    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0.0);
  });

  it('should handle empty or mismatched length vectors gracefully', () => {
    expect(cosineSimilarity([], [1, 2])).toBe(0);
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });
});

describe('Jaccard Word Similarity', () => {
  it('should accurately calculate word overlap ratio', () => {
    const str1 = 'black jansport backpack library';
    const str2 = 'black canvas jansport bag library';
    const sim = jaccardWordSimilarity(str1, str2);
    expect(sim).toBeGreaterThan(0.4);
  });
});

describe('Fallback Attribute Extraction', () => {
  it('should accurately extract category, brand, and colors from description', () => {
    const desc = 'Lost my black Apple AirPods Max in cafeteria';
    const attrs = generateFallbackAttributes(desc, 'lost');

    expect(attrs.category).toBe('Audio & Headphones');
    expect(attrs.brand).toBe('Apple');
    expect(attrs.color).toContain('black');
  });

  it('should generate a normalized deterministic vector embedding', () => {
    const text = 'Hydro Flask green bottle';
    const vector = generateFallbackEmbedding(text);
    expect(vector.length).toBe(64);
    
    // Test normalization (length == 1)
    const norm = Math.sqrt(vector.reduce((a, b) => a + b * b, 0));
    expect(norm).toBeCloseTo(1.0);
  });
});

describe('Security & XSS Input Sanitization', () => {
  it('should escape malicious HTML and script injection strings', () => {
    const unsafeText = '<script>alert("xss")</script> & "test"';
    const cleanText = sanitizeInput(unsafeText);
    expect(cleanText).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt; &amp; &quot;test&quot;');
  });

  it('should validate allowed image file types and block disallowed extensions', () => {
    const validFile = new File(['dummy'], 'photo.png', { type: 'image/png' });
    const invalidFile = new File(['dummy'], 'malicious.exe', { type: 'application/x-msdownload' });

    expect(validateImageFile(validFile).valid).toBe(true);
    expect(validateImageFile(invalidFile).valid).toBe(false);
  });
});
