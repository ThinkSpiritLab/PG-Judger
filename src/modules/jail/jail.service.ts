import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { existsSync } from 'fs'
import { JailSpawnOption } from './jail.legacy'
import { resolve } from 'path'
import { spawn } from 'child_process'

const logger = new Logger('JailService')

@Injectable()
export class JailService {
  constructor(private readonly configService: ConfigService) {
    // check nsjail path
    const path = configService.get<string>('NSJAIL_PATH')

    if (!path) {
      logger.error('nsjail path is not set')
      return
    }

    if (!existsSync(path)) {
      throw new Error('nsjail path does not exist')
    } else {
      logger.log(`nsjail path is set to ${path}`)
    }
  }

  async create({
    executable,
    args,
    cfg
  }: {
    executable: string
    args: string[]
    cfg: JailSpawnOption
  }) {
    const nsjail_path = this.configService.get<string>('NSJAIL_PATH')
    if (!nsjail_path) {
      throw new Error('nsjail path is not set')
    }

    const jailArgs = this.prepareJailArgs(cfg, executable, args)
    const subProcess = spawn(nsjail_path, jailArgs)
    return subProcess
  }

  public prepareFullJailCommand(cfg: JailSpawnOption, executable: string, args: string[]){
    const nsjail_path = this.configService.get<string>('NSJAIL_PATH')
    if (!nsjail_path) {
      throw new Error('nsjail path is not set')
    }

    // by default, mount executable
    if (!cfg.bindMount) {
      cfg.bindMount = []
    }

    cfg.bindMount.push({
      source: executable,
      mode: 'ro'
    })

    const jailArgs = this.prepareJailArgs(cfg, executable, args)
    return [nsjail_path, jailArgs] as [string, string[]]
  }

  private prepareJailArgs(cfg: JailSpawnOption, executable: string, args: string[]) {
    const nsjail_config = this.configService.get<string>('NSJAIL_CONFIG_PATH')


    const jailArgs: string[] = []

    this.configureJail(nsjail_config, jailArgs, cfg)

    jailArgs.push('--', executable, ...args)
    return jailArgs
  }

  private configureJail(nsjail_config: string | undefined, jailArgs: string[], cfg: JailSpawnOption) {
    if (nsjail_config) {
      jailArgs.push('-C', resolve(nsjail_config))
    }

    if (cfg.tmpfsMount) {
      for (const mountPoint of cfg.tmpfsMount) {
        jailArgs.push(
          '-m',
          `none:${mountPoint.dest}:tmpfs:size=${mountPoint.size}`
        )
      }
    }

    if (cfg.bindMount) {
      for (const mountPoint of cfg.bindMount) {
        let choice = ''
        if (mountPoint.mode === 'ro') {
          choice = '-R'
        } else {
          choice = '-B'
        }
        let param = ''
        if (mountPoint.dest !== undefined) {
          param = `${mountPoint.source}:${mountPoint.dest}`
        } else {
          param = mountPoint.source
        }

        jailArgs.push(choice, param)
      }
    }

    if (cfg.symlink) {
      for (const sym of cfg.symlink) {
        jailArgs.push('-s', `${sym.source}:${sym.dest}`)
      }
    }

    if (cfg.uidMap) {
      cfg.uidMap.forEach((item) => {
        jailArgs.push('-u', `${item.inside}:${item.outside}:${item.count}`)
      })
    }

    if (cfg.gidMap) {
      cfg.gidMap.forEach((item) => {
        jailArgs.push('-g', `${item.inside}:${item.outside}:${item.count}`)
      })
    }

    if (cfg.timeLimit_s) {
      jailArgs.push('-t', Math.ceil(cfg.timeLimit_s).toString())
    }

    if (cfg.rlimitCPU) {
      if (typeof cfg.rlimitCPU === 'number') {
        jailArgs.push('--rlimit_cpu', Math.ceil(cfg.rlimitCPU).toString())
      } else {
        jailArgs.push('--rlimit_cpu', cfg.rlimitCPU)
      }
    }

    if (cfg.rlimitAS_MB) {
      if (typeof cfg.rlimitAS_MB === 'number') {
        jailArgs.push('--rlimit_as', Math.ceil(cfg.rlimitAS_MB).toString())
      } else {
        jailArgs.push('--rlimit_as', cfg.rlimitAS_MB)
      }
    }

    if (cfg.rlimitFSIZE_MB) {
      if (typeof cfg.rlimitFSIZE_MB === 'number') {
        jailArgs.push('--rlimit_fsize', Math.ceil(cfg.rlimitFSIZE_MB).toString())
      } else {
        jailArgs.push('--rlimit_fsize', cfg.rlimitFSIZE_MB)
      }
    }

    if (cfg.rlimitSTACK_MB) {
      if (typeof cfg.rlimitSTACK_MB === 'number') {
        jailArgs.push('--rlimit_stack', Math.ceil(cfg.rlimitSTACK_MB).toString())
      } else {
        jailArgs.push('--rlimit_stack', cfg.rlimitSTACK_MB)
      }
    }

    if (cfg.cwd) {
      jailArgs.push('--cwd', resolve(cfg.cwd))
    }

    if (cfg.env) {
      for (const name in cfg.env) {
        jailArgs.push('-E', `${name}=${cfg.env[name]}`)
      }
    }

    if (cfg.passFd) {
      cfg.passFd.forEach((value) => jailArgs.push('--pass_fd', value.toString())
      )
    }
  }
}
