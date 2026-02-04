
import { initGemini } from "../../lib/gemini";

export const parseTextLocal = async (fullPrompt: string): Promise<string | undefined> => {
    try {
        const ai = initGemini();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: fullPrompt }] }]
        });
        
        return response.text;
    } catch (error) {
        console.warn("Parser API Failed:", error);
        throw error;
    }
};
