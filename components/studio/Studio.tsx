import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect, useRef, Fragment } from "react";
import { SplitDirection } from "@devbookhq/splitter";
import * as Tone from "tone";

import { PlayBackController } from "@Components/studio/PlaybackController";
import PianoRoll from "@Components/studio/PianoRoll";
import TracksView from "@Components/studio/TracksView";
import { PropertiesPanel } from "@Components/studio/PropertiesPanel";
import { WaitingModal } from "@Components/WaitingModal";
import { Instruments, MusicNotes } from "@Instruments/Instruments";
import { Track } from "@Interfaces/Track";
import { PlaybackState } from "@Types/Types";
import { NotesModifierContext } from "@Data/NotesModifierContext";
import { Note } from "@Interfaces/Note";
import { gridDivisions } from "@Data/Constants";
import { GetNewPartStartColumn } from "@Utility/PartUtils";
import { PlaybackContext } from "@Data/PlaybackContext";
import Splitter from "@Components/Splitter";

const Studio = () => {
    //const [ numCols, setNumCols ] = useState(40);
    const [playbackState, setPlaybackState] = useState<PlaybackState>(0);
    const [activeWidth, setActiveWidth] = useState(5 * 40);
    const [seek, setSeek] = useState(0);
    const [isInstrumentLoading, setIsInstrumentLoading] = useState(0);
    const [bpm, setBPM] = useState(120);
    const [selectedIndex, _setSelectedIndex] = useState(0);
    const selectedIndexRef = useRef(0);
    const [isContextStarted, setIsContextStarted] = useState(false);
    const [indexToDelete, setIndexToDelete] = useState(-1);

    const setSelectedIndex = (index: number) => {
        selectedIndexRef.current = index;
        _setSelectedIndex(index);
    };

    const CreateTrack = (instrumentIndex: number) => {
        // Causes the loading modal to show
        setIsInstrumentLoading(1);
        const instrument = Instruments[instrumentIndex];
        const noteLength = (gridDivisions / 4) * (bpm / 60);

        const meter = new Tone.Meter();

        const sampler = new Tone.Sampler({
            urls: instrument.urls as any,
            release: instrument.release,
            attack: instrument.attack,
            onload: () => {
                // Causes the loading modal to close
                setIsInstrumentLoading(0);
            },
        })
            .toDestination()
            .connect(meter);

        const tonePart = new Tone.Part((time, value: any) => {
            sampler.triggerAttackRelease(
                value.note,
                value.duration,
                time,
                value.velocity
            );
        }, []).start(0);

        return {
            name: instrument.name,
            instrument: instrument,
            // This will be populated in a tracks useEffect. We need to do this because we need to reference the sampler
            // TODO: This might not be true. Need to test a simpler alternative.
            parts: [
                {
                    tonePart: tonePart,
                    startTime: 0,
                    stopTime: 32 / noteLength,
                    notes: [],
                },
            ],
            sampler: sampler,
            meter: meter,
            muted: false,
        };
    };

    const [tracks, setTracks] = useState<Array<Track>>(() => [CreateTrack(0)]);

    const {
        isOpen: isWaitingModalOpen,
        onOpen: onWaitingModalOpen,
        onClose: onWaitingModalClose,
    } = useDisclosure();

    const StartAudioContext = async () => {
        await Tone.start();
        setIsContextStarted(true);
    };

    useEffect(() => {
        // console.log("BPM: " + bpm);
        Tone.Transport.bpm.value = bpm;
    }, [bpm]);

    useEffect(() => {
        if (isInstrumentLoading > 0) {
            onWaitingModalOpen();
        } else {
            onWaitingModalClose();
        }
    }, [isInstrumentLoading, onWaitingModalClose, onWaitingModalOpen]);

    useEffect(() => {
        if (indexToDelete > -1) {
            let tracksCopy = [...tracks];

            // Stop all the parts in the deleted track
            tracksCopy[indexToDelete].parts.forEach((part) => {
                part.tonePart.stop();
            });

            tracksCopy.splice(indexToDelete, 1);

            setTracks(tracksCopy);

            setIndexToDelete(-1);
        }
    }, [indexToDelete]);

    // Use effect hook that prints selected index whenever it changes
    useEffect(() => {
        console.log("Selected index: " + selectedIndex);
    }, [selectedIndex]);

    const HandleKeyboardEvent = (event: KeyboardEvent) => {
        if (event.keyCode === 32) {
            if (playbackState === 0) setPlaybackState(1);
            else if (playbackState === 2) setPlaybackState(1);
            else if (playbackState === 1) setPlaybackState(2);
        } else if (event.keyCode === 46) {
            // Delete selected track

            setIndexToDelete(selectedIndexRef.current);
            setSelectedIndex(
                selectedIndexRef.current > 0 ? selectedIndexRef.current - 1 : 0
            );
        }
    };

    useEffect(() => {
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

            window.addEventListener("keydown", HandleKeyboardEvent);
            return () => {
                window.removeEventListener("keydown", HandleKeyboardEvent);
            };
        }
    }, [playbackState, isContextStarted]);

    const SetRelease = (value: number) => {
        tracks[selectedIndex].sampler.release = value;
    };

    const SetAttack = (value: number) => {
        tracks[selectedIndex].sampler.attack = value;
    };

    const SetPartTime = (
        trackIndex: number,
        partIndex: number,
        startTime: number,
        endTime: number
    ) => {
        // console.log("SetPartTime", trackIndex, partIndex, startTime, endTime);
        // console.log(tracks)

        Tone.Transport.bpm.value = bpm;
        // console.log("Start time set to: " + startTime);
        // console.log("Stop time set to: " + endTime);
        let tracksCopy = [...tracks];

        tracksCopy[trackIndex].parts[partIndex].tonePart
            .cancel(0)
            .start(startTime)
            .stop(endTime);
        tracksCopy[trackIndex].parts[partIndex].startTime = startTime;
        tracksCopy[trackIndex].parts[partIndex].stopTime = endTime;

        setTracks(tracksCopy);
    };

    const GetPartNote = (note: Note) => {
        const partNote = {
            time: note.startColumn / ((gridDivisions / 4) * (bpm / 60)),
            note: note.key,
            duration: `${note.duration}n`,
            velocity: note.velocity,
        };

        return partNote;
    };

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
        const noteLength = (gridDivisions / 4) * (bpm / 60);

        // Check which part the note is in
        let currentPartIndex = track.parts.findIndex(
            (part) =>
                part.startTime <= (note.startColumn + 1) / noteLength &&
                part.stopTime >= (note.startColumn + 1) / noteLength
        );

        // If the note lies in an existing part, add it to the part
        if (currentPartIndex !== -1) {
            const part = track.parts[currentPartIndex];

            note.startColumn -= part.startTime * noteLength;
            console.log(note.startColumn);

            part.notes.push(note);
            part.tonePart.add(GetPartNote(note));

            track.parts[currentPartIndex] = part;
        }
        // If in not in any existing part, create a new part and add the note to it
        else {
            // TODO: Add snap settings
            const startColumn = GetNewPartStartColumn(note.startColumn);

            // Make the note time relative to the start of the part
            note.startColumn -= startColumn;

            const startTime = startColumn / noteLength;

            const tonePart = new Tone.Part((time, value: any) => {
                track.sampler.triggerAttackRelease(
                    value.note,
                    value.duration,
                    time,
                    value.velocity
                );
            }, []).start(startTime);

            tonePart.add(GetPartNote(note));

            track.parts.push({
                tonePart: tonePart,
                startTime: startTime,
                stopTime: startTime + 8 / noteLength,
                notes: [note],
            });
        }
    };

    // Add a note to the selected track.
    const AddNote = (column: number, row: number, divisor: number) => {
        // console.log("Note added", column, row, divisor);

        const key = MusicNotes[row];

        // We need a copy as we cannot mutate the original
        let tracksCopy = [...tracks];

        const note = {
            startColumn: column,
            noteIndex: row,
            key: key,
            duration: divisor,
            velocity: 1.0,
        };

        AddNoteToTrack(tracksCopy[selectedIndex], note);

        setTracks(tracksCopy);

        // Play the note to give the user feedback
        tracksCopy[selectedIndex].sampler.triggerAttackRelease(
            key,
            `${divisor}n`
        );
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

    const MoveNote = (
        partIndex: number,
        noteIndex: number,
        column: number,
        row: number
    ) => {
        const noteLength = (gridDivisions / 4) * (bpm / 60);

        // console.log("Note moved", partIndex, noteIndex, column, row);

        let part = tracks[selectedIndex].parts[partIndex];
        const key = MusicNotes[row];

        let tracksCopy = [...tracks];

        const note = part.notes[noteIndex];
        note.key = key;
        note.noteIndex = row;
        note.startColumn = column;

        // Tone doesn't allow us to remove or modify single notes, so we need to clear the part and then re-add all the notes except the removed one
        part.tonePart.clear();

        // Check if moved position is within the current part
        if (
            part.startTime <= (note.startColumn + 1) / noteLength &&
            part.stopTime >= (note.startColumn + 1) / noteLength
        ) {
            note.startColumn -= part.startTime * noteLength;
            part.notes[noteIndex] = note;
        }
        // If not then check is there any existing part that the note can be moved to
        else {
            // Remove the note from the current part
            part.notes.splice(noteIndex, 1);

            AddNoteToTrack(tracksCopy[selectedIndex], note);
        }

        // Add back all the notes to the part
        part.notes.forEach((note) => {
            part.tonePart.add(GetPartNote(note));
        });

        tracksCopy[selectedIndex].parts[partIndex] = part;

        setTracks(tracksCopy);

        // Play the changed note to give the user feedback
        tracks[selectedIndex].sampler.triggerAttackRelease(
            key,
            `${note.duration}n`
        );
    };

    const ResizeNote = (
        partIndex: number,
        noteIndex: number,
        duration: number
    ) => {
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

        tracks[selectedIndex].sampler.triggerAttackRelease(
            newNote.key,
            `${duration}n`
        );
        //console.log(parts.current);
    };

    const ClearNotes = () => {
        // Clear all the parts
        tracks[selectedIndex].parts.forEach((part) => {
            part.tonePart.clear();
            part.notes = [];
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
            <NotesModifierContext.Provider
                value={{
                    onAddNote: AddNote,
                    onMoveNote: MoveNote,
                    onRemoveNote: RemoveNote,
                    onResizeNote: ResizeNote,
                    onClearNotes: ClearNotes,
                }}
            >
                <PlaybackContext.Provider
                    value={{ playbackState: playbackState, bpm: bpm }}
                >
                    <Flex
                        height="100vh"
                        width="full"
                        overflow="hidden"
                        flexDirection="column"
                    >
                        <Flex
                            width="100%"
                            height="100%"
                            flexDirection="row"
                            overflow="hidden"
                        >
                            <Splitter initialSizes={[80, 20]}>
                                <Flex
                                    height="100%"
                                    overflow="hidden"
                                    flexDirection="column"
                                    flexGrow={3}
                                >
                                    {/* <SeekContext.Provider value={{ seek: seek, setSeek: setSeek }}> */}
                                    <Splitter
                                        direction={SplitDirection.Vertical}
                                    >
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
                                            setPartTime={SetPartTime}
                                        />

                                        {tracks.length > 0 ? (
                                            <PianoRoll
                                                playbackState={playbackState}
                                                seek={seek}
                                                setSeek={setSeek}
                                                track={tracks[selectedIndex]}
                                                numCols={500}
                                            />
                                        ) : (
                                            <Flex
                                                textColor="white"
                                                fontSize="lg"
                                                alignItems="center"
                                                justifyContent="center"
                                                bgColor="primary.500"
                                                height="full"
                                                width="full"
                                            >
                                                {" "}
                                                Add a Track to view the Piano
                                                Roll{" "}
                                            </Flex>
                                        )}
                                    </Splitter>
                                    {/* </SeekContext.Provider> */}
                                </Flex>
                                <PropertiesPanel
                                    selectedTrack={tracks[selectedIndex]}
                                    numTracks={tracks.length}
                                    setRelease={SetRelease}
                                    setAttack={SetAttack}
                                />
                            </Splitter>
                        </Flex>
                        <PlayBackController
                            playbackState={playbackState}
                            setPlaybackState={setPlaybackState}
                            setBPM={setBPM}
                        />
                    </Flex>
                </PlaybackContext.Provider>
            </NotesModifierContext.Provider>

            <WaitingModal
                onClose={onWaitingModalClose}
                isOpen={isWaitingModalOpen}
            />
        </Fragment>
    );
};

export default Studio;
