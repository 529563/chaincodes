const { Contract } = require('fabric-contract-api');

class IdentityVerificationChaincode extends Contract {
    async Init(ctx) {
        console.info('Identity Verification Chaincode initialized');
    }

    async RegisterUser(ctx, name, email) {
        // Check if the invoking client is authenticated to allow user registration.
        const clientIdentity = ctx.clientIdentity;
        if (!clientIdentity.assertAttributeValue('status', 'authenticated')) {
            throw new Error('Unauthorized: Only authenticated users can register.');
        }

        const userId = clientIdentity.getID();
        const user = {
            ID: userId,
            Name: name,
            Email: email,
            Status: 'verified', // Set status as 'verified' during registration.
        };
        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        console.info('User registered:', user);
    }

    async CreateRecord(ctx, recordId, value) {
        // Check if the invoking client has 'admin' role and 'verified' status to allow record creation.
        const clientIdentity = ctx.clientIdentity;
        const isAdmin = clientIdentity.assertAttributeValue('role', 'admin');
        const isVerified = clientIdentity.assertAttributeValue('status', 'verified');

        if (!isAdmin || !isVerified) {
            throw new Error('Unauthorized: Only users with admin role and verified status can create records.');
        }

        const record = {
            ID: recordId,
            Value: value,
            Owner: clientIdentity.getID(),
        };
        await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));
        console.info('Record created:', record);
    }

    async GetRecord(ctx, recordId) {
        // Allow the record owner or users with 'viewer' role to read records.
        const recordAsBytes = await ctx.stub.getState(recordId);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        const record = JSON.parse(recordAsBytes.toString());
        const clientIdentity = ctx.clientIdentity;

        // Check if the client is either the record owner or has the 'viewer' role.
        if (record.Owner !== clientIdentity.getID() && !clientIdentity.assertAttributeValue('role', 'viewer')) {
            throw new Error('Unauthorized: You do not have permission to read this record.');
        }

        console.info('Record Details:', record);
        return record;
    }

    async UpdateRecord(ctx, recordId, newValue) {
        // Allow only the record owner with 'verified' status to update the record.
        const recordAsBytes = await ctx.stub.getState(recordId);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Record with ID ${recordId} does not exist`);
        }

        const record = JSON.parse(recordAsBytes.toString());
        const clientIdentity = ctx.clientIdentity;

        // Check if the client is the record owner and has 'verified' status.
        const isVerified = clientIdentity.assertAttributeValue('status', 'verified');
        if (record.Owner !== clientIdentity.getID() || !isVerified) {
            throw new Error('Unauthorized: You do not have permission to update this record.');
        }

        record.Value = newValue;
        await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));
        console.info('Record updated:', record);
    }
}

module.exports = IdentityVerificationChaincode;
