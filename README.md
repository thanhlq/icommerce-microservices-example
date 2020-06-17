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

### Product Listing

Method/Url: GET localhost:5500/api/v1/products
 
### Product Search

Method/Url: POST localhost:5500/api/v1/products/search?qd=Apple&sort=branch:desc

 



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

Things to improve:

* Loading/starting of the microservices could be shared in common code.