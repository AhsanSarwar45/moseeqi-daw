import { Flex, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect, useRef, Fragment } from 'react';
import Splitter, { SplitDirection } from '@devbookhq/splitter';
import * as Tone from 'tone';

import { PlayBackController } from '@Components/studio/PlaybackController';
import { PianoRoll } from '@Components/studio/PianoRoll';
import { TracksView } from '@Components/studio/TracksView';
import { PropertiesPanel } from '@Components/studio/PropertiesPanel';
import { WaitingModal } from '@Components/WaitingModal';
import { Instruments, MusicNotes } from '@Instruments/Instruments';

const Studio = () => {
	//const [ numCols, setNumCols ] = useState(40);
	const [ playbackState, setPlaybackState ] = useState(0);
	const [ activeWidth, setActiveWidth ] = useState(5 * 40);
	const [ stopTime, setStopTime ] = useState(activeWidth / 20);
	const [ isInstrumentLoading, setIsInstrumentLoading ] = useState(0);
	const [ tracks, setTracks ] = useState(() => {
		setIsInstrumentLoading(1);
		const instrument = Instruments[0];
		const meter = new Tone.Meter();
		const initialState = [
			{
				name: instrument.name,
				instrument: instrument,
				notes: [],
				sampler: new Tone.Sampler({
					urls: instrument.urls,
					release: instrument.release,
					attack: instrument.attack,
					onload: () => {
						setIsInstrumentLoading(0);
					}
				})
					.toDestination()
					.connect(meter),
				meter: meter,
				muted: false
			}
		];
		return initialState;
	});
	const [ bpm, setBPM ] = useState(120);
	const [ selectedIndex, setSelectedIndex ] = useState(0);
	const [ isContextStarted, setIsContextStarted ] = useState(false);
	const needToAddPart = useRef(false);
	const parts = useRef([
		new Tone.Part((time, value) => {
			// const activeCells = activeWidth / 5;
			// console.log(activeCells);
			// if (value.time <= activeCells) {
			tracks.at(-1).sampler.triggerAttackRelease(value.note, value.duration, time, value.velocity);
			//}
		}, []).start()
	]);

	const { isOpen, onOpen, onClose } = useDisclosure();

	const StartAudioContext = async () => {
		await Tone.start();
		setIsContextStarted(true);
	};

	useEffect(
		() => {
			console.log(stopTime);
			parts.current.forEach((part) => {
				part.cancel(0.1);
				part.stop(stopTime);
			});
		},
		[ stopTime ]
	);

	useEffect(
		() => {
			if (isInstrumentLoading > 0) {
				onOpen();
			} else {
				onClose();
			}
		},
		[ isInstrumentLoading ]
	);

	useEffect(
		() => {
			if (!isContextStarted) StartAudioContext();
			else {
				if (playbackState === 1) {
					Tone.Transport.start();
				} else if (playbackState === 0) {
					// Stop
					Tone.Transport.stop();
					Tone.Transport.seconds = 0;
				} else if (playbackState === 2) {
					//Pause
					Tone.Transport.pause();
				}

				const HandleKeyboardEvent = (event) => {
					if (event.keyCode === 32) {
						if (playbackState === 0) setPlaybackState(1);
						else if (playbackState === 2) setPlaybackState(1);
						else if (playbackState === 1) setPlaybackState(2);
					}
				};

				window.addEventListener('keydown', HandleKeyboardEvent);
				return () => {
					window.removeEventListener('keydown', HandleKeyboardEvent);
				};
			}
		},
		[ playbackState, isContextStarted ]
	);

	useEffect(
		() => {
			if (needToAddPart.current) {
				parts.current.push(
					new Tone.Part((time, value) => {
						tracks.at(-1).sampler.triggerAttackRelease(value.note, value.duration, time, value.velocity);
					}, []).start()
				);
				needToAddPart.current = false;
			}
		},
		[ tracks ]
	);

	const SetRelease = (value) => {
		tracks[selectedIndex].sampler.release = value;
	};

	const SetAttack = (value) => {
		tracks[selectedIndex].sampler.attack = value;
	};

	const AddTrack = (instrument) => {
		Tone.Transport.stop();
		Tone.Transport.seconds = 0;
		let copy = [ ...tracks ];
		setIsInstrumentLoading(1);
		const meter = new Tone.Meter();
		copy.push({
			name: Instruments[instrument].name,
			instrument: Instruments[instrument],
			notes: [],
			sampler: new Tone.Sampler({
				urls: Instruments[instrument].urls,
				release: Instruments[instrument].release,
				attack: Instruments[instrument].attack,
				onload: () => {
					setIsInstrumentLoading(0);
				}
			})
				.toDestination()
				.connect(meter),
			meter: meter
		});
		setTracks(copy);
		needToAddPart.current = true;
	};

	const AddNote = (column, row, divisor) => {
		let copy = [ ...tracks ];
		const note = {
			time: column,
			noteIndex: row,
			note: MusicNotes[row],
			duration: divisor,
			velocity: 1.0
		};
		copy[selectedIndex].notes.push(note);
		setTracks(copy);
		const partNote = {
			time: column * 0.25,
			note: MusicNotes[row],
			duration: `${divisor}n`,
			velocity: 1.0
		};
		parts.current[selectedIndex].add(partNote);
	};

	// const SetNotes = (notes) => {
	// 	let copy = [ ...tracks ];
	// 	copy[selectedIndex].notes = notes;
	// 	setTracks(copy);
	// };

	const RemoveNote = (index) => {
		parts.current[selectedIndex].clear();
		let copy = [ ...tracks ];
		copy[selectedIndex].notes.splice(index, 1);
		setTracks(copy);

		copy[selectedIndex].notes.forEach((note) => {
			const partNote = {
				time: note.time * 0.25,
				note: note.note,
				duration: `${note.duration}n`,
				velocity: note.velocity
			};
			parts.current[selectedIndex].add(partNote);
		});
		//console.log(parts.current);
	};

	const MoveNote = (index, column, row) => {
		parts.current[selectedIndex].clear();

		let copy = [ ...tracks ];
		const newNote = copy[selectedIndex].notes[index];
		newNote.note = MusicNotes[row];
		newNote.noteIndex = row;
		newNote.time = column;
		copy[selectedIndex].notes[index] = newNote;
		setTracks(copy);

		copy[selectedIndex].notes.forEach((note) => {
			const partNote = {
				time: note.time * 0.25,
				note: note.note,
				duration: `${note.duration}n`,
				velocity: note.velocity
			};
			parts.current[selectedIndex].add(partNote);
		});
		//console.log(parts.current);
	};

	const ClearNotes = () => {
		parts.current[selectedIndex].clear();
		let copy = [ ...tracks ];
		copy[selectedIndex].notes = [];
		setTracks(copy);
	};

	const ToggleMuteAtIndex = (index) => {
		parts.current[index].mute = !parts.current[index].mute;
		let copy = [ ...tracks ];
		copy[index].muted = !copy[index].muted;
		setTracks(copy);
	};

	const ToggleSoloAtIndex = (index) => {
		parts.current[index].mute = !parts.current[index].mute;
	};

	return (
		<Fragment>
			<Flex height="100vh" width="full" spacing={0} overflow="hidden" flexDirection="column">
				<Flex width="100%" height="100%" flexDirection="row" overflow="hidden">
					<Splitter initialSizes={[ 20, 80 ]}>
						<PropertiesPanel
							numTracks={tracks.length}
							selectedIndex={selectedIndex}
							release={tracks[selectedIndex].sampler.release}
							attack={tracks[selectedIndex].sampler.attack}
							setRelease={SetRelease}
							setAttack={SetAttack}
						/>

						<Flex height="100%" spacing={0} overflow="hidden" flexDirection="column" flexGrow="3">
							<Splitter direction={SplitDirection.Vertical}>
								<TracksView
									playbackState={playbackState}
									tracks={tracks}
									onAddTrack={AddTrack}
									selected={selectedIndex}
									setSelected={setSelectedIndex}
									activeWidth={activeWidth}
									setActiveWidth={setActiveWidth}
									toggleMute={ToggleMuteAtIndex}
									setStopTime={setStopTime}
								/>
								<PianoRoll
									track={tracks[selectedIndex]}
									addNote={AddNote}
									moveNote={MoveNote}
									removeNote={RemoveNote}
									clearNotes={ClearNotes}
								/>
							</Splitter>
						</Flex>
					</Splitter>
				</Flex>
				<PlayBackController playbackState={playbackState} setPlaybackState={setPlaybackState} setBPM={setBPM} />
			</Flex>
			<WaitingModal onClose={onClose} isOpen={isOpen} />
		</Fragment>
	);
};

export default Studio;
