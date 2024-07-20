/*
 * File: cpp.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sat Jul 20 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Lang } from '.'

export const cpp = {
  lang: 'cpp',
  tag: 'g++o2',

  configs: {
    compile: {
      use: 'simple-compile',
      skip: false,
      compilerExec: '/usr/bin/g++',
      compilerArgs: ['-O2'],
      sourceName: 'main.cpp',
      targetName: 'main'
    },
    run: {}
  }
} satisfies Lang
