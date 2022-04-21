import React, { Fragment, useRef, useEffect } from 'react';
import { Button, Flex, Text, IconButton, Box, VStack, HStack, useDisclosure } from '@chakra-ui/react';
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

interface TimeHandleProps {
	playbackState: number;
}

const TimeLineHandle = (props: TimeHandleProps) => {
	const seekHandleRef = useRef(null);
	const dragging = useRef(false);

	const seekAnimationRef = useRef(0);

	const [seek, setSeek] = useState(0);

	const HandleDrag = (event: DraggableEvent, data: DraggableData) => {
		setSeek(data.lastX / 5);
		Tone.Transport.seconds = data.lastX / 20;
		dragging.current = false;
	};

	useEffect(
		() => {
			if (props.playbackState === 1) {
				seekAnimationRef.current = requestAnimationFrame(function UpdateSeek() {
					// let interval = (Date.now() - start)
					setSeek(Tone.Transport.seconds * 4);
					// console.log(seekHandleRef.current);
					// if (!dragging.current) seekHandleRef.current.position = Tone.Transport.seconds * 4;
					// else seekHandleRef.current.position = null;
					seekAnimationRef.current = requestAnimationFrame(UpdateSeek);
				});
			} else if (props.playbackState === 0) {
				// Stop
				setSeek(0);
				cancelAnimationFrame(seekAnimationRef.current);
			} else if (props.playbackState === 2) {
				//Pause
				cancelAnimationFrame(seekAnimationRef.current);
			}
		},
		[props.playbackState]
	);

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
				bgColor="brand.accent2"
				//left={`${300 + seek}px`}
				height="full"
				width="1px"
			>
				<Box
					className="handle"
					//zIndex={1501}
					bgColor="brand.accent2"
					marginLeft="-10px"
					width="20px"
					height="20px"
				/>
			</Box>
		</Draggable>
	);
};

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
	onAddTrack: (instrument: number) => void;
	selected: number;
	setSelected: (trackIndex: number) => void;
	activeWidth: number;
	setActiveWidth: (width: number) => void;
	setStopTime: (time: number) => void;
	toggleMute: (trackIndex: number) => void;

}

export const TracksView = (props: TracksViewProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const timeScale = useRef<Ruler>(null);

	useEffect(() => {
		window.addEventListener('resize', () => {
			timeScale.current?.resize();
		});
		return () => {
			window.removeEventListener('resize', () => {
				timeScale.current?.resize();
			});
		};
	}, []);

	const OnSetActiveWidth = (e: React.SyntheticEvent<Element, Event>, data: ResizeCallbackData) => {
		console.log(data.size.width);
		props.setActiveWidth(data.size.width);
	};

	const OnResizeStop = (e: React.SyntheticEvent<Element, Event>, data: ResizeCallbackData) => {
		props.setStopTime(data.size.width / 20);
	};

	return (
		<Fragment>
			<VStack spacing={0} position="relative" width="full" height="100%" overflow="auto" bgColor="primary.600">
				<HStack borderBottom="1px solid gray" height="30px" spacing={0} width="full" flexShrink={0}>
					<HStack
						paddingLeft={2}
						height="full"
						width="300px"
						spacing={1}
						justifyContent="flex-start"
						bgColor="primary.500"
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
					<Box height="full" width="full" padding="0px">
						<TimeLineHandle playbackState={props.playbackState} />
						<Ruler type="horizontal" unit={1} zoom={20} ref={timeScale} />
					</Box>
				</HStack>

				{props.tracks.map((track: Track, index: number) => (
					<HStack
						borderBottom="1px solid gray"
						height={`${MusicNotes.length}px`}
						padding={0}
						spacing={0}
						width="full"
						key={index}
					>
						<Flex
							height="full"
							color="white"
							padding={1}
							paddingLeft={2}
							width="300px"
							bgColor={props.selected === index ? 'secondary.500' : 'primary.500'}
							onClick={() => props.setSelected(index)}
							flexDirection="row"
							position="relative"
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
						</Flex>
						<Box
							height="full"
							color="white"
							width="full"
							bgColor="primary.400"
							padding="0px"
							position="relative"
							onClick={() => props.setSelected(index)}
						>
							<Resizable

								height={1}
								width={props.activeWidth}
								onResize={OnSetActiveWidth}
								onResizeStop={OnResizeStop}
								axis="x"
								draggableOpts={{ grid: [5, 5] }}
								resizeHandles={['e']}
							>
								<Box height="full" width={props.activeWidth} overflow="hidden" bgColor="primary.500">
									{track.notes.map((note, index) => (
										<Box
											key={index}
											bgColor="secondary.500"
											position="absolute"
											top={`${note.noteIndex}px`}
											left={`${5 * note.time}px`}
											width={`${5 * 8 / note.duration}px`}
											height="1px"
										/>
									))}
								</Box>
							</Resizable>
						</Box>
					</HStack>
				))}
			</VStack>
			<AddTrackModal onClose={onClose} isOpen={isOpen} onSubmit={props.onAddTrack} />
		</Fragment>
	);
};
