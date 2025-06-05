import React, {FormEvent, useEffect, useState} from "react";
import {Button} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'
import {TimedControllerButton} from "@/components/scenes/conundrum/actions";
import {addStyles, EditableMathField, MathField} from 'react-mathquill'

const Actions: React.FC<Pick<LetterboardProps, 'playerId' | 'ws' | 'show' | 'timer' | 'gameData'>> = ({gameData, playerId, ws, show, timer}) => {
    const sceneId = "mathsboard"
    const [inputValue, setInputValue] = useState<MathField | null>(null)
    const {gameId} = gameData
    const isHost = gameData.players[playerId]?.host
    const {timerRun} = gameData.scenes[gameData.currentScene]

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
        ws?.send(JSON.stringify(submission))
        setInputValue(null)
    }

    const startTimer = () => {
        const submission = {
            action: "start",
            ...standardMessageAttributes
        }
        ws?.send(JSON.stringify(submission))
    }

    const cancelTimer = () => {
        const submission = {
            action: "cancel",
            ...standardMessageAttributes
        }
        ws?.send(JSON.stringify(submission))
        setInputValue(null)
    }

    const handleSubmit = () => {
        const submission = {
            action: "submit",
            submission: inputValue?.text(),
            ...standardMessageAttributes
        }
        ws?.send(JSON.stringify(submission))
        setInputValue(null)
    }

    const nextScene = () => {
        const submission = {
            sceneId: "sceneChange",
            gameId,
            playerId,
        }
        ws?.send(JSON.stringify(submission))
    }

    const preventSubmit = (event: FormEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (timer === -1 || timer === undefined && inputValue?.text() !== "") {
            handleSubmit()
        }
    }, [timer])
    addStyles()

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
                        <form id="form" onSubmit={preventSubmit} className={'w-full'}>
                            <div className="flex flex-col items-center p-5">
                                <div className={"border-4 bg-burnham-500 bg-opacity-50"} style={{
                                    borderRadius: ".5em",
                                    borderBottom: "none",
                                    padding: ".25em .5em 1.25rem .5em",
                                    marginBottom: "-1rem"
                                }}>
                                    <h1 className=" text-xl text-center text-white">Type Your Answer Here: </h1>
                                </div>
                                <div className={'bg-white text-xl'} style={{
                                    position: "relative", width: "100%", height: "10em",
                                    borderRadius: ".5em",
                                    padding: ".5em",
                                }}>
                                    <EditableMathField
                                        className={'w-full'}
                                        style={{
                                            boxShadow: "none",
                                            fontFamily: "Dosis",
                                            fontSize: "2em",
                                            border: "none",
                                            outline: "none",
                                            height: "100%",
                                            alignContent: "center",
                                            textAlign: "center"
                                        }}
                                        latex={inputValue?.latex() || ""}
                                        onKeyDown={(e) => {
                                            console.log(e.key)
                                            if (!['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '/', '(', ')', "+", "-", 'Tab', " "].includes(e.key)) {
                                                e.preventDefault()
                                                return
                                            }
                                        }}
                                        onChange={(mathField) => {
                                            setInputValue(mathField)
                                        }}
                                    />
                                </div>
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
                    {isHost && (
                        <>
                            <div className={"border-4 bg-burnham-500 bg-opacity-50 col-start-3 col-span-2 help"}
                                 style={{
                                     borderRadius: ".5em",
                                     padding: ".5em",
                                     marginBottom: '1em'
                                 }}>
                                <h1 className={'text-4xl text-center text-white'}>{
                                    !timerRun ? 'Click Start Timer to Begin' : 'Click Next for Next Round'
                                }</h1></div>
                            <div className={"col-start-1 col-span-2 flex justify-center "}>
                                {!timerRun &&
                                    <TimedControllerButton label={'Reset'} onClickFunc={resetBoard}
                                                           timer={timer || -1}/>
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
                                {/*{timerRun &&*/}
                                {/*    <TimedControllerButton label={'Solve'} onClickFunc={solve} timer={timer || -1}/>}*/}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Actions
