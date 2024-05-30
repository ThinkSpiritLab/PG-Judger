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

import { List } from 'ts-toolbelt';

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

type PipelineCtx = {
  tasks: {
    [key: string]: {
      task: Task<any, any>;
      context: {
        [key: string]: any;
      };
      result: any;
      exit_code: number;
    };
  };
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

type Test = NextTaskType<[
  (input: number) => Promise<number>,
  (input: string) => Promise<number>,
]>;

class Pipeline<Ts extends AnyFunction[] = []> {
  private _tasks: Ts = [] as unknown as Ts;

  constructor() {}

  pipe<T extends NextTaskType<Ts>>(task: T): Pipeline<[...Ts, T]> {
    this._tasks.push(task);
    return this as unknown as Pipeline<[...Ts, T]>;
  }

  async run(
    ...args: Parameters<Ts[0]>
  ): Promise<TryGetReturn<AggregateTasks<Ts>>> {
    let result = args;
    for (const task of this._tasks) {
      result = await task(result);
    }
    return result as TryGetReturn<AggregateTasks<Ts>>;
  }

  static create(fn: ({ ctx, pipeline }: { ctx: PipelineCtx, pipeline: Pipeline<[]> }) => void): PipelineCtx {
    const pipeline = new Pipeline();
    const ctx: PipelineCtx = {
      tasks: {},
      pipeline,
      env: {},
    };
    fn({ ctx, pipeline });
    return ctx;
  }
}

// Pipeline.create(({ ctx, pipeline }) => {
//   pipeline.pipe(async (input: 'number') => {
//     return input + 1;
//   }).pipe(async (aa) => {
//     return aa + 1;
//   }).run('number');
// })

export { Task, Pipeline };
