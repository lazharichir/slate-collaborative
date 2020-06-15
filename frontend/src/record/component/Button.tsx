import React, {HTMLProps} from "react";
import {css, cx} from "emotion";

type ButtonProps = HTMLProps<HTMLButtonElement> & {
    active: boolean;
    reversed?: boolean;
};

const Button = React.forwardRef<HTMLSpanElement, ButtonProps>(
    ({ className, active, reversed, ...props }, ref) => (
        <span
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
                  cursor: pointer;
                  color: ${reversed ? active ? 'white' : '#aaa' : active ? 'black' : '#ccc'};
                `
            )}
        />
    )
);

export default Button;