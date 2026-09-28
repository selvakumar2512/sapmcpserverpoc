import { z } from "zod";

const CAP_BASE_URL = "http://localhost:4004/insurance";

export function registerInitiateClaimReviewTool(server: any) {
  server.registerTool(
    "initiate_claim_review",
    {
      title: "Initiate Claim Review",
      description: "Initiate review of an insurance claim using the claim ID.",
      inputSchema: {
        claimId: z.string().min(1).describe("Insurance claim ID"),
      },
    },
    async ({ claimId }: { claimId: string }) => {
      const response = await fetch(`${CAP_BASE_URL}/initiateClaimReview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId,
        }),
      });

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

        const errorText = await response.text();

        throw new Error(`CAP returned HTTP ${response.status}: ${errorText}`);
      }

      const review = await response.json();

      const result = {
        claimId: review.claimId,
        previousStatus: review.previousStatus,
        newStatus: review.newStatus,
        actionStatus: review.actionStatus,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
}
