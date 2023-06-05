import { Box, Button, IconButton, Tooltip } from "@chakra-ui/react";
import { Dimension } from "@custom-types/types";
import React, { forwardRef, HTMLAttributes, ReactNode } from "react";

interface ToggleButtonProps extends HTMLAttributes<HTMLDivElement> {
    tooltipLabel: string;
    onClick: () => void;
    label?: string;
    // children: React.ReactNode;
    isToggled: boolean;
    icon?: ReactNode;
    borderWidth?: Dimension;
    size?: string;
    borderColor?: string;
    onColor?: string;
    offColor?: string;
    textColor?: string;
}

const ToggleButton = forwardRef(
    (
        {
            children,
            tooltipLabel,
            onClick,
            isToggled,
            icon,
            label,
            size,
            borderColor,
            onColor,
            offColor,
            borderWidth,
            textColor,
            ...rest
        }: ToggleButtonProps,
        ref
    ) => {
        return (
            <Tooltip label={tooltipLabel}>
                <Box padding={0} {...rest} ref={ref as any}>
                    <Button
                        colorScheme={"secondary"}
                        borderWidth={borderWidth}
                        borderColor={borderColor}
                        bgColor={isToggled ? onColor : offColor}
                        onClick={onClick}
                        textColor={textColor}
                        _hover={{
                            bg: isToggled ? onColor : offColor,
                        }}
                        _focus={{
                            boxShadow: "none",
                        }}
                        size={size}
                        gap={1}
                        // fontSize={8}
                        padding={(label?.length as number) > 1 ? 2 : 0}
                        // icon={icon as any}
                    >
                        {icon}
                        {label}
                    </Button>
                </Box>
            </Tooltip>
        );
    }
);

ToggleButton.displayName = "ToggleButton";

ToggleButton.defaultProps = {
    borderWidth: 1,
    label: "",
    icon: null,
    size: "sm",
    borderColor: "secondary.500",
    onColor: "secondary.500",
    offColor: "rgba(0,0,0,0)",
    textColor: "white",
};

export default ToggleButton;
