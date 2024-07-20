import { Injectable } from '@nestjs/common'
import { ExecutableInfo } from '../judge/judge.service'
import { searchLangConfigByExecInfoOrThrow } from '../../lang'
import { PipelineService } from '../pipeline/pipeline.service'
import { PipelineRuntimeError } from '../pipeline/pipeline.exception'
import { MeterException } from '../meter/meter.exception'

type CompilePipeStore = {
  source: string
} & {
  [key: string]: any
}

@Injectable()
export class CompileService {
  constructor(private readonly pipelineService: PipelineService) {}

  async compile(
    execInfo: ExecutableInfo,
    initStore: Record<string, any>,
    option_override?: Record<string, any>
  ) {
    //TODO add this
    const languageConfiguration = searchLangConfigByExecInfoOrThrow(execInfo)

    const { configs } = languageConfiguration

    const pipelineFactory = this.pipelineService.getPipeline(
      configs.compile.use
    ) //TODO add check
    console.log('used', configs.compile.use)
    const pipeline = pipelineFactory(configs.compile.option)

    try {
      return await pipeline.run({
        ...initStore,
        source: execInfo
      }) //TODO add validation
    } catch (error) {
      if (error instanceof PipelineRuntimeError) {
        throw new CompileException(error.message, error.reason)
      }
      if (error instanceof MeterException) {
        throw new CompileException(error.message, error.reason)
      }
      throw error
    }
  }
}

export class CompileException extends Error {
  constructor(
    message: string,
    public type: string
  ) {
    super(message)
  }
}
