# PROV-O Vortex TTL Modules

## 📁 Modular Structure

This directory contains the complete 2D Vortex system broken into logical modules for easier testing and validation.

## 📋 Files Overview

| File | Purpose | Contents |
|-------|----------|----------|
| **shapes.ttl** | SHACL validation shapes for all PROV-O classes |
| **goal.ttl** | Goal entities and plans (North Star) |
| **agents.ttl** | Human and AI agents with delegation |
| **document.ttl** | External document entities (Intake) |
| **activities.ttl** | Internal and external activities (Processing & Validation) |
| **results.ttl** | Collections, statements, and concepts (Grounding) |
| **concepts.ttl** | Abstract concepts and properties |
| **bundle.ttl** | Complete provenance bundle |

## 🔄 DIAS Cycle Flow

```
goal.ttl → document.ttl → activities.ttl → results.ttl → concepts.ttl
    ↑                                                           ↓
    └─────────────────────────────────────────────────────────┘
```

## ✅ Validation Status

All modules validate with **0 SHACL violations**:
- **Total Quads**: 280 (175 data + 105 shapes)
- **Entities**: 23 unique nodes
- **Activities**: 2 (internal analysis + external validation)
- **Agents**: 2 (human + AI with delegation)
- **Statements**: 3 grounded facts with full provenance

## 🎯 Key Features Demonstrated

- **No blank nodes** - Every entity has a named IRI
- **Complete provenance** - Full traceability from goal to statements
- **SHACL compliance** - 105 shapes ensuring data integrity
- **Agent delegation** - Human → AI agent with proper authority
- **Qualified associations** - Activities linked to plans and roles
- **Bundle structure** - All data organized in provenance container

## 🔍 Testing Commands

```bash
# Validate all modules
ig-cli validate ttl_vortex/

# Check statistics
ig-cli stats ttl_vortex/

# Query specific entities
ig-cli sparql ttl_vortex/ "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"

# List all files
ig-cli list ttl_vortex/
```

## 📊 System Metrics

- **Compression Ratio**: 3 statements ÷ 1 document = 3.0 (Optimal)
- **Self-Induction**: 2 statements derived from 1 document (High)
- **Vortex Integrity**: Complete 4-stroke cycles with no orphaned nodes
- **Agent Balance**: Human authority with AI delegation

This modular structure enables granular testing of each DIAS cycle component while maintaining complete W3C PROV-O compliance.
