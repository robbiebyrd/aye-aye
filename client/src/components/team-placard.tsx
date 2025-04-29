import {GameData, Player} from "@/models/letterboard";

export type TeamPlacardProps = {
    teamName?: string
    players: Player[]
    colors: [string, string, string, string, string]
    position: 'left' | 'right'
    gameData: GameData
    playerId: string
}

export const TeamPlacard: React.FC<TeamPlacardProps> = ({teamName, colors, position, players, gameData, playerId}) => {

    const updatedPlayers = players.filter(obj => Object.keys(obj).length > 0);
    const teamScore = updatedPlayers.reduce((accumulator, player) => accumulator + player.score, 0);

    const getSubmissionForPlayer = (playerId: string) => {
        return gameData.scenes[gameData.currentScene].submissions?.find((s) => s.playerId == playerId)
    }

    return (
        <div key={teamName} className={"flex flex-col border-solid border-4 relative m-4"} style={{
            background: colors[0],
            borderColor: colors[1],
            aspectRatio: "2/1",
            height: "11em"
        }}>
            <div className={'flex w-full ' + (position === 'left' ? 'flex-row' :
                'flex-row-reverse')}>
                <h1 className={'text-white text-4xl font-bold p-2'}>{teamName}</h1>
                <div className={'flex-grow'}></div>
                <div className={'text-white text-4xl font-bold p-2'}
                     style={{backgroundColor: colors[2]}}>{teamScore}
                </div>
            </div>
            <div className={"h-full"} style={{backgroundColor: colors[3]}}>
                {players?.map((player: Player) => (
                    <>
                        <div key={player.id} className={'relative flex w-full  ' + (position === 'left' ? 'flex-row' :
                            'flex-row-reverse')}
                             style={{backgroundColor: colors[3]}}>
                            {getSubmissionForPlayer(player.id)?.entry && (
                                <div className={"absolute w-1/2 h-full"}
                                     style={{...(position == "left" ? {left: "100%"} : {right: "100%"}), ...{backgroundColor: colors[3]}}}>
                                    <h1>{getSubmissionForPlayer(player.id)?.correct ? "C" : "I"}: {getSubmissionForPlayer(player.id)?.entry}</h1>
                                </div>
                            )}
                            <h1 className={`text-4xl font-bold p-2 ${playerId == player.id ? 'italic' : ''}`}>{player.name}</h1>
                            <div className={'flex-grow'}></div>
                            <div className={' text-4xl  p-2'}>{player.score}</div>
                        </div>
                    </>
                ))}
            </div>
        </div>
    )
}
