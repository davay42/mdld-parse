[proj] <tag:alice@example.com,2026:project/>

## Weekend Project {=proj:weekend .prov:Activity label}

Project manager [Alice] {+proj:alice .prov:Person ?prov:wasAssociatedWith}.

The project includes [kitchen cleaning] {+proj:clean .proj:Task label} with subtasks: countertops, dishes, and pantry organization. Also includes [bike repair] {+proj:bike .proj:Task label} involving tire pressure, brakes, and chain maintenance. Finally, [reading] {+proj:read .proj:Task label} covers chapters 1-6.

**Delegation** {=proj:delegation .prov:Delegation ?prov:qualifiedDelegation}

Resources needed: [hardware store] {+proj:hardware .proj:Resource} for screws and bike pump, and [GitHub repo] {+proj:repo .proj:Repository} for source code and documentation.

Team: [Alice] {+proj:alice ?prov:agent} as project manager with planning skill, [Bob] {+proj:bob ?prov:agent .prov:Person} as helper with bike repair skill.

The project has a [rain forecast] {+proj:rain !proj:blocker .proj:Blocker} blocker, with [indoor work] {+proj:indoor ?proj:alternative} as an alternative.
