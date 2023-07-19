# Terraform Pipeline for GitHub Actions

{% raw  %}
```yaml
name: 'Terraform Build'

#Build can only be ran manually or on PR to main
on:
  push:
    branches:
    - main
  pull_request:
    types: [closed]
  workflow_dispatch:

jobs:
  terraform:
    name: 'Terraform Build'
    runs-on: ubuntu-latest
    environment: tst
    env:
      PIPELINE_PLAN: "pipeline.plan"
      TERRAFORM_PATH: "terraform"
      SHORTHAND_PROJECT_NAME: "lbdo"
      SHORTHAND_ENVIRONMENT: "tst"
      SHORTHAND_LOCATION: "euw"
      TERRAFORM_COMPLIANCE_POLICY: "https://github.com/libre-devops/azure-naming-convention.git//?ref=main"
      TERRAFORM_STATE_NAME: "tst-build"


    # Use the Bash shell regardless whether the GitHub Actions runner is ubuntu-latest, macos-latest, or windows-latest
    defaults:
      run:
        shell: bash

    steps:
      - uses: hashicorp/setup-terraform@v1.2.1
      - uses: actions/checkout@v2

      # Initialize a new or existing Terraform working directory by creating initial files, loading any remote state, downloading modules, etc.
      - name: Terraform Init & Plan
        working-directory: ./terraform
        run: |

          rm -rf .terraform && \
          mkdir -p .terraform && \

          terraform init \
          -backend-config="storage_account_name=${TF_VAR_AZURE_BACKEND_SA_NAME}" \
          -backend-config="access_key=${TF_VAR_AZURE_BACKEND_SA_KEY}" \
          -backend-config="container_name=${TF_VAR_AZURE_BACKEND_SA_CONTAINER_NAME}" \
          -backend-config="key=${TF_VAR_short}-${TF_VAR_env}-${TERRAFORM_STATE_NAME}.terraform.tfstate" && \

          printf '%s' "${TF_VAR_env}" > .terraform/environment && \

          terraform workspace select "${TF_VAR_env}" && \

          terraform plan -out ${PIPELINE_PLAN} && \

          terraform validate

        env:
          TF_VAR_short: ${{ env.SHORTHAND_PROJECT_NAME }}
          TF_VAR_env: ${{ env.SHORTHAND_ENVIRONMENT }}
          TF_VAR_loc: ${{ env.SHORTHAND_LOCATION }}
          TERRAFORM_STATE_NAME: ${{ env.TERRAFORM_STATE_NAME }}

          TF_VAR_AZURE_BACKEND_SA_NAME: ${{ secrets.SPOKESANAME }}
          TF_VAR_AZURE_BACKEND_SA_KEY: ${{ secrets.SPOKESAPRIMARYKEY }}
          TF_VAR_AZURE_BACKEND_SA_CONTAINER_NAME: ${{ secrets.SPOKESABLOBCONTAINERNAME }}

          ARM_CLIENT_ID: ${{ secrets.SPOKESVPCLIENTID }}
          ARM_CLIENT_SECRET: ${{ secrets.SPOKESVPCLIENTSECRET }}
          ARM_TENANT_ID: ${{ secrets.SPOKESVPTENANTID}}
          ARM_SUBSCRIPTION_ID: ${{ secrets.SPOKESUBID }}

          TF_VAR_AZURE_CLIENT_ID: ${{ secrets.SPOKESVPCLIENTID }}
          TF_VAR_AZURE_CLIENT_SECRET: ${{ secrets.SPOKESVPCLIENTSECRET }}
          TF_VAR_AZURE_TENANT_ID: ${{ secrets.SPOKESVPTENANTID}}
          TF_VAR_AZURE_SUBSCRIPTION_ID: ${{ secrets.SPOKESUBID }}

      - name: Checkov GitHub Action
        uses: bridgecrewio/checkov-action@v12.641.0
        with:
          directory: ./terraform
          skip_check:

      - name: terraform-compliance
        uses: terraform-compliance/github_action@0.3.0
        with:
          plan: ${{ env.TERRAFORM_PATH}}/${{ env.PIPELINE_PLAN}}
          features: ${{ env.TERRAFORM_COMPLIANCE_POLICY}}


      # Initialize a new or existing Terraform working directory by creating initial files, loading any remote state, downloading modules, etc.
      - name: Terraform Apply
        working-directory: ./terraform
        run: |
          terraform apply -auto-approve ${PIPELINE_PLAN}
        env:
          TF_VAR_short: ${{ env.SHORTHAND_PROJECT_NAME }}
          TF_VAR_env: ${{ env.SHORTHAND_ENVIRONMENT }}
          TF_VAR_loc: ${{ env.SHORTHAND_LOCATION }}
```

### Using custom Action

```
name: 'Terraform Plan'

#Allow run manually or on push to main or in PR closure
on:
  workflow_dispatch:

jobs:
  azure-terraform-job:
    name: 'Terraform Build'
    runs-on: ubuntu-latest
    environment: tst

    # Use the Bash shell regardless whether the GitHub Actions runner is ubuntu-latest, macos-latest, or windows-latest
    defaults:
      run:
        shell: bash

    steps:
      - uses: actions/checkout@v3

      - name: Libre DevOps - Run Terraform for Azure - GitHub Action
        id: terraform-build
        uses: libre-devops/azure-terraform-gh-action@v1
        with:
          terraform-path: "terraform"
          terraform-workspace-name: "dev"
          terraform-backend-storage-rg-name: ${{ secrets.SpokeSaRgName }}
          terraform-backend-storage-account-name: ${{ secrets.SpokeSaName }}
          terraform-backend-blob-container-name: ${{ secrets.SpokeSaBlobContainerName }}
          terraform-backend-storage-access-key: ${{ secrets.SpokeSaPrimaryKey }}
          terraform-backend-state-name: "lbdo-dev-gh.terraform.tfstate"
          terraform-provider-client-id: ${{ secrets.SpokeSvpClientId }}
          terraform-provider-client-secret: ${{ secrets.SpokeSvpClientSecret }}
          terraform-provider-subscription-id: ${{ secrets.SpokeSubId }}
          terraform-provider-tenant-id: ${{ secrets.SpokeTenantId }}
          terraform-compliance-path: "git:https://github.com/craigthackerx/azure-terraform-compliance-naming-convention.git//?ref=main"
          checkov-skipped-tests: "CKV2_AZURE_8"
          run-terraform-destroy: "false"
          run-terraform-plan-only: "true"
```
{% endraw  %}
