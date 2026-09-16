# Nagarkot Forwarders — Shipment Status Tracker

A full-stack, real-time cargo shipment tracking web application engineered for **Nagarkot Forwarders Pvt. Ltd.**.

---

## 🚀 Tech Stack & Design Rationale

- **Frontend**: **React 18 + Vite + TypeScript + Tailwind CSS**
  - *Why*: Vite provides instantaneous HMR development cycles, small production bundle sizes, and seamless static deployment on **Vercel**. Tailwind CSS combined with custom glassmorphism tokens provides modern aesthetics, color-coded status badges, and dynamic responsive layouts.
- **Backend**: **Node.js + Express + TypeScript**
  - *Why*: Lightweight, non-blocking asynchronous REST API framework easily deployable on **Render** or **Railway**. Standardized layer division (`routes` $\rightarrow$ `controllers` $\rightarrow$ `services` $\rightarrow$ `db`).
- **Database Layer**: **PostgreSQL** (with lightweight **SQLite** fallback)
  - *Why*: PostgreSQL directly reflects Nagarkot's production stack. The system uses connection pooling with atomic database transactions when updating status to guarantee sync between the `shipments` table and `shipment_history` audit log. A zero-config SQLite fallback is included so the application runs immediately without pre-configured local database setup.

---

## 🛠️ How to Run Locally

### Option A: Standard Local Execution (Recommended)

1. **Install Dependencies**:
   ```bash
   # From workspace root or app_build/ directory:
   npm run install:all
   ```

2. **Start Backend & Frontend Concurrently**:
   ```bash
   npm run dev
   ```
   - **Backend API**: Running on `http://localhost:5000`
   - **Frontend App**: Running on `http://localhost:3000`

### Option B: Running PostgreSQL via Docker Compose

1. **Spin up PostgreSQL container**:
   ```bash
   docker-compose up -d
   ```
2. **Start backend with Postgres connection string**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📌 Data Model & Status Workflow Assumptions

### Standardized Status Stages
$$\text{Booked} \longrightarrow \text{In Transit} \longrightarrow \text{Customs Hold} \longrightarrow \text{Out for Delivery} \longrightarrow \text{Delivered} \quad (\text{or } \text{Cancelled})$$

### Core Tables
1. `shipments`: Contains `id`, `reference_number` (unique), `origin`, `destination`, `current_status`, `expected_delivery_date`, `carrier`, `notes`, `created_at`, `updated_at`.
2. `shipment_history`: Audit log tracking foreign-key linked `shipment_id`, stage `status`, location update/comments, and precise ISO `timestamp`.

### Key Assumptions
- Updating a shipment's status automatically logs a new entry in `shipment_history` within an atomic database transaction.
- When creating a shipment without specifying a reference number, the system automatically generates a formatted tracking reference (e.g. `NAG-2026-9810`).
- Authentication and user role management were explicitly omitted as out-of-scope per prompt requirements.

---

## ⚡ Scalability Reflection (10,000 Shipments & High Concurrency)

> *"If this application needed to support 10,000 shipments and multiple concurrent users, what would you change?"*

To scale the Shipment Status Tracker for high-frequency reads and concurrent status updates across 10,000+ active shipments, I would introduce a database read-replica cluster behind PgBouncer connection pooling to offload dashboard query traffic. Caching hot queries (such as active shipment stats and frequently checked reference numbers) using Redis or an edge CDN cache would reduce database load to $O(1)$ response times. For concurrent write spikes (such as automated IoT container GPS updates), status updates would be published asynchronously to a message broker (e.g., RabbitMQ or Apache Kafka), decoupling the ingestion worker threads from the API server. Furthermore, adding composite database indexes on `(reference_number)`, `(current_status, updated_at)`, and `(shipment_id, timestamp)` ensures $O(\log N)$ query optimization.
