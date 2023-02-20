# Linux Cheat Sheet

{% raw  %}

## Generic


### Install homebrew
```
#!/usr/bin/env bash

echo -en "\n" | /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc && \
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && \
    source ~/.bashrc && \
    brew install gcc 
```

## Ubuntu

### Install Podman on Ubuntu 22.04

```
#!/usr/bin/env bash
sudo apt-get update -qq
sudo apt-get -qq -y install podman
```

## Set ubuntu as default shell or run shell from Windows
```
"wsl.exe" -d Ubuntu "bash"
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
### .gitconfig
```
[alias]
        a = add --all
        c = commit
        p = push
[core]
        editor = nano
[credential]
        helper = manager-core
[user]
        email = craigthackerx@gmail.com
        name = Craig Thacker
[filter "lfs"]
        process = git-lfs filter-process
        required = true
        clean = git-lfs clean -- %f
        smudge = git-lfs smudge -- %f
[credential "helperselector"]
        selected = manager-core
[credential "https://github.com"]
        helper =
        helper = !/usr/bin/gh auth git-credential
[credential "https://gist.github.com"]
        helper =
        helper = !/usr/bin/gh auth git-credential
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
pip config set global.cert ca.crt
echo 'export REQUESTS_CA_BUNDLE="ca.crt"'
```

### Setup Terraform environment variables
```
echo 'export ARM_TENANT_ID=""' >> ~/.bashrc
echo 'export ARM_CLIENT_ID=""' >> ~/.bashrc
echo 'export ARM_CLIENT_SECRET=""' >> ~/.bashrc
echo 'export ARM_SUBSCRIPTION_ID=""' >> ~/.bashrc
echo 'export ARM_DEPLOY_LOCATION=""' >> ~/.bashrc
echo 'export ARM_ACCESS_KEY=""' >> ~/.bashrc
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

### Install Keybase on Ubuntu
```
curl --remote-name https://prerelease.keybase.io/keybase_amd64.deb
sudo apt install ./keybase_amd64.deb
run_keybase
```

### Install JetBrains toolbox
```
#!/bin/bash

[ $(id -u) != "0" ] && exec sudo "$0" "$@"
echo -e " \e[94mInstalling Jetbrains Toolbox\e[39m"
echo ""
sudo apt-get install libfuse2

function getLatestUrl() {
USER_AGENT=('User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36')

URL=$(curl 'https://data.services.jetbrains.com/products/releases?code=TBA&latest=true&type=release' -H 'Origin: https://www.jetbrains.com' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.8' -H "${USER_AGENT[@]}" -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Referer: https://www.jetbrains.com/toolbox/download/' -H 'Connection: keep-alive' -H 'DNT: 1' --compressed | grep -Po '"linux":.*?[^\\]",' | awk -F ':' '{print $3,":"$4}'| sed 's/[", ]//g')
echo $URL
}
getLatestUrl

FILE=$(basename ${URL})
DEST=$PWD/$FILE

echo ""
echo -e "\e[94mDownloading Toolbox files \e[39m"
echo ""
wget -cO  ${DEST} ${URL} --read-timeout=5 --tries=0
echo ""
echo -e "\e[32mDownload complete!\e[39m"
echo ""
DIR="/opt/jetbrains-toolbox"
echo ""
echo  -e "\e[94mInstalling to $DIR\e[39m"
echo ""
if mkdir ${DIR}; then
    tar -xzf ${DEST} -C ${DIR} --strip-components=1
fi

chmod -R +rwx ${DIR}

ln -s ${DIR}/jetbrains-toolbox /usr/local/bin/jetbrains-toolbox
chmod -R +rwx /usr/local/bin/jetbrains-toolbox
echo ""
rm ${DEST}
echo  -e "\e[32mDone.\e[39m"
```

### Install Bitwarden
```
sudo snap install bitwarden # yes, really.
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
openssl \
libssl-dev \
zlib1g-dev \
libbz2-dev \
libreadline-dev \
libsqlite3-dev \
python-is-python3 \
wget \
curl \
llvm \
libncursesw5-dev \
xz-utils \
tk-dev \
libxml2-dev \
libxmlsec1-dev \
libffi-dev \
liblzma-dev
python3-pip \
unzip \
zip \
python3-tk && \
echo "done package installs" && \
git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc && \
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
echo 'eval "$(pyenv init -)"' >> ~/.bashrc && \
echo 'export PATH=$HOME/.local:$PATH' >> ~/.bashrc

```

### Install TFenv on Ubuntu
```
git clone --depth=1 https://github.com/tfutils/tfenv.git ~/.tfenv
echo 'export PATH=$PATH:$HOME/.tfenv/bin' >> ~/.bashrc
```

### Install Pkenv on Ubuntu
```
git clone https://github.com/iamhsa/pkenv.git ${HOME}/.pkenv && \
echo 'export PATH="${HOME}/.pkenv/bin:$PATH"' >> ${HOME}/.bashrc
```

### Install Goenv on Ubuntu
```
git clone https://github.com/syndbg/goenv.git ~/.goenv && \
echo 'export GOENV_ROOT="$HOME/.goenv"' >> ~/.bashrc && \
echo 'export PATH="$GOENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
echo 'eval "$(goenv init -)"' >> ~/.bashrc && \
echo 'export PATH="$GOROOT/bin:$PATH"' >> ~/.bashrc && \
echo 'export PATH="$PATH:$GOPATH/bin"' >> ~/.bashrc

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
bzip2-devel \
ncurses-devel \
libffi-devel \
sqlite-devel \
make \
gcc \
readline-devel \
python3-pip \
python3-tkinter \
xz-devel \
tk-devel \
git && \
echo "done package installs" && \
git clone https://github.com/pyenv/pyenv.git ~/.pyenv && \
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc && \
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
echo 'eval "$(pyenv init -)"' >> ~/.bashrc && \
echo 'export PATH=$HOME/.local:$PATH' >> ~/.bashrc
```

{% endraw  %}

Source: `{{ page.path }}`
