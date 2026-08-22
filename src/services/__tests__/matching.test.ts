import { describe, it, expect } from 'vitest';
import { cosineSimilarity, jaccardWordSimilarity } from '../../utils/similarity';
import { generateFallbackAttributes, generateFallbackEmbedding } from '../aiFallback';
import { sanitizeInput, validateImageFileSecurely, sanitizeBase64Image } from '../../utils/security';

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

describe('Security, XSS Sanitization & Magic Byte Inspection', () => {
  it('should escape malicious HTML, backticks, equal signs, and script injection strings', () => {
    const unsafeText = '<script>alert("xss")</script> & `test` = 1';
    const cleanText = sanitizeInput(unsafeText);
    expect(cleanText).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt; &amp; &#x60;test&#x60; &#x3D; 1');
  });

  it('should validate PNG binary magic bytes header correctly', async () => {
    // PNG Magic bytes: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const validPngFile = new File([pngHeader], 'photo.png', { type: 'image/png' });

    const result = await validateImageFileSecurely(validPngFile);
    expect(result.valid).toBe(true);
  });

  it('should block executable files masquerading as images with invalid magic bytes', async () => {
    // Executable EXE header: 0x4D, 0x5A ("MZ")
    const exeHeader = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const fakeImageFile = new File([exeHeader], 'virus.png', { type: 'image/png' });

    const result = await validateImageFileSecurely(fakeImageFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('magic signature');
  });

  it('should sanitize base64 data URIs correctly', () => {
    const validDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    expect(sanitizeBase64Image(validDataUri)).toBe(validDataUri);
  });
});
