const input = `1 2
`
const output = `3
`
const usrCode = `
#include <unistd.h>
int main(void)
{
    int n = 100;
    while(n--)
    {
        fork();
    }
    while(1)
        sleep(1);
    return 0;
}
`

const expectResult = 'time-limit-exceeded'

export default {
  name: 'bomb-fork',
  usrCode,
  input,
  output,
  expectResult,
  lang: 'c'
}
