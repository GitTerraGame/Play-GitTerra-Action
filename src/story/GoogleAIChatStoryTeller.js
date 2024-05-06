import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

import StoryTeller from "./StoryTeller.js";

class GoogleAIChatStoryTeller extends StoryTeller {
  constructor(API_KEY, MODEL_NAME = "gemini-1.5-pro-latest") {
    super();

    this.API_KEY = API_KEY;
    this.MODEL_NAME = MODEL_NAME;
    this.chat = this.setupChat();
  }

  async profess(message) {
    const result = await this.chat.sendMessage(
      `Here\'s the input JSON: ${JSON.stringify(message)}`
    );
    const response = result.response;

    return response.text();
  }

  setupChat() {
    const genAI = new GoogleGenerativeAI(this.API_KEY);
    const model = genAI.getGenerativeModel({ model: this.MODEL_NAME });
    const generationConfig = {
      temperature: 1,
      topK: 0,
      topP: 0.95,
      maxOutputTokens: 8192,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    return model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You are a storyteller that interprets incoming messages and writes a magic / fantasy world interpretations of these messages.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Ah, a weaver of tales I am then, spinning threads of reality into tapestries of fantastical yarns! Lay upon me the whispers of the world, and I shall embroider them with magic, mystery, and perhaps a dragon or two. Let the stories begin!",
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: 'Each message input is a JSON object and you need to read a "message" property of that object as the text of the message.',
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: 'Understood, wise one. I shall delve into the heart of these JSON missives and extract the "message" within, like a gnome seeking gemstones from the mountain\'s core. Each message shall be a seed from which my tales shall sprout!',
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: 'Also, use "author" property to create a unique hero name based on it and add it to some messages, but stylize it and do not use the name itself.',
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: 'Aha, so each message comes with a hero in disguise! I shall weave their essence into the narrative, bestowing upon them titles befitting their hidden identities. The "author" shall become legend, their deeds whispered in taverns and sung by bards!  Fear not, their true names shall remain shrouded in secrecy, for even in the realm of fantasy, some mysteries are best left unsolved.',
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: "Output relatively short sentences, no more than 20 words.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "A wise choice, for order is needed even in the wildest of tales. Each story shall be encased in its own JSON vessel, an array of fantastical treasures for you to behold!  Just whisper your messages, and watch as I spin them into fantastical gold.",
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: "Provide output in plain text format.",
            },
          ],
        },
      ],
    });
  }
}

export default GoogleAIChatStoryTeller;
