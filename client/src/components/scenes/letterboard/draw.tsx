import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {useRef} from "react";
import {Button} from "@/components/button";
export type DrawProps = {
    gameId: string
    playerId: string
    ws?: WebSocket
    show?: boolean
}

const Draw: React.FC<DrawProps> = ({gameId, playerId, ws, show}) => {
    const sceneId = "letterBoard"

    const drawVowel = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "draw",
            type: "vowel"
        }
        ws?.send(JSON.stringify(submission))
    }

    const drawRandom = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "drawRandom",
        }
        ws?.send(JSON.stringify(submission))
    }


    const drawConsonant = () => {
        const submission = {
            gameId: gameId,
            playerId: playerId,
            sceneId,
            action: "draw",
            type: "consonant",
        }
        ws?.send(JSON.stringify(submission))
    }
    const boxRef = useRef<HTMLDivElement>(null)

    // useGSAP(() => {
    //     if (boxRef.current) {
    //         if (show == true){
    //             gsap.to(boxRef.current.children, {
    //                 duration: 1.5,
    //                 yPercent: 0,
    //                 opacity: 1,
    //                 ease: "power4",
    //                 toggleActions: "play none none none",
    //             })
    //         } else {
    //             gsap.to(boxRef.current.children, {
    //                 duration: 1.5,
    //                 yPercent: 25,
    //                 opacity: 0,
    //                 ease: "power4",
    //                 toggleActions: "play none none none",
    //             })
    //         }
    //
    //     }
    //     return () => {}
    // }, [show])


    return show && (
        <div className="flex w-full absolute" ref={boxRef}>
            <Button label={'Vowel'} onClickFunc={drawVowel}/>
            <div className="flex-grow"></div>
            <Button label={'Random Draw'} onClickFunc={drawRandom}/>
            <div className="flex-grow"></div>

            <Button label={'Consonant'} onClickFunc={drawConsonant}/>
        </div>
    )
}

export default Draw
