import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt =
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

        const result = await model.generateContent(prompt);

        const suggestions = result.response.text();

        return Response.json(
            {
                success: true,
                message: suggestions,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error getting suggestions from gemini:", error.message || error);
        return Response.json(
            {
                success: false,
                message: "Error getting suggestions from gemini",
            },
            {
                status: 500,
            }
        );
    }
}