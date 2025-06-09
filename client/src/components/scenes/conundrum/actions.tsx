import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button, ButtonWrapper} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'

const ConundrumActions: React.FC<Pick<LetterboardProps, 'gameId' | 'playerId' | 'sendMessage' | 'show' | 'timer' | 'gameData'> & {
    inputEnabled: boolean
}> = ({gameId, playerId, gameData, inputEnabled, sendMessage, show, timer}) => {
    const sceneId = "conundrum"
    const [inputValue, setInputValue] = useState('')

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const resetBoard = () => {
        const submission = {
            action: "reset",
            gameId,
            playerId,
            sceneId
        }
        sendMessage(JSON.stringify(submission))
        setInputValue("")
    }

    const startTimer = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "start",
        }
        sendMessage(JSON.stringify(submission))
    }

    const cancelTimer = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "cancel",
        }
        sendMessage(JSON.stringify(submission))
    }

    const handleSubmit = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "submit",
            submission: inputValue,
        }
        sendMessage(JSON.stringify(submission))
    }

    const nextScene = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId: "sceneChange"
        }
        sendMessage(JSON.stringify(submission))
    }


    const preventSubmit = (event: FormEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (timer === -1 || timer === undefined) {
            handleSubmit()
        }
    }, [timer])

    const {timerRun} = gameData.scenes[gameData.currentScene]

    return show && (
        <div className="flex w-full bottom-2">
            <h1>test</h1>
            {timer && timer > 0 ? (
                <div className={"w-full grid grid-cols-8 gap-1"}>
                    <div className={"col-start-1 col-span-2 flex align-center justify-center items-center"}>
                        {timer && timer > 0 &&
                            <Button label={"Cancel"} onClickFunc={cancelTimer}></Button>
                        }
                    </div>
                    <div className={"col-start-3 col-span-4 flex align-middle justify-center"}>
                        <form id="form" onSubmit={preventSubmit}>
                            <div className="flex flex-col items-center p-5">
                                <div className={"border-4 bg-burnham-500 bg-opacity-50"} style={{
                                    borderRadius: ".5em",
                                    borderBottom: "none",
                                    padding: ".25em .5em 1.25rem .5em",
                                    marginBottom: "-1rem"
                                }}>
                                    <h1 className=" text-xl text-center text-white">Type Your Answer Here: </h1>
                                </div>
                                <ButtonWrapper>
                                    <input
                                        maxLength={9}
                                        className="text-center text-4xl flex items-center p-2 uppercase"
                                        style={{outline: "none", background: "none"}}
                                        name="letters" id="letters" disabled={inputEnabled} onChange={handleChange}
                                        value={inputValue}/>
                                </ButtonWrapper>
                                <div className={"border-4 bg-burnham-500 bg-opacity-50"} style={{
                                    borderRadius: ".5em",
                                    borderTop: "none",
                                    padding: "1.25em .5em .25rem .5em",
                                    marginTop: "-1rem"
                                }}>
                                    <h1 className=" text-xl text-center text-white">Your answer will automatically submit after the timer has completed. </h1>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className={"w-full grid grid-cols-6 gap-1"}>
                    <div className={"col-start-1 col-span-3 flex justify-center "}>
                        <TimedControllerButton label={'Reset'} onClickFunc={resetBoard} timer={timer || -1}/>
                    </div>
                    <div className={"col-start-4 col-span-3 flex align-center justify-center "}>
                        {!timerRun &&
                            <TimedControllerButton label={'Timer'} onClickFunc={startTimer} timer={timer || -1}/>}
                        {timerRun && (
                            <Button label={"Next"} onClickFunc={nextScene}></Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ConundrumActions

export type TimedControllerButtonProps = {
    label: string
    onClickFunc?: () => void
    timer: number
}

export const TimedControllerButton: React.FC<TimedControllerButtonProps> = ({label, onClickFunc, timer}) => {
    return timer < 0 && <Button label={label} onClickFunc={onClickFunc}/>
}
