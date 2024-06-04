/*
 * File: common.module.ts                                                      *
 * Project: pg-judger                                                          *
 * Created Date: Tu Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 04 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { validate } from '@/misc/env.validation'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

const env_file_path =
  process.env.NODE_ENV === 'production'
    ? ['.env.production', '.env']
    : ['.env.development', '.env']

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: env_file_path,
      isGlobal: true,
      validate, // schema see /src/misc/env.validation.ts
      cache: true
    })
  ]
})
export class CommonModule {}
