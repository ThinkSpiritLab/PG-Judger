const input = `1 2
`;
const output = `3
`;
const usrCode = `
#include <bits/stdc++.h>
using namespace std;

int a[1000] = {};

int main(void)
{
    for (int i = 0; i < 1000000000; i++)
    {
        a[i] = 1;
    }
    for (int i = 0; i < 1000000000; i++)
    {
        printf("");
    }
    return 0;
}
`;

const expectResult = 'runtime-error'

export default ({
  name: "cpp-RE",
  usrCode,
  input,
  output,
  expectResult
})