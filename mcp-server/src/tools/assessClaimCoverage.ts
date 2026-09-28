import { z } from "zod";

const CAP_BASE_URL = "http://localhost:4004/insurance";

export function registerAssessClaimCoverageTool(server: any) {
  server.registerTool(
    "assess_claim_coverage",
    {
      title: "Assess Claim Coverage",
      description:
        "Assess insurance claim coverage using the claim ID.",
      inputSchema: {
        claimId: z
          .string()
          .min(1)
          .describe("Insurance claim ID"),
      },
    },
    async ({ claimId }: { claimId: string }) => {
      const response = await fetch(
        `${CAP_BASE_URL}/assessClaimCoverage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claimId,
          }),
        }
      );

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

        throw new Error(
          `CAP returned HTTP ${response.status}: ${errorText}`
        );
      }

      const assessment = await response.json();

      const result = {
        claimId: assessment.claimId,
        policyId: assessment.policyId,
        coverageStatus: assessment.coverageStatus,
        claimAmount: assessment.claimAmount,
        deductible: assessment.deductible,
        potentialPayableAmount:
          assessment.potentialPayableAmount,
        missingDocuments: assessment.missingDocuments,
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