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
cd terraform-module && terraform fmt -recursive && stfi && stfo && terraform-docs markdown . > docs.md && git a && git c -m "Update module" && git p && git tag 1.0.0 --force && git p --tags --force
```
{% endraw  %}

Source: `{{ page.path }}`
