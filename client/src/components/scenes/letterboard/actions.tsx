import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {Button} from "@/components/button";

export type LetterboardProps = {
    gameId: string
    playerId: string
    inputEnabled: boolean
    ws?: WebSocket
    show?: boolean
    timer: number
}

const Actions: React.FC<LetterboardProps> = ({gameId, playerId, inputEnabled, ws, show, timer}) => {
    const sceneId = "letterBoard"
    const [inputValue, setInputValue] = useState('')
    const [showTimer, setShowTimer] = useState<boolean>(true)
    const [showSolver, setShowSolver] = useState<boolean>(true)

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
        setShowTimer(true)
        setShowSolver(true)
        setInputValue("")
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
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "start",
        }
        setShowTimer(false)
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
        <div className="flex w-full  bottom-2">
            <TimedControllerButton label={'Reset'} onClickFunc={resetBoard} timer={timer}/>
            <div className="flex-grow"></div>
            {showTimer && <TimedControllerButton label={'Timer'} onClickFunc={startTimer} timer={timer}/>}
            {timer > 0 &&
                <form id="form" onSubmit={preventSubmit}>
                    <div className="flex flex-col items-center p-5 bg-white">
                        <h1 className=" text-xl text-center text-burnham-500">Type Your Answer Here: </h1>
                        <input
                            className="text-center text-4xl border-4 border-sherwood-green-500 border-solid flex items-center p-2 uppercase"
                            name="letters" id="letters" disabled={inputEnabled} onChange={handleChange}
                            value={inputValue}/>
                    </div>
                </form>
            }
            <div className="flex-grow"></div>
            {showSolver && <TimedControllerButton label={'Solve'} onClickFunc={solve} timer={timer}/>}
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
