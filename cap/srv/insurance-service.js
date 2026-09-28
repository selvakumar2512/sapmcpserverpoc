const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
  const { Claims, Policies, ClaimDocuments } = this.entities;

  this.on("assessClaimCoverage", async (req) => {
    const { claimId } = req.data;

    // 1. Read the claim
    const claim = await SELECT.one.from(Claims).where({ claimId });

    if (!claim) {
      return req.error(404, `Claim ${claimId} not found`);
    }

    // 2. Read the policy
    const policy = await SELECT.one
      .from(Policies)
      .where({ policyId: claim.policyId });

    if (!policy) {
      return req.error(404, `Policy ${claim.policyId} not found`);
    }

    // 3. Check policy status
    const policyActive = policy.status === "ACTIVE";

    // 4. Check incident date
    const incidentDate = new Date(claim.incidentDate);
    const startDate = new Date(policy.startDate);
    const endDate = new Date(policy.endDate);

    const incidentWithinPolicyPeriod =
      incidentDate >= startDate && incidentDate <= endDate;

    // 5. Check claim type
    // For this POC, Motor Insurance covers ACCIDENT claims.
    const claimTypeCovered =
      policy.policyType === "Motor Insurance" && claim.claimType === "ACCIDENT";

    // 6. Calculate deductible
    const deductible = Number(policy.deductible);
    const claimAmount = Number(claim.claimAmount);

    // 7. Determine potential payable amount
    let potentialPayableAmount = 0;

    if (policyActive && incidentWithinPolicyPeriod && claimTypeCovered) {
      potentialPayableAmount = Math.max(0, claimAmount - deductible);
    }

    // 8. Find missing mandatory documents
    const documents = await SELECT.from(ClaimDocuments).where({ claimId });

    const missingDocuments = documents
      .filter(
        (document) =>
          document.mandatory === true && document.status !== "RECEIVED",
      )
      .map((document) => document.documentType);

    // Determine overall coverage status
    let coverageStatus = "NOT_COVERED";

    if (policyActive && incidentWithinPolicyPeriod && claimTypeCovered) {
      coverageStatus = "POTENTIALLY_COVERED";
    }

    return {
      claimId: claim.claimId,
      policyId: claim.policyId,
      coverageStatus,
      claimAmount,
      deductible,
      potentialPayableAmount,
      missingDocuments,
    };
  });

  this.on("initiateClaimReview", async (req) => {
    const { claimId } = req.data;

    if (!claimId) {
      return req.error(400, "claimId is required");
    }

    const claim = await SELECT.one.from("insurance.Claims").where({ claimId });

    if (!claim) {
      return req.error(404, `Claim ${claimId} was not found`);
    }

    const previousStatus = claim.status;
    const newStatus = "UNDER_REVIEW";

    let actionStatus;

    if (previousStatus === "UNDER_REVIEW") {
      actionStatus = "ALREADY_IN_REVIEW";
    } else {
      await UPDATE("insurance.Claims")
        .set({
          status: newStatus,
        })
        .where({ claimId });

      actionStatus = "REVIEW_INITIATED";
    }

    return {
      claimId,
      previousStatus,
      newStatus,
      actionStatus,
    };
  });
});
