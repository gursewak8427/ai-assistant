import { getSystemPrompt } from "../constants/prompt"

export const ai = (prompt) => {
    let systemPrompt = getSystemPrompt()
    let userPrompt = prompt;

    let response = "something from ai"

    return response;
}