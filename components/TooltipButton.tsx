import React from "react";
import { Button, Spacer, Tooltip } from "@chakra-ui/react";

interface ButtonProps {
    onClick: (event: any) => void;
    label: string;
    "aria-label"?: string;
    icon?: React.ReactNode;
    tooltip?: string;
    fontSize?: string;
    size?: string;
    textColor?: string;
}

const TooltipButton = (props: ButtonProps) => {
    return (
        <Tooltip label={props.tooltip}>
            <Button
                aria-label={props["aria-label"]}
                colorScheme={"secondary"}
                onClick={props.onClick}
                size={props.size}
                fontWeight={400}
                textColor={props.textColor}
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
    icon: null,
    textColor: "white",
    tooltip: "",
    "aria-label": "",
};

export default TooltipButton;
