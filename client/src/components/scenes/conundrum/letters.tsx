import {LetterboardProps} from "@/components/scenes/letterboard/letterboard";
import {Letter} from "@/components/scenes/letterboard/letters";

type ConundrumLettersProps = Pick<LetterboardProps, 'jumbled' | 'word'>

const ConundrumLetters: React.FC<ConundrumLettersProps> = ({jumbled, word}) => {

    return (
        <div className="w-full flex my-2 lg:my-8 items-center flex-grow flex-col gap-0 justify-center">
            {/*<pre>{JSON.stringify(jumbled)}</pre>*/}
            {/*<pre>{JSON.stringify(word)}</pre>*/}
            <div className="z-10 flex w-full mb-4">
                <div className={"grid grid-cols-9 md:grid-cols-9 grid-rows-1 w-full grid"}>
                    {jumbled?.map((letter, i) => (
                        <Letter key={i} letter={letter}/>
                    ))}
                </div>
            </div>
            <div className={"w-full p-1 flex justify-center justify-items-center items-center content-center"}>
                <div className={"w-1/3 md:w-2/3 border-4 bg-opacity-50 bg-white text-center border-b-0 rounded-b-lg -mb-2"}>
                    <h1 className={"text-center text-md md:text-2xl"}>Answer</h1>
                </div>
            </div>
            <div className="z-10 w-full">
                <div className={"grid grid-cols-9 md:grid-cols-9 grid-rows-1 w-full grid"}>
                    {word?.map((letter, i) => (
                        <Letter key={i} letter={letter}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ConundrumLetters
