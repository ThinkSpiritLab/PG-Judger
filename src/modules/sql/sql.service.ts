import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';

@Injectable()
export class SqlService {
  constructor() {
    // const db = new Database('foobar.db', {
    //   verbose: console.log,
    // });
    // db.pragma('journal_mode = WAL');
    
  }
}
