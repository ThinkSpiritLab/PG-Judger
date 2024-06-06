import { Injectable } from '@nestjs/common'
import { ExecutableInfo } from '../judge/judge.service'
import { searchLangConfigByExecInfo } from '../../lang'
import { PipelineService } from '../pipeline/pipeline.service'
import { PipelineRuntimeError } from '../pipeline/pipeline.exception'
import { MeterException } from '../meter/meter.exception'

@Injectable()
export class CompileService {
  constructor(
    private readonly pipelineService: PipelineService
  ) {}

  async compile(execInfo: ExecutableInfo, initStore?: Record<string,any>, option_override?: Record<string,any>) { //TODO add this
    const languageConfiguration = searchLangConfigByExecInfo(execInfo)

    if (!languageConfiguration) {
      throw new CompileException(
        'Bad ExecutableInfo: Unknown Language',
        'UNKNOWN_LANG'
      )
    }
    const { configs } = languageConfiguration

    if (!configs.compile || !configs.compile.use) {
      throw new CompileException(
        'Bad Config: missing pipeline name',
        'BAD_CONFIG'
      )
    }

    const pipelineFactory = this.pipelineService.getPipeline(
      configs.compile.use
    )
    const pipeline = pipelineFactory(configs.compile.option)

    try {
      return await pipeline.run({
        source: execInfo.src.content,
        ...initStore
      }) //TODO add validation
    } catch (error) {
      if (error instanceof PipelineRuntimeError) {
        throw new CompileException(
          error.message,
          error.reason
        )
      }
      if (error instanceof MeterException) {
        throw new CompileException(
          error.message,
          error.reason
        )
      }
      throw error
    }
  }
}

export class CompileException extends Error {
  constructor(message: string, public type: string) {
    super(message)
  }
}
