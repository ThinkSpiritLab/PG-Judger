/*
 * File: ac.ts                                                                 *
 * Project: pg-judger                                                          *
 * Created Date: Mo Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Wed Jun 05 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

const input = `1 2
`
const output = `3
`
const usrCode = `
#include <bits/stdc++.h>
using namespace std;

int main(void) {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`

const expectResult = 'accepted'

export default ({
  name: "cpp-AC",
  usrCode,
  input,
  output,
  expectResult
})
