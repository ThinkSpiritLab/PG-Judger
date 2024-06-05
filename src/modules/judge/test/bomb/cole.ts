const input = `1 2
`;
const output = `3
`;
const usrCode = `
int main[-1u]={1};
`;

// export const BOMBCOLE = generateNormalSelfTest("BOMBCOLE", "c", usrCode, {}, [
//     {
//         type: "direct",
//         input,
//         output,
//         expectResultType: JudgeResultKind.CompileError,
//         count: false,
//     },
// ]);
const expectResult = 'compile-error'

export default {
  name: 'bomb-compiler-ole',
  usrCode,
  input,
  output,
  expectResult,
  lang: 'c'
}
