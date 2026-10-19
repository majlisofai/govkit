# How to share configuration across repositories

This guide shows you how to keep one governance configuration (profile, brand, methods, frameworks, diagram styles and templates) in a central place, so that a change there applies to every repository that uses it.

## Create the organisation layer

1. Create a shared repository, for example `org-governance`, with a `profile.yaml`. Put in it only the keys that every repository shares:

    ```yaml title="org-governance/profile.yaml"
    govkit_profile: 1
    brand: acme
    organisation: { name: "Acme Authority", jurisdictions: [UAE] }
    methods: { risk: acme-risk-4x4 }
    frameworks:
      active: [iso-iec-42001, acme-ai-policy]
      primary: acme-ai-policy
    ```

2. Add any shared content beside it, using the same folder names as a project's `.govkit/`:

    ```text
    org-governance/
      profile.yaml
      brands/acme/brand.yaml
      brands/acme/assets/logo.svg
      diagram-styles/acme.yaml
      frameworks/acme-ai-policy.yaml
      methods/risk/acme-risk-4x4.yaml
      templates-custom/
    ```

3. Make the shared repository available to each project repository. A git submodule is the usual way:

    ```bash
    git submodule add https://github.com/acme/org-governance.git org-governance
    ```

## Point a repository at it

1. In the project repository, add `extends:` to `.govkit/profile.yaml`. The path is relative to the profile file, so from `.govkit/` it goes up one level:

    ```yaml title=".govkit/profile.yaml"
    govkit_profile: 1
    extends: ../org-governance/profile.yaml
    ```

2. Run `/govkit:profile show`. The **layer** column shows `extends` for every key that comes from the organisation profile.
3. Run `/govkit:apply` to publish the shared brand and re-render the ArcKit overrides.

## Override one key locally

If one repository needs a different value, set only that key in its own `.govkit/profile.yaml`. Lists replace, they do not merge. To add a framework, repeat the whole list:

```yaml title=".govkit/profile.yaml"
extends: ../org-governance/profile.yaml
frameworks:
  active: [iso-iec-42001, acme-ai-policy, nist-ai-rmf]
```

## Roll out a central change

1. Change the file in `org-governance` and merge it.
2. In each project repository, update the submodule and run `/govkit:apply`.

Artefacts written before the change keep their old content until you regenerate them.

See the [configuration layers reference](../reference/configuration-layers.md) for every path, and [about configuration layers](../explanation/configuration-layers.md) for why they work this way.
