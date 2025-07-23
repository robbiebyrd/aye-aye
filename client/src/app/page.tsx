"use client"

import React, {useState} from "react";
import {redirect, useSearchParams} from 'next/navigation'
import {Button, ButtonWrapper} from "@/components/button";

export default function Home() {
    const searchParams = useSearchParams();
    console.log(searchParams.get("game"))

    const [teamId, setTeamId] = useState(searchParams.get("team") ?? "Red")
    const [gameId, setGameId] = useState(searchParams.get("game"))
    const [playerId, setPlayerId] = useState("")

    const wsHost = process.env.NEXT_PUBLIC_WS_SERVER_HOST || "localhost"
    const wsPort = process.env.NEXT_PUBLIC_WS_SERVER_PORT ? parseInt(process.env.NEXT_PUBLIC_WS_SERVER_PORT, 10) : 5002

    async function fetchUnusedGameCode() {
        const res = await fetch(`//${wsHost}:${wsPort}/gc`);
        const result = await res.json();
        return result?.gameCode
    }

    const handleAutoGameCode = async () => {
        fetchUnusedGameCode().then((gc) => setGameId(gc))
    };

    const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTeamId(event.target.value);
    };

    const handleGameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGameId(event.target.value);
    };

    const handlePlayerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerId(event.target.value);
    };

    const handleSubmit = () => {
        if (!gameId) {
            alert("Please enter a game code");
            return;
        }
        if (!teamId) {
            alert("Please select a team");
            return;
        }
        if (!playerId) {
            alert("Please enter a player name");
            return;
        }
        redirect(`/game/${gameId}/${teamId}/${playerId}`) // Navigate to the new post page
    };

    return (
        <main className={"bg-no-repeat bg-cover w-svw h-svh flex flex-col justify-center"} style={{backgroundImage: "url('/img/bgletterboard@2x.png')"}}>
            <div
                className="flex flex-col md:flex-row gap-4 md:gap-16 p-8 content-center items-center justify-center text-center "
            >
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    <div className={"w-8 md:w-16 aspect-square relative mb-4"} style={{mask: "url(/img/lembers.svg)", maskSize: "cover", backgroundColor: "white"}}>&nbsp;
                    </div>
                    <h4 className={"text-md text-white"}>Let&#39;s Play</h4>
                    <h1 className={"text-6xl md:text-8xl text-white mb-8"}>Aye-Aye!</h1>
                    <a href={"/how-to-play"}>
                        <ButtonWrapper className={""}><h1 className={"text-2xl md:text-4xl"}>How to Play</h1></ButtonWrapper>
                    </a>
                </div>
                <div className={"w-full md:w-1/2 border-2 p-4 rounded-lg bg-sherwood-green-700 bg-opacity-80"}>
                    <form>
                        <div className={'flex flex-col content-center items-center justify-center gap-2 md:gap-8'}>
                            <div className={'flex flex-col items-center justify-center '}>
                                <label form={'gameId'} className={'text-xl md:text-4xl text-white'}>Game Code: </label>
                                <input name={'gameId'} onChange={handleGameChange}
                                       value={gameId || ""}
                                       className={'text-center text-xl md:text-4xl border-4 border-sherwood-green-300 border-solid flex items-center p-2 uppercase'}
                                       placeholder={'Existing or new game'}/>
                                <Button onClickFunc={handleAutoGameCode} disabled={false}>Generate</Button>
                            </div>
                            <div className={'flex flex-col items-center justify-center'}>
                                <label form={'teamId'} className={'text-xl md:text-4xl text-white'}>Team</label>
                                <select defaultValue={teamId || "Red"} name="teamId" id="teamId"
                                        onChange={handleTeamChange}
                                        className={'text-center text-xl md:text-4xl border-4 border-sherwood-green-300 border-solid outline-0 flex items-center p-2 uppercase'}>
                                    <option value="Red">Red Team</option>
                                    <option value="Blue">Blue Team</option>
                                </select>
                            </div>
                            <div className={'flex flex-col items-center justify-center'}>
                                <label form={'playerId'} className={'text-xl md:text-4xl text-white'}>Player Name: </label>
                                <input name={'playerId'} onChange={handlePlayerChange}
                                       className={'text-center text-xl md:text-4xl border-4 border-sherwood-green-300 border-solid flex items-center p-2 uppercase'}/>
                            </div>
                            <Button onClickFunc={handleSubmit} disabled={false}>Enter the Game!</Button>
                        </div>
                    </form>
                </div>
            </div>
            <div className={"flex items-center text-center w-full justify-center"}>
                <h1 className={"text-white text-2xl"}>Developed by <a href={"https://robbiebyrd.com"} target={"_blank"}>Robbie Byrd</a></h1>
            </div>
        </main>
    );
}
