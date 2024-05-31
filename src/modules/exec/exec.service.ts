import { Injectable } from '@nestjs/common';
import { exec } from "child_process";

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
  
  


}
