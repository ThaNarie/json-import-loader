module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: '12',
        },
        loose: true,
        useBuiltIns: false,
      },
    ],
    '@babel/typescript',
  ],
  plugins: ['@babel/proposal-class-properties'],
};
