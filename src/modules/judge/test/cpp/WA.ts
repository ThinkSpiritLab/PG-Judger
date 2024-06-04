
const input = `1 2
`;
const output = `3
`;
const usrCode = `
#include <bits/stdc++.h>
using namespace std;

int main(void) {
    int a, b;
    cin >> a >> b;
    cout << a + b + 1 << endl;
    return 0;
}
`;
const expectResult = 'wrong-answer'

export default ({
  name: "cpp-WA",
  usrCode,
  input,
  output,
  expectResult
})