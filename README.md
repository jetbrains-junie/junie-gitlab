# Junie GitLab Application

## Docker Installation
1. Pull the Docker image:
   ```
   docker pull registry.jetbrains.team/p/matterhorn/public/junie-gitlab:latest
   ```

2. Run the container with the required environment variable:
   ```
   docker run -d \
     -e INGRAZZIO_TOKEN=your_token_here \
     -e GITLAB_HOST=gitlab_host \
     -p 8080:8080 \
     registry.jetbrains.team/p/matterhorn/public/junie-gitlab:latest
   ```


## Configuration
- `INGRAZZIO_TOKEN`: (Required) Your authentication token for the JetBrains Auth service
- `GITLAB_HOST`: (Required) Your organization's GitLab host (e.g., `https://gitlab.com`)
- `GITLAB_IGNORE_CERTIFICATE_ERRORS`: (Optional) Set to `true` to ignore SSL certificate errors when connecting to GitLab. Default is `false`.

## Repository preparation
1. Copy the file `.gitlab-ci.yml` to your project in GitLab

## GitLab configuration
1. Issue access token (`Project > Settings > Access token` or `User settings > Access tokens`)
   - Call the token `junie` to have autocompletion in the UI.
   - Scope: `api, read_api, read_repository, write_repository`
2. Configure a webhook on the GitLab side:
   - Go to Project > Settings > CI/CD > `Add new webhook`
   - Set URL pointing on your local (using reverse proxy, e.g. ngrok) or remote junie-gitlab instance: `https://HOST/api/public/gitlab/webhooks`
   - Enter your token to the `Secret token` field
   - Enable at least `Comment events`
