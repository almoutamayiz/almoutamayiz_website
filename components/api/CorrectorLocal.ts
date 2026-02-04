
import { initGemini } from "../../lib/gemini";

export const correctEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const ai = initGemini();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // استخدام نفس النموذج الذي يعمل في المعرب لضمان الاستجابة
            contents: [{ parts: [{ text: fullPrompt }] }]
        });
        
        return response.text;
    } catch (error) {
        console.warn("Essay Corrector API Failed:", error);
        throw error;
    }
};
