
import { generateContentWithTimeout } from "../../lib/gemini";

export const buildEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    // المحاولة 1: استخدام Gemini 3 Flash (سريع وذكي) بدلاً من Pro (بطيء)
    try {
        return await generateContentWithTimeout({
            model: 'gemini-3-flash-preview', 
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 30000 
        });
    } catch (error) {
        console.warn("Essay Builder (3-Flash) Failed, retrying with 2.5-Flash...", error);
        
        // المحاولة 2: استخدام نموذج 2.5 Flash الأسرع كبديل
        try {
            return await generateContentWithTimeout({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 25000
            });
        } catch (retryError) {
             // المحاولة 3: محاولة أخيرة
             return await generateContentWithTimeout({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 25000
            });
        }
    }
};
