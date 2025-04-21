export type letterRow = [string, string, string, string, string, string, string, string, string]
export type letters = [letterRow, letterRow]

export interface GameData {
    gameId: string
    activeSceneId: string
    sceneData: SceneData
    players: Player[]
    currentRound: string
    rounds: string[]
}

export interface SceneData {
    name: string
    timer: number
    submissions?: SceneSubmissions[]
    board: letters
    letters: letterRow
    foundWord?: string[]
    numbers?: number[]
    targetNumber?: number
    word?: letterRow
    jumbled?: letterRow
    showInput?: boolean
}

export interface SceneSubmissions {
    playerId: string
    entry: string
    total: string
    correct?: boolean
}

export interface Player {
    id: string
    disconnected: boolean
    host: boolean
    name: string
    team: string
    score: number
    leader: boolean
}

