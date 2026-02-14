/**
 * reanimated/plugin по требованию библиотеки, должен идти в конце зависимостей
 */

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['@babel/plugin-transform-private-methods', {loose: true}],
    'react-native-reanimated/plugin',
  ],
};
