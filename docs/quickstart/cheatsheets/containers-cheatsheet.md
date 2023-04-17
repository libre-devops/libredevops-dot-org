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
## Install various SDKs on Ubuntu
```
#Use supplier image
FROM docker.io/ubuntu:latest

RUN rm -rf /bin/sh && cp /bin/bash /bin/sh
LABEL org.opencontainers.image.source=https://github.com/libre-devops/azdo-agent-containers

ARG DEBIAN_FRONTEND=noninteractive
ENV ACCEPT_EULA ${ACCEPT_EULA}

#Set args with blank values - these will be over-written with the CLI
ARG AZP_URL=https://dev.azure.com/Example
ARG AZP_TOKEN=ExamplePatToken
ARG AZP_AGENT_NAME=Example
ARG AZP_POOL=PoolName
ARG AZP_WORK=_work
ARG NORMAL_USER=azp
ARG USER_PASSWORD=azp

#Set the environment with the CLI-passed arguements
ENV AZP_URL ${AZP_URL}
ENV AZP_AGENT_NAME ${AZP_AGENT_NAME}
ENV AZP_POOL ${AZP_POOL}
ENV AZP_WORK ${AZP_WORK}
ENV NORMAL_USER ${NORMAL_USER}

#Set path vars
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt:/opt/bin:/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.local/bin:/home/${NORMAL_USER}/.pyenv:/home/${NORMAL_USER}/.pyenv/bin:/home/${NORMAL_USER}/.local:/home/${NORMAL_USER}/.tfenv:/home/${NORMAL_USER}/.tfenv/bin:/home/${NORMAL_USER}/.pkenv:/home/${NORMAL_USER}/.pkenv/bin:/home/${NORMAL_USER}/.goenv:/home/${NORMAL_USER}/.goenv/bin:/home/${NORMAL_USER}/.jenv:/home/${NORMAL_USER}/.jenv/bin:/home/${NORMAL_USER}/.nvm:/home/${NORMAL_USER}/.rbenv:/home/${NORMAL_USER}/.rbenv/bin:/home/${NORMAL_USER}/.sdkman:/home/${NORMAL_USER}/.sdkman/bin:/home/${NORMAL_USER}/.dotnet:/home/${NORMAL_USER}/.cargo:/home/${NORMAL_USER}/.cargo/bin:/home/${NORMAL_USER}/.phpenv:/home/${NORMAL_USER}/.phpenv/bin"
ENV PATHVAR="PATH=${PATH}"

ENV JAVA_HOME="/home/${NORMAL_USER}/.sdkman/candidates/java/current/bin/java"
ENV NVM_DIR="/home/${NORMAL_USER}/.nvm"
#Declare user expectation, I am performing root actions, so use root.
USER root

RUN mkdir -p /azp && \
    useradd -ms /bin/bash ${NORMAL_USER} && \
    usermod -aG sudo ${NORMAL_USER} && \
    echo "${NORMAL_USER}:${USER_PASSWORD}" | chpasswd && \
    chown -R ${NORMAL_USER} /azp && \
    mkdir -p /home/linuxbrew && \
    chown -R ${NORMAL_USER} /home/linuxbrew && \
    apt-get update -y && apt-get dist-upgrade -y && apt-get install -y \
    apt-transport-https \
    bash \
    build-essential \
    ca-certificates \
    curl \
    gcc \
    git \
    gnupg \
    gnupg2 \
    jq \
    libbz2-dev \
    libcurl4-gnutls-dev \
    libffi-dev \
    libjpeg-dev \
    liblzma-dev \
    libonig-dev \
    libpng-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    libxml2-dev \
    libyaml-dev \
    libzip-dev \
    make \
    openssl \
    pkg-config \
    python-is-python3 \
    python3-pip \
    python3-tk \
    python3-venv \
    sudo \
    unzip \
    wget \
    zip \
    zlib1g-dev && \
    curl -sSLo packages-microsoft-prod.deb https://packages.microsoft.com/config/ubuntu/$(grep -oP '(?<=^DISTRIB_RELEASE=).+' /etc/lsb-release | tr -d '"')/packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    rm -rf packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y powershell && \
    ln -sf /bin/pwsh /bin/powershell && \
    apt-get update && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    echo $PATHVAR > /etc/environment

USER ${NORMAL_USER}
WORKDIR /home/${NORMAL_USER}

# Install homebrew and gcc per recomendation
RUN echo -en "\n" | /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/${NORMAL_USER}/.bashrc && \
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && \
    brew install gcc

# Install Python
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
    # Fetch the latest stable version number of Python from python.org
    PYTHON_LATEST_VERSION=$(curl -s https://www.python.org/downloads/ | grep -oP 'Download Python \K[0-9.]+(?=<)' | head -n 1) && \
    PYTHON_MAJOR_VERSION=$(echo "$PYTHON_LATEST_VERSION" | cut -d '.' -f 1) && \
    PYTHON_MINOR_VERSION=$(echo "$PYTHON_LATEST_VERSION" | cut -d '.' -f 2) && \
    PYTHON_VERSION="${PYTHON_MAJOR_VERSION}.${PYTHON_MINOR_VERSION}" && \
    echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc && \
    echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
    echo 'eval "$(pyenv init -)"' >> ~/.bashrc && \
    echo 'export PATH=$HOME/.local:$PATH' >> ~/.bashrc && \
    source ~/.bashrc && \
    pyenv install ${PYTHON_VERSION} && \
    pyenv global ${PYTHON_VERSION}

# Install Terraform env
RUN git clone --depth=1 https://github.com/tfutils/tfenv.git ~/.tfenv && \
    echo 'export PATH=${HOME}/.tfenv/bin:${PATH}' >> ~/.bashrc  && \
    source ~/.bashrc && \
    tfenv install latest && \
    tfenv use latest

# Install Packer Env
RUN git clone https://github.com/iamhsa/pkenv.git ~/.pkenv && \
    echo 'export PATH="${HOME}/.pkenv/bin:${PATH}"' >> ~/.bashrc && \
    PACKER_LATEST_URL=$(curl -sL https://releases.hashicorp.com/packer/index.json | jq -r '.versions[].builds[].url' | egrep -v 'rc|beta|alpha' | egrep 'linux.*amd64'  | tail -1) && \
    PACKER_LATEST_VERSION=$(echo "$PACKER_LATEST_URL" | awk -F '/' '{print $6}' | sed 's/packer_//' | sed 's/_linux_amd64.zip//') && \
    source ~/.bashrc && \
    pkenv install ${PACKER_LATEST_VERSION} && \
    pkenv use ${PACKER_LATEST_VERSION}

# Install Ruby
RUN git clone https://github.com/rbenv/rbenv.git ~/.rbenv && \
    echo 'eval "$(~/.rbenv/bin/rbenv init - bash)"' >> ~/.bashrc && \
    source ~/.bashrc && \
    git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build && \
    RUBY_LATEST_VERSION=$(curl -s https://www.ruby-lang.org/en/downloads/ | grep -oP 'The current stable version is \K[0-9.]+' | sed 's/\.$//') && \
    rbenv install ${RUBY_LATEST_VERSION} && \
    rbenv global ${RUBY_LATEST_VERSION}

# Install Go
RUN git clone https://github.com/syndbg/goenv.git ~/.goenv && \
    echo 'export GOENV_ROOT="${HOME}/.goenv"' >> ~/.bashrc && \
    echo 'export PATH="${GOENV_ROOT}/bin:${PATH}"' >> ~/.bashrc && \
    echo 'eval "$(goenv init -)"' >> ~/.bashrc && \
    echo 'export PATH="${GOROOT}/bin:${PATH}"' >> ~/.bashrc && \
    echo 'export PATH="${PATH}:${GOPATH}/bin"' >> ~/.bashrc && \
    source ~/.bashrc && \
    GO_LATEST_VERSION=$(goenv install -l | grep -E -o '[0-9]+\.[0-9]+(\.[0-9]+)?' | tail -1) && \
    goenv install ${GO_LATEST_VERSION} && \
    goenv global ${GO_LATEST_VERSION}

RUN git clone https://github.com/phpenv/phpenv ~/.phpenv && \
    git clone https://github.com/php-build/php-build ~/.phpenv/plugins/php-build && \
    PHP_LATEST_VERSION=$(phpenv install -l | grep -E -v 'snapshot|dev|rc|alpha|beta' | tail -1) && \
    phpenv install ${PHP_LATEST_VERSION} && \
    phpenv global ${PHP_LATEST_VERSION}

# Install Dotnet SDK non-interactively
RUN curl -L dotnet-install.sh https://dot.net/v1/dotnet-install.sh | bash

# Install Rust non-interactively
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | bash -s -- -y

# Install NVM and Node.JS LTS
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    source ~/.bashrc && \
    nvm install --lts && \
    nvm use --lts \

# Install SDKMAN! since all Java venvs are annoying
RUN curl -s "https://get.sdkman.io" | bash && \
    source "$HOME/.sdkman/bin/sdkman-init.sh" && \
    MICROSOFT_LATEST_OPENJDK=$(sdk list java | grep ms | grep -E -o '[0-9]+\.[0-9]+\.[0-9]+-ms' | head -1) && \
    sdk install java ${MICROSOFT_LATEST_OPENJDK} && \
    sdk use java ${MICROSOFT_LATEST_OPENJDK}

COPY start.sh /home/${NORMAL_USER}/start.sh
RUN chmod 755 start.sh
CMD [ "./start.sh" ]

```

{% endraw  %}

Source: `{{ page.path }}`
