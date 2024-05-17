# MiniTwit©️
MiniTwit is a Twitter/X clone developed for _DevOps, Software Evolution and Software Maintenance, BSc (Spring 2024)_. This project aims to provide hands-on experience in deploying and managing a modern web application using various DevOps tools and practices. The application consists of a frontend and an API, both containerized using Docker, and supports different deployment configurations using Docker Compose and Docker Swarm. Additionally, infrastructure management is handled using Terraform, and the setup includes monitoring, linting, and CI/CD pipelines.


## Building the app
The project is built and run using _Docker_. [`app`](/app/) and [`api`](/API/) both contain _Dockerfiles_ for building the respective services. These services can be started in multiple configurations found in [`/compose`](/compose/). To build the app, use the [`build.sh`](/build.sh) script for building the images `minitwit` and `minitwit-api`. 
```
bash build.sh
```
It also handles pushing these images to _Docker Hub_ with the use of the `--push` flag.
```
bash build.sh --push YOUR_DOCKER_HUB_USERNAME
```
This will handle shared code (see section [_Handling shared code_](#handling-shared-code)). Alternatively, you can build the images manually as
```
bash cp_shrd.sh
docker build -t minitwit ./app
docker build -t minitwit-api ./API
```

### Handling shared code
[`utils`](/utils/) contains shared code, needed to run both services. It is not included in the services, so it needs be copied in their respective service folders. Specifically, it should be placed as a child folder of `/src`. This can be done with the [`cp_shrd.sh`](/cp_shrd.sh) script.
```
bash cp_shrd.sh
```
Running the script will copy the `/utils` directory into the `/src` directory of the respective services. 
```
cp -r ./utils ./app/src
cp -r ./utils ./API/src
```


## Run project with docker compose
Once the necessary images have been built, the app is ready to be run. There are multiple different configurations for running the app, which can all be found in the [`/compose`](/compose/) directory. The difference between these versions is how they connect to a database. Our service requires a _PostgreSQL_ database for handling accounts and messages. 
* [`compose.prod.yaml`](/compose/compose.prod.yaml) connects to our production database and uses the official latest image of the app. To run the service in production, secrets first need to be configured (see [_secrets_](#secrets) section).
* [`compose.dev.yaml`](/compose/compose.dev.yaml) spins up a local database container that the app connects to.

To run the app through _docker compose_, run
```
docker compose -f ./compose/compose.VERSION.yaml up
```
This is the simplest way of running the entire stack. However, in production, we are running the stack using _Docker Swarm_ (see section [_Run project with docker swarm_](#run-project-with-docker-swarm)).


## Run project with docker swarm
To run the project with _Docker Swarm_, you should have the necessary nodes started first. We manage this through _Terraform_ (see section [_Terraform_](#terraform)). In general, Terraform manages a lot of this (such as firewalls, setting up the swarm etc.). This section will detail the general workflow of using docker swarm with the minitwit stack. See also the [official docker swarm tutorial](https://docs.docker.com/engine/swarm/swarm-tutorial/).

Start by initializing a docker swarm _leader_ (on the leader node).
```
docker swarm init --advertise-addr LEADER_NODE_IP_ADDRESS
```
Open the necessary firewalls for swarm communication
```
ufw allow 2377/tcp
ufw allow 7946
ufw allow 4789/udp
```
You can get the _manager_ and _worker_ token needed to join the leader in the specific role with 
```
docker swarm join-token manager
docker swarm join-token worker
```
Remember these tokens. Manager and worker nodes can join the swarm using the command
```
docker swarm join --token JOIN_TOKEN LEADER_NODE_IP_ADDRESS
```
You can now start the minitwit stack
```
docker stack deploy minitwit -c PATH_TO_COMPOSE_FILE
```
That's it! The application should now be available on all the node IP addresses.

### Extra docker swarm help
From the leader node, you should see that your manager and worker nodes have joined
```
docker node ls
```
The minitwit stack should now be running. You can check it with 
```
docker service ls
```
You can also check which nodes the services are running on with 
```
docker service ps SERVICE_NAME
```
A service can be replicated `N` times with
```
docker service scale SERVICE_NAME=N
```
To update an existing service, you can update your local image and update the service 
```
docker pull IMAGE_NAME
docker service update SERVICE_NAME --image IMAGE_NAME
```


## Secrets
Secrets are configured in `/secrets/` folder. This folder should share the same structure as [`/secrets_template/`](/secrets_template/). The easiest way of setting it up is running 
```
cp secrets_template secrets
```
and then filling out the secrets files.
```
secrets
├── ca-certificate.crt
├── db_connectionstring.json
└── tf_secrets
```
[`ca-certificate.crt`](/secrets_template/ca-certificate.crt) and [`db_connectionstring.json`](/secrets_template/db_connectionstring.json) are both related to the database connection in [`utils/db.js`](/utils/db.js). [`tf_secrets`](/secrets_template/tf_secrets) is for defining relevant environment variables needed for Terraform's configuration.


## Terraform
To manage our infrastructure, we use _Terraform_. To use this, start by [installing the cli](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli). The Terraform files describe a setup with a _leader_, two _managers_, and three _workers_. The leader initializes the _docker swarm_, and the rest of the nodes join it in their respective roles. This is all described in [`minitwit_swarm.tf`](/terraform/minitwit_swarm.tf). 

### Terraform secrets
To use Terraform, you will need to fill out the secrets seen in [`tf_secrets`](/secrets_template/tf_secrets). Start by setting up your `/secrets` folder (see the section on [_secrets_](#secrets)), and then fill out 
* `TF_VAR_do_token` - Your Digital Ocean [personal access token](https://docs.digitalocean.com/reference/api/create-personal-access-token/)
* `SPACE_NAME` - Name of the [Digital Ocean space](https://www.digitalocean.com/products/spaces), where the Terraform state file is stored
* `STATE_FILE` - The name of the state file
* `AWS_ACCESS_KEY_ID` - The ID of the access key to the space
* `AWS_SECRET_ACCESS_KEY` - The key to the space 

#### SSH keys for Terraform
Terraform needs ssh-keys to communicate with Digital Ocean. Create ssh-keys with 
```
mkdir ssh_key && ssh-keygen -t rsa -b 4096 -q -N '' -f ./ssh_key/terraform
```
Copy them into the [`/terraform`](/terraform/) folder as well. Not sure if this is necessary but better safe than sorry
```
cp -r ssh_key terraform
```

### Quickstart
To quickly build the infrastructure, run [`bootstrap.sh`](/bootstrap.sh) from the root of the project
```
bash bootstrap.sh
```
This script should handle all the necessary steps to manage the infrastructure. In short, it:
1. Configures all the necessary environment variables
2. Uses Terraform to create infrastructure and configure docker swarm
   1. Initializes Terraform
   2. Validates the Terraform configuration 
   3. Applies the Terraform plan
3. Copies necessary files to the swarm leader, and deploys the minitwit stack

#### Configure manually
To deploy the entire setup from scratch, start by defining necessary environment variables from the [`tf_secrets`](/secrets_template/tf_secrets) file. 
```
source secrets/tf_secrets
```

Now you can initialize your Terraform
```
terraform -chdir=./terraform init \
    -backend-config "bucket=$SPACE_NAME" \
    -backend-config "key=$STATE_FILE" \
    -backend-config "access_key=$AWS_ACCESS_KEY_ID" \
    -backend-config "secret_key=$AWS_SECRET_ACCESS_KEY"
```

Check that everything looks good
```
terraform -chdir=./terraform validate
```

You can apply the Terraform plan with
```
terraform -chdir=./terraform apply
```
This will display all the steps Terraform will take to reach the desired state through its plan, which you will have to approve. To auto approve it, use the flag `-auto-approve`. Once this is done, it should have started all the necessary droplets, configured with a swarm leader that the managers and workers join. You can ssh into the leader node with 
```
ssh -i ssh_key/terraform root@$(terraform -chdir=./terraform output -raw minitwit-swarm-leader-ip-address)
```

From within the leader node, you can deploy the entire stack using [`docker stack deploy`](https://docs.docker.com/reference/cli/docker/stack/deploy/)
```
docker stack deploy minitwit -c compose/compose.swarm.yaml
```

Now you're done! Deploying creates multiple services, which can be interacted with from the swarm leader using [`docker service`](https://docs.docker.com/reference/cli/docker/service/).


## Running simulator
Running locally, the simulator is done through the Python3 file `minitwit_simulator.py` located in `/API/simulator/`.
The easiest way of running the simulator is running 
```
cd API/simulator
python3 minitwit_simulator.py http://localhost:5001
```


## Monitoring
Monitoring of MiniTwit is handled as an external service with `Prometheus` and visualized with `Grafana`, and can be found [here](https://github.com/group-o-minitwit-2024/MiniTwit-monitoring). It connects to `minitwit` and `minitwit-api` on the server ip address in production, or through the docker network `prom_net` in development. 


## Linting
### Javascript linting
For linting `.js` files, we use `eslint`. This runs as a github actions workflow to lint all javascript files. 

#### Lint locally
To lint locally, install the correct version with 
```
npm install eslint@8.57.0
```

Run lint checking with
```
npx eslint FILE_NAME
```
Use `--fix` flag for applying lint changes to file.

### Dockerfile linting
For linting dockerfiles, we use [_Hadolint_](https://github.com/hadolint/hadolint). It is _"a smarter Dockerfile linter that helps you build best practice Docker images"_. This linter runs as a GitHub Action on all pushes with files matching path `**/Dockerfile*`. An online version of the linter can be accessed [here](https://hadolint.github.io/hadolint/).


## What are we missing?
| # | Date | Time | Lecturer | Preparation | Topic | Exercises | Project Work | Done? | Notes |
|---|------|------|----------|-------------|-------|-----------|--------------|-------|-------|
| 1 | 2/2 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_01/README_PREP.md) | [Project start, forming groups, SSH, SCP, and Bash](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_01/Slides.md) | | [Refactor _ITU-MiniTwit_ to work on modern system](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_01/README_TASKS.md) | ✅ |
| 2 | 9/2 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_02/README_PREP.md) | [Packaging applications, Containerization with Docker](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_02/Slides.md) | [Using Docker](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_02/README_EXERCISE.md) | [Refactor _ITU-MiniTwit_ in another programming language and tech. stack](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_02/README_TASKS.md) | ✅ |
| 3 | 16/2 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_03/README_PREP.md) | [Provision of local and remote virtual machines](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_03/Slides.md) | [Using Vagrant, VirtualBox, and DigitalOcean](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_03/README_EXERCISE.md) | [Continue refactoring, deployment of your _ITU-MiniTwit_ to a remote server.](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_03/README_TASKS.md) | ✅ |
| 4 | 23/2 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_04/README_PREP.md) | [*Guest Lecture: What is DevOps? (Eficode)*](https://ituniversity.sharepoint.com/:b:/r/sites/2024DevOpsSoftwareEvolutionandSoftwareMaintenance9/Shared%20Documents/General/Guest%20Lectures/DevOps%20Culture%20and%20Agile%20Mindset-%20ITU.pdf?csf=1&web=1&e=QbXdrP), [Continuous Integration (CI), Continuous Delivery (CD), and Continuous Deployment](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_04/Slides.md) | [Using GitHub Actions CI (*Simulator test*)](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_04/README_EXERCISE.md) | [Continue refactoring, Setup CI & CD for reproducible builds, tests, delivery, and deployment](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_04/README_TASKS.md) | 🛠️ | CI/CD pipeline needs more work [#19](https://github.com/group-o-minitwit-2024/MiniTwit/issues/19) [#33](https://github.com/group-o-minitwit-2024/MiniTwit/issues/33)|
| 5 | 1/3 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_05/README_PREP.md) | [What is DevOps and configuration management](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_05/Slides.md) | | [Cleaning and polishing of your _ITU-MiniTwit_, introduction of DB abstraction layer, and entering maintenance (*Simulator starts*)](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_05/README_TASKS.md) | ❌ | Need to **1. introduce db abstraction layer [#46](https://github.com/group-o-minitwit-2024/MiniTwit/issues/46)** and **2. Consider how much we as a group adhere to the "Three Ways" [#47](https://github.com/group-o-minitwit-2024/MiniTwit/issues/47)** |
| 6 | 8/3 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_06/README_PREP.md) | [Monitoring](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_06/Slides.md) | [Using Prometheus and Grafana](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_06/README_EXERCISE.md) | [Add monitoring to your _ITU-MiniTwit_ and peer-review](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_06/README_TASKS.md) | 🛠️ | The basic infrastructure is there but it needs to track and visualize relevant information, and we need to expose our dashboard |
| 7 | 15/3 | 10:00 - 14:00 | Mircea | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_08/README_PREP.md) | [Logging, and Log Analysis](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_08/Slides.md) | [A Basic EFK Stack](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_08/README_EXERCISE.md) | [Add logging to your _ITU-MiniTwit_ and UI Testing Each Others Systems](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_08/README_TASKS.md) | ❌ | We have no logging [#32](https://github.com/group-o-minitwit-2024/MiniTwit/issues/32) or UI testing [#48](https://github.com/group-o-minitwit-2024/MiniTwit/issues/48)|
| 8 | 22/3 | 10:00 - 14:00 | Helge | [Prep. material](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_07/README_PREP.md) | [Software Quality, Maintainability & Technical Debt](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_07/Slides.md) | [Understand tests and SonarQube Quality Model.](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_07/README_EXERCISE.md) | [Enhancing CI/CD setup with test suite and static code analysis](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_07/README_TASKS.md) | 🛠️ | We have some |
| 9 | 5/4 | 10:00 - 14:00 | Mircea | | [Availability](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_10/Slides.md) | [A Basic Swarm](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_10/README_EXERCISE.md) | [Isolate components into services/containers/VMs](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_10/README_TASKS.md) | ❌ | Our app is an entangled spaghetti mess |
| 10 | 12/4 | 10:00 - 14:00 | Mircea | | Workshop | [Advanced Availability](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_12/Slides.md) | Continue isolation of components into services/containers/VMs and Fix reported problems | |
| 11 | 19/4 | 10:00 - 14:00 | Mircea | | [Security](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_09/Slides.md) | [Pentesting](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_09/README_EXERCISE.md) | [Security Hardening](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_09/README_TASKS.md) |
| 12 | 26/4 | 10:00 - 14:00 | Mircea | | *Guest Lecture:* Albert, "MiniTwit on Kubernetes" [Infrastructure as Code](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_12/IaC.pdf) | [MiniTwit Infrastructure as Code](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_12/README_EXERCISE.md) | [Encode your infrastructure setup](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_12/README_TASKS.md) |
| 13 | 3/5 | 10:00 - 14:00 | Mircea & Helge | | *Guest Lecture*, [Documentation of Systems and Projects](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_13/Architectural_Documentation.pdf) | | *Simulator stops*. Write report. |
| 14 | 10/5 | 10:00 - 14:00 | Mircea & Helge | | [Exam prep., Thesis topics, Evaluation, Cookies :)](https://github.com/itu-devops/lecture_notes/blob/master/sessions/session_14/Slides.md) | | Write report. |
