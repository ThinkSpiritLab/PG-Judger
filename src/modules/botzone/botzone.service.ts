import { Injectable } from '@nestjs/common'
import { ExecService } from '../exec/exec.service'
import { LocalPlayer } from './player/player'

@Injectable()
export class BotzoneService {
  constructor(private readonly execService: ExecService) {
    this.test()
  }

  async test() {
    const exec = await this.execService.runWithJailAndMeterFasade({
      command: '/home/shiyuzhe/lab/lev/pg-judger/temp/aplusbmany',
      args: [],
      memory_MB: 1024,
      timeout_ms: 100000,
      stdio: ['pipe', 'pipe', 'pipe'],
      bindMount: [
        {
          source: '/home/shiyuzhe/lab/lev/pg-judger/temp',
          mode: 'rw'
        }
      ],
      cwd: '/home/shiyuzhe/lab/lev/pg-judger/temp',
      timeLimit_s: 100
    })

    exec.start()

    const player = new LocalPlayer('test', exec)

    player.exec.on('exit', (code) => {
      console.log('exit', code)
    })

    const resp1 = await player.moveRaw('2 1 2\n')
    console.log(resp1)

    const resp2 = await player.moveRaw('6 6\n')
    console.log(resp2)


  }
}
