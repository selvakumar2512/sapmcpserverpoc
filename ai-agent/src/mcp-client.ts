import "dotenv/config";

import OpenAI from "openai";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_SERVER =
  "/Users/selvakumar/sap-mcp-projects/insurance-mcp-poc/mcp-server/src/server.ts";

const MCP_SERVER_COMMAND =
  "/Users/selvakumar/sap-mcp-projects/insurance-mcp-poc/mcp-server/node_modules/.bin/tsx";

/*
 * ------------------------------------------------------------
 * 1. Groq LLM
 * ------------------------------------------------------------
 */

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error("GROQ_API_KEY is not set");
}

const llm = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

/*
 * ------------------------------------------------------------
 * 2. MCP Client
 * ------------------------------------------------------------
 */

const mcpClient = new Client({
  name: "insurance-claims-ai-agent",
  version: "1.0.0",
});

/*
// This is to connect custom MCP Server
const transport = new StdioClientTransport({
  command: MCP_SERVER_COMMAND,
  args: [MCP_SERVER],
});

await mcpClient.connect(transport);

console.log("Connected to Insurance Claims MCP Server");
*/

// This is to connect CAP MCP Server
const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:4004/mcp/insurance"),
);

await mcpClient.connect(transport);

console.log("Connected to Insurance Claims CAP MCP Server");

/*
 * ------------------------------------------------------------
 * 3. Discover MCP tools
 * ------------------------------------------------------------
 */

const mcpToolsResult = await mcpClient.listTools();

console.log();
console.log("Discovered MCP tools:");

for (const tool of mcpToolsResult.tools) {
  console.log(`- ${tool.name}`);
}

/*
 * ------------------------------------------------------------
 * 4. Convert MCP tools to Groq tools
 * ------------------------------------------------------------
 */

const llmTools = mcpToolsResult.tools.map((tool) => ({
  type: "function" as const,
  function: {
    name: tool.name,
    description: tool.description ?? "",
    parameters: tool.inputSchema,
  },
}));

/*
 * ------------------------------------------------------------
 * 5. Conversation
 * ------------------------------------------------------------
 */

const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are an insurance claims assistant. " +
      "Use the available MCP tools to retrieve accurate information. " +
      "Do not invent claim, policy, customer, document, financial, date, currency, or status information. " +
      "Only state facts supported by tool results. " +
      "Do not infer facts that are not explicitly present in the tool results. " +
      "Do not invent or assume business workflow rules, valid status transitions, eligibility conditions, or action prerequisites. " +
      "Use only rules explicitly provided by tool results or system instructions. " +
      "If a currency is not provided, do not assign one. " +
      "Never add a currency symbol or currency name unless the tool result explicitly provides the currency. " +
      "If information is unavailable, clearly say that it is unavailable. " +
      "When a tool returns missing documents, report them as missing documents without assuming why they are needed or what decision depends on them. " +
      "Do not infer workflow consequences, approval requirements, submission requirements, or decision outcomes from fields such as mandatory, status, or missingDocuments unless the tool result explicitly states those consequences. " +
      "Explain results clearly and concisely to the user.",
  },
  {
    role: "user",
    content: "Initiate a review for claim CLM100045.",
  },
];

/*
 * ------------------------------------------------------------
 * 6. First LLM call
 * ------------------------------------------------------------
 */

console.log();
console.log("User:");
console.log(messages[1].content);

while (true) {
  const response = await llm.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    tools: llmTools,
    tool_choice: "auto",
  });

  const assistantMessage = response.choices[0]?.message;

  if (!assistantMessage) {
    throw new Error("LLM returned no message");
  }

  messages.push(assistantMessage);

  if (
    !assistantMessage.tool_calls ||
    assistantMessage.tool_calls.length === 0
  ) {
    console.log();
    console.log("========================================");
    console.log("AI AGENT FINAL RESPONSE");
    console.log("========================================");
    console.log();
    console.log(assistantMessage.content);

    break;
  }

  for (const toolCall of assistantMessage.tool_calls) {
    if (toolCall.type !== "function") {
      continue;
    }

    const toolName = toolCall.function.name;

    const toolArguments = JSON.parse(toolCall.function.arguments);

    console.log();
    console.log(`LLM selected MCP tool: ${toolName}`);
    console.log("Arguments:", toolArguments);

    const toolResult = await mcpClient.callTool({
      name: toolName,
      arguments: toolArguments,
    });

    console.log();
    console.log("MCP tool result:");
    console.log(JSON.stringify(toolResult, null, 2));

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(toolResult),
    });
  }
}
