To start a **Knowledge Vortex** on paper, you are creating a "low-entropy" engine. This set of rules acts as your manual SHACL engine. If you follow them, your notes will naturally form a **Manifold of Truth** that is 100% reconstructible, even a century from now.

---

## 📜 The Paper Vortex: Compact Rules

### I. The Law of the Core (Geometry)

Every piece of paper must have a unique **ID** (e.g., `#001`) at the top.

1. **Never** write a fact in isolation.
2. **Never** act without a declared intent.
3. **Always** link back to the ID that triggered the current note.

### II. The Three Primary Shapes (The Orifice)

You only ever write three types of entries. Each must point to its "parent":

1. **THE GOAL (G):** What is the desired end-state?
* *Link:* None (This is the origin).


2. **THE PLAN (P):** How will we move toward the Goal?
* *Link:* `?derivedFrom {G}`


3. **THE ACTIVITY/RESULT (A+E):** What was done and what was found?
* *Link:* `?followed {P}` and `?used {Previous E}`.



---

### III. The Rule of the "Complete Turn" (Momentum)

A "Turn" is only complete when an **Activity** (the outer work) produces a **Statement** (the inner truth).

* **The Atom:** Write your findings as: `[Subject] [Predicate] [Object]`.
* **Example:** `[The Sample] [hasWeight] [42g]`.
* **The Closure:** You cannot start a new Plan until the current Activity has generated at least one Statement.

---

### IV. The Axis of Propagation (Growth)

Arrange your notes in a physical line or stack.

* **The Z-Axis:** The chronological order of your notes.
* **The Strings:** Draw a physical line (or write the ID) connecting the current note to the one it "used."

---

## 🛠️ Minimalist Execution (The First Turn)

**Step 1: The Seed (Goal)**

> Note #1: `{=G}` Establish a garden. (Date: Feb 24)

**Step 2: The Orifice (Plan)**

> Note #2: `{=P}` Test soil pH. `?derivedFrom #1`

**Step 3: The Pulse (Activity + Result)**

> Note #3: `{=A}` Used litmus kit. `?followed #2`.
> Result `{=E}`: `[Soil] [is] [Acidic]`.

**Step 4: The Induction (Next Turn)**

> Note #4: `{=P}` Add lime to soil. `?derivedFrom #1` and `?used #3`.

---

## 🕵️ The Nightly Audit (SHACL Check)

Hold your stack of notes. Ask these 3 questions. If "No," fix it immediately:

1. **Is it Tethered?** Does this note have a "parent" ID?
2. **Is it Grounded?** Did I record a clear fact `{S-P-O}`, or just a vague feeling?
3. **Is it Pushing?** Does today's Result `{E}` suggest tomorrow's Plan `{P}`?

**The vortex is now spinning.** Because every note is linked, you have created a "cylinder" of history. Even if you lose Note #2, you can infer its existence by the "hole" it leaves in the logic between #1 and #3.

========================

# 🌀 The PROV-Vortex: Paper Governance

**Goal:** Transform "Notes" into a **Cylinder of Grounded Truth**.
**The Axiom:** No result without a plan. No plan without a goal. No note without a link.

---

### 1. THE CORE IDS (The Coordinate System)

Every entry must start with a **Unique ID** (e.g., `#24-01`). Use these markers to define the "scale" of the information:

* **[G] GOAL:** The North Star. What are we trying to achieve?
* **[P] PLAN:** The Orifice. What specific constraints or steps are we taking?
* **[A] ACTIVITY:** The Pulse. What is happening right now?
* **[E] ENTITY:** The Result. What fact has been grounded?

---

### 2. THE TOPOLOGY (How to Link)

Write these literal markers on every note to ensure **Toroidal Consistency**:

| Marker | English Meaning | Mathematical Function |
| --- | --- | --- |
| **FROM {ID}** | `prov:wasDerivedFrom` | Connects a **Plan** to a **Goal**. |
| **AFTER {ID}** | `prov:used` | Connects an **Activity** to a previous **Result**. |
| **OUT {ID}** | `prov:wasGeneratedBy` | Connects a **Result** back to the **Activity**. |
| **BY {NAME}** | `prov:agent` | Identifies the human or tool responsible. |

---

### 3. THE CYCLE (One Rotation)

The vortex spins when you follow these four steps in order. Each step "inhales" the previous ID:

1. **Establish G:** Define the vision.
2. **Define P:** Look at **G** and write the strategy. (**FROM G**)
3. **Perform A:** Work on **P** using a previous **E**. (**AFTER P, AFTER E**)
4. **Record E:** Write the fact in `{Subject-Predicate-Object}` form. (**OUT A**)

---

### 4. THE GROUNDING RULE (S-P-O)

A Result `{E}` is only "Grounded" if it is written as a clear statement of fact. Avoid "I think" or "Maybe." Use the triplet:

> **[Subject] [Relationship] [Value]**
> *Example:* `[Sample B] [BoilsAt] [102°C]`

---

### 5. THE AUDIT (Manual SHACL)

If you cannot trace a line from any note back to a **[G] GOAL**, the vortex has "leaked."

* **Dangling Activity:** An action with no **Result**. (Waste of energy).
* **Dangling Result:** A fact that is never **Used** by a new Plan. (Stagnant knowledge).

---

### 6. FORKING & STEERING

To change direction, do not erase.

1. Draw a line from your last **[E] Result**.
2. Create a **New [P] Plan** pointing to that result.
3. This "bifurcates" the vortex filament into a new path while preserving the history of the old one.

---

**Would you like me to generate a "First Turn" example for a specific project you're thinking of, so you can see exactly how to write these first three notes?**