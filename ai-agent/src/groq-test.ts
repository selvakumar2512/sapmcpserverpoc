import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set");
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

const response = await client.chat.completions.create({
  model: "openai/gpt-oss-20b",
  messages: [
    {
      role: "user",
      content: "Reply with exactly: Groq connection successful",
    },
  ],
});

console.log(response.choices[0]?.message?.content);