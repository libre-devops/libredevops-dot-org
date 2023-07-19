# Nginx Examples

{% raw  %}


# HTTPS Nginx reverse proxy with podman endpoints (Nginx running on host)
You can beautify your nginx config [here](https://nginxbeautifier.github.io/)

```nginx
events
{
	worker_connections 4096;
}

http
{

	upstream gitea
	{
		server 127.0.0.1:3000 fail_timeout=0;
	}

	upstream jenkins
	{
		server 127.0.0.1:8080 fail_timeout=0;
	}

	upstream nexus
	{
		server 127.0.0.1:8081 fail_timeout=0;
	}
	server
	{
		listen 443 ssl;
		server_name gitea.libredevops.org;

		ssl_certificate /etc/nginx/ssl/fullchain.cer;
		ssl_certificate_key /etc/nginx/ssl/wildcard.libredevops.org.key;

		location /
		{
			proxy_pass http://gitea;
			proxy_http_version 1.1;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
			proxy_redirect http:// https://;
		}
	}
	server
	{
		listen 443 ssl;
		server_name jenkins.libredevops.org;

		ssl_certificate /etc/nginx/ssl/fullchain.cer;
		ssl_certificate_key /etc/nginx/gssl/wildcard.libredevops.org.key;

		location /
		{
			proxy_pass http://jenkins;
			proxy_http_version 1.1;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
			proxy_redirect http:// https://;

			# Required for HTTP-based CLI to work over SSL
			proxy_buffering off;
			proxy_request_buffering off;

			# workaround for https://issues.jenkins-ci.org/browse/JENKINS-45651
			add_header 'X-SSH-Endpoint' 'jenkins.libredevops.org:50022' always;

		}
	}
	server
	{
		listen 443 ssl;
		server_name nexus.libredevops.org;

		ssl_certificate /etc/nginx/ssl/fullchain.cer;
		ssl_certificate_key /etc/nginx/ssl/wildcard.libredevops.org.key;

		location /
		{
			proxy_pass http://nexus;
			proxy_http_version 1.1;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection "upgrade";
			proxy_redirect http:// https://;
		}
	}
}

```


{% endraw  %}

Source: `{{ page.path }}`
