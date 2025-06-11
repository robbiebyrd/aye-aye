import {EmptyTeamPlacard, TeamPlacard} from "@/components/team-placard";
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

    return (
        <>
            <div className="flex justify-center w-full min-h-[15vh]">
                <div className={"w-3/4 flex justify-start"}>
                    {teams?.at(0)?.at(0) ? (
                        <TeamPlacard
                            playerId={playerId}
                            gameData={gameData}
                            teamName={String(teams?.at(0)?.at(0))}
                            players={teams?.at(0)?.at(1) as Player[]}
                            position={'left'}
                        />
                    ) : <EmptyTeamPlacard/>
                    }
                </div>
                <div className="flex flex-col items-center justify-center content-center flex-grow">
                    <div className={"border-4 bg-burnham-500 bg-opacity-50 mb-4"} style={{
                        borderRadius: ".5em",
                        borderTop: "none",
                        padding: "1em .5em .25rem .5em",
                        marginTop: "-2em"
                    }}>
                        <h1 className="lg:text-xl text-md text-center text-white">{gameData.scenes[gameData.currentScene].title}</h1>
                    </div>
                    <TimerOrCode count={gameData.scenes[gameData.currentScene].timer} gameId={gameId}/>
                </div>
                <div className={"w-3/4 flex justify-end"}>
                    {teams?.at(1)?.at(0) ? (
                        <TeamPlacard
                            playerId={playerId}
                            gameData={gameData}
                            teamName={String(teams?.at(1)?.at(0))}
                            players={teams?.at(1)?.at(1) as Player[]}
                            position={'right'}/>
                    ) : <EmptyTeamPlacard/>
                    }
                </div>
            </div>
            <ConundrumLetters jumbled={gameData.scenes[gameData.currentScene].jumbled}
                              word={gameData.scenes[gameData.currentScene].word}/>
            <ConundrumActions gameId={gameId} playerId={playerId} sendMessage={sendMessage} inputEnabled={canInput} show={true}
                              gameData={gameData} timer={gameData.scenes[gameData.currentScene].timer}/>
            <div className="flex flex-col items-center justify-center content-center flex-grow">
            </div>
        </>

    )
}