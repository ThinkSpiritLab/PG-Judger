/*
 * File: pool.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Th Aug 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu Aug 01 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Pool, createPool } from 'generic-pool'
// const genericPool = require("generic-pool");
import * as Database from 'better-sqlite3'
import { Database as DB } from 'better-sqlite3'

export class MemorySqlite {
  private static pool = createPool(
    {
      create: async () => {
        return new Database(':memory:')
      },
      destroy: async (db: DB) => {
        db.close()
      }
    },
    { min: 4, max: 16 }
  )

  static {
    this.pool.on('factoryCreateError', function (err) {
      console.log('factoryCreateError', err)
    })

    this.pool.on('factoryDestroyError', function (err) {
      console.log('factoryDestroyError', err)
    })
  }

  static async acquire(): Promise<DB> {
    const db = await this.pool.acquire()

    // delete all tables
    const tables = db
      .prepare<
        [],
        { name: string }
      >("SELECT name FROM sqlite_master WHERE type='table'")
      .all()

    for (const table of tables) {
      db.prepare(`DELETE FROM ${table.name}`).run()
    }

    return db
  }

  static async release(db: DB) {
    await this.pool.release(db)
  }

  static async withMemDb<T>(callback: (db: DB) => Promise<T>): Promise<T> {
    const db = await this.acquire()
    try {
      return await callback(db)
    } finally {
      await this.release(db)
    }
  }
}
