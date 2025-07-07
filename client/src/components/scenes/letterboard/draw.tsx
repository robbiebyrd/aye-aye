import {Button} from "@/components/button";
import {letterRow} from "@/models/letterboard";

export type DrawProps = {
    gameId: string
    playerId: string
    sendMessage: (payload: string) => void
    drawn?: letterRow
}

const Draw: React.FC<DrawProps> = ({gameId, playerId, sendMessage, drawn}) => {
    const sceneId = "letterboard"

    const draw = (drawType: "drawRandom" | "draw", letterType?: "consonant" | "vowel") => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: drawType,
            type: drawType == "drawRandom" ? undefined : letterType
        }
        sendMessage(JSON.stringify(submission))
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

    return  (
        <div className="w-full md:w-2/3">
            <div className={"z-0 -mt-4 p-0.5 lg:p-2 border-4 bg-burnham-500 bg-opacity-50 col-start-2 col-span-1 help rounded-lg mb-2"}>
                <h1 className={'text-md lg:text-4xl text-center text-white'}>
                    Draw {9 - (drawn?.filter((a) => a != " ").length || 0)} More Letters
                </h1>
            </div>
            <div className={"flex flex-col md:flex-row justify-center gap-1 md:gap-4 lg:gap-16"}>
                <div className="col-start-1 col-span-1 flex align-middle justify-center">
                    <Button onClickFunc={drawVowel}>Draw Vowel</Button>
                </div>
                <div className="col-start-2 col-span-1 flex flex-col items-center align-middle justify-center">
                    <Button onClickFunc={drawRandom}>Draw Random</Button>
                </div>
                <div className="col-start-3 col-span-1 flex align-middle justify-center">
                    <Button onClickFunc={drawConsonant}>Draw Consonant</Button>
                </div>
            </div>
        </div>
    )
}

export default Draw
