import React, { Fragment, useRef, useEffect } from 'react';
import { Button, Flex, Text, IconButton, Box, VStack, HStack, useDisclosure } from '@chakra-ui/react';
import { TiPlus, TiVolumeMute } from 'react-icons/ti';
import { BiDuplicate } from 'react-icons/bi';
import { Resizable } from 'react-resizable';
import Ruler from '@scena/react-ruler';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { AddTrackModal } from '@Components/studio/AddTrackModal';
import { Instruments, MusicNotes } from '@Instruments/Instruments';
import * as Tone from 'tone';
import { useState } from 'react';

interface TimeHandleProps {
	playbackState: number;
}

const TimeLineHandle = (props: TimeHandleProps) => {
	const seekHandleRef = useRef(null);
	const dragging = useRef(false);

	const seekAnimationRef = useRef(0);

	const [ seek, setSeek ] = useState(0);

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
		[ props.playbackState ]
	);

	return (
		<Draggable
			axis="x"
			handle=".handle"
			defaultPosition={{ x: 0, y: 0 }}
			position={dragging.current ? null as any : { x: seek * 5, y: 0 }}
			grid={[ 5, 5 ]}
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

interface MeterProps {}

const Meter = ({ width, meter, fillColor, bgColor, borderColor, borderWidth }) => {
	const meterAnimationRef = useRef(null);
	const metersRef = useRef([]);
	// const maxHeight =

	useEffect(() => {
		meterAnimationRef.current = requestAnimationFrame(function animate() {
			const values = meter.getValue();

			if (meter.channels > 1) {
				for (let index = 0; index < values.length; index++) {
					metersRef.current[index].style.height = `${values[index] + 100}%`;
				}
			} else {
				metersRef.current[0].style.height = `${values + 100}%`;
			}

			//	metersRef.current.style.height = `${meter.getValue() + 100}%`;

			meterAnimationRef.current = requestAnimationFrame(animate);
		});
		return () => {
			cancelAnimationFrame(meterAnimationRef.current);
		};
	}, []);

	useEffect(
		() => {
			metersRef.current = metersRef.current.slice(0, meter.channels);
		},
		[ meter ]
	);

	return (
		<HStack top={1} spacing={1} position="absolute" bottom={1} right={1}>
			{[ ...Array(meter.channels) ].map((channel, i) => (
				<Box
					height="100%"
					width={width}
					bgColor={bgColor}
					position="relative"
					borderColor={borderColor}
					borderWidth={borderWidth}
					key={i}
					//id={`meter${i}`}
				>
					<Box
						ref={(el) => (metersRef.current[i] = el)}
						position="absolute"
						bottom={0}
						// height={`${meterHeight + 100}%`}
						width="100%"
						bgColor={fillColor}
					/>
				</Box>
			))}
		</HStack>
	);
};

export const TracksView = ({
	playbackState,
	tracks,
	onAddTrack,
	selected,
	setSelected,
	activeWidth,
	setActiveWidth,
	setStopTime,
	toggleMute
}) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const timeScale = useRef(null);

	useEffect(() => {
		window.addEventListener('resize', () => {
			timeScale.current.resize();
		});
		return () => {
			window.removeEventListener('resize', () => {
				timeScale.current.resize();
			});
		};
	}, []);

	const OnSetActiveWidth = (event, { element, size, handle }) => {
		setActiveWidth(size.width);
	};

	const OnResizeStop = (event, { element, size, handle }) => {
		setStopTime(size.width / 20);
	};

	return (
		<Fragment>
			<VStack spacing={0} position="relative" width="full" height="100%" overflow="auto" bgColor="primary.600">
				<HStack borderBottom="1px solid gray" height="30px" spacing={0} width="full" flexShrink="0">
					<HStack
						paddingLeft={1}
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
							flexShrink="0"
							borderRadius="5px"
						/>
						<IconButton
							colorScheme="secondary"
							size="xs"
							aria-label="duplicate-track"
							icon={<BiDuplicate />}
							flexShrink="0"
							borderRadius="5px"
						/>
					</HStack>
					<Box height="full" width="full" padding="0px">
						<TimeLineHandle playbackState={playbackState} />
						<Ruler type="horizontal" unit={1} zoom={20} ref={timeScale} />
					</Box>
				</HStack>

				{tracks.map((track, index) => (
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
							width="300px"
							bgColor={selected === index ? 'secondary.500' : 'primary.500'}
							onClick={() => setSelected(index)}
							flexDirection="row"
							position="relative"
						>
							<VStack alignItems="flex-start">
								<Text paddingLeft="5px" color="white">
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
										flexShrink="0"
										borderRadius="5px"
										onClick={() => toggleMute(index)}
									>
										M
									</Button>
									<Button
										width="20px"
										borderColor="secondary.700"
										borderWidth="1px"
										colorScheme="secondary"
										size="xs"
										flexShrink="0"
										borderRadius="5px"
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
							onClick={() => setSelected(index)}
						>
							<Resizable
								position="absolute"
								left={0}
								top={0}
								height={1}
								bgColor="primary.700"
								width={activeWidth}
								onResize={OnSetActiveWidth}
								onResizeStop={OnResizeStop}
								axis="x"
								draggableOpts={{ grid: [ 5, 5 ] }}
								resizeHandles={[ 'e' ]}
							>
								<Box height="full" width={activeWidth} overflow="hidden">
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
			<AddTrackModal onClose={onClose} isOpen={isOpen} onSubmit={onAddTrack} />
		</Fragment>
	);
};
