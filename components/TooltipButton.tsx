import React from "react";
import { Button, Spacer, Tooltip } from "@chakra-ui/react";

interface ButtonProps {
    onClick: (event: any) => void;
    label: string;
    ariaLabel: string;
    icon: React.ReactNode;
    tooltip: string;
    fontSize?: string;
    size?: string;
}

const TooltipButton = (props: ButtonProps) => {
    return (
        <Tooltip label={props.tooltip}>
            <Button
                aria-label="Save project"
                colorScheme={"secondary"}
                onClick={props.onClick}
                size={props.size}
                fontWeight={400}
                fontSize={props.fontSize}
                padding={props.label !== "" ? 2 : 0}
                gap={1}
            >
                {props.icon}
                {props.label}
            </Button>
        </Tooltip>
    );
};

TooltipButton.defaultProps = {
    fontSize: "md",
    size: "sm",
};

export default TooltipButton;
