import React from "react";
import QRCode from "react-qr-code"

export const TimerOrCode: React.FC<{ count: number, gameId: string}> = ({count, gameId}) => {
    return count < 0 ? (
        <div className={"flex flex-col h-4/6 md:h-11/12 w-auto mt-4"}>
            <QRCodeJoin gameId={gameId}/>
            <p className={"text-white text-xs md:text-lg text-center"}>Scan to join this team</p>
        </div>
    ) : (
        <div
            className={'w-3/4 relative items-center text-center justify-start'}>
            <Timer count={count}/>
        </div>
    )
}

export const Timer: React.FC<{ count: number }> = ({count}) => {
    return (
        <div className={'h-32 w-full flex justify-center items-center'}
             style={{
                 backgroundImage: "url('/img/clock.png')",
                 backgroundSize: "contain",
                 backgroundRepeat: "no-repeat",
                 backgroundPosition: "center"
             }}>
            <h1 className={'font-bold text-3xl md:text-5xl'}>
                {count}
            </h1>
            <img
                src={'/img/clock-arm.svg'}
                className={'absolute'}
                style={{
                    width: "100%",
                    height: "100%",
                    transform: `rotate(${count >= 0 ? count * 6 : 0}deg)`
                }}
            />
        </div>
    )
}

export const QRCodeJoin: React.FC<{gameId: string}> = ({gameId}) => {
    return (
        <QRCode
            className={"h-full w-auto"}
            value={`${process.env.NEXT_PUBLIC_SERVER_PROTOCOL}://${process.env.NEXT_PUBLIC_SERVER_HOST}/?game=${encodeURIComponent(gameId)}`}
        />
    )
}