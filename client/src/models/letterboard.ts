export type letterRow = [string, string, string, string, string, string, string, string, string]
export type letters = [letterRow, letterRow]

export interface GameData {
    gameId: string
    currentScene: string
    scenes: Record<string, SceneData>
    players: Record<string, Player>
    controllingTeam: string
}

export interface SceneData {
    title: string
    scene: string
    background?: string
    timer: number
    timerRun: boolean
    letters: letterRow
    board: letters
    foundWords?: string[]
    showInput?: boolean
    nextScene?: string
    nextTeam?: string

    word?: letterRow
    jumbled?: letterRow
    clue?: letterRow

    submissions: Record<string, SceneSubmissions>
    numbers?: number[]
    targetNumber?: number
}

export interface SceneSubmissions {
    playerId: string
    entry: string
    timestamp: string
    correct?: boolean
}

export interface Player {
    playerId: string
    disconnected: boolean
    host: boolean
    name: string
    team: string
    score: number
    leader: boolean
}

