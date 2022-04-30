import React, { Fragment, useRef, useEffect, memo } from 'react';
import { Button, Flex, Text, IconButton, Box, VStack, HStack, useDisclosure, useTheme } from '@chakra-ui/react';
import { TiPlus, TiVolumeMute } from 'react-icons/ti';
import { BiDuplicate } from 'react-icons/bi';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import Ruler from '@scena/react-ruler';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import * as Tone from 'tone';
import { useState } from 'react';

import { AddTrackModal } from '@Components/studio/AddTrackModal';
import { Instruments, MusicNotes } from '@Instruments/Instruments';
import { Track } from '@Interfaces/Track';
import TimeLineHandle from './TimeLineHandle';
import TrackSequence from './TrackSequence';


interface MeterProps {
	width: number | string; meter: Tone.Meter; fillColor: string; bgColor: string; borderColor: string; borderWidth: number | string;
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
					metersRef.current[index].style.height = `${values_list[index] + 100}%`;
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

	useEffect(
		() => {
			metersRef.current = metersRef.current.slice(0, props.meter.channels);
		},
		[props.meter]
	);

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
						ref={(el) => (metersRef.current[i] = el as HTMLDivElement)}
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

interface TracksViewProps {
	tracks: Array<Track>;
	playbackState: number;
	seek: number;
	setSeek: (seek: number) => void;
	onAddTrack: (instrument: number) => void;
	selected: number;
	setSelected: (trackIndex: number) => void;
	activeWidth: number;
	setActiveWidth: (width: number) => void;
	toggleMute: (trackIndex: number) => void;
	setPartTime: (trackIndex: number, partIndex: number, startTime: number, stopTime: number) => void;

}

const TracksView = memo((props: TracksViewProps) => {
	const theme = useTheme();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const scaleGridTop = useRef<Ruler>(null);
	const scaleGridMain = useRef<Ruler>(null);
	const scaleGridMinor = useRef<Ruler>(null);
	// const [scaleGridMinorHeight, setScaleGridMinorHeight] = useState(0)

	// useEffect(() => {
	// 	console.log("Grid height: ", scaleGridMinor?.current?.canvasElement.clientHeight as number);
	// 	setScaleGridMinorHeight(scaleGridMinor?.current?.canvasElement.clientHeight as number)
	// })

	useEffect(() => {
		window.addEventListener('resize', () => {
			scaleGridTop.current?.resize();
			scaleGridMain.current?.resize();
			scaleGridMinor.current?.resize();
		});
		return () => {
			window.removeEventListener('resize', () => {
				scaleGridTop.current?.resize();
				scaleGridMain.current?.resize();
				scaleGridMinor.current?.resize();
			});
		};
	}, []);



	return (
		<Fragment>
			<HStack alignItems="flex-start" spacing={0} position="relative" width="full" height="100%" overflow="hidden" bgColor="primary.600">
				<VStack width="30%" spacing={0}>
					<HStack
						paddingLeft={2}
						paddingY={2}
						height="30px"
						width="full"
						spacing={1}
						justifyContent="flex-start"
						bgColor="primary.500"
						borderBottom="1px solid gray"
					>
						<IconButton
							colorScheme="secondary"
							size="xs"
							aria-label="add-track"
							icon={<TiPlus />}
							onClick={onOpen}
							flexShrink={0}
							borderRadius="sm"
						/>
						<IconButton
							colorScheme="secondary"
							size="xs"
							aria-label="duplicate-track"
							icon={<BiDuplicate />}
							flexShrink={0}
							borderRadius="sm"
						/>
					</HStack>
					{props.tracks.map((track: Track, index: number) => (
						<HStack
							key={index}
							color="white"
							padding={1}
							paddingLeft={2}
							width="full"
							bgColor={props.selected === index ? 'secondary.500' : 'primary.500'}
							onClick={() => props.setSelected(index)}
							height="88px"
							position="relative"
							borderBottom="1px solid gray"
							alignItems="flex-start"
						>
							<VStack alignItems="flex-start">
								<Text color="white">
									{track.name}
								</Text>

								<HStack>
									<Button
										width="20px"
										borderColor="secondary.700"
										borderWidth="1px"
										bgColor={track.muted ? 'secondary.700' : 'secondary.500'}
										colorScheme="secondary"
										size="xs"
										flexShrink={0}
										borderRadius="sm"
										onClick={() => props.toggleMute(index)}
									>
										M
									</Button>
									<Button
										width="20px"
										borderColor="secondary.700"
										borderWidth="1px"
										colorScheme="secondary"
										size="xs"
										flexShrink={0}
										borderRadius="sm"
									>
										S
									</Button>
								</HStack>
							</VStack>
							<Meter
								width="10px"
								meter={track.meter}
								bgColor="brand.primary"
								fillColor="brand.accent1"
								borderColor="primary.700"
								borderWidth="1px"
							/>
						</HStack>))}

				</VStack>

				<VStack alignItems="flex-start" height="full" spacing={0} overflowX="scroll">
					<Box height="30px" padding="0px" width={2000} position="relative">
						<TimeLineHandle playbackState={props.playbackState} seek={props.seek} setSeek={props.setSeek} height={30 + 88 * props.tracks.length} />
						<Ruler type="horizontal" unit={1} zoom={40} ref={scaleGridTop} backgroundColor={theme.colors.primary[600]} segment={4} />


					</Box>
					<Box height={88 * props.tracks.length} padding="0px" width={2000}>
						<Ruler type="horizontal" unit={1} zoom={40} ref={scaleGridMinor} backgroundColor={theme.colors.primary[400]} segment={4} mainLineSize={0} shortLineSize={86} longLineSize={86} lineColor='rgba(255,255,255,0.1)' textColor='rgba(0,0,0,0)' />
						{/* <Ruler style={{ marginTop: -(86 * props.tracks.length), marginLeft: -1 }} height={43 * props.tracks.length} type="horizontal" unit={1} zoom={40} ref={scaleGridMain} backgroundColor='rgba(0,0,0,0)' segment={1} lineColor='rgba(255,255,255,0.3)' textColor='rgba(0,0,0,0)' /> */}

						{/* <Box position="absolute" width={2000} p={0}>
							<Ruler type="horizontal" unit={1} zoom={40} ref={scaleGridMain} backgroundColor={theme.colors.primary[400]} segment={4} height={86} mainLineSize={0} shortLineSize={86} longLineSize={86} lineColor='rgba(255,255,255,0.1)' textColor='rgba(0,0,0,0)' />
						</Box>
						<Box position="absolute" width={2000} p={0}>
							<Ruler type="horizontal" unit={1} zoom={40} ref={scaleGridMinor} backgroundColor='rgba(0,0,0,0)' segment={1} height={86} lineColor='rgba(255,255,255,0.3)' textColor='rgba(0,0,0,0)' />
						</Box> */}
						<Box marginTop={-88 * props.tracks.length}>
							{props.tracks.map((track: Track, trackIndex: number) => (
								<TrackSequence
									key={trackIndex}
									track={track}
									trackIndex={trackIndex}
									setSelected={props.setSelected}
									setPartTime={props.setPartTime} />
							))}
						</Box>

					</Box>



				</VStack>

			</HStack>
			<AddTrackModal onClose={onClose} isOpen={isOpen} onSubmit={props.onAddTrack} />
		</Fragment>
	);
});

TracksView.displayName = 'TracksView';

export default TracksView;
