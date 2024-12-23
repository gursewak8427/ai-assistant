import { ai } from "./services/ai"
import { parseResponse } from "./utils"
import { doActions } from "./utils/actions"

export const handlePrompt = async (prompt) => {

    let response = ai(prompt)

    let parsedResponse = parseResponse(response)

    await doActions(parseResponse)
}