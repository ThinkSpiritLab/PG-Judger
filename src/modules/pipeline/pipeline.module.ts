import { Module } from '@nestjs/common'
import { PipelineService } from './pipeline.service'
import { PipelineRegistryService } from './pipeline.decorator'
import { DiscoveryService, MetadataScanner } from '@nestjs/core'
import { DynamicPipelineModule } from '@/pipelines/PipelineLoader.module'

@Module({
  imports: [DynamicPipelineModule],
  providers: [
    PipelineService,
    PipelineRegistryService,
    DiscoveryService,
    MetadataScanner
  ],
  exports: [PipelineService]
})
export class PipelineModule {}
