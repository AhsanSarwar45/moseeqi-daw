
// import { Box } from '@chakra-ui/react'
// import React from 'react'
// import ReactRuler from '@scena/react-ruler';
// import TimeLineHandle from './TimeLineHandle';


// interface RulerProps{
//     scale: number;
//     seek: number;
//     setSeek: (seek: number) => void;
//     left:number|string;
//     width:number|string;
//     height:number|string;
//     playbackState: number;
    
// }

// const Ruler = (props:RulerProps) => {

//   return (
//       <Box position="absolute" left={props.stickyWidth} height={props.stickyHeight} width={props.headerWidth}>
//           <TimeLineHandle playbackState={props.playbackState} seek={props.seek} scale={12} setSeek={props.setSeek} />
//           <ReactRuler type="horizontal" unit={1} zoom={120} backgroundColor={theme.colors.primary[600]} />
//       </Box>
//   )
// }

// export default Ruler