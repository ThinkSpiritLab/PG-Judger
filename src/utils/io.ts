/*
 * File: io.ts                                                                 *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sat Jun 01 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Readable } from "stream";



export function readStream(s: Readable, size: number): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const data: string[] = [];
      let length = 0;
  
      s.on('readable', () => {
        let chunk;
        while (null !== (chunk = s.read(size === -1 ? undefined : Math.min(size - length, s.readableLength)))) {
          data.push(chunk.toString('utf-8'));
          length += chunk.length;
          if (size !== -1 && length >= size) {
            resolve(data.join(''));
            return;
          }
        }
        // If no more data is readable, resolve null
        if (data.length === 0) {
          resolve(null);
        }
      });
  
      s.on('end', () => {
        if (data.length > 0) {
          resolve(data.join(''));
        } else {
          resolve(null);
        }
      });
  
      s.on('error', (err) => reject(err));
    });
  }