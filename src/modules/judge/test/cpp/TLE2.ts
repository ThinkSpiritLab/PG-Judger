
const input = `
`;
const output = `
`;
const usrCode = `
#include <bits/stdc++.h>
#include <unistd.h>
using namespace std;
int main(void) {
    sleep(100);
    return 0;
}
`;

const expectResult = 'time-limit-exceeded'

export default ({
  name: "cpp-TLE-2",
  usrCode,
  input,
  output,
  expectResult
})