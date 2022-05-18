import { Box } from "@chakra-ui/react";
import { SeekContext } from "@Data/SeekContext";
import { useContext, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import * as Tone from "tone";

interface TimeHandleProps {
    playbackState: number;
    height: number;
    seek: number;
    setSeek: (seek: number) => void;
    scale: number;
}

const SeekHandle = (props: TimeHandleProps) => {
    const wholeNoteWidth = 40;
    const snapDivisions = 8;

    const [seek, setSeek] = useState(0);
    const [snapWidth, setSnapWidth] = useState(
        (wholeNoteWidth / snapDivisions) * props.scale
    );
    const seekAnimationRef = useRef(0);
    const seekHandleRef = useRef(null);
    const dragging = useRef(false);

    const HandleDrag = (event: DraggableEvent, data: DraggableData) => {
        data.lastX = Math.round(data.lastX / snapWidth) * snapWidth;
        const newSeek = data.lastX / (5 * props.scale);
        // console.log(newSeek, data.lastX)
        setSeek(newSeek);
        props.setSeek(newSeek);

        Tone.Transport.seconds = newSeek * (30 / Tone.Transport.bpm.value);
        dragging.current = false;
    };

    useEffect(() => {
        // console.log(props.seek)
        setSeek(props.seek);
    }, [props.seek]);

    useEffect(() => {
        if (props.playbackState === 1) {
            seekAnimationRef.current = requestAnimationFrame(
                function UpdateSeek() {
                    setSeek(
                        Tone.Transport.seconds * (Tone.Transport.bpm.value / 30)
                    );
                    seekAnimationRef.current =
                        requestAnimationFrame(UpdateSeek);
                }
            );
        } else if (props.playbackState === 0) {
            // Stop
            setSeek(0);
            cancelAnimationFrame(seekAnimationRef.current);
        } else if (props.playbackState === 2) {
            //Pause
            cancelAnimationFrame(seekAnimationRef.current);
        }
    }, [props.playbackState]);

    return (
        <Draggable
            axis="x"
            handle=".handle"
            defaultPosition={{ x: 0, y: 0 }}
            position={
                dragging.current
                    ? (null as any)
                    : { x: seek * 5 * props.scale, y: 0 }
            }
            grid={[snapWidth, snapWidth]}
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
                // pointerEvents="none"
                ref={seekHandleRef}
                zIndex={9000}
                position="absolute"
                bgColor="white"
                //left={`${300 + seek}px`}
                height={props.height}
                width="1px"
            >
                <Box
                    className="handle"
                    bgColor="white"
                    marginLeft="-5px"
                    width="10px"
                    height="20px"
                />
            </Box>
        </Draggable>
    );
};

SeekHandle.defaultProps = {
    scale: 1,
};

export default SeekHandle;