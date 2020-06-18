# iCommerce Application - An Example Of A Microservice Architecture 

## Software Dependencies & Installation

This application requires the following global software packages:

* mongodb (recommended >= v4.0): For database storage.
* redis (recommended >= v3.2): For communication between services.
* lerna: For management of multiple node packages

I provided some utility scripts for installation of these software packages.

### 1. Install Redis

Go to scripts folder

```bash
./install-redis.sh
```

### 2. Install Mongodb
  
If you are running Ubuntu 20.04:
```bash
./install-mongodb-v4.2--ubuntu-v20.04-lts.sh
```

For other ubuntu version, please see: [guide for installation on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

### 3. Install Lerna

```bash
./install-dependencies.sh
```

## Quickly Getting Started


### Start the Product microservice:

```bash
./start-product.sh
```

* Checking the service at the url: http://locahost:1981/api/v1products/ You should have the list of sample products.

### Start the Product-Analytic microservice:

```bash
./start-product-analytic.sh
```

* Checking the service at the url: http://localhost:5501/api/v1/products-analytics

When the Product Analytic service started, it will listen for events from Product service
as customer's product searching (text search), filtering...  and then save these data into database

### For execution of unit tests:

At the project root folder.

```bash
npm run test
```

## API Guides

In the common api, you can specify the sort criteria in the query parameter as following (default is ascending - asc):

* Single field: .../products/sort=name
* Single field and descending: .../products/sort=name:desc
* Multiple fields: .../products/sort=branch,price:desc

### Product Listing & Filtering

* List products -> <code>GET localhost:5500/api/v1/products</code>
* List products with sorting (sort by branches and price) -> <code>GET localhost:5500/api/v1/products?sort=branch:desc,price:asc</code>
* List products with price in range -> <code>localhost:5500/api/v1/products?price=gte:1600:lt:3000</code>
  * Supported price operators:
    * gt: Matches values that are greater than a specified value.
    * gte: Matches values that are greater than or equal to a specified value.
    * gt: Matches values that are less than a specified value.
    * gte: Matches values that are less than or equal to a specified value.

### Product Search

This api allows search product by text. You can also specify sort criteria.

* Search product by text <code>POST localhost:5500/api/v1/products/search?q=Apple&sort=branch:desc,price</code>

### Product Detail/Create/Update

* Get product detail <code>GET localhost:5500/api/v1/products/id_xxx</code>
* Delete a product <code>DELETE localhost:5500/api/v1/products/id_xxx</code>
* Update a product <code>PUT localhost:5500/api/v1/products/id_xxx</code>

* Create a product <code>POST localhost:5500/api/v1/products</code>

Example code to create a product with curl command:

```bash
curl --location --request POST 'localhost:5500/api/v1/products' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "MacBook Air 12",
    "code": "mp-air-12",
    "color": "space gray",
    "price": 1200,
    "branch": "Apple Inc"
  }'
```
 
### Product Analytic Data

This api tries to give a basic data analytic of customer's product searching/filtering.

* To get product analytic data: <code>GET localhost:5501/api/v1/products-analytics</code>

The return data is as following:

* Counting of the number of searched field (by name, color, branch,...), for example, search by product name 2 times.
* Detailed searched data, for example, "Dell XPS"

## Project Structure

Global structure:

```
---
  |-- packages: containing the microservices (product, product analytic, shared node modules)
        |-- logger: a wrapper for open source logger implementation.
        |-- product: product microservice
          |-- api
            |-- controllers     Contain the http controllers (request handlers).
            |-- services        Contain the business service layer.
            |-- db              Contain the database layer.
        |-- product-analytic: product-analytic microservice
        |-- pubsub-redis: a shared module for communication between service via the PubSub model (by using redis)
  |-- scripts: utilities for installing of needed software.
```

You can see, with the structure above, you can extend each service or more services in a very flexible way. 

# APPENDIX

## Limitations of This Implementation

* No separation of the business service and the data service yet, in fact, the data service - data CRUD operations should be in db layer.
* Unit tests, I gave some unit tests with Product service as well the API test but not all tests have been implemented - only samples.
* Database management service could be in shared code.
* Loading/starting of the microservices could be shared in common code.
* Integration test is not implemented yet.
* No security configured for this app yet i.e. authentication/authorization/cors/...

## Database Schema

Note: 3 fields _id, createdAt and updatedAt shall be automatically added.

### Product model (Mongoose/mongodb)

```javascript
{
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
  },
  code: {
    type: String,
    index: true,
    unique: true
  },
  color: {
    type: String,
    index: true,
  },
  branch: {
    type: String,
    index: true,
  },
  price: {
    type: Number,
    index: true,
  },
}
```

### Product-Analytic model:

```javascript
{
  /* the text the customer often search */
  searchText: {
    type: String,
    index: true,
  },
  name: {
    type: String,
    index: true,
  },
  code: {
    type: String,
    index: true,
  },
  color: {
    type: String,
    index: true,
  },
  branch: {
    type: String,
    index: true,
  },
  price: {
    type: String,
    index: true,
  },
}
```

## Example Of Analytic Data

Explaining for data below - for instance the field "name":

* name.count: customer made the data filtering by name for 1 times.
* name.searchedData: the detailed data that customer typed to search and the counting.

```json
{
    "message": "Product Analytic Data",
    "data": {
        "name": {
            "count": 1,
            "searchedData": [
                {
                    "_id": "Dell XPS 13",
                    "count": 1
                }
            ]
        },
        "branch": {
            "count": 1,
            "searchedData": [
                {
                    "_id": "Dell Inc.",
                    "count": 1
                }
            ]
        },
        "color": {
            "count": 1,
            "searchedData": [
                {
                    "_id": "gray",
                    "count": 1
                }
            ]
        },
        "price": {
            "count": 2,
            "searchedData": [
                {
                    "_id": "gte:1600:lt:3000",
                    "count": 2
                },
                {
                    "_id": "1200",
                    "count": 1
                }
            ]
        },
        "searchText": {
            "count": 1,
            "searchedData": [
                {
                    "_id": "Apple",
                    "count": 1
                }
            ]
        }
    }
}
```