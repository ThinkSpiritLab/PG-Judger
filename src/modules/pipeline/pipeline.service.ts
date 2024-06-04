import { Injectable } from '@nestjs/common'
import { Pipeline } from './pipeline'

type PipelineFactory = (...args: any[]) => Pipeline<any>

@Injectable()
export class PipelineService {
  constructor() {
    console.log('PipelineService created')
  }

  private pipelineFactoryMap: Map<string, PipelineFactory> =
    new Map()

  public register(name: string, factory: PipelineFactory): void {
    if (this.pipelineFactoryMap.has(name)) {
      throw new Error(`Pipeline ${name} already exists`)
    }

    this.pipelineFactoryMap.set(name, factory)
    console.log('registered pipeline', name)
  }

  public getPipeline(name: string): PipelineFactory {
    if (!this.pipelineFactoryMap.has(name)) {
      throw new Error(`Pipeline ${name} not found`)
    }
    return this.pipelineFactoryMap.get(name)!
  }
}
