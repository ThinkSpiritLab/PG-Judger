import { Injectable } from '@nestjs/common'
import { exec, spawn } from 'child_process'
import { JailService } from '../jail/jail.service'
import {
  CompleteStdioOptions,
  MeterService,
  MeterSpawnOption
} from '../meter/meter.service'
import { JailSpawnOption, LegacyJailService } from '../jail/jail.legacy'
import Executable, { MeteredExecuable } from './executable'
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

  //fasade
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
      `jailExec: ${jailExec} ${jailArgs.join(' ')}, stdio: ${stdio.join(' ')}`
    )

    return new MeteredExecuable(
      {
        executablePath: jailExec,
        args: jailArgs,
        stdio
      },
      meterOption.meterFd
    )
  }

  async runWithJailAndMeterFasade({
    command,
    args,
    timeout_ms,
    memory_kb,
    stdio,
    gid = 1999,
    uid = 1999,
    pidLimit = 2000,
    // meterFd = 3,
    bindMount = [],
    cwd = '/',
    env = {},
    uidMap = [],
    gidMap = [],
    passFd = [],
    rlimitAS = 1024 * 1024 * 128000,
    rlimitCPU = 600000, //600s
    rlimitFSIZE = 1024 * 1024 * 1000, //1MB
    rlimitSTACK = 'soft', //8MB
    symlink = [],
    tmpfsMount = []
  }: {
    command: string
    args: string[]
    timeout_ms: number
    memory_kb: number
    stdio: CompleteStdioOptions
  } & Omit<MeterSpawnOption, 'memoryLimit' | 'timeLimit' | 'meterFd'> &
    Omit<JailSpawnOption, 'timeLimit'>) {
    stdio.push('pipe') // append a pipe for meter

    const meter: MeterSpawnOption = {
      meterFd: stdio.length - 1, // append to the end, normally 3 or 4(if using hc and ojcmp, it is stdin stdout stderr userFd meterFd)
      memoryLimit: memory_kb,
      timeLimit: timeout_ms,
      gid: 0,
      uid: 0,
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
      rlimitAS,
      rlimitCPU,
      rlimitFSIZE,
      rlimitSTACK,
      symlink,
      // timeout is not used here due to
      // low accuracy of nsjail's timeout
      // used as a backup in case program stuck
      timeLimit: Math.ceil(timeout_ms / 1000) + 1,
      tmpfsMount
    }

    return this.runWithJailAndMeter(command, args, meter, jail, stdio)
  }
}
