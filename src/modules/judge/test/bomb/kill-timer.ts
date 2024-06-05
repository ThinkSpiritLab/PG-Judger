const input = `
`
const output = `1
`
const usrCode = `
#include <signal.h>

int main(void)
{
    kill(1, SIGKILL); // init
    kill(3, SIGKILL); // timer
    return 0;
}
`
const expectResult = 'wrong-answer'
export default {
  name: 'bomb-kill-timer',
  usrCode,
  input,
  output,
  expectResult,
  lang: 'c'
}
