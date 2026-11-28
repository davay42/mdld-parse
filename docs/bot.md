# The Phantom Contributor — `devin-ai-integration[bot]`

*An incident report. November 2026. Status: resolved.*

## Summary

On or about 2026-11-22, `devin-ai-integration[bot]` appeared in this
repository's contributor statistics with `1 commit`
(`49 additions, 18 deletions`). Investigation initially suggested an
orphaned, unreachable commit object — a far stranger story. The truth is
simpler and more instructive: **the "commit" was `4d94e7d "1.2.1 ready"`,
a normal commit on `main`, and the bot was credited through a
`Co-Authored-By:` trailer in its commit message.**

The trailer was removed by rewriting 84 commits of history. The surgery
is documented below, including its one permanent scar: six published npm
versions whose provenance pointers now resolve only through
`docs/sha-map.md`.

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
- `stats/contributors` counts the bot with `total: 1` and the commit's
  own diff stats (`49 ++ / 18 --`), in the 2026-11-22 week bucket.
- The author-filtered commits URL (`commits?author=...`) shows nothing,
  because that filter matches commit *author*, not co-author — which is
  what made the entry look phantom.

There was never a second commit, a force-push, or an orphaned object.
Every anomaly — the missing commit in author-filtered lists, the
statistical entry, the empty collaborators list — is explained by
co-author attribution.

## The investigation (for the record)

What was checked before the trailer was found:

- All refs, branches (`main`, `gh-pages`), 66 tags, PRs (none), and
  author/committer name+email pairs: no Devin-authored object exists.
- GitHub events API: every push by `davay42` or `github-actions[bot]`;
  no bot push event.
- Push before/head chain on `main`: contiguous; every `deploy:` SHA on
  `gh-pages` is an ancestor — no history rewrite had occurred.
- `stats/contributors` counts the default branch only (`davay42` total
  equaled `git rev-list --count origin/main` exactly), which implied a
  removed commit. It wasn't — co-authors count toward contributor stats
  without being authors.
- A GitHub Support ticket was filed and closed unassisted (free plan).
  Moot in hindsight — there was nothing to purge.

The lesson embedded in the failure: **absence of evidence in commit
author listings is not evidence of an orphaned object.** Attribution
surfaces (author filters, contributor stats, co-author trailers) do not
share the same definition of "commit."

## The surgery

Performed 2026-11-28, locally then pushed:

1. Froze both GitHub Actions workflows (`publish.yml`, `deploy.yml`),
   verified no agents/clones were active, took a folder backup plus a
   `git clone --mirror` object-level backup.
2. Rewrote `a330d90..main` (84 commits) via `git rebase -i --gpg-sign
   --committer-date-is-author-date`: `reword` on `4d94e7d` only, dropping
   both trailer lines; every commit re-signed with the owner's PGP key.
3. Verification harness asserted, position-by-position: identical trees,
   author dates, and subjects across all 84 rows; identical HEAD tree;
   zero content diff; zero surviving `devin` strings; all 84 signatures
   verify.
4. Re-pointed annotated tags `v1.2.1`–`v1.2.6` at the mapped commits,
   preserving tag messages and tagger dates.
5. Force-pushed `main` and the six tags while both workflows were
  disabled; re-enabled them; committed this documentation.
6. `v1.2.7` was then published normally — its provenance re-anchors
   cleanly into the rewritten history.

Old chain preserved locally at branch `pre-surgery` and in the mirror
backup. Full old→new SHA mapping: `docs/sha-map.md` (84 rows, every tree
byte-identical).

## The scar

npm provenance for `v1.2.1`–`v1.2.6` records `gitHead`/SLSA `gitCommit`
SHAs from the pre-rewrite chain. Those objects are now unreachable on
GitHub; the npm provenance panel shows *"This commit does not belong to
any branch on this repository, and may belong to a fork outside of the
repository."* The attestations remain cryptographically valid —
`npm audit signatures` is unaffected — but the human-clickable link is
degraded. An archived copy of the old chain was considered and
deliberately rejected; `docs/sha-map.md` plus `v1.2.7`'s clean
provenance was judged the better trade.

## Was it malicious?

Probably not — most likely a routine Devin session committing work with
the tool's default attribution trailer. But the mechanism deserves its
name: **AI coding agents stamp `Co-Authored-By:` trailers that GitHub
converts into permanent public contributor credit.** On repositories
where the owner cares about attribution, this is an unsolicited
advertisement rendered by the platform itself — authored by a tool, on
the owner's dime, in the owner's repo. The only defense is vigilance at
commit-message level or history rewrites after the fact.

## This is not a Devin-only pattern

The same mechanism has been observed with other agents. Commit trailers
such as:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

produce identical results: the named bot identity appears in the
repository's contributor list with credit for commits it never pushed,
never authored, and cannot be held accountable for. Any merged PR or
agent-assisted commit carrying such a trailer plants a permanent
advertisement in the owner's contributor graph. GitHub's attribution
model counts *trailers*; it does not verify who ran the tool, who
approved the merge, or whether the owner wanted the credit.

## What to do differently

- Audit commit trailers before pushing agent-generated work:
  `git log --format='%(trailers:key=Co-Authored-By,valueonly)'`
- Watch for `Co-Authored-By:` lines from *any* bot identity, not just
  the one that bit you — the pattern generalizes.
- When a contributor entry looks impossible, check co-author trailers
  *before* concluding the object store is haunted.
- For agent tooling: strip attribution trailers at commit time
  (`commit-msg` hook) or configure the agent to omit them.
