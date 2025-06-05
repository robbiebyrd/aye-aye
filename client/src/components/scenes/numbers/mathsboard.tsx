import {TeamPlacard} from "@/components/team-placard";
import {GameData, Player} from "@/models/letterboard";
import Draw from "@/components/scenes/numbers/draw";
import Actions from "@/components/scenes/numbers/actions";
import {useMemo} from "react";
import QRCode from "react-qr-code";
import {Number, Numbers} from "@/components/scenes/numbers/numbers";
import DrawTarget from "@/components/scenes/numbers/drawtarget";

export type MathsboardProps = {
    gameId: string
    playerId: string
    teamId: string
    timer?: number
    gameData: GameData
    ws?: WebSocket
    show?: boolean
    numbers?: number[]
    targetNumber?: number
}

export const MathsboardScene: React.FC<MathsboardProps> = ({gameId, playerId, ws, gameData}) => {

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
            <div className="flex justify-center w-full min-h-[15vh]">
                <div className={"w-3/4"}>
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
                    ) : <div className={"flex flex-col"} style={{
                        aspectRatio: "2 / 1",
                        height: "11em"
                    }}/>}
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
                    <div
                        className={'h-[10em] relative aspect-square mb-0 items-center content-center text-center justify-center'}
                        style={{
                            backgroundImage: "url('/img/clock.png')",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }}>
                        <img src={'/img/clock-arm.svg'} className={'relative'} style={{
                            transform: `rotate(${gameData.scenes[gameData.currentScene].timer >= 0 ? gameData.scenes[gameData.currentScene].timer * 6 : 0}deg)`
                        }}/>
                        {gameData.scenes[gameData.currentScene].timer >= 0 ?
                            <h1 className={'font-bold w-full h-full'}
                                style={{
                                    fontSize: '5em',
                                    top: "10%",
                                    position: "absolute",
                                }}>{gameData.scenes[gameData.currentScene].timer}</h1> :
                            <QRCode
                                style={{
                                    height: "50%",
                                    position: "absolute",
                                    top: "25%"
                                }}
                                className={"w-full h-8 m-auto aspect-square absolute"}
                                value={`${process.env.SERVER_PROTOCOL}://${process.env.SERVER_HOST}/?game=${encodeURIComponent(gameId)}`}
                            />
                        }
                    </div>
                </div>
                <div className={"w-3/4 flex justify-end"}>
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
                    ) : <div className={"flex flex-col"} style={{
                        aspectRatio: "2 / 1",
                        height: "11em"
                    }}/>}
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
                {canDraw && (
                    <Draw gameId={gameId} playerId={playerId} ws={ws}
                          drawn={gameData.scenes[gameData.currentScene].numbers}/>
                )}
                {(!canDraw && canPickTarget) && (
                    <DrawTarget gameId={gameId} playerId={playerId} ws={ws}/>
                )}
                {(!canDraw && !canPickTarget) && (
                    <Actions playerId={playerId} ws={ws} show={!canDraw && !canPickTarget}
                             timer={gameData.scenes[gameData.currentScene].timer} gameData={gameData}/>
                )}
            </div>
        </>

    )
}