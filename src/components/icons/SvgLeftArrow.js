import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
const SvgLeftArrow = ({color}) => (
  <Svg fill={color} viewBox="0 0 24 24" height={32} width={32}>
    <Path d="M10.05 16.94v-4h8.92l.03-2.01h-8.95V6.94l-5 5Z" />
  </Svg>
);
export default SvgLeftArrow;
