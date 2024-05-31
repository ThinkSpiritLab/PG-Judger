/*
 * File: pipeline.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Th May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu May 30 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

type TaskAction<In, Out> = (input: In) => PromiseLike<Out> | Out;

class Task<In, Out> {
  private _action: TaskAction<In, Out>;

  constructor(action: TaskAction<In, Out>) {
    this._action = action;
  }

  async run(input: In): Promise<Out> {
    return this._action(input);
  }
}

type AnyFunction = (...args: any[]) => any | PromiseLike<any>;

type FirstAsTuple<T extends any[]> = T extends [any, ...infer R]
  ? T extends [...infer F, ...R]
  ? F
  : never
  : never;

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
  : never;

type TryGetReturn<T> = T extends (args: any) => infer R ? R : never;
type PipelineTask = {
  name: string,
  task: Task<any, any>;
  context: {
    [key: string]: any;
  };
  result: any;
  exit_code: number;
}
type PipelineCtx = {
  tasks: PipelineTask[]
  pipeline: Pipeline;
  env: {
    [key: string]: any;
  };
};

type Last<T extends any[]> = T extends [...infer _, infer L] ? L : never;
type NextTaskType<T extends AnyFunction[]> =
  T['length'] extends 0
  ? AnyFunction
  : Last<T> extends (args: any) => any
  ? (args: Awaited<ReturnType<Last<T>>>) => any
  : never;

class Pipeline<Ts extends AnyFunction[] = []> {
  private _tasks: Ts = [] as unknown as Ts;
  private _ctx: PipelineCtx = {
    tasks: [],
    pipeline: this as unknown as Pipeline<[]>,
    env: {},
  };

  private constructor() { }

  pipe<T extends NextTaskType<Ts>>(task: T): Pipeline<[...Ts, T]> {
    this._tasks.push(task);
    return this as unknown as Pipeline<[...Ts, T]>;
  }

  done() {
    return (this as unknown as Pipeline<Ts>).run.bind(this) as unknown as Pipeline<Ts>['run']
  }

  get ctx() { return this._ctx }

  async run(
    ...args: Parameters<Ts[0]>
  ): Promise<TryGetReturn<AggregateTasks<Ts>>> {
    let result = args;
    for (const task of this._tasks) {
      result = await task(result);
    }
    return result as TryGetReturn<AggregateTasks<Ts>>;
  }

  static create<T>(fn: ({ ctx, pipeline, pipe }: { ctx: PipelineCtx, pipeline: Pipeline<[]>, pipe: Pipeline<[]>['pipe'] }) => T) {
    const pipeline = new Pipeline();

    return fn({ ctx: pipeline.ctx, pipeline, pipe: pipeline.pipe.bind(pipeline) });
  }
}

const p = Pipeline.create(({ pipe }) => {
  return pipe(async (input: 'number') => {
    return input + 1;
  })
    .pipe(async (aa) => {
      return aa + 1;
    })
})

p.run('number')

export { Task, Pipeline };
