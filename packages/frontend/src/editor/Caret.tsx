import React from 'react';

interface CaretProps {
    color: string
}

export default function Caret(props: CaretProps) {
    return (<span contentEditable={false} style={{
        borderRightWidth: "2px",
        borderRightStyle: "solid",
        borderRightColor: props.color,
        width: "0px",
        marginRight: "-2px"
    }} />);
}
