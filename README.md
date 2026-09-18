# Nagarkot Forwarders — Shipment Status Tracker 📦⚓

A full-stack, enterprise-grade cargo shipment tracking platform engineered for **Nagarkot Forwarders Pvt. Ltd.**. Built with a modern **React 18 + Vite** frontend, **Node.js + Express** REST backend, **PostgreSQL** database (with zero-config **SQLite** fallback), and **AI-powered logistics tools** (Natural Language Search & Smart Document Parser).

---

## 🌟 Key Features

- 🚢 **Complete Shipment Lifecycle Tracking**: Monitor shipments through standardized stages (`Booked` 🔵 $\rightarrow$ `In Transit` 🟡 $\rightarrow$ `Customs Hold` 🔴 $\rightarrow$ `Out for Delivery` 🟣 $\rightarrow$ `Delivered` 🟢).
- 📜 **Audit History & Timeline**: Every status update automatically generates an immutable audit record in `shipment_history` within atomic database transactions.
- 🧠 **AI Natural Language Search**: Query shipments using conversational queries (e.g., *"Find all delayed customs shipments bound for Rotterdam"* or *"Show me active shipments from Mumbai"*).
- 📄 **Smart Document Parser**: Extract tracking numbers, origin, destination, carriers, and dates directly from bills of lading or shipping document text using intelligent parsing.
- 📊 **Real-time Analytics Dashboard**: Live metrics counters displaying total active, delivered, delayed, and customs hold counts.
- 🎨 **Glassmorphic UI & Dark Aesthetics**: Built with Tailwind CSS, custom glassmorphism design tokens, smooth animations, and Lucide icons.
- 🗄️ **Dual Database Support**: Production-ready PostgreSQL pooling with an automatic SQLite fallback for instant zero-setup local execution.

---

## 🏗️ Project Architecture & Directory Structure

```
nagarkot/
├── app_build/                    # Core Full-Stack Application Monorepo
│   ├── backend/                  # Node.js + Express REST API Server (TypeScript)
│   │   ├── src/
│   │   │   ├── controllers/      # Shipment & AI controllers
│   │   │   ├── db/               # PostgreSQL & SQLite connection pools & schema init
│   │   │   ├── routes/           # REST API routes (/api/shipments, /api/ai)
│   │   │   ├── services/         # Business logic & AI parsing service
│   │   │   └── types/            # TypeScript interfaces
│   │   └── package.json
│   ├── frontend/                 # React 18 + Vite SPA Frontend (TypeScript)
│   │   ├── src/
│   │   │   ├── components/       # UI components (AISearchBar, SmartDocumentParserModal, etc.)
│   │   │   ├── services/         # API client & fetch services
│   │   │   └── App.tsx           # Main Dashboard View
│   │   └── package.json
│   ├── docker-compose.yml        # PostgreSQL 16 Alpine container configuration
│   └── package.json              # Monorepo root script runner
├── production_artifacts/         # Production Design Docs & Specs
│   └── Technical_Specification.md# Technical specification document
├── README.md                     # Main Repository Documentation (This file)
└── Nagarkot Technical Assignment.pdf
```

---

## 🛠️ Technology Stack & Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | **React 18 + Vite + TypeScript + Tailwind CSS** | Instant HMR development cycles, robust type safety, small production bundle sizes, and glassmorphic micro-animations. |
| **Backend** | **Node.js + Express + TypeScript** | Non-blocking asynchronous REST API framework cleanly separated into controllers, services, and routes. |
| **Database** | **PostgreSQL** (Primary) / **SQLite** (Fallback) | PostgreSQL reflects Nagarkot's enterprise stack with atomic transactions. Zero-config SQLite fallback allows running instantly without DB setup. |
| **Containerization** | **Docker Compose** | One-command local spin up for PostgreSQL 16. |
| **AI / Intelligence** | **Natural Language Parser & Document Extraction** | Instant query intent extraction and automated bill of lading document processing. |

