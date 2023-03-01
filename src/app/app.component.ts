import { Component, OnInit } from '@angular/core';
import { SQLiteService } from './services/sqlite/sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private sqliteService: SQLiteService) {
  }
  async ngOnInit() {
    try {
      console.log(`in AppComponent initialize`);
      await this.sqliteService.initialize();
    } catch (err: any) {
      console.error("Error in initalization::::::::::::::::::::\n", err)
      console.error("Error in initalization::::::::::::::::::::\n", { ...err })
      const msg = err.message ? err.message : err;
    }
  }
}