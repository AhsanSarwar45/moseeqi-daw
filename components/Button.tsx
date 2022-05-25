import React from "react";
import { Button as ChakraButton, Tooltip } from "@chakra-ui/react";

interface ButtonProps {
    onClick: (event: any) => void;
    label: string;
    ariaLabel: string;
    icon: React.ReactNode;
    tooltip: string;
}

const TooltipButton = (props: ButtonProps) => {
    return (
        <Tooltip label={props.tooltip}>
            <ChakraButton
                aria-label="Save project"
                colorScheme={"secondary"}
                onClick={props.onClick}
                size="sm"
                fontWeight={400}
                fontSize="md"
                leftIcon={props.icon as any}
            >
                {props.label}
            </ChakraButton>
        </Tooltip>
    );
};

export default TooltipButton;
