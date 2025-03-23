"use client"

import {useState} from "react";
import { redirect } from 'next/navigation'
import {Button} from "@/components/button";

export default function Home() {
    const [teamId, setTeamId] = useState("team1")
    const [gameId, setGameId] = useState("")
    const [playerId, setPlayerId] = useState("")

    const handleTeamChange = (event: React.FormEvent) => {
        console.log(event.target.value)
        setTeamId(event.target.value);
    };

    const handleGameChange = (event: React.FormEvent<HTMLInputElement>) => {
        setGameId(event.target.value);
    };

    const handlePlayerChange = (event: React.FormEvent<HTMLInputElement>) => {
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
                            <input name={'gameId'} onChange={handleGameChange} className={'text-center text-4xl border-4 border-sherwood-green-500 border-solid flex items-center p-2 uppercase'} placeholder={'Existing or new game'}/>
                        </div>
                        <div className={'flex flex-col items-center justify-center'}>
                            <label form={'teamId'} className={'text-4xl text-white'}>Team</label>
                            <select name="teamId" id="teamId" onChange={handleTeamChange} className={'text-center text-4xl border-4 border-sherwood-green-500 border-solid flex items-center p-2 uppercase'}>
                                <option value="team1">Team 1</option>
                                <option value="team2">Team 2</option>
                            </select>
                        </div>
                        <div className={'flex flex-col items-center justify-center'}>
                            <label form={'playerId'} className={'text-4xl text-white'}>Player Name: </label>
                            <input name={'playerId'} onChange={handlePlayerChange} className={'text-center text-4xl border-4 border-sherwood-green-500 border-solid flex items-center p-2 uppercase'}/>
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
