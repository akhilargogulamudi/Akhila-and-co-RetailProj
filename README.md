# \# The Golden Edit — Akhila \& Co.

# 

# A full-stack retail portfolio application built by \*\*Akhila Gogulamudi\*\* to demonstrate practical experience with \*\*C#, ASP.NET Core, REST APIs, Entity Framework Core, SQL Server, React, automated testing, Docker, and GitHub Actions CI\*\*.

# 

# The project is designed as a hands-on backend-focused application where the catalog, pricing, inventory, checkout, and receipt workflows are handled through a C# / ASP.NET Core backend and SQL Server database.

# 

# > \*\*Portfolio project:\*\* This is a personal learning and demonstration project, not employer work or a production e-commerce platform. AI tools were used during development for assistance with scaffolding, troubleshooting, and documentation.

# 

# \---

# 

# \## Project Overview

# 

# \*\*The Golden Edit\*\* is a small retail storefront demonstrating a complete full-stack request flow:

# 

# ```text

# React Frontend

# &#x20;     ↓

# ASP.NET Core REST API

# &#x20;     ↓

# Entity Framework Core

# &#x20;     ↓

# SQL Server

# ```

# 

# The application includes a sample product catalog, shopping bag, checkout workflow, inventory handling, server-side price calculation, receipts, database constraints, and automated tests.

# 

# \### Key Features

# 

# \- Product catalog with six sample products

# \- Product search, filtering, and sorting

# \- Product detail views

# \- Persistent shopping bag

# \- Quantity controls

# \- Demo checkout workflow

# \- Server-calculated pricing

# \- Inventory availability checks

# \- Conditional inventory updates

# \- SQL transactions

# \- Idempotent checkout requests

# \- Receipt generation

# \- Database constraints

# \- REST API endpoints

# \- OpenAPI documentation

# \- Backend unit and SQL integration tests

# \- React frontend tests

# \- GitHub Actions CI

# \- Docker configuration

# \- Local release/deployment scripts

# \- UAT documentation

# 

# \---

# 

# \## Technology Stack

# 

# | Layer | Technologies |

# |---|---|

# | Frontend | React, JavaScript, Vite, HTML, CSS |

# | Backend | C#, ASP.NET Core, .NET 10 |

# | API | REST, OpenAPI |

# | Data Access | Entity Framework Core |

# | Database | SQL Server 2025 |

# | Testing | .NET tests, SQL Server integration tests, frontend tests |

# | CI/CD | GitHub Actions |

# | Containers | Docker, Docker Compose |

# | Development | Visual Studio / VS Code, PowerShell |

# | Documentation | Markdown, HTML, Postman |

# 

# \---

# 

# \## Backend

# 

# The backend is implemented with \*\*C# and ASP.NET Core\*\*.

# 

# It provides REST endpoints for the retail application and contains the business logic for:

# 

# \- Product catalog operations

# \- Cart/checkout processing

# \- Price calculation

# \- Inventory validation

# \- Inventory updates

# \- Receipt generation

# \- Database transactions

# \- Idempotent checkout requests

# 

# The application uses \*\*Entity Framework Core\*\* for database access and SQL Server for persistence.

# 

# \### Example request flow

# 

# ```text

# Customer selects products

# &#x20;       ↓

# React sends API request

# &#x20;       ↓

# ASP.NET Core endpoint

# &#x20;       ↓

# Business/checkout logic

# &#x20;       ↓

# Entity Framework Core

# &#x20;       ↓

# SQL Server transaction

# &#x20;       ↓

# Inventory + order/receipt processing

# &#x20;       ↓

# API response

# &#x20;       ↓

# React updates the UI

# ```

# 

# \---

# 

# \## Database

# 

# The application uses \*\*SQL Server\*\* with Entity Framework Core.

# 

# The database includes the structures required for the product catalog, inventory, and checkout workflow.

# 

# The project also includes:

# 

# ```text

# database/

# ├── 001-schema.sql

# └── inspection.sql

# ```

# 

# For a fresh local demo database, the application supports explicit initialization using:

# 

# ```powershell

# dotnet run --project backend/Shop.Api -- --init

# ```

# 

# The `--init` path uses EF Core `EnsureCreated` for a fresh demonstration database.

# 

# > `EnsureCreated` is intended for this fresh demo setup. It is not a replacement for migrations when evolving a database containing data that must be retained.

# 

# \---

# 

# \## Testing

# 

# Testing is included across both backend and frontend components.

# 

# \### Verified test results

# 

# \*\*48 tests passed:\*\*

# 

# \- \*\*28\*\* C# unit and SQL Server integration tests

# \- \*\*20\*\* frontend logic/component tests

# 

# The project also includes local HTTP checks covering:

# 

# \- Catalog

# \- Health endpoint

# \- Checkout

# \- Inventory/stock behavior

# \- Receipt behavior

# 

# Test evidence is stored under:

# 

# ```text

# evidence/

# ```

# 

# See:

# 

# ```text

# evidence/STATUS.md

# ```

# 

# for the documented test boundaries and results.

# 

# \---

# 

# \## GitHub Actions CI

# 

# The repository includes an automated GitHub Actions workflow:

# 

# ```text

# .github/workflows/ci.yml

# ```

# 

# The CI pipeline:

# 

# 1\. Checks out the repository

# 2\. Installs the required .NET SDK

# 3\. Installs Node.js

# 4\. Starts a temporary SQL Server container

# 5\. Runs backend tests

# 6\. Installs frontend dependencies

# 7\. Runs frontend tests

# 8\. Builds the React application

# 9\. Uploads test evidence

# 

# Current CI status: \*\*passing\*\* ✅

# 

# \---

# 

