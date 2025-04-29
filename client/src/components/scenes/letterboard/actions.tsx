import {ChangeEvent, FormEvent, useEffect, useMemo, useState} from "react";
import {Button, ButtonWrapper} from "@/components/button";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import '@/app/globals.css'

const Actions: React.FC<Pick<LetterboardProps, 'gameId' | 'playerId' | 'ws' | 'show' | 'timer' | 'gameData'> & {
    inputEnabled: boolean
}> = ({gameData, gameId, playerId, inputEnabled, ws, show, timer}) => {
    const sceneId = "letterboard"
    const [inputValue, setInputValue] = useState('')
    const [showSolver, setShowSolver] = useState<boolean>(false)
    const [timerRun, setTimerRun] = useState<boolean>(false)

    const isHost = gameData.players[playerId]?.host

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
        ws?.send(JSON.stringify(submission))
        setInputValue("")
        setTimerRun(false)
    }

    const solve = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "solve",
        }
        setShowSolver(false)
        ws?.send(JSON.stringify(submission))
    }

    const startTimer = () => {
        setShowSolver(isHost)
        setTimerRun(true)
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "start",
        }
        ws?.send(JSON.stringify(submission))
    }

    const cancelTimer = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "cancel",
        }
        ws?.send(JSON.stringify(submission))
    }

    const handleSubmit = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "submit",
            submission: inputValue,
        }
        ws?.send(JSON.stringify(submission))
        setInputValue("")
    }

    const nextScene = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId: "sceneChange",
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
                                <div className={"border-4 bg-burnham-500 bg-opacity-50"} style={{borderRadius: ".5em", borderBottom: "none", padding: ".25em .5em 1.25rem .5em", marginBottom: "-1rem"}} >
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
                                {!timerRun && <TimedControllerButton label={'Timer'} onClickFunc={startTimer} timer={timer || -1}/>}
                                {timerRun && (
                                    <Button label={"Next"} onClickFunc={nextScene}></Button>
                                )}
                            </div>
                            <div className={"col-start-5 col-span-2 flex align-center justify-center"}>
                                {showSolver && <TimedControllerButton label={'Solve'} onClickFunc={solve} timer={timer || -1}/>}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Actions

export type TimedControllerButtonProps = {
    label: string
    onClickFunc?: () => void
    timer: number
}

const TimedControllerButton: React.FC<TimedControllerButtonProps> = ({label, onClickFunc, timer}) => {
    return timer < 0 && <Button label={label} onClickFunc={onClickFunc}/>
}
