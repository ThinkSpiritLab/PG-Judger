

type PlayerMoveRequestDto = Record<string, any>
type PlayerMoveResponceDto = Record<string, any>
type DisplayObject = Record<string, any>
type PlayerID = string

type GameruleRequest = {
  command: 'request',
  content: {
    [playerId: PlayerID]: PlayerMoveRequestDto
  }
}

type GameruleGameContinueResponce = {
  command: 'continue',
  content: {
    [playerId: PlayerID]: PlayerMoveRequestDto
  },
  display: DisplayObject
}

type GameruleGameFinishResponce = {
  command: 'finish',
  content: {
    [playerId: PlayerID]: number
  },
  display: DisplayObject
}

type GameruleGameControlResponce = {
  command: 'control',
  content: any,
  display: DisplayObject
}


type GameruleResponce = GameruleGameContinueResponce | GameruleGameFinishResponce | GameruleGameControlResponce

type PlayerMoveRequest = {
  command: 'request',
  content: PlayerMoveRequestDto
}

type PlayerMoveResponce = {
  command: 'response',
  content: PlayerMoveResponceDto
}