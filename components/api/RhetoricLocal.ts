
import { generateContentWithTimeout } from "../../lib/gemini";

export const analyzeRhetoricLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const text = await generateContentWithTimeout({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 20000
        });
        return text;
    } catch (error) {
        console.warn("Rhetoric API Failed:", error);
        throw error;
    }
};
