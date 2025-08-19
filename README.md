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
- `INGRAZZIO_HOST` (default `https://ingrazzio-for-gitlab.labs.jb.gg`): URL of Ingrazzio service used by Junie.
- `INGRAZZIO_TOKEN` (required): Token for Ingrazzio.
- `GITLAB_HOST` (default `https://gitlab.com`): Your GitLab host.
- `GITLAB_IGNORE_CERTIFICATE_ERRORS` (default `false`): Set to `true` to ignore SSL certificate errors when connecting to GitLab.
- `GITLAB_PIPELINE_CONFIGURATION_PATH` (default `.gitlab-ci.yml`): Path to the GitLab pipeline configuration file.

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

## Jira configuration
Prerequisites:
- The JetBrains Junie app is installed in Jira (by an application link).

1. Configure the Junie Jira app
   - You are a Jira administrator for the target Jira instance.
   - In Jira, go to: `Jira admin settings > Apps > JetBrains Junie Settings`
   - In Host, enter the base URL of your Junie GitLab service, e.g. `my-junite-gitlab-container-host.org`
   - Click Save Host
   - Under Repositories, add each GitLab repository you want Junie to work with:
     - Repository URL (e.g., `https://gitlab.com/owner/repo` or `https://gitlab.example.com/group/project`)
     - Access token (use the GitLab token created in the GitLab configuration section above)
   - Click Save Credentials

2. Use the Junie app on a Jira issue
   - Open the Jira issue
   - Click `View app actions`
   - Choose one of the repositories you configured earlier
   - Click `Delegate to Junie`
