import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button, ButtonWrapper} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'
import {TimedControllerButton} from "@/components/scenes/conundrum/actions";

const Actions: React.FC<Pick<LetterboardProps, 'playerId' | 'sendMessage' | 'show' | 'timer' | 'gameData'> & {
    inputEnabled: boolean
}> = ({gameData, playerId, inputEnabled, sendMessage, show, timer}) => {
    const sceneId = "letterboard"
    const [inputValue, setInputValue] = useState('')
    const {gameId} = gameData
    const isHost = gameData.players[playerId]?.host
    const {timerRun} = gameData.scenes[gameData.currentScene]

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const standardMessageAttributes = {
        gameId,
        playerId,
        sceneId
    }

    const resetBoard = () => {
        const submission = {
            action: "reset",
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
        setInputValue("")
    }

    const solve = () => {
        const submission = {
            action: "solve",
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
    }

    const startTimer = () => {
        const submission = {
            action: "start",
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
    }

    const cancelTimer = () => {
        const submission = {
            action: "cancel",
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
        setInputValue("")
    }

    const handleSubmit = () => {
        const submission = {
            action: "submit",
            submission: inputValue,
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
        setInputValue("")
    }

    const nextScene = () => {
        const submission = {
            sceneId: "sceneChange",
            gameId,
            playerId,
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

    return show && (
        <div className="flex w-full bottom-2">
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
                                <div style={{zIndex: 10}}>
                                    <ButtonWrapper>
                                        <input
                                            maxLength={9}
                                            className="text-center text-xl lg:text-4xl flex items-center p-2 uppercase"
                                            style={{outline: "none", background: "none"}}
                                            name="letters" id="letters" disabled={inputEnabled} onChange={handleChange}
                                            value={inputValue}/>
                                    </ButtonWrapper>
                                </div>
                                <div className={"w-2/3 border-4 bg-burnham-500 bg-opacity-50"} style={{
                                    borderRadius: ".5em",
                                    borderTop: "none",
                                    padding: "1.25em .5em .25rem .5em",
                                    marginTop: "-1rem"
                                }}>
                                    <h1 className=" text-xl text-center text-white">Your answer will automatically submit<br/> after the timer has completed. </h1>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className={"w-full grid grid-cols-6 gap-1"}>
                    {isHost && (
                        <>
                            <div className={"border-4 bg-burnham-500 bg-opacity-50 col-start-3 col-span-2 help"} style={{
                                     borderRadius: ".5em",
                                     padding: ".5em",
                                     marginBottom: '1em'
                                 }}>
                                <h1 className={'text-xl lg:text-4xl text-center text-white'}>{
                                    !timerRun ? 'Click Start Timer to Begin' : 'Click Next for Next Round'
                                }</h1></div>
                            <div className={"col-start-1 col-span-2 flex justify-center "}>
                                {!timerRun &&
                                    <TimedControllerButton label={'Reset'} onClickFunc={resetBoard} timer={timer || -1}/>
                                }
                            </div>
                            <div className={"col-start-3 col-span-2 flex align-center justify-center "}>
                                {!timerRun && <TimedControllerButton label={'Start Timer'} onClickFunc={startTimer}
                                                                     timer={timer || -1}/>}
                                {timerRun && (
                                    <Button label={"Next"} onClickFunc={nextScene}></Button>
                                )}
                            </div>
                            <div className={"col-start-5 col-span-2 flex align-center justify-center"}>
                                {timerRun &&
                                    <TimedControllerButton label={'Solve'} onClickFunc={solve} timer={timer || -1}/>}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Actions
