import {TeamPlacard} from "@/components/team-placard";
import {GameData, letterRow, letters, Player, SceneSubmissions} from "@/models/letterboard";
import Letters from "@/components/scenes/letterboard/letters";
import Draw from "@/components/scenes/letterboard/draw";
import Actions from "@/components/scenes/letterboard/actions";
import {useMemo} from "react";
import QRCode from "react-qr-code";

export type LetterboardProps = {
    gameId: string
    playerId: string
    teamId: string
    timer?: number
    gameData: GameData
    ws?: WebSocket
    show?: boolean
    letters?: letters
    jumbled?: letterRow
    word?: letterRow
}

export const LetterboardScene: React.FC<LetterboardProps> = ({gameId, playerId, ws, gameData}) => {
    console.log(gameData)
    const canInput = useMemo(() => {
        const a = gameData?.scenes[gameData.currentScene].submissions?.find((s: SceneSubmissions) => s.playerId == playerId)
        return !!a?.entry
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
            result[key].push({playerId, ...player})
        })

        return Object.entries(result)
    }, [gameData?.players])

    return (
        <>
            <div className="flex justify-center w-full min-h-[15vh]">
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
            <Letters letters={gameData.scenes[gameData.currentScene].board}/>
            <div className="flex flex-col items-center justify-center content-center flex-grow">
                <Draw gameId={gameId} playerId={playerId} ws={ws} show={canDraw}/>
                <Actions gameId={gameId} playerId={playerId} ws={ws} inputEnabled={canInput} show={!canDraw}
                         timer={gameData.scenes[gameData.currentScene].timer} gameData={gameData}/>
            </div>
        </>

    )
}