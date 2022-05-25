import { Box, IconButton, Tooltip } from "@chakra-ui/react";
import { Dimension } from "@Types/Types";
import React, { forwardRef, HTMLAttributes, ReactNode } from "react";

interface ToggleButtonProps extends HTMLAttributes<HTMLDivElement> {
    tooltipLabel: string;
    onClick: () => void;
    // children: React.ReactNode;
    isToggled: boolean;
    icon: ReactNode;
    borderWidth?: Dimension;
}

const ToggleButton = forwardRef(
    (
        {
            children,
            tooltipLabel,
            onClick,
            isToggled,
            icon,
            borderWidth,
            ...rest
        }: ToggleButtonProps,
        ref
    ) => {
        return (
            <Tooltip label={tooltipLabel}>
                <Box padding={0} {...rest} ref={ref as any}>
                    <IconButton
                        aria-label="Clear notes"
                        colorScheme={"secondary"}
                        borderWidth={borderWidth}
                        borderColor="secondary.500"
                        bgColor={isToggled ? "secondary.500" : "primary.500"}
                        onClick={onClick}
                        _hover={{
                            bg: isToggled ? "secondary.500" : "primary.500",
                        }}
                        _focus={{
                            boxShadow: "none",
                        }}
                        size="sm"
                        icon={icon as any}
                    />
                </Box>
            </Tooltip>
        );
    }
);

ToggleButton.displayName = "ToggleButton";

ToggleButton.defaultProps = {
    borderWidth: 1,
};

export default ToggleButton;
