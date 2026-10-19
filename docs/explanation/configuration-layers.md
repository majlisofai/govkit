# Configuration layers

Every GovKit setting and content file resolves through three layers: the project, the organisation and the built-ins. This page explains why there are three, and why they behave as they do.

## Choosing and defining are different jobs

GovKit separates two kinds of configuration:

- **Choosing** happens in the profile: which operating model, which scale, which frameworks, which brand.
- **Defining** happens in content files: what the scale's levels mean, what a framework's controls are, what the brand's colours are.

Most organisations only choose. They pick the built-in Three Lines model and the maturity scale, and their profile is a dozen lines. Organisations with their own risk matrix or policy framework also define. Because the definition is a data file with the same shape as the built-in one, they add it without writing code or forking GovKit.

## Why an organisation layer?

The project and built-in layers alone would work for one repository. Real organisations have many: one per programme, product or business unit. Governance is meant to be consistent across them. The same risk appetite, the same gates, the same house style.

Without a shared layer, every repository would hold its own copy, and the copies would drift. The organisation layer is a single place, usually a shared repository added as a submodule, that every project profile `extends:`. Change the risk matrix or the brand there, and every repository follows on its next run.

A project can still override any single key or file. That matters, because exceptions are real: a regulated programme may need a stricter scale than the rest of the organisation. The layering makes the exception visible, because `/govkit:profile show` reports which layer each value came from.

## Why first match wins, and lists replace

For content files, the most specific layer wins outright. GovKit doesn't merge a project's risk matrix with the built-in one. A half-merged method would be one that nobody wrote and nobody reviewed.

For profile keys, the layers merge key by key, but a list replaces the inherited list rather than appending to it. If lists merged, a project couldn't remove a framework the organisation activated, and the effective list would depend on reading every layer at once. Replacement means the list you see in a file is the whole list for that layer.

## Why the profile stays short

`/govkit:init` writes only the keys that differ from the defaults. A short profile is easier to review, because every line is a decision someone made. It also picks up improved defaults when GovKit is upgraded. A profile that copied every default would freeze them at the version it was written with.

## Why a missing id is an error

If a profile names a method or framework that resolves to no file, every command stops and lists the paths it checked. It could fall back to a default instead, but then an assessment might be quietly rated on the wrong scale. In governance, a wrong answer that looks right is worse than no answer.
