
import { generateContentWithTimeout } from "../../lib/gemini";

export const correctEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const text = await generateContentWithTimeout({
            model: 'gemini-3-pro-preview',
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 40000 // 40 seconds for correction
        });
        return text;
    } catch (error) {
        console.warn("Essay Corrector API Failed:", error);
        throw error;
    }
};
