import { z } from "zod";

const CAP_BASE_URL = "http://localhost:4004/insurance";

export function registerGetCustomerTool(server: any) {
  server.registerTool(
    "get_customer",
    {
      title: "Get Customer",
      description:
        "Retrieve insurance customer details using the customer ID.",
      inputSchema: {
        customerId: z
          .string()
          .min(1)
          .describe("Insurance customer ID"),
      },
    },
    async ({ customerId }: { customerId: string }) => {
      const url =
        `${CAP_BASE_URL}/Customers(` +
        `'${encodeURIComponent(customerId)}'` +
        `)`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            content: [
              {
                type: "text",
                text: `Customer ${customerId} was not found.`,
              },
            ],
            isError: true,
          };
        }

        throw new Error(
          `CAP returned HTTP ${response.status}`
        );
      }

      const customer = await response.json();

      const result = {
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
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