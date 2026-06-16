---
title: "华为OD机试"
date: 2024-09-09
draft: false
categories:
  - 算法竞赛
tags:
  - 题解
  - 华为OD
resources:
  - name: featured-image
    src: featured-image.jpg
---

# 一、字符串重新排序

## 题目描述：



给定一个字串s，s包含以空格分隔的若干个单词，请对s进行如下处理后输出:
1、单词内部调整:对每个单词字母重新按字典序排序
2、单词间顺序调整:

 1. 统计每个单词出现的次数，并按次数降序排列；
 2. 次数相同时，按单词长度升序排列;
 3. 次数和单词长度均相同时，按字典序升序排列。

请输出处理后的字符串，每个单词以一个空格分隔。
**输入1**
```
This is an apple
```
**输出1**
```
an is This aelpp
```

**输入2**
```
My sister is in the house not in the yard
```
**输出2**
```
in in eht eht My is not adry ehosu eirsst
```

**思路**
按题目模拟即可：
首先处理单词的分割，这有很多种方法，如java的split()函数将空格去除并转为String数组，或者C++的Stream流处理，如果对语言的API不熟悉的话，也可以采用暴力的方式或者双指针算法处理。
处理之后，对每个字符串进行字典序排序，调用排序函数。接着可以使用map记录每个单词出现的次数，接着对数组排序，排序规则如题目所说，最后进行输出即可

**Code(c++)**
```cpp
#include <bits/stdc++.h>

using i64 = long long;
using PII = std::pair<i64,i64>;
#define int i64
#define yes std::cout << "YES\n";
#define no std::cout << "NO\n";

void solve() {
    std::string s;
    getline(std::cin, s);
    int n = s.size();
    std::vector<std::string> a;
    std::string t = "";
    for (int i = 0; i < n; i ++) {
        if (s[i] != ' ') {
            t += s[i];
        } else {
            if (t != "") {
                std::sort(t.begin(), t.end());
                a.push_back(t);
                t = "";    
            }
        }
    }
    if (t != "") {
        std::sort(t.begin(), t.end());
        a.push_back(t);
    }
    std::map<std::string,int> mp;
    for (auto c : a) {
        mp[c] ++;
    }
    std::sort(a.begin(), a.end(),[&](std::string x,std::string y) {
        if (mp[x] == mp[y]) {
            if (x.size() == y.size()) {
                return x < y;
            }
            return x.size() < y.size();
        }
        return mp[x] > mp[y];
    });
    for (auto c : a) {
        std::cout << c << " \n"[c == a.back()];    
    }
}
signed main() {
    // std::ios::sync_with_stdio(false);
    // std::cin.tie(nullptr); 
    
    int T = 1;
    
    // std::cin >> T;

    while (T -- ) {
        solve();
    }
    return 0;
}
```
**赛时过了86.66%，一直提示格式错误，输出前后不能有空格，调了半天觉得没问题，索性不改了**

# 二、IPv4 转数字
## 题目描述：



存在一种虚拟IPv4地址，由4小节组成，第一节节的范围为1-128，之后范围是0-255，以#号间隔，格式如下：(1-128)#(0-255)#(0-255)#(0-255)

请利用这个特性把虚拟IPv4地址转换为一个32位的整数，IPv4地址以字符串形式给出，要求每个IPvV4地址只能对应到唯一的整数上。

如果是非法IPv4，返回invalid IP。
**输入1**
```
100#101#1#5
```
**输出1**
```
1684340997
```

**输入2**
```
1#2#3
```
**输出2**
```
invalid IP
```
**思路**
由于题目没有保证输入一定是合法的，所以还需要对输入进行判断

 1. 首先，将IP地址按照#号进行拆分，得到四个小节的字符串。
 2. 对于每一节的字符串，先将其转换为整数。如果转换失败，说明该地址非法。
 3. 对于第一节字符串，需要检查其取值范围是否在1-128之间。如果不在，说明该地址非法。
 4. 对于剩下的三节字符串，需要检查其取值范围是否在0-255之间。如果不在，说明该地址非法。
 5. 如果全部验证通过，则将四个整数通过位运算的方式得到最后的整数表示的IPv4地址。

**位运算第一种方式**
这种是赛时写的，比较暴力，先把每个数的二进制全部弄到一个数组里，然后再将其转为整数
```cpp
reverse(a.begin(), a.end());
std::vector<int> p(60);
for (int i = 0; i < 4; i ++) {
    for (int j = 0; j <= 7; j ++) {
        if (a[i] >> j & 1) {
            p[i * 8 + j] = 1;
        } else {
            p[i * 8 + j] = 0;
        }
    }
}   
int res = 0ll;
for (int i = 40; i >= 0; i --) {
    if (p[i]) {
        res += (1ll << i);
    }
}
std::cout << res;
```


**位运算第二种方式**
将四个整数依次左移24、16、8、0位，并进行位或操作。
写习惯了1 << i这种，赛时没考虑可以直接移动，思维固化了o(╥﹏╥)o
```cpp
int res = (a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3];
std::cout << res;
```

