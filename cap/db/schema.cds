namespace insurance;

entity Customers {
    key customerId : String(20);
    name           : String(100);
    email          : String(100);
    phone          : String(30);
}

entity Policies {
    key policyId      : String(20);
    customerId        : String(20);
    policyType        : String(50);
    status            : String(20);
    startDate         : Date;
    endDate           : Date;
    coverageLimit     : Decimal(15,2);
    deductible        : Decimal(15,2);
}

entity Claims {
    key claimId       : String(20);
    policyId          : String(20);
    customerId        : String(20);
    claimType         : String(50);
    incidentDate      : Date;
    description       : String(500);
    claimAmount       : Decimal(15,2);
    status            : String(30);
}

entity ClaimDocuments {
    key documentId    : String(20);
    claimId           : String(20);
    documentType      : String(50);
    status            : String(20);
    mandatory         : Boolean;
}

