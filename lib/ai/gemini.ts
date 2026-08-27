import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generates an evocative, quiet-luxury archival memory caption for a photo based on its EXIF metadata.
 */
export async function generateMemoryCaption(metadata: {
  location?: string;
  camera?: string;
  monthName?: string;
  year?: number;
  day?: number;
}): Promise<string> {
  if (!genAI) {
    return `Captured on a quiet morning in ${metadata.location || 'the archives'}, ${metadata.monthName} ${metadata.year}.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the lead poetic archivist for MetaMemoryAlbum. Write a brief, single-sentence, evocative archival caption (under 20 words) for a photograph taken in ${metadata.location || 'a memorable journey'} during ${metadata.monthName} ${metadata.year} (Day ${metadata.day}). Tone: calm, quiet luxury, nostalgic, photographic, human. Do not use exclamation marks or hype emojis.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Gemini caption generation error:', error);
    return `Captured in ${metadata.location || 'the memory archives'}, ${metadata.monthName} ${metadata.year}.`;
  }
}

/**
 * Generates an editorial monthly memory recap for a month's album.
 */
export async function generateMonthlyRecap(monthName: string, year: number, locations: string[], photoCount: number): Promise<string> {
  if (!genAI) {
    return `${monthName} ${year} brought together ${photoCount} distinct memories across ${locations.slice(0, 2).join(', ')}.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Write a short 2-sentence poetic summary for a memory album of ${monthName} ${year}, which holds ${photoCount} photographs from ${locations.join(', ')}. Tone: editorial, reflective, cinematic.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `${monthName} ${year}: A collection of ${photoCount} timeless moments.`;
  }
}
