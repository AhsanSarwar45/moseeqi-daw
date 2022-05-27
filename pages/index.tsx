import { NextPage } from "next";
import NextLink from "next/link";
import { Navbar } from "@Components/NavBar";
import { Box, Button, Container, Flex, Link, VStack } from "@chakra-ui/react";
import MoseeqiLogo from "@Components/icons/MoseeqiLogo";
import { useTheme } from "@chakra-ui/react";

const Landing: NextPage = () => {
    const theme = useTheme();

    return (
        <VStack
            gap="5%"
            bgColor="primary.500"
            width="full"
            height="100%"
            padding={0}
            alignItems="center"
            justifyContent="center"
        >
            <MoseeqiLogo
                width="10rem"
                height="10rem"
                fillOpacity={0}
                stroke={"brand.secondary"}
                strokeWidth="0.5rem"
            />
            <NextLink href={"/studio"}>
                <Link fontSize={24} textColor="white">
                    Enter Studio
                </Link>
            </NextLink>
        </VStack>
    );
};

export default Landing;
