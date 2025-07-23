"use client"

import {use, useEffect, useRef, useState} from "react"
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

    const ws = useRef<WebSocket>(null);

    const wsHost = process.env.NEXT_PUBLIC_WS_SERVER_HOST || "localhost"
    const wsPort = process.env.NEXT_PUBLIC_WS_SERVER_PORT ? parseInt(process.env.NEXT_PUBLIC_WS_SERVER_PORT, 10) : 5002
    const wsProtocol = process.env.NEXT_PUBLIC_WS_SERVER_PROTOCOL || "ws"

    useEffect(() => {
        if (!ws.current) {
            ws.current = new WebSocket(`${wsProtocol}://${wsHost}:${wsPort}/ws/${gameId}/${teamId}/${playerId}`);
            ws.current.onmessage = function (event) {
                const json = JSON.parse(event.data) as GameData
                try {
                    setGameData(json)
                } catch (err) {
                    console.log("error", err)
                }
            }
        }

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close()
            }
        }
    }, [])

    const sendMessage = (payload: string) => {
        ws.current?.send(payload)
    }

    return (
        <div>
            <main className="w-svw h-svh bg-cover bg-no-repeat p-4 flex flex-col" style={{
                backgroundImage: `url('${gameData?.scenes[gameData?.currentScene].background || '/img/bgletterboard@2x.png'}')`
            }}>
                {gameData?.scenes[gameData?.currentScene].scene == "lobby" && (
                    <LobbyScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId}
                                sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "letterboard" && (
                    <LetterboardScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId}
                                      sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "mathsboard" && (
                    <MathsboardScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId}
                                     sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "conundrum" && (
                    <ConundrumScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId}
                                    sendMessage={sendMessage}/>
                )}
                {gameData?.scenes[gameData?.currentScene].scene == "end" && (
                    <EndScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId}
                              sendMessage={sendMessage}/>
                )}
            </main>
            <footer></footer>
        </div>
    )
}

