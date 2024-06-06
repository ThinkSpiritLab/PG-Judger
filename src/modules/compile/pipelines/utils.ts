/*
 * File: utils.ts                                                              *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu Jun 06 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import * as fp from 'fs/promises'
import { TMP_DIR_PREFIX } from '../constant'
import { tmpdir } from 'os'
import { join } from 'path'

/**
 * Task factory
 */
export namespace T {
  export function exists(path: string) {
    return () => fp.access(path)
  }

  export function mkdir(path: string) {
    return () => fp.mkdir(path)
  }

  export function mkdtemp(prefix: string) {
    return () => fp.mkdtemp(prefix)
  }

  export function writeFile(path: string, data: string) {
    return () => fp.writeFile(path, data)
  }

  export function readFile(path: string) {
    return () => fp.readFile(path, { encoding: 'utf-8' })
  }

  export function unlink(path: string) {
    return () => fp.unlink(path)
  }

  export function rmdir(path: string) {
    return () => fp.rm(path, { recursive: true })
  }

  export function copyFile(src: string, dest: string) {
    return () => fp.copyFile(src, dest)
  }

  export function rename(src: string, dest: string) {
    return () => fp.rename(src, dest)
  }

  export function stat(path: string) {
    return () => fp.stat(path)
  }

  export function readdir(path: string) {
    return () => fp.readdir(path)
  }

  export function chmod(path: string, mode: number) {
    return () => fp.chmod(path, mode)
  }

  export function chown(path: string, uid: number, gid: number) {
    return () => fp.chown(path, uid, gid)
  }

  export function utimes(path: string, atime: number, mtime: number) {
    return () => fp.utimes(path, atime, mtime)
  }

  export function symlink(target: string, path: string) {
    return () => fp.symlink(target, path)
  }
}

export async function getTempDir() {
  return await fp.mkdtemp(join(tmpdir(), TMP_DIR_PREFIX))
}

export async function withTempDir<T>(
  fn: (tempDir: string) => T
) {
  let _tempDir: string | null = null

  const cleanup = () => {
    if (_tempDir) {
      fp.rm(_tempDir, { recursive: true })
    }
  }

  try {
    _tempDir = await getTempDir()
    return await fn(_tempDir)
  } finally {
    // cleanup()
  }
}
