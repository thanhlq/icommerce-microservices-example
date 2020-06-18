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

Quickly start all services:

```bash
./start.sh
```

For execution of unit tests:

```bash
npm run test
```

Then, going to address: http://locahost:1981/api/v1products/

## API Guides

In the common api, you can specify the sort criteria in the query parameter as following (default is ascending - asc):

* Single field: .../products/sort=name
* Single field and descending: .../products/sort=name:desc
* Multiple fields: .../products/sort=branch,price:desc

### Product Listing & Filtering

* List all products -> <code>GET localhost:5500/api/v1/products</code>
* List all products with sorting (sort by branches and price) -> <code>GET localhost:5500/api/v1/products?sort=branch:desc,price:asc</code>

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
        |-- product-analytic: product-analytic microservice
        |-- pubsub-redis: a shared module for communication between service via the PubSub model (by using redis)
  |-- scripts: utilities for installing of needed software.
```


# APPENDIX

## Limitations of This Implementation

* Listing products with filtering as price range is not implemented - ?price:1200:3000 
* No separation of the business service and the data service yet, in fact, the data service - data CRUD operations should be in db layer.
* Unit tests, I gave some unit tests with Product service as well the API test but not all tests have been implemented - only samples.
* Loading/starting of the microservices could be shared in common code.
* Integration test is not implemented yet.
