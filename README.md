# MiniTwit©️

Hello Mom 👋

## Project overview
This repo contains code for both the MiniTwit [`app`](/app/) and [`api`](/API/). [`utils`](/utils/) contains shared code, needed to run both services. It is not included in the services, so it needs be copied in their respective service folders. This can be done as 
```
cp -r ./utils ./app/src
cp -r ./utils ./API/src
```
Alternatively, run [`cp_shrd.sh`](/cp_shrd.sh) which does precisely this.

### Build and run project
The project is built and run using _Docker_. [`app`](/app/) and [`api`](/API/) both contain _Dockerfiles_ for building the respective services. To build first copy the shared files and then build, run [`build.sh`](/build.sh). 

To run the application, we use _docker compose_. Both services require a [_PostgresSQL_](https://www.postgresql.org/) database for storing data. When running in development mode, this database is run locally, whereas in production, it connects to an existing production database. To run til locally, first build the required _app_ and _API_ docker images (most easily done with [`build.sh`](/build.sh)).
```
docker build -t minitwit ./app
docker build -t minitwit-api ./API
```
Then, the entire stack can be run in development mode with 
```
docker compose -f compose.dev.yaml up
```

The _app_ runs on port 5000 and _api_ runs on 5001. 

### Run in production
To run the service in production, [`compose.prod.yaml`](/compose.prod.yaml) should be used. It uses bind volumes to access secrets required for running. 

#### Secrets
Secrets are configured in a `/secrets/`. This folder should share the same structure as [`/secrets_template/`](/secrets_template/). The easiest way of setting it up is running 
```
cp secrets_template secrets
```
and then filling out the secrets files.
```
secrets/
├── ca-certificate.crt
└── db_connectionstring.json
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
Write me

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
