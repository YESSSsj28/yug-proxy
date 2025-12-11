import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const HOMEWORK_SYSTEM_INSTRUCTION = `You are "Explain It My Way", an expert personalized AI tutor designed to help students understand complex homework concepts. 

Your goal is to adapt your explanation style strictly based on the user's request. 
Always maintain a supportive, encouraging, and educational tone.
Use Markdown for formatting (bolding key terms, using lists, code blocks).

When asked to provide a quiz, provide 3 multiple choice questions relevant to the previous topic.`;

/**
 * Creates a new chat session for Homework Help.
 */
export const createHomeworkSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: HOMEWORK_SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topK: 40,
    },
  });
};

/**
 * Analyzes writing samples to generate a style profile.
 */
export const analyzeWritingStyle = async (samples: string): Promise<string | undefined> => {
  const prompt = `
    Analyze the following writing samples to create a detailed 'Writing Persona'. 
    
    I want you to learn exactly how this person writes so you can mimic them later.
    Pay close attention to:
    1. **Grammar & Mechanics**: specific errors they make (e.g., missing commas, run-on sentences, lowercase 'i', lack of apostrophes).
    2. **Vocabulary**: Do they use simple words, slang, academic jargon, or repeated words?
    3. **Sentence Structure**: Are sentences short and choppy? Long and winding?
    4. **Tone**: Casual, bored, excited, formal?

    SAMPLES:
    "${samples}"

    OUTPUT FORMAT:
    Return a concise but strict system instruction paragraph that describes this persona. 
    Start with "You are a writing proxy for a student. Your writing style is..."
    Explicitly list the errors that must be replicated (e.g., "Do not use commas correctly," "Never use big words").
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

/**
 * Creates a chat session with a custom system instruction (for Essay Mimic).
 */
export const createCustomSession = (styleProfile: string): Chat => {
  const instruction = `${styleProfile}
  
  IMPORTANT RULES:
  1. You MUST write exactly like the persona described above.
  2. Replicate all specific grammatical errors, punctuation mistakes, and vocabulary habits found in the profile.
  3. Do NOT correct the text or "fix" the grammar unless the user explicitly asks you to "fix grammar" or "polish this".
  4. If the user asks you to write an essay, paragraph, or answer a question, do it IN THIS STYLE.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: instruction,
      temperature: 0.8, // Slightly higher creativity to mimic quirks
    },
  });
};

/**
 * Sends a message to the model and returns a stream of content.
 */
export const sendMessageStream = async (
  chat: Chat, 
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};