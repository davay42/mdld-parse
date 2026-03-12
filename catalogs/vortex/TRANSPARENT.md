Git can absolutely carry timestamps and authorship safely — `git log --format="%H %aI %an"` gives you a cryptographically anchored, tamper-evident timestamp for every file, which is strictly more trustworthy than a datetime literal inside the file itself (the file can be edited; the commit cannot). The practical split is: **Git owns when and who, MDLD owns what and why**. So `prov:startedAtTime` and `prov:endedAtTime` can be dropped from the MDLD entirely and derived from git history at query time. `prov:wasAttributedTo` similarly comes from `git log`. What MDLD must still carry is everything Git cannot infer: the goal, the plan, the source URL, the rationale, and the shape. That is a dramatically smaller annotation burden.

The file-watcher architecture you described is a perfect minimal DIAD cycle. The base folder is the document intake zone, a new file appearing is the violation, the watcher is the agent trigger, and writing the result file closes the pressure loop. Here is the micro-DIADS seed:

```md
[prov]  <http://www.w3.org/ns/prov#>
[sh]    <http://www.w3.org/ns/shacl#>
[vx]    <tag:{{EMAIL}},{{YEAR}}:>
[p]     <tag:{{EMAIL}},{{YEAR}}:p:>

# Goal {=vx:goal .prov:Entity label}
[{{ONE_SENTENCE_GOAL}}] {p:desiredState}
[{{WHAT_FROZEN_LOOKS_LIKE}}] {p:frozenState}

{=}

# Plan v1 {=vx:plan:v1 .prov:Plan label}
[Goal] {=vx:goal ?prov:wasDerivedFrom}
[{{COMMAND_OR_TOOL_TO_RUN}}] {p:command}
[{{INPUT_PATTERN — e.g. *.query.txt}}] {p:watchPattern}
[{{OUTPUT_PATTERN — e.g. *.result.md}}] {p:outputPattern}

{=}

# Core Shape {=vx:shape:core .sh:NodeShape .prov:Entity label}
[Bootstrap] {=vx:activity:bootstrap !prov:generated}
[prov:Entity] {=vx:target:entity ?sh:targetClass}
[Source required] {=vx:prop:source ?sh:property}
[prov:hadPrimarySource — minCount 1 — every result file must cite its input] {p:constraint}

{=}

# Bootstrap Activity {=vx:activity:bootstrap .prov:Activity label}
[Plan v1] {=vx:plan:v1 ?prov:hadPlan}
[Seed file written] {p:status}
```

Three things to note. First, timestamps are intentionally absent — Git commits the seed file and every result file, so temporal provenance is handled there. Second, `p:command` and `p:watchPattern` are the only domain-specific facts the agent needs to read to know what to do: run this command when files matching this pattern appear, write output matching the output pattern. Third, the core shape has exactly one constraint — every result entity must cite its input as `prov:hadPrimarySource` — which is the minimum viable pressure field: one rule, one vacuum, one propulsion mechanism.

The watcher loop in this model is almost embarrassingly simple:

```js
import { watch } from 'node:fs';
import { execSync } from 'node:child_process';

// reads p:command and p:watchPattern from SEED.md via ig-cli
watch('vault/', (_, filename) => {
  if (filename?.match(WATCH_PATTERN) && !processed.has(filename)) {
    processed.add(filename);
    execSync(`${COMMAND} vault/${filename} > vault/${filename}.result.md`);
  }
});
```

The processed-files set is the only state the runner needs to hold in memory. Everything else — what was run, why, on what input, with what provenance — lives in the files and in Git. That is as close to transparent as a knowledge vortex can get.