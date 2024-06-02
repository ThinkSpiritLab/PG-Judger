/*
 * File: cpp.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
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

import { CommonCompileStore, CommonCompileOption } from "../pipelines/g++";

export const cpp = {
  lang: 'cpp',
  tag: 'g++o2',

  configs: {
    compile: {
      use: 'common-compile',
      option : {
        skip: false,
        compilerExec: '/usr/bin/g++',
        compilerArgs: ['-O2'],
        jailOption: {
          uidMap: [{inside: 0, outside: 0, count: 1}],
          gidMap: [{inside: 0, outside: 0, count: 1}],
        },
        meterOption: {},
        sourceName: 'main.cpp',
        targetName: 'main',
        // tempDir: 'SET IN RUNTIME',
      } satisfies CommonCompileOption,
    },
    run: {
      executable: 'main',
      args: [],
      stdio: {
        stdin: 'stdin',
        stdout: 'stdout',
        stderr: 'stderr'
      }
    }
  }
}
