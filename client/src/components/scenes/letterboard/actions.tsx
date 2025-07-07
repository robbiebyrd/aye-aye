import React, {useEffect, useState} from "react";
import {Button} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'
import {TimedControllerButton} from "@/components/scenes/conundrum/actions";

const Actions: React.FC<Pick<LetterboardProps, 'playerId' | 'sendMessage' | 'timer' | 'gameData'> & {
    inputEnabled: boolean
}> = ({gameData, playerId, sendMessage, timer}) => {
    const sceneId = "letterboard"
    const [inputValue, setInputValue] = useState('')
    const {gameId} = gameData
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

    useEffect(() => {
        if (timer === -1 || timer === undefined) {
            handleSubmit()
        }
    }, [timer])

    return (
        <div className="flex w-full md:w-2/3 bottom-2">
            <div className={"w-full"}>
                <>
                    <div className={"border-4 bg-burnham-500 bg-opacity-50 help"} style={{
                        borderRadius: ".5em",
                        padding: ".5em",
                        marginBottom: '1em'
                    }}>
                        <h1 className={'text-xl lg:text-4xl text-center text-white'}>
                            {!timerRun ? 'Click Start Timer to Begin' : 'Click Next for Next Round'}
                        </h1>
                    </div>
                    <div className={"flex gap-1 justify-center"}>
                        <div className={"flex justify-center"}>
                            {!timerRun &&
                                <TimedControllerButton onClickFunc={resetBoard} timer={timer || -1}>Reset</TimedControllerButton>
                            }
                        </div>
                        <div className={"flex align-center justify-center "}>
                            {!timerRun && <TimedControllerButton onClickFunc={startTimer}
                                                                 timer={timer || -1}>Start Timer</TimedControllerButton>}
                            {timerRun && (
                                <Button onClickFunc={nextScene}>Next</Button>
                            )}
                        </div>
                        <div className={"flex align-center justify-center"}>
                            {timerRun &&
                                <TimedControllerButton onClickFunc={solve} timer={timer || -1}>Solve</TimedControllerButton>}
                        </div>
                    </div>
                </>
            </div>
        </div>
    )
}

export default Actions
