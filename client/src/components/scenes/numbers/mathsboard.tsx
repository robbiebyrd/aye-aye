import {EmptyTeamPlacard, TeamPlacard} from "@/components/team-placard";
import {GameData, Player} from "@/models/letterboard";
import Draw from "@/components/scenes/numbers/draw";
import Actions from "@/components/scenes/numbers/actions";
import {useMemo} from "react";
import {Number, Numbers} from "@/components/scenes/numbers/numbers";
import DrawTarget from "@/components/scenes/numbers/drawtarget";
import {TimerOrCode} from "@/components/scenes/timer";
import Input from "@/components/scenes/numbers/input";

export type MathsboardProps = {
    gameId: string
    playerId: string
    teamId: string
    timer?: number
    gameData: GameData
    sendMessage: (payload: string) => void
    show?: boolean
    numbers?: number[]
    targetNumber?: number
}

export const MathsboardScene: React.FC<MathsboardProps> = ({gameId, playerId, sendMessage, gameData}) => {


    const isControlling = useMemo(() => {
        return gameData?.players[playerId].team === gameData.controllingTeam;
    }, [gameData.controllingTeam, gameData?.players, playerId])

    const canDraw = useMemo(() => {
            const currentNumbers = gameData?.scenes?.[gameData.currentScene]?.numbers
            if (!currentNumbers) {
                return true
            }

            const filteredNumbers = currentNumbers.filter((a) => a != 0)

            return filteredNumbers.length < 6
        },
        [gameData?.scenes, gameData?.currentScene]
    );


    const canPickTarget = useMemo(() => {
            const targetNum = gameData?.scenes?.[gameData.currentScene]?.targetNumber ?? 0
            return targetNum == 0
        },
        [gameData?.scenes, gameData?.currentScene]
    );

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

    function padArray<T>(arr: T[] | undefined, length: number, fillValue: T): T[] {
        if (!arr) return []
        if (arr.length >= length) {
            return arr;
        }
        const padding = Array(length - arr.length).fill(fillValue);
        return arr.concat(padding);
    }

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
                        <h1 className=" text-xl text-center text-white">{gameData.scenes[gameData.currentScene].title}</h1>
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
                    ) : <EmptyTeamPlacard />
                    }
                </div>
            </div>
            <div className="flex gap-10 align-center justify-center align-middle">
                <div className="w-5/6 flex align-center justify-center align-middle my-8">
                    <Numbers numbers={padArray(gameData.scenes[gameData.currentScene].numbers, 6, 0)}/>
                </div>
                <div className="w-1/6 flex my-8">
                    <Number number={gameData.scenes[gameData.currentScene].targetNumber} header={'Target Number'}/>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center content-center flex-grow">
                {isControlling && canDraw && (
                    <Draw gameId={gameId} playerId={playerId} sendMessage={sendMessage}
                          drawn={gameData.scenes[gameData.currentScene].numbers}/>
                )}
                {isControlling && (!canDraw && canPickTarget) && (
                    <DrawTarget gameId={gameId} playerId={playerId} sendMessage={sendMessage}/>
                )}
                {isControlling && (!canDraw && !canPickTarget) && (
                    <Actions playerId={playerId} sendMessage={sendMessage} show={!canDraw && !canPickTarget && isControlling}
                             timer={gameData.scenes[gameData.currentScene].timer} gameData={gameData}/>
                )}
                {!canDraw && !canPickTarget && gameData.scenes[gameData.currentScene].timer > 0 && (
                    <Input playerId={playerId} sendMessage={sendMessage} timer={gameData.scenes[gameData.currentScene].timer} gameData={gameData} />
                )}
            </div>
        </>

    )
}