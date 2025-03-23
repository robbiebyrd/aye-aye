export type letterRow = [string, string, string, string, string, string, string, string, string]
export type letters = [letterRow, letterRow]

export const emptyLetterRow = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
export const emptyLetterBoard = [emptyLetterRow, emptyLetterRow] as letters

export interface GameData {
    gameId: string
    activeSceneId: string
    sceneData: SceneData
    players: Player[]
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
    word?: string[]
    jumbled?: string[]
    showInput?: boolean
}

export interface SceneSubmissions {
    playerId: string
    entry: string
    total: string
    correct: boolean
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