# \## Docker

# 

# The project includes Docker configuration for running the application with SQL Server:

# 

# ```text

# Dockerfile

# compose.yaml

# .env.example

# ```

# 

# For local Docker usage:

# 

# ```powershell

# Copy-Item .env.example .env

# ```

# 

# Set your own local SQL password in `.env`, then:

# 

# ```powershell

# docker compose up --build -d

# ```

# 

# The Docker setup is intended for local demonstration and development.

# 

# \---

# 

# \## Running Locally

# 

# \### Prerequisites

# 

# \- .NET 10 SDK

# \- Node.js 22

# \- SQL Server 2025 Developer

# \- Git

# \- Permission to create a dedicated demo database

# 

# \### 1. Start the backend

# 

# From the repository root:

# 

# ```powershell

# $env:ConnectionStrings\_\_Shop='Server=localhost;Database=AkhilaEdit;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'

# 

# dotnet run --project backend/Shop.Api -- --init

# ```

# 

# Then start the API:

# 

# ```powershell

# dotnet run --project backend/Shop.Api --urls http://localhost:5080

# ```

# 

# \### 2. Start the React frontend

# 

# Open a second terminal:

# 

# ```powershell

# cd frontend

# npm ci

# npm run dev

# ```

# 

# Open:

# 

# ```text

# http://localhost:5173

# ```

# 

# The React development server proxies API requests to the ASP.NET Core application running on port `5080`.

# 

# \---

# 

# \## Local Release Deployment

# 

# The repository includes a local release script:

# 

# ```text

# deploy/publish-local.ps1

# ```

# 

# After configuring the connection string, run:

# 

# ```powershell

# ./deploy/publish-local.ps1

# ```

# 

# The compiled application can then be accessed through:

# 

# ```text

# http://localhost:5080

# ```

# 

# \---

# 

# \## Project Structure

# 

# ```text

# Akhila-and-co-RetailProj/

# │

# ├── backend/

# │   ├── Shop.Api/

# │   └── Shop.Tests/

# │

# ├── frontend/

# │   ├── public/

# │   └── src/

# │

# ├── database/

# │   ├── 001-schema.sql

# │   └── inspection.sql

# │

# ├── deploy/

# │   ├── AZURE.md

# │   ├── publish-local.ps1

# │   └── test.ps1

# │

# ├── docs/

# │   ├── Project\_Guide.md

# │   ├── Project\_Guide.html

# │   ├── Postman\_Collection.json

# │   └── UAT.md

# │

# ├── evidence/

# │   └── STATUS.md

# │

# ├── .github/

# │   └── workflows/

# │       └── ci.yml

# │

# ├── Dockerfile

# ├── compose.yaml

# └── AkhilaEdit.sln

# ```

# 

# \---

# 

# \## API \& Documentation

# 

# Additional project documentation is available in:

# 

# ```text

# docs/

# ```

# 

# Including:

# 

# \- Project guide

# \- API/Postman collection

# \- UAT documentation

# \- Asset documentation

# 

# The Postman collection is available at:

# 

# ```text

# docs/Postman\_Collection.json

# ```

# 

# \---

# 

# \## Portfolio Demonstration

# 

# For an interview or recruiter discussion, the project can be demonstrated through the following flow:

# 

# ```text

# 1\. Open the React storefront

# 2\. Browse/search products

# 3\. Add products to the bag

# 4\. Change quantities

# 5\. Submit a demo checkout

# 6\. Show server-side price calculation

# 7\. Show inventory handling

# 8\. Show the generated receipt

# 9\. Walk through the ASP.NET Core API

# 10\. Explain the SQL Server transaction

# 11\. Show automated tests

# 12\. Show the GitHub Actions CI pipeline

# ```

# 

# This provides a compact demonstration of frontend → API → database → testing/CI.

# 

# \---

# 

# \## Current Project Status

# 

# \### Completed

# 

# \- Full-stack local application

# \- React frontend

# \- ASP.NET Core backend

# \- SQL Server database

# \- Entity Framework Core integration

# \- Checkout workflow

# \- Inventory handling

# \- Receipt workflow

# \- Automated backend tests

# \- Automated frontend tests

# \- GitHub Actions CI

# \- Docker configuration

# \- Local release scripts

# \- UAT documentation

# \- Project documentation

# 

# \### Not Yet Completed

# 

# \- Public production deployment

# \- Real payment processing

# \- Real delivery/shipping integration

# \- Customer authentication/accounts

# \- Admin dashboard

# \- Production-grade cloud database

# \- Full real-browser visual/UAT validation

# 

# The application should therefore \*\*not be represented as a live public e-commerce store or production system\*\*.

# 

# \---

# 

# \## AI Assistance \& Ownership

# 

# AI tools were used during development for assistance with areas such as scaffolding, troubleshooting, code exploration, testing ideas, and documentation.

# 

# The project is maintained as a personal learning and portfolio application. The code and architecture should be reviewed and understood before being presented in an interview.

# 

# The goal of this project is to demonstrate practical understanding of:

# 

# \- C# / ASP.NET Core

# \- REST API development

# \- Entity Framework Core

# \- SQL Server

# \- React

# \- Automated testing

# \- Git/GitHub

# \- CI workflows

# \- Docker

# \- Full-stack application architecture

# 

# \---

# 

# \## Author

# 

# \### Akhila Gogulamudi

# 

# \*\*.NET Developer | C# | ASP.NET Core | SQL Server | React | Azure\*\*

# 

# This project is part of my personal software development portfolio and demonstrates hands-on full-stack development and backend-focused application development.

# 

# \---

# 

# \## License

# 

# This project is intended for portfolio and educational demonstration purposes.