Code(c++)
```cpp
#include <bits/stdc++.h>

using i64 = long long;
using PII = std::pair<i64,i64>;
#define int i64
#define yes std::cout << "YES\n";
#define no std::cout << "NO\n";

void solve() {
    std::string s;
    getline(std::cin,s);

    std::vector<int> a;
    int t = -1;
    for (auto c : s) {
        if (c != '#' and !isdigit(c)) {
            std::cout << "invalid IP";
            return;    
        }
        if (c != '#') {
            if (t == -1) {
                t = 0;
            }
            t = t * 10 + (c - '0');
        } else {
            if (t != -1) {
                a.push_back(t);    
            } else {
                std::cout << "invalid IP";
                return;           
            }
            t = -1;
        }
    }
    if (t != -1) {
        a.push_back(t);    
    }
    if (a.size() != 4 or (a[0] > 128 or a[0] < 1) or (a[1] > 255 or a[1] < 0) or (a[2] > 255 or a[2] < 0) or (a[3] > 255 or a[3] < 0)) {
        std::cout << "invalid IP";
        return;
    }
    reverse(a.begin(), a.end());
    std::vector<int> p(60);

    for (int i = 0; i < 4; i ++) {
        for (int j = 0; j <= 7; j ++) {
            if (a[i] >> j & 1) {
                p[i * 8 + j] = 1;
            } else {
                p[i * 8 + j] = 0;
            }
        }
    }   
    int res = 0ll;
    for (int i = 40; i >= 0; i --) {
        if (p[i]) {
            res += (1ll << i);
        }
    }
    std::cout << res;
}
signed main() {
    // std::ios::sync_with_stdio(false);
    // std::cin.tie(nullptr); 
    
    int T = 1;
    
    // std::cin >> T;

    while (T -- ) {
        solve();
    }
    return 0;
}
```
**赛时过了93.33%，思考了半天也没想出来还有哪种情况没考虑到**

# 三、观看文艺汇演

## 题目描述：



为了庆祝中国共产党成立100周年，某公园将举行多场文艺表演，很多演出都是同时进行，一个人只能同时观看一场演出，且不能迟到早退，由于演出分布在不同的演出场地，所以连续观看的演出最少有15分钟的时间间隔。
小明是一个狂热的文艺迷，想观看尽可能多的演出，现给出演出时间表，请帮小明计算他最多能观看几场演出。

## 输入描述



第一行为一个数N,表示演出场数，1 <= N<=1000,接下来N行，每行有被空格分割的两个整数；
第一个整数T表示演出的开始时间，第二个整数L表示演出的持续时间；
T和L的单位为分钟，0 <=T <=1440, 0 <= L <= 100。

## 输出描述



输出最多能观看的演出场数。

**输入1**
```
2
720 120
840 120
```
**输出1**
```
1
```

**输入2**
```
2
0 60
90 60
```
**输出2**
```
2
```

**思路**
最初考虑的是贪心，将演出按左端点，即演出开始时间进行排序，然后贪心的选区间，交了几发没过。发现存在特殊情况，比如选了第一个区间，但第二，第三个区间都选不了，于是转换思路。
考虑DP(动态规划)，将演出进行排序后发现，每次选择的演出，其开始时间>=上一场演出的结束时间 + 15，并且是递增的。那么问题转化为了每次所选区间>= 上场结束时间 + 15，这是一个最长上升子序列 (LIS)模型的DP，由于n <= 1000，所以直接使用O(n^2)的LIS即可。

**DP:**
第一重循环遍历当前选择的第i个演出，第二重循环表示前边已经看过的演出，如果符合看过的演出的结束时间 + 15 <= 当前演出的开始时间，则当前演出可以选，那么$dp_i$ 就和 $dp_j$ + 1,即上一个演出的DP值 + 1 取一个最大值即可。
$dp_i$ 表示前i个演出最多选择几个可以符合条件，那么答案就是$\max\{dp_1, dp_2,\cdots, dp_n\}$。
```cpp
std::vector<int> dp(n + 10);
for (int i = 1; i <= n; i ++) {
    dp[i] = 1;
    for (int j = 1; j < i; j ++) {
        if (a[j].second + 15 <= a[i].first) {
            dp[i] = std::max(dp[i],dp[j] + 1);
        }
    }
}
```
**Code(c++)**
```cpp
#include <bits/stdc++.h>

using i64 = long long;
using PII = std::pair<i64,i64>;
#define int i64
#define yes std::cout << "YES\n";
#define no std::cout << "NO\n";

void solve() {
    int n;
    std::cin >> n;

    std::vector<PII> a(n + 1);
    for (int i = 1; i <= n; i ++) {
        std::cin >> a[i].first >> a[i].second;
        a[i].second += a[i].first;
    }
    std::sort(a.begin() + 1, a.end(),[](PII x,PII y) {
        if (x.first == y.first) {
            return x.second < y.second;
        }
        return x.first < y.first;
    });

    std::vector<int> dp(n + 10);
    for (int i = 1; i <= n; i ++) {
        dp[i] = 1;
        for (int j = 1; j < i; j ++) {
            if (a[j].second + 15 <= a[i].first) {
                dp[i] = std::max(dp[i],dp[j] + 1);
            }
        }
    }
    std::cout << *std::max_element(dp.begin(), dp.end()) << "\n";

}
signed main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr); 
    
    int T = 1;
    
    // std::cin >> T;

    while (T -- ) {
        solve();
    }
    return 0;
}
```
**赛时过了100%**