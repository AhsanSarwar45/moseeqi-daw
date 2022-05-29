import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import {
    useState,
    useEffect,
    useRef,
    Fragment,
    useMemo,
    useId,
    useCallback,
} from "react";
import { SplitDirection } from "@devbookhq/splitter";
import * as Tone from "tone";
import { saveAs } from "file-saver";
import { useHotkeys } from "react-hotkeys-hook";

import { PlayBackController } from "@Components/studio/PlaybackController";
import PianoRoll from "@Components/studio/PianoRoll/PianoRoll";
import TracksView from "@Components/studio/TracksView/TracksView";
import { PropertiesPanel } from "@Components/studio/PropertiesPanel";
import { WaitingModal } from "@Components/WaitingModal";
import { Instruments } from "@Instruments/Instruments";
import { Track } from "@Interfaces/Track";
import { PlaybackState } from "@Types/Types";
import { NotesModifierContext } from "@Data/NotesModifierContext";
import { Note } from "@Interfaces/Note";
import {
    divisionsPerSecond,
    PianoKeys,
    secondsPerDivision,
    wholeNoteDivisions,
} from "@Data/Constants";
import {
    GetNewPartStartTime,
    GetNewPartStopTime,
    GetExtendedPartStopTime,
    CreateTonePart,
    CreatePart,
} from "@Utility/PartUtils";
import Splitter from "@Components/Splitter";
import { Panel } from "@Interfaces/Panel";
import { PartSelectionIndex } from "@Interfaces/Selection";
import { BpmToBps } from "@Utility/TimeUtils";
import { Part } from "@Interfaces/Part";
import { TopBar } from "./TopBar";
import { SaveData, TrackSaveData } from "@Interfaces/SaveData";
import { useNumId } from "@Hooks/useNumId";
import CreateSampler from "@Utility/SamplerUtils";
import { Instrument } from "@Interfaces/Instrument";
import { defaultBPM, defaultName, defaultTrack } from "@Data/Defaults";
import {
    ChangeTrackBpm,
    DisposeTracks,
    GetTracksSaveData,
    SetTrackMute,
    SetTrackSolo,
    SetTrackSoloMute,
} from "@Utility/TrackUtils";
import {
    GetPartNote,
    IsNoteInPart,
    MakeNotePartRelative,
} from "@Utility/NoteUtils";

