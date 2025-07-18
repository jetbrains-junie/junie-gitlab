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
     -p 8080:8080 \
     registry.jetbrains.team/p/matterhorn/public/junie-gitlab:latest
   ```


## Configuration
- `INGRAZZIO_TOKEN`: (Required) Your authentication token for the JetBrains Auth service

## Repository preparation
1. Copy secret [.gitlab-ci.yml] to your project in GitLab

## GitLab configuration
1. Issue access token (`Project > Settings > Access token` or `User settings > Access tokens`)
2. Configure a pipeline on GitLab side: Project > Settings > CI/CD:
   - Open `Variables` section and add variables:
   - `APP_TOKEN` with your token as value (variable is protected, masked and hidden)
3. Configure a webhook on the GitLab side:
   - Go to Project > Settings > CI/CD > `Add new webhook`
   - Set URL pointing on your local (using reverse proxy, e.g. ngrok) or remote junie-gitlab instance: `https://HOST/api/public/gitlab/webhooks`
   - Enter your token to the `Secret token` field
   - Enabled at least Comment events
