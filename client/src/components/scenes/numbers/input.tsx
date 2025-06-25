"use client"

import React, {FormEvent, useEffect, useState} from "react";
import {Button} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'
import {addStyles, EditableMathField, MathField} from 'react-mathquill'

const Input: React.FC<Pick<LetterboardProps, 'playerId' | 'sendMessage' | 'timer' | 'gameData'>> = ({gameData, playerId, sendMessage, timer}) => {
    const sceneId = "mathsboard"
    const [inputValue, setInputValue] = useState<MathField | null>(null)
    const {gameId} = gameData

    const standardMessageAttributes = {
        gameId,
        playerId,
        sceneId
    }

    const cancelTimer = () => {
        const submission = {
            action: "cancel",
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
        setInputValue(null)
    }

    const handleSubmit = () => {
        const submission = {
            action: "submit",
            submission: inputValue?.text(),
            ...standardMessageAttributes
        }
        sendMessage(JSON.stringify(submission))
        setInputValue(null)
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

    return (
        <div className="flex w-full bottom-2">
            <div className={"w-full grid grid-cols-8 gap-1 " + (timer && timer > 0 ? "" : "hidden")}>
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
                            <div className={'bg-white text-4xl min-h-16'} style={{
                                position: "relative", width: "100%",
                                borderRadius: ".5em",
                                padding: ".5em",
                            }}>
                                <EditableMathField
                                    className={'w-full h-auto'}
                                    style={{
                                        boxShadow: "none",
                                        fontFamily: "Dosis",
                                        border: "none",
                                        outline: "none",
                                        height: "100%",
                                        alignContent: "center",
                                        textAlign: "center"
                                    }}
                                    latex={inputValue?.latex() || ""}
                                    onKeyDown={(e) => {
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
        </div>
    )
}

export default Input
