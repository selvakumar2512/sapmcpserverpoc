using {insurance} from '../db/schema';

@odata: '/insurance'
@mcp  : 'insurance'
service InsuranceService {
    entity Customers      as projection on insurance.Customers;
    entity Policies       as projection on insurance.Policies;
    entity Claims         as projection on insurance.Claims;
    entity ClaimDocuments as projection on insurance.ClaimDocuments;

    action assessClaimCoverage(claimId: String(20)) returns {
        claimId                : String(20);
        policyId               : String(20);
        coverageStatus         : String(30);
        claimAmount            : Decimal(15, 2);
        deductible             : Decimal(15, 2);
        potentialPayableAmount : Decimal(15, 2);
        missingDocuments       : array of String;
    };

    action initiateClaimReview(claimId: String(20)) returns {
        claimId        : String(20);
        previousStatus : String(30);
        newStatus      : String(30);
        actionStatus   : String(30);
    };
}
