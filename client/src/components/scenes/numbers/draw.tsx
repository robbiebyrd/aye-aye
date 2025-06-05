import {Button} from "@/components/button";

export type DrawProps = {
    gameId: string
    playerId: string
    ws?: WebSocket
    drawn?: number[]
}

const Draw: React.FC<DrawProps> = ({gameId, playerId, ws, drawn}) => {
    const sceneId = "mathsboard"

    const draw = (drawType: "drawRandom" | "draw", numberType?: "big" | "little") => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: drawType,
            type: drawType == "drawRandom" ? undefined : numberType
        }
        ws?.send(JSON.stringify(submission))
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
    console.log(drawn)

    return (
        <div className="grid grid-cols-3 w-full ">
            <div className={"border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help"} style={{
                borderRadius: ".5em",
                padding: ".5em",
                marginBottom: '1em'
            }}>
                <h1 className={'text-4xl text-center text-white'}>
                    Draw {6 - (drawn?.filter((a) => a != 0).length || 0)} More Numbers
                </h1>
            </div>
            <div className="col-start-1 col-span-1 flex align-middle justify-center">
                <Button label={'Draw Big'} onClickFunc={drawBig}/>
            </div>
            <div className="col-start-2 col-span-1 flex flex-col items-center align-middle justify-center">
                <Button label={'Draw Random'} onClickFunc={drawRandom}/>
            </div>
            <div className="col-start-3 col-span-1 flex align-middle justify-center">
                <Button label={'Draw Little'} onClickFunc={drawLittle}/>
            </div>
        </div>
    )
}

export default Draw
