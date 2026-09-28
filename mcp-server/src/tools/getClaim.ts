import { z } from "zod";

const CAP_BASE_URL = "http://localhost:4004/insurance";

export function registerGetClaimTool(server: any) {
  server.registerTool(
    "get_claim",
    {
      title: "Get Claim",
      description:
        "Retrieve insurance claim details using the claim ID.",
      inputSchema: {
        claimId: z.string().min(1).describe("Insurance claim ID"),
      },
    },
    async ({ claimId }: { claimId: string }) => {
      const url =
        `${CAP_BASE_URL}/Claims(` +
        `'${encodeURIComponent(claimId)}'` +
        `)`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            content: [
              {
                type: "text",
                text: `Claim ${claimId} was not found.`,
              },
            ],
            isError: true,
          };
        }

        throw new Error(
          `CAP returned HTTP ${response.status}`
        );
      }

      const claim = await response.json();

      const result = {
        claimId: claim.claimId,
        policyId: claim.policyId,
        customerId: claim.customerId,
        claimType: claim.claimType,
        incidentDate: claim.incidentDate,
        description: claim.description,
        claimAmount: claim.claimAmount,
        status: claim.status,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}