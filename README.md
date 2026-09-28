
# Insurance Claims Agent — SAP BTP MCP POC

A hands-on proof of concept exploring three ways to expose SAP business capabilities to AI agents using the **Model Context Protocol (MCP)**:

1. **Custom MCP Server** — Build agent tools using the MCP SDK.
2. **CAP MCP** — Expose a SAP Cloud Application Programming Model (CAP) service as an MCP server.
3. **SAP Integration Suite MCP** — Expose and govern SAP business capabilities through an enterprise integration layer.

The POC uses a synthetic insurance claims scenario to demonstrate how an AI agent can retrieve claim, policy, customer, and document information, assess potential coverage, and initiate a claim review.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Three MCP Approaches](#three-mcp-approaches)
- [Insurance Claims Demo](#insurance-claims-demo)
- [MCP Tools](#mcp-tools)
- [Technology Stack](#technology-stack)
- [Environment and Deployment](#environment-and-deployment)
- [Getting Started](#getting-started)
- [Validation Status](#validation-status)
- [Security Considerations](#security-considerations)
- [Limitations](#limitations)
- [Project Structure](#project-structure)

---

## Overview

This project demonstrates how an AI agent can interact with SAP business services through MCP tools.

The POC is organized into three levels:

| Level | Approach | Key Question |
|---|---|---|
| Level 1 | Custom MCP Server | How do I build agent tools? |
| Level 2 | CAP MCP | How do I expose a CAP service as MCP with minimal code? |
| Level 3 | SAP Integration Suite MCP | How do I govern and integrate agent access across an enterprise? |

Each level explores a different way to make SAP business capabilities available to an AI agent.

## Architecture

### Level 3 — SAP Integration Suite MCP

The Level 3 architecture uses SAP Integration Suite in QA to expose MCP tools that access a CAP Insurance Service and SAP HANA Cloud in DEV.

**Request flow:**

1. A business user asks a question through the AI agent.
2. The agent sends an MCP request over HTTPS to the Integration Suite MCP server.
3. The MCP server routes the request to the API artifact.
4. The API artifact uses a destination with OAuth 2.0 client credentials to connect to the CAP service.
5. The CAP service processes the operation and reads or updates data in SAP HANA Cloud.
6. The response returns through Integration Suite to the AI agent.

### Environment Overview

| Component | Environment |
|---|---|
| AI Agent | Local development machine |
| Integration Suite MCP Server | QA |
| API Artifact | QA |
| Destination | QA |
| CAP Insurance Service | DEV |
| SAP HANA Cloud / HDI Container | DEV |

> The architecture represents the POC deployment landscape, not a production reference architecture.

---

## Three MCP Approaches

### Level 1 — Custom MCP Server

A custom MCP server is implemented using the Model Context Protocol SDK.

It registers individual tools that call the CAP Insurance Service and return structured results to the AI agent.

**What it demonstrates:**
- Defining MCP tools and input schemas.
- Connecting an MCP client to a custom server.
- Calling backend services from tools.
- Returning structured insurance claim data.

### Level 2 — CAP MCP

The CAP service is exposed through the `@cap-js/mcp` package.

Instead of implementing every MCP tool manually, the CAP MCP approach exposes service capabilities through the CAP service definition.

**What it demonstrates:**
- Exposing CAP entities and actions through MCP.
- Reducing custom MCP server code.
- Connecting an MCP client to a CAP MCP endpoint.

### Level 3 — SAP Integration Suite MCP

SAP Integration Suite provides the MCP exposure and integration layer.

The MCP server exposes tools backed by an API artifact, which uses a destination to reach the CAP service in DEV.

**What it demonstrates:**
- Exposing SAP business capabilities through an integration layer.
- Routing MCP requests to API resources.
- Using OAuth 2.0 client credentials for backend connectivity.
- Separating the integration layer from the business application.

---

## Insurance Claims Demo

The POC uses synthetic insurance data for a motor accident claim.

### Sample Scenario

| Field | Value |
|---|---|
| Customer ID | `CUS1001` |
| Policy ID | `POL1001` |
| Claim ID | `CLM100045` |
| Claim Type | `ACCIDENT` |
| Claim Amount | 8,500 |
| Claim Status | `UNDER_REVIEW` |
| Policy Type | Motor Insurance |
| Deductible | 500 |

### Coverage Assessment

The deterministic demo logic returns:

```json
{
  "claimId": "CLM100045",
  "policyId": "POL1001",
  "coverageStatus": "POTENTIALLY_COVERED",
  "claimAmount": 8500,
  "deductible": 500,
  "potentialPayableAmount": 8000,
  "missingDocuments": [
    "Repair Estimate"
  ]
}
```

This is a demonstration of tool-based retrieval and business logic, not a production insurance adjudication.

---

## MCP Tools

### Level 1 — Custom MCP Server

| Tool | Purpose |
|---|---|
| `get_claim` | Retrieve claim details |
| `get_policy` | Retrieve policy details |
| `get_customer` | Retrieve customer details |
| `get_claim_documents` | Retrieve claim documents |
| `assess_claim_coverage` | Assess potential coverage |
| `initiate_claim_review` | Initiate a claim review |

### Level 2 — CAP MCP

The CAP MCP endpoint exposes generic MCP operations for discovering and invoking CAP service capabilities.

### Level 3 — Integration Suite MCP

| Tool | Purpose |
|---|---|
| `get_Claims` | Retrieve claims |
| `get_Policies` | Retrieve policies |
| `get_Customers` | Retrieve customers |
| `get_ClaimDocuments` | Retrieve claim documents |
| `post_assessClaimCoverage` | Assess potential claim coverage |
| `post_initiateClaimReview` | Initiate a claim review |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend service | SAP CAP |
| Database | SAP HANA Cloud |
| MCP implementation | Model Context Protocol SDK |
| CAP MCP | `@cap-js/mcp` |
| Enterprise integration | SAP Integration Suite |
| AI agent | TypeScript, OpenAI-compatible API |
| LLM provider | Groq |
| Runtime | Node.js |

---

## Environment and Deployment

The POC uses the following deployment arrangement:

- **DEV:** CAP Insurance Service and SAP HANA Cloud.
- **QA:** SAP Integration Suite MCP server, API artifact, and destination.
- **Local:** AI agent and MCP client.

The Level 1 and Level 2 approaches were validated locally. Level 3 MCP tools were validated using MCP Inspector.

---

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- Access to the relevant SAP BTP services for the deployment-based scenarios
- An API key for the configured LLM provider
- MCP Inspector for interactive tool testing

### Clone the Repository

```bash
git clone https://github.com/selvakumar2512/sapmcpserverpoc.git
cd sapmcpserverpoc
```

### Project Modules

The repository contains three main modules:

- `mcp-server/` — Custom MCP server
- `cap/` — CAP service and data model
- `ai-agent/` — AI agent and MCP client

Install dependencies from the relevant module using its package manager configuration.

> Detailed execution commands and environment configuration should be maintained alongside each module's package scripts and configuration templates.

---

## Validation Status

| Component | Status |
|---|---|
| Level 1 — Custom MCP Server | Completed and validated |
| Level 2 — CAP MCP | Completed and validated |
| AI Agent with Level 1 | Validated |
| AI Agent with Level 2 | Validated |
| Level 3 — Integration Suite MCP tools | Validated using MCP Inspector |
| Level 3 — AI Agent end-to-end integration | Pending validation |

The Level 3 backend path was verified from Integration Suite through the destination to the CAP service and HANA-backed data.

---

## Security Considerations

- Never commit `.env` files, API keys, OAuth tokens, service keys, or other credentials.
- Use environment variables or an approved secret-management mechanism for sensitive configuration.
- Use OAuth 2.0 client credentials for authenticated backend connectivity.
- Keep real customer, policy, and claims data out of the public repository.
- The included insurance records are synthetic demonstration data.

---

## Limitations

- This is a proof of concept, not a production-ready insurance claims platform.
- Coverage assessment uses deterministic demo logic and does not replace an insurer's formal claims decision process.
- No production security, governance, performance, or resilience certification is implied.
- Level 3 AI-agent-to-MCP end-to-end validation remains pending.

---

## Project Structure

```text
sapmcpserverpoc/
├── ai-agent/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── cap/
│   ├── db/
│   │   ├── data/
│   │   └── schema.cds
│   ├── srv/
│   ├── package.json
│   └── mta.yaml
├── mcp-server/
│   ├── src/
│   │   └── tools/
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## Author

**Insurance Claims Agent — SAP BTP MCP POC**

Repository: [sapmcpserverpoc](https://github.com/selvakumar2512/sapmcpserverpoc)