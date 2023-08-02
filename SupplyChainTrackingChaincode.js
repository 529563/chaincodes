const { Contract } = require('fabric-contract-api');

class SupplyChain extends Contract {
    async Init(ctx) {
        console.info('Supply Chain Tracking Chaincode initialized');
    }

    async CreateProduct(ctx, productId, productName, manufacturer) {
        const product = {
            ID: productId,
            Name: productName,
            Manufacturer: manufacturer,
            CurrentOwner: manufacturer,
            History: [],
        };
        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        console.info('Product created:', product);
    }

    async TransferProduct(ctx, productId, newOwner) {
        const productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Product with ID ${productId} does not exist`);
        }

        const product = JSON.parse(productAsBytes.toString());
        product.History.push({
            From: product.CurrentOwner,
            To: newOwner,
            Timestamp: new Date().toISOString(),
        });
        product.CurrentOwner = newOwner;

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        console.info('Product transferred:', product);
    }

    async GetProductDetails(ctx, productId) {
        const productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Product with ID ${productId} does not exist`);
        }

        const product = JSON.parse(productAsBytes.toString());
        console.info('Product Details:', product);
        return product;
    }
}

module.exports = SupplyChain;