---

## 🚀 How to Run Locally

### Option A: Standard Quick Start (Recommended)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jatingidh0410/ai-logistics-tool.git
   cd ai-logistics-tool
   ```

2. **Install Monorepo Dependencies**:
   ```bash
   cd app_build
   npm run install:all
   ```

3. **Start Backend & Frontend Concurrently**:
   ```bash
   npm run dev
   ```
   - **Frontend Dashboard**: `http://localhost:3000`
   - **Backend REST API**: `http://localhost:5000`

---

### Option B: Running with PostgreSQL via Docker

1. **Start PostgreSQL Container**:
   ```bash
   cd app_build
   docker-compose up -d
   ```

2. **Start Backend with Database Connection**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend in Another Terminal**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📡 REST API Reference

### Shipment Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shipments` | Fetch all shipments with optional `search` & `status` filters |
| `POST` | `/api/shipments` | Register new shipment (auto-generates tracking `reference_number` if omitted) |
| `GET` | `/api/shipments/:id` | Get single shipment details with complete history timeline |
| `PATCH` | `/api/shipments/:id/status` | Update shipment status stage and record history log atomically |
| `GET` | `/api/shipments/:id/history` | Retrieve chronological status audit trail |

### AI Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/query` | Parse natural language query into structured database filters |
| `POST` | `/api/ai/parse-doc` | Extract structured shipment details from shipping document text |

---

## 📌 Data Model & Database Schema

### `shipments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER / UUID` | PRIMARY KEY | Unique shipment identifier |
| `reference_number` | `VARCHAR(50)` | UNIQUE, NOT NULL | Public tracking number (e.g. `NAG-2026-9810`) |
| `origin` | `VARCHAR(100)` | NOT NULL | Departure port/city |
| `destination` | `VARCHAR(100)` | NOT NULL | Destination port/city |
| `current_status` | `VARCHAR(50)` | NOT NULL | Current lifecycle status |
| `expected_delivery_date` | `DATE` | NOT NULL | Estimated delivery date |
| `carrier` | `VARCHAR(100)` | NULLABLE | Carrier / shipping line |
| `notes` | `TEXT` | NULLABLE | Additional comments |
| `created_at` | `TIMESTAMP` | DEFAULT `NOW()` | Registration timestamp |
| `updated_at` | `TIMESTAMP` | DEFAULT `NOW()` | Last status change timestamp |

### `shipment_history` Audit Log Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER / UUID` | PRIMARY KEY | History record ID |
| `shipment_id` | `INTEGER / UUID` | FOREIGN KEY (`shipments.id`) | Reference to shipment |
| `status` | `VARCHAR(50)` | NOT NULL | Status recorded at transition |
| `location_comment` | `TEXT` | NULLABLE | Transition details / location comment |
| `timestamp` | `TIMESTAMP` | DEFAULT `NOW()` | ISO timestamp of status change |

---

## ⚡ Scalability Architecture Strategy (10,000+ Shipments)

> *"If this application needed to support 10,000 shipments and high concurrent usage, what changes would be implemented?"*

To scale the Shipment Status Tracker for high-frequency dashboard reads and concurrent automated status updates:
1. **Database Clustering & Read Replicas**: Deploy PostgreSQL with PgBouncer connection pooling and dedicated read replicas to offload query traffic.
2. **Caching Layer**: Cache frequent searches, active metrics, and hot shipment reference numbers using **Redis** for $O(1)$ response times.
3. **Asynchronous Write Pipelines**: Use a message queue (**RabbitMQ** or **Apache Kafka**) for incoming IoT/carrier status updates to decouple ingestion from HTTP response threads.
4. **Database Indexing**: Composite indexes on `(reference_number)`, `(current_status, updated_at)`, and `(shipment_id, timestamp)` maintain $O(\log N)$ query optimization.

---

*Engineered for Nagarkot Forwarders Pvt. Ltd. | September 2026*
