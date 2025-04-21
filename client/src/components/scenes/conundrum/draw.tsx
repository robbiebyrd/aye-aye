import {Button} from "@/components/button";

export type DrawProps = {
    gameId: string
    playerId: string
    ws?: WebSocket
    show?: boolean
}

const Draw: React.FC<DrawProps> = ({gameId, playerId, ws, show}) => {
    const sceneId = "letterboard"

    const draw = (drawType: "drawRandom" | "draw", letterType?: "consonant" | "vowel") => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: drawType,
            type: drawType == "drawRandom" ? undefined : letterType
        }
        ws?.send(JSON.stringify(submission))
    }

    const drawVowel = () => {
        draw("draw", "vowel")
    }

    const drawRandom = () => {
        draw("drawRandom", undefined)
    }

    const drawConsonant = () => {
        draw("draw", "consonant")
    }

    return show && (
        <div className="grid grid-cols-3 w-full ">
            <div className="col-start-1 col-span-1 flex align-middle justify-center">
                <Button label={'Vowel'} onClickFunc={drawVowel}/>
            </div>
            <div className="col-start-2 col-span-1 flex align-middle justify-center">
                <Button label={'Random Draw'} onClickFunc={drawRandom}/>
            </div>
            <div className="col-start-3 col-span-1 flex align-middle justify-center">
                <Button label={'Consonant'} onClickFunc={drawConsonant}/>
            </div>
        </div>
    )
}

export default Draw
