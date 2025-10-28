# 🧾 SuperPet API - Fiscal / Invoicing Collection

Postman collection for the Fiscal/Invoicing module with full examples (requests, responses, and error cases) and SaaS feature enforcement.

## Requirements
- Base URL: `{{base_url}}` (default: http://localhost:3000)
- Auth: `{{access_token}}` (Bearer token)
- Store feature `FISCAL_INVOICING` enabled for the target store

## Endpoints Covered
- POST `/fiscal/stores/:storeId/invoices` (create)
- GET `/fiscal/stores/:storeId/invoices` (list by store)
- GET `/fiscal/invoices/:id` (details)
- PUT `/fiscal/invoices/:id/cancel` (cancel)
- GET `/fiscal/invoices/:id/xml` (XML content + URL)
- GET `/fiscal/invoices/:id/danfe` (DANFE URL)

## Errors Covered
- 401 Unauthorized (missing/invalid token)
- 403 FEATURE_NOT_ENABLED (feature disabled for store)
- 403 STORE_ACCESS_DENIED (cross-tenant or no access)
- 400 Validation errors (invalid request body)
- 404 Invoice not found

## Variables
- `base_url` - API base URL
- `access_token` - JWT access token
- `access_token_other_org` - Token from a different organization (to simulate 403)
- `store_id` - Store with feature enabled
- `store_id_no_feature` - Store without feature enabled
- `invoice_id` - Saved after creation
- `_iso_timestamp` - `{{$isoTimestamp}}` helper

## Usage Tips
1. Use the Auth collection to login and set `{{access_token}}`.
2. Create a store via Stores collection and enable `FISCAL_INVOICING` via Stores Features endpoint.
3. Run "1. Create Invoice" → variable `invoice_id` is saved automatically.
4. Use the other requests to list, get, cancel, and fetch XML/DANFE.

> This module uses a mocked provider in dev: URLs are placeholders; replace integration in production.
