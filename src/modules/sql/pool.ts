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

import genericPool from 'generic-pool'
import * as Database from 'better-sqlite3'

class MemorySqlite {
  private static pool = genericPool.createPool({
    create: async () => {
      return new Database(':memory:')
    },
    destroy: async (db: Database.Database) => {
      db.close()
    }
  })

  static async get() {
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

  static async release(db: Database.Database) {
    await this.pool.release(db)
  }
}
