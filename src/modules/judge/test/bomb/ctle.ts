

const input = `1 2
`;
const output = `3
`;
const usrCode = `
#include </dev/random>
`;

const expectResult = 'time-limit-exceeded'

export default {
  name: 'bomb-compiler-tle',
  usrCode,
  input,
  output,
  expectResult,
  lang: 'c'
}
