import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect, useRef, Fragment, useMemo, useId } from "react";
import { SplitDirection } from "@devbookhq/splitter";
import * as Tone from "tone";
import { saveAs } from "file-saver";

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
    GetNewPartStartTime,
    GetNewPartStopTime,
    GetExtendedPartStopTime,
} from "@Utility/PartUtils";
import Splitter from "@Components/Splitter";
import { Panel } from "@Interfaces/Panel";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { BpmToBps } from "@Utility/TimeUtils";
import { Part } from "@Interfaces/Part";
import { TopBar } from "./TopBar";
import { SaveData, TrackSaveData } from "@Interfaces/SaveData";
import { useNumId } from "@Hooks/useNumId";

const Studio = () => {
    //const [ numCols, setNumCols ] = useState(40);
    const [fileName, setFileName] = useState("Untitled");
    const [playbackState, setPlaybackState] = useState<PlaybackState>(0);
    const [activeWidth, setActiveWidth] = useState(5 * 40);
    const [seek, setSeek] = useState(0);
    const [isInstrumentLoading, setIsInstrumentLoading] = useState(0);
    const [bpm, setBPM] = useState(defaultBPM);
    const [bps, setBPS] = useState(BpmToBps(defaultBPM));
    const [currentSecondsPerDivision, setCurrentSecondsPerDivision] = useState(
        secondsPerDivision / bps
    );

    const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

    const [selectedPartIndices, setSelectedPartIndices] = useState<
        Array<PartSelectionIndex>
    >([]);

    const [isContextStarted, setIsContextStarted] = useState(false);

    const [focusedPanel, setFocusedPanel] = useState(Panel.None);

    const getPartId = useNumId();
    const getNoteId = useNumId();

    const pendingBpmUpdateRef = useRef<number>(-1);

    const SaveToFile = () => {
        const tracksSaveData: Array<TrackSaveData> = [];

        // the sampler property makes the save data circular so we remove it
        // we also remove the meter property as it is not needed
        tracks.forEach((track) => {
            tracksSaveData.push({
                name: track.name,
                instrument: track.instrument,
                parts: track.parts,
                muted: track.muted,
            });
        });

        const data: SaveData = {
            tracks: tracksSaveData,
            bpm: bpm,
            name: fileName,
        };

        const blob = new Blob([JSON.stringify(data)], {
            type: "text/plain;charset=utf-8",
        });

        saveAs(blob, fileName + ".msq");
    };

    const OpenFile = async (file: File) => {
        const saveData: SaveData = JSON.parse(await file.text());

        tracks.forEach((track) => {
            track.parts.forEach((part) => {
                part.tonePart.dispose();
            });
        });
        const newTracks: Array<Track> = [];

        saveData.tracks.forEach((track) => {
            setIsInstrumentLoading(isInstrumentLoading - 1);
            const meter = new Tone.Meter();

            const sampler = new Tone.Sampler({
                urls: track.instrument.urls as any,
                release: track.instrument.release,
                attack: track.instrument.attack,
                onload: () => {
                    // Causes the loading modal to close
                    setIsInstrumentLoading(isInstrumentLoading - 1);
                },
            })
                .toDestination()
                .connect(meter);

            track.parts.forEach((part) => {
                part.tonePart = new Tone.Part((time, value: any) => {
                    sampler.triggerAttackRelease(
                        value.note,
                        value.duration,
                        time,
                        value.velocity
                    );
                }, [])
                    .start(part.startTime)
                    .stop(part.stopTime);

                part.notes.forEach((note) => {
                    part.tonePart.add(GetPartNote(note));
                });

                part.id = getPartId();
            });

            newTracks.push({
                name: track.name,
                instrument: track.instrument,
                sampler: sampler,
                meter: meter,
                parts: track.parts,
                muted: track.muted,
            });
        });

        setFileName(saveData.name);
        setTracks(newTracks);
        pendingBpmUpdateRef.current = saveData.bpm;
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
                    id: getPartId(),
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
        if (pendingBpmUpdateRef.current > -1) {
            console.log("Updating bpm");
            setBPM(pendingBpmUpdateRef.current);
            pendingBpmUpdateRef.current = -1;
        }
    }, [tracks]);

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
                console.log(focusedPanel);
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
                    setSelectedPartIndices([]);
                    setTracks(tracksCopy);
                } else if (focusedPanel === Panel.TrackSequencer) {
                    if (selectedPartIndices.length > 0) {
                        let tracksCopy = [...tracks];

                        // Stop all the parts to be deleted

                        selectedPartIndices.forEach(
                            ({ trackIndex, partIndex }) => {
                                // console.log(
                                //     trackIndex,
                                //     partIndex
                                // );
                                tracksCopy[trackIndex].parts[
                                    partIndex
                                ].tonePart.cancel(0);

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

    const GetNoteStopTime = (note: Note): number => {
        return (
            note.startTime +
            (wholeNoteDivisions * currentSecondsPerDivision) / note.duration
        );
    };

    const SetPartTime = (
        trackIndex: number,
        partIndex: number,
        startTime: number,
        endTime: number
    ) => {
        // console.log("SetPartTime", trackIndex, partIndex, startTime, endTime);

        Tone.Transport.bpm.value = bpm;
        // console.log("Start time set to: " + startTime);
        // console.log("Stop time set to: " + endTime);
        let tracksCopy = [...tracks];

        // console.log(tracksCopy[trackIndex].parts[partIndex]);
        // console.log(tracksCopy[trackIndex].parts[partIndex].tonePart);

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
            time: note.startTime,
            note: note.key,
            duration: note.duration,
            velocity: note.velocity,
        };

        return partNote;
    };

    const IsNoteInPart = (note: Note, part: Part) => {
        // const noteStartTime = note.startColumn * currentSecondsPerDivision;
        console.log(
            note.startTime,
            note.stopTime,
            part.startTime,
            part.stopTime
        );
        return (
            part.startTime <= note.startTime && part.stopTime > note.startTime
        );
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

    const ExtendPart = (note: Note, part: Part): Part => {
        part.stopTime = GetExtendedPartStopTime(
            note.stopTime,
            currentSecondsPerDivision
        );
        part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);

        return part;
    };

    const MakeNotePartRelative = (note: Note, part: Part) => {
        note.startTime -= part.startTime;
        note.stopTime -= part.startTime;
    };

    const AddNoteToTrack = (track: Track, note: Note) => {
        // Check which part the note is in
        let currentPartIndex = track.parts.findIndex((part) =>
            IsNoteInPart(note, part)
        );

        // If the note lies in an existing part, add it to the part
        if (currentPartIndex !== -1) {
            let part = track.parts[currentPartIndex];

            // if the end of the note lies beyond the end of the part, extend the part
            if (note.stopTime > part.stopTime) {
                ExtendPart(note, part);
            }

            MakeNotePartRelative(note, part);

            part.notes.push(note);
            part.tonePart.add(GetPartNote(note));

            track.parts[currentPartIndex] = part;
        }
        // If in not in any existing part, create a new part and add the note to it
        else {
            // TODO: Add snap settings
            const partStartTime = GetNewPartStartTime(
                note.startTime,
                currentSecondsPerDivision
            );
            const partStopTime = GetNewPartStopTime(
                note.stopTime,
                currentSecondsPerDivision
            );

            // Make the note time relative to the start of the part
            note.startTime -= partStartTime;

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
                id: getPartId(),
                tonePart: tonePart,
                startTime: partStartTime,
                stopTime: partStopTime,
                notes: [note],
            });
        }
    };

    // Add a note to the selected track.
    const AddNote = (startTime: number, row: number, divisor: number) => {
        // console.log("Note added", column, row, divisor);

        // TODO: inconsistent naming
        const key = MusicNotes[row];

        // We need a copy as we cannot mutate the original
        let tracksCopy = [...tracks];

        const duration =
            (wholeNoteDivisions * currentSecondsPerDivision) / divisor;

        const note = {
            id: getNoteId(),
            startTime: startTime,
            stopTime: startTime + duration,
            noteIndex: row,
            bps: bps,
            key: key,
            duration: duration,
            velocity: 1.0,
        };

        AddNoteToTrack(tracksCopy[selectedTrackIndex], note);

        setTracks(tracksCopy);

        // Play the note to give the user feedback
        tracksCopy[selectedTrackIndex].sampler.triggerAttackRelease(
            key,
            duration
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
        startTime: number,
        stopTime: number,
        row: number
    ) => {
        // console.log("Note moved to", startTime);
        let part = tracks[selectedTrackIndex].parts[partIndex];
        const key = MusicNotes[row];

        let tracksCopy = [...tracks];

        const note = part.notes[noteIndex];
        note.key = key;
        note.noteIndex = row;
        note.startTime = startTime;
        note.stopTime = stopTime;
        note.duration = (stopTime - startTime) * (note.bps / bps);
        note.bps = bps;

        // Tone doesn't allow us to remove or modify single notes, so we need to clear the part and then re-add all the notes except the removed one
        part.tonePart.clear();

        // Check if moved position is within the current part
        if (IsNoteInPart(note, part)) {
            // if the end of the note lies beyond the end of the part, extend the part
            if (note.stopTime > part.stopTime) {
                ExtendPart(note, part);
            }
            MakeNotePartRelative(note, part);

            part.notes[noteIndex] = note;
        } else {
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

        console.log(note);

        // Play the changed note to give the user feedback
        tracks[selectedTrackIndex].sampler.triggerAttackRelease(
            key,
            note.duration
        );
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
                    onClearNotes: ClearNotes,
                }}
            >
                <Flex
                    height="100vh"
                    width="full"
                    overflow="hidden"
                    flexDirection="column"
                >
                    <TopBar
                        onSave={SaveToFile}
                        onOpen={OpenFile}
                        fileName={fileName}
                        onSetFileName={setFileName}
                    />
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
                                <Splitter direction={SplitDirection.Vertical}>
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
                                            track={tracks[selectedTrackIndex]}
                                            numCols={500}
                                            focusedPanel={focusedPanel}
                                            setFocusedPanel={setFocusedPanel}
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
                                            Add a Track to view the Piano Roll{" "}
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
                        bpm={bpm}
                    />
                </Flex>
            </NotesModifierContext.Provider>

            <WaitingModal
                onClose={onWaitingModalClose}
                isOpen={isWaitingModalOpen}
            />
        </Fragment>
    );
};

export default Studio;
