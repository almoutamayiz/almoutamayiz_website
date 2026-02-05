
import { initGemini } from "../../lib/gemini";

export const correctEssayLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const ai = initGemini();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Pro model for correction
            contents: [{ parts: [{ text: fullPrompt }] }]
        });
        
        return response.text;
    } catch (error) {
        console.warn("Essay Corrector API Failed:", error);
        throw error;
    }
};
