import {Button} from "@/components/button";

export type DrawProps = {
    gameId: string
    playerId: string
    sendMessage: (payload: string) => void
    drawn?: number[]
}

const Draw: React.FC<DrawProps> = ({gameId, playerId, sendMessage, drawn}) => {
    const sceneId = "mathsboard"

    const draw = (drawType: "drawRandom" | "draw", numberType?: "big" | "little") => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: drawType,
            type: drawType == "drawRandom" ? undefined : numberType
        }
        sendMessage(JSON.stringify(submission))
    }

    const drawBig = () => {
        draw("draw", "big")
    }

    const drawRandom = () => {
        draw("drawRandom")
    }

    const drawLittle = () => {
        draw("draw", "little")
    }

    return (
        <div className="w-full md:w-2/3">
            <div className={"z-0 -mt-4 p-0.5 lg:p-2 border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help rounded-lg mb-2"}>
                <h1 className={'text-md lg:text-4xl text-center text-white'}>
                    Draw {9 - (drawn?.filter((a) => a != 0).length || 0)} More Numbers
                </h1>
            </div>
            <div className={"flex flex-col md:flex-row justify-center"}>
                <div className="flex align-middle justify-center">
                    <Button label={'Draw Big'} onClickFunc={drawBig}/>
                </div>
                <div className="flex flex-col items-center align-middle justify-center">
                    <Button label={'Draw Random'} onClickFunc={drawRandom}/>
                </div>
                <div className="flex align-middle justify-center">
                    <Button label={'Draw Little'} onClickFunc={drawLittle}/>
                </div>
            </div>
        </div>
    )
}

export default Draw
