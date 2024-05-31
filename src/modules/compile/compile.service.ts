import { Injectable } from '@nestjs/common'
import { CppCompileProvider } from './pipelines/g++'
import { tmpdir } from 'os'

@Injectable()
export class CompileService {
  constructor(private readonly cppCompileProvider: CppCompileProvider) {
    this.test()
      .then(() => {
        console.log('done')
      })
      .catch((e) => {
        console.error(e)
      })
  }
  async test() {
    const action = this.cppCompileProvider.compileCppPipelineFactory({
      compiler: 'g++',
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

    const ret = await action()

    // console.log(ret)
  }
}
