"use client"

import {use, useMemo, useState} from "react"
import {GameData, Player} from "@/models/letterboard"
import Letters from "@/components/scenes/letterboard/letters"
import Actions from "@/components/scenes/letterboard/actions"
import invariant from 'tiny-invariant'
import Draw from "@/components/scenes/letterboard/draw"
import {TeamPlacard} from "@/components/team-placard"


export default function Page({params}: {
    params: Promise<{ gameId: string, teamId: string; playerId: string }>
}) {
    const { gameId, teamId, playerId} = use(params)
    invariant(playerId, `A Player ID must be provided.`)
    invariant(teamId, `A Team ID must be provided.`)
    invariant(gameId, `A Game ID must be provided.`)
    const websocketHost = process.env.SERVER_HOST || "aye-aye.robbiebyrd.com"
    const websocketPort = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 80

    const [gameData, setGameData] = useState<GameData>()

    const ws = useMemo(() => {
        const ws = new WebSocket(`ws://${websocketHost}:${websocketPort}/ws/${gameId}/${teamId}/${playerId}`)
        ws.onmessage = function (event) {
            const json = JSON.parse(event.data) as GameData
            try {
                setGameData(json)
            } catch (err) {
                console.log(err)
            }
        }
        return ws
    }, [gameId, playerId])

    const canInput = useMemo(() => {
        const a = gameData?.sceneData.submissions?.find((s) => s.playerId == playerId)
        return !!a?.entry
    }, [gameData])

    const canDraw = useMemo(() => {
        return gameData?.sceneData.letters.some((l) => l === " ")
    }, [gameData?.sceneData.letters])

    const teams = useMemo(() => {
        if (!gameData?.players) {
            return
        }

        const result: Record<string, Player[]> = {}
        gameData.players.forEach(player => {
            const key = String(player.team)
            result[key] = [...(result[key] || []), player]
        })

        return Object.entries(result)
    }, [gameData?.players])

    return (
        <div>
            <main className="w-svw h-svh" style={{
                backgroundImage: `url('/img/bgletterboard@2x.png')`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                padding: "1em"
            }}>
                {gameData?.activeSceneId == "letterBoard" && (
                    <>
                        <div className="flex justify-center w-full min-h-[15vh]">
                            {teams?.at(0)?.at(0) ? (
                                <TeamPlacard
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
                            <div className="flex flex-col items-center justify-center flex-grow">
                                <div
                                    className={'h-[10em] relative aspect-square mb-0 items-center content-center text-center justify-center'}
                                    style={{
                                        backgroundImage: "url('/img/clock.png')",
                                        backgroundSize: "contain",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center"
                                    }}>
                                    <img src={'/img/clock-arm.svg'} className={''} style={{
                                        transform: `rotate(${gameData.sceneData.timer >= 0 ? gameData.sceneData.timer * 6 : 0}deg)`
                                    }}/>
                                    {gameData.sceneData.timer >= 0 ?
                                        <div className={'font-bold'}
                                             style={{
                                                 fontSize: '5em',
                                                 position: "relative",
                                                 top: "-90%",
                                             }}>{gameData.sceneData.timer}</div> :
                                        <img className={'w-1/2 m-auto'} style={{
                                            position: "relative",
                                            top: "-75%",
                                        }} src={'/img/lembers.svg'}/>
                                    }
                                </div>
                            </div>
                            {/*<div className="flex flex-col items-center justify-center">*/}
                            {/*    <p className="font-bold text-center">{gameData?.gameId}</p>*/}
                            {/*</div>*/}
                            {teams?.at(1)?.at(0) ? (
                                <TeamPlacard
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
                            {/*<div className="">*/}
                            {/*    <ul>*/}
                            {/*        {gameData?.sceneData.submissions?.map((submission) => {*/}
                            {/*            return (*/}
                        {/*                <li key={submission.playerId}>{submission.playerId} | {submission.correct ? "Correct" : "Incorrect"}</li>)*/}
                        {/*        })}*/}
                        {/*    </ul>*/}
                        {/*</div>*/}
                        <Letters letters={gameData?.sceneData.board}/>
                        <Draw gameId={gameId} playerId={playerId} ws={ws} show={canDraw}/>
                        <Actions gameId={gameId} playerId={playerId} ws={ws} inputEnabled={canInput} show={!canDraw}
                                 timer={gameData.sceneData.timer}/>
                    </>
                )}
            </main>
            <footer className="">
            </footer>
        </div>
    )
}

