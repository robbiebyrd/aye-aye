"use client"

import {use, useMemo, useState} from "react"
import {GameData} from "@/models/letterboard"
import invariant from 'tiny-invariant'
import {LetterboardScene} from "@/components/scenes/letterboard/letterboard";
import {LobbyScene} from "@/components/scenes/lobby/lobby";
import {ConundrumScene} from "@/components/scenes/conundrum/conundrum";
import {MathsboardScene} from "@/components/scenes/numbers/mathsboard";
import {EndScene} from "@/components/scenes/end/end";


export default function Page({params}: {
    params: Promise<{ gameId: string, teamId: string; playerId: string }>
}) {
    const {gameId, teamId, playerId} = use(params)
    const [gameData, setGameData] = useState<GameData>()

    invariant(playerId, 'A Player ID must be provided.')
    invariant(teamId, 'A Team ID must be provided.')
    invariant(gameId, 'A Game ID must be provided.')
    const wsHost = process.env.SERVER_HOST || "aye-aye.robbiebyrd.com"
    const wsPort = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 443
    const wsProtocol = process.env.SERVER_PROTOCOL || "wss"


    const ws = useMemo(() => {
        const ws = new WebSocket(`${wsProtocol}://${wsHost}:${wsPort}/ws/${gameId}/${teamId}/${playerId}`)
        ws.onmessage = function (event) {
            const json = JSON.parse(event.data) as GameData
            try {
                setGameData(json)
            } catch (err) {
                console.log(err)
            }
        }
        return ws
    }, [gameId, playerId, teamId, wsHost, wsPort, wsProtocol])

    const sendMessage = (payload: string) => {
        ws.send(payload)
    }

    return (
        <div>
            <main className="w-svw h-svh" style={{
                backgroundImage: `url('/img/bgletterboard@2x.png')`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                padding: "1em"
            }}>
                {gameData?.scenes[gameData?.currentScene].scene == "letterboard" && (
                    <LetterboardScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "mathsboard" && (
                    <MathsboardScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "lobby" && (
                    <LobbyScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "end" && (
                    <EndScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "conundrum" && (
                    <ConundrumScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} sendMessage={sendMessage}/>
                )}
            </main>
            <footer></footer>
        </div>
    )
}

