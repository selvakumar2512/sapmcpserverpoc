import { z } from "zod";

const CAP_BASE_URL = "http://localhost:4004/insurance";

export function registerGetClaimDocumentsTool(server: any) {
  server.registerTool(
    "get_claim_documents",
    {
      title: "Get Claim Documents",
      description:
        "Retrieve documents associated with an insurance claim using the claim ID.",
      inputSchema: {
        claimId: z
          .string()
          .min(1)
          .describe("Insurance claim ID"),
      },
    },
    async ({ claimId }: { claimId: string }) => {
      const url =
        `${CAP_BASE_URL}/ClaimDocuments` +
        `?$filter=claimId eq '${encodeURIComponent(claimId)}'`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `CAP returned HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.value || data.value.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No documents were found for claim ${claimId}.`,
            },
          ],
        };
      }

      const documents = data.value.map(
        (document: {
          documentId: string;
          claimId: string;
          documentType: string;
          status: string;
          mandatory: boolean;
        }) => ({
          documentId: document.documentId,
          claimId: document.claimId,
          documentType: document.documentType,
          status: document.status,
          mandatory: document.mandatory,
        })
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                claimId,
                documents,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}