import React from 'react'
import { HotKeys } from 'react-hotkeys-ce';

interface TracksInfoViewProps {
    tracks: Track[];


const TracksInfoView = () => {
  return (
      <HotKeys keyMap={keyMap}>
          <VStack
              spacing={0}
              position="sticky"
              // height={90 * props.tracks.length}
              left={0}
              zIndex={500}
          >
              <HStack
                  paddingX={1}
                  height={30}
                  // width="full"
                  spacing={1}
                  justifyContent="flex-start"
                  bgColor="primary.500"
                  borderBottom="1px solid gray"
                  position="sticky"
                  top={0}
                  left={0}
                  width={200}
                  zIndex={9300}
              >
                  <TooltipButton
                      aria-label="Add track"
                      onClick={onOpen}
                      label=""
                      icon={<Icon as={TiPlus} />}
                      tooltip="Add track"
                      fontSize="xs"
                      size="xs"
                  />
                  <TooltipButton
                      aria-label="Duplicate track"
                      onClick={props.onDuplicateSelectedTrack}
                      label=""
                      icon={<Icon as={BiDuplicate} />}
                      tooltip="Duplicate selected track"
                      fontSize="xs"
                      size="xs"
                  />
              </HStack>
              {props.tracks.map((track: Track, index: number) => (
                  <HStack
                      key={index}
                      color="white"
                      paddingY={2}
                      paddingX={2}
                      width={200}
                      height={90}
                      bgColor={
                          props.selected === index
                              ? "primary.700"
                              : "primary.500"
                      }
                      boxSizing="border-box"
                      borderBottomWidth={1}
                      borderColor={"gray.500"}
                      onMouseDown={(event) => {
                          props.setSelected(index);
                      }}
                      // height={200}
                      position="relative"
                      alignItems="flex-start"
                  >
                      <VStack alignItems="flex-start">
                          <Text color="white">{track.name}</Text>

                          <HStack>
                              <ToggleButton
                                  tooltipLabel={"Mute"}
                                  onClick={() => props.toggleMute(index)}
                                  isToggled={track.muted}
                                  label="M"
                                  borderWidth={1}
                                  size="xs"
                                  textColor={
                                      track.soloMuted
                                          ? "secondary.500"
                                          : "white"
                                  }
                                  // borderColor="secondary.700"
                                  // onColor="secondary.700"
                                  // offColor="secondary.500"
                              />
                              <ToggleButton
                                  tooltipLabel={"Solo"}
                                  onClick={() => props.toggleSolo(index)}
                                  isToggled={track.soloed}
                                  label="S"
                                  borderWidth={1}
                                  size="xs"
                                  // borderColor="secondary.700"
                                  // onColor="secondary.700"
                                  // offColor="secondary.500"
                              />
                              {/* <Button
                                        width="20px"
                                        borderColor="secondary.700"
                                        borderWidth="1px"
                                        bgColor={
                                            track.muted
                                                ? "secondary.700"
                                                : "secondary.500"
                                        }
                                        colorScheme="secondary"
                                        size="xs"
                                        flexShrink={0}
                                        borderRadius="sm"
                                        onClick={() => props.toggleMute(index)}
                                    >
                                        M
                                    </Button> */}
                              {/* <Button
                                        width="20px"
                                        borderColor="secondary.700"
                                        borderWidth="1px"
                                        colorScheme="secondary"
                                        size="xs"
                                        flexShrink={0}
                                        borderRadius="sm"
                                    >
                                        S
                                    </Button> */}
                          </HStack>
                      </VStack>
                      <Meter
                          width="10px"
                          meter={track.meter}
                          bgColor="brand.primary"
                          fillColor="brand.accent1"
                          borderColor="primary.700"
                          borderWidth="1px"
                      />
                  </HStack>
              ))}
          </VStack>
      </HotKeys>
  );
}

export default TracksInfoView