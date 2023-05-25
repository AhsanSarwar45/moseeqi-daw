import {
    Menu,
    MenuButton,
    Icon,
    MenuList,
    MenuOptionGroup,
    ButtonGroup,
} from "@chakra-ui/react";
import ToggleButton from "@Components/ToggleButton";
import { noteLengthOptions } from "@data/Constants";
import React from "react";
import { BiChevronDown } from "react-icons/bi";

interface SnapSettingsProps {
    snapWidthIndex: number;
    setSnapWidthIndex: (snapWidth: number) => void;
}

const SnapSettings = (props: SnapSettingsProps) => {
    return (
        <Menu colorScheme="primary">
            <MenuButton
                textColor="text.primary"
                borderWidth={1}
                borderRightRadius="sm"
                borderLeftWidth={0}
                borderColor="secondary.500"
                height="2rem"
            >
                <Icon color="text.white" as={BiChevronDown} />
            </MenuButton>

            <MenuList
                bgColor="primary.500"
                marginTop={0}
                paddingX={2}
                paddingY={2}
            >
                <MenuOptionGroup
                    marginTop={0}
                    marginLeft={0}
                    defaultValue="asc"
                    title="Snap To"
                    textColor="text.primary"

                    // paddingLe
                >
                    <ButtonGroup
                        size="sm"
                        isAttached
                        variant="solid"
                        colorScheme="secondary"
                    >
                        {noteLengthOptions.map((option, index) => {
                            // const name = value;
                            return (
                                <ToggleButton
                                    tooltipLabel={option.name}
                                    key={option.name}
                                    onClick={() =>
                                        props.setSnapWidthIndex(index)
                                    }
                                    icon={option.icon}
                                    isToggled={index === props.snapWidthIndex}
                                    // borderWidth={0}
                                />
                            );
                        })}
                    </ButtonGroup>
                </MenuOptionGroup>
            </MenuList>
        </Menu>
    );
};

export default SnapSettings;
