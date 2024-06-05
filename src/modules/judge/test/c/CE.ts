/*
 * File: CE.ts                                                                 *
 * Project: pg-judger                                                          *
 * Created Date: We Jun 2024                                                   *
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
`;
const output = `3
`;
const usrCode = `
#include <cstdio>

int main(void) {
    int a, b;
    scanf("%d%d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}
`;

const expectResult = 'compile-error'

export default ({
  name: "c-CE",
  usrCode,
  input,
  output,
  expectResult
})
