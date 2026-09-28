import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerGetClaimTool } from "./tools/getClaim.js";
import { registerGetPolicyTool } from "./tools/getPolicy.js";
import { registerGetCustomerTool } from "./tools/getCustomer.js";
import { registerGetClaimDocumentsTool } from "./tools/getClaimDocuments.js";
import { registerAssessClaimCoverageTool } from "./tools/assessClaimCoverage.js";
import { registerInitiateClaimReviewTool } from "./tools/initiateClaimReview.js";

const server = new McpServer({
  name: "insurance-claims-mcp",
  version: "1.0.0",
});

registerGetClaimTool(server);
registerGetPolicyTool(server);
registerGetCustomerTool(server);
registerGetClaimDocumentsTool(server);
registerAssessClaimCoverageTool(server);
registerInitiateClaimReviewTool(server);

const transport = new StdioServerTransport();

await server.connect(transport);

console.error("Insurance Claims MCP Server running");