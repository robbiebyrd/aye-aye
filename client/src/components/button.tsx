import buttonStyles from "./button.module.scss"
import React, {ReactNode} from "react";
import classNames from "classnames";

export type ButtonProps = {
    onClickFunc?: () => void
    type?: "button" | "submit"
    disabled?: boolean
    className?: string;
    children?: ReactNode
}

export const Button: React.FC<ButtonProps> = ({onClickFunc, children, type = "button", disabled, className}) => {
    return (
        <button className={classNames("flex h-8 md:h-16 ", buttonStyles.button, disabled ? "pointer-events-none" : "", className)} onClick={disabled ? () => {} : onClickFunc} type={type}>
            <div className={"w-4 md:w-8"}>
                <img className={'h-full w-full'} src={"/img/buttonleft.png"}/>
            </div>
            <div className={buttonStyles.buttonCenter + " px-2 h-full w-full"}>
                <h1 className={"text-2xl text-center min-w-16 " + (disabled == true ? "text-burnham-300" : "text-burnham-500")}>{children}</h1>
            </div>
            <div className={"w-4 md:w-8"}>
                <img className={'h-full w-auto'} src={"/img/buttonright.png"}/>
            </div>
        </button>
    )
}

export const ButtonWrapper: React.FC<{ children: ReactNode, className?: string }> = ({children, className}) => {
    return (
        <div className={classNames("flex h-8 md:h-16 ", buttonStyles.button, className)}>
            <div className={"w-4 md:w-8"}>
                <img className={'h-full w-full'} src={"/img/buttonleft.png"}/>
            </div>
            <div className={buttonStyles.buttonCenter}>
                {children}
            </div>
            <div className={"w-4 md:w-8"}>
                <img className={'h-full w-full'} src={"/img/buttonright.png"}/>
            </div>
        </div>
    )
}
