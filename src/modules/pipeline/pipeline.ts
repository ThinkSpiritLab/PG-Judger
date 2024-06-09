/*
 * File: pipeline.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Th May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jun 09 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { timed } from '@/utils/async'

type TaskAction<In, Out> = (input: In) => PromiseLike<Out> | Out

class Task<In, Out> {
  private _action: TaskAction<In, Out>

  constructor(action: TaskAction<In, Out>) {
    this._action = action
  }

  async run(input: In): Promise<Out> {
    return this._action(input)
  }
}

type AnyFunction = (...args: any[]) => any | PromiseLike<any>

type PipelineTaskData<In = any, Out = any> = {
  name: string
  desc: string
  task: Task<In, Out>
  context: {
    [key: string]: any
  }
  result: Out
}

type PipelineCtx<Store = {}> = {
  tasks: PipelineTaskData[]
  pipeline: Pipeline
  store: Store
  get(name: string): PipelineTaskData | undefined
}

type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never
type NextTaskType<T extends AnyFunction[]> = T['length'] extends 0
  ? AnyFunction
  : Last<T> extends (args: any) => any
    ? (args: Awaited<ReturnType<Last<T>>>) => any
    : never

type PipelineStore = Record<string, any>


/**
 * Pipeline class
 * 
 * How you design a pipeline?
 * - Pipeline shall have no side effect (or at least not to have side effect after running), so that pipeline can able to be reused
 * - in case you cannot prevent side effect, if you want to create files, make sure you clean them up after running
 */
class Pipeline<Ts extends AnyFunction[] = []> {
  private _ctx: PipelineCtx<any> = {
    tasks: [],
    pipeline: this as unknown as Pipeline<[]>,
    store: {} as PipelineStore,
    get(name: string) {
      return this.tasks.find((task) => task.name === name)
    }
  }

  private _finally: AnyFunction | undefined
  private _catch: AnyFunction | undefined
  private constructor() {}

  pipe<T extends NextTaskType<Ts>>(
    task: T,
    {
      name,
      ctx,
      desc
    }: { name?: string; ctx?: Record<PropertyKey, any>; desc?: string } = {}
  ): Pipeline<[...Ts, T]> {
    this._ctx.tasks.push({
      name: name || task.name || 'unnamed',
      desc: desc || 'no description',
      task: new Task(task),
      context: ctx || {},
      result: undefined
    })
    return this as unknown as Pipeline<[...Ts, T]>
  }

  finally<T extends AnyFunction>(task: T): Pipeline<Ts> {
    this._finally = task
    return this as unknown as Pipeline<Ts>
  }

  catch<T extends AnyFunction>(task: T): Pipeline<Ts> {
    this._catch = task
    return this as unknown as Pipeline<Ts>
  }

  done() {
    return (this as unknown as Pipeline<Ts>).run.bind(
      this
    ) as unknown as Pipeline<Ts>['run']
  }

  setStore(store: PipelineStore) {
    this._ctx.store = store
  }

  async run<T extends PipelineStore = PipelineStore>(init_store: T) {
    this.setStore(init_store)
    try {
      let result: any = null
      for (const task of this._ctx.tasks) {
        const [output, time_ms] = await timed(async () => await task.task.run(result))

        // console.log(`Task ${task.name} finished  (+${time_ms}ms)`)

        task.result = result = output
      }

      return this._ctx as PipelineCtx<T>
    } catch (e) {
      this._ctx.store.error = e
      // console.error(e)
      await this._catch?.(this._ctx)
      throw e
    } finally {
      await this._finally?.(this._ctx)
    }
  }

  static create<Store extends Record<string,any>>(
    fn: ({
      ctx,
      pipeline,
      pipe
    }: {
      ctx: PipelineCtx<Store>
      pipeline: Pipeline<[]>
      pipe: Pipeline<[]>['pipe']
    }) => Pipeline
  ) {
    const pipeline = new Pipeline()

    return fn({
      ctx: pipeline.ctx,
      pipeline,
      pipe: pipeline.pipe.bind(pipeline)
    })
  }

  get ctx() {
    return this._ctx
  }
}

export { Task, Pipeline }
