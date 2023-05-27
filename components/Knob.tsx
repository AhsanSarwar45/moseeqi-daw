import React, { useState, useEffect } from "react";
import { Text, VStack } from "@chakra-ui/react";
import { Knob, Pointer, Value, Arc } from "rc-knob";
import Theme from "@theme/index";

interface KnobControlProps {
    label: string;
    defaultVal: Number;
    setValue: (value: number) => void;
    size: number;
}

const KnobControl = (props: KnobControlProps) => {
    // const [ knobValue, setKnobValue ] = useState(1);

    // useEffect(
    // 	() => {
    // 		setValue(knobValue);
    // 	},
    // 	[ knobValue ]
    // );

    // const HandleKnobChange = (value) => {
    // 	setKnobValue(value);
    // };

    return (
        <VStack padding="5px">
            <Knob
                size={props.size}
                angleOffset={220}
                angleRange={280}
                min={0}
                max={10}
                value={props.defaultVal}
                tracking={false}
                onChange={(value: number) => props.setValue(value)}
            >
                <Arc
                    arcWidth={props.size / 20}
                    background="gray"
                    color={Theme.colors.brand.secondary}
                />
                <circle
                    r={props.size * 0.4}
                    cx={props.size / 2}
                    cy={props.size / 2}
                    fill="#2f2f2f"
                />
                <Pointer
                    width={2}
                    height={props.size / 10}
                    radius={props.size * 0.3}
                    type="rect"
                    color="#fff"
                />
                <Value decimalPlace={2} className="value" />
            </Knob>

            <Text fontSize="10px" id={props.label} color="White">
                {props.label}
            </Text>
        </VStack>
    );
};

export default KnobControl;
