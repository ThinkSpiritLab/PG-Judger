/*
 * File: MLE.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Tu Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 04 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ----------	---	---------------------------------------------------------  *
 */


const input = `1 2
`;
const output = `3
`;
const usrCode = `
#include <bits/stdc++.h>
using namespace std;

int a[500000000] = {}; // 2GB

int main(void)
{
    for (int i = 0; i < 500000000; i++)
    {
        a[i] = 1;
    }
    for (int i = 0; i < 500000000; i++)
    {
        printf("");
    }
    return 0;
}
`;

const expectResult = 'memory-limit-exceeded'

export default ({
  name: "cpp-MLE",
  usrCode,
  input,
  output,
  expectResult
})