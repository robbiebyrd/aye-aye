"use client"

import {Button, ButtonWrapper} from "@/components/button";
import React, {useState} from "react";

export default function Home() {
    const [currentScene, setCurrentScene] = useState<number>(0);

    const nextScene = () => {
        if (currentScene + 1 > scenes.length -1) {
            return
        }
        setCurrentScene(currentScene + 1);
    }
    const prevScene = () => {
        if (currentScene - 1 < 0) {
            return
        }
        setCurrentScene(currentScene -1);
    }

    const scenes = [
        <div key={1} className={"flex flex-col items-center justify-center gap-2 md:gap-8"}>
            <div className={"w-8 md:w-16 aspect-square relative"} style={{mask: "url(/img/lembers.svg)", maskSize: "cover", backgroundColor: "white"}}>
                &nbsp;
            </div>
            <h1 className={"text-lg md:text-4xl text-center text-white"}>Welcome to Aye-Aye!</h1>
            <h3 className={"text-md md:text-2xl text-center text-white md:w-2/3"}>
                Aye-Aye is an online, multiplayer Letters and Numbers game, inspired by the Channel 4 game show <a href={"https://www.channel4.com/programmes/countdown"}>Countdown</a>.
            </h3>
            <div className={"text-white border-2 bg-burnham-700 m-2 p-2"}>
                <p className={"text-md md:text-lg"}><b>Tip:</b> You can play by yourself, but Aye-Aye is more fun with friends!</p>
            </div>
        </div>,
        <div key={2}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Joining a Game</h1>
                <h3 className={"text-md md:text-2xl text-center text-white w-2/3"}>
                    Each Aye-Aye game is given a Game Code. This is the code you and your friends will use to play together.
                </h3>
                <div className={"flex flex-col md:flex-row w-full text-left gap-2"}>
                    <div className={"text-white flex flex-col items-center md:w-1/2 text-center"}>
                        <details className={""}>
                            <summary className={" text-lg md:text-2xl text-white"}>I&#39;m starting a new game.</summary>
                            <img src={"/img/how-to-play/click.gif"} width={"70%"} alt="" className={"border-2 md:border-4"} style={{margin: "0 auto"}}/>
                            <p className={"text-center"}>Click the &#34;Generate&#34; button to create a new game code.</p>
                            <p className={"text-center"}>Or, you can choose your own.</p>
                        </details>
                    </div>
                    <div className={"text-white flex flex-col items-center md:w-1/2"}>
                        <details>
                            <summary className={"text-center text-lg md:text-2xl text-white mb-4"}>I&#39;m joining a friend&#39;s game.</summary>
                            <img src={"/img/how-to-play/type.gif"} width={"70%"} alt="" className={"border-2 md:border-4"} style={{margin: "0 auto"}}/>
                            <p className={"text-center"}>Enter the Game Code you received into the Game Code box.</p>
                        </details>
                    </div>
                </div>
                <div className={"text-white border-2 bg-burnham-700 m-2 px-2"}>
                    <p className={"text-md md:text-lg"}><b>Tip:</b>To be sure your game code is unique, use the Generate Code button!</p>
                </div>
            </div>
        </div>,
        <div key={3}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Joining a Game</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    After you&#39;ve entered your game code, select a team and enter your preferred name.
                </h3>
                <img src={"/img/how-to-play/team-and-player.gif"} width={"50%"} alt="" className={"border-4"}/>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Finally, click &#34;Enter the Game&#34;
                </h3>
                <img src={"/img/how-to-play/enter-game.png"} width={"50%"} alt="" className={"border-4"}/>
            </div>
        </div>,
        <div key={5}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Gameplay</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Aye-Aye is a <b>Letters</b> and <b>Numbers</b> game. The game is played with two teams, each team alternating
                    control of the board for one round. A round consists of a Letters game and a Numbers game.
                </h3>
            </div>
        </div>,
        <div key={6}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Letters</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    A Letters game is an anagram puzzle.</h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    The team controlling the board will draw 9 letters,
                    choosing from either the vowel deck or the consonant deck.</h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Once 9 letters have been chosen, the
                    controlling team will start the clock.
                </h3>
                <img className={"max-h-32 border-4"} src={"/img/how-to-play/clock.png"} />
            </div>
        </div>,
        <div key={7}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Letters</h1>
                <img className={"max-h-32 border-4"}  src={"/img/how-to-play/letterboard.png"} />
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Before the timer has completed, form the longest word you can from the letters on the board, and enter it into the input box.</h3>
                <img className={"max-h-32 border-4"}  src={"/img/how-to-play/input.png"} />
            </div>
        </div>,
        <div key={8}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Numbers</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    A Numbers game is an math puzzle.</h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    The team controlling the board will draw 6 numbers,
                    choosing from either the &#34;large&#34; numbers deck or the &#34;small&#34; numbers deck. Large numbers include 25, 50, 75 and 100, while the small numbers include 1-10.</h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Once 6 numbers have been chosen, the
                    controlling team will then draw a random Target Number.
                </h3>
                <img className={"max-h-32 border-4"}  src={"/img/how-to-play/numbersboard.png"} />
            </div>
        </div>,
        <div key={9}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Numbers</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Once the controlling team starts the clock, each player will attempt to use the numbers and simple
                    arithmetic to reach the target number.</h3>
                <img className={"max-h-32 border-4"}  src={"/img/how-to-play/numbersinput.png"} />
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Only the operators add (+), subtract (-), multiply (*) and divide (/) are allowed. Answers
                    must be whole numbers only; no fractions or decimals are allowed. You can only use each number once.
                </h3>
            </div>
        </div>,
        <div key={10}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Conundrum</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    The final Conundrum round is also a Letters puzzle; however players do not draw 9 letters.
                    The object is to guess the correct 9-letter word that is an anagram
                    from the letters provided.</h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Example: PEER PAWNS -{">"} NEWSPAPER.
                </h3>
            </div>
        </div>,
        <div key={11}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>Keeping Score</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Letters Rounds: Players receive 1 point for every letter in their word.
                </h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Numbers Rounds: Players get 10 points for reaching the target number exactly; if they are
                    within 10 of the target, they are deducted 1 point for each number they are off.
                </h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    Conundrum Rounds: Each player receives 10 points for correctly answering the Conundrum.
                </h3>
            </div>
        </div>,
        <div key={12}>
            <div key={1} className={"flex flex-col items-center justify-center gap-4"}>
                <h1 className={"text-lg md:text-4xl text-center text-white"}>The Creator</h1>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    I&#39;m Robbie Byrd, a Software Engineer based in Austin, TX.
                </h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>(<a href={"https://robbiebyrd.com/in"} className={"underline"} target={"_blank"}>I&#39;m for hire!</a>)</h3>
                <img className={"max-h-64 border-4"} src={"https://robbiebyrd.com/img/mini_me.jpg"}/>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    I&#39;m interested in event-driven architectures, emulation and virtualization, embedded/IoT systems and web applications. I work mostly in Go(lang), Python and Typescript. In my spare time, I dabble with online games.</h3>
                <h3 className={"text-md md:text-2xl text-center text-white"}>
                    You can learn more about me <a href={"https://robbiebyrd.com"} target={"_blank"} className={"underline"}>at my website</a>, <a href={"https://github.com/robbiebyrd"} target={"_blank"} className={"underline"}>at my Github</a> or email me at <a href={"mailto:me@robbiebyrd.com"} className={"underline"}>me@robbiebyrd.com</a>.
                </h3>

            </div>
        </div>,
    ]

    return (
        <div>
            <main
                className="w-svw h-svh flex content-center items-center justify-center text-center bg-no-repeat bg-cover"
                style={{
                    backgroundImage: "url('/img/bgletterboard@2x.png')",
                    overflow: "scroll"
                }}
            >
                <div className={"w-full md:w-2/3"}>
                    <div className={'justify-center align-center md:h-2/3 flex flex-col items-center'}>
                        <div className={"w-5/6 border-4 bg-burnham-500 bg-opacity-70 flex flex-col gap-4 p-6 mt-8 rounded-lg"}>
                            <div>
                                {scenes[currentScene]}
                            </div>
                            <div className={"flex flex-row justify-center"}>
                                {currentScene - 1 >= 0 && (
                                    <Button disabled={currentScene - 1 < 0}
                                            onClickFunc={prevScene}
                                            className={'justify-center w-1/2'}>
                                        Back
                                    </Button>
                                )}
                                {currentScene + 1 < scenes.length ? (
                                    <Button disabled={currentScene + 1 >= scenes.length}
                                            onClickFunc={nextScene}
                                            className={'justify-center w-1/2'}>
                                        Next
                                    </Button>
                                ) : <ButtonWrapper className={'justify-center w-1/2'}>
                                    <a href={"/"}>
                                    <h1 className={"text-2xl text-center min-w-16 text-burnham-500"}>Let&#39;s Play</h1>
                                        </a>
                                </ButtonWrapper>}
                            </div>
                            <div><p className={"text-white"}>Page {currentScene + 1} of {scenes.length}</p></div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="">
            </footer>
        </div>
    );
}
