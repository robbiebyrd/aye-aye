import {EmptyTeamPlacard, TeamPlacard} from "@/components/team-placard";
import {GameData, Player} from "@/models/letterboard";
import React, {useMemo} from "react";
import {Button} from "@/components/button";

export type LobbyProps = {
    gameId: string
    playerId: string
    teamId: string
    gameData: GameData
    sendMessage: (payload: string) => void
}

export const LobbyScene: React.FC<LobbyProps> = ({gameData, gameId, playerId, sendMessage}) => {

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

    const nextScene = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId: "sceneChange",
        }
        sendMessage(JSON.stringify(submission))
    }

    return (
        <div className={'h-full'}>
            <div className="flex justify-left w-full h-1/6 min-h-[15vh]">
                <div className={'w-1/2'}>
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
                <div className={"w-1/2 flex justify-end"}>
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
            <div className={'w-full justify-center align-center h-2/3 flex flex-col items-center'}>
                <div className={"w-5/6 border-4 bg-burnham-500 bg-opacity-70 flex flex-col gap-4 p-6"} style={{
                    borderRadius: ".5em",
                    marginTop: '2em'
                }}>
                    <h1 className=" text-4xl text-center text-white">
                        Welcome to Aye-Aye!
                    </h1>
                    <h2 className={"text-2xl text-center text-white"}>
                        An online, multiplayer, letters-and-numbers game.
                    </h2>
                    <Button label={"Start"} onClickFunc={nextScene} className={'justify-center'}></Button>
                </div>
            </div>
        </div>

    )
}