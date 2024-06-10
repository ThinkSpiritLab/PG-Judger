/*
 * File: Jail.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
 * Author: Legacy                                                              *
 * -----                                                                       *
 * Last Modified: Mon Jun 10 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ----------	---	---------------------------------------------------------  *
 */

import { Injectable } from '@nestjs/common'
import { ChildProcess } from 'child_process'
import { resolve } from 'path'
import { ConfigService } from '@nestjs/config'

export interface JailBindMountOption {
  source: string
  dest?: string
  mode: 'ro' | 'rw'
}

export interface JailSymlinkOption {
  source: string
  dest: string
}

export interface JailTmpfsMountOption {
  dest: string
  size: number
}

export interface JailUGidMapOption {
  inside: number
  outside: number
  count: number
}
export type RlimitString = 'max' | 'hard' | 'def' | 'soft' | 'inf'

export interface JailSpawnOption {
  // mount
  tmpfsMount?: JailTmpfsMountOption[]
  bindMount?: JailBindMountOption[]
  symlink?: JailSymlinkOption[]
  uidMap?: JailUGidMapOption[]
  gidMap?: JailUGidMapOption[]

  timeLimit_s?: number // s default inf

  // rlimit
  rlimitCPU?: number | RlimitString // s default 600s
  rlimitAS_MB?: number | RlimitString // M default 4096MB
  rlimitFSIZE_MB?: number | RlimitString // M default 1MB
  rlimitSTACK_MB?: number | RlimitString // M default soft

  cwd?: string
  env?: { [key: string]: string }
  passFd?: number[]

  forward_signals?: boolean
}

@Injectable()
export class LegacyJailService {
  constructor(private readonly configService: ConfigService) {}

  useJail(jailOption: JailSpawnOption) {
    const nsjail_path = this.configService.get<string>('NSJAIL_PATH')
    const nsjail_config = this.configService.get<string>('NSJAIL_CONFIG_PATH')

    if (!nsjail_path) {
      throw new Error('nsjail path is not set')
    }

    return function (
      spawnFunction: (command: string, args: string[]) => ChildProcess
    ) {
      return function (command: string, args: string[]): ChildProcess {
        const jailArgs: string[] = []

        if (nsjail_config) {
          jailArgs.push('-C', resolve(nsjail_config))
        }

        if (jailOption.tmpfsMount) {
          for (const mountPoint of jailOption.tmpfsMount) {
            jailArgs.push(
              '-m',
              `none:${mountPoint.dest}:tmpfs:size=${mountPoint.size}`
            )
          }
        }

        if (jailOption.bindMount) {
          for (const mountPoint of jailOption.bindMount) {
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

        if (jailOption.symlink) {
          for (const sym of jailOption.symlink) {
            jailArgs.push('-s', `${sym.source}:${sym.dest}`)
          }
        }

        if (jailOption.uidMap) {
          jailOption.uidMap.forEach((item) => {
            jailArgs.push('-u', `${item.inside}:${item.outside}:${item.count}`)
          })
        }

        if (jailOption.gidMap) {
          jailOption.gidMap.forEach((item) => {
            jailArgs.push('-g', `${item.inside}:${item.outside}:${item.count}`)
          })
        }

        if (jailOption.timeLimit_s) {
          jailArgs.push('-t', Math.ceil(jailOption.timeLimit_s).toString())
        }

        if (jailOption.rlimitCPU) {
          if (typeof jailOption.rlimitCPU === 'number') {
            jailArgs.push(
              '--rlimit_cpu',
              Math.ceil(jailOption.rlimitCPU).toString()
            )
          } else {
            jailArgs.push('--rlimit_cpu', jailOption.rlimitCPU)
          }
        }

        if (jailOption.rlimitAS_MB) {
          if (typeof jailOption.rlimitAS_MB === 'number') {
            jailArgs.push(
              '--rlimit_as',
              Math.ceil(jailOption.rlimitAS_MB).toString()
            )
          } else {
            jailArgs.push('--rlimit_as', jailOption.rlimitAS_MB)
          }
        }

        if (jailOption.rlimitFSIZE_MB) {
          if (typeof jailOption.rlimitFSIZE_MB === 'number') {
            jailArgs.push(
              '--rlimit_fsize',
              Math.ceil(jailOption.rlimitFSIZE_MB).toString()
            )
          } else {
            jailArgs.push('--rlimit_fsize', jailOption.rlimitFSIZE_MB)
          }
        }

        if (jailOption.rlimitSTACK_MB) {
          if (typeof jailOption.rlimitSTACK_MB === 'number') {
            jailArgs.push(
              '--rlimit_stack',
              Math.ceil(jailOption.rlimitSTACK_MB).toString()
            )
          } else {
            jailArgs.push('--rlimit_stack', jailOption.rlimitSTACK_MB)
          }
        }

        if (jailOption.cwd) {
          jailArgs.push('--cwd', resolve(jailOption.cwd))
        }

        if (jailOption.env) {
          for (const name in jailOption.env) {
            jailArgs.push('-E', `${name}=${jailOption.env[name]}`)
          }
        }

        if (jailOption.passFd) {
          jailOption.passFd.forEach((value) =>
            jailArgs.push('--pass_fd', value.toString())
          )
        }

        // jailArgs.push("--nice_level", "0");

        jailArgs.push('--', command, ...args)

        const subProcess = spawnFunction(nsjail_path, jailArgs)
        return subProcess
      }
    }
  }
}
