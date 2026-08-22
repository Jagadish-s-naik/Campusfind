import { GoogleGenAI } from '@google/genai';
import type { StructuredAttributes } from '../types';
import { generateFallbackAttributes, generateFallbackEmbedding } from './aiFallback';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize Google Gen AI client if key exists
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

/**
 * Step 1: Extract structured attributes from photo (base64) + text description
 */
export async function extractStructuredAttributes(
  photoBase64: string,
  description: string,
  type: 'lost' | 'found'
): Promise<StructuredAttributes> {
  if (!ai || !GEMINI_API_KEY) {
    console.warn('Gemini API key missing or invalid, using intelligent fallback attribute extractor.');
    return generateFallbackAttributes(description, type);
  }

  try {
    const prompt = `Analyze this ${type} item report for a Smart Campus Lost & Found platform.
Description provided by reporter: "${description}"

Return a strict JSON object with EXACTLY the following structure:
{
  "category": "One of [Backpacks & Bags, Electronics & Laptops, Audio & Headphones, Water Bottles & Flasks, ID Cards & Wallets, Keys & Keychains, Books & Notebooks, Apparel & Accessories, Eyewear, Other]",
  "color": ["list of main colors, e.g. black, red, silver"],
  "brand": "brand name if visible or mentioned, or 'Unknown'",
  "distinguishing_features": ["list of notable details like stickers, scratches, keychains, damage, initial labels"],
  "summary": "a concise 2-sentence summary of the item emphasizing unique features for matching"
}`;

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = photoBase64.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');

    const contents = cleanBase64
      ? [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          prompt,
        ]
      : [prompt];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsed = JSON.parse(responseText) as StructuredAttributes;
    
    return {
      category: parsed.category || 'Other',
      color: Array.isArray(parsed.color) ? parsed.color : ['unspecified'],
      brand: parsed.brand || 'Unknown',
      distinguishing_features: Array.isArray(parsed.distinguishing_features) ? parsed.distinguishing_features : [],
      summary: parsed.summary || description,
    };
  } catch (error) {
    console.error('Error calling Gemini Multimodal API:', error);
    return generateFallbackAttributes(description, type);
  }
}

/**
 * Step 2: Generate vector embedding for candidate pre-filtering
 */
export async function generateItemEmbedding(textToEmbed: string): Promise<number[]> {
  if (!ai || !GEMINI_API_KEY) {
    return generateFallbackEmbedding(textToEmbed);
  }

  try {
    const response: any = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: textToEmbed,
    });

    if (response.embedding && response.embedding.values) {
      return response.embedding.values;
    }
    if (response.embeddings && response.embeddings[0]?.values) {
      return response.embeddings[0].values;
    }
    return generateFallbackEmbedding(textToEmbed);
  } catch (error) {
    console.error('Error generating Gemini embedding:', error);
    return generateFallbackEmbedding(textToEmbed);
  }
}

/**
 * Step 4: Pairwise Gemini evaluation of candidate Lost & Found reports
 */
