# OPEN_ITEMS.md — DataBeta Known Boundaries & Roadmap Scope

This document explicitly identifies features, third-party integrations, and regulatory scopes that are intentionally bounded or scheduled for subsequent releases.

---

## 1. Third-Party Messaging & Direct APIs

- **WhatsApp Follow-ups**: V1 provides 1-tap **"Copy Drafted Script"** to the user's clipboard. Native background message dispatching via the Meta WhatsApp Business Cloud API requires client-provided BSP credentials and will be released in V2.
- **Direct Bank Feeds (Plaid / Yodlee / Teller)**: V1 supports verified manual opening balances and universal CSV/Excel ledger uploads. Direct Open Banking tokenization is planned for Q3.

---

## 2. Tax Advice & Regional Regulatory Disclaimers

- **Jurisdiction-Neutral Financial Logic**: V1 intentionally omits automated personalized tax recommendations (e.g. Schedule C deductions, VAT filings) outside of supported regions to avoid providing unvalidated tax advice.
- **Accounting Reconciliation**: DataBeta is a frontline sales-and-cash operating system, not a licensed statutory tax filing software.

---

## 3. Advanced Enterprise Controls

- **SAML / Okta Single Sign-On**: V1 supports Supabase Auth with Google OAuth and Email/Password credentials. SAML/SSO is scheduled for the Enterprise Tier roadmap.
- **Custom Webhook Pipelines**: Webhook endpoints for Zapier/Make incoming lead capture are scheduled for the V1.1 patch.
