/home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg
-B /home/shiyuzhe/lab/bombs 

--cwd /home/shiyuzhe/lab/bombs


--bin /usr/bin/gcc --args -O2 /home/shiyuzhe/lab/bombs/main.c -o /home/shiyuzhe/lab/bombs/main

/home/shiyuzhe/lab/lev/pg-judger/bin/nsjail 
-C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg 
-B /tmp 
-B /home/shiyuzhe/lab/bombs 
--cwd /tmp
--pass_fd 0 --pass_fd 1 --pass_fd 2 

--bin /usr/bin/
gcc --args -O2 /home/shiyuzhe/lab/bombs/main.c -o /home/shiyuzhe/lab/bombs/main


sudo /home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg -B /tmp \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -R /home/shiyuzhe/lab/lev/pg-judger/bin/ojcmp \
-B /home/shiyuzhe/lab/bombs -t 3 --rlimit_cpu 600 --rlimit_fsize 1 --rlimit_stack 64 --cwd /tmp \
 --pass_fd 0 --pass_fd 1 --pass_fd 2 -- /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 2000 -cpu 1 -p 3 --bin /usr/bin/ \
gcc --args -O2 /home/shiyuzhe/lab/bombs/main.c -o /home/shiyuzhe/lab/bombs/main

sudo /home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg -B /tmp \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -R /home/shiyuzhe/lab/lev/pg-judger/bin/ojcmp -R /home/shiyuzhe/lab/lev/pg-judger/bin/hc \
-B /home/shiyuzhe/lab/bombs -t 3 --rlimit_cpu 600 --rlimit_fsize 1 --rlimit_stack 64 --cwd /tmp \
--pass_fd 0 --pass_fd 1 --pass_fd 2 -- /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 2000 -cpu 1 -p 3 --bin /usr/bin/gcc --args -O2 /home/shiyuzhe/lab/bombs/main.c -o /home/shiyuzhe/lab/bombs/main

sudo /home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg -B /tmp \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -R /home/shiyuzhe/lab/lev/pg-judger/bin/ojcmp \
-B /home/shiyuzhe/lab/bombs -t 3 --rlimit_cpu 600 --rlimit_fsize 1 --rlimit_stack 64 --cwd /tmp \
--pass_fd 0 --pass_fd 1 --pass_fd 2 -- /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 2000 -cpu 1 -p 3 \
--bin /usr/bin/gcc --args -O2 /home/shiyuzhe/lab/bombs/main.c -o /home/shiyuzhe/lab/bombs/main

# this is good
sudo /home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg -B /tmp/bp-XXXXXX3uI5aR \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -R /home/shiyuzhe/lab/lev/pg-judger/bin/ojcmp \
-B /home/shiyuzhe/lab/bombs -t 3 --rlimit_cpu 600 --rlimit_fsize 1 --rlimit_stack 64 --cwd /tmp/bp-XXXXXX3uI5aR \
--pass_fd 0 --pass_fd 1 --pass_fd 2 -- /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 2000 -cpu 1 -p 3 \
--bin /usr/bin/gcc --args -O2 /home/shiyuzhe/lab/bombs/main.c -o /home/shiyuzhe/lab/bombs/main #与路径有关

sudo /home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg -B /tmp/bp-XXXXXX3uI5aR \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -R /home/shiyuzhe/lab/lev/pg-judger/bin/ojcmp \
-B /home/shiyuzhe/lab/bombs -t 3 --rlimit_cpu 600 --rlimit_fsize 1 --rlimit_stack 64 --cwd /tmp/bp-XXXXXX3uI5aR \
--pass_fd 0 --pass_fd 1 --pass_fd 2 -- /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 2000 -cpu 1 -p 3 \
--bin /usr/bin/gcc --args -O2 /tmp/bp-XXXXXX3uI5aR/main.c -o /home/shiyuzhe/lab/bombs/main #与路径有关

sudo /home/shiyuzhe/lab/lev/pg-judger/bin/nsjail -C /home/shiyuzhe/lab/lev/pg-judger/config/jail-config.cfg -B /tmp \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -R /home/shiyuzhe/lab/lev/pg-judger/bin/ojcmp \
-R /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 3 --rlimit_cpu 600 --rlimit_fsize 1 --rlimit_stack 64 --cwd /tmp/bp-XXXXXX3uI5aR \
--pass_fd 0 --pass_fd 1 --pass_fd 2  -- /home/shiyuzhe/lab/lev/pg-judger/bin/hc -t 2000 -cpu 1 -p 3  \
--bin /usr/bin/gcc --args -O2 /tmp/bp-XXXXXX3uI5aR/main.c -o /tmp/bp-XXXXXX3uI5aR/main