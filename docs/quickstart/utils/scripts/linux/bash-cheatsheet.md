# Bash Cheat Sheet

{% raw  %}

## Run Script in all dir and sub dirs (1 level deep)
```
#!/usr/bin/env bash


az vm image list --output table # Get sponsored VMs in Azure table format

set -xe
START=$(pwd)

# Executes script in each sub directory
for dir in $(find . -maxdepth 2 -mindepth 1 -type d); do
    cd $dir && \
    ./get-image-info.sh || echo "Script not in $dir, skipping"
    cd $START
done
```

## Set Strict Mode
```
#!/usr/bin/env bash
set -xeou pipefail
```

## Install homebrew
```
#!/usr/bin/env bash

echo -en "\n" | /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bash_profile && \
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc && \
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)" && \
    source ~/.bash_profile && source ~/.bashrc && \
    brew install gcc 
```

## Handy Bash Functions
```
print_success() {
    lightcyan='\033[1;36m'
    nocolor='\033[0m'
    echo -e "${lightcyan}$1${nocolor}"
}

print_error() {
    lightred='\033[1;31m'
    nocolor='\033[0m'
    echo -e "${lightred}$1${nocolor}"
}

print_alert() {
    yellow='\033[1;33m'
    nocolor='\033[0m'
    echo -e "${yellow}$1${nocolor}"
}

title_case_convert() {
    sed 's/.*/\L&/; s/[a-z]*/\u&/g' <<<"$1"
}

upper_case_convert() {
    sed -e 's/\(.*\)/\U\1/' <<< "$1"
}

lower_case_convert() {
    sed -e 's/\(.*\)/\L\1/' <<< "$1"
}

```

## PATH Cleaner
```
PATH=$(printf %s "$PATH" | awk -vRS=: -vORS= '!a[$0]++ {if (NR>1) printf(":"); printf("%s", $0) }' )
```

## Add something to path

```
echo "export PATH=$HOME/.local:$PATH" >> ~/.bashrc
```

## Terraform Aliases for bash
```
echo "alias stfi='curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- input.tf input.tf'" >> ~/.bashrc && source ~/.bashrc && \
echo "alias stfo='curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- output.tf output.tf'" >> ~/.bashrc && source ~/.bashrc
```

## Set arguemnents in script
```
#!/usr/bin/env bash
full_name="${1:-Craig Thacker}" // $firstarg
email_address="${2:-craigthackerx@gmail.com}" // $secondarg
```

### Example call
```
curl https://raw.githubusercontent.com/craigthackerx/craigthackerx-personal/dev/scripts/setup-bash.sh | bash -s -- '$firstarg' '$secondarg' >> ~/.bashrc && source ~/.bashrc

curl https://raw.githubusercontent.com/craigthackerx/craigthackerx-personal/dev/scripts/setup-bash.sh | bash -s -- 'Craig Thacker' 'craigthackerx@gmail.com' >> ~/.bashrc && source ~/.bashrc
```

## Setup Bash
```
curl https://raw.githubusercontent.com/craigthackerx/craigthackerx-personal/dev/scripts/setup-bash.sh | bash -s -- 'Craig Thacker' 'craigthackerx@gmail.com' >> ~/.bashrc && source ~/.bashrc
```

## Run something in each directory matching a name
```
#!/usr/bin/env bash

set -eou pipefail
back=$(pwd)
provider="${1:-azurerm}"
location="${2:-.}"
workspace=$(find "${location}" -maxdepth 1 -name "terraform-${provider}-*" -type d)

function stfi () {
    curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- input.tf input.tf
}

function stfo () {
    curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- output.tf output.tf
}

# Executes script in each sub directory
for dir in ${workspace}; do
    cd "${dir}" && \
    echo "${dir}"
    stfi && \
    stfo && \
    terraform fmt -recursive && \
    git add --all && git commit -m "Update module" && git push && git tag 1.0.0 --force && git push --tags --force
    cd "${back}"
done
```

## Quick Module update
```
cd terraform-module && terraform fmt -recursive && stfi && stfo && terraform-docs markdown . > docs.md && git a && git c -m "Update module" && git p && git tag 1.0.0 --force && git p --tags --force ; cd ..
```

```
cd terraform-module && terraform fmt -recursive && stfi && stfo && echo "```hcl" > README.md && cat terraform/build.tf >> README.md && echo "```" >> README.md && terraform-docs markdown . >> README.md && git a && git c -m "Update module" && git p && git tag 1.0.0 --force && git p --tags --force ; cd ..
```

## Run script as root one liner
```
#!/bin/bash

[ "$(whoami)" = root ] || { sudo "$0" "$@"; exit $?; }

```

## Install Podman on Ubuntu 22.04

```
#!/usr/bin/env bash
. /etc/os-release
echo "deb https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/testing/xUbuntu_${VERSION_ID}/ /" | sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:testing.list
curl -L "https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/testing/xUbuntu_${VERSION_ID}/Release.key" | sudo apt-key add -
sudo apt-get update -qq
sudo apt-get -qq -y install podman
```

## Install PowerShell Core on Ubuntu

```
#!/usr/bin/env bash

sudo apt-get update && sudo apt-get install -y wget apt-transport-https software-properties-common && \
wget -q "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb" && \
sudo dpkg -i packages-microsoft-prod.deb && \
sudo apt-get update && sudo apt-get install -y powershell && \
pwsh -Command Set-PSRepository -Name "PSGallery" -InstallationPolicy Trusted 
sudo pwsh -Command Install-Module -Name Az -Force -AllowClobber -Scope AllUsers -Repository PSGallery
```

## Install Docker (moby) on Ubuntu 22.04 with GitHub Runner Agent
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

## Prepare local terraform variables

```
echo 'export ARM_TENANT_ID="blah"' >> ~/.bashrc
echo 'export ARM_CLIENT_ID="blah"' >> ~/.bashrc
echo 'export ARM_CLIENT_SECRET="blah"' >> ~/.bashrc
echo 'export ARM_SUBSCRIPTION_ID="blah"' >> ~/.bashrc
echo 'export ARM_DEPLOY_LOCATION="uksouth"' >> ~/.bashrc
echo 'export ARM_ACCESS_KEY="blah"' >> ~/.bashrc
```

{% endraw  %}

Source: `{{ page.path }}`
