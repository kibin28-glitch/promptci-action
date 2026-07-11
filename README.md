# promptci-action

**Catch LLM prompt regressions before they merge — not after they ship.**

Every PR that touches a prompt runs your saved test cases against the last known-good baseline, right inside GitHub Actions. If the output quality drops, the check goes red and a comment shows exactly which case broke — the same way a unit test would catch a code regression, but for prompts.

Powered by [promptci](https://github.com/kibin28-glitch/prompt-ci-engine).

![promptci catching a regression](docs/assets/demo.svg)

## Usage

1. Commit your `promptci` baseline (`promptci snapshot` writes it to `.promptci/baseline/`) — a CI runner has no access to your local filesystem, so the baseline must live in the repo.
2. Add `OPENAI_API_KEY` as a repository secret (Settings → Secrets and variables → Actions).
3. Add `.github/workflows/promptci.yml`:

```yaml
on: [pull_request]
jobs:
  promptci:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: kibin28-glitch/promptci-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

If a prompt regresses, the job fails (so branch protection can block the merge) and a comment like this appears on the PR:

```
## promptci results

❌ **greeting** — FAILED (0/1 cases)
```

## Limitations

Because the workflow trigger is `on: [pull_request]`, GitHub Actions runs pull requests from forks with a read-only `GITHUB_TOKEN` and no access to repository secrets. This means `OPENAI_API_KEY` won't be available and the action can't post or update a PR comment for fork-originated pull requests — this is inherent to GitHub's security model, not a bug in this action.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `openai-api-key` | yes | — | OpenAI API key used to run the prompts |
| `promptci-token` | no | — | Personal [promptci dashboard](https://prompt-ci-dashboard.vercel.app) token. If set, results are uploaded and the PR comment includes a report link |
| `dashboard-url` | no | `https://prompt-ci-dashboard.vercel.app` | Dashboard to upload results to |
| `github-token` | no | `${{ github.token }}` | Token used to post/update the PR comment |

## License

MIT
