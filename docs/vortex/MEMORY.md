# Knowledge Double Vortex System

## Overview
The Knowledge Double Vortex is a PROV-O-based knowledge propulsion engine implementing a DIAD cycle with four strokes plus goal completion. It creates a toroidal vortex ring where knowledge flows through structured phases, with SHACL shapes providing centripetal forces that propel the system forward.

## Core Architecture

### DIAD Cycle Phases
1. **Document Intake** (Bottom Left): External documents are processed by internal activities
2. **Internal Analysis** (Bottom Right): Internal collections are analyzed and validated
3. **External Validation** (Top Right): External API calls verify internal knowledge
4. **Grounding** (Top Left): Results are grounded with external sources citations
5. **Goal Completion** (Center): Final iteration to achieve frozen vortex state

### PROV-O Implementation
- **prov:Activity**: Actions performed in each phase
- **prov:Entity**: Knowledge objects and results
- **prov:Plan**: Goals that drive the vortex
- **prov:used**: Resources consumed by activities
- **prov:wasInformedBy**: Activity sequencing and influence
- **prov:hadPrimarySource**: External grounding verification
- **prov:qualifiedAssociation**: Agent-role relationships

### Spanish Vortex Example
**Goal**: Create verifiable list of Spanish-speaking countries
**API Integration**: https://www.apicountries.com/lang/es
**Results**: 21 countries with full provenance chain
**Compression Ratio**: 21.0x (21 countries from 1 API response)

### SHACL Validation System
**Flexible Shape Design**:
- **Required phases** (minCount 1): Core vortex flow
- **Optional features** (minCount 0): Development flexibility
- **Severity levels**: Violations for propulsion, Info for guidance

**Key Shapes**:
- Phase1IntakeShape: Document processing validation
- Phase2ProcessingShape: Collection validation
- Phase3ValidationShape: External verification
- Phase4GroundingShape: Activity grounding
- GoalCompletionShape: Goal finalization
- ActivityChainShape: Activity influence flow

### Knowledge Access Patterns
Results are accessible from goals through complete provenance chains:
```
Goal → Activity → Result → Goal (complete chain)
ex:goal_spanish_countries → ex:activity_external_validation → ex:entity_api_spanish_countries → ex:activity_goal_completion
```

### Key Properties
- **External Sources**: HTTP/HTTPS pattern matching
- **Universal Validation**: Phase-based rather than goal-specific
- **Iterative Development**: Multiple vortex turns supported
- **Frozen State**: Zero violations achievable with proper grounding

### Vortex States
1. **Active**: Violations provide propulsion pressure
2. **Frozen**: Zero violations, complete knowledge grounding
3. **Propulsion**: Residual violations guide next iteration

### Benefits
- **Provenance Tracking**: Complete audit trail from goals to results
- **External Validation**: Real API integration with verification
- **Structured Results**: Proper entity relationships and properties
- **Flexible Validation**: Adaptable to various data sources
- **Knowledge Compression**: Efficient knowledge extraction from sources

The system demonstrates how PROV-O and SHACL can create self-propelling knowledge graphs with complete provenance and validation capabilities.