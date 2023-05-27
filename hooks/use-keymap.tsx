import { selectFocusArea, useFocusAreaStore } from "@data/stores/focus-area";
import { selectKeymap, useKeymapStore } from "@data/stores/keymap";
import { Panel } from "@interfaces/enums/panel";
import { KeyAction } from "@interfaces/keymap";
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
