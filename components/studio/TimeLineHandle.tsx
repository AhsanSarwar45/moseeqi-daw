import { Box } from "@chakra-ui/react";
import { SeekContext } from "@Data/SeekContext";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import * as Tone from 'tone';


interface TimeHandleProps {

}


const TimeLineHandle = (props: TimeHandleProps) => {
    const { seek, setSeek } = useContext(SeekContext)

    const seekHandleRef = useRef(null);
    const dragging = useRef(false);

    const HandleDrag = (event: DraggableEvent, data: DraggableData) => {
        setSeek(data.lastX / 5);
        Tone.Transport.seconds = data.lastX / 20;
        dragging.current = false;
    };

    return (
        <Draggable
            axis="x"
            handle=".handle"
            defaultPosition={{ x: 0, y: 0 }}
            position={dragging.current ? null as any : { x: seek * 5, y: 0 }}
            grid={[5, 5]}
            scale={1}
            bounds={{ left: 0, right: 10000 }}
            onStart={(props: any) => {
                dragging.current = true;
            }}
            onStop={HandleDrag}
            nodeRef={seekHandleRef}
        >
            {/* <div className="handle">Drag from here</div> */}
            <Box
                ref={seekHandleRef}
                zIndex={700}
                position="absolute"
                bgColor="white"
                //left={`${300 + seek}px`}
                height="full"
                width="1px"
            >
                <Box
                    className="handle"
                    zIndex={1501}
                    bgColor="white"
                    marginLeft="-10px"
                    width="20px"
                    height="20px"
                />
            </Box>
        </Draggable>
    );
};


export default TimeLineHandle;