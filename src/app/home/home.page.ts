import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';
import { performance } from 'perf_hooks';
import { SQLiteService } from '../services/sqlite/sqlite.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private initPlugin!: boolean;

  insertHeaderTime: any;
  insertHeaderEndTime: any;

  insertMaterialTime: any;
  insertMaterialEndTime: any;


  getHeaderTime: any;
  getHeaderEndTime: any;


  getMaterialTime: any;
  getMaterialEndTime: any;

  chunk: any = 100;
  headers: any = [];
  materials: any = [];

  constructor(
    private _sqlite: SQLiteService,
    private _http: HttpClient
  ) {
    this.loadHeaders();
  }

  addHeadersData() {
    this.insertHeaderTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    const { id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription } = this.headers[0];
    this._sqlite.inserSingletHeader([id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription]).then(resp => {
      this.insertHeaderEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    })
  }

  // addHeadersBulkData(index = 0) {
  //   let temparray = [];
  //   console.warn((index + this.chunk), index, this.chunk);
  //   for (let i = index; i < this.headers.length; i++) {
  //     console.log((index + this.chunk), index, i, this.chunk);
  //     if (i >= (index + this.chunk)) {
  //       console.error((index + this.chunk), index, i, this.chunk);
  //       break;
  //     }
  //     const { id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription } = this.headers[i];
  //     temparray.push([id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription])
  //   }
  //   console.log("Headers temparray::::::::::::::::\n", temparray);
  //   this._sqlite.insertHeader(temparray).then(resp => {
  //     this.insertHeaderEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
  //     index = index + this.chunk
  //     if (!(index >= this.headers.length)) {
  //       this.addHeadersBulkData(index);
  //     }
  //   });
  // }

  addHeadersBulkData(index = 0) {
    let temparray = [];
    console.warn((index + this.chunk), index, this.chunk);
    for (let i = index; i < this.headers.length; i++) {
      console.log((index + this.chunk), index, i, this.chunk);
      if (i >= (index + this.chunk)) {
        console.error((index + this.chunk), index, i, this.chunk);
        break;
      }
      const { id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription } = this.removeQuotes(this.headers[i]);
      temparray.push(`('${id}', '${actualActDate}', '${contract}', ${contractBranch}, '${createdAt}', '${customerAddress}', '${customerName}', '${message}', '${plannedActDate}', '${serial}', '${serialDescription}', '${syncStatus}', '${updatedAt}', '${userId}', '${vapsStatus}', '${vapsStatusDescription}')`)
    }
    console.log("Headers temparray::::::::::::::::\n", temparray, temparray.join(","));
    this._sqlite.insertHeader(temparray).then(resp => {
      this.insertHeaderEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
      index = index + this.chunk
      if (!(index >= this.headers.length)) {
        this.addHeadersBulkData(index);
      }
    });
  }

  addMaterialsBulkData(index = 0) {
    let temparray = [];
    for (let i = index; i < this.materials.length; i++) {
      if (i >= (index + this.chunk)) {
        break;
      }
      const { id, contract, contractBranch, createdAt, defaultBranch, fulFillmentBranch, headerInfoId, instrToloader, itemNumber, material, materialDescription, message, pgi, qtyDelivered, qtyIssued, qtyOrdered, qtyToIssued, stockAvail, syncStatus, uom, updatedAt } = this.materials[i];
      temparray.push([id, contract, contractBranch, createdAt, defaultBranch, fulFillmentBranch, headerInfoId, instrToloader, itemNumber, material, materialDescription, message, pgi, qtyDelivered, qtyIssued, qtyOrdered, qtyToIssued, stockAvail, syncStatus, uom, updatedAt])
    }
    console.log("Materials temparray::::::::::::::::\n", temparray);
    this._sqlite.insertHeader(temparray).then(resp => {
      this.insertHeaderEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
      index = index + this.chunk
      if (!(index >= this.materials.length)) {
        this.addMaterialsBulkData(index);
      }
    });
  }

  addMaterialsData() {
    this.insertMaterialTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    const { id, contract, contractBranch, createdAt, defaultBranch, fulFillmentBranch, headerInfoId, instrToloader, itemNumber, material, materialDescription, message, pgi, qtyDelivered, qtyIssued, qtyOrdered, qtyToIssued, stockAvail, syncStatus, uom, updatedAt } = this.materials[0];
    this._sqlite.insertMaterial([id, contract, contractBranch, createdAt, defaultBranch, fulFillmentBranch, headerInfoId, instrToloader, itemNumber, material, materialDescription, message, pgi, qtyDelivered, qtyIssued, qtyOrdered, qtyToIssued, stockAvail, syncStatus, uom, updatedAt]).then(resp => {
      this.insertMaterialEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    })
  }

  getHeaders() {
    this.getHeaderTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    this._sqlite.getHeaders().then(resp => {
      this.getHeaderEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    })
  }

  getMaterials() {
    this.getMaterialTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    this._sqlite.getMaterials().then(resp => {
      this.getMaterialEndTime = Date.parse(new Date().toLocaleString()) + " | " + moment().format('MMMM Do YYYY, h:mm:ss:SSS a');
    })
  }

  clearData() {
    this._sqlite.clearData().then(resp => {
      this.insertHeaderTime = null;
      this.insertHeaderEndTime = null;

      this.insertMaterialTime = null;
      this.insertMaterialEndTime = null;


      this.getHeaderTime = null;
      this.getHeaderEndTime = null;


      this.getMaterialTime = null;
      this.getMaterialEndTime = null;
    })
  }

  loadHeaders() {
    this._http.get('../../assets/Header.json').subscribe((resp: any) => {
      console.log("HTTP headers Resp:::::::::::::::::::::::::::::::::\n", resp);
      this.headers = resp?.data;
    }, err => {
      console.error("HTTP headers error:::::::::::::::::::::::::::::::::\n", err);
    });
  }

  loadMaterials() {
    this._http.get('../../assets/Item.json').subscribe(resp => {
      console.log("HTTP materials Resp:::::::::::::::::::::::::::::::::\n", resp);
    }, err => {
      console.error("HTTP materials error:::::::::::::::::::::::::::::::::\n", err);
    });
  }

  removeQuotes(data: any) {
    const tempData: any = {};
    for (let key in data) {
      if (data[key]?.includes('"')) {
        data[key] = data[key]?.split('"').join("");
      }
    }
    console.log("tempdata in removeQuotes::::|n", tempData);
    const { id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription } = tempData;
    return { id, actualActDate, contract, contractBranch, createdAt, customerAddress, customerName, message, plannedActDate, serial, serialDescription, syncStatus, updatedAt, userId, vapsStatus, vapsStatusDescription }
  }
}
