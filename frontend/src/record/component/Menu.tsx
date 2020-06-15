import React, {HTMLProps} from "react";
import {css, cx} from "emotion";

const Menu = React.forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        {...props}
        ref={ref}
        className={cx(
            className,
            css`
        & > * {
          display: inline-block;
        }
        & > * + * {
          margin-left: 15px;
        }
      `
        )}
    />
));

export default Menu;
