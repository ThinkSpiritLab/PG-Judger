/*
 * File: malql-test.ts                                                         *
 * Project: pg-judger                                                          *
 * Created Date: Th Jul 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu Jul 25 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

const MalqlTests = {
  DROP_TABLE: /DROP\s+TABLE/i,
  DELETE_FROM: /DELETE\s+FROM/i,
  UPDATE_SET: /UPDATE\s+\w+\s+SET/i,
  INSERT_INTO: /INSERT\s+INTO/i,
  COMMENT: /--/,
  MULTIPLE_STATEMENTS: /;/g,
} as const


export function containsMaliciousSQL(userSql: string, cfg?: (keyof typeof MalqlTests)[]): boolean {
  const forbiddenPatterns = cfg ? cfg.map(key => MalqlTests[key]) : Object.values(MalqlTests);
  return forbiddenPatterns.some(pattern => pattern.test(userSql));
}