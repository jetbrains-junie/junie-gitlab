# GitLab CLI Wrapper

Wrapper for Junie CLI for GitLab environment.

## Setup

Before using this it's necessary to set a few environment variables in a current GitLab project:

+ `JUNIE_API_KEY` – a permanent Junie API key. May be found at [https://junie.jetbrains.com/cli](https://junie.jetbrains.com/cli)
+ `GITLAB_TOKEN_FOR_JUNIE` - GitLab API token with `api` and `write_repository` scopes.
If you use the auto-cleanup feature (see below), you'll need to set its role to "Owner" (otherwise it won't be able to delete finished jobs).

> If you're using GitLab 17.1+ (especially if it's gitlab.com – probably it will also be necessary to manually allow setting pipeline variables: open "CI/CD Settings" -> "Variables" and make sure that NOT the option "No one allowed" is chosen there)

When all the variables are set, you can add a `.gitlab-ci.yml` file:

+ If you don't have one yet, you can use [our template](./script-sample.yaml)
+ If you have one, just add the stages `junie-init` and `junie-run` from [our template](./script-sample.yaml)

### Additional parameters

For the stage `junie-run` you can also set the following environment variables to customize the behavior:

| Variable                    | Default value | Description                                                              |
|-----------------------------|---------------|--------------------------------------------------------------------------|
| `JUNIE_BOT_TAGGING_PATTERN` | junie         | RegExp for a bot's name for mentioning Junie                             |
| `JUNIE_VERSION`             | `null`        | Version of Junie CLI to use. If is not set – the latest one will be used |
| `JUNIE_MODEL`               | `null`        | Specific Junie model to use (e.g., `claude-sonnet-4-5-20250929`)         |
| `USE_MCP`                   | `false`       | Enable GitLab MCP tools for inline code review comments                  |


## Commands

### `init`

Initializes Junie CLI in this repository.
This job will generate a new webhook that triggers a pipeline to handle users' requests to Junie.
Normally it must be executed once per repository.

**Options:**
- `-V, --verbose` - Enable debug logging (default: false)


### `run`

Run Junie CLI.

**Options:**
- `-C, --cleanup` - Auto clean-up (delete finished jobs) after idle run (default: false)
- `-V, --verbose` - Enable debug logging (default: false)
- `-p, --prompt <prompt>` - Custom prompt for Junie execution
- `-M, --mr-mode <mode>` - Merge requests processing mode (choices: "append", "new", default: "new")
  - `append` - Append to existing merge requests by pushing changes to the same branch
  - `new` - Create new merge requests

**Code Review Feature:**

To trigger code review, you can either:
1. **Manual trigger**: Write "code-review" in a comment to a merge request (requires `junie-init` to be run first)
2. **Automatic trigger**: Configure a separate CI/CD job that runs on every MR update

When the "code-review" phrase is detected, Junie will:
- Get the Merge Request diff
- Review the code according to repository style and best practices
- Post inline comments with suggestions using GitLab MCP tools (if available)
- Provide a comprehensive review summary
