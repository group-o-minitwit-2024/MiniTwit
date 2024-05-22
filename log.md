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

# 10/05 - Author: mahf, mkrh
We are gonna do docker swarm. And this time, it will work!!!! We are working from *repo-spring-cleaning*, so we are definetily gonna have merge issues, but ¯\\\_(ツ)\_/¯

* start by doing it manually, probably gonna move to *terraform* at some point
* start by setting up Digital Ocean CLI following [this guide](https://docs.digitalocean.com/reference/doctl/how-to/install/)
* Create a test droplet as
```
doctl compute droplet create --region ams --image ubuntu-23-10-x64 --size s-1vcpu-1gb test-droplet
```
* Delete it again with 
```
doctl compute droplet delete test-droplet
```
* Now, we are ready to try *docker swarm*
* First configure ssh keys to be used. This is copied from [here](https://github.com/itu-devops/itu-minitwit-docker-swarm-teraform/tree/master)
```
mkdir ssh_key && ssh-keygen -t rsa -b 4096 -q -N '' -f ./ssh_key/do
```
Add the keys to digital ocean
```
doctl compute ssh-key import do_key --public-key-file ssh_key/do.pub
```
The fingerprint can be retrieved with 
```
doctl compute ssh-key list
```
We need some more automated way of getting this later, if we are gonna do it with shell scripts
* Start by creating a swarm leader
```
doctl compute droplet create --region ams --image ubuntu-23-10-x64 --size s-1vcpu-1gb --ssh-keys YOUR_FINGERPRINT  minitwit-swarm-leader
```
* get the ip with
```
doctl compute droplet list
```
* ssh into the new droplet with 
```
ssh -i ssh_key/do root@178.62.202.172
```
* The droplet does not have docker, so try with `docker-20-04` image instead
```
doctl compute droplet create --region ams --image docker-20-04 --size s-1vcpu-1gb --ssh-keys d2:18:2f:98:9b:11:fc:dd:00:24:9c:dd:df:4e:12:ab  minitwit-swarm-leader
```
* Init docker swarm (with public ip 167.71.69.109) as
```
ssh -i ssh_key/do root@167.71.69.109 -t "docker swarm init --advertise-addr 167.71.69.109"
```
This outputs 
```
Swarm initialized: current node (ui0xfuxtbhiyqlu36obwsws6l) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-644fhu5y734zp4p3nb0dwpdcbfihumd4h2el5tcoxflapbdgun-2zpvt08d0ym6ne8oy3ub6yox4 167.71.69.109:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```
***Continuing the day after***, I've provisioned a new `minitwit-swarm-leader` with IP 104.248.206.209.
* Open ports for swarm and minitwit on all nodes
```
ufw allow 2377/tcp
ufw allow 7946
ufw allow 4789/udp

ufw allow 5000
ufw allow 5001

ufw allow 22
```
* Provision a worker, `minitwit-swarm-worker`, with the same command as for the leader
* ssh into the worker and join the leader as a worker of the swarm
```
ssh -i ssh_key/do root@206.189.101.75 -t "docker swarm join --token YOUR_TOKEN 104.248.206.209:2377"
```
* Now, running `docker node ls` on the leader node shows
```
ID                            HOSTNAME                STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
kheep54wi2kxjj31lrrn2v7it *   minitwit-swarm-leader   Ready     Active         Leader           25.0.3
583gd5bl336vdy0lzl8ny8eon     minitwit-swarm-worker   Ready     Active                          25.0.3
```
* Setup the minitwit code on the leader node
```
git clone https://github.com/group-o-minitwit-2024/MiniTwit.git
cd MiniTwit
git checkout docker-swarm
bash build.sh
docker network create --driver overlay minitwit-network
docker stack deploy -c compose.swarm.yaml lol
```
* Following all of the above steps should lead to a minitwit instance being hosted 
* Individual services can be scaled with
```
docker service scale lol_minitwit=2
```
This requires that the worker nodes also have the image available. 

***THAT'S IT***

# 16/05 - Author: mahf, mkrh
Still working on docker swarm. We've just run all of the above setup such that we have:
```
doctl compute droplet ls

ID           Name                          Public IPv4       Private IPv4    Public IPv6    Memory    VCPUs    Disk    Region    Image                                   VPC UUID                                Status    Tags    Features                            Volumes
403992304    ubuntu-s-2vcpu-2gb-ams3-01    178.62.218.96     10.110.0.2                     2048      2        60      ams3      Ubuntu 22.04 (LTS) x64                  09b86842-9585-468e-8ace-2e414ae6a489    active            droplet_agent,private_networking    
418164955    minitwit-monitoring           178.62.193.231    10.110.0.3                     1024      1        25      ams3      Ubuntu Docker 25.0.3 on Ubuntu 22.04    09b86842-9585-468e-8ace-2e414ae6a489    active            droplet_agent,private_networking    
419143988    minitwit-swarm-leader         188.166.13.145    10.110.0.6                     1024      1        25      ams3      Ubuntu Docker 25.0.3 on Ubuntu 22.04    09b86842-9585-468e-8ace-2e414ae6a489    active            droplet_agent,private_networking    
419144500    minitwit-swarm-manager-01     178.62.208.166    10.110.0.7                     1024      1        25      ams3      Ubuntu Docker 25.0.3 on Ubuntu 22.04    09b86842-9585-468e-8ace-2e414ae6a489    active            droplet_agent,private_networking    
419144511    minitwit-swarm-worker-01      128.199.55.41     10.110.0.8                     1024      1        25      ams3      Ubuntu Docker 25.0.3 on Ubuntu 22.04    09b86842-9585-468e-8ace-2e414ae6a489    active            droplet_agent,private_networking    

```

* We have messed with it a bit, and we've got it all working :sunglasses:
* We have modified the building script such that it pushes to dockerhub conditionally i.e. run 
```
bash build.sh --push jeffjeffersonthe2nd
```
* With this, we don't need to build each image locally on each node
* We still have issues regarding the bind mount of db `./utils/schema_postgres.sql:/docker-entrypoint-initdb.d/schema_postgres.sql` but this will not be an issue in prod. Regardless, it should still be solved. 
* We will move on to create our infrastructure as code using _Terraform_
* We have followed the [guide](https://github.com/itu-devops/itu-minitwit-docker-swarm-teraform/tree/master) from the lectures, and managed to get it working. There are some details that needs ironing out. 
* Current root directory looks like this
```
ls

API                 compose.test.yaml     prod.env                  ssh_key.tf
app                 cp_shrd.sh            provider.tf               temp
backend.tf          dev.env               README.md                 terraform.tfstate
build.sh            log.md                secrets                   terraform.tfstate.backup
compose.dev.yaml    minitwit.auto.tfvars  secrets_template          utils
compose.prod.yaml   minitwit_swarm.tf     sonar-project.properties
compose.swarm.yaml  node_modules          ssh_key
```
New files are 
* `backend.tf` - defines connection to the digital ocean spaces object storage, used for storing the terraform state file 
* `minitwit.auto.tfvars` - this file defines variables such as region and ssh key locations 
* `minitwit_swarm.tf` - main file for provisioning swarm leader, managers, and workers 
* `provider.tf` - this file configures the connection to digital ocean and sets it as provider. This file requires secrets that are set in the `/secrets/tf_secrets` 
* `/temp` - this directory is for storing swarm tokens, outputted by `minitwit_swarm.tf`
* `ssh_key.tf` - configures the ssh key
* `/ssh_key` - directory where `terraform` and `terraform.pub` ssh key files are stored


# 22/05 (28/04) - Author: lakj
Added UI Automated tests from ui_automated_tests branch to new file structure setup. Test are runnable with Firefox browser from localmachine. The tests are registering af user, login, and post on timeline. A browserstack is created, such that tests can be executed with browserstack. Requires lakj username and access key from browserstack.
