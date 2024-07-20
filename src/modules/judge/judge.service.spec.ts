import { Test, TestingModule } from '@nestjs/testing'
import { JudgeService } from './judge.service'
import { tests as langsTests } from './test'
import { JudgeTest, toNormalJudgeRequest } from './test/utils'
import { ConfigModule } from '@nestjs/config'
import { CompileModule } from '../compile/compile.module'
import { PipelineModule } from '../pipeline/pipeline.module'
import { CommonModule } from '../common/common.module'
import { ExecModule } from '../exec/exec.module'
import { CompareModule } from '../compare/compare.module'
import { PipelineRegistryService } from '../pipeline/pipeline.decorator'
import { DiscoveryService, MetadataScanner } from '@nestjs/core'
import { PipelineService } from '../pipeline/pipeline.service'

describe('JudgeService', () => {
  let service: JudgeService
  // let pipelineService: PipelineService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CompileModule,
        PipelineModule,
        CommonModule,
        ExecModule,
        CompareModule
      ],
      providers: [
        JudgeService,
        // CommonPipelineProvider,
        PipelineRegistryService,
        DiscoveryService,
        MetadataScanner
      ]
    }).compile()

    service = module.get<JudgeService>(JudgeService)

    // pipelineService = module.get<PipelineService>(PipelineService)
    // const provider = module.get<CommonPipelineProvider>(CommonPipelineProvider)
    // pipelineService.register('common-compile', provider.commonCompilePipelineFactory.bind(provider))
    // pipelineService.register('common-run-testcase', provider.commonJudgePipelineFactory.bind(provider))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // Object.keys(langsTests).forEach((lang) => {
  //   const tests = langsTests[lang]
  //   describe(`language ${lang}`, () => {
  //     tests.forEach((t: JudgeTest) => {
  //       it(t.name, async () => {
  //         const req = toNormalJudgeRequest(t, lang)
  //         const res = await service.judge(req)
  //         expect(res).toBeDefined()
  //         const summary = service.summaryResult(res!, 'all')
  //         expect(summary).toEqual(t.expectResult)
  //       }, 4000)
  //     })
  //   })
  // })
})
