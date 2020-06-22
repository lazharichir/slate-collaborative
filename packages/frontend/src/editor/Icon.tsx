import React, {HTMLProps} from "react";
import {css, cx} from "emotion";

const Icon = React.forwardRef<HTMLSpanElement,HTMLProps<HTMLSpanElement>>(({ className, ...props }, ref) => (
    <span
        {...props}
        ref={ref}
        className={cx(
            'material-icons',
            className,
            css`
        font-size: 18px;
        vertical-align: text-bottom;
      `
        )}
    />
))

export default Icon;
