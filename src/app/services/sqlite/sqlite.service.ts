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
      console.log(`in DatabaseService.initialize isWeb: ${this.isWeb}`);
      if (this.isWeb) {
        const webStoreName = 'cap-sqlite';
        if (!document.querySelector(webStoreName)) {
          const jeepSqlite = document.createElement(webStoreName);
          document.body.appendChild(jeepSqlite);
          await customElements.whenDefined(webStoreName);
        }
        await this.sqlite.initWebStore();
      }

      this.db = await this.sqlite.createConnection('cap-sqlite', false, 'no-encryption', 1, false);
      if (this.db != null) {
        await this.db!.open();
        if (this.platform !== 'android') {
          await this.db!.execute(`PRAGMA journal_mode=WAL;`, false);
        }
        await this.ensureTablesExist(this.db, this.headers, this.headersName);
        await this.ensureTablesExist(this.db, this.materials, this.materialsName);
        const tableList: any = await this.db!.getTableList();
        console.log(`in initialize tableList: ${JSON.stringify(tableList)}`);
        if (tableList.values.length !== 2) {
          return Promise.reject(`Error: table's list !== 2`);
        }
        if (this.isWeb) {
          await this.sqlite.saveToStore('test');
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


  public async runTests(): Promise<void | any> {
    const transaction = ['ios', 'android'].includes(this.platform) ? true : false;
    try {
      const isTable1: any = (await this.db!.isTable(this.headersName)).result;
      console.log(`isTable1: ${isTable1}`);
      const tOne: DBSQLiteValues | any = await this.db!.query(`Select Count(*) as count from ${this.headersName};`)
      const res1: any = isTable1 ? tOne.values[0].count : 0;
      const isTable2: any = (await this.db!.isTable(this.materialsName)).result;
      console.log(`isTable2: ${isTable2}`);
      const tTwo: DBSQLiteValues | any = await this.db!.query(`Select Count(*) as count from ${this.materialsName};`)
      const res2 = isTable2 ? tTwo.values[0].count : 0;

      console.log(`number of data: ${res1} in table ${this.headersName}`);
      console.log(`number of data: ${res2} in table ${this.materialsName}`);

      if (res1 > 0) {
        await this.db?.execute(`DELETE FROM ${this.headersName};`, true);
      }
      if (res2 > 0) {
        await this.db!.execute(`DELETE FROM ${this.materialsName};`, true);
      }
      if (!transaction) {
        await this.db!.execute('BEGIN TRANSACTION;', false);
        console.log('after begin');
      }
      await Promise.all([
        this.test(this.db, this.headersName, transaction), this.test(this.db, this.materialsName, transaction),
      ]);
      if (!transaction) {
        await this.db!.execute('COMMIT TRANSACTION;', false);
        console.log('after commit');
      }

      console.log(`count in ${this.headersName}: ${await this.getCount(this.db, this.headersName)}`);
      console.log(`count in ${this.materialsName}: ${await this.getCount(this.db, this.materialsName)}`);
      return Promise.resolve({});
    } catch (err: any) {
      if (!transaction) {
        await this.db!.execute('ROLLBACK TRANSACTION;', false);
        console.log('after rollback');
      }
      const msg = err.message ? err.message : err;
      return Promise.reject(`Error: ${msg}`);
    } finally {
      await this.sqlite.closeConnection('test', false);

    }
  }

  private async ensureTablesExist(db: SQLiteDBConnection, table: string, tableName: string) {
    try {
      console.log(`in ensureTablesExist tableName: ${table}`);
      const res: any = await db.execute(table, true);
      const isTable: any = (await this.db!.isTable(tableName)).result;
      console.log(`in ensureTablesExist '${table}' isTable: ${isTable}`);
      return Promise.resolve({});
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`Error: ${msg}`);
    }
  }

  private async test(db: SQLiteDBConnection, tableName: string, transaction: boolean): Promise<void> {
    try {
      console.log(`>>>>> in test table: ${tableName} starts >>>>>`);
      const values = [];
      values.push(Guid.create().toString());
      const statemenheaders = `Insert into ${tableName} (id, nb, description) values (?,?,?)`;
      const iters = 1000;
      let i = 0;
      do {
        i++;
        const nb = Math.random() * 1000;
        const desc = Guid.create().toString();
        await this.createItem(db, statemenheaders, [Guid.create().toString(), nb, desc], transaction);
        if (i === 200 || i === 400 || i === 600 || i === 800 || i === 1000) {
          console.log(`>>>>> in test table: ${tableName} iteration: ${i} >>>>>`);
        }
      } while (i < iters);
      console.log(`>>>>> in test table: ${tableName} ends >>>>>`);
      return;
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`Error: ${msg}`);
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

  private async getCount(db: SQLiteDBConnection | any, tableName: string): Promise<number> {
    return (await db.query(`Select Count(*) as count from ${tableName};`)).values[0].count;
  }

  private async createItem(db: SQLiteDBConnection, stmt: string, values: any[],
    transaction: boolean): Promise<void> {
    try {
      await db.run(stmt, values, transaction);
      return;
    } catch (err: any) {
      const msg = err.message ? err.message : err;
      return Promise.reject(`createItem: ${msg}`);
    }
  }
}