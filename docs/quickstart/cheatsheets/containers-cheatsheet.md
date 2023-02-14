# Containers Cheat Sheet

{% raw  %}

## Docker
### Install Docker (moby) on Ubuntu 22.04 with GitHub Runner Agent
```
#!/usr/bin/env bash

LSB_RELEASE=$(lsb_release -rs)

# Install Microsoft repository
wget https://packages.microsoft.com/config/ubuntu/$LSB_RELEASE/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.debbrew 
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Install Microsoft GPG public key
curl -L https://packages.microsoft.com/keys/microsoft.asc | apt-key add -

curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg

# update
sudo apt-get -yq update
sudo apt-get -yq dist-upgrade

# Check to see if docker is already installed
docker_package=moby
echo "Determing if Docker ($docker_package) is installed"
if ! IsPackageInstalled $docker_package; then
    echo "Docker ($docker_package) was not found. Installing..."
    sudo apt-get remove -y moby-engine moby-cli
    sudo apt-get update
    sudo apt-get install -y moby-engine moby-cli
    sudo apt-get install --no-install-recommends -y moby-buildx
    sudo apt-get install -y moby-compose
else
    echo "Docker ($docker_package) is already installed"
fi

# Enable docker.service
sudo systemctl is-active --quiet docker.service || sudo systemctl start docker.service
sudo systemctl is-enabled --quiet docker.service || sudo systemctl enable docker.service

# Docker daemon takes time to come up after installing
sleep 10
docker info

# Always attempt to logout so we do not leave our credentials on the built
# image. Logout _should_ return a zero exit code even if no credentials were
# stored from earlier.
docker logout

###########################################################################################################################################

USER="actions"
REPO="runner"
OS="linux"
ARCH="x64"
PACKAGE="tar.gz"
ACTIONS_URL="https://github.com/libre-devops/azdo-agent-scale-sets"
TOKEN="blah"

runnerLatestAgentVersion="$(curl --silent "https://api.github.com/repos/${USER}/${REPO}/releases/latest" | jq -r .tag_name)"
strippedTagRunnerAgentVersion="$(echo "${runnerLatestAgentVersion}" | sed 's/v//')" && \
runnerPackageUrl="https://github.com/${USER}/${REPO}/releases/download/${runnerLatestAgentVersion}/actions-runner-${OS}-${ARCH}-${strippedTagRunnerAgentVersion}.${PACKAGE}"
actionsPackageName="actions-runner-${OS}-${ARCH}-${strippedTagRunnerAgentVersion}.${PACKAGE}"
curl -o "${actionsPackageName}" -L "${runnerPackageUrl}"
tar xzf "${actionsPackageName}" && rm -rf "${actionsPackageName}"
./config.sh --url "${ACTIONS_URL}" --token "${TOKEN}" && \
./run.sh --unattended

```

### Jenkins Dockerfile
```dockerfile
FROM docker.io/jenkins/jenkins:lts

ENV NORMAL_USER jenkins

USER root

LABEL org.opencontainers.image.source=https://github.com/libre-devops/azure-terraform-jenkinsfile

ARG DEBIAN_FRONTEND=noninteractive
ENV DEBIAN_FRONTEND=noninteractive

#Install needed packages as well as setup python with args and pip
RUN apt-get update -y && apt-get dist-upgrade -y && apt-get install -y \
    apt-transport-https \
    bash \
    ca-certificates \
    curl \
    gcc \
    git  \
    sudo \
    software-properties-common \
    openssh-server \
    unzip \
    wget \
    zip  \
    zlib1g-dev && \
                useradd -m -s /bin/bash linuxbrew && \
                usermod -aG sudo linuxbrew &&  \
                mkdir -p /home/linuxbrew/.linuxbrew && \
                chown -R linuxbrew: /home/linuxbrew/.linuxbrew && \
    wget -q https://packages.microsoft.com/config/debian/$(grep -oP '(?<=^VERSION_ID=).+' /etc/os-release | tr -d '"')/packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y powershell

#Set User Path with expected paths for new packages
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/local/go/bin:/usr/local/go:/usr/local/go/dev/bin:/usr/local/bin/python3:/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.local/bin:/var/jenkins_home:${PATH}"
RUN echo $PATH | tee /etc/environment

USER linuxbrew

RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/linuxbrew/.bash_profile && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/linuxbrew/.bashrc && \
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

RUN brew install tfsec python3 tfenv tree
RUN pip3 install terraform-compliance checkov azure-cli && \
    tfenv install latest

RUN echo 'alias powershell="pwsh"' >> ~/.bashrc

USER root

RUN chown -R ${NORMAL_USER} $(brew --prefix)/*

USER ${NORMAL_USER}

RUN echo 'alias powershell="pwsh"' >> ~/.bashrc
```

## Docker-Compose

## Podman

### HTTP Reverse Proxy with Podman endpoints
```nginx
events
{
	worker_connections 4096;
}

http
{

	upstream gitea
	{
		server 127.0.0.1:3000 fail_timeout=0;
	}

	upstream jenkins
	{
		server 127.0.0.1:8080 fail_timeout=0;
	}

	upstream nexus
	{
		server 127.0.0.1:8081 fail_timeout=0;
	}
	server
	{
		listen 80;
		server_name gitea.libredevops.org;
		location /
		{
			proxy_pass http://gitea;
			proxy_http_version 1.1;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
		}
	}
	server
	{
		listen 80;
		server_name jenkins.libredevops.org;
		location /
		{
			proxy_pass http://jenkins;
			proxy_http_version 1.1;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
            proxy_request_buffering off;

            # Required for HTTP-based CLI to work over SSL
            proxy_buffering off;

            # workaround for https://issues.jenkins-ci.org/browse/JENKINS-45651
            add_header 'X-SSH-Endpoint' 'jenkins.libredevops.org:50022' always;
		}
	}
	server
	{
		listen 80;
		server_name nexus.libredevops.org;
		location /
		{
            proxy_pass http://nexus;
			proxy_http_version 1.1;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
		}
	}
}
```

