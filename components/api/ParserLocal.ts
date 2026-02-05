
import { generateContentWithTimeout } from "../../lib/gemini";

export const parseTextLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        // Temperature 0 means: Be extremely precise, logical, and do not be creative.
        // This ensures the grammar parsing is accurate and follows the exact format every time.
        const text = await generateContentWithTimeout({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: { temperature: 0, topK: 1, topP: 1 }, 
            timeout: 10000 
        });
        return text;
    } catch (error) {
        console.warn("Parser API Failed:", error);
        throw error;
    }
};
