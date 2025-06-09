import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {useRef} from "react";
import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";

type LettersProps = Pick<LetterboardProps, 'letters'>

const Letters: React.FC<LettersProps> = ({letters}) => {
    return (
        <div className="w-full flex my-8">
            <div className="flex-grow">
                {letters?.map((letterRow, index) => (
                    <div className="grid grid-cols-9 grid-rows-1 w-full" key={index}>
                        {letterRow.map((letter, i) => (
                            <Letter key={i} letter={letter}/>
                        ))}
                    </div>
                ))}
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
             className="border-sherwood-green-300 border-2 md:border-2 lg:border-3 xl:border-4 border-solid aspect-square bg-white  flex items-center justify-center">
            <h1 className="text-burnham-500 text-2xl xl:text-8xl lg:text-6xl md:text-4xl text-center m-h[2rem] uppercase font-bold">{letter == " " ?
                <span>&nbsp;</span> : letter}</h1>
        </div>
    )
}

export default Letters
