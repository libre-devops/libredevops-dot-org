# Sort Terraform Variables in Alphabetical Order

Copy of script can be found [https://github.com/libre-devops/utils/blob/dev/scripts/terraform/tf-sort.sh](https://github.com/libre-devops/utils/blob/dev/scripts/terraform/tf-sort.sh)

The script takes arguments as inputs, or defaults to reordering a file called `input.tf` and will sort your terraform variables in alphabetical order

Here is some handy examples below with various use cases:

### Using curl with arguments
```shell
curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- variables.tf sorted-vars.tf
```

### Using wget with default behaviour
```shell
wget -O - https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash
```

### Using wget with output.tf instead of input
```shell
wget -O - https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- output.tf output.tf
```

## Create Aliases
You can also just make aliases to make this easier

### Sort input.tf
```shell
echo "alias stfi='curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- input.tf input.tf'" >> ~/.bashrc && source ~/.bashrc
```

### Sort output.tf
```shell
echo "alias stfo='wget -O - https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- output output.tf'" >> ~/.bashrc && source ~/.bashrc
```
Source: `{{ page.path }}`