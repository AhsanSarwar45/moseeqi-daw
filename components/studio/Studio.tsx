import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect, useRef, Fragment, useMemo } from "react";
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
import {
    defaultBPM,
    divisionsPerSecond,
    secondsPerDivision,
    wholeNoteDivisions,
} from "@Data/Constants";
import {
    GetNewPartStartColumn,
    GetNewPartStopColumn,
} from "@Utility/PartUtils";
import { PlaybackContext } from "@Data/PlaybackContext";
import Splitter from "@Components/Splitter";
import { Panel } from "@Interfaces/Panel";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { BpmToBps } from "@Utility/TimeUtils";
import { Part } from "@Interfaces/Part";

const Studio = () => {
    //const [ numCols, setNumCols ] = useState(40);
    const [playbackState, setPlaybackState] = useState<PlaybackState>(0);
    const [activeWidth, setActiveWidth] = useState(5 * 40);
    const [seek, setSeek] = useState(0);
    const [isInstrumentLoading, setIsInstrumentLoading] = useState(0);
    const [bpm, setBPM] = useState(defaultBPM);
    const [bps, setBPS] = useState(BpmToBps(defaultBPM));
    const [currentSecondsPerDivision, setCurrentSecondsPerDivision] = useState(
        secondsPerDivision / bps
    );

    const playbackContextValue = useMemo(
        () => ({
            playbackState,
            bpm,
        }),
        [bpm, playbackState]
    );

    const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

    const [selectedPartIndices, setSelectedPartIndices] = useState<
        Array<PartSelectionIndex>
    >([]);

    const [isContextStarted, setIsContextStarted] = useState(false);

    const [focusedPanel, setFocusedPanel] = useState(Panel.None);

    const currentPartId = useRef(0);

    const SaveToFile = () => {
        const data = {
            tracks: tracks,
            bpm: bpm,
            seek: seek,
        };
        const file = new File([JSON.stringify(data)], "saveData.json", {
            type: "text/plain;charset=utf-8",
        });

        console.log(file);
    };

    const CreateTrack = (instrumentIndex: number) => {
        // Causes the loading modal to show
        setIsInstrumentLoading(1);
        const instrument = Instruments[instrumentIndex];
        const noteLength = (wholeNoteDivisions / 4) * (bpm / 60);

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
                    id: currentPartId.current++,
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
        setBPS(BpmToBps(bpm));
        setCurrentSecondsPerDivision(secondsPerDivision / BpmToBps(bpm));
    }, [bpm]);

    useEffect(() => {
        if (isInstrumentLoading > 0) {
            onWaitingModalOpen();
        } else {
            onWaitingModalClose();
        }
    }, [isInstrumentLoading, onWaitingModalClose, onWaitingModalOpen]);

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
        }
    }, [playbackState, isContextStarted]);

    useEffect(() => {
        // console.log("event listener update");
        const HandleKeyboardEvent = (event: KeyboardEvent) => {
            if (event.keyCode === 32) {
                // Space key
                if (playbackState === 0) setPlaybackState(1);
                else if (playbackState === 2) setPlaybackState(1);
                else if (playbackState === 1) setPlaybackState(2);
            } else if (event.keyCode === 46) {
                // Delete key
                if (focusedPanel === Panel.TrackView) {
                    let tracksCopy = [...tracks];

                    // Stop all the parts in the deleted track
                    tracksCopy[selectedTrackIndex].parts.forEach((part) => {
                        part.tonePart.stop();
                    });

                    tracksCopy.splice(selectedTrackIndex, 1);

                    setSelectedTrackIndex(
                        selectedTrackIndex > 0 ? selectedTrackIndex - 1 : 0
                    );
                    setTracks(tracksCopy);
                } else if (focusedPanel === Panel.TrackSequencer) {
                    if (selectedPartIndices.length > 0) {
                        let tracksCopy = [...tracks];

                        console.log(selectedPartIndices);
                        console.log(tracksCopy);

                        // Stop all the parts to be deleted

                        selectedPartIndices.forEach(
                            ({ trackIndex, partIndex }) => {
                                // console.log(
                                //     trackIndex,
                                //     partIndex
                                // );
                                tracksCopy[trackIndex].parts[
                                    partIndex
                                ].tonePart.stop();

                                // Hacky way to mark part to be deleted
                                tracksCopy[trackIndex].parts[partIndex] =
                                    null as any;
                            }
                        );

                        // Delete all the null parts
                        tracksCopy.forEach((track, trackIndex) => {
                            tracksCopy[trackIndex].parts = track.parts.filter(
                                (part) => part !== null
                            );
                        });

                        setTracks(tracksCopy);
                        setSelectedPartIndices([]);
                    }
                }
            }
        };

        window.addEventListener("keydown", HandleKeyboardEvent);
        return () => {
            window.removeEventListener("keydown", HandleKeyboardEvent);
        };
    }, [
        tracks,
        selectedTrackIndex,
        playbackState,
        focusedPanel,
        selectedPartIndices,
    ]);

    const SetRelease = (value: number) => {
        tracks[selectedTrackIndex].sampler.release = value;
    };

    const SetAttack = (value: number) => {
        tracks[selectedTrackIndex].sampler.attack = value;
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
            time: note.startColumn / ((wholeNoteDivisions / 4) * bps),
            note: note.key,
            duration: `${note.duration}n`,
            velocity: note.velocity,
        };

        return partNote;
    };

    const IsNoteInPart = (note: Note, part: Part) => {
        const noteStartTime = note.startColumn * currentSecondsPerDivision;

        console.log(noteStartTime, part.startTime, part.stopTime);

        return part.startTime <= noteStartTime && part.stopTime > noteStartTime;
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
        const noteStopColumn =
            note.startColumn + wholeNoteDivisions / note.duration;

        const noteStopTime = noteStopColumn * currentSecondsPerDivision;

        // Check which part the note is in
        let currentPartIndex = track.parts.findIndex((part) =>
            IsNoteInPart(note, part)
        );

        // If the note lies in an existing part, add it to the part
        if (currentPartIndex !== -1) {
            const part = track.parts[currentPartIndex];

            note.startColumn -= part.startTime / currentSecondsPerDivision;

            part.notes.push(note);
            part.tonePart.add(GetPartNote(note));

            // if the end of the note lies beyond the end of the part, extend the part
            if (noteStopTime > part.stopTime) {
                part.stopTime = noteStopTime;
                part.tonePart
                    .cancel(0)
                    .start(part.startTime)
                    .stop(part.stopTime);
            }

            track.parts[currentPartIndex] = part;
        }
        // If in not in any existing part, create a new part and add the note to it
        else {
            // TODO: Add snap settings
            const partStartColumn = GetNewPartStartColumn(note.startColumn);
            const partStopColumn = GetNewPartStopColumn(noteStopColumn);

            // Make the note time relative to the start of the part
            note.startColumn -= partStartColumn;

            const partStartTime = partStartColumn * currentSecondsPerDivision;
            const partStopTime = partStopColumn * currentSecondsPerDivision;

            const tonePart = new Tone.Part((time, value: any) => {
                track.sampler.triggerAttackRelease(
                    value.note,
                    value.duration,
                    time,
                    value.velocity
                );
            }, []).start(partStartTime);

            tonePart.add(GetPartNote(note));

            track.parts.push({
                id: currentPartId.current++,
                tonePart: tonePart,
                startTime: partStartTime,
                stopTime: partStopTime,
                notes: [note],
            });
        }
    };

    // Add a note to the selected track.
    const AddNote = (column: number, row: number, divisor: number) => {
        // console.log("Note added", column, row, divisor);

        // TODO: inconsistent naming
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

        AddNoteToTrack(tracksCopy[selectedTrackIndex], note);

        setTracks(tracksCopy);

        // Play the note to give the user feedback
        tracksCopy[selectedTrackIndex].sampler.triggerAttackRelease(
            key,
            `${divisor}n`
        );
    };

    const RemoveNote = (partIndex: number, noteIndex: number) => {
        let part = tracks[selectedTrackIndex].parts[partIndex];

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

        tracksCopy[selectedTrackIndex].parts[partIndex] = part;

        setTracks(tracksCopy);
    };

    const MoveNote = (
        partIndex: number,
        noteIndex: number,
        column: number,
        row: number
    ) => {
        // console.log("Note moved", partIndex, noteIndex, column, row);

        let part = tracks[selectedTrackIndex].parts[partIndex];
        const key = MusicNotes[row];

        let tracksCopy = [...tracks];

        const note = part.notes[noteIndex];
        note.key = key;
        note.noteIndex = row;
        note.startColumn = column;

        // Tone doesn't allow us to remove or modify single notes, so we need to clear the part and then re-add all the notes except the removed one
        part.tonePart.clear();

        // Check if moved position is within the current part
        if (IsNoteInPart(note, part)) {
            note.startColumn -= part.startTime / currentSecondsPerDivision;
            part.notes[noteIndex] = note;
        }
        // If not then check is there any existing part that the note can be moved to
        else {
            // Remove the note from the current part
            part.notes.splice(noteIndex, 1);

            AddNoteToTrack(tracksCopy[selectedTrackIndex], note);
        }

        // Add back all the notes to the part
        part.notes.forEach((note) => {
            part.tonePart.add(GetPartNote(note));
        });

        tracksCopy[selectedTrackIndex].parts[partIndex] = part;

        setTracks(tracksCopy);

        // Play the changed note to give the user feedback
        tracks[selectedTrackIndex].sampler.triggerAttackRelease(
            key,
            `${note.duration}n`
        );
    };

    const ResizeNote = (
        partIndex: number,
        noteIndex: number,
        duration: number
    ) => {
        let part = tracks[selectedTrackIndex].parts[partIndex];

        // Tone doesn't allow us to remove or modify single notes, so we need to clear the part and then re-add all the notes except the removed one
        part.tonePart.clear();

        let tracksCopy = [...tracks];

        const newNote = part.notes[noteIndex];
        newNote.duration = duration;
        part.notes[noteIndex] = newNote;

        part.notes.forEach((note) => {
            part.tonePart.add(GetPartNote(note));
        });

        tracksCopy[selectedTrackIndex].parts[partIndex] = part;
        setTracks(tracksCopy);

        tracks[selectedTrackIndex].sampler.triggerAttackRelease(
            newNote.key,
            `${duration}n`
        );
        //console.log(parts.current);
    };

    const ClearNotes = () => {
        // Clear all the parts
        tracks[selectedTrackIndex].parts.forEach((part) => {
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
                <PlaybackContext.Provider value={playbackContextValue}>
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
                                            bpm={bpm}
                                            seek={seek}
                                            setSeek={setSeek}
                                            tracks={tracks}
                                            onAddTrack={AddTrack}
                                            selected={selectedTrackIndex}
                                            setSelected={setSelectedTrackIndex}
                                            activeWidth={activeWidth}
                                            setActiveWidth={setActiveWidth}
                                            toggleMute={ToggleMuteAtIndex}
                                            setPartTime={SetPartTime}
                                            focusedPanel={focusedPanel}
                                            setFocusedPanel={setFocusedPanel}
                                            selectedPartIndices={
                                                selectedPartIndices
                                            }
                                            setSelectedPartIndices={
                                                setSelectedPartIndices
                                            }
                                            setTracks={setTracks}
                                        />

                                        {tracks.length > 0 ? (
                                            <PianoRoll
                                                bpm={bpm}
                                                playbackState={playbackState}
                                                seek={seek}
                                                setSeek={setSeek}
                                                track={
                                                    tracks[selectedTrackIndex]
                                                }
                                                numCols={500}
                                                focusedPanel={focusedPanel}
                                                setFocusedPanel={
                                                    setFocusedPanel
                                                }
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
                                    selectedTrack={tracks[selectedTrackIndex]}
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
