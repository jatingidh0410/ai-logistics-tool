import { Pool } from 'pg';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Shipment, ShipmentHistory, ShipmentStatus } from '../types/index.js';

dotenv.config();

let pgPool: Pool | null = null;
let sqliteDb: Database | null = null;
let isPgAvailable = false;

export async function initDb(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      pgPool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 3000,
      });

      const client = await pgPool.connect();
      console.log(' Successfully connected to PostgreSQL Database.');

      await client.query(`
        CREATE TABLE IF NOT EXISTS shipments (
          id VARCHAR(100) PRIMARY KEY,
          reference_number VARCHAR(100) UNIQUE NOT NULL,
          origin VARCHAR(150) NOT NULL,
          destination VARCHAR(150) NOT NULL,
          current_status VARCHAR(50) NOT NULL,
          expected_delivery_date VARCHAR(50) NOT NULL,
          carrier VARCHAR(100),
          notes TEXT,
          created_at VARCHAR(50) NOT NULL,
          updated_at VARCHAR(50) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS shipment_history (
          id VARCHAR(100) PRIMARY KEY,
          shipment_id VARCHAR(100) REFERENCES shipments(id) ON DELETE CASCADE,
          status VARCHAR(50) NOT NULL,
          location_comment TEXT,
          timestamp VARCHAR(50) NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_shipments_ref ON shipments(reference_number);
        CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(current_status);
        CREATE INDEX IF NOT EXISTS idx_history_shipment_id ON shipment_history(shipment_id);
      `);

      client.release();
      isPgAvailable = true;
      await seedDatabaseIfEmpty();
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to PostgreSQL. Falling back to local SQLite database...', (err as Error).message);
      if (pgPool) {
        await pgPool.end().catch(() => {});
        pgPool = null;
      }
    }
  }

  // Fallback SQLite Database Setup
  sqliteDb = await open({
    filename: './data.sqlite',
    driver: sqlite3.Database,
  });

  console.log(' Connected to fallback SQLite database.');

  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      reference_number TEXT UNIQUE NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      current_status TEXT NOT NULL,
      expected_delivery_date TEXT NOT NULL,
      carrier TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shipment_history (
      id TEXT PRIMARY KEY,
      shipment_id TEXT NOT NULL,
      status TEXT NOT NULL,
      location_comment TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
    );
  `);

  await seedDatabaseIfEmpty();
}

async function seedDatabaseIfEmpty(): Promise<void> {
  const shipments = await getAllShipmentsFromDb();
  if (shipments.length > 0) return;

  console.log('🌱 Seeding database with initial sample shipments...');

  const sampleShipments = [
    {
      reference_number: 'NAG-2026-9810',
      origin: 'Mumbai Port (INBOM)',
      destination: 'Rotterdam Gateway (NLRTM)',
      current_status: 'In Transit' as ShipmentStatus,
      expected_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      carrier: 'Maersk Line',
      notes: 'High-priority pharmaceutical container cargo.',
      history: [
        { status: 'Booked' as ShipmentStatus, comment: 'Shipment created and booking confirmed by carrier.', delay: 2 },
        { status: 'In Transit' as ShipmentStatus, comment: 'Vessel departed Mumbai port. En route via Suez Canal.', delay: 0 }
      ]
    },
    {
      reference_number: 'NAG-2026-9811',
      origin: 'Shanghai Port (CNSHA)',
      destination: 'Hamburg Port (DEHAM)',
      current_status: 'Customs Hold' as ShipmentStatus,
      expected_delivery_date: new Date(Date.now() + 8 * 86400000).toISOString(),
      carrier: 'MSC Mediterranean Shipping',
      notes: 'Electronics machinery. Under inspection by customs officer.',
      history: [
        { status: 'Booked' as ShipmentStatus, comment: 'Booking reference generated at origin Shanghai.', delay: 4 },
        { status: 'In Transit' as ShipmentStatus, comment: 'Container loaded on vessel MSC Oscar.', delay: 2 },
        { status: 'Customs Hold' as ShipmentStatus, comment: 'Customs clearance pending documentation verification.', delay: 0 }
      ]
    },
    {
      reference_number: 'NAG-2026-9812',
      origin: 'Jebel Ali, Dubai (AEJEA)',
      destination: 'Nhava Sheva, India (INNSA)',
      current_status: 'Delivered' as ShipmentStatus,
      expected_delivery_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      carrier: 'CMA CGM Group',
      notes: 'Industrial textile reels.',
      history: [
        { status: 'Booked' as ShipmentStatus, comment: 'Cargo booked at Dubai logistics hub.', delay: 6 },
        { status: 'In Transit' as ShipmentStatus, comment: 'Sailed across Arabian Sea.', delay: 3 },
        { status: 'Out for Delivery' as ShipmentStatus, comment: 'Discharged at terminal; loaded on freight truck.', delay: 1 },
        { status: 'Delivered' as ShipmentStatus, comment: 'Successfully delivered to customer warehouse with signed POD.', delay: 0 }
      ]
    },
    {
      reference_number: 'NAG-2026-9813',
      origin: 'Singapore Port (SGSIN)',
      destination: 'Los Angeles (USLAX)',
      current_status: 'Booked' as ShipmentStatus,
      expected_delivery_date: new Date(Date.now() + 12 * 86400000).toISOString(),
      carrier: 'Hapag-Lloyd',
      notes: 'Automotive spare parts in 40ft High Cube container.',
      history: [
        { status: 'Booked' as ShipmentStatus, comment: 'Shipment booking logged in system.', delay: 0 }
      ]
    }
  ];

  for (const item of sampleShipments) {
    const id = uuidv4();
    const now = new Date().toISOString();

    if (isPgAvailable && pgPool) {
      await pgPool.query(
        `INSERT INTO shipments (id, reference_number, origin, destination, current_status, expected_delivery_date, carrier, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, item.reference_number, item.origin, item.destination, item.current_status, item.expected_delivery_date, item.carrier, item.notes, now, now]
      );

      for (const h of item.history) {
        const histId = uuidv4();
        const timestamp = new Date(Date.now() - h.delay * 86400000).toISOString();
        await pgPool.query(
          `INSERT INTO shipment_history (id, shipment_id, status, location_comment, timestamp)
           VALUES ($1, $2, $3, $4, $5)`,
          [histId, id, h.status, h.comment, timestamp]
        );
      }
    } else if (sqliteDb) {
      await sqliteDb.run(
        `INSERT INTO shipments (id, reference_number, origin, destination, current_status, expected_delivery_date, carrier, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, item.reference_number, item.origin, item.destination, item.current_status, item.expected_delivery_date, item.carrier, item.notes, now, now]
      );

      for (const h of item.history) {
        const histId = uuidv4();
        const timestamp = new Date(Date.now() - h.delay * 86400000).toISOString();
        await sqliteDb.run(
          `INSERT INTO shipment_history (id, shipment_id, status, location_comment, timestamp)
           VALUES (?, ?, ?, ?, ?)`,
          [histId, id, h.status, h.comment, timestamp]
        );
      }
    }
  }

  console.log(' Database seeded successfully!');
}

export async function getAllShipmentsFromDb(statusFilter?: string, searchQuery?: string): Promise<Shipment[]> {
  let queryStr = 'SELECT * FROM shipments WHERE 1=1';
  const params: any[] = [];

  if (statusFilter && statusFilter !== 'ALL') {
    params.push(statusFilter);
    queryStr += isPgAvailable ? ` AND current_status = $${params.length}` : ` AND current_status = ?`;
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const searchPattern = `%${searchQuery.trim().toLowerCase()}%`;
    params.push(searchPattern);
    const paramIdx = params.length;
    if (isPgAvailable) {
      queryStr += ` AND (LOWER(reference_number) LIKE $${paramIdx} OR LOWER(origin) LIKE $${paramIdx} OR LOWER(destination) LIKE $${paramIdx})`;
    } else {
      queryStr += ` AND (LOWER(reference_number) LIKE ? OR LOWER(origin) LIKE ? OR LOWER(destination) LIKE ?)`;
      // For SQLite with placeholder params, duplicate param if needed
      params.push(searchPattern, searchPattern);
    }
  }

  queryStr += ' ORDER BY created_at DESC';

  if (isPgAvailable && pgPool) {
    const res = await pgPool.query(queryStr, params);
    return res.rows as Shipment[];
  } else if (sqliteDb) {
    const rows = await sqliteDb.all(queryStr, params);
    return rows as Shipment[];
  }

  return [];
}

export async function getShipmentByIdFromDb(id: string): Promise<(Shipment & { history: ShipmentHistory[] }) | null> {
  let shipment: Shipment | null = null;
  let history: ShipmentHistory[] = [];

  if (isPgAvailable && pgPool) {
    const shipRes = await pgPool.query('SELECT * FROM shipments WHERE id = $1', [id]);
    if (shipRes.rows.length === 0) return null;
    shipment = shipRes.rows[0] as Shipment;

    const histRes = await pgPool.query(
      'SELECT * FROM shipment_history WHERE shipment_id = $1 ORDER BY timestamp DESC',
      [id]
    );
    history = histRes.rows as ShipmentHistory[];
  } else if (sqliteDb) {
    const shipRow = await sqliteDb.get('SELECT * FROM shipments WHERE id = ?', [id]);
    if (!shipRow) return null;
    shipment = shipRow as Shipment;

    history = (await sqliteDb.all(
      'SELECT * FROM shipment_history WHERE shipment_id = ? ORDER BY timestamp DESC',
      [id]
    )) as ShipmentHistory[];
  }

  if (!shipment) return null;

  return {
    ...shipment,
    history,
  };
}

export async function createShipmentInDb(data: {
  reference_number: string;
  origin: string;
  destination: string;
  expected_delivery_date: string;
  carrier?: string;
  notes?: string;
}): Promise<Shipment> {
  const id = uuidv4();
  const now = new Date().toISOString();
  const initialStatus: ShipmentStatus = 'Booked';

  if (isPgAvailable && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      const shipRes = await client.query(
        `INSERT INTO shipments (id, reference_number, origin, destination, current_status, expected_delivery_date, carrier, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          id,
          data.reference_number,
          data.origin,
          data.destination,
          initialStatus,
          data.expected_delivery_date,
          data.carrier || null,
          data.notes || null,
          now,
          now,
        ]
      );

      const histId = uuidv4();
      await client.query(
        `INSERT INTO shipment_history (id, shipment_id, status, location_comment, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [histId, id, initialStatus, 'Shipment booked and initial record logged.', now]
      );

      await client.query('COMMIT');
      return shipRes.rows[0] as Shipment;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else if (sqliteDb) {
    await sqliteDb.run('BEGIN TRANSACTION');
    try {
      await sqliteDb.run(
        `INSERT INTO shipments (id, reference_number, origin, destination, current_status, expected_delivery_date, carrier, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.reference_number,
          data.origin,
          data.destination,
          initialStatus,
          data.expected_delivery_date,
          data.carrier || null,
          data.notes || null,
          now,
          now,
        ]
      );

      const histId = uuidv4();
      await sqliteDb.run(
        `INSERT INTO shipment_history (id, shipment_id, status, location_comment, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [histId, id, initialStatus, 'Shipment booked and initial record logged.', now]
      );

      await sqliteDb.run('COMMIT');

      const created = await sqliteDb.get('SELECT * FROM shipments WHERE id = ?', [id]);
      return created as Shipment;
    } catch (e) {
      await sqliteDb.run('ROLLBACK');
      throw e;
    }
  }

  throw new Error('Database connection uninitialized');
}

export async function updateShipmentStatusInDb(
  id: string,
  newStatus: ShipmentStatus,
  locationComment?: string
): Promise<{ shipment: Shipment; historyItem: ShipmentHistory }> {
  const now = new Date().toISOString();

  if (isPgAvailable && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      const checkRes = await client.query('SELECT * FROM shipments WHERE id = $1', [id]);
      if (checkRes.rows.length === 0) {
        throw new Error('Shipment not found');
      }

      const updateRes = await client.query(
        `UPDATE shipments 
         SET current_status = $1, updated_at = $2 
         WHERE id = $3 
         RETURNING *`,
        [newStatus, now, id]
      );

      const histId = uuidv4();
      const defaultComment = `Status updated to ${newStatus}`;
      const commentToUse = locationComment && locationComment.trim() !== '' ? locationComment : defaultComment;

      const histRes = await client.query(
        `INSERT INTO shipment_history (id, shipment_id, status, location_comment, timestamp)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [histId, id, newStatus, commentToUse, now]
      );

      await client.query('COMMIT');

      return {
        shipment: updateRes.rows[0] as Shipment,
        historyItem: histRes.rows[0] as ShipmentHistory,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else if (sqliteDb) {
    await sqliteDb.run('BEGIN TRANSACTION');
    try {
      const check = await sqliteDb.get('SELECT * FROM shipments WHERE id = ?', [id]);
      if (!check) {
        throw new Error('Shipment not found');
      }

      await sqliteDb.run(
        `UPDATE shipments SET current_status = ?, updated_at = ? WHERE id = ?`,
        [newStatus, now, id]
      );

      const histId = uuidv4();
      const defaultComment = `Status updated to ${newStatus}`;
      const commentToUse = locationComment && locationComment.trim() !== '' ? locationComment : defaultComment;

      await sqliteDb.run(
        `INSERT INTO shipment_history (id, shipment_id, status, location_comment, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [histId, id, newStatus, commentToUse, now]
      );

      await sqliteDb.run('COMMIT');

      const updatedShipment = await sqliteDb.get('SELECT * FROM shipments WHERE id = ?', [id]);
      const addedHistory = await sqliteDb.get('SELECT * FROM shipment_history WHERE id = ?', [histId]);

      return {
        shipment: updatedShipment as Shipment,
        historyItem: addedHistory as ShipmentHistory,
      };
    } catch (e) {
      await sqliteDb.run('ROLLBACK');
      throw e;
    }
  }

  throw new Error('Database connection uninitialized');
}

export async function getShipmentHistoryFromDb(shipmentId: string): Promise<ShipmentHistory[]> {
  if (isPgAvailable && pgPool) {
    const res = await pgPool.query(
      'SELECT * FROM shipment_history WHERE shipment_id = $1 ORDER BY timestamp DESC',
      [shipmentId]
    );
    return res.rows as ShipmentHistory[];
  } else if (sqliteDb) {
    const rows = await sqliteDb.all(
      'SELECT * FROM shipment_history WHERE shipment_id = ? ORDER BY timestamp DESC',
      [shipmentId]
    );
    return rows as ShipmentHistory[];
  }
  return [];
}
