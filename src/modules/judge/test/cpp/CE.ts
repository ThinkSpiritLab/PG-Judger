/*
 * File: CE.ts                                                                 *
 * Project: pg-judger                                                          *
 * Created Date: Mo Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 04 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { toNormalJudgeRequest } from "../utils";


const input = `1 2
`;
const output = `3
`;
const usrCode = `
#include <bits/stdc++.h>

int main(void) {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`;

const expectResult = 'compile-error'

export default ({
  name: "cpp-CE",
  usrCode,
  input,
  output,
  expectResult
})