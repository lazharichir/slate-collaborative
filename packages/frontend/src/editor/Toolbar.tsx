import React, {HTMLProps} from "react";
import {css, cx} from "emotion";
import Menu from "./Menu";


export const Toolbar = React.forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(({ className, ...props }, ref) => (
    <Menu
        {...props}
        ref={ref}
        className={cx(
            className,
            css`
                position: relative;
                padding: 1px 18px 17px;
                margin: 0 -20px;
                border-bottom: 2px solid #eee;
                margin-bottom: 20px;
              `
        )}
    />
))

export default Toolbar;