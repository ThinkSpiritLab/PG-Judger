import { Injectable, Inject, OnModuleInit, SetMetadata } from '@nestjs/common'
import { ModuleRef, DiscoveryService, MetadataScanner } from '@nestjs/core'
import 'reflect-metadata'
import { PipelineService } from './pipeline.service'
import { Pipeline } from './pipeline'

export function RegisterPipeline<T, K extends keyof T>(name: string) {
  return (
    target: T[K] extends (...args: any[]) => Pipeline ? T : "You can only use this decorator on a pipeline function",
    propertyKey: K,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata('pipeline:name', name, descriptor.value)
  }
}

@Injectable()
export class PipelineRegistryService implements OnModuleInit {
  constructor(
    // private readonly moduleRef: ModuleRef,
    @Inject(PipelineService) private readonly pipelineService: PipelineService,
    private readonly metadataScanner: MetadataScanner,
    private readonly discoveryService: DiscoveryService
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders()
    providers.forEach((wrapper) => {
      const { instance } = wrapper
      if (!instance || typeof instance !== 'object') {
        return
      }

      const prototype = Object.getPrototypeOf(instance)

      this.metadataScanner
        .getAllMethodNames(prototype)
        .forEach((methodName) => {
          const method = prototype[methodName]
          const name = Reflect.getMetadata('pipeline:name', method)
          if (name) {
            this.pipelineService.register(name, method.bind(instance))
          }
        })
    })
  }
}
