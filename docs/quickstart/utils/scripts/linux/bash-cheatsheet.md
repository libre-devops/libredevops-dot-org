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

{% endraw  %}

Source: `{{ page.path }}`