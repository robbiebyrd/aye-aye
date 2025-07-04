import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button, ButtonWrapper} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'

const ConundrumActions: React.FC<Pick<LetterboardProps, 'gameId' | 'playerId' | 'sendMessage' | 'show' | 'timer' | 'gameData'> & {
    inputEnabled: boolean
    controlling: boolean
}> = ({gameId, playerId, gameData, inputEnabled, sendMessage, show, timer, controlling}) => {
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
                <div className={'flex flex-col'}>
                    <div className={"w-full grid grid-cols-8 gap-1"}>
                        <div className={"col-start-3 col-span-4 flex align-middle justify-center"}>
                            <form id="form" onSubmit={preventSubmit}>
                                <div className="flex flex-col items-center p-5">
                                    <div className={"border-4 bg-burnham-500 bg-opacity-50 rounded-r-lg border-b-none -mb-4"} style={{
                                            padding: ".25em .5em 1.25rem .5em",
                                        }}>
                                        <h1 className="text-md lg:text-xl text-center text-white">Type Your Answer Here: </h1>
                                    </div>
                                    <ButtonWrapper>
                                        <input
                                            maxLength={9}
                                            className="text-center text-xl lg:text-4xl flex items-center p-2 uppercase"
                                            style={{outline: "none", background: "none"}}
                                            name="letters" id="letters" disabled={inputEnabled} onChange={handleChange}
                                            value={inputValue}/>
                                    </ButtonWrapper>
                                    <div className={"w-10/12 md:w-2/3 bg-burnham-500 bg-opacity-50"}>
                                        <h1 className="text-xs lg:text-lg text-center text-white italic">
                                            Your answer submits automatically once the timer is done.
                                        </h1>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    {controlling && (
                        <div className={"flex justify-center"}>
                            {timer && timer > 0 &&
                                <Button label={"Cancel"} onClickFunc={cancelTimer}></Button>
                            }
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {controlling && (
                        <div className={"w-full flex gap-1"}>
                            <div className={"flex justify-center"}>
                                <TimedControllerButton label={'Reset'} onClickFunc={resetBoard} timer={timer || -1}/>
                            </div>
                            <div className={"flex align-center justify-center"}>
                                {!timerRun &&
                                    <TimedControllerButton label={'Start'} onClickFunc={startTimer} timer={timer || -1}/>}
                                {timerRun && (
                                    <Button label={"Next"} onClickFunc={nextScene}></Button>
                                )}
                            </div>
                        </div>
                    )}
                </>

            )}
        </div>
    )
}

export type TimedControllerButtonProps = {
    label: string
    onClickFunc?: () => void
    timer: number
}

export const TimedControllerButton: React.FC<TimedControllerButtonProps> = ({label, onClickFunc, timer}) => {
    return timer < 0 && <Button label={label} onClickFunc={onClickFunc}/>
}

export default ConundrumActions
