# Linux Cheat Sheet

{% raw  %}

## Generic

### Install homebrew
```
#!/usr/bin/env bash

echo -en "\n" | /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bash_profile && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc && \
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && \
    source ~/.bash_profile && source ~/.bashrc && \
    brew install gcc 
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


## Ubuntu

### Install Podman on Ubuntu 22.04

```
#!/usr/bin/env bash
. /etc/os-release
echo "deb https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/testing/xUbuntu_${VERSION_ID}/ /" | sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:testing.list
curl -L "https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/testing/xUbuntu_${VERSION_ID}/Release.key" | sudo apt-key add -
sudo apt-get update -qq
sudo apt-get -qq -y install podman
```

### Install PowerShell Core on Ubuntu

```
#!/usr/bin/env bash

sudo apt-get update && sudo apt-get install -y wget apt-transport-https software-properties-common && \
wget -q "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb" && \
sudo dpkg -i packages-microsoft-prod.deb && \
sudo apt-get update && sudo apt-get install -y powershell && \
pwsh -Command Set-PSRepository -Name "PSGallery" -InstallationPolicy Trusted 
sudo pwsh -Command Install-Module -Name Az -Force -AllowClobber -Scope AllUsers -Repository PSGallery
```

### Update CA Certificates on an Ubuntu host
```

```

### Install Pyenv on Ubuntu
```
```

## Fedora/RHEL

### Update CA Certificates on Fedora
```
```

### Install Pyenv on Fedora
```
```

{% endraw  %}

Source: `{{ page.path }}`
