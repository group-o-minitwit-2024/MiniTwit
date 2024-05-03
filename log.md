# Changelog
### 10/02 - Author: lakj
Refactor:
* refactored minitwit.py to python3. Change of utf-8 and import statements
* refactored minitwit_tests.py to python3. Change of utf-8.
* added shebang in control.sh

### 15/02 - Author: lakj, chatGPT
Refactor:
* setup shell app for Express.js app.
* refactored minitwit.py to app.js
* refactored static html files to .ejs files
* refactored Flask and Python libraries into similear Node libraries
' refactored Database functions into dbUtils.js so it can also be run in control.sh

Thoughts & remarks:
* Choose Node.js as it is a good and simple library for serverside webapps. Has a lot of libraries in extension of npm. Good to integrate to since npm had libraries for flash, hashing passwords, and sqlite3 library.

### 16/02 - Author: lakj
Refactor: 
* Added the functionality for image gravatar to app.js and timeline.ejs

### 16/02 - Author: mahf, lakj
* Tried to create basic dockerfile with node:alpine base image
* App won't run
* Switch to node:slim
* Works :)

### 16/02 - Author: mkrh
* Shuffled branch labels. Make refactored version into the main branch, and created seperate branch for the Python-flask version. 

### 19/02 - Author: mahf
* Setup testing environment
* Created new basic tests
* They don't work
* Fix by making tests async
* To be continued

### 20/02 - Author: ezpa
* Setting up Digital Ocean account 
* Setting up GitHub student privileges, it will need some days to be granted. 
* Modifying Vagrantfile for remote deployment

### 21/02 - Author: mahf
* Continue creating tests
* I'm not sure how exactly each endpoint should be evaluated, currently just looking at status codes
* start creating tests for `/login` endpoint
* seems `/login` crashes due to password hashing error for undefined users
```
Error: TypeError: Cannot read property 'pw_hash' of undefined
    at /home/mahf/Desktop/MiniTwit/app.js:210:70
POST /login 500 11.119 ms - 21
Error: cannot POST /login (500)
    at Response.toError (/home/mahf/Desktop/MiniTwit/node_modules/superagent/lib/node/response.js:107:17)
    at ResponseBase._setStatusProperties (/home/mahf/Desktop/MiniTwit/node_modules/superagent/lib/response-base.js:107:48)
    at new Response (/home/mahf/Desktop/MiniTwit/node_modules/superagent/lib/node/response.js:44:8)
    at Test.Request._emitResponse (/home/mahf/Desktop/MiniTwit/node_modules/superagent/lib/node/index.js:891:20)
    at IncomingMessage.<anonymous> (/home/mahf/Desktop/MiniTwit/node_modules/superagent/lib/node/index.js:1070:38)
    at IncomingMessage.emit (events.js:326:22)
    at endReadableNT (_stream_readable.js:1241:12)
    at processTicksAndRejections (internal/process/task_queues.js:84:21)
  ```
* stopping for now because I have no internet and it is hard to program without internet

### 22/02 - Author: lakj
* Refactored minitwit_sim_api.py into a Express api.
* Ran minitwit_sim_api_test.py and minitwit_simulator.py against refactored api. Result: Passed

### 23/02 - Author: mahf
* Changing current tests to all expect response 200
* Tests now `assert` appropriate error messages
* Copying all register tests from `python3-flask` branch for `/register` endpoint 
* Changed expected status code for succesful registers from 200 to 302 due to redirects
* All `/register` tests have been implemented
* The way the error code is accessed should perhaps be refactored to be more structured
* Email test fails, not sure why ¯\\\_(ツ)\_/¯ 
* Nvm all tests are basically fail due to status code checks
* Created `/login` tests
* REMOVED ALL STATUS EXPECTATIONS
* Need to refactor the entire test setup such that it uses `.data` attribute at some point

### 23/02 - Author: lakj 
* Small Cleanup on dbUtils and API folder.
* Fix edges casces caught by tests.

### 29/02 - Author: lakj
* Created Droplet on DigitalOcean
* Installed dependencies on Droplet
* Pulled Gitproject and Deployed APP & API.
    * Used nginx, pm2 for deployment.

### 29/02 - Author: jkau
* Refactored api tests to ExpressJS 

### 29/02 - Author: ezpa
* Modifying Vagrantfile to create only one VM and run the app 
* Adding igonre files to Vagrantfile to do not comit modules (so BM can install the proper packages)
* Adding ignore txt Ip output to .ignore in github

### 29/02 - Author: mkrh
* Added database service (Postgress) to DigitalOcean.
    * Created main cluster (main DB) and READ-ONLY node for analyses purposes
    * psql installed to Digitalocean ubuntu machine. We are ready for data migration, which will be the next step

### 12/03 - Author: lakj
* Connected to Managed Database from DigitalOcean in Application

### 13/03 - Author: lakj
* Refactored app and api usage of db.js to use remote PostgreSQL hosted on DigitalOcean
    * Note: table "user" was changed to name "account" since user is a reserved keyword in PostgreSQL

### 22/03 - Author: ezpa
* DigitalOcean now retrieves the images from docker-hub, implementing it on the CD pipeline

### 03/05 - Author: mkth, mahf
We are gonna do Docker Swarm. *How to get started event?*

Trying to follow [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-a-cluster-of-docker-containers-with-docker-swarm-and-digitalocean-on-ubuntu-16-04 )
* Start by getting [Digital Ocean token](https://docs.digitalocean.com/reference/api/create-personal-access-token/), *DOTOKEN*, from the Digital Ocean project
* Set it as an env variable with ```export DOTOKEN=...```
* Install `docker-machine`
```sh
curl -L https://github.com/docker/machine/releases/download/v0.16.2/docker-machine-`uname -s`-`uname -m` >/tmp/docker-machine &&
    chmod +x /tmp/docker-machine &&
    sudo cp /tmp/docker-machine /usr/local/bin/docker-machine
```

* Provision a single machine with
```sh
  docker-machine create --driver digitalocean  \
  --digitalocean-image ubuntu-24-04-x64 \
  --digitalocean-access-token $DOTOKEN machine-name
```

* This provisions a machine in New York for some reason
* Then, to provision multiple machines at once, 
```sh
for i in 1 2 3; do docker-machine create --driver digitalocean \
--digitalocean-image  ubuntu-24-04-x64 \
--digitalocean-access-token $DOTOKEN node-$i; done
```
* I don't think we want to use `docker-machine`
* You know what, f this, we do something else.

Instead we are going to try [itu-minitwit-docker-swarm-teraform](https://github.com/itu-devops/itu-minitwit-docker-swarm-teraform) tutorial.

* Following this tutorial seems to work nicely :+1:
* We are going to do it for our MiniTwit application. To this end, we start by getting Docker Swarm to work with MiniTwit
* Hmmmm it seems to almost work with [compose.swarm.yaml](/compose.swarm.yaml), but for some reason, pools are ended, which leads to the server crashing. we have no clue why, and we feel like giving up, so we are gonna go drink beer!