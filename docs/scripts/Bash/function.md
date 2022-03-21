---
layout: default
title: Output
parent: Bash
grand_parent: Scripts
nav_order: 201
permalink: /scripts/bash/functions
---

```bash
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
  sed -e 's/\(.*\)/\L\1/' <<< "$1"
}

lower_case_convert() {
  sed -e 's/\(.*\)/\L\1/' <<< "$1"
}

```