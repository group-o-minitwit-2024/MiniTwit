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

 
### 05/05 - Author: mahf
* Gonna do a refactor of the directory structure.
* Would be nice with a structure, where each service is separated entirely.
  * Will be an issue regarding shared code between app and api
  * Solution: make a shared folder - I will use [`/utils`](/utils/).
* Probably gonna have some issues with routings, but hopefully will be fine
* This shared dependency is giving me issues
* Currently, my structure is
```
.
├── API
│   ├── Dockerfile
│   ├── package.json
│   ├── schema.sql
│   ├── simulator
│   │   ├── minitwit_scenario.csv
│   │   └── minitwit_simulator.py
│   └── src
│       ├── api.js
│       ├── api_test.js
│       └── latest_processed_sim_action_id.txt
├── app
│   ├── Dockerfile
│   ├── Dockerfile.test
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── bin
│       │   └── www
│       ├── public
│       │   └── stylesheets
│       │       └── style.css
│       ├── tests
│       │   ├── add_message.test.js
│       │   ├── login.test.js
│       │   ├── register.test.js
│       │   └── timeline.test.js
│       └── views
│           ├── error.ejs
│           ├── layout.ejs
│           ├── login.ejs
│           ├── register.ejs
│           └── timeline.ejs
├── compose.dev.yaml
├── compose.prod.yaml
├── compose.test.yaml
├── dev.env
├── Dockerfile.pg
├── log.md
├── prod.env
├── README.md
├── sonar-project.properties
└── utils
    ├── db.js
    ├── prometheus.js
    └── schema_postgres.sql
```
* When I run `docker run -it --rm minitwit npm test`, I get `Error: Cannot find module '../../utils/db'`, due to utils being in a parent directory of the app, which leads to the Dockerfile not copying it with `COPY . .`
* Not sure how to handle this entirely. I think I'm gonna just duplicate the code such that utils are in both app and API
* Our postgres image can be removed entirely and just use a base postgres image by specifying volumes and environment variables
```
  db:
    image: postgres:alpine3.19
    env_file:
      - dev.env
    volumes:
      - ./schema_postgres.sql:/docker-entrypoint-initdb.d/schema_postgres.sql 
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 3s
      timeout: 3s
      retries: 3
```
* So my solution is to create `/utils` in the the root of the project, and then copy the files over into `app` and `API` in their `/src` folders. These will not be tracked by git. Whenever changes are made to any utils, they have to be copied again. For this, I created a helper script [`cp_shrd.sh`](/cp_shrd.sh), which copies the files as needed 
```sh
#!/bin/bash

echo "Copying shared files to app and API"
cp -r ./utils ./app/src
cp -r ./utils ./API/src
```
* I'm not entirely happy with this, but I don't want to spend any more of my saturday on this
* I also created a [`secrets_template`](/secrets_template/) folder, to be used for copying as `cp secrets_template secrets`, and then filled out with the necessary secrets.