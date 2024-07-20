/*
 * File: c.ts                                                                  *
 * Project: pg-judger                                                          *
 * Created Date: We Jun 2024                                                   *
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

export const c = {
  lang: 'c',
  tag: 'gcco2',

  configs: {
    compile: {
      use: 'simple-compile',
      skip: false,
      compilerExec: '/usr/bin/gcc',
      compilerArgs: ['-O2'],
      sourceName: 'main.c',
      targetName: 'main'
    },
    run: {
      use: 'simple-run'
    }
  }
} satisfies Lang
