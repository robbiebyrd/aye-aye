import {TeamPlacard} from "@/components/team-placard";
import {GameData, letterRow, letters, Player} from "@/models/letterboard";
import Letters from "@/components/scenes/letterboard/letters";
import Draw from "@/components/scenes/letterboard/draw";
import Actions from "@/components/scenes/letterboard/actions";
import {useMemo} from "react";
import {TimerOrCode} from "@/components/scenes/timer";

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
            <div className="flex justify-center w-full">
                <div className={"w-3/4"}>
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
                    <TimerOrCode count={gameData.scenes[gameData.currentScene].timer} gameId={gameId}/>
                    <div className={"border-4 bg-burnham-500 bg-opacity-50 mb-4 absolute top-0 flex-nowrap"} style={{
                        borderRadius: ".5em",
                        borderTop: "none",
                        padding: "1em .5em .25rem .5em",
                        marginTop: "-1em",
                    }}>
                        <h1 className="text-nowrap lg:text-xl text-md text-center text-white">{gameData.scenes[gameData.currentScene].title}</h1>
                    </div>
                </div>
                <div className={"w-3/4 flex justify-end"}>
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
            <div className="flex flex-col items-center justify-center content-center flex-grow">
                <Draw gameId={gameId} playerId={playerId} sendMessage={sendMessage} show={canDraw} drawn={gameData.scenes[gameData.currentScene].board[0]}/>
                <Actions playerId={playerId} sendMessage={sendMessage} inputEnabled={canInput} show={!canDraw}
                         timer={gameData.scenes[gameData.currentScene].timer} gameData={gameData}/>
            </div>
        </>

    )
}