import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import {useRef} from "react";
import {MathsboardProps} from './mathsboard';

type NumbersProps = Pick<MathsboardProps, 'numbers'>

export const Numbers: React.FC<NumbersProps> = ({numbers}) => {
    return (
        numbers?.map((number, i) => (
            <Number key={i} number={number}/>
        ))
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
            <div ref={boxRef} style={{
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                width: "0",
                justifyContent: "end",
            }}>
                {header && number && number > 0 && (
                    <div className={"w-full"} style={{
                        padding: ".25em",
                        justifyContent: "center",
                        justifyItems: 'center',
                        alignItems: "center",
                        alignContent: "center",
                    }}>
                        <div className={"w-2/3 border-4 bg-burnham-500 bg-opacity-50 bg-white"} style={{
                            borderRadius: ".5em",
                            padding: ".5em 1em 1em 1em",
                            textAlign: "center",
                            borderBottom: "none",
                            margin: "-1em auto"
                        }}>
                            <h1 style={{textAlign: 'center'}}>{header}</h1>
                        </div>
                    </div>
                )}
                <div className={'border-sherwood-green-300 border-4 border-solid bg-white'}>
                    <h1 className="text-burnham-500 text-9xl text-center m-h[2rem] uppercase font-bold">{number == 0 || !number ?
                        <span>&nbsp;</span> : number}</h1>
                </div>
            </div>
        </>
    )
}

export default Numbers
