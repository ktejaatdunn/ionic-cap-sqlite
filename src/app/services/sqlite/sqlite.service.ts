import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, DBSQLiteValues, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const Guid = {
  create: () => { return '' }
}

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {
  private readonly isWeb: boolean;
  private readonly platform: string;
  private readonly sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  //    private db1: SQLiteDBConnection | null = null;

  private readonly headersName = 'headers'
  private readonly headers = `CREATE TABLE IF NOT EXISTS headers (
    id TEXT PRIMARY KEY,
    contract TEXT,
    contractBranch INTEGER,
    customerAddress TEXT,
    customerName TEXT,
    plannedActDate TEXT,
    actualActDate TEXT,
    vapsStatus TEXT,
    vapsStatusDescription TEXT,
    syncStatus TEXT,
    message TEXT,
    serial TEXT,
    serialDescription TEXT,
    userId TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );`;

  private readonly materialsName = 'materials'
  private readonly materials = `CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    headerInfoId TEXT,
    itemNumber INTEGER,
    material TEXT,
    materialDescription TEXT,
    uom TEXT,
    qtyOrdered INTEGER,
    qtyIssued INTEGER,
    qtyDelivered INTEGER,
    qtyToIssued INTEGER,
    stockAvail TEXT,
    instrToloader TEXT,
    pgi TEXT,
    defaultBranch INTEGER,
    contract TEXT,
    contractBranch INTEGER,
    fulFillmentBranch INTEGER,
    syncStatus TEXT,
    message TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (headerInfoId) REFERENCES header(id)
  );`;

  constructor() {
    this.isWeb = !Capacitor.isNativePlatform();
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.platform = Capacitor.getPlatform();
  }

  public async initialize(): Promise<void> {
    try {
      this.db = await this.sqlite.createConnection('cap-sqlite', false, 'no-encryption', 1, false);
      if (this.db != null) {
        await this.db!.open();
        if (this.platform !== 'android') {
          await this.db!.execute(`PRAGMA journal_mode=WAL;`, false);
        }
        return;
      } else {
        return Promise.reject(`Error: createConnection failed`);
      }
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      return Promise.reject({ ...err, msgg: `Error: ${msg}` });
    }
  }

  getHeaders() {
    return new Promise((resolve, reject) => {
      this.db.query(`select * from ${this.headersName}`).then(resp => {
        console.log("headers:::::::::::::::\n", resp);
        resolve(resp)
      }, err => {
        console.error("Error while getting headers:::::::::::::::\n", err);
        reject(err)
      });
    });
  }

  getMaterials() {
    return new Promise((resolve, reject) => {
      this.db.query(`select * from ${this.materialsName}`).then(resp => {
        console.log("materials:::::::::::::::\n", resp);
        resolve(resp)
      }, err => {
        console.error("Error while getting materials:::::::::::::::\n", err);
        reject(err)
      });
    });
  }

  insertHeader(params: Array<any>) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${this.headersName} (id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription)
      VALUES ${params.join(",")}`
      this.db.query(query).then(resp => {
        console.log("hinsert eaders:::::::::::::::\n", resp);
        resolve(resp)
      }, err => {
        console.error("Error while getting headers:::::::::::::::\n", err);
        reject(err)
      });
    });
  }

  inserSingletHeader(params: Array<any>) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${this.headersName} (id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      this.db.query(query, params).then(resp => {
        console.log("hinsert eaders:::::::::::::::\n", resp);
        resolve(resp)
      }, err => {
        console.error("Error while getting headers:::::::::::::::\n", err);
        reject(err)
      });
    });
  }

  insertMaterial(params: any) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${this.materialsName} (id, contract, contractBranch, createdAt, defaultBranch, fulFillmentBranch, headerInfoId, instrToloader, itemNumber, material, materialDescription, message, pgi, qtyDelivered, qtyIssued, qtyOrdered, qtyToIssued, stockAvail, syncStatus, uom, updatedAt) VALUES (?);`
      this.db.query(query, params).then(resp => {
        console.log("insert material:::::::::::::::\n", resp);
        resolve(resp)
      }, err => {
        console.error("Error while getting headers:::::::::::::::\n", err);
        reject(err)
      });
    });
  }

  clearData() {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${this.headersName}; DELETE FROM ${this.materialsName};`
      this.db.query(query).then(resp => {
        console.log("clear data:::::::::::::::\n", resp);
        resolve(resp)
      }, err => {
        console.error("Error while getting clearing the data:::::::::::::::\n", err);
        reject(err)
      });
    });
  }
}