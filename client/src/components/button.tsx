import buttonStyles from "./button.module.scss"
import {ReactNode} from "react";

export type ButtonProps = {
    label: string
    onClickFunc?: () => void
    type?: "button" | "submit"
    disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({onClickFunc, label, type = "button", disabled}) => {
    return !disabled && (
        <button className={" flex items-center p-5 " + buttonStyles.button} onClick={onClickFunc} type={type}>
            <div className={buttonStyles.buttonCenter}>
                <h1 className="text-4xl text-center text-burnham-500">{label}</h1>
            </div>
        </button>
    )
}

export const ButtonWrapper: React.FC<{children: ReactNode}> = ({children}) => {
    return (
        <div className={" flex items-center p-5 " + buttonStyles.button}>
            <div className={buttonStyles.buttonCenter}>
                {children}
            </div>
        </div>
    )
}
