import {EmptyTeamPlacard, TeamPlacard} from "@/components/team-placard";
import {GameData, Player} from "@/models/letterboard";
import {useMemo} from "react";
import {Button} from "@/components/button";

export type EndProps = {
    gameId: string
    playerId: string
    teamId: string
    gameData: GameData
    sendMessage: (payload: string) => void
}

export const EndScene: React.FC<EndProps> = ({gameData, gameId, playerId, sendMessage}) => {

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
                                position={'left'}
                            />
                        ) : <EmptyTeamPlacard />}
                    </div>
                    <div className={"w-1/2 flex justify-end"}>
                        {teams?.at(1)?.at(0) ? (
                            <TeamPlacard
                                playerId={playerId}
                                gameData={gameData}
                                teamName={String(teams?.at(1)?.at(0))}
                                players={teams?.at(1)?.at(1) as Player[]}
                                position={'right'}/>
                        ) : <div className={"flex flex-col justify-end"} style={{
                            aspectRatio: "2 / 1",
                            height: "11em"
                        }}>&nbsp;</div>}
                    </div>
                </div>
                <h1>Thanks for Playing!</h1>
                <Button label={"Play Again"} onClickFunc={nextScene}></Button>
            </div>
        </>

    )
}