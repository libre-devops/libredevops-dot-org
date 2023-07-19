# Clone all repos in a GitHub organisation

```shell
#!/usr/bin/env bash

org="libre-devops"

gh repo list ${org} --limit 1000 | while read -r repo _; do
  gh repo clone "$repo" "$repo"
done
```

Source: `{{ page.path }}`