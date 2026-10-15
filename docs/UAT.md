# User acceptance test plan and execution record

Project: The Akhila Edit · Owner: Akhila Gogulamudi · Release: 1.0 · Prepared: 9 September 2026

## Execution boundary

28 C# unit/integration tests passed against real SQL Server; 20 frontend unit/component tests passed in jsdom with mocked HTTP responses. A published local ASP.NET Core release was checked using real HTTP and SQL Server. These are engineering checks, not Akhila's personal UAT approval. Browser visual/keyboard/mobile testing could not run because the supported preview runtime could not start the required full stack. No browser behavior is marked as manually passed.

## Preconditions

Use a fresh demo database initialized with six products. Mugs begin at 24, backpacks at 18, bottles at 7, lamps at 5, and headphones at 0. Start the application using README.md. Use sample names. Keep SSMS available to verify saved rows. For a fresh test sequence use a separate new demo database; never delete data from an unrelated database.

| ID | User steps | Expected result | Existing engineering evidence | Owner result |
|---|---|---|---|---|
| UAT-01 | Open the shop | Six products, working images, readable layout | Catalog API + local entrypoint smoke; visual pending | Pending |
| UAT-02 | Search for mug | Only Quiet Morning Mug remains | Component + API test passed | Pending |
| UAT-03 | Search for xyz; choose See all essentials | Empty state, then full collection | Component test passed | Pending |
| UAT-04 | Select Home | Only home products remain | Component + API filter tests passed | Pending |
| UAT-05 | Sort price low to high, then high to low | Price order changes correctly | Component ascending + API descending tests passed | Pending |
| UAT-06 | Open a product | Name, image, description, price and stock shown | Component test passed; visual pending | Pending |
| UAT-07 | Open an empty bag | Empty message and return action | Component test passed | Pending |
| UAT-08 | Add one backpack; increase to two | Bag quantity 2 and correct estimated total | Component + cart logic passed | Pending |
| UAT-09 | Decrease to zero or remove item | Item disappears; empty bag when last removed | Component + cart logic passed | Pending |
| UAT-10 | Add a product and reload browser | Bag returns with same IDs and quantities | Storage write/recovery tested; real reload pending | Pending |
| UAT-11 | Try adding headphones | Add is disabled; Back soon shown | Component passed | Pending |
| UAT-12 | Increase bottle quantity beyond available stock | Quantity cannot exceed stock or 10 | Cart logic test passed | Pending |
| UAT-13 | Leave name empty during checkout | Checkout disabled | Component test passed | Pending |
| UAT-14 | Buy two mugs with sample name | $36 subtotal, $5 shipping, $41 total, receipt | Real published HTTP+SQL check passed | Pending |
| UAT-15 | Inspect SQL after UAT-14 | One new order; one line; mug stock reduced by 2 | Real SQL integration + release smoke passed | Pending |
| UAT-16 | Buy three backpacks | $84 subtotal; free shipping | SQL integration passed | Pending |
| UAT-17 | Replay identical checkout request ID through Postman | Same receipt, no second stock change | SQL integration passed | Pending |
| UAT-18 | Reuse request ID with different cart | HTTP 409; no extra stock decrement | SQL integration passed | Pending |
| UAT-19 | API checkout with available backpack plus unavailable headphones | Conflict; backpack decrement rolls back | SQL integration passed | Pending |
| UAT-20 | Concurrent API orders for one remaining unit | One success, one conflict, stock never negative | Real SQL concurrency test passed | Pending |
| UAT-21 | Send fake client price/total via Postman | Server uses its database prices | SQL integration passed | Pending |
| UAT-22 | Stop API in local development; refresh UI | Readable failure and retry control | Component error state passed; manual service interruption pending | Pending |
| UAT-23 | Use keyboard to navigate, open and close dialog | Visible focus, reachable controls, focus returns | Implemented, not browser-verified | Pending |
| UAT-24 | Test at mobile width and 200% zoom | No clipping, readable text, usable bag | Responsive CSS implemented; visual verification pending | Pending |
| UAT-25 | Place order, then check bag | Receipt visible and bag cleared | Component test passed | Pending |
| UAT-26 | Open the project explanation | Accurate stack and demo limitations | Implemented; manual review pending | Pending |

## Defect record

| ID | Finding | Resolution/status |
|---|---|---|
| ENV-01 | Previous workspace reset lost local files | Reconstructed and checkpoint ZIP saved |
| ENV-02 | Earlier SQL connection across separate processes failed | SQL and test/API processes started together; current real SQL tests passed |
| DEP-01 | Earlier OpenAPI dependency vulnerability warning | Updated .NET package versions; current build has no warnings |
| DATA-01 | Initial backpack image was labeled tote | Product renamed Everyday Backpack to match image |
| ENV-03 | Browser preview cannot launch the required stack | Visual and manual UAT checks remain pending |

## Sign-off — to be completed by Akhila

- Tested application version:
- Tested URL or local address:
- Test date:
- Accepted cases:
- Open defects:
- Decision: Pending / Accepted / Accepted with conditions / Rejected
- Owner name and approval:

Do not mark this accepted until the owner actually performs or reviews the tests and records a decision.
