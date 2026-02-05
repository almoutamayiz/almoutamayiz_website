
import { generateContentWithTimeout } from "../../lib/gemini";

export const correctEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    // المحاولة 1: Gemini 3 Flash للتوازن بين السرعة والتحليل
    try {
        return await generateContentWithTimeout({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 30000
        });
    } catch (error) {
        console.warn("Essay Corrector (3-Flash) Failed, retrying with 2.5-Flash...", error);
        
        // المحاولة 2: Gemini 2.5 Flash
        try {
            return await generateContentWithTimeout({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 25000
            });
        } catch (retryError) {
            return await generateContentWithTimeout({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 25000
            });
        }
    }
};
