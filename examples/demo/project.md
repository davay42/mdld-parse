[proj] <tag:alice@example.com,2026:project/>

# Website Redesign {=proj:website .prov:Project label}

Website redesign project for Q2 2026 with modern responsive design.

## Project Metadata {=proj:website-meta .prov:Entity label}

Budget: [$25,000] {proj:budget ^^xsd:decimal}
Start date: [2026-06-01] {proj:startDate ^^xsd:date}
End date: [2026-08-31] {proj:endDate ^^xsd:date}
Status: [planning] {proj:status}

## Team Formation Activity {=proj:team-formation .prov:Activity label}

Started: [2026-05-15T09:00:00Z] {prov:startedAtTime ^^xsd:dateTime}
Associated with: [Alice Johnson] {+proj:alice .prov:Person ?prov:wasAssociatedWith} as Project Manager
Plan: [Q2 Website Plan] {+proj:q2-plan .prov:Plan ?prov:hadPlan}

Generated: [Team Structure] {+proj:team-structure ?prov:generated}

## Team Members

### Project Manager {=proj:alice .prov:Person label}

Name: [Alice Johnson] {rdfs:label}
Email: [alice@example.com] {proj:email}
Role: [Project Manager] {proj:role}

### Lead Developer {=proj:bob .prov:Person label}

Name: [Bob Smith] {rdfs:label}
Email: [bob@example.com] {proj:email}
Role: [Lead Developer] {proj:role}

### UX Designer {=proj:carol .prov:Person label}

Name: [Carol Davis] {rdfs:label}
Email: [carol@example.com] {proj:email}
Role: [UX Designer] {proj:role}

## Project Tasks

### Design Phase {=proj:design-phase .prov:Activity label}

Started: [2026-06-01] {prov:startedAtTime ^^xsd:date}
Ended: [2026-06-15] {prov:endedAtTime ^^xsd:date}

Tasks:
- [User Research] {+proj:user-research .proj:Task ?prov:used} - interviews and surveys
- [Wireframes] {+proj:wireframes .proj:Task ?prov:used} - low-fidelity layouts
- [High-fidelity Mockups] {+proj:mockups .proj:Task ?prov:used} - detailed designs

Generated: [Design Documentation] {+proj:design-docs ?prov:generated}

### Development Phase {=proj:dev-phase .prov:Activity label}

Started: [2026-06-16] {prov:startedAtTime ^^xsd:date}
Ended: [2026-07-30] {prov:endedAtTime ^^xsd:date}

Tasks:
- [Frontend Development] {+proj:frontend .proj:Task ?prov:used} - React components
- [Backend API] {+proj:backend .proj:Task ?prov:used} - Node.js services
- [Database Schema] {+proj:database .proj:Task ?prov:used} - PostgreSQL design

Generated: [Working Prototype] {+proj:prototype ?prov:generated}

## Project Relationships

### Dependencies {=proj:dependencies .rdfs:Resource label}

The project depends on:
- [Design System] {+proj:design-system ?proj:requires}
- [API Documentation] {+proj:api-docs ?proj:requires}

### Stakeholders {=proj:stakeholders .rdfs:Resource label}

Key stakeholders:
- [Marketing Department] {+proj:marketing ?proj:stakeholder .prov:Organization}
- [Customer Support] {+proj:support ?proj:stakeholder .prov:Organization}

## Delegation Pattern

### Development Delegation {=proj:dev-delegation .prov:Delegation ?prov:qualifiedDelegation}

Alice delegates frontend development to specialized team.

Delegate: [Alice] {+proj:alice ?prov:delegate}
Responsible: [Frontend Team] {+proj:frontend-team .prov:Organization ?prov:responsible}
Activity: [Frontend Development] {+proj:frontend-dev .prov:Activity ?prov:hadActivity}
Role: [Development Lead] {+proj:dev-lead .prov:Role ?prov:hadRole}

This demonstrates:
- Complete PROV-O provenance chains
- Project lifecycle with phases
- Team formation and delegation
- Proper temporal properties
- Cross-ontology integration
