const input = `1 7
`
const output = `
`
const usrCode = `
#include <bits/stdc++.h>
using namespace std;

int main(void) {
    srand(time(0));
    long long a, b;
    cin >> a >> b;
    int rd = rand();
    cout << a + rd << ' ' << b - rd << endl;
    return 0;
}
`

const spjCode = `
#include <bits/stdc++.h>
using namespace std;
int main(void) {
    while(true) {
        printf("💣😋💣");
    }
    return 0;
}
`

const expectResult = 'SystemTimeLimitExceeded'

export default ({})