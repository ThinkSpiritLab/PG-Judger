import { Test, TestingModule } from '@nestjs/testing'
import { JudgeService } from './judge.service'
import { JudgeTest, tests as langsTests } from './test'
import { toNormalJudgeRequest } from './test/index'
import { ConfigService } from '@nestjs/config'

describe('JudgeService', () => {
  let service: JudgeService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JudgeService, ConfigService]
    }).compile()

    service = module.get<JudgeService>(JudgeService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  Object.keys(langsTests).forEach((key) => {
    const tests = langsTests[key]
    describe(`language ${key}`, () => {
      tests.forEach((t: JudgeTest) => {
        it(t.name, async () => {
          const res = await service.judge(toNormalJudgeRequest(t))
          expect(res).toBeDefined()
          expect(service.summaryResult(res!, 'all')).toEqual(t.expectResult)
        })
      })
    })
  })
})
