"use client"

import {use, useMemo, useState} from "react"
import {GameData} from "@/models/letterboard"
import invariant from 'tiny-invariant'
import {LetterboardScene} from "@/components/scenes/letterboard/letterboard";
import {LobbyScene} from "@/components/scenes/lobby/lobby";
import {ConundrumScene} from "@/components/scenes/conundrum/conundrum";


export default function Page({params}: {
    params: Promise<{ gameId: string, teamId: string; playerId: string }>
}) {
    const {gameId, teamId, playerId} = use(params)
    invariant(playerId, 'A Player ID must be provided.')
    invariant(teamId, 'A Team ID must be provided.')
    invariant(gameId, 'A Game ID must be provided.')
    const wsHost = process.env.SERVER_HOST || "localhost"
    const wsPort = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 5002
    const wsProtocol = process.env.SERVER_PROTOCOL || "ws"
    const [gameData, setGameData] = useState<GameData>()

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

    return (
        <div>
            <main className="w-svw h-svh" style={{
                backgroundImage: `url('/img/bgletterboard@2x.png')`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                padding: "1em"
            }}>
                {gameData?.activeSceneId == "letterboard" && (
                    <LetterboardScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} ws={ws}/>
                )}
                {gameData?.activeSceneId == "lobby" && (
                    <LobbyScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} ws={ws}/>
                )}
                {gameData?.activeSceneId == "conundrum" && (
                    <ConundrumScene teamId={teamId} gameId={gameId} gameData={gameData} playerId={playerId} ws={ws}/>
                )}
            </main>
            <footer className="">
            </footer>
        </div>
    )
}

