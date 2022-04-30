import React, { ReactNode, useCallback, useState } from 'react';
import DevBookSplitter, { SplitDirection } from '@devbookhq/splitter';

interface SplitterProps {
    initialSizes: number[];
    direction: SplitDirection;
    children: ReactNode;
}

const Splitter = (props: SplitterProps) => {
    const [sizes, setSizes] = useState(props.initialSizes);

    const HandleResizeFinished = useCallback((_, newSizes) => {
        setSizes(newSizes);
    }, []);

    // Create a wrapper around devbookhq/splitter that manages persistent size changes
    return (
        <DevBookSplitter initialSizes={sizes} onResizeFinished={HandleResizeFinished} direction={props.direction}>
            {props.children}
        </DevBookSplitter>
    )
}

Splitter.defaultProps = {
    initialSizes: [50, 50],
    direction: SplitDirection.Horizontal

}

export default Splitter