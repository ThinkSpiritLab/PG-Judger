/*
 * File: index.ts                                                              *
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

import { ExecutableInfo } from '@/modules/judge/judge.service'
import { cpp } from './cpp'

type Lang = {
  lang: string
  tag: string
  configs: {
    compile: Record<string, any>
    run: Record<string, any>
    [key: string]: Record<string, any>
  }
}

const langs: Lang[] = [cpp]

export function searchLangConfigByExecInfo(execInfo: ExecutableInfo) {
  return langs.find((lang) => lang.lang === execInfo.env.lang) //TODO add more filters
}

export function serachLangByTag(tag: string) {
  return langs.find((lang) => lang.tag === tag)
}
