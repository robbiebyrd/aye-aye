import {GameData, Player} from "@/models/letterboard";

export type TeamPlacardProps = {
    teamName?: string
    players: Player[]
    position: 'left' | 'right'
    gameData: GameData
    playerId: string
}

const teamColors = {
    "red": [
        "#C1272D",
        "#3D775A",
        "#410006",
        "#E6E6E6",
        "#CCCCCC"

    ],
    "blue": [
        "#0000FF",
        "#3D775A",
        "#1B1464",
        "#E6E6E6",
        "#CCCCCC"

    ]
}

const getColors = (teamName?: string) => {
    if (teamName == "Red") {
        return teamColors['red']
    }
    return teamColors["blue"]
}

export const TeamPlacard: React.FC<TeamPlacardProps> = ({teamName, position, players, gameData, playerId}) => {
    const updatedPlayers = players.filter(obj => Object.keys(obj).length > 0);
    const teamScore = updatedPlayers.reduce((accumulator, player) => accumulator + player.score, 0);

    const getSubmissionForPlayer = (playerId: string) => {
        if (gameData.currentScene === 'lobby') {
            return
        }
        if (!gameData.scenes[gameData.currentScene].submissions) {
            return
        }
        if (gameData.scenes[gameData.currentScene].submissions[playerId]) {
            return gameData.scenes[gameData.currentScene].submissions[playerId]
        }
    }

    const colors = getColors(teamName)

    return (
        <>
            <div key={teamName} className={"border-solid lg:border-4 md:border-3 border-2 h-full w-5/6 md:w-1/2"}
                 style={{
                     background: colors[4],
                     borderColor: colors[1],
                 }}>
                <div className={'flex w-full ' + (position === 'left' ? 'flex-row' :
                    'flex-row-reverse')} style={{
                    background: colors[0],
                    borderColor: colors[1],
                }}>
                    <h1 className={'text-white lg:text-4xl md:text-2xl text-md font-bold px-1 md:p-2'}>
                        {teamName}
                        {gameData.controllingTeam === teamName ? '*' : ''}
                    </h1>
                    <div className={'flex-grow'}></div>
                    <div className={'text-white font-bold p-1 md:p-2 md:text-2xl text-md lg:text-4xl align-middle'}
                         style={{backgroundColor: colors[2]}}>{teamScore}
                    </div>
                </div>
                <div className={``} style={{backgroundColor: colors[3]}}>
                    {players?.map((player: Player) => (
                        <>
                            <div
                                key={player.playerId}
                                className={`relative flex w-full ${position === 'left' ? 'flex-row' : 'flex-row-reverse'}`}
                                style={{backgroundColor: playerId == player.playerId ? colors[3] : colors[4]}}
                            >
                                {getSubmissionForPlayer(player.playerId)?.entry && (
                                    <div
                                        className={"absolute w-1/3 h-full p-1 flex items-center justify-center justify-items-center gap-2 transition-all duration-1000 ease-out"}
                                        style={{
                                            ...(position == "left" ? {left: "100%"} : {right: "100%"}), ...{
                                                backgroundColor: colors[3],
                                                borderColor: colors[1],
                                                borderRight: position == "left" ? "solid" : "none",
                                                borderLeft: position == "right" ? "solid" : "none",
                                                borderTop: "solid",
                                                borderBottom: "solid",
                                            }
                                        }}>
                                        {getSubmissionForPlayer(player.playerId)?.correct ? (
                                            <img
                                                alt={"Correct Answer"}
                                                src={"/img/correct.svg"}
                                                style={{
                                                    height: "80%",
                                                    width: "auto",
                                                    filter: "invert(42%) sepia(100%) saturate(300%) hue-rotate(87deg) brightness(119%) contrast(119%)",
                                                }}
                                            />
                                        ) : (
                                            <img
                                                alt={"Incorrect Answer"}
                                                src={"/img/incorrect.svg"}
                                                style={{
                                                    height: "80%",
                                                    width: "auto",
                                                    filter: "invert(42%) sepia(100%) saturate(300%) hue-rotate(293deg) brightness(106%) contrast(119%)"
                                                }}
                                            />
                                        )}
                                        <h1 className={"hidden md:block"}>{getSubmissionForPlayer(player.playerId)?.entry.toUpperCase()}</h1>
                                    </div>
                                )}
                                <h1 className={`font-bold px-1 md:p-1 ${playerId == player.playerId ? 'italic' : ''}`}>
                                    {player.name}
                                    {playerId == player.playerId && <span className={"text-xs"}> (you)</span>}
                                </h1>
                                <div className={'flex-grow'}></div>
                                <div className={'px-1 content-center hidden md:block'}>{player.score}</div>
                            </div>
                        </>
                    ))}
                </div>
            </div>
        </>
    )
}

export const EmptyTeamPlacard: React.FC<Pick<TeamPlacardProps, 'teamName'>> = ({teamName}) => {
    const colors = getColors(teamName)
    return (
        <div className={"w-5/6 md:w-1/2 h-full md:h-1/2 flex flex-col border-solid border-4 justify-center align-center text-center text-xs md:text-sm lg:text-2xl"}
            style={{
                background: colors[0],
                borderColor: colors[1],
            }}>
            WAITING FOR PLAYERS
        </div>
    )
}
