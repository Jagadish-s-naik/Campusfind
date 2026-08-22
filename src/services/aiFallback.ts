import type { StructuredAttributes } from '../types';

/**
 * Fallback structural attribute extractor when offline or without API key
 */
export function generateFallbackAttributes(
  description: string,
  type: 'lost' | 'found'
): StructuredAttributes {
  const descLower = description.toLowerCase();
  
  let category = 'Other';
  if (descLower.includes('backpack') || descLower.includes('bag')) category = 'Backpacks & Bags';
  else if (descLower.includes('laptop') || descLower.includes('macbook') || descLower.includes('dell') || descLower.includes('ipad')) category = 'Electronics & Laptops';
  else if (descLower.includes('airpods') || descLower.includes('headphone') || descLower.includes('earbuds') || descLower.includes('sony')) category = 'Audio & Headphones';
  else if (descLower.includes('bottle') || descLower.includes('flask') || descLower.includes('hydro')) category = 'Water Bottles & Flasks';
  else if (descLower.includes('id') || descLower.includes('card') || descLower.includes('wallet')) category = 'ID Cards & Wallets';
  else if (descLower.includes('key') || descLower.includes('keychain')) category = 'Keys & Keychains';

  const colors: string[] = [];
  const colorList = ['black', 'blue', 'red', 'green', 'silver', 'white', 'grey', 'gray', 'pink', 'yellow', 'purple', 'brown'];
  colorList.forEach((c) => {
    if (descLower.includes(c)) colors.push(c);
  });
  if (colors.length === 0) colors.push('unspecified');

  let brand = 'Unknown Brand';
  const brandList = ['apple', 'jansport', 'nike', 'adidas', 'sony', 'hydro flask', 'samsung', 'dell', 'lenovo', 'hp', 'casio', 'north face'];
  for (const b of brandList) {
    if (descLower.includes(b)) {
      brand = b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  const features: string[] = [];
  if (descLower.includes('sticker')) features.push('Has stickers');
  if (descLower.includes('scratched') || descLower.includes('scratch')) features.push('Scratched/Worn');
  if (descLower.includes('keychain')) features.push('Attached keychain');
  if (descLower.includes('case')) features.push('In protective case');

  return {
    category,
    color: colors,
    brand,
    distinguishing_features: features.length > 0 ? features : ['Standard campus item condition'],
    summary: `${type.toUpperCase()} item: ${category} (${brand}) with ${colors.join(', ')} color scheme. Details: ${description}`,
  };
}

/**
 * Generate a pseudo 64-dimensional embedding vector deterministically from text string
 * used as a reliable fallback when Gemini embedding API key is absent.
 */
export function generateFallbackEmbedding(text: string): number[] {
  const vector: number[] = new Array(64).fill(0);
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode + j * 7 + i * 13) % 64;
      vector[index] += (charCode % 10) / 10;
    }
  }

  // Normalize vector
  const norm = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
  if (norm === 0) return vector;
  return vector.map((val) => val / norm);
}
