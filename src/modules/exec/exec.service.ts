import { Injectable } from '@nestjs/common'
import { exec, spawn } from 'child_process'

@Injectable()
export class ExecService {
  async runCommand(command: string) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        }
        resolve(stdout)
      })
    })
  }

  async runCommandTimeout(command: string, timeout: number) {
    return new Promise((resolve, reject) => {
      const timerId = setTimeout(() => {
        child.kill()
        reject('timeout')
      }, timeout)

      const child = exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        }
        clearTimeout(timerId)
        resolve(stdout)
      })
    })
  }

  // run a interactive command (stdin may be required)
  async runInteractiveCommand(command: string, args: string[]) {
    const child = spawn(command, args)

    child.stdout.setEncoding('utf8')

    return {
      stdout: child.stdout,
      stderr: child.stderr,
      stdin: child.stdin,
      child
    }
  }
}
