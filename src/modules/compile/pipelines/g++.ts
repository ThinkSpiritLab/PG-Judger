/*
 * File: g++.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Fri May 31 2024                                              *
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

type CppCompileEnv = {
  compiler: string
  source_file: string
  source: string
  target: string
  flags: string[]

  temp_dir?: string
  output?: string
}

@Injectable()
export class CppCompileProvider {
  constructor(private readonly execService: ExecService) {}

  compileCppPipelineFactory(env: CppCompileEnv) {
    const p = Pipeline.create(({ pipe, ctx }) => {
      ctx.env = env satisfies CppCompileEnv //TODO use copy?

  return pipe(T.mkdtemp(join(tmpdir(), TMP_DIR_PREFIX)))
        .pipe(async (path) => {
          const file = join(path, env.source_file)
          await writeFile(file, env.source)
          env.temp_dir = path
          return file
        })
        .pipe(
          async (file) => {
            const exec = join(env.temp_dir!, env.target)
            env.output = exec
            const command = `${env.compiler} ${env.flags.join(' ')} ${file} -o ${exec}`
            await this.execService.runCommand(command)
          }
        )
        .pipe(
          async () => {
            const command = env.output!
            const stdout = await this.execService.runCommand(command)
            console.log(`stdout: ${stdout}`)
          }
        )
        .finally(() => rm(env.temp_dir!, { recursive: true }))
        .done()
    })

    return p
  }
}
