const input = `
`
const output = `67108864
67108864
`
const usrCode = `
#include <stdio.h>
#include <sys/resource.h>
int main(void)
{
    struct rlimit r;
    if (getrlimit(RLIMIT_STACK, &r) < 0)
    {
        fprintf(stderr, "getrlimit error\\n");
        return 1;
    }
    printf("%d\\n", r.rlim_cur);
    printf("%d\\n", r.rlim_max);

    return 0;
}
`

const expectResult = 'accepted'

export default {
  name: 'bomb-stack',
  usrCode,
  input,
  output,
  expectResult,
  lang: 'c'
}
