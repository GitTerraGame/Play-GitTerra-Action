import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export default async function profess(
  message,
  API_KEY,
  MODEL_NAME = "gemini-1.5-pro-latest"
) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

  const parts = [
    {
      text: `
        Generate only one short sentence of fantasy story for each message.
        Base your sentence on the contents of "message" property of each input.
        Create a unique hero name based on "author" property where needed using first letter of first name and first letter of last name only.
        `,
    },
    {
      text: `Git log message: {
        commit: "62810ef8fe9e422c886d510e33ed4a69342566d3",
        author:
          "Alexander Chernyshev <33011221+AlexanderChernyshev@users.noreply.github.com>",
        date: "Wed Apr 17 20:03:54 2024 -0400",
        message: "updated tiles with proper SVG ids",
      }`,
    },
    {
      text: "Output: The art of the lore by Agawayn requires a proper signature of the artist.",
    },
    {
      text: `Git log message: {
        commit: "1da634868801dff74e6d33be47da943106a0e813",
        author: "Sergey Chernyshev <sergey.chernyshev@gmail.com>",
        date: "Fri Apr 19 00:17:00 2024 -0400",
        message: "Removed unnecessary props from config.",
      },`,
    },
    {
      text: "Output: The useless thoughts were purged from the thought of the hero.",
    },
    {
      text: `Git log message: {
        commit: "b971351be3e7f4b81ef506ebb075d3fbf48a9939",
        author:
          "Alexander Chernyshev <33011221+AlexanderChernyshev@users.noreply.github.com>",
        date: "Sun Apr 14 18:27:49 2024 -0400",
        message: "first pass for using svg tiles",
      },`,
    },
    {
      text: "Output: First attempt was made and sir Agawayn made it clear, nothing can stop us!",
    },
    {
      text: `Git log message: {
        commit: "e1e3f898b0b5e94e881ca723bbf09a7376d66a88",
        author: "Sergey Chernyshev <sergey.chernyshev@gmail.com>",
        date: "Tue Apr 16 01:30:35 2024 -0400",
        message: "Added colorization, including GitHub's language database",
      },`,
    },
    {
      text: "Output: Color sparkled in Sireborn's eye as he saw the riches of the tomb of the Datadum.",
    },
    {
      text: "Git log message: " + message,
    },
    { text: "Output: " },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  return response.text();
}
