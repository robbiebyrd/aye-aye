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
        <button className={classNames("flex items-center p-5 ", buttonStyles.button, className)} onClick={onClickFunc} type={type}>
            <div className={buttonStyles.buttonCenter}>
                <h1 className="text-2xl text-center text-burnham-500" style={{minWidth: "4em"}}>{label}</h1>
            </div>
        </button>
    )
}

export const ButtonWrapper: React.FC<{ children: ReactNode, className?: string }> = ({children, className}) => {
    return (
        <div className={classNames("flex items-center p-5", buttonStyles.button, className)}>
            <div className={buttonStyles.buttonCenter}>
                {children}
            </div>
        </div>
    )
}
