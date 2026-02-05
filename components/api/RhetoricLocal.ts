
import { generateContentWithTimeout } from "../../lib/gemini";

export const analyzeRhetoricLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        // Low temperature for analytical tasks to ensure consistency
        const text = await generateContentWithTimeout({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: { temperature: 0.2 },
            timeout: 10000
        });
        return text;
    } catch (error) {
        console.warn("Rhetoric API Failed:", error);
        throw error;
    }
};