### Podman Pod Create
```
#!/usr/bin/env bash

set -xe

POD_NAME="services"

podman pod create "${POD_NAME}"
#-p 1222:22/tcp \
#50001:50001/tcp \
#8080:8080/tcp \
#3000:3000/tcp \
#3222:22/tcp \
#5432:5432/tcp \
#8081:8081/tcp

podman create \
--name=jenkins \
--pod ${POD_NAME} \
-e ACCEPT_EULA=Y \
-e JENKINS_SLAVE_AGENT_PORT=50001 \
-v craig-workspace_jenkins_home:/var/jenkins_home \
--restart unless-stopped \
"docker.io/jenkins/jenkins:latest" && \

podman create \
--name=gitea \
--pod ${POD_NAME} \
-e USER_UID=1000 \
-e USER_GID=1000 \
-e APP_NAME=self-hosted \
-e REQUIRE_SIGNIN_VIEW=false \
-v gitea:/data \
-v /etc/localtime:/etc/localtime:ro \
--restart unless-stopped \
docker.io/gitea/gitea:latest && \

podman create \
--name=postgres-db \
--pod ${POD_NAME} \
-e POSTGRES_USER=gitea \
-e POSTGRES_PASSWORD=gitea \
-e POSTGRES_DB=gitea \
-v postgres:/var/lib/postgresql/data \
--restart unless-stopped \
docker.io/postgres:latest && \

podman create \
--name=nexus \
--pod ${POD_NAME} \
-v nexus-data:/nexus-data \
--restart unless-stopped \
docker.io/sonatype/nexus3

```


## Kubernetes

### Kubernetes Pod Yaml
```
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: services
  name: services
spec:
  containers:
  - env:
    - name: ACCEPT_EULA
      value: "Y"
    - name: JENKINS_SLAVE_AGENT_PORT
      value: "50001"
    image: docker.io/jenkins/jenkins:latest
    ports:
      - containerPort: 8080
      - containerPort: 1222
      - containerPort: 50001
    name: jenkins
    resources: {}
    securityContext:
      capabilities:
        drop:
        - CAP_MKNOD
        - CAP_NET_RAW
        - CAP_AUDIT_WRITE
    volumeMounts:
    - mountPath: /var/jenkins_home
      name: jenkins_home-pvc
  - args:
    - /bin/s6-svscan
    - /etc/s6
    env:
    - name: REQUIRE_SIGNIN_VIEW
      value: "false"
    - name: USER_UID
      value: "1000"
    - name: USER_GID
      value: "1000"
    - name: APP_NAME
      value: self-hosted
    image: docker.io/gitea/gitea:latest
    ports:
      - containerPort: 3000
      - containerPort: 3222
    name: gitea
    resources: {}
    securityContext:
      capabilities:
        drop:
        - CAP_MKNOD
        - CAP_NET_RAW
        - CAP_AUDIT_WRITE
    volumeMounts:
    - mountPath: /etc/localtime
      name: etc-localtime-host-0
      readOnly: true
    - mountPath: /data
      name: gitea-pvc
  - args:
    - postgres
    env:
    - name: POSTGRES_PASSWORD
      value: gitea
    - name: POSTGRES_DB
      value: gitea
    - name: POSTGRES_USER
      value: gitea
    image: docker.io/library/postgres:latest
    ports:
      - containerPort: 5432
    name: postgres-db
    resources: {}
    securityContext:
      capabilities:
        drop:
        - CAP_MKNOD
        - CAP_NET_RAW
        - CAP_AUDIT_WRITE
    volumeMounts:
    - mountPath: /var/lib/postgresql/data
      name: postgres-pvc
  - image: docker.io/sonatype/nexus3:latest
    ports:
      - containerPort: 8081
    name: nexus
    resources: {}
    securityContext:
      capabilities:
        drop:
        - CAP_MKNOD
        - CAP_NET_RAW
        - CAP_AUDIT_WRITE
    volumeMounts:
    - mountPath: /nexus-data
      name: nexus-data-pvc
  hostname: services
  restartPolicy: Never
  volumes:
  - name: jenkins_home-pvc
    persistentVolumeClaim:
      claimName: jenkins_home
  - hostPath:
      path: /etc/localtime
      type: File
    name: etc-localtime-host-0
  - name: gitea-pvc
    persistentVolumeClaim:
      claimName: gitea
  - name: postgres-pvc
    persistentVolumeClaim:
      claimName: postgres
  - name: nexus-data-pvc
    persistentVolumeClaim:
      claimName: nexus-data
status: {}

```
##.git config
```
[alias]
	a = add --all
	c = commit
	p = push
[core]
	editor = nano
[user]
	name = Craig Thacker
	email = craigthackerx@gmail.com
[credential "https://github.com"]
	helper = 
	helper = !/home/linuxbrew/.linuxbrew/Cellar/gh/2.22.1/bin/gh auth git-credential
[credential "https://gist.github.com"]
	helper = 
	helper = !/home/linuxbrew/.linuxbrew/Cellar/gh/2.22.1/bin/gh auth git-credential
[pull]
	rebase = true
```

{% endraw  %}

Source: `{{ page.path }}`
