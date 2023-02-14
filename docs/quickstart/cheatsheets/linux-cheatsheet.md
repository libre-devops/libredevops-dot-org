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
#!/usr/bin/env bash
sudo cp *.crt /usr/local/share/ca-certificates/
sudo cp *.crt /etc/ssl/certs
mkdir -p ~/.local/share/ca-certificates/ && cp *.crt ~/.local/share/ca-certificates/ 
update-ca-certificates
```

### Configure Python PIP conf
```
#!/usr/bin/env bash

```

### Install GitHub CLI
```
#!/usr/bin/env bash
type -p curl >/dev/null || sudo apt install curl -y
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y
```

### Set WSL workspaces
```
ln -s /mnt/c/Users winusers
ln -s /mnt/C/Users/craig winhome
ln -s /mnt/C/Users/craig/craig-workspace craig-worksppace
ln -s /mnt/C/Users/craig/Desktop windesktop
```

### Install Pyenv on Ubuntu
```
#!/usr/bin/env bash
sudo apt-get install -y \
git \
build-essential \
gcc \
make \
python3-pip \
python3-tk && \
git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc && \
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
echo 'eval "$(pyenv init -)"' >> ~/.bashrc && \
echo 'export PATH=$HOME/.local:$PATH' >> ~/.bashrc && \
echo 'export PATH=$HOME/.pyenv:$PATH' >> ~/.bashrc && \
echo 'export PATH=$HOME/.pyenv/bin:$PATH' >> ~/.bashrc

```

## Fedora/RHEL

### Update CA Certificates on Fedora
```
#!/usr/bin/env bash

sudo dnf install -y ca-certificates
sudo cp *.crt /etc/pki/ca-trust/source/anchors/
mkdir -p ~/.pki/nssdb/ && cp *.crt  ~/.pki/nssdb/
update-ca-trust
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
