/*
 * File: index.ts                                                              *
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

import { ExecutableInfo } from '@/modules/judge/judge.service'
import { CompileException } from '@/modules/compile/compile.service'
import { cpp } from './cpp'
import { c } from './c'

type LangCompileConfig = {
  skip?: boolean,
  compilerExec: string,
  compilerArgs: string[],
} & Record<string, any>

export type Lang = {
  lang: string
  tag: string
  configs: {
    compile: LangCompileConfig,
    run: Record<string, any>
    [key: string]: Record<string, any>
  }
}

const langs: Lang[] = [cpp, c]

export function searchLangConfigByExecInfoOrThrow(execInfo: ExecutableInfo) {
  const languageConfiguration = langs.find((lang) => lang.lang === execInfo.env.lang) //TODO add more filters

  if (!languageConfiguration) {
    throw new CompileException(
      'Bad ExecutableInfo: Unknown Language',
      'UNKNOWN_LANG'
    )
  }

  if (!languageConfiguration?.configs?.compile?.use) {
    throw new CompileException(
      'Bad Config: missing pipeline name',
      'BAD_CONFIG'
    )
  }

  return languageConfiguration
}

export function serachLangByTag(tag: string) {
  return langs.find((lang) => lang.tag === tag)
}
