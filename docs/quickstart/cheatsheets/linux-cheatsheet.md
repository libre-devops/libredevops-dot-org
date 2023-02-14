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
#!/usr/bin/env bash
sudo apt-get install -y \

```

## Fedora/RHEL

### Update CA Certificates on Fedora
```
```

### Install Pyenv on Fedora
```
#!/usr/bin/env bash
sudo yum install \
zlib-devel \
bzip-devel \
ncurses-devel \
libffi-devel \
sqllite-devel \
make \
gcc \
readline-devel \
python3-pip \
python3-tkinter \
lz-devel \
tk-devel \
git 


```

{% endraw  %}

Source: `{{ page.path }}`
