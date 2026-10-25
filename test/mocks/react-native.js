module.exports = {
  Platform: {
    OS: 'android',
    select: (objs) => objs.android || objs.default,
  },
  NativeModules: {
    AudioConverter: {
      convertM4aToWav: jest.fn(async (input, output) => output || input),
    },
  },
};

