import { IconButton } from "@chakra-ui/react";
import React from "react";

interface ToggleButtonProps {
    onClick: () => void;
    // children: React.ReactNode;
    isToggled: boolean;
    icon: React.ReactNode;
}

const ToggleButton = (props: ToggleButtonProps) => {
    return (
        <IconButton
            aria-label="Clear notes"
            colorScheme={"secondary"}
            borderWidth="1px"
            borderColor="secondary.500"
            bgColor={props.isToggled ? "secondary.500" : "primary.500"}
            onClick={props.onClick}
            size="sm"
            icon={props.icon as any}
        />
    );
};

export default ToggleButton;
