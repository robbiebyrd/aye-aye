import {EmptyTeamPlacard, TeamPlacard} from "@/components/team-placard";
import {GameData, Player} from "@/models/letterboard";
import {useMemo} from "react";
import {Button} from "@/components/button";

export type LobbyProps = {
    gameId: string
    playerId: string
    teamId: string
    gameData: GameData
    ws?: WebSocket
}

export const LobbyScene: React.FC<LobbyProps> = ({gameData, gameId, playerId, ws}) => {

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
        ws?.send(JSON.stringify(submission))
    }

    return (
        <>
            <div className={"flex flex-col content-center align-middle items-center w-full h-full  justify-center"}>
                <div className="flex justify-left w-full min-h-[15vh]">
                    <div className={'w-1/2'}>
                        {teams?.at(0)?.at(0) ? (
                            <TeamPlacard
                                playerId={playerId}
                                gameData={gameData}
                                teamName={String(teams?.at(0)?.at(0))}
                                players={teams?.at(0)?.at(1) as Player[]}
                                colors={[
                                    "#C1272D",
                                    "#3D775A",
                                    "#410006",
                                    "#E6E6E6",
                                    "#CCCCCC"
                                ]}
                                position={'left'}
                            />
                        ) : <EmptyTeamPlacard
                            colors={[
                                "#C1272D",
                                "#3D775A",
                                "#410006",
                                "#E6E6E6",
                                "#CCCCCC"
                            ]}
                        />
                        }
                    </div>
                    <div className={"w-1/2 flex justify-end"}>
                        {teams?.at(1)?.at(0) ? (
                            <TeamPlacard
                                playerId={playerId}
                                gameData={gameData}
                                teamName={String(teams?.at(1)?.at(0))}
                                players={teams?.at(1)?.at(1) as Player[]}
                                colors={[
                                    "#0000FF",
                                    "#3D775A",
                                    "#1B1464",
                                    "#E6E6E6",
                                    "#CCCCCC"
                                ]}
                                position={'right'}/>
                        ) : <EmptyTeamPlacard
                            colors={[
                                "#0000FF",
                                "#3D775A",
                                "#1B1464",
                                "#E6E6E6",
                                "#CCCCCC"
                            ]}
                        />
                        }
                    </div>
                </div>
                <Button label={"Start"} onClickFunc={nextScene}></Button>
            </div>
        </>

    )
}