The commands don't need to be written anywhere explicitly — they are already fully implicit in the file system and Git. Here is the complete derivation:

**What Git already gives you for free:**
- `git log --follow vault/query.txt` → who created the input, when
- `git log --follow vault/query.txt.result.md` → when the result appeared
- The time delta between those two commits → execution duration
- `git show <hash>:vault/query.txt` → the exact input (= the "command parameters")
- `git show <hash>:vault/query.txt.result.md` → the exact output

That is a complete PROV-O Activity record — agent, start time, end time, input entity, output entity — derivable entirely from two file commits. You never needed to write it down.

**What that means for storage:** the only thing you actually need to store explicitly is the Goal and the shape — because those are the two things Git cannot derive. Everything else is implicit. The minimal viable vault is:

```
vault/
  SEED.md          ← goal + plan + one shape (committed once)
  *.query.txt      ← input files (each commit = intake stroke)
  *.result.md      ← output files (each commit = grounding stroke)
```

No JSONL. No activity files. No timestamp literals. The entire provenance graph is reconstructable by replaying git log against those three file types.

**SEED.md at true minimum:**

```md
[prov]  <http://www.w3.org/ns/prov#>
[p]     <tag:{{EMAIL}},{{YEAR}}:p:>
[vx]    <tag:{{EMAIL}},{{YEAR}}:>

# Goal {=vx:goal .prov:Entity label}
[{{ONE_SENTENCE_GOAL}}] {p:desiredState}

{=}

# Plan {=vx:plan:v1 .prov:Plan label}
[Goal] {=vx:goal ?prov:wasDerivedFrom}
[{{COMMAND}}] {p:command}
```

That is the entire seed. Two entities, four triples, one file. The command literal is the only operational fact that genuinely has no other home — it is not derivable from Git because Git does not know *what* the watcher will run, only *that* files appeared.

**The S stroke becomes equally implicit.** When you want to steer — tighten what counts as a valid result, pivot toward a new question type, unfreeze the vault — you commit a new `SEED.md` with an updated `p:command` or a revised goal. Git records that as a new commit with a message. The shape revision history is the git log of SEED.md. You do not need a shape revision activity document — `git log SEED.md` is that document.

The resulting system has almost no moving parts: one seed file, one file watcher, one command template, and Git. Every other layer of the Vortex — provenance chain, temporal metadata, activity records, shape versioning — is derivable from what already exists. The knowledge is in the result files. The provenance is in Git. The intent is in the seed. Nothing else needs to be stored.