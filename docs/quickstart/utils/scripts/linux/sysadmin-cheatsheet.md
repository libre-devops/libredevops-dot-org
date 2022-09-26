# SysAdmin Cheat Sheet

{% raw  %}

## Docker-Compose.yml
```yaml
version: '3.8'

networks:
  podman-net:
    external: false

services:

  jenkins:
    build: ./jenkins
    image: "ghcr.io/libre-devops/jenkins-self-hosted:latest"
    container_name: jenkins
    restart: unless-stopped
    environment:
      - ACCEPT_EULA=Y
      - JENKINS_SLAVE_AGENT_PORT=50001
    networks:
      - podman-net
    ports:
      - "1222:22/tcp"
      - "50001:50001/tcp"
      - "8080:8080/tcp"
    volumes:
    - type: volume
      source: jenkins_home
      target: /var/jenkins_home

  gitea:
    image: "docker.io/gitea/gitea:latest"
    container_name: gitea
    restart: unless-stopped
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - APP_NAME=self-hosted
      - REQUIRE_SIGNIN_VIEW=false
    volumes:
      - gitea:/data
      - /etc/localtime:/etc/localtime:ro
    networks:
      - podman-net
    ports:
      - "3000:3000"
      - "3222:22"
    depends_on:
      - gitea-db

  gitea-db:
    image: "docker.io/postgres:latest"
    container_name: postgres-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea
      - POSTGRES_DB=gitea
    volumes:
      - postgres:/var/lib/postgresql/data
    networks:
      - podman-net
    ports:
      - "5432:5432"

  nexus:
    image: docker.io/sonatype/nexus3
    container_name: nexus
    volumes:
      - "nexus-data:/nexus-data"
    networks:
      - podman-net
    ports:
      - "8081:8081"

volumes:
  jenkins_home:
  gitea:
  postgres:
  nexus: {}
```

## Jenkins Dockerfile
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
# HTTPS Nginx reverse proxy with podman endpoints (Nginx running on host)
You can beautify your nginx config [here](https://nginxbeautifier.github.io/)

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
		listen 443 ssl;
		server_name gitea.libredevops.org;

		ssl_certificate /etc/nginx/ssl/fullchain.cer;
		ssl_certificate_key /etc/nginx/ssl/wildcard.libredevops.org.key;

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
			proxy_redirect http:// https://;
		}
	}
	server
	{
		listen 443 ssl;
		server_name jenkins.libredevops.org;

		ssl_certificate /etc/nginx/ssl/fullchain.cer;
		ssl_certificate_key /etc/nginx/gssl/wildcard.libredevops.org.key;

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
			proxy_redirect http:// https://;

			# Required for HTTP-based CLI to work over SSL
			proxy_buffering off;
			proxy_request_buffering off;

			# workaround for https://issues.jenkins-ci.org/browse/JENKINS-45651
			add_header 'X-SSH-Endpoint' 'jenkins.libredevops.org:50022' always;

		}
	}
	server
	{
		listen 443 ssl;
		server_name nexus.libredevops.org;

		ssl_certificate /etc/nginx/ssl/fullchain.cer;
		ssl_certificate_key /etc/nginx/ssl/wildcard.libredevops.org.key;

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
			proxy_redirect http:// https://;
		}
	}
}

```
# HTTP Reverse Proxy with Podman endpoints
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

## Podman Pod Create
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

## Kubernetes Pod Yaml
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

{% endraw  %}

Source: `{{ page.path }}`
