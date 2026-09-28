import { z } from "zod";

const CAP_BASE_URL = "http://localhost:4004/insurance";

export function registerGetPolicyTool(server: any) {
  server.registerTool(
    "get_policy",
    {
      title: "Get Policy",
      description:
        "Retrieve insurance policy details using the policy ID.",
      inputSchema: {
        policyId: z.string().min(1).describe("Insurance policy ID"),
      },
    },
    async ({ policyId }: { policyId: string }) => {
      const url =
        `${CAP_BASE_URL}/Policies(` +
        `'${encodeURIComponent(policyId)}'` +
        `)`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            content: [
              {
                type: "text",
                text: `Policy ${policyId} was not found.`,
              },
            ],
            isError: true,
          };
        }

        throw new Error(
          `CAP returned HTTP ${response.status}`
        );
      }

      const policy = await response.json();

      const result = {
        policyId: policy.policyId,
        customerId: policy.customerId,
        policyType: policy.policyType,
        status: policy.status,
        startDate: policy.startDate,
        endDate: policy.endDate,
        coverageLimit: policy.coverageLimit,
        deductible: policy.deductible,
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