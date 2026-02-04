
import { generateContentWithTimeout } from "../../lib/gemini";

export const buildEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const text = await generateContentWithTimeout({
            model: 'gemini-3-pro-preview', // Pro model needs more time
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 45000 // 45 seconds for heavy essays
        });
        return text;
    } catch (error) {
        console.warn("Essay Builder API Failed:", error);
        throw error;
    }
};
