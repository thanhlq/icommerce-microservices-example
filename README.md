# iCommerce Application - An Example Of A Microservice Architecture 

## Quickly Getting Started

Quickly start all services:

```bash
./start.sh
```

Then, going to address: http://locahost:1981/api/v1products/

## Project Structure

todo....

## Software Dependencies

This application requires the following software must be installed:

* mongodb (recommended >= v4.0): For database storage.
* redis (recommended >= v3.2): For communication between services.

See appendix session for how to install these software.

## APPENDIX

### Install Redis

Go to scripts folder

```bash
./install-redis.sh
```

### Install Mongodb
  
If you are running Ubuntu 20.04:
```bash
./install-mongodb-v4.2--ubuntu-v20.04-lts.sh
```

For other ubuntu version, please see: [guide for installation on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)