const Studio = () => {
    //const [ numCols, setNumCols ] = useState(40);
    const [keyMap, setKeyMap] = useState({
        TOGGLE_PLAYBACK: "space",
        DELETE_TRACKS: "delete",
    });
    const [projectName, setProjectName] = useState(defaultName);
    const [playbackState, setPlaybackState] = useState<PlaybackState>(0);
    const [activeWidth, setActiveWidth] = useState(5 * 40);
    const [seek, setSeek] = useState(0);
    const [instrumentsLoading, setInstrumentsLoading] = useState(0);
    const [bpm, setBPM] = useState(defaultBPM);
    const [bps, setBPS] = useState(BpmToBps(defaultBPM));
    const [projectLength, setProjectLength] = useState(180);
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

    const onLoadInstrumentEnd = () => {
        setInstrumentsLoading((prevState) => prevState - 1);
    };

    const CreateTrack = (instrument: Instrument): Track => {
        setInstrumentsLoading(1);

        const meter = new Tone.Meter();

        const sampler = CreateSampler(instrument, onLoadInstrumentEnd)
            .toDestination()
            .connect(meter);

        return {
            name: instrument.name,
            instrument: instrument,
            parts: [],
            sampler: sampler,
            meter: meter,
            muted: false,
            soloed: false,
            soloMuted: false,
        };
    };

    const CreateTrackFromIndex = (instrumentIndex: number): Track => {
        // Causes the loading modal to show

        const instrument = Instruments[instrumentIndex];

        return CreateTrack(instrument);
    };

    const [tracks, setTracks] = useState<Array<Track>>(() => [
        CreateTrackFromIndex(defaultTrack),
    ]);

    useHotkeys(
        keyMap.TOGGLE_PLAYBACK,
        () => {
            TogglePlayback();
        },
        {},
        [playbackState]
    );

    const TogglePlayback = () => {
        // console.log("TogglePlayback", playbackState);
        if (playbackState === 0) setPlaybackState(1);
        else if (playbackState === 2) setPlaybackState(1);
        else if (playbackState === 1) setPlaybackState(2);
    };

    const SaveToFile = () => {
        const tracksSaveData = GetTracksSaveData(tracks);

        const data: SaveData = {
            tracks: tracksSaveData,
            bpm: bpm,
            name: projectName,
        };

        const blob = new Blob([JSON.stringify(data)], {
            type: "text/plain;charset=utf-8",
        });

        saveAs(blob, projectName + ".msq");
    };

    const OpenFile = async (file: File) => {
        const saveData: SaveData = JSON.parse(await file.text());

        DisposeTracks(tracks);

        const newTracks: Array<Track> = [];

        saveData.tracks.forEach((track) => {
            const newTrack = CreateTrack(track.instrument);

            track.parts.forEach((part) => {
                newTrack.parts.push(
                    CreatePart(
                        getPartId(),
                        part.startTime,
                        part.stopTime,
                        newTrack.sampler,
                        [...part.notes]
                    )
                );
            });

            newTracks.push(newTrack);
        });

        // Convert track to current bpm
        ChangeTrackBpm(newTracks, saveData.bpm, bpm);

        pendingBpmUpdateRef.current = saveData.bpm;
        setProjectName(saveData.name);
        setTracks(newTracks);
    };

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
        Tone.Transport.bpm.value = bpm;

        let tracksCopy = [...tracks];
        ChangeTrackBpm(tracksCopy, bps, BpmToBps(bpm));
        setTracks(tracksCopy);

        setBPS(BpmToBps(bpm));
        setCurrentSecondsPerDivision(secondsPerDivision / BpmToBps(bpm));
    }, [bpm]);

    useEffect(() => {
        if (pendingBpmUpdateRef.current > -1) {
            setBPM(pendingBpmUpdateRef.current);
            pendingBpmUpdateRef.current = -1;
        }
    }, [tracks]);

    useEffect(() => {
        if (instrumentsLoading > 0) {
            onWaitingModalOpen();
        } else {
            onWaitingModalClose();
        }
    }, [instrumentsLoading, onWaitingModalClose, onWaitingModalOpen]);

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

    //             } else if (focusedPanel === Panel.TrackSequencer) {
    //                 if (selectedPartIndices.length > 0) {
    //                     let tracksCopy = [...tracks];

    //                     // Stop all the parts to be deleted

    //                     selectedPartIndices.forEach(
    //                         ({ trackIndex, partIndex }) => {
    //                             // console.log(
    //                             //     trackIndex,
    //                             //     partIndex
    //                             // );
    //                             tracksCopy[trackIndex].parts[
    //                                 partIndex
    //                             ].tonePart.cancel(0);

    //                             // Hacky way to mark part to be deleted
    //                             tracksCopy[trackIndex].parts[partIndex] =
    //                                 null as any;
    //                         }
    //                     );

    //                     // Delete all the null parts
    //                     tracksCopy.forEach((track, trackIndex) => {
    //                         tracksCopy[trackIndex].parts = track.parts.filter(
    //                             (part) => part !== null
    //                         );
    //                     });

    //                     setTracks(tracksCopy);
    //                     setSelectedPartIndices([]);
    //                 }
    //             }
    //         }
    //     };

    const SetTrackRelease = (value: number) => {
        tracks[selectedTrackIndex].sampler.release = value;
    };

    const SetTrackAttack = (value: number) => {
        tracks[selectedTrackIndex].sampler.attack = value;
    };

    const PlayNote = (note: Note) => {
        tracks[selectedTrackIndex].sampler.triggerAttackRelease(
            note.key,
            note.duration
        );
    };

    const CreateNewProject = () => {
        DisposeTracks(tracks);

        setTracks([CreateTrackFromIndex(defaultTrack)]);
        setBPM(defaultBPM);
        setProjectName(defaultName);
    };

    const AddTrack = (instrument: number) => {
        // console.log("Track added");

        // setKeyMap((keyMap) => ({
        //     ...keyMap,
        //     ...{ TOGGLE_PLAYBACK: "y" },
        // }));

        // Just to be neat and tidy, reset the timeline
        Tone.Transport.stop();
        Tone.Transport.seconds = 0;

        // We need a copy as we cannot mutate the original
        let tracksCopy = [...tracks];

        tracksCopy.push(CreateTrackFromIndex(instrument));

        setTracks(tracksCopy);
    };

    const DeleteSelectedTrack = () => {
        console.log(tracks.length, selectedTrackIndex);
        if (tracks.length == 0) return;
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
    };

    const ExtendPart = (note: Note, part: Part): Part => {
        part.stopTime = GetExtendedPartStopTime(
            note.stopTime,
            currentSecondsPerDivision
        );
        part.tonePart.cancel(0).start(part.startTime).stop(part.stopTime);

        return part;
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

            track.parts.push(
                CreatePart(
                    getPartId(),
                    partStartTime,
                    partStopTime,
                    track.sampler,
                    [note]
                )
            );
        }
    };

    // Add a note to the selected track.
    const AddNote = (startTime: number, row: number, divisor: number) => {
        // console.log("Note added", column, row, divisor);

        // TODO: inconsistent naming
        const key = PianoKeys[row];

        // We need a copy as we cannot mutate the original
        let tracksCopy = [...tracks];

        const duration =
            (wholeNoteDivisions * currentSecondsPerDivision) / divisor;

        const note = {
            id: getNoteId(),
            startTime: startTime,
            stopTime: startTime + duration,
            keyIndex: row,
            key: key,
            duration: duration,
            velocity: 1.0,
        };

        AddNoteToTrack(tracksCopy[selectedTrackIndex], note);

        setTracks(tracksCopy);

        // Play the note to give the user feedback
        PlayNote(note);
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
        let part = tracks[selectedTrackIndex].parts[partIndex];
        const key = PianoKeys[row];

        let tracksCopy = [...tracks];

        const note = part.notes[noteIndex];
        note.key = key;
        note.keyIndex = row;
        note.startTime = startTime;
        note.stopTime = stopTime;
        note.duration = stopTime - startTime;

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

        // Play the changed note to give the user feedback
        PlayNote(note);
    };

    const ClearNotes = () => {
        let tracksCopy = [...tracks];

        // Clear all the parts
        tracksCopy[selectedTrackIndex].parts.forEach((part) => {
            part.tonePart.clear();
            part.notes = [];
        });

        setTracks(tracksCopy);
    };

    const ToggleMuteAtIndex = (trackIndex: number) => {
        let tracksCopy = [...tracks];
        SetTrackMute(tracksCopy[trackIndex], !tracksCopy[trackIndex].muted);
        setTracks(tracksCopy);
    };

    const ToggleSoloAtIndex = (trackIndex: number) => {
        let tracksCopy = [...tracks];
        SetTrackSolo(
            tracksCopy[trackIndex],
            tracksCopy,
            !tracksCopy[trackIndex].soloed
        );
        setTracks(tracksCopy);
    };

    const DuplicateSelectedTrack = () => {
        setInstrumentsLoading(1);
        let tracksCopy = [...tracks];
        const selectedTrack = tracksCopy[selectedTrackIndex];

        const newTrack = CreateTrack(selectedTrack.instrument);

        selectedTrack.parts.forEach((part) => {
            newTrack.parts.push(
                CreatePart(
                    getPartId(),
                    part.startTime,
                    part.stopTime,
                    newTrack.sampler,
                    [...part.notes]
                )
            );
        });

        tracksCopy.push(newTrack);
        setTracks(tracksCopy);
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
                        onNew={CreateNewProject}
                        onSave={SaveToFile}
                        onOpen={OpenFile}
                        fileName={projectName}
                        onSetFileName={setProjectName}
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
                                        projectLength={projectLength}
                                        setSeek={setSeek}
                                        tracks={tracks}
                                        onDeleteSelectedTrack={
                                            DeleteSelectedTrack
                                        }
                                        onAddTrack={AddTrack}
                                        selected={selectedTrackIndex}
                                        setSelected={setSelectedTrackIndex}
                                        activeWidth={activeWidth}
                                        setActiveWidth={setActiveWidth}
                                        toggleMute={ToggleMuteAtIndex}
                                        toggleSolo={ToggleSoloAtIndex}
                                        onDuplicateSelectedTrack={
                                            DuplicateSelectedTrack
                                        }
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
                                            projectLength={projectLength}
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
                                            Add a Track to view the Piano Roll
                                        </Flex>
                                    )}
                                </Splitter>
                                {/* </SeekContext.Provider> */}
                            </Flex>
                            <PropertiesPanel
                                selectedTrack={tracks[selectedTrackIndex]}
                                numTracks={tracks.length}
                                setRelease={SetTrackRelease}
                                setAttack={SetTrackAttack}
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
