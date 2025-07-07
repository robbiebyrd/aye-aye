import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button, ButtonWrapper} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'

const Input: React.FC<Pick<LetterboardProps, 'playerId' | 'sendMessage' | 'timer' > & {
    inputEnabled: boolean
    gameId: string
    controlling: boolean
}> = ({gameId, playerId, inputEnabled, sendMessage, timer, controlling}) => {
    const sceneId = "letterboard"
    const [inputValue, setInputValue] = useState('')

    const standardMessageAttributes = {
        gameId,
        playerId,
        sceneId
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
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

    const preventSubmit = (event: FormEvent) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (timer === -1 || timer === undefined) {
            handleSubmit()
        }
    }, [timer])

    return (
        <div className="flex w-full bottom-2">
            <div className={"w-full " + (timer && timer > 0 ? "" : "hidden")}>
                <div className={"flex align-middle justify-center"}>
                    <form id="form" onSubmit={preventSubmit}>
                        <div className="flex flex-col items-center p-1 md:p-5">
                            <div className={"border-4 bg-burnham-500 bg-opacity-50"} style={{
                                borderRadius: ".5em",
                                borderBottom: "none",
                                padding: ".25em .5em 1.25rem .5em",
                                marginBottom: "-1rem"
                            }}>
                                <h1 className="text-md lg:text-xl text-center text-white">Type Your Answer Here: </h1>
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
                            <div className={"w-10/12 md:w-2/3 bg-burnham-500 bg-opacity-50"}>
                                <h1 className="text-xs lg:text-lg text-center text-white italic">
                                    Your answer submits automatically once the timer is done.
                                </h1>
                            </div>
                        </div>
                    </form>
                </div>
                {controlling && (
                    <div className={"align-center justify-center items-center hidden md:flex"}>
                        {timer && timer > 0 &&
                            <Button onClickFunc={cancelTimer}>Cancel</Button>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default Input
