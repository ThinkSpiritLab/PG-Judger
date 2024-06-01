import { Injectable } from '@nestjs/common'
import { SimpleCompileProvider } from './pipelines/g++'
import { tmpdir } from 'os'
import { JailService } from '../jail/jail.service'
import { MeterService } from '../meter/meter.service'
import { LegacyJailService } from '../jail/jail.legacy'
import { ExecutableInfo } from '../judge/judge.service'

@Injectable()
export class CompileService {
  constructor(
    private readonly simpleCompileProvider: SimpleCompileProvider,
    private readonly jailService: JailService,
    private readonly legacyMeterService: MeterService,
    private readonly legacyJailService: LegacyJailService
  ) {
    // this.test()
    //   .then(() => {
    //     console.log('done')
    //   })
    //   .catch((e) => {
    //     console.error(e)
    //   })
  }
  async test() {
    const action = this.simpleCompileProvider.compileCppPipelineFactory({
      compiler: '/usr/bin/g++',
      source_file: 'main.cpp',
      source: `#include <iostream>
      int main() {
        std::cout << "Hello, World!" << std::endl;
        return 0;
      }
      `,
      target: 'main',
      flags: ['-O2', '-std=c++17']
    })

    await action()
  }

  async compile(execInfo: ExecutableInfo) 
  {
    // const action = this.simpleCompileProvider.commonCompilePipelineFactory({
    // TODO: look up config by execInfo
    // })
      

    // return await action()
  }
}

class CompileException extends Error {
  type: 'TLE' | 'MLE' | 'CE' | 'UNKNOWN'
  constructor(message: string, type: 'TLE' | 'MLE' | 'CE' | 'UNKNOWN') {
    super(message)
    this.name = 'CompileException'
    this.type = type
  }
}
