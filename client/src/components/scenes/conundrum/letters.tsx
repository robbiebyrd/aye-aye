import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {useRef} from "react";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";

type ConundrumLettersProps = Pick<LetterboardProps, 'jumbled' | 'word'>

const ConundrumLetters: React.FC<ConundrumLettersProps> = ({jumbled, word}) => {
    return (
        <div className="w-full flex my-8">
            <div className="flex-grow">
                <div className="grid grid-cols-9 grid-rows-1 w-full" style={{marginBottom: "1em"}}>
                    {jumbled?.map((letter, i) => (
                        <Letter key={i} letter={letter}/>
                    ))}
                </div>
                <div className="grid grid-cols-9 grid-rows-1 w-full" style={{marginBottom: "1em"}}>
                    {word?.map((letter, i) => (
                        <Letter key={i} letter={letter}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

const Letter: React.FC<{ letter: string }> = ({letter}) => {
    const boxRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (letter != " " && boxRef.current) {
            gsap.from(boxRef.current.children, {
                duration: 1.5,
                yPercent: 10,
                opacity: 0,
                ease: "power4",
            })
        }
    }, [letter])

    return (
        <div ref={boxRef}
             className="border-sherwood-green-300 border-4 border-solid aspect-square bg-white  flex items-center justify-center">
            <h1 className="text-burnham-500 text-9xl text-center m-h[2rem] uppercase font-bold">{letter == " " ?
                <span>&nbsp;</span> : letter}</h1>
        </div>
    )
}

export default ConundrumLetters
