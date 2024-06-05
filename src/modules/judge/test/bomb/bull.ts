const input = ``

const output = ``

const usrCode = `
#include <stdio.h>
int main(void) {
    while(1) printf("1");
    return 0;
}
`

const expectResult = 'output-limit-exceeded'

export default {
  name: 'bomb-infinite-output',
  usrCode,
  input,
  output,
  expectResult,
  lang: 'c'
}
