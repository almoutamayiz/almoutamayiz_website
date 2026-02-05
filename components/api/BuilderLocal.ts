
import { generateContentWithTimeout } from "../../lib/gemini";

export const buildEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    // المحاولة 1: استخدام نموذج Pro للأداء العالي (مع مهلة 60 ثانية)
    try {
        return await generateContentWithTimeout({
            model: 'gemini-3-pro-preview', 
            contents: [{ parts: [{ text: fullPrompt }] }],
            timeout: 60000 
        });
    } catch (error) {
        console.warn("Essay Builder (Pro) Failed, retrying with Flash...", error);
        
        // المحاولة 2: استخدام نموذج Flash الأسرع والأكثر استقراراً (مفتاح API جديد تلقائياً)
        try {
            return await generateContentWithTimeout({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 45000
            });
        } catch (retryError) {
             console.warn("Essay Builder (Flash) Failed, retrying one last time...", retryError);
             
             // المحاولة 3: محاولة أخيرة مع Flash (مفتاح API ثالث)
             return await generateContentWithTimeout({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: fullPrompt }] }],
                timeout: 45000
            });
        }
    }
};
