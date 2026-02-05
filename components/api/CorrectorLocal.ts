
import { generateContentWithTimeout } from "../../lib/gemini";

export const correctEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    // المحاولة 1: نموذج Pro
    try {
        return await generateContentWithTimeout({
            model: 'gemini-3-pro-preview',
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 50000
        });
    } catch (error) {
        console.warn("Essay Corrector (Pro) Failed, retrying with Flash...", error);
        
        // المحاولة 2: نموذج Flash (مفتاح جديد)
        try {
            return await generateContentWithTimeout({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 40000
            });
        } catch (retryError) {
            // المحاولة 3: نموذج Flash (مفتاح ثالث)
            return await generateContentWithTimeout({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 40000
            });
        }
    }
};
