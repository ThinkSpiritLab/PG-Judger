import { Injectable, Logger } from '@nestjs/common'
import type { Stream } from 'stream'
import { ConfigService } from '@nestjs/config'
import { ChildProcess } from 'child_process'
import { Readable } from 'stream'
import {
  JailBindMountOption,
  JailSymlinkOption,
  JailTmpfsMountOption
} from '../jail/jail.legacy'

const logger = new Logger('MeterService')

export type CompleteStdioOptions = Array<
  'pipe' | 'ipc' | 'ignore' | 'inherit' | Stream | number | null | undefined
>//TODO move this
export interface BasicSpawnOption {
  stdio?: CompleteStdioOptions
}

export interface HengSpawnOption {
  // mount
  tmpfsMount?: JailTmpfsMountOption[] // nsjail
  bindMount?: JailBindMountOption[] // nsjail
  symlink?: JailSymlinkOption[] // nsjail

  // limit
  timeLimit?: number // ms, meter, nsjail -> 2 * timeLimit(to avoid timer killed, get SE)
  memoryLimit?: number // byte, meter, nsjail -> 4096
  pidLimit?: number // meter
  fileLimit?: number // byte, nsjail rlimit

  // args
  cwd?: string // nsjail(get SE when cwd not mounted)
  env?: { [key: string]: string } // nsjail
  stdio?: CompleteStdioOptions // nsjail, meter save all fd except meterFd
  uid?: number // nsjail(append root), meter
  gid?: number // nsjail(append root), meter
}

@Injectable()
export class MeterService {
  constructor(private readonly configService: ConfigService) {}
  hc_path = this.configService.get('HC_PATH')

  useMeter(
    meterOption: MeterSpawnOption
  ): (
    spawnFunction: (command: string, args: string[]) => ChildProcess
  ) => (command: string, args: string[]) => MeteredChildProcess {
    const meterPath = this.configService.get('HC_PATH')

    return function (
      spawnFunction: (command: string, args: string[]) => ChildProcess
    ) {
      return function (command: string, args: string[]): MeteredChildProcess {
        const hcArgs: string[] = []

        if (meterOption.timeLimit) {
          hcArgs.push('-t', Math.ceil(meterOption.timeLimit).toString())
          hcArgs.push('-cpu', '1')
        }

        if (meterOption.memoryLimit) {
          hcArgs.push('-m', Math.ceil(meterOption.memoryLimit).toString())
        }

        if (meterOption.pidLimit) {
          hcArgs.push('-p', Math.ceil(meterOption.pidLimit).toString())
        }

        if (meterOption.uid) {
          hcArgs.push('-u', meterOption.uid.toString())
        }
        if (meterOption.gid) {
          hcArgs.push('-g', meterOption.gid.toString())
        }

        hcArgs.push('-f', meterOption.meterFd.toString())

        hcArgs.push('--bin', command)

        hcArgs.push('--args', ...args)

        const subProcess = spawnFunction(
          meterPath,
          hcArgs
        ) as MeteredChildProcess

        Object.assign(subProcess, {
          meterFd: meterOption.meterFd,
          result: new Promise((resolve, reject) => {
            subProcess.on('error', (err) => {
              reject(err)
            })
            let resultStr = ''

            // const _stdout = subProcess.stdio[1]
            // const _stderr = subProcess.stdio[2]

            // if (_stdout) {
            //   _stdout.on('data', (chunk) => {
            //     process.stdout.write(chunk)
            //   })
            // }

            // if (_stderr) {
            //   _stderr.on('data', (chunk) => {
            //     process.stderr.write(chunk)
            //   })
            // }

            const resultStream: Readable = subProcess.stdio[
              meterOption.meterFd
            ] as Readable
            resultStream.setEncoding('utf-8')
            resultStream.on('error', (err) => {
              reject(err)
            })
            resultStream.on('data', (chunk) => (resultStr += chunk))
            resultStream.on('end', () => {
              try {
                logger.verbose(`Command : ${command} Result : ${resultStr}`)
                resolve(JSON.parse(resultStr))
              } catch (e) {
                reject(e)
              }
            })
          })
        })

        return subProcess
      }
    }
  }

  prepareFullMeterCommand(meterOption: MeterSpawnOption, command: string, args: string[]){
    const hcArgs: string[] = []

    if (meterOption.timeLimit) {
      hcArgs.push('-t', Math.ceil(meterOption.timeLimit).toString())
      hcArgs.push('-cpu', '1')
    }

    if (meterOption.memoryLimit) {
      hcArgs.push('-m', Math.ceil(meterOption.memoryLimit).toString())
    }

    if (meterOption.pidLimit) {
      hcArgs.push('-p', Math.ceil(meterOption.pidLimit).toString())
    }

    if (meterOption.uid) {
      hcArgs.push('-u', meterOption.uid.toString())
    }
    if (meterOption.gid) {
      hcArgs.push('-g', meterOption.gid.toString())
    }

    hcArgs.push('-f', meterOption.meterFd.toString())

    hcArgs.push('--bin', command)

    hcArgs.push('--args', ...args)

    return [
      this.hc_path,
      hcArgs
    ] as [string, string[]]
  }
}

export interface MeterSpawnOption {
  timeLimit?: number // ms
  memoryLimit?: number // byte
  pidLimit?: number
  meterFd: number
  uid?: number
  gid?: number
}

export interface MeterResult {
  memory: number // bytes
  returnCode: number
  signal: number
  time: {
    real: number // ms
    sys: number // ms
    usr: number // ms
  }
}

export const EmptyMeterResult: MeterResult = {
  memory: 0,
  returnCode: 0,
  signal: -1,
  time: {
    real: 0,
    usr: 0,
    sys: 0
  }
}

export interface MeteredChildProcess extends ChildProcess {
  meterFd: number
  result: Promise<MeterResult>
}
