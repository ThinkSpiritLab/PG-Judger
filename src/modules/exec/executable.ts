/*
 * File: executable.ts                                                         *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu Jun 06 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { CompleteStdioOptions, MeterResult, testMeterOrThrow } from '../meter/meter.service'
import { readStream } from '@/utils/io'
import { Readable, Writable } from 'stream'
import { MeterException } from '../meter/meter.exception'

class Executable extends EventEmitter {
  private _executablePath: string
  private _args: string[]
  private childProcess: ChildProcess | null = null
  private _stdio: CompleteStdioOptions

  public getExitAwaiter() {
    return new Promise<number>((resolve, reject) => {
      if (!this.childProcess) {
        // this works fine
        console.warn('Process not found, did you forget to start it?')
        reject(-1)
        return
      }

      this.on('close', (code: number) => {
        resolve(code)
      })

      this.on('exit', (code: number) => {
        resolve(code)
      })
    })
  }

  constructor({
    executablePath,
    args = [],
    stdio
  }: {
    executablePath: string
    args?: string[]
    stdio: CompleteStdioOptions
  }) {
    super()
    this._executablePath = executablePath
    this._args = args
    this._stdio = stdio
  }

  public start() {
    this.childProcess = spawn(this._executablePath, this._args, {
      stdio: this._stdio
    })

    if (!this.childProcess) {
      throw new Error('Failed to start process.')
    }

    this.childProcess.stdout?.on('data', (data: Buffer) => {
      this.emit('stdout', data.toString())
    })

    this.childProcess.stderr?.on('data', (data: Buffer) => {
      this.emit('stderr', data.toString())
    })

    this.childProcess.on('close', (code: number) => {
      this.emit('close', code)
    })

    this.childProcess.on('error', (err: Error) => {
      this.emit('error', err)
    })

    this.childProcess.on('exit', (code: number) => {
      this.emit('exit', code)
    })

    return this.childProcess
  }

  public write(input: string): void {
    if (this.childProcess) {
      this.childProcess.stdin?.write(input)
    } else {
      throw new Error('Process has not been started.')
    }
  }

  public async read(iFd: number | 'stdout' | 'stderr', n: number = 1024) {
    const _iFd = iFd === 'stdout' ? 1 : iFd === 'stderr' ? 2 : iFd
    const stream = this.childProcess?.stdio[_iFd]
    if (!stream) {
      throw new Error('Stream not found.')
    }

    if (stream instanceof Readable) {
      return readStream(stream, n)
    }

    throw new Error('Stream is not readable.')
  }

  public async rdStdout(n: number = 1024) {
    return this.read('stdout', n)
  }

  public async rdStderr(n: number = 1024) {
    return this.read('stderr', n)
  }

  public stop(): void {
    if (this.childProcess) {
      this.childProcess.kill()
      this.childProcess = null
    }
  }

  public get process(): ChildProcess | null {
    return this.childProcess
  }

  public get stdio(): CompleteStdioOptions {
    return this._stdio
  }
}

class MeteredExecuable extends Executable {
  constructor(
    o: {
      executablePath: string
      args?: string[]
      stdio: CompleteStdioOptions
    },
    private meterFd: number,
    private limit?: { cpuTime: number; memory: number }
  ) {
    super(o)
  }

  measure: Promise<MeterResult> | null = null

  override start() {
    const process = super.start()

    this.measure = new Promise((resolve, reject) => {
      if (!this.process) {
        console.error('Process not found, did you forget to start it?')
        reject(new MeterException('runtime-error', null, 'process not found'))
        return
      }
      this.process.on('error', (err) => {
        console.error('Process error:', err)
        reject(new MeterException('runtime-error', null, err.message))
      })
      let resultStr = ''
      const resultStream: Readable = this.process.stdio[
        this.meterFd
      ] as Readable
      resultStream.setEncoding('utf-8')
      resultStream.on('error', (err) => {
        console.error('Stream error:', err)
        reject(new MeterException('runtime-error', null, err.message))
      })
      resultStream.on('data', (chunk) => (resultStr += chunk))
      resultStream.on('end', () => {
        try {
          const result = JSON.parse(resultStr)
          // if (this.limit) {
          //   testMeterOrThrow(result, this.limit)
          // }
          resolve(result)
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.error('Parse error:', e, `Result: ${resultStr}`)
            reject(new MeterException('runtime-error', null, e.message))
          }
          reject(e)
        }
      })
    })

    return process
  }
}

export default Executable

export { MeteredExecuable }
