import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SvgRoteteArrow = ({color}) => (
  <Svg fill={color} viewBox="0 0 24 24" height={32} width={32}>
    <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m6 9h-5l1.81-1.81A3.94 3.94 0 0 0 12 8a4 4 0 1 0 3.86 5h2.05A6 6 0 1 1 12 6a5.91 5.91 0 0 1 4.22 1.78L18 6Z" />
  </Svg>
);
export default SvgRoteteArrow;
