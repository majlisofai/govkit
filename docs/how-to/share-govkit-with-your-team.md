# How to share GovKit with your team

This guide shows you how to set up a repository so that everyone who opens it in Claude Code gets ArcKit and GovKit automatically.

1. Create `.claude/settings.json` in the repository with the two marketplaces and both plugins enabled. You can copy [`examples/project-settings.json`](https://github.com/majlisofai/govkit/blob/main/examples/project-settings.json):

    ```json title=".claude/settings.json"
    {
      "extraKnownMarketplaces": {
        "arckit-claude": {
          "source": { "source": "github", "repo": "tractorjuice/arckit-claude" }
        },
        "majlisofai": {
          "source": { "source": "github", "repo": "majlisofai/govkit" }
        }
      },
      "enabledPlugins": {
        "arckit@arckit-claude": true,
        "govkit@majlisofai": true
      }
    }
    ```

2. If your team also uses ArcKit overlays, such as `arckit-uae`, add each one to `enabledPlugins` as `"<overlay>@arckit-claude": true`.
3. Commit `.claude/settings.json` together with `.govkit/profile.yaml`.
4. Ask a teammate to open the repository in Claude Code and run `/govkit:compat`. Every row should be PASS or WARN.

If several repositories should share one profile and brand, also [share configuration across repositories](share-configuration-across-repositories.md).
