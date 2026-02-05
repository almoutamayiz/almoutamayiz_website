
import { generateContentWithTimeout } from "../../lib/gemini";

export const parseTextLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const text = await generateContentWithTimeout({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 20000 // 20 seconds timeout for grammar
        });
        return text;
    } catch (error) {
        console.warn("Parser API Failed:", error);
        throw error;
    }
};
