# Standalone restaurant platform: next stages

This build is the public site and a validated reservation-request flow. The following features are deliberately future work; no account, priority benefit, confirmed table inventory or payment UI pretends to work today.

## Restaurant-controlled records

Use a durable database as the authority for menu categories, stable dish IDs, translations, seasonal availability, prices, allergens and media provenance. Staff can edit and publish content through an authenticated dashboard. Separate staff roles (owner, manager, host) and guest accounts. Photos need recorded author/rights status before publication. History entries should be approved content, not inferred anecdotes.

## One availability inventory

Model services, bookable slots, tables/combinable tables, party size, capacity and blackout dates. Every booking source uses the same inventory and atomic, short-lived holds. Suggested reservation lifecycle: requested → held → confirmed → seated → completed; plus declined, cancelled and no-show. Log staff actions and provide guest cancellation links with expiring tokens. The current email request route can remain a fallback, but cannot itself guarantee a table.

## Priority access

The meaning of priority remains an owner decision: early booking windows, a regular-guest entitlement or waitlist ordering. Keep it a configurable rule over the same inventory. Do not create a separate pool that can double-book a table. Define eligibility, expiry and staff overrides explicitly before implementing the guest experience.

## External providers

Keep a first-party reservation ID and external source/ID mapping. TheFork B2B access requires approval and credentials; implement signed/reliable webhooks, reconciliation and idempotency before accepting both channels. If TheFork cannot synchronize live availability under the restaurant's agreement, display a source link instead of running two independent automatic booking systems.

Google Places is a separately attributed display integration. Full owner review management requires authorized Business Profile access. Neither Google's place-level reviews nor TheFork's published review schema is a native verified dish-review system. Native item feedback can later attach to completed visits and stable dish IDs, while imported comments retain their original restaurant-level meaning.

## Payments

Keep payment status and booking status separate. Decide whether payments mean a deposit, card guarantee, prepayment or purchase. Use a hosted/tokenized provider flow; the app stores provider references and amounts, never card details. Verify webhook signatures, use idempotency keys, reserve inventory before payment, expire abandoned holds and support staff refunds/cancellation rules. Reconcile ambiguous provider results before retrying charges.

## Before that release

Select the durable backend and identity provider, confirm the restaurant's priority/cancellation policies and TheFork access, write the actual privacy/retention terms, enable durable abuse controls, test concurrent availability requests and payment webhooks, then give staff an audit trail and a clear recovery workflow. The public design and bilingual data architecture can remain in place throughout.
