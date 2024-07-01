const OpenAI = require("openai");

module.exports = {
    summarize: async function(transcript, model_name, api_key, audio_type) {       
        
        const openai = new OpenAI({
            apiKey: api_key
        })
        const chatCompletion = await openai.chat.completions.create({
            model: model_name,
            messages: [
                {"role": "system", "content": determinePrompt(audio_type)},
                {"role": "user", "content": transcript}
            ]
        })        
        
        return chatCompletion.choices[0].message.content;
    }
}

function determinePrompt(audio_type) {
    switch(audio_type) {
        case "summarize":
            return "You will analyze a huge transcript from a video and create a summary in the form of a list useful to the audience. Include important information in the summary.";
        case "lecture":
            return "You will analyze a huge transcript of a lecture and create a summary of all mentioned important dates, such as assignment, quiz, test, and final dates, in the form of a list. If there are none, say that no important dates were found.";
        case "meeting":
            return "You will analyze a huge transcript from a meeting and create a summary of it. Mention all proceedings, matters and date mentioned as well as all decisions or future plans mentioned, in the form of a list.";   
    }
}