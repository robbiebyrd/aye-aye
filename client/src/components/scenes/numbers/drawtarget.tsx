import {Button} from "@/components/button";

export type DrawTargetProps = {
    gameId: string
    playerId: string
    sendMessage: (payload: string) => void
}

const DrawTarget: React.FC<DrawTargetProps> = ({gameId, playerId, sendMessage}) => {
    const sceneId = "mathsboard"

    const drawTarget = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "target",
        }
        sendMessage(JSON.stringify(submission))
    }

    return (
        <div className="w-full flex flex-col items-center">
            <div className={"w-2/3 border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help"} style={{
                borderRadius: ".5em",
                padding: ".5em",
                marginBottom: '1em'
            }}>
                <h1 className={'text-xl md:text-4xl text-center text-white'}>
                    Draw a Target Number to Reach
                </h1>
            </div>
            <div className="flex flex-col items-center align-middle justify-center">
                <Button onClickFunc={drawTarget}>Draw Target</Button>
            </div>
        </div>
    )
}

export default DrawTarget
