import { selectFocusArea, useFocusAreaStore } from "@Data/FocusAreaStore";
import { selectKeymap, useKeymapStore } from "@Data/KeymapStore";
import { Panel } from "@Interfaces/enums/Panel";
import { KeyAction } from "@Interfaces/Keymap";
import { useHotkeys } from "react-hotkeys-hook";

const useKeyMap = (action: KeyAction, callback: Function | undefined) => {
    const keyMaps = useKeymapStore(selectKeymap);
    const focusArea = useFocusAreaStore(selectFocusArea);

    useHotkeys(
        keyMaps[action].key,
        () => {
            if (
                keyMaps[action].scope === focusArea ||
                keyMaps[action].scope === Panel.None
            ) {
                // console.log(action, focusArea);
                if (callback !== undefined) {
                    callback();
                }
            }
        },
        {},
        [focusArea]
    );
};

export default useKeyMap;
