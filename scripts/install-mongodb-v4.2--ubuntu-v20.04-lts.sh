#!/bin/bash

# Author: Thanh LE

# This script is to install the following software packages (Ubuntu 20.04):

# mongodb 4.2

##
# see: https://unix.stackexchange.com/questions/401547/gpg-keyserver-receive-failed-no-dirmngr
#
# To fix error when adding mongodb key

sudo apt-get install -y dirmngr
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -

# 
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list

sudo apt-get update
sudo apt-get install -y mongodb-org
# Install shell only
# Enable the mongodb service for automatically started when system reboot
sudo systemctl enable mongod.service
# A metapackage that will automatically install the four component packages listed below.
sudo service mongod start
