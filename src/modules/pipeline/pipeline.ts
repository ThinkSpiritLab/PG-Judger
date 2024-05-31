/*
 * File: pipeline.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Th May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Fri May 31 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

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

type FirstAsTuple<T extends any[]> = T extends [any, ...infer R]
  ? T extends [...infer F, ...R]
    ? F
    : never
  : never

type AggregateTasks<Acts extends AnyFunction[]> = Acts extends [infer First]
  ? First extends (args: infer _) => infer __
    ? First
    : never
  : Acts extends [infer First, ...infer Rest extends AnyFunction[]]
    ? First extends (args: infer _) => infer __ // may add check between input and output
      ? (
          ...args: FirstAsTuple<Parameters<First>>
        ) => Awaited<ReturnType<AggregateTasks<Rest>>>
      : never
    : never

type TryGetReturn<T> = T extends (...args: any) => infer R ? Awaited<R> : never
type PipelineTaskData<In = any, Out = any> = {
  name: string
  desc: string
  task: Task<In, Out>
  context: {
    [key: string]: any
  }
  result: Out
  exit_code: number
}
type PipelineCtx = {
  tasks: PipelineTaskData[]
  pipeline: Pipeline
  env: {
    [key: string]: any
  }
  get(name: string): PipelineTaskData | undefined
}

type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never
type NextTaskType<T extends AnyFunction[]> = T['length'] extends 0
  ? AnyFunction
  : Last<T> extends (args: any) => any
    ? (args: Awaited<ReturnType<Last<T>>>) => any
    : never

class Pipeline<Ts extends AnyFunction[] = []> {
  // private _tasks: Ts = [] as unknown as Ts;
  private _ctx: PipelineCtx = {
    tasks: [],
    pipeline: this as unknown as Pipeline<[]>,
    env: {},
    get(name: string) {
      return this.tasks.find((task) => task.name === name)
    }
  }

  private _final: AnyFunction | undefined

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
      result: undefined,
      exit_code: Number.NaN
    })
    return this as unknown as Pipeline<[...Ts, T]>
  }

  finally<T extends AnyFunction>(task: T): Pipeline<Ts> {
    this._final = task
    return this as unknown as Pipeline<Ts>
  }

  done() {
    return (this as unknown as Pipeline<Ts>).run.bind(
      this
    ) as unknown as Pipeline<Ts>['run']
  }

  get ctx() {
    return this._ctx
  }

  setEnv(env: { [key: string]: any }) {
    this._ctx.env = env
  }

  async run(...args: Parameters<Ts[0]>) {
    try {
      let result: any
      for (const task of this._ctx.tasks) {
        result = await task.task.run(result)
        task.result = result
      }
      return this._ctx
    } catch (e) {
      throw e
    } finally {
      await this._final?.(this._ctx)
    }
  }

  static create<T>(
    fn: ({
      ctx,
      pipeline,
      pipe
    }: {
      ctx: PipelineCtx
      pipeline: Pipeline<[]>
      pipe: Pipeline<[]>['pipe']
    }) => T
  ) {
    const pipeline = new Pipeline()

    return fn({
      ctx: pipeline.ctx,
      pipeline,
      pipe: pipeline.pipe.bind(pipeline)
    })
  }
}

const p = Pipeline.create(({ pipe }) => {
  return pipe(async (input: 'number') => {
    return input + 1
  }).pipe(async (aa) => {
    return aa + 1
  })
})

p.run('number')

export { Task, Pipeline }
