module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: 'current',
        },
        loose: true,
        useBuiltIns: false,
      },
    ],
    '@babel/typescript',
  ],
  plugins: ['@babel/proposal-class-properties'],
};
