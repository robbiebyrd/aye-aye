import {Button} from "@/components/button";
import {letterRow} from "@/models/letterboard";

export type DrawTargetProps = {
    gameId: string
    playerId: string
    ws?: WebSocket
}

const DrawTarget: React.FC<DrawTargetProps> = ({gameId, playerId, ws}) => {
    const sceneId = "mathsboard"

    const drawTarget = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "target",
        }
        ws?.send(JSON.stringify(submission))
    }

    return (
        <div className="grid grid-cols-3 w-full ">
            <div className={"border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help"} style={{
                borderRadius: ".5em",
                padding: ".5em",
                marginBottom: '1em'
            }}>                <h1 className={'text-4xl text-center text-white'}>

                Draw a Target Number to Reach
                </h1>
            </div>
            <div className="col-start-2 col-span-1 flex flex-col items-center align-middle justify-center">
                <Button label={'Draw Target'} onClickFunc={drawTarget}/>
            </div>
        </div>
    )
}

export default DrawTarget
