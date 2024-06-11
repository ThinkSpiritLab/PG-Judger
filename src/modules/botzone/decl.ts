import z from 'zod'

type PlayerMoveRequestDto = Record<string, any>
const PlayerMoveRequestDtoSchema = z.object({})
type PlayerMoveResponceDto = Record<string, any>
const PlayerMoveResponceDtoSchema = z.object({})
type DisplayObject = Record<string, any>
const DisplayObjectSchema = z.object({})
type PlayerID = string
const PlayerIDSchema = z.string()

type GameruleRequest = {
  command: 'request'
  content: {
    [playerId: PlayerID]: PlayerMoveRequestDto
  }
}
const GameruleRequestSchema = z.object({
  command: z.literal('request'),
  content: z.record(z.string(), PlayerMoveRequestDtoSchema)
}).required()

type GameruleGameContinueResponce = {
  command: 'continue'
  content: {
    [playerId: PlayerID]: PlayerMoveRequestDto
  }
  display: DisplayObject
}
const GameruleGameContinueResponceSchema = z.object({
  command: z.literal('continue'),
  content: z.record(z.string(), PlayerMoveRequestDtoSchema),
  display: DisplayObjectSchema
}).required()

type GameruleGameFinishResponce = {
  command: 'finish'
  content: {
    [playerId: PlayerID]: number
  }
  display: DisplayObject
}
const GameruleGameFinishResponceSchema = z.object({
  command: z.literal('finish'),
  content: z.record(z.string(), z.number()),
  display: DisplayObjectSchema
}).required()

type GameruleGameControlResponce = {
  command: 'control'
  content: any
  display: DisplayObject
}
const GameruleGameControlResponceSchema = z.object({
  command: z.literal('control'),
  content: z.any(),
  display: DisplayObjectSchema
}).required()

type GameruleResponce =
  | GameruleGameContinueResponce
  | GameruleGameFinishResponce
  | GameruleGameControlResponce
const GameruleResponceSchema = z.discriminatedUnion('command', [
  GameruleGameContinueResponceSchema,
  GameruleGameFinishResponceSchema,
  GameruleGameControlResponceSchema
])

type PlayerMoveRequest = {
  command: 'request'
  content: PlayerMoveRequestDto
}
const PlayerMoveRequestSchema = z.object({
  command: z.literal('request'),
  content: PlayerMoveRequestDtoSchema
})

type PlayerMoveResponce = {
  command: 'response'
  content: PlayerMoveResponceDto
}
const PlayerMoveResponceSchema = z.object({
  command: z.literal('response'),
  content: PlayerMoveResponceDtoSchema
})

export {
  PlayerMoveRequestDto,
  PlayerMoveResponceDto,
  DisplayObject,
  PlayerID,
  GameruleRequest,
  GameruleGameContinueResponce,
  GameruleGameFinishResponce,
  GameruleGameControlResponce,
  GameruleResponce,
  PlayerMoveRequest,
  PlayerMoveResponce
}

export {
  PlayerMoveRequestDtoSchema,
  PlayerMoveResponceDtoSchema,
  DisplayObjectSchema,
  PlayerIDSchema,
  GameruleRequestSchema,
  GameruleGameContinueResponceSchema,
  GameruleGameFinishResponceSchema,
  GameruleGameControlResponceSchema,
  GameruleResponceSchema,
  PlayerMoveRequestSchema,
  PlayerMoveResponceSchema
}

