/*
 * File: env.validation.ts                                                     *
 * Project: pg-judger                                                          *
 * Created Date: Th May 2024                                                   *
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

import { plainToInstance } from 'class-transformer'
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync
} from 'class-validator'
import { resolve } from 'path'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision'
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsNumber()
  @Min(0)
  @Max(65535)
  CLIENT_PORT: number

  @IsUrl({ host_whitelist: ['localhost'] })
  CONTROLLER_URL: string

  @IsString()
  NSJAIL_PATH: string

  @IsString()
  HC_PATH: string

  @IsString()
  OJ_CMP_PATH: string

  @IsString()
  NSJAIL_CONFIG_PATH: string
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  })

  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }

  // if is a relative path, convert to absolute path
  const keys = ['NSJAIL_PATH', 'HC_PATH', 'OJ_CMP_PATH']
  keys.forEach((key) => {
    validatedConfig[key] = resolve(validatedConfig[key])
  })

  return validatedConfig
}
