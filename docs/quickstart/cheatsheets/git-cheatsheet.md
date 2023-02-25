# Git Cheat Sheet

{% raw  %}
### Terraform Aliases for bash
```
echo "alias stfi='curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- input.tf input.tf'" >> ~/.bashrc && source ~/.bashrc && \
echo "alias stfo='curl https://raw.githubusercontent.com/libre-devops/utils/dev/scripts/terraform/tf-sort.sh | bash -s -- output.tf output.tf'" >> ~/.bashrc && source ~/.bashrc
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

{% endraw  %}

Source: `{{ page.path }}`
