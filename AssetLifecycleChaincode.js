const { Contract } = require('fabric-contract-api');

class AssetLifecycle extends Contract {
    async Init(ctx) {
        console.info('Asset Lifecycle Chaincode initialized');
    }

    async CreateAsset(ctx, assetId, description, owner) {
        const asset = {
            ID: assetId,
            Description: description,
            Owner: owner,
            Status: 'Created',
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
        if (asset.Status !== 'Created') {
            throw new Error('Asset cannot be transferred as it is not in the created state');
        }

        asset.Owner = newOwner;
        asset.Status = 'Transferred';

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('Asset transferred:', asset);
    }

    async ApproveAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`Asset with ID ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetAsBytes.toString());
        if (asset.Status !== 'Transferred') {
            throw new Error('Asset cannot be approved as it is not in the transferred state');
        }

        asset.Status = 'Approved';

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('Asset approved:', asset);
    }

    async RevokeAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`Asset with ID ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetAsBytes.toString());
        if (asset.Status !== 'Transferred') {
            throw new Error('Asset cannot be revoked as it is not in the transferred state');
        }

        asset.Status = 'Revoked';

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('Asset revoked:', asset);
    }

    async GetAssetDetails(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`Asset with ID ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetAsBytes.toString());
        console.info('Asset Details:', asset);
        return asset;
    }
}

module.exports = AssetLifecycle;
