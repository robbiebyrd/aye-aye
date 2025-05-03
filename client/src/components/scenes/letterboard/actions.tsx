import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button, ButtonWrapper} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'
import {TimedControllerButton} from "@/components/scenes/conundrum/actions";

const Actions: React.FC<Pick<LetterboardProps, 'gameId' | 'playerId' | 'ws' | 'show' | 'timer' | 'gameData'> & {
    inputEnabled: boolean
}> = ({gameData, gameId, playerId, inputEnabled, ws, show, timer}) => {
    const sceneId = "letterboard"
    const [inputValue, setInputValue] = useState('')

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
        ws?.send(JSON.stringify(submission))
        setInputValue("")
    }

    const solve = () => {
        const submission = {
            action: "solve",
            ...standardMessageAttributes
        }
        ws?.send(JSON.stringify(submission))
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
        setInputValue("")
    }

    const handleSubmit = () => {
        const submission = {
            action: "submit",
            submission: inputValue,
            ...standardMessageAttributes
        }
        ws?.send(JSON.stringify(submission))
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
                                <ButtonWrapper>
                                    <pre>{JSON.stringify(inputEnabled)}</pre>
                                    <input
                                        maxLength={9}
                                        className="text-center text-4xl flex items-center p-2 uppercase"
                                        style={{outline: "none", background: "none"}}
                                        name="letters" id="letters" disabled={inputEnabled} onChange={handleChange}
                                        value={inputValue}/>
                                </ButtonWrapper>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className={"w-full grid grid-cols-6 gap-1"}>
                    {isHost && (
                        <>
                            <div className={"col-start-1 col-span-2 flex justify-center "}>
                                <TimedControllerButton label={'Reset'} onClickFunc={resetBoard} timer={timer || -1}/>
                            </div>
                            <div className={"col-start-3 col-span-2 flex align-center justify-center "}>
                                {!timerRun && <TimedControllerButton label={'Timer'} onClickFunc={startTimer}
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
