// babel.config.js
module.exports = {
  presets: [
    ['next/babel', {
      'styled-jsx': {
        // Voor CSS-in-JS support
      }
    }]
  ],
  plugins: [
    [
      'import',
      {
        libraryName: 'antd',
        style: true, // of 'css' als je CSS wilt
      },
    ],
    // Voeg andere transformaties toe indien nodig
  ],
};
