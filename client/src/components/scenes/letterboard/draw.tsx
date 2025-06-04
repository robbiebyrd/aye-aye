import {Button} from "@/components/button";
import {letterRow} from "@/models/letterboard";

export type DrawProps = {
    gameId: string
    playerId: string
    ws?: WebSocket
    show?: boolean
    drawn?: letterRow
}

const Draw: React.FC<DrawProps> = ({gameId, playerId, ws, show, drawn}) => {
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
            <div className={"border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help"} style={{
                borderRadius: ".5em",
                padding: ".5em",
                marginBottom: '1em'
            }}>
                <h1 className={'text-4xl text-center text-white'}>
                    Draw {9 - (drawn?.filter((a) => a != " ").length || 0)} Letters
                </h1>
            </div>
            <div className="col-start-1 col-span-1 flex align-middle justify-center">
                <Button label={'Draw Vowel'} onClickFunc={drawVowel}/>
            </div>
            <div className="col-start-2 col-span-1 flex flex-col items-center align-middle justify-center">
                <Button label={'Draw Random'} onClickFunc={drawRandom}/>
            </div>
            <div className="col-start-3 col-span-1 flex align-middle justify-center">
                <Button label={'Draw Consonant'} onClickFunc={drawConsonant}/>
            </div>
        </div>
    )
}

export default Draw
