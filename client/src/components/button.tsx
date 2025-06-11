import buttonStyles from "./button.module.scss"
import React, {ReactNode} from "react";
import classNames from "classnames";

export type ButtonProps = {
    label: string
    onClickFunc?: () => void
    type?: "button" | "submit"
    disabled?: boolean
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({onClickFunc, label, type = "button", disabled, className}) => {
    return !disabled && (
        <button className={classNames("flex h-16 ", buttonStyles.button, className)} onClick={onClickFunc} type={type}>
            <div className={"w-8"}>
                <img className={'h-full w-full'} src={"/img/buttonleft.png"}/>
            </div>
            <div className={buttonStyles.buttonCenter + " px-2 h-full w-full"}>
                <h1 className="text-2xl text-center text-burnham-500" style={{minWidth: "4em"}}>{label}</h1>
            </div>
            <div className={"w-8"}>
                <img className={'h-full w-auto'} src={"/img/buttonRight.png"}/>
            </div>
        </button>
    )
}

export const ButtonWrapper: React.FC<{ children: ReactNode, className?: string }> = ({children, className}) => {
    return (
        <div className={classNames("flex h-16 ", buttonStyles.button, className)}>
            <div className={"w-8"}>
                <img className={'h-full w-full'} src={"/img/buttonleft.png"}/>
            </div>
            <div className={buttonStyles.buttonCenter}>
                {children}
            </div>
            <div className={"w-8"}>
                <img className={'h-full w-full'} src={"/img/buttonright.png"}/>
            </div>
        </div>
    )
}
