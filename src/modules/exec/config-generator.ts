import { merge, range } from 'lodash'
import { CompleteStdioOptions, MeterSpawnOption } from '../meter/meter.service'
import { JailSpawnOption } from '@/modules/jail/jail.legacy'
/*
 * File: config-generator.ts                                                   *
 * Project: pg-judger                                                          *
 * Created Date: Su Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jun 02 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */
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

type MeterAndJailConfig = {
  // mount
  tmpfsMount: JailTmpfsMountOption[]
  bindMount: JailBindMountOption[]
  symlink: JailSymlinkOption[]
  uidMap: JailUGidMapOption[]
  gidMap: JailUGidMapOption[]

  // rlimit
  rlimitCPU: number | RlimitString // s default 600s
  rlimitAS: number | RlimitString // M default 4096MB
  rlimitFSIZE: number | RlimitString // M default 1MB
  rlimitSTACK: number | RlimitString // M default soft

  cwd: string
  env: { [key: string]: string }

  timeLimit: number // ms
  memoryLimit: number // byte
  pidLimit: number

  uid: number
  gid: number
}

type ManagedConfig = {
  meterFd: number
  passFd: number[]
}

const defaultMeterAndJailConfig: MeterAndJailConfig = {
  tmpfsMount: [],
  bindMount: [],
  symlink: [],
  uidMap: [],
  gidMap: [],
  rlimitCPU: 600,
  rlimitAS: 4096 * 1024 * 1024,
  rlimitFSIZE: 4,
  rlimitSTACK: 'soft',
  cwd: '/',
  env: {},
  timeLimit: 1000,
  memoryLimit: 1024,
  pidLimit: 2000,
  uid: 0,
  gid: 0
}

/**
 * stdio here does not include meterFd
 * @param meterAndJailConfig
 * @param stdio
 */
export function getConfig(
  meterAndJailConfig: Partial<MeterAndJailConfig>,
  stdio: CompleteStdioOptions
) {
  const all = merge(defaultMeterAndJailConfig, meterAndJailConfig)

  const meter: MeterSpawnOption = {
    timeLimit: all.timeLimit,
    memoryLimit: all.memoryLimit,
    pidLimit: all.pidLimit,
    uid: all.uid,
    gid: all.gid,
    meterFd: stdio.length
  }

  const jail: JailSpawnOption = {
    tmpfsMount: all.tmpfsMount,
    bindMount: all.bindMount,
    symlink: all.symlink,
    uidMap: all.uidMap,
    gidMap: all.gidMap,
    rlimitCPU: all.rlimitCPU,
    rlimitAS: all.rlimitAS,
    rlimitFSIZE: all.rlimitFSIZE,
    rlimitSTACK: all.rlimitSTACK,
    cwd: all.cwd,
    env: all.env,
    passFd: range(stdio.length + 1) //add meterFd
  }

  return {
    meter,
    jail,
    all
  }
}
