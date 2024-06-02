/*
 * File: g++.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
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

import { Pipeline } from '@/modules/pipeline/pipeline'
import { T } from './utils'
import { Injectable } from '@nestjs/common'
import { ExecService } from '@/modules/exec/exec.service'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, rm } from 'fs/promises'
import { TMP_DIR_PREFIX } from '../constant'
import {
  BasicSpawnOption,
  HengSpawnOption,
  MeterService,
  MeterSpawnOption
} from '@/modules/meter/meter.service'
import { spawn } from 'child_process'
import { JailSpawnOption, LegacyJailService } from '../../jail/jail.legacy'
import { ConfigService } from '@nestjs/config'
import { RegisterPipeline } from '@/modules/pipeline/pipeline.decorator'

// type CppCompileEnv = {
//   compiler: string
//   source_file: string
//   source: string
//   target: string
//   flags: string[]

//   temp_dir?: string
//   output?: string
// }
/*
            skip: false,
            command: getConfig().language.cpp,
            args: compilerOptions,
            spawnOption: {
                bindMount: bindMount,
            }, 
 */
export type CommonCompileOption = {
  skip: boolean
  compilerExec: string
  compilerArgs: string[]
  jailOption: JailSpawnOption
  meterOption: Omit<MeterSpawnOption, 'meterFd'>
  sourceName: string
  targetName: string
  tempDir?: string
  targetPath?: string
}

export type CommonCompileStore = {
  source: string
}

@Injectable()
export class SimpleCompileProvider {
  constructor(
    private readonly execService: ExecService,
    private readonly legacyMeterService: MeterService,
    private readonly legacyJailService: LegacyJailService,
    private readonly configService: ConfigService
  ) {}

  // compileCppPipelineFactory(env: CppCompileEnv) {
  //   const p = Pipeline.create(({ pipe, ctx }) => {
  //     ctx.env = env satisfies CppCompileEnv //TODO use copy?

  //     return (
  //       pipe(T.mkdtemp(join(tmpdir(), TMP_DIR_PREFIX)))
  //         .pipe(async (path) => {
  //           const file = join(path, env.source_file)
  //           await writeFile(file, env.source)
  //           env.temp_dir = path
  //           return file
  //         })
  //         .pipe(async (file) => {
  //           const exec = join(env.temp_dir!, env.target)
  //           env.output = exec

  //           const metered = this.legacyMeterService.useMeter({
  //             meterFd: 4,
  //             memoryLimit: 1024 * 1024 * 1024, //XXX if not run as root, MEM limit set will fail
  //             timeLimit: 200000,
  //             pidLimit: 500,
  //             gid: 0,
  //             uid: 0
  //             // pidLimit: 50
  //           })

  //           const jailed = this.legacyJailService.useJail({
  //             passFd: [0, 1, 2, 3, 4],
  //             timeLimit: 200000,
  //             // rlimitSTACK: 64,
  //             bindMount: [
  //               {
  //                 source: env.temp_dir!,
  //                 mode: 'rw'
  //               },
  //               {
  //                 source: this.configService.getOrThrow('HC_PATH'), //TODO clean this
  //                 dest: this.configService.getOrThrow('HC_PATH'),
  //                 mode: 'ro'
  //               }
  //             ],
  //             uidMap: [{ inside: 0, outside: 0, count: 1 }],
  //             gidMap: [{ inside: 0, outside: 0, count: 1 }],
  //             cwd: env.temp_dir!,
  //             rlimitFSIZE: 1024 * 1024 * 1024, //TODO use config
  //             rlimitCPU: 'soft',
  //             rlimitSTACK: 64,
  //             rlimitAS: 4096
  //           })

  //           const spn = (command: string, args: string[]) => {
  //             console.log(`command: ${command} ${args.join(' ')}`)
  //             return spawn(command, args, {
  //               stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe']
  //             })
  //           }

  //           const task = metered(jailed(spn))(env.compiler, [
  //             ...env.flags,
  //             file,
  //             '-o',
  //             exec
  //           ])

  //           const res = await task.result

  //           // if (res.returnCode !== 0) {
  //           //   throw new Error(`Compile error: ${JSON.stringify(res)}`)
  //           // }

  //           console.log(`result:`, res)
  //         })
  //         // .pipe(async () => {
  //         //   const command = env.output!
  //         //   const stdout = await this.execService.runCommand(command)
  //         //   console.log(`stdout: ${stdout}`)
  //         // })
  //         // .finally(() => rm(env.temp_dir!, { recursive: true }))
  //         .done()
  //     )
  //   })

  //   return p
  // }

  @RegisterPipeline('common-compile')
  commonCompilePipelineFactory(option: CommonCompileOption) {
    // create a pipeline that accepts CommonCompileEnv, and when runned successfully, output the compiled file path
    const p = Pipeline.create(({ pipe, ctx }) => {
      return pipe(T.mkdtemp(join(tmpdir(), TMP_DIR_PREFIX)))
        .pipe(async (path) => {
          console.log(`store`, ctx.store)
          const file = join(path, option.sourceName)
          await writeFile(file, ctx.store.source)
          option.tempDir = path
          return file
        })
        .pipe(async (srcPath) => {
          option.targetPath = join(option.tempDir!, option.targetName)

          const task = await this.execService.runWithJailAndMeterFasade({
            command: option.compilerExec,
            args: [...option.compilerArgs, srcPath, '-o', option.targetPath],
            memory_kb: option.meterOption.memoryLimit || 1024 * 128,
            timeout_ms: option.meterOption.timeLimit || 2000,
            bindMount: [
              {source: option.tempDir!, mode: 'rw'},
            ],
            cwd: option.tempDir!,
          })

          task.on('stdout', (data) => console.log(`stdout: ${data}`))
          task.on('stderr', (data) => console.log(`stderr: ${data}`))
          task.on('close', (code) => console.log(`close: ${code}`))
          task.on('error', (err) => console.error(`error: ${err}`))

          const ret_code = await task.exit
          console.log(`compile return code: ${ret_code}`)
          console.log(task.measure)

          // //TODO use new execute service
          // const metered = this.legacyMeterService.useMeter(option.meterOption)

          // const jailed = this.legacyJailService.useJail(option.jailOption)

          // const spn = (command: string, args: string[]) => {
          //   console.log(`command: ${command} ${args.join(' ')}`)
          //   return spawn(command, args, {
          //     stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe']
          //   })
          // }

          // const task = metered(jailed(spn))(option.compilerExec, [
          //   ...option.compilerArgs,
          //   file,
          //   '-o',
          //   exec
          // ])

          // const res = await task.result

          // console.log(`result:`, res) // we want targetPath
        })
    })

    return p
  }
}
