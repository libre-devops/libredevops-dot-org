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
```shell
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
{% endraw  %}

Source: `{{ page.path }}`
