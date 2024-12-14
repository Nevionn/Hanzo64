import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SvgDotsVertical = ({color}) => (
  <Svg fill={color} viewBox="0 0 24 24" height={25} width={25}>
    <Path d="M12 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2Z" />
  </Svg>
);
export default SvgDotsVertical;
