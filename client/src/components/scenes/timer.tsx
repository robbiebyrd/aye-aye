import React from "react";
import QRCode from "react-qr-code";


export const TimerOrCode: React.FC<{ count: number, gameId: string}> = ({count, gameId}) => {
    return (
        <div
            className={'h-[10em] relative aspect-square mb-0 items-center content-center text-center justify-center'}
            style={{
                backgroundImage: "url('/img/clock.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center"
            }}>
            <img
                src={'/img/clock-arm.svg'}
                className={'relative'}
                style={{
                    transform: `rotate(${count >= 0 ? count * 6 : 0}deg)`
                }}
            />
            {count < 0 && <QRCodeJoin gameId={gameId}/>}
            {count >= 0 && <Timer count={count}/>}
        </div>
    )
}

export const Timer: React.FC<{ count: number }> = ({count}) => {
    return (
        <h1 className={'font-bold w-full h-full'}
            style={{
                fontSize: '5em',
                top: "10%",
                position: "absolute",
            }}>{count}</h1>
    )
}

export const QRCodeJoin: React.FC<{gameId: string}> = ({gameId}) => {
    return <>
        <QRCode
            style={{
                height: "50%",
                position: "absolute",
                top: "25%"
            }}
            className={"w-full h-8 m-auto aspect-square absolute"}
            value={`${process.env.NEXT_PUBLIC_SERVER_PROTOCOL}://${process.env.NEXT_PUBLIC_SERVER_HOST}/?game=${encodeURIComponent(gameId)}`}
        /></>
}