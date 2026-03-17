[proj] <tag:alice@example.com,2026:project/>

## Weekend goals {=proj:weekend-goals .proj:Project}

Tasks:

- Clean kitchen {+proj:task-clean ?proj:hasTask .proj:Task label}
  Subtasks:
  - Clear countertops {+proj:task-clean-counters ?proj:hasSubtask .proj:Subtask label}
  - Wash dishes {+proj:task-clean-dishes ?proj:hasSubtask .proj:Subtask label}
  - Organize pantry {+proj:task-clean-pantry ?proj:hasSubtask .proj:Subtask label}
- Fix bike {+proj:task-bike ?proj:hasTask .proj:Task label}
  Steps:
  - Check tire pressure {+proj:step-tire-pressure ?proj:hasStep .proj:Step label}
  - Adjust brakes {+proj:step-brakes ?proj:hasStep .proj:Step label}
  - Lubricate chain {+proj:step-chain ?proj:hasStep .proj:Step label}
- Read book {+proj:task-read ?proj:hasTask .proj:Task label}
  Reading plan:
  - Chapter 1-2 {+proj:read-ch1-2 ?proj:hasReadingPlan .proj:ReadingPlan label}
  - Chapter 3-4 {+proj:read-ch3-4 ?proj:hasReadingPlan .proj:ReadingPlan label}
  - Chapter 5-6 {+proj:read-ch5-6 ?proj:hasReadingPlan .proj:ReadingPlan label}

Resources:

- Hardware store {+proj:hardware-store ?proj:requiresResource .proj:Resource label}
  Items needed:
  - Screws {+proj:item-screws ?proj:needsItem .proj:Item label}
  - Bike pump {+proj:item-pump ?proj:needsItem .proj:Item label}
- GitHub repository {+proj:github-repo ?proj:requiresResource .proj:Repository label}
  Repository details:
  - Source code {+proj:repo-source ?proj:hasRepositoryDetail .proj:RepositoryDetail label}
  - Documentation {+proj:repo-docs ?proj:hasRepositoryDetail .proj:RepositoryDetail label}

Team:

- Myself {+proj:myself ?proj:hasTeamMember .proj:Person ?proj:projectManager role}
  Skills:
  - Planning {+proj:skill-planning ?proj:hasSkill .proj:Skill label}
  - Cooking {+proj:skill-cooking ?proj:hasSkill .proj:Skill label}
- Bob {+proj:bob ?proj:hasTeamMember .proj:Person ?proj:helper role}
  Skills:
  - Bike repair {+proj:skill-bike ?proj:hasSkill .proj:Skill label}
  - Organizing {+proj:skill-organizing ?proj:hasSkill .proj:Skill label}

Blocked by:

- Rain forecast {+proj:weather-forecast !proj:blocks .proj:Blocker label}
  Alternatives:
  - Indoor cleaning {+proj:alt-indoor ?proj:hasAlternative .proj:Alternative label}
  - Online shopping {+proj:alt-shopping ?proj:hasAlternative .proj:Alternative label}
