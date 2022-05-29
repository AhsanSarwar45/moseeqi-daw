import { Box, HStack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import * as Tone from "tone";

interface MeterProps {
    width: number | string;
    meter: Tone.Meter;
    fillColor: string;
    bgColor: string;
    borderColor: string;
    borderWidth: number | string;
}

const Meter = (props: MeterProps) => {
    const meterAnimationRef = useRef(0);
    const metersRef = useRef<Array<HTMLDivElement>>([]);
    // const maxHeight =

    useEffect(() => {
        meterAnimationRef.current = requestAnimationFrame(function animate() {
            const values = props.meter.getValue();

            if (props.meter.channels > 1) {
                const values_list = values as Array<number>;
                for (let index = 0; index < values_list.length; index++) {
                    metersRef.current[index].style.height = `${
                        values_list[index] + 100
                    }%`;
                }
            } else {
                const value = values as number;
                metersRef.current[0].style.height = `${value + 100}%`;
            }

            //	metersRef.current.style.height = `${meter.getValue() + 100}%`;

            meterAnimationRef.current = requestAnimationFrame(animate);
        });
        return () => {
            cancelAnimationFrame(meterAnimationRef.current);
        };
    }, [props.meter]);

    useEffect(() => {
        metersRef.current = metersRef.current.slice(0, props.meter.channels);
    }, [props.meter]);

    return (
        <HStack top={1} spacing={1} position="absolute" bottom={1} right={1}>
            {[...Array(props.meter.channels)].map((channel, i) => (
                <Box
                    height="100%"
                    width={props.width}
                    bgColor={props.bgColor}
                    position="relative"
                    borderColor={props.borderColor}
                    borderWidth={props.borderWidth}
                    key={i}
                    //id={`meter${i}`}
                >
                    <Box
                        ref={(element) =>
                            (metersRef.current[i] = element as HTMLDivElement)
                        }
                        position="absolute"
                        bottom={0}
                        // height={`${meterHeight + 100}%`}
                        width="100%"
                        bgColor={props.fillColor}
                    />
                </Box>
            ))}
        </HStack>
    );
};

export default Meter;
