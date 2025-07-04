import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {useRef} from "react";
import {MathsboardProps} from './mathsboard';

type NumbersProps = Pick<MathsboardProps, 'numbers'>

export const Numbers: React.FC<NumbersProps> = ({numbers}) => {
    return (
        <div className={"w-full grid grid-cols-3 md:grid-cols-6 grid-rows-1"}>
            {numbers?.map((number, i) => (
                <Number key={i} number={number}/>
            ))}
        </div>
    )
}

export const Number: React.FC<{ number?: number, header?: string }> = ({number, header}) => {
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

    return (
        <>
            <div ref={boxRef} className={"flex flex-col w-full"} style={{}}>
                {header && (
                    <div className={"w-full p-1 justify-center justify-items-center items-center content-center"}>
                        <div className={"md:w-2/3 border-4 bg-opacity-50 bg-white text-center border-b-0 rounded-b-lg -my-4"}
                            style={{padding: ".5em 1em 1em 1em"}}>
                            <h1 style={{textAlign: 'center'}}>{header}</h1>
                        </div>
                    </div>
                )}
                <div className={'border-sherwood-green-300 border-4 border-solid bg-white aspect-auto md:aspect-square content-center'}>
                    <h1 className="text-burnham-500 text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-center m-h[2rem] uppercase font-bold">{number == 0 || !number ?
                        <span>&nbsp;</span> : number}</h1>
                </div>
            </div>
        </>
    )
}

export default Numbers
