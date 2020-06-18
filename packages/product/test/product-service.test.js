const assert = require('assert').strict;
const productService = require('../api/services/product-service');

const testProduct = {
  name: 'Dell Precision 7750',
  color: 'Black',
  branch: 'Dell Inc.',
  price: 3500,
}

describe("Product Data Service Test", function () {

  before(async () => {
    await productService.ds_DeleteAllProducts();
  });

  after(async () => {
    await productService.ds_DeleteAllProducts();
  });

  it("Should create product OK", async () => {
    const createdProduct = await productService.ds_CreateProduct(testProduct);
    assert.ok(createdProduct._id !== undefined);
    assert.ok(createdProduct._id !== null);
    assert.strictEqual(createdProduct.name, testProduct.name);
    assert.strictEqual(createdProduct.color, testProduct.color);
    assert.strictEqual(createdProduct.branch, testProduct.branch);
    assert.strictEqual(createdProduct.price, testProduct.price);
  });

  it("Should Ok with listing created product in database", async () => {
    const products = await productService.ds_ListProducts({name: testProduct.name});
    // console.log(products);
    assert.ok(products.length === 1);
  });
});
