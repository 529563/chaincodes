const { Contract } = require('fabric-contract-api');

class VotingSystem extends Contract {
    async Init(ctx) {
        console.info('Voting System Chaincode initialized');
    }

    async CreateCandidate(ctx, candidateId, candidateName) {
        const candidate = {
            ID: candidateId,
            Name: candidateName,
            Votes: 0,
        };
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));
        console.info('Candidate created:', candidate);
    }

    async VoteForCandidate(ctx, candidateId) {
        const candidateAsBytes = await ctx.stub.getState(candidateId);
        if (!candidateAsBytes || candidateAsBytes.length === 0) {
            throw new Error(`Candidate with ID ${candidateId} does not exist`);
        }

        const candidate = JSON.parse(candidateAsBytes.toString());
        candidate.Votes++;
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));
        console.info('Vote registered for candidate:', candidate);
    }

    async GetCandidateDetails(ctx, candidateId) {
        const candidateAsBytes = await ctx.stub.getState(candidateId);
        if (!candidateAsBytes || candidateAsBytes.length === 0) {
            throw new Error(`Candidate with ID ${candidateId} does not exist`);
        }

        const candidate = JSON.parse(candidateAsBytes.toString());
        console.info('Candidate Details:', candidate);
        return candidate;
    }
}

module.exports = VotingSystem;

