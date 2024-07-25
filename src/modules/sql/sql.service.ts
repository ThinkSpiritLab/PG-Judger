import { Injectable } from '@nestjs/common'
import * as Database from 'better-sqlite3'

type SqlStmt = string

type SqlInitCases = {
  dbInit: string
}
/*
 表：Employee 

+-------------+---------+
| Column Name | Type    |
+-------------+---------+
| id          | int     |
| name        | varchar |
| salary      | int     |
| managerId   | int     |
+-------------+---------+
id 是该表的主键（具有唯一值的列）。
该表的每一行都表示雇员的ID、姓名、工资和经理的ID。
 

编写解决方案，找出收入比经理高的员工。

以 任意顺序 返回结果表。

结果格式如下所示。

 

示例 1:

输入: 
Employee 表:
+----+-------+--------+-----------+
| id | name  | salary | managerId |
+----+-------+--------+-----------+
| 1  | Joe   | 70000  | 3         |
| 2  | Henry | 80000  | 4         |
| 3  | Sam   | 60000  | Null      |
| 4  | Max   | 90000  | Null      |
+----+-------+--------+-----------+
输出: 
+----------+
| Employee |
+----------+
| Joe      |
+----------+
解释: Joe 是唯一挣得比经理多的雇员。

 */
@Injectable()
export class SqlService {
  constructor() {
    const dbDef = `
    CREATE TABLE Employee (
      id int,
      name varchar,
      salary int,
      managerId int
    );
    `

    //TODO 考虑测试用例直接写values后面的部分，不用写整个sql
    const testCases = [
      {
        dbInit: `
        INSERT INTO Employee (id, name, salary, managerId) VALUES (1, 'Joe', 70000, 3);
        INSERT INTO Employee (id, name, salary, managerId) VALUES (2, 'Henry', 80000, 4);
        INSERT INTO Employee (id, name, salary, managerId) VALUES (3, 'Sam', 60000, NULL);
        INSERT INTO Employee (id, name, salary, managerId) VALUES (4, 'Max', 90000, NULL);
        `
      }
    ]

    const referenceSql = `
    SELECT name Employee 
    FROM Employee e1
    WHERE salary > (SELECT salary FROM Employee e2 WHERE e1.managerId = e2.id);
    `

    const userSql = `
    SELECT
      a.Name AS 'Employee'
    FROM
      Employee AS a,
      Employee AS b
    WHERE
      a.ManagerId = b.Id
        AND a.Salary < b.Salary
    ;
    `

    this.judge(dbDef, testCases, referenceSql, userSql)
  }

  /**
   * use db_snapshot & reference_sql pairs to judge
   * expect the user's sql to have the same output as the reference_sql
   * @param dbDef
   * @param testCases
   * @param userSql
   */
  async judge(
    dbDef: SqlStmt,
    testCases: SqlInitCases[],
    referenceSql: SqlStmt,
    userSql: SqlStmt
  ) {
    const db = new Database(':memory:') 
    //TODO 这个数据库是可以池化，减少创建的开销，每次运行直接删光数据表即可
    //TODO benchmark
    db.pragma('journal_mode = WAL')
    console.log('db created')
    db.exec(dbDef)

    for (const testCase of testCases) {
      // run user's and reference sql
      db.exec(testCase.dbInit)
      console.log(db.prepare('SELECT * FROM Employee').all())

      const userResult = db.prepare(userSql).all()
      console.log(userResult)

      // clean up
      db.exec('DELETE FROM Employee')

      db.exec(testCase.dbInit)
      const referenceResult = db.prepare(referenceSql).all()
      console.log(referenceResult)

      // compare the results
      //TODO 改进比较的方式，不要直接转成字符串比较
      if (JSON.stringify(userResult) !== JSON.stringify(referenceResult)) {
        console.log('WA')
      } else {
        console.log('AC')
      }

      // clean up
      // db.exec('DROP TABLE Employee')
      db.close()
    }
  }
}
