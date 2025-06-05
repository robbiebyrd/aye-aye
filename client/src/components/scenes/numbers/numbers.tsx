import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {useRef} from "react";
import { MathsboardProps } from './mathsboard';

type NumbersProps = Pick<MathsboardProps, 'numbers'>

export const Numbers: React.FC<NumbersProps> = ({numbers}) => {
    return (
            numbers?.map((number, i) => (
                    <Number key={i} number={number}/>
                ))
    )
}

export const Number: React.FC<{ number: number | undefined }> = ({number}) => {
    const boxRef = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        if (boxRef.current) {
            gsap.from(boxRef.current.children, {
                duration: 1.5,
                yPercent: 10,
                opacity: 0,
                ease: "power4",
            })
        }
    }, [number])

    return  (
        <div ref={boxRef} style={{  flex: "1 1 0",
            width: "0"
          }}
             className="border-sherwood-green-500 border-4 border-solid bg-white">
            <h1 className="text-burnham-500 text-9xl text-center m-h[2rem] uppercase font-bold">{number == 0 ?
                <span>&nbsp;</span> : number}</h1>
        </div>
    )
}

export default Numbers
