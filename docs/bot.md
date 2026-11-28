# The Phantom Contributor — `devin-ai-integration[bot]`

*An incident report. November 2026. Status: root-caused.*

## Summary

On or about 2026-11-22, `devin-ai-integration[bot]` appeared in this
repository's contributor statistics with `1 commit`
(`49 additions, 18 deletions`). Investigation initially suggested an
orphaned, unreachable commit object — a far stranger story. The truth is
simpler and more instructive: **the "commit" was `4d94e7d "1.2.1 ready"`,
a normal commit on `main`, and the bot was credited through a
`Co-Authored-By:` trailer in its commit message.**

## Root cause

Commit `4d94e7de159c4e08c686fc4edd6b3ee165aeeaf1`:

```
Author: davay <davay@defucc.me>
Commit: davay <davay@defucc.me>

    1.2.1 ready

    Generated with [Devin](https://devin.ai)

    Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
```

GitHub parses `Co-Authored-By:` trailers and grants the named identity
full contributor status:

- The commit page renders **"davay42 and devin-ai-integration[bot]
  committed"** — two avatars, one commit.
- `GET /repos/davay42/mdld-parse/stats/contributors` counts the bot with
  `total: 1`, diff stats `49 ++ / 18 --` (the commit's own diff), in the
  week bucket for 2026-11-22.
- The author-filtered commits URL
  (`commits?author=devin-ai-integration[bot]`) shows nothing, because
  that filter matches commit *author*, not co-author — which made the
  entry look phantom.

There was never a second commit, a force-push, or an orphaned object.
Every anomaly — the missing commit, the stale-looking stats, the empty
collaborators list — is explained by co-author attribution.

## The investigation (for the record)

What was checked before the trailer was found:

- All refs, branches (`main`, `gh-pages`), 66 tags, PRs (none), and
  author/committer name+email pairs: no Devin-authored object exists.
- `git ls-remote origin`: only two heads, no pull refs.
- GitHub events API back to 2026-11-11: every push by `davay42` or
  `github-actions[bot]`; no bot push event.
- Push before/head chain on `main`: contiguous; every `deploy:` SHA on
  `gh-pages` is an ancestor of `main` — no history rewrite.
- `stats/contributors` proved the stats count the default branch only
  (`davay42 total = 544` = `git rev-list --count origin/main`), which
  implied the phantom commit "was on main and removed." It wasn't —
  co-authors count toward contributor stats without being authors.
- GitHub Support ticket: closed unassisted (free plan). Moot in
  hindsight — there was nothing to purge.

The lesson embedded in the failure: **absence of evidence in commit
listings is not evidence of an orphaned object.** Attribution surfaces
(author filters, contributor stats, co-author trailers) do not share the
same definition of "commit."

## Can it be evicted?

Yes — unlike a truly orphaned object, this is fixable, because the
attribution lives in a commit *message* on `main`:

1. Strip the `Co-Authored-By:` (and optionally `Generated with Devin`)
   trailer from `4d94e7d`.
2. Rewrite history from that point: 82 descendant commits get new SHAs.
3. Force-push `main`; re-point the 6 tags that contain `4d94e7d`
   (otherwise the old objects stay reachable via tags — harmless for
   contributor stats, which count `main` only, but the trailer survives
   in tag-reachable history).
4. Contributor stats will drop the bot on the next cache recompute.

Costs: all post-`4d94e7d` SHAs change; anyone with a clone must
re-fetch; `gh-pages` deploy messages referencing old SHAs become
historical labels only (they are message text, not pointers).

## Was it malicious?

Probably not — most likely a routine Devin session committing work with
the tool's default attribution trailer. But the mechanism is worth
naming: **AI coding agents stamp `Co-Authored-By:` trailers that GitHub
converts into permanent public contributor credit.** On repositories
where the owner cares about attribution, this is an unsolicited
advertisement rendered by the platform itself — authored by a tool, on
the owner's dime, in the owner's repo. The only defense is vigilance at
commit-message level (`git log --format='%(trailers)'`) or history
rewrites after the fact.

## What to do differently

- Audit commit trailers before pushing agent-generated work:
  `git log --format='%h %(trailers:key=Co-Authored-By,valueonly)'`
- Configure agent tooling to omit attribution trailers where unwanted.
- When a contributor entry looks impossible, check co-author trailers
  *before* concluding the object store is haunted.
