import { Flex, useDisclosure } from '@chakra-ui/react';
import { useState, useEffect, useRef, Fragment } from 'react';
import Splitter, { SplitDirection } from '@devbookhq/splitter';
import * as Tone from 'tone';

import { PlayBackController } from '@Components/studio/PlaybackController';
import PianoRoll from '@Components/studio/PianoRoll';
import TracksView from '@Components/studio/TracksView';
import { PropertiesPanel } from '@Components/studio/PropertiesPanel';
import { WaitingModal } from '@Components/WaitingModal';
import { Instruments, MusicNotes } from '@Instruments/Instruments';
import { Track } from '@Interfaces/Track';
import { SeekContext } from 'data/SeekContext';
import { Part } from '@Interfaces/Part';
import { PlaybackState } from '@Types/Types';
import { NotesModifierContext } from '@Data/NotesModifierContext';
import { Note } from '@Interfaces/Note';




// Move to utility folder
const GetPartNote = (note: Note) => {
	const partNote = {
		time: note.time * 0.25, // TODO: Magic numbers
		note: note.key,
		duration: `${note.duration}n`,
		velocity: note.velocity
	};

	return partNote;
}

const GetNewPartStartColumn = (column: number) => {
	return Math.floor(column / 8) * 8;
}

const Studio = () => {
	//const [ numCols, setNumCols ] = useState(40);
	const [playbackState, setPlaybackState] = useState<PlaybackState>(0);
	const [activeWidth, setActiveWidth] = useState(5 * 40);
	const [stopTime, setStopTime] = useState(10);
	const [seek, setSeek] = useState(0)
	const [isInstrumentLoading, setIsInstrumentLoading] = useState(0);
	const [bpm, setBPM] = useState(120);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isContextStarted, setIsContextStarted] = useState(false);
	const partSamplerPending = useRef(false);

	const CreateTrack = (instrumentIndex: number) => {
		// Causes the loading modal to show
		setIsInstrumentLoading(1);

		const meter = new Tone.Meter();
		const instrument = Instruments[instrumentIndex];

		partSamplerPending.current = true;

		return {
			name: instrument.name,
			instrument: instrument,
			// This will be populated in a tracks useEffect. We need to do this because we need to reference the sampler
			// TODO: This might not be true. Need to test a simpler alternative.
			parts: [{ tonePart: null as any, startTime: 0, stopTime: 10, notes: [] }],
			sampler: new Tone.Sampler({
				urls: instrument.urls as any,
				release: instrument.release,
				attack: instrument.attack,
				onload: () => {
					// Causes the loading modal to close
					setIsInstrumentLoading(0);
				}
			})
				.toDestination()
				.connect(meter),
			meter: meter,
			muted: false
		}


	}


	const [tracks, setTracks] = useState<Array<Track>>(() => [CreateTrack(0)]);

	const { isOpen, onOpen, onClose } = useDisclosure();

	const StartAudioContext = async () => {
		await Tone.start();
		setIsContextStarted(true);
	};


	useEffect(() => {
		Tone.Transport.bpm.value = bpm;
	}, [bpm]);


	useEffect(
		() => {
			if (isInstrumentLoading > 0) {
				onOpen();
			} else {
				onClose();
			}
		},
		[isInstrumentLoading, onClose, onOpen]
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

				const HandleKeyboardEvent = (event: KeyboardEvent) => {
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
		[playbackState, isContextStarted]
	);

	useEffect(
		() => {
			// console.log("Track Changed", tracks);
			if (partSamplerPending.current) {
				// console.log("PartAdded");

				const tonePart = new Tone.Part((time, value: any) => {
					tracks.at(-1)?.sampler.triggerAttackRelease(value.note, value.duration, time, value.velocity);
				}, []).start(tracks.at(-1)?.parts.at(-1)?.startTime);

				// Add all the notes in the part to the tone part
				tracks.at(-1)?.parts.at(-1)?.notes.forEach((note: Note) => {
					tonePart.add(GetPartNote(note));
				});

				((tracks.at(-1) as Track).parts.at(-1) as Part).tonePart = tonePart;

				partSamplerPending.current = false;
			}

		},
		[tracks]
	);


	const SetRelease = (value: number) => {
		tracks[selectedIndex].sampler.release = value;
	};

	const SetAttack = (value: number) => {
		tracks[selectedIndex].sampler.attack = value;
	};


	const SetPartTime = (trackIndex: number, partIndex: number, startTime: number, endTime: number) => {

		console.log("Start time set to: " + startTime);
		console.log("Stop time set to: " + endTime);
		let tracksCopy = [...tracks];

		tracksCopy[trackIndex].parts[partIndex].tonePart.cancel(0).start(startTime).stop(endTime);
		tracksCopy[trackIndex].parts[partIndex].startTime = startTime;
		tracksCopy[trackIndex].parts[partIndex].stopTime = endTime;


		setTracks(tracksCopy);


	}



	const AddTrack = (instrument: number) => {
		// console.log("Track added");

		// Just to be neat and tidy, reset the timeline
		Tone.Transport.stop();
		Tone.Transport.seconds = 0;

		// We need a copy as we cannot mutate the original
		let tracksCopy = [...tracks];

		tracksCopy.push(CreateTrack(instrument));

		setTracks(tracksCopy);
	};

	const AddNoteToTrack = (track: Track, note: Note) => {
		// Check which part the note is in
		let currentPartIndex = track.parts.findIndex((part) => part.startTime <= ((note.time + 1) / 4.0) && part.stopTime >= ((note.time + 1) / 4.0))

		// If the note lies in an existing part, add it to the part
		if (currentPartIndex !== -1) {
			const part = track.parts[currentPartIndex];

			note.time -= part.startTime * 4;

			part.notes.push(note);
			part.tonePart.add(GetPartNote(note));

			track.parts[currentPartIndex] = part;
		}
		// If in not in any existing part, create a new part and add the note to it
		else {

			// Round down to the nearest 8th note 
			// TODO: Add snap settings
			const startColumn = GetNewPartStartColumn(note.time);

			// Make the note time relative to the start of the part
			note.time -= startColumn;

			const startTime = startColumn / 4

			track.parts.push({ tonePart: null as any, startTime: startTime, stopTime: startTime + 10, notes: [note] });

			partSamplerPending.current = true;
		}

	}


	// Add a note to the selected track. 
	const AddNote = (column: number, row: number, divisor: number) => {
		// console.log("Note added", column, row, divisor);

		const key = MusicNotes[row];

		// We need a copy as we cannot mutate the original
		let tracksCopy = [...tracks];

		const note = {
			time: column,
			noteIndex: row,
			key: key,
			duration: divisor,
			velocity: 1.0
		};

		AddNoteToTrack(tracksCopy[selectedIndex], note);

		setTracks(tracksCopy);

		// Play the note to give the user feedback
		tracksCopy[selectedIndex].sampler.triggerAttackRelease(key, `${divisor}n`);
	};


	const RemoveNote = (partIndex: number, noteIndex: number) => {

		let part = tracks[selectedIndex].parts[partIndex];

		// Tone doesn't allow us to remove single notes, so we need to clear the part and then re-add all the notes except the removed one
		part.tonePart.clear();

		// Remove the note from the part
		part.notes.splice(noteIndex, 1);

		// Re-add all the notes to the part
		part.notes.forEach((note) => {
			part.tonePart.add(GetPartNote(note));
		});

		// We need a copy as we cannot mutate the original
		let tracksCopy = [...tracks];

		tracksCopy[selectedIndex].parts[partIndex] = part;

		setTracks(tracksCopy);
	};

	const MoveNote = (partIndex: number, noteIndex: number, column: number, row: number) => {

		console.log("Note moved", partIndex, noteIndex, column, row);

		let part = tracks[selectedIndex].parts[partIndex];
		const key = MusicNotes[row];

		let tracksCopy = [...tracks];

		const newNote = part.notes[noteIndex];
		newNote.key = key;
		newNote.noteIndex = row;
		newNote.time = column;

		// Tone doesn't allow us to remove or modify single notes, so we need to clear the part and then re-add all the notes except the removed one
		part.tonePart.clear();

		// Check if moved position is within the current part
		if (part.startTime <= ((newNote.time + 1) / 4) && part.stopTime >= ((newNote.time + 1) / 4)) {
			newNote.time -= part.startTime * 4;
			part.notes[noteIndex] = newNote;
		}
		// If not then check is there any existing part that the note can be moved to
		else {
			// Remove the note from the current part
			part.notes.splice(noteIndex, 1);

			AddNoteToTrack(tracksCopy[selectedIndex], newNote);
		}

		// Add back all the notes to the part
		part.notes.forEach((note) => {
			part.tonePart.add(GetPartNote(note));
		});

		tracksCopy[selectedIndex].parts[partIndex] = part;

		setTracks(tracksCopy);


		// Play the changed note to give the user feedback
		tracks[selectedIndex].sampler.triggerAttackRelease(key, `${newNote.duration}n`);
	};

	const ResizeNote = (partIndex: number, noteIndex: number, duration: number) => {
		let part = tracks[selectedIndex].parts[partIndex];

		// Tone doesn't allow us to remove or modify single notes, so we need to clear the part and then re-add all the notes except the removed one
		part.tonePart.clear();

		let tracksCopy = [...tracks];

		const newNote = part.notes[noteIndex];
		newNote.duration = duration;
		part.notes[noteIndex] = newNote;

		part.notes.forEach((note) => {
			part.tonePart.add(GetPartNote(note));
		});

		tracksCopy[selectedIndex].parts[partIndex] = part;
		setTracks(tracksCopy);

		tracks[selectedIndex].sampler.triggerAttackRelease(newNote.key, `${duration}n`);
		//console.log(parts.current);
	};

	const ClearNotes = () => {
		// Clear all the parts
		tracks[selectedIndex].parts.forEach((part) => {
			part.tonePart.clear();
			part.notes = []
		});

		let tracksCopy = [...tracks];
		setTracks(tracksCopy);
	};

	const ToggleMuteAtIndex = (trackIndex: number) => {
		// Toggle mute on all the parts in the track
		tracks[trackIndex].parts.forEach((part) => {
			part.tonePart.mute = !part.tonePart.mute;
		});

		let tracksCopy = [...tracks];
		tracksCopy[trackIndex].muted = !tracksCopy[trackIndex].muted;
		setTracks(tracksCopy);

	};

	const ToggleSoloAtIndex = (index: number) => {
		// TODO
		// parts.current[index].mute = !parts.current[index].mute;
	};

	return (
		<Fragment>
			<NotesModifierContext.Provider value={{ onAddNote: AddNote, onMoveNote: MoveNote, onRemoveNote: RemoveNote, onResizeNote: ResizeNote, onClearNotes: ClearNotes }}>
				<Flex height="100vh" width="full" overflow="hidden" flexDirection="column">
					<Flex width="100%" height="100%" flexDirection="row" overflow="hidden">
						<Splitter initialSizes={[20, 80]}>
							<PropertiesPanel
								numTracks={tracks.length}
								selectedIndex={selectedIndex}
								release={tracks[selectedIndex].sampler.release as number}
								attack={tracks[selectedIndex].sampler.attack as number}
								setRelease={SetRelease}
								setAttack={SetAttack}
							/>

							<Flex height="100%" overflow="hidden" flexDirection="column" flexGrow={3}>
								{/* <SeekContext.Provider value={{ seek: seek, setSeek: setSeek }}> */}
								<Splitter direction={SplitDirection.Vertical}>

									<TracksView
										playbackState={playbackState}
										seek={seek}
										setSeek={setSeek}
										tracks={tracks}
										onAddTrack={AddTrack}
										selected={selectedIndex}
										setSelected={setSelectedIndex}
										activeWidth={activeWidth}
										setActiveWidth={setActiveWidth}
										toggleMute={ToggleMuteAtIndex}
										setStopTime={setStopTime}
										setPartTime={SetPartTime}

									/>
									<PianoRoll
										playbackState={playbackState}
										seek={seek}
										setSeek={setSeek}
										track={tracks[selectedIndex]}
										numCols={500}
									/>

								</Splitter>
								{/* </SeekContext.Provider> */}
							</Flex>
						</Splitter>
					</Flex>
					<PlayBackController playbackState={playbackState} setPlaybackState={setPlaybackState} setBPM={setBPM} />
				</Flex>
			</NotesModifierContext.Provider>
			<WaitingModal onClose={onClose} isOpen={isOpen} />
		</Fragment>
	);
};

export default Studio;