export async function evaluateMatchWithGemini(
  lostReport: {
    description: string;
    location: string;
    dateTime: string;
    attributes: StructuredAttributes;
  },
  foundReport: {
    description: string;
    location: string;
    dateTime: string;
    attributes: StructuredAttributes;
  }
): Promise<{
  confidenceScore: number;
  explanation: string;
  matchedAttributes: string[];
  spatialProximity?: 'Same Location' | 'Adjacent Area' | 'Campus Wide';
  temporalProximityHours?: number;
  priorityLevel?: 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'ROUTINE';
}> {
  if (!ai || !GEMINI_API_KEY) {
    return generateFallbackMatchEvaluation(lostReport, foundReport);
  }

  try {
    const prompt = `You are an AI matching engine for a Smart Campus Lost & Found system. Compare these two reports and decide how likely they are to refer to the exact same physical item.

LOST REPORT:
- Location: ${lostReport.location}
- Date/Time: ${lostReport.dateTime}
- Description: ${lostReport.description}
- Extracted Attributes: Category: ${lostReport.attributes.category}, Brand: ${lostReport.attributes.brand}, Colors: ${lostReport.attributes.color.join(', ')}, Features: ${lostReport.attributes.distinguishing_features.join(', ')}

FOUND REPORT:
- Location: ${foundReport.location}
- Date/Time: ${foundReport.dateTime}
- Description: ${foundReport.description}
- Extracted Attributes: Category: ${foundReport.attributes.category}, Brand: ${foundReport.attributes.brand}, Colors: ${foundReport.attributes.color.join(', ')}, Features: ${foundReport.attributes.distinguishing_features.join(', ')}

Analyze similarities and differences in item type, brand, color, distinguishing marks, location proximity, and timing.

Return a strict JSON object with EXACTLY:
{
  "confidence_score": <number between 0 and 100 representing probability of match>,
  "matched_attributes": [<array of specific matching traits, e.g. "Black color", "Jansport brand", "Red keychain", "Reported near Library">],
  "spatial_proximity": "One of [Same Location, Adjacent Area, Campus Wide]",
  "temporal_proximity_hours": <estimated difference in hours between loss and recovery>,
  "priority_level": "One of [HIGH_PRIORITY, MEDIUM_PRIORITY, ROUTINE] based on value and match certainty",
  "explanation": "<a clear, human-readable 2-sentence explanation of why these match, citing specific attributes and time/location signals.>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidence_score) || 50)),
      explanation: parsed.explanation || 'Matches identified based on item category and reported location.',
      matchedAttributes: Array.isArray(parsed.matched_attributes) ? parsed.matched_attributes : ['Category match'],
      spatialProximity: parsed.spatial_proximity || (lostReport.location === foundReport.location ? 'Same Location' : 'Adjacent Area'),
      temporalProximityHours: Number(parsed.temporal_proximity_hours) || 2,
      priorityLevel: parsed.priority_level || (Number(parsed.confidence_score) >= 75 ? 'HIGH_PRIORITY' : 'MEDIUM_PRIORITY'),
    };
  } catch (error) {
    console.error('Error during Gemini pairwise match evaluation:', error);
    return generateFallbackMatchEvaluation(lostReport, foundReport);
  }
}

/**
 * Fallback match evaluator grounded strictly in report data when Gemini API key is unavailable
 */
function generateFallbackMatchEvaluation(
  lost: { description: string; location: string; dateTime: string; attributes: StructuredAttributes },
  found: { description: string; location: string; dateTime: string; attributes: StructuredAttributes }
) {
  const matchedAttrs: string[] = [];
  let score = 30;

  // Category match
  if (lost.attributes.category === found.attributes.category) {
    score += 25;
    matchedAttrs.push(`Same category (${lost.attributes.category})`);
  }

  // Location match
  if (lost.location === found.location) {
    score += 20;
    matchedAttrs.push(`Same location (${lost.location})`);
  }

  // Brand match
  if (
    lost.attributes.brand !== 'Unknown' &&
    found.attributes.brand !== 'Unknown' &&
    lost.attributes.brand.toLowerCase() === found.attributes.brand.toLowerCase()
  ) {
    score += 15;
    matchedAttrs.push(`Brand match (${lost.attributes.brand})`);
  }

  // Color overlap
  const sharedColors = lost.attributes.color.filter((c) =>
    found.attributes.color.map((fc) => fc.toLowerCase()).includes(c.toLowerCase())
  );
  if (sharedColors.length > 0 && sharedColors[0] !== 'unspecified') {
    score += 10;
    matchedAttrs.push(`Color match (${sharedColors.join(', ')})`);
  }

  score = Math.min(95, score);

  const explanation = `Both reports identify a ${sharedColors.join('/') || 'similar'} ${
    lost.attributes.category
  } ${lost.location === found.location ? `reported at ${lost.location}` : 'in nearby campus areas'}. ${
    matchedAttrs.length > 0 ? `Shared traits: ${matchedAttrs.join(', ')}.` : ''
  }`;

  return {
    confidenceScore: score,
    explanation,
    matchedAttributes: matchedAttrs.length > 0 ? matchedAttrs : ['Category overlap'],
  };
}
