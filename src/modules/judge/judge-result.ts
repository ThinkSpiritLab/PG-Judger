import { MeterResult } from "../meter/meter.service"
import { TestCase } from "./judge.service"
type Result = {
  measure?: MeterResult
  result: string
}

export class JudgeResultBuilder {
  _results: Result[] = []
  _n_testcases: number = 0

  constructor(testcases: TestCase[]) {
    this._n_testcases = testcases.length
  }

  push(...result: Result[]) {
    this._results.push(...result)
  }

  push_copies(result: Result, n_copies: number) {
    this._results.push(...Array(n_copies).fill(result))
  }

  fill_unjudged() {
    this.push_copies({ result: 'UNJUDGED' }, this._n_testcases - this._results.length)
  }

  fill(result: Result) {
    this.push_copies(result, this._n_testcases - this._results.length)
  }

  set(result: Result, idx: number) {
    this._results[idx] = result
  }

  get(idx: number) {
    return this._results[idx]
  }

  get results() {
    this.fill_unjudged()
    return this._results
  }
}