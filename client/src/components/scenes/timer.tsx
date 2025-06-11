import React from "react";
import QRCode from "react-qr-code"

export const TimerOrCode: React.FC<{ count: number, gameId: string}> = ({count, gameId}) => {
    return (
        <div
            className={'h-16 lg:h-32 flex w-3/4 relative items-center text-center justify-start mt-6'}
            style={{
                backgroundImage: "url('/img/clock.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            }}>
            {count < 0 && <QRCodeJoin gameId={gameId}/>}
            {count >= 0 && <Timer count={count}/>}
        </div>
    )
}

export const Timer: React.FC<{ count: number }> = ({count}) => {
    return (
        <div className={'h-32'}>
            <img
                src={'/img/clock-arm.svg'}
                className={'relative'}
                style={{
                    width: "100%",
                    transform: `rotate(${count >= 0 ? count * 6 : 0}deg)`
                }}
            />
            <h1 className={'font-bold w-full h-full absolute text-[6vw] lg:text-[5vw]'}
                style={{
                    top: "10%",
                }}>{count}</h1></div>
    )
}

export const QRCodeJoin: React.FC<{gameId: string}> = ({gameId}) => {
    return (
        <div>
            <QRCode
                style={{
                    height: "50%",
                    position: "absolute",
                    top: "25%"
                }}
                className={"w-full h-8 m-auto aspect-square absolute"}
                value={`${process.env.NEXT_PUBLIC_SERVER_PROTOCOL}://${process.env.NEXT_PUBLIC_SERVER_HOST}/?game=${encodeURIComponent(gameId)}`}
            />
        </div>
    )
}