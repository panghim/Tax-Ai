# Release Checklist

Use this checklist before publishing a public release.

## Required

- [ ] `README.md` reflects the current framework scope.
- [ ] `docs/framework-architecture.md` matches `framework/moduleRegistry.ts`.
- [ ] `docs/collaboration-queue.md` has no stale Active tasks.
- [ ] `npm run check` passes locally.
- [ ] GitHub CI passes on the release PR.
- [ ] Release notes include status and known limitations.
- [ ] Tax policy or declaration claims are marked as prototype unless verified.

## Recommended for `v0.2.0`

- [ ] Public issues exist for the next framework tasks.
- [ ] Repository topics are configured on GitHub.
- [ ] A demo URL is added if deployment is available.
- [ ] The release tag is signed or created from a clean `main`.
- [ ] Release notes mention merged PRs #15, #17, #18, #19, #20, and #22.
- [ ] The release states that Tax AI remains a framework prototype, not production tax software.

## Release Note Template

```markdown
## Summary

## Added

## Changed

## Verification

## Known Limitations
```
