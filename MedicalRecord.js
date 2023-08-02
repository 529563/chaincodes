const { Contract } = require('fabric-contract-api');

class MedicalRecords extends Contract {
    async Init(ctx) {
        console.info('Medical Records Chaincode initialized');
    }

    async CreateRecord(ctx, recordId, patientId, doctorId, content) {
        const record = {
            ID: recordId,
            PatientID: patientId,
            DoctorID: doctorId,
            Content: content,
        };
        await ctx.stub.putState(recordId, Buffer.from(JSON.stringify(record)));
        console.info('Medical record created:', record);
    }

    async GetRecord(ctx, recordId) {
        const recordAsBytes = await ctx.stub.getState(recordId);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`Medical record with ID ${recordId} does not exist`);
        }

        const record = JSON.parse(recordAsBytes.toString());
        console.info('Medical record details:', record);

        // Check access control here if needed, e.g., verify the requesting user's role or identity.

        return record;
    }
}

module.exports = MedicalRecords;
