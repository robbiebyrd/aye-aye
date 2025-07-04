import {TeamPlacard} from "@/components/team-placard";
import {GameData, letterRow, letters, Player} from "@/models/letterboard";
import Letters from "@/components/scenes/letterboard/letters";
import Draw from "@/components/scenes/letterboard/draw";
import Actions from "@/components/scenes/letterboard/actions";
import {useMemo} from "react";
import {TimerOrCode} from "@/components/scenes/timer";
import Input from "@/components/scenes/letterboard/input";

export type LetterboardProps = {
    gameId: string
    playerId: string
    teamId: string
    timer?: number
    gameData: GameData
    sendMessage: (payload: string) => void
    show?: boolean
    letters?: letters
    jumbled?: letterRow
    word?: letterRow
}

export const LetterboardScene: React.FC<LetterboardProps> = ({gameId, playerId, sendMessage, gameData}) => {
    const canInput = useMemo(() => {
        const allSubmissions = gameData?.scenes[gameData.currentScene].submissions
        if (!allSubmissions) {
            return true
        }
        const submission = allSubmissions[playerId]
        return !!submission?.entry
    }, [gameData, playerId])

    const isControlling = useMemo(() => {
        const allTeams = Object.values(gameData?.players).map((p) => p.team)
        if (allTeams.length <= 1) {
            return true
        }
        return gameData?.players[playerId].team === gameData.controllingTeam;
    }, [gameData.controllingTeam, gameData?.players, playerId])

    const canDraw = useMemo(() => {
        return gameData?.scenes[gameData.currentScene].letters.some((l: string) => l === " ")
    }, [gameData?.scenes])

    const teams = useMemo(() => {
        if (!gameData?.players) {
            return
        }

        const result: Record<string, (Player & { playerId: string })[]> = {}
        Object.entries(gameData.players).forEach(([playerId, player]) => {
            const key = String(player.team)
            if (!result[key]) {
                result[key] = []
            }
            result[key].push({...player, playerId})
        })

        return Object.entries(result)
    }, [gameData?.players])

    return (
        <>
            <div className="flex justify-center w-full h-40">
                <div className={"w-1/2 md:w-3/4"}>
                    {teams?.at(0)?.at(0) ? (
                        <TeamPlacard
                            playerId={playerId}
                            gameData={gameData}
                            teamName={String(teams?.at(0)?.at(0))}
                            players={teams?.at(0)?.at(1) as Player[]}
                            position={'left'}
                        />
                    ) : <div className={"flex flex-col"} style={{
                        aspectRatio: "2 / 1",
                    }}/>}
                </div>
                <div className="flex flex-col items-center justify-baseline content-center flex-grow w-1/3 h-full">
                    <div className={"flex w-full h-full content-center text-center justify-center items-center mt-2"}>
                        <TimerOrCode count={gameData.scenes[gameData.currentScene].timer} gameId={gameId}/>
                    </div>
                    <div className={"border-4 bg-burnham-500 bg-opacity-50 mb-4 top-0 h-12 absolute -top-1 md:-top-2 p-2 rounded-lg border-t-0"}>
                        <h1 className="text-nowrap lg:text-xl text-md text-center text-white">{gameData.scenes[gameData.currentScene].title}</h1>
                    </div>
                </div>
                <div className={"w-1/2 md:w-3/4 flex justify-end"}>
                    {teams?.at(1)?.at(0) ? (
                        <TeamPlacard
                            playerId={playerId}
                            gameData={gameData}
                            teamName={String(teams?.at(1)?.at(0))}
                            players={teams?.at(1)?.at(1) as Player[]}
                            position={'right'}/>
                    ) : <div className={"flex flex-col"} style={{
                        aspectRatio: "2 / 1",
                    }}/>}
                </div>
            </div>
            <Letters letters={gameData.scenes[gameData.currentScene].board}/>
            <div className="flex flex-col items-center justify-center content-center flex-grow md:min-h-96">
                {isControlling && canDraw && (
                    <Draw gameId={gameId} playerId={playerId} sendMessage={sendMessage} drawn={gameData.scenes[gameData.currentScene].board[0]}/>
                )}
                {gameData.scenes[gameData.currentScene].timer === -1 && !canDraw && isControlling && (
                    <Actions playerId={playerId} sendMessage={sendMessage} inputEnabled={canInput}
                             timer={gameData.scenes[gameData.currentScene].timer} gameData={gameData}/>
                )}
                {gameData.scenes[gameData.currentScene].timer === -1 && !canInput && !isControlling && (
                    <div className={"z-0 -mt-4 p-0.5 lg:p-2 border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help rounded-lg mb-2 p-4"}>
                        <h1 className={'text-md lg:text-4xl text-center text-white'}>
                            {gameData.controllingTeam} is controlling the game...
                        </h1>
                    </div>
                )}
                <Input
                    controlling={isControlling}
                    playerId={playerId}
                    sendMessage={sendMessage}
                    inputEnabled={canInput}
                    timer={gameData.scenes[gameData.currentScene].timer}
                    gameId={gameData.gameId}
                />
            </div>
        </>

    )
}