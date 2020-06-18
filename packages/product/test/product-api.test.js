const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../app');

const productService = require('../api/services/product-service');

process.env.CREATE_SAMPLE_PRODUCTS = 'false';

const testProduct = {
  name: 'Dell Precision 7750',
  color: 'Black',
  branch: 'Dell Inc.',
  price: 3500,
}

describe("Product Restful API Tests", function () {

  before(async () => {
    await productService.ds_DeleteAllProducts();
    /* Create a test product for testing */
    await productService.ds_CreateProduct(testProduct);
  });

  after(async () => {
    await productService.ds_DeleteAllProducts();
  });

  it("Test List Product(GET /api/v1/products)" + testProduct.name, (done) => {
    chai.request(app).get('/api/v1/products')
      .end((err, resp) => {
        if (err) {
          done(err);
        } else {
          expect(resp).to.have.status(200);
          expect(resp.body.data).to.be.an('array');
          const products = resp.body.data;
          expect(products.length).to.greaterThan(0);
          done();
        }
      });
  });

  it('Test List Product with filter (GET /api/v1/products?name=' + testProduct.name + ')', (done) => {
    chai.request(app).get('/api/v1/products?name=' + testProduct.name)
      .end((err, resp) => {
        if (err) {
          done(err);
        } else {
          expect(resp).to.have.status(200);
          expect(resp.body.data).to.be.an('array');
          const products = resp.body.data;
          expect(products.length).to.equal(1);
          done();
        }
      });
  });

});
