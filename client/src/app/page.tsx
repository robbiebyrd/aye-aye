"use client"

import {useState} from "react";
import {redirect, useSearchParams} from 'next/navigation'
import {Button} from "@/components/button";

export default function Home() {
    const searchParams = useSearchParams();
    console.log(searchParams.get("game"))

    const [teamId, setTeamId] = useState(searchParams.get("team") ?? "team1")
    const [gameId, setGameId] = useState(searchParams.get("game"))
    const [playerId, setPlayerId] = useState("")

    const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event.target.value)
        setTeamId(event.target.value);
    };

    const handleGameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGameId(event.target.value);
    };

    const handlePlayerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerId(event.target.value);
    };

    const handleSubmit = () => {
        redirect(`/game/${gameId}/${teamId}/${playerId}`) // Navigate to the new post page
    };

    return (
        <div>
            <main className="">
                <form>
                    <div className={'flex flex-col content-center items-center justify-center w-svw h-svh gap-8'}>
                        <div className={'flex flex-col items-center justify-center '}>
                            <label form={'gameId'} className={'text-4xl text-white'}>Game ID: </label>
                            <input defaultValue={gameId || undefined} name={'gameId'} onChange={handleGameChange}
                                   className={'text-center text-4xl border-4 border-sherwood-green-300 border-solid flex items-center p-2 uppercase'}
                                   placeholder={'Existing or new game'}/>
                        </div>
                        <div className={'flex flex-col items-center justify-center'}>
                            <label form={'teamId'} className={'text-4xl text-white'}>Team</label>
                            <select defaultValue={teamId || "team1"} name="teamId" id="teamId"
                                    onChange={handleTeamChange}
                                    className={'text-center text-4xl border-4 border-sherwood-green-300 border-solid flex items-center p-2 uppercase'}>
                                <option value="team1">Team 1</option>
                                <option value="team2">Team 2</option>
                            </select>
                        </div>
                        <div className={'flex flex-col items-center justify-center'}>
                            <label form={'playerId'} className={'text-4xl text-white'}>Player Name: </label>
                            <input name={'playerId'} onChange={handlePlayerChange}
                                   className={'text-center text-4xl border-4 border-sherwood-green-300 border-solid flex items-center p-2 uppercase'}/>
                        </div>
                        <Button label={'Enter the Game!'} onClickFunc={handleSubmit}/>

                    </div>
                </form>
            </main>
            <footer className="">
            </footer>
        </div>
    );
}
