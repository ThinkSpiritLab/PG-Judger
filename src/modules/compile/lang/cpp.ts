/*
 * File: cpp.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sat Jun 01 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

export const cpp = {
  lang: 'cpp',
  compile: {
    compiler: 'g++',
    flags: ['-O2', '-o', 'main'],
    source_file: 'main.cpp',
    target: 'main',
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
