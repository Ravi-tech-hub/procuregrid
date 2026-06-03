# ProcureGrid Project Context

## Overview

ProcureGrid is a web-first procurement platform for Indian manufacturers and industrial SMEs. The MVP is a focused procurement operating system, not a full ERP. It combines:

- buyer and supplier onboarding
- company and tenant management
- verified supplier workflows
- RFQ to quote to PO execution
- shipment, GRN, invoice, and payment-state tracking
- trust, audit, and role-aware dashboards

This file is the canonical project context for the full sprint sequence from planning to MVP-ready release.

## Product Boundary

### MVP includes

- secure account creation and login
- company and membership management
- buyer and supplier application shells
- supplier onboarding and verification
- RFQ creation and supplier invitation
- quote submission and comparison
- PO generation and lifecycle tracking
- shipment, GRN, invoice, and payment-state tracking
- trust and audit foundations
- buyer, supplier, and admin dashboard surfaces

### MVP excludes

- full ERP breadth
- deep ERP integrations
- native lending
- advanced AI automation
- complex multi-company switching
- enterprise SSO

## Users, Roles, and Tenancy

### Primary user groups

- buyer procurement users
- buyer finance users
- supplier admins
- supplier sales or account users
- platform admins

### Initial role model

- `platform_admin`
- `company_admin`
- `buyer_procurement`
- `buyer_finance`
- `supplier_admin`
- `supplier_sales`

### Tenancy rules

- every protected business entity belongs to a company tenant
- every membership ties one authenticated user to one company
- all protected reads and writes must be tenant-scoped
- cross-tenant access must fail closed

## Architecture Assumptions

- frontend shell: TanStack Start app
- auth, database, and storage: Supabase
- primary relational model: Postgres
- document storage: object storage via Supabase Storage
- MVP backend shape: modular monolith with server-side business rules where needed
- state transitions must be explicit and auditable

## Sprint Roadmap

### Sprint 0 — Planning and Architecture

#### Goal

Define the MVP clearly enough that implementation can begin without product ambiguity.

#### Delivered artifacts

- PRD
- wireframes
- architecture design
- data model

#### Exit criteria

- MVP scope agreed
- core user journeys defined
- system boundaries identified
- initial relational model drafted
- Sprint 1 starting point agreed

### Sprint 1 — Auth, Company, and Protected Shell

#### Goal

Establish the identity and tenancy foundation required for all later workflows.

#### Delivered / current state

- email signup and login
- phone signup and login path
- phone OTP verification route
- company creation
- first membership creation
- authenticated app shell
- onboarding redirect behavior
- Supabase-backed profile, company, and membership model

#### Still considered part of Sprint 1 hardening

- OTP resend and retry UX
- production-safe phone-auth setup
- final RLS tightening review

#### Exit criteria

- users can authenticate with email and phone
- verified users can create a company
- first user becomes company admin
- protected routes block unauthenticated access
- authenticated users land in app or onboarding correctly

### Sprint 2 — Auth Hardening and Company Foundation Completion

#### Goal

Turn the current onboarding/auth flow into a production-safe tenant foundation.

#### In scope

- phone auth completion and OTP resend
- password reset and recovery
- clearer auth error states
- editable profile settings
- editable company settings
- onboarding completeness rules
- buyer vs supplier route branching
- better role-aware app shell
- auth and onboarding happy-path tests

#### Out of scope

- supplier verification workflow
- RFQ logic
- document review tooling

#### Acceptance criteria

- email and phone auth flows are stable
- password recovery works
- profile and company metadata can be edited safely
- company type redirects are deterministic

### Sprint 3 — Supplier Onboarding and Verification

#### Goal

Let supplier-side companies create structured supplier profiles and submit verification evidence.

#### In scope

- supplier profile creation
- GST, PAN, certifications, and supporting document upload
- supplier verification states
- admin verification review surface
- trusted/verified status display

#### Out of scope

- RFQ awarding
- payment behavior scoring

#### Acceptance criteria

- supplier profile can be created and edited
- documents can be uploaded and reviewed
- supplier verification lifecycle is stored and visible

### Sprint 4 — RFQ Creation and Supplier Invitation

#### Goal

Enable buyer-side users to create procurement requests and invite suppliers into an RFQ flow.

#### In scope

- purchase request entry
- RFQ creation
- supplier invitation
- RFQ status lifecycle
- supplier-side RFQ inbox

#### Out of scope

- PO generation
- payment workflows

#### Acceptance criteria

- buyer can create and send an RFQ
- invited suppliers can view the RFQ
- RFQ states are tracked and tenant-safe

### Sprint 5 — Quotes, Comparison, and Purchase Orders

#### Goal

Convert RFQs into structured commercial decisions and formal purchase orders.

#### In scope

- supplier quote submission
- quote storage and status
- side-by-side quote comparison
- shortlist / reject actions
- PO generation from selected quote
- PO status lifecycle

#### Out of scope

- shipment tracking
- payment release logic

#### Acceptance criteria

- suppliers can submit quotes
- buyers can compare and choose quotes
- selected quote can become a PO

### Sprint 6 — Shipment, GRN, Invoice, and Payment-State Tracking

#### Goal

Extend the transaction lifecycle past PO issuance into fulfillment and payment-state visibility.

#### In scope

- shipment milestones
- delivery tracking
- GRN recording
- invoice record or upload
- payment and escrow-like state tracking
- disputes or exceptions at milestone level

#### Out of scope

- direct payment processing
- lending features

#### Acceptance criteria

- PO can move through fulfillment states
- GRN and invoice states are captured
- payment status is visible and auditable

### Sprint 7 — Dashboards, Admin Oversight, QA, and Deployment Readiness

#### Goal

Make the MVP demoable, testable, and deployable as a coherent product.

#### In scope

- buyer dashboard
- supplier dashboard
- platform admin dashboard
- trust and activity summaries
- audit visibility
- end-to-end QA pass
- deployment checklist
- staging/preview readiness

#### Out of scope

- post-MVP marketplace expansion
- advanced analytics beyond core operational visibility

#### Acceptance criteria

- core flows are demoable end to end
- role-based dashboards exist
- major transitions are auditable
- app is ready for hosted preview and external testing

## Cross-Sprint Dependencies

- Sprint 2 depends on Sprint 1 auth and company primitives
- Sprint 3 depends on company, role, storage, and profile foundations
- Sprint 4 depends on supplier identity and membership correctness
- Sprint 5 depends on RFQ entity design and supplier participation
- Sprint 6 depends on PO lifecycle stability
- Sprint 7 depends on all previous workflow entities and auditability

## Major Risks

- weak tenant isolation causing data leakage
- over-complicated RBAC too early
- mixing buyer and supplier concerns without clear route boundaries
- fragmented session/bootstrap logic
- incomplete audit logging across workflow transitions
- phone-auth friction from SMS provider setup and OTP reliability

## Definition of MVP Complete

The MVP is complete when:

- a buyer can sign up, create a company, and enter the protected app
- a supplier can sign up, complete supplier onboarding, and become verifiable
- a buyer can create an RFQ and invite suppliers
- a supplier can submit a quote
- a buyer can compare quotes and generate a PO
- the transaction can progress through shipment, GRN, invoice, and payment-state tracking
- users only see data for their own company
- all major state transitions are auditable
- the app is stable enough for hosted preview and external demo/testing

## Current Repo Reality

As of the current implementation state:

- Sprint 0 is documented
- Sprint 1 is substantially implemented
- phone auth is in progress and depends on live SMS provider setup
- later workflow sprints are planned but not yet implemented

This file should be updated whenever sprint scope changes or major architecture decisions shift.
