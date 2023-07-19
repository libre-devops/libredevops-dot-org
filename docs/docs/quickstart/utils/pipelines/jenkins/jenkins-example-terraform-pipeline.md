# Terraform Pipeline for Jenkins

{% raw  %}
```groovy
pipeline {
    agent any

    parameters {
        string(name: 'environment', defaultValue: 'default', description: 'Workspace/environment file to use for deployment')

        string(name: 'version', defaultValue: '', description: 'Version variable to pass to Terraform')
        booleanParam(name: 'autoApprove', defaultValue: false, description: 'Automatically run apply after generating plan?')

        string(name: 'terraform_working_directory', defaultValue: 'terraform', description: 'The name of the state file blob')
        string(name: 'terraform_version', defaultValue: 'latest', description: 'Version of Terraform to be used')
        string(name: 'terraform_state_name', defaultValue: '${short}-${env}.terraform.tfstate', description: 'The name of the state file blob')
        string(name: 'terraform_compliance_path', defaultValue: 'git:https://github.com/craigthackerx/azure-terraform-compliance-naming-convention.git//?ref=main', description: 'The path to the terraform-compliance files')
        string(name: 'checkov_skipped_test', defaultValue: 'CKV_AZURE_116,CKV_AZURE_117,CKV_AZURE_137,CKV_AZURE_138,CKV_AZURE_139,CKV_AZURE_141,CKV_AZURE_145,CKV_AZURE_151,CKV_AZURE_33,CKV_AZURE_34,CKV_AZURE_35,CKV_AZURE_4,CKV_AZURE_44,CKV_AZURE_50,CKV_AZURE_7,CKV_AZURE_98,CKV2_AZURE_1,CKV2_AZURE_18,CKV2_AZURE_21,CKV2_AZURE_8', description: 'If you need to skip checkov tests, put them here')

        string(name: 'short', defaultValue: 'lbdo', description: 'The shorthand project name')
        string(name: 'env', defaultValue: 'dev', description: 'The shorthand stage for the project, for example, dev, tst, prd')
        string(name: 'loc', defaultValue: 'euw', description: 'The shorthand name for the location in Azure, for example, uks, ukw, euw')

        string(name: 'git_source_files', defaultValue: 'https://github.com/libre-devops/azure-terraform-jenkinsfile', description: 'The path to the terraform-compliance files')
    }

    environment {
        ARM_CLIENT_ID                   = credentials('ARM_CLIENT_ID')
        ARM_CLIENT_SECRET               = credentials('ARM_CLIENT_SECRET')
        ARM_TENANT_ID                   = credentials('ARM_TENANT_ID')
        ARM_SUBSCRIPTION_ID             = credentials('ARM_SUBSCRIPTION_ID')
        TERRAFORM_STORAGE_ACCOUNT_NAME  = credentials('TERRAFORM_STORAGE_ACCOUNT_NAME')
        TERRAFORM_BLOB_CONTAINER_NAME   = credentials('TERRAFORM_BLOB_CONTAINER_NAME')
        TERRAFORM_STORAGE_KEY           = credentials ('TERRAFORM_STORAGE_KEY')
    }

    stages {
        stage('Plan') {
            steps {
                script {
                    currentBuild.displayName = params.version
                }
                pwsh '''
                cd $Env:terraform_working_directory ; `

                pwd

                tfenv install $Env:terraform_version && tfenv use $Env:terraform_version
                New-Item -Path . -Name .terraform -ItemType "Directory" -Force ; `

                terraform init `
                -backend-config="storage_account_name=$Env:terraform_storage_account_name" `
                -backend-config="container_name=$Env:terraform_blob_container_name" `
                -backend-config="access_key=$Env:terraform_storage_key" `
                -backend-config="key=$Env:terraform_state_name" ; `

                Write-Output "$Env:env" > .terraform/environment ; `

                terraform workspace new "$Env:env" ; `
                terraform workspace select "$Env:env" ; `
                terraform validate ; `

                terraform plan -out pipeline.plan
                '''
            }
        }

        stage('Terraform-Compliance') {
            steps {
                script {
                    currentBuild.displayName = params.version
                }
                pwsh '''
                cd $Env:terraform_working_directory ; `

                pip3 install terraform-compliance ; `

                terraform-compliance -p pipeline.plan -f $Env:terraform_compliance_path
                '''
            }
        }

        stage('TFsec') {
            steps {
                script {
                    currentBuild.displayName = params.version
                }
                pwsh '''
                cd $Env:terraform_working_directory ; `

                if ($IsLinux)
                {
                brew install tfsec
                }
                elseif ($IsMacOS)
                {
                brew install tfsec
                }
                elseif ($IsWindows)
                {
                Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
                choco install tfsec -y
                }
                tfsec . --force-all-dirs
                '''
            }
        }

        stage('Checkov') {
            steps {
                script {
                    currentBuild.displayName = params.version
                }
                pwsh '''
                cd $Env:terraform_working_directory ; `

                pip3 install checkov ; `

                terraform show -json pipeline.plan > pipeline.plan.json ; `

                checkov -f pipeline.plan.json --skip-check $Env:checkov_skipped_test
                '''
            }
        }

        stage('Approval') {
            when {
                not {
                    equals expected: true, actual: params.autoApprove
                }
            }

            steps {
                script {
                    def plan = readFile 'pipeline.plan'
                    input message: "Do you want to apply the plan?",
                        parameters: [text(name: 'Plan', description: 'Please review the plan', defaultValue: plan)]
                }
            }
        }

        stage('Apply') {
            steps {
                pwsh '''
                cd $Env:terraform_working_directory ; `

                tfenv install $Env:terraform_version && tfenv use $Env:terraform_version
                New-Item -Path . -Name .terraform -ItemType "Directory" -Force ; `

                terraform init `
                -backend-config="storage_account_name=$Env:terraform_storage_account_name" `
                -backend-config="container_name=$Env:terraform_blob_container_name" `
                -backend-config="access_key=$Env:terraform_storage_key" `
                -backend-config="key=$Env:terraform_state_name" ; `

                Write-Output "$Env:env" > .terraform/environment ; `

                terraform workspace new "$Env:env" ; `
                terraform workspace select "$Env:env" ; `
                terraform validate ; `

                terraform plan -out pipeline.plan

                terraform apply pipeline.plan
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'pipeline.plan'
        }
    }
}
```
{% endraw  %}
