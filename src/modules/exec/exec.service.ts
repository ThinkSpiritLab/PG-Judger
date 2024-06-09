import { Injectable } from '@nestjs/common'
import { exec, spawn } from 'child_process'
import { JailService } from '../jail/jail.service'
import {
  CompleteStdioOptions,
  MeterService,
  MeterSpawnOption
} from '../meter/meter.service'
import { JailSpawnOption, LegacyJailService } from '../jail/jail.legacy'
import { MeteredExecuable } from './executable'
import { range } from 'lodash'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ExecService {
  constructor(
    private readonly jailService: JailService,
    private readonly legacyJailService: LegacyJailService,
    private readonly legacyMeterService: MeterService,
    private readonly configService: ConfigService
  ) {}

  async runCommand(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        }
        resolve(stdout)
      })
    })
  }

  async runCommandTimeout(command: string, timeout: number) {
    return new Promise((resolve, reject) => {
      const timerId = setTimeout(() => {
        child.kill()
        reject('timeout')
      }, timeout)

      const child = exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        }
        clearTimeout(timerId)
        resolve(stdout)
      })
    })
  }

  // run a interactive command (stdin may be required)
  async runInteractiveCommand(command: string, args: string[]) {
    const child = spawn(command, args)

    child.stdout.setEncoding('utf8')

    return {
      stdout: child.stdout,
      stderr: child.stderr,
      stdin: child.stdin,
      child
    }
  }

  async runWithJailAndMeter(
    command: string,
    args: string[],
    meterOption: MeterSpawnOption,
    jailOption: JailSpawnOption,
    stdio: CompleteStdioOptions
  ) {
    const [meterExec, meterArgs] =
      this.legacyMeterService.prepareFullMeterCommand(
        meterOption,
        command,
        args
      )

    const [jailExec, jailArgs] = this.jailService.prepareFullJailCommand(
      jailOption,
      meterExec,
      meterArgs
    )

    console.log(
      `jailExec: ${jailExec} ${jailArgs.join(' ')}`
    )

    // console.log(`stdio: ${stdio}, meterFd: ${meterOption.meterFd}`)

    return new MeteredExecuable(
      {
        executablePath: jailExec,
        args: jailArgs,
        stdio
      },
      meterOption.meterFd
    )
  }
  
  //fasade
  async runWithJailAndMeterFasade({
    command,
    args,
    timeout_ms = 2000,
    memory_MB = 1024 * 8,
    stdio = [],
    gid = 0,
    uid = 0,
    pidLimit = 3,
    // meterFd = 3,
    bindMount = [],
    cwd = '/',
    env = {},
    uidMap = [],
    gidMap = [],
    // passFd = [], // we pass all, cannot be set
    // rlimitAS_MB = 1024 * 1024,
    rlimitCPU = 600,
    rlimitFSIZE_MB = 1,
    // rlimitSTACK_MB = 64,
    symlink = [],
    tmpfsMount = []
  }: {
    command: string
    args: string[]
    timeout_ms: number
    memory_MB: number
    stdio?: CompleteStdioOptions
  } & Omit<MeterSpawnOption, 'memoryLimit' | 'timeLimit' | 'meterFd'> &
    Omit<JailSpawnOption, 'timeLimit'>) {
    while (stdio.length < 3) stdio.push('ignore')
    stdio.push('pipe') // append a pipe for meter
    // console.log(`memory_MB: ${memory_MB}`)
    const meter: MeterSpawnOption = {
      meterFd: stdio.length - 1, // append to the end, normally 3 or 4(if using hc and ojcmp, it is stdin stdout stderr userFd meterFd)
      memoryLimit: memory_MB * 1024 * 1024,
      timeLimit: timeout_ms,
      gid,
      uid,
      pidLimit
    }

    const jail: JailSpawnOption = {
      bindMount: [
        ...bindMount,
        {
          source: this.configService.getOrThrow('HC_PATH'), // by default, mount two utils
          mode: 'ro'
        },
        {
          source: this.configService.getOrThrow('OJ_CMP_PATH'),
          mode: 'ro'
        }
      ],
      cwd,
      env,
      uidMap,
      gidMap,
      // passFd,
      passFd: range(stdio.length),
      //XXX this is intentionally set to 8GB. if we set this exactly to memory_MB, the meter will
      //    unable to measure the memory usage of the program, but directly throw a runtime error
      // rlimitAS_MB: 1024 *1024,
      rlimitCPU,
      rlimitFSIZE_MB,
      rlimitSTACK_MB: 64,
      symlink,
      // timeout is not used here due to
      // low accuracy of nsjail's timeout
      // used as a backup in case program stuck
      timeLimit_s: Math.ceil(timeout_ms / 1000) + 1,
      tmpfsMount
    }

    return this.runWithJailAndMeter(command, args, meter, jail, stdio)
  }
}
