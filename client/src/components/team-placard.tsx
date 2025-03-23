import {Player} from "@/models/letterboard";

export type TeamPlacardProps = {
    teamName?: string
    players: Player[]
    colors: [string, string, string, string, string]
    position: 'left' | 'right'
}

export const TeamPlacard: React.FC<TeamPlacardProps> = ({teamName, colors, position, players}) => {

    const updatedPlayers = players.filter(obj => Object.keys(obj).length > 0);
    const teamScore = updatedPlayers.reduce((accumulator, player) => accumulator + player.score, 0);

    return  (
        <div key={teamName} className={"flex flex-col border-solid border-4"} style={{
            background: colors[0],
            borderColor: colors[1],
            aspectRatio: "2/1",
            height: "11em"
        }}>
            <div className={'flex w-full h-1/3 ' + (position === 'left' ? 'flex-row' :
                'flex-row-reverse')}>
                <h1 className={'text-white text-4xl font-bold p-2'}>{teamName}</h1>
                <div className={'flex-grow'}></div>
                <div className={'text-white text-4xl font-bold p-2'}
                     style={{backgroundColor: colors[2]}}>{teamScore}
                </div>
            </div>
            <>
                {players?.map((player: Player) => (
                    <div className={'flex w-full h-1/3 ' + (position === 'left' ? 'flex-row' :
                        'flex-row-reverse')}
                         style={{ backgroundColor: colors[3]}}>
                        <h1 className={' text-4xl font-bold p-2'}>{player.name}</h1>
                        <div className={'flex-grow'}></div>
                        <div className={' text-4xl  p-2'}>{player.score}</div>
                    </div>
                ))}
            </>
            {/*<div className={'flex w-full h-1/3 ' + (position === 'left' ? 'flex-row' :*/}
            {/*    'flex-row-reverse')}*/}
            {/*     style={{ backgroundColor: colors[4]}}>*/}
            {/*    <h1 className={'text-4xl p-2'}>Player 2</h1>*/}
            {/*    <div className={'flex-grow'}></div>*/}
            {/*    <div className={'text-4xl p-2'}>50</div>*/}
            {/*</div>*/}
        </div>
    )
}
