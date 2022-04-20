import React, { useRef } from 'react';
import { Button, Box, Flex, HStack } from '@chakra-ui/react';
import interpolate from 'color-interpolate';

import Theme from '../themes/Theme.js';

export default function VisualDemo(props) {
	const amplitudeValues = useRef(null);

	function adjustFreqBandStyle(newAmplitudeData) {
		let colormap = interpolate([ Theme.colors.brand.primary, Theme.colors.brand.secondary ]);
		amplitudeValues.current = newAmplitudeData;
		let domElements = props.frequencyBandArray.map((num) => document.getElementById(num));
		for (let i = 0; i < props.frequencyBandArray.length; i++) {
			let num = props.frequencyBandArray[i];
			domElements[num].style.backgroundColor = colormap(num / 24);
			domElements[num].style.width = `${amplitudeValues.current[num] * 0.2 * (num + 1) ** 0.5}px`;
		}
	}

	function runSpectrum() {
		props.getFrequencyData(adjustFreqBandStyle);
		requestAnimationFrame(runSpectrum);
	}

	function handleStartBottonClick() {
		props.initializeAudioAnalyser();
		requestAnimationFrame(runSpectrum);
	}

	const radius = 3;
	const x = 200;
	const y = 200;
	const l = radius * 2 * Math.PI;
	const multiplier = 50;

	return (
		<div>
			<Button onClick={() => handleStartBottonClick()}>Start</Button>
			{props.frequencyBandArray.map((num) => (
				// <div>
				<Box
					position="absolute"
					bottom={x + radius * Math.sin(2 * Math.PI * (num / 24 * l) / l) * multiplier}
					right={y + radius * Math.cos(2 * Math.PI * (num / 24 * l) / l) * multiplier}
					transformOrigin="50% 100%"
					transform={`rotate(${360 / 24 * num}deg)`}
					height={5}
					className={'frequencyBands'}
					id={num}
					key={num}
				/>
				// {/* <Box position="absolute" transform={`translate(${x}px, ${y}px)`} bg="brand.primary"/> */}
				// {/* </div> */}
			))}
		</div>
	);
}
