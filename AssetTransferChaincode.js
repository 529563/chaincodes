const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    async Init(ctx) {
        console.info('Asset Transfer Chaincode initialized');
    }

    async CreateAsset(ctx, assetId, owner, value) {
        const asset = {
            ID: assetId,
            Owner: owner,
            Value: value,
        };
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('Asset created:', asset);
    }

    async TransferAsset(ctx, assetId, newOwner) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`Asset with ID ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetAsBytes.toString());
        asset.Owner = newOwner;
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('Asset transferred:', asset);
    }

    async ReadAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`Asset with ID ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetAsBytes.toString());
        console.info('Read Asset:', asset);
        return asset;
    }
}

module.exports = AssetTransfer;
