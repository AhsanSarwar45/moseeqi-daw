import React, { useState } from 'react';
import { ButtonGroup, Button, HStack, Heading, VStack, Flex } from '@chakra-ui/react';
import KnobControl from 'components/Knob';

interface PropertiesPanelProps {
	numTracks: number;
	selectedIndex: number;
	release: number;
	attack: number;
	setAttack: (value: number) => void;
	setRelease: (value: number) => void;
}

export const PropertiesPanel = (props: PropertiesPanelProps) => {
	return (
		<VStack padding="10px" bgColor="primary.700" height="100%" spacing="10px">
			<Heading width="100%" color="white">
				Properties
			</Heading>
			<Heading width="100%" size="sm" color="white">
				Envelope
			</Heading>
			{[ ...Array(props.numTracks) ].map((value, index) => {
				if (props.selectedIndex !== index) return null;
				return (
					<Flex width="100%" key={index}>
						<KnobControl
							size={50}
							label="Attack"
							setValue={props.setAttack}
							defaultVal={props.attack}
							//defaultVal={0}
						/>
						<KnobControl
							size={50}
							label="Release"
							setValue={props.setRelease}
							defaultVal={props.release}
							//defaultVal={1}
						/>
					</Flex>
				);
			})}
		</VStack>
	);
};
