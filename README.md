# Junie GitLab Application

## Docker Installation

1. Pull the Docker image:
   ```
   docker pull registry.jetbrains.team/p/matterhorn/public/junie-gitlab:latest
   ```

2. Run the container with the required environment variable:
   ```
   docker run -d \
     -e JUNIE_API_KEY=your_token_here \
     -e GITLAB_HOST=gitlab_host \
     -p 8080:8080 \
     registry.jetbrains.team/p/matterhorn/public/junie-gitlab:latest
   ```

## Configuration

- `JUNIE_API_KEY`: (Required) Your authentication token for the Junie. Get token [here](https://junie.jetbrains.com/). 
- `GITLAB_HOST`: (Required) Your organization's GitLab host (e.g., `https://gitlab.com`)
- `GITLAB_IGNORE_CERTIFICATE_ERRORS`: (Optional) Set to `true` to ignore SSL certificate errors when connecting to
  GitLab. Default is `false`.
- `GITLAB_PIPELINE_CONFIGURATION_PATH`: (Optional) Path to the GitLab pipeline configuration file. Default is
  `.gitlab-ci.yml`.

## Repository preparation

1. Copy the file `.gitlab-ci.yml` to your project in GitLab

## GitLab configuration

1. Issue access token (`Project > Settings > Access token` or `User settings > Access tokens`). Role: `Owner`.
    - Call the token `junie` to have autocompletion in the UI like `@junie`.
    - Scope: `api, read_api, read_repository, write_repository`
2. Configure a webhook on the GitLab side:
    - Go to Project > Settings > CI/CD > `Add new webhook`
    - Set URL pointing on your local (using reverse proxy, e.g. ngrok) or remote junie-gitlab instance:
      `https://HOST/api/public/gitlab/webhooks`
    - Enter your token to the `Secret token` field
    - Enable at least `Comment events`

## Usages

Junie responds to mentions in comments. Use `@junie` (or mention the project bot user) to trigger the agent.

### In Issues

1. Open an Issue with a description of the task
2. Add a comment mentioning Junie: `@junie please implement this`
3. Junie will:
    - React with 👍 to confirm the request was received
    - Reply with "Hey, it's Junie by JetBrains! I started processing your request"
    - Run a CI pipeline to execute the task
    - Create a new Merge Request with the changes
    - Post a comment with a link to the created MR

### In Merge Requests

1. Open a Merge Request
2. Add a comment (general or on specific code lines) mentioning Junie: `@junie fix this`
3. Junie will:
    - React with 👍 to confirm the request was received
    - Reply with a processing notification
    - Run a CI pipeline to address the feedback
    - Create a new Merge Request with the fixes
    - Post a comment with a link to the created MR

### Tips

- You can mention Junie in code review comments on specific lines — Junie will understand the context
- Multiple comments in the same MR discussion are batched together
- The task description is taken from the Issue/MR description + your comment text
