import React, { useState, useEffect } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { Knob, Pointer, Value, Arc } from 'rc-knob';
import Theme from '@Theme/index';

export default function KnobControl({ label, defaultVal, value, setValue, size }) {
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
				size={size}
				angleOffset={220}
				angleRange={280}
				min={0}
				max={10}
				value={defaultVal}
				tracking={false}
				onChange={(value) => setValue(value)}
			>
				<Arc arcWidth={size / 20} background="gray" color={Theme.colors.brand.secondary} />
				<circle r={size * 0.4} cx={size / 2} cy={size / 2} fill="#2f2f2f" />
				<Pointer width={2} height={size / 10} radius={size * 0.3} type="rect" color="#fff" />
				<Value decimalPlace={2} className="value" />
			</Knob>

			<Text fontSize="10px" id={label} color="White">
				{label}
			</Text>
		</VStack>
	);
}
