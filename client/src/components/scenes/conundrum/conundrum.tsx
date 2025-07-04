import {TeamPlacard} from "@/components/team-placard";
import {GameData, letters, Player} from "@/models/letterboard";
import {useMemo} from "react";
import ConundrumLetters from "@/components/scenes/conundrum/letters";
import ConundrumActions from "@/components/scenes/conundrum/actions";
import {TimerOrCode} from "@/components/scenes/timer";

export type ConundrumProps = {
    gameId: string
    playerId: string
    teamId: string
    timer?: number
    gameData: GameData
    sendMessage: (payload: string) => void
    letters?: letters
}

export const ConundrumScene: React.FC<ConundrumProps> = ({gameId, playerId, sendMessage, gameData}) => {
    const teams = useMemo(() => {
        if (!gameData?.players) {
            return
        }

        const result: Record<string, (Player)[]> = {}
        Object.values(gameData.players).forEach((player) => {
            const key = String(player.team)
            if (!result[key]) {
                result[key] = []
            }
            result[key].push(player)
        })

        return Object.entries(result)
    }, [gameData?.players])

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
            <ConundrumLetters jumbled={gameData.scenes[gameData.currentScene].jumbled}
                              word={gameData.scenes[gameData.currentScene].word}/>
            {gameData.scenes[gameData.currentScene].timer === -1 && !canInput && !isControlling && (
                <div className={"z-0 -mt-4 p-0.5 lg:p-2 border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help rounded-lg mb-2 p-4"}>
                    <h1 className={'text-md lg:text-4xl text-center text-white'}>
                        {gameData.controllingTeam} is controlling the game...
                    </h1>
                </div>
            )}

            <ConundrumActions gameId={gameId} playerId={playerId} sendMessage={sendMessage} inputEnabled={canInput} show={true}
                              gameData={gameData} timer={gameData.scenes[gameData.currentScene].timer} controlling={isControlling}/>
            <div className="flex flex-col items-center justify-center content-center flex-grow">
            </div>
        </>

    )
}