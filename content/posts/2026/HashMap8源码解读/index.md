---
title: "HashMap 源码解读与面试题总结"
date: 2024-05-14
draft: false
categories:
  - 开发
tags:
  - Java
  - HashMap
resources:
  - name: featured-image
    src: featured-image.jpg
---

# **HashMap相关面试题总结**

为什么重写Equals还要重写HashCode方法

HashMap如何避免内存泄漏问题

HashMap1.7底层是如何实现的

HashMapKey为null存放在什么位置 

HashMap如何解决Hash冲突问题

HashMap底层采用单链表还是双链表

时间复杂度O(1)、O(N)、O(Logn)区别

HashMap根据key查询的时间复杂度

HashMap如何实现数组扩容问题

HashMap底层是有序存放的吗？

LinkedHashMap 和 TreeMap底层如何实现有序的

HashMap底层如何降低Hash冲突概率

HashMap中hash函数是怎么实现的？

为什么不直接将key作为哈希值而是与高16位做异或运算？

HashMap如何存放1万条key效率最高

HashMap高低位与取模运算有那些好处

HashMap1.8如何避免多线程扩容死循环问题

为什么加载因子是0.75而不是1

为什么HashMap1.8需要引入红黑树

为什么链表长度>8需要转红黑树？而不是6？

什么情况下，需要从红黑树转换成链表存放？

HashMap底层如何降低Hash冲突概率

如何在高并发的情况下使用HashMap

ConcurrentHashMap底层实现的原理



https://tool.lu/hexconvert/

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDAxNmM4NjJhZWVmNzBlMzI0YzIwOTIzY2U5Mzg3ZTNfRTVZdmFRRmhIZVdTblQwS0RVVzJRZGJsU3lyUGNlVFpfVG9rZW46QU1SWGJxT05Fb1p3aDF4ZU9yeWM5ZmNwbjlkXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

## **HashMap基础知识**

### **HashMap与HashTable之间的区别**

 1，HashMap实现不同步，线程不安全。  HashTable线程安全  HashMap中的key-value都是存储在Entry中的。  

 

 2，继承不同。  

　　Hashtable 继承 Dictionary 类，而 HashMap  继承 AbstractMap 

　　public class Hashtable extends Dictionary implements Map 

　　public class HashMap extends  AbstractMap implements Map 

 

3， Hashtable中的方法是同步的，而HashMap中的方法在缺省情况下是非同步的。在多线程并发的环境下，可以直接使用Hashtable，

​       但是要使用HashMap的话就要自己增加同步处理了。  

 

4， Hashtable 中， key 和 value 都不允许出现 null 值。 在 HashMap 中， null 可以作为键，这样的键只有一个；可以有一个或多个键所对应的值为 null 。

　　当 get() 方法返回 null 值时，即可以表示 HashMap 中没有该键，也可以表示该键所对应的值为 null 。因此，在 HashMap 中不能由 get() 方法来判断 

　　HashMap 中是否存在某个键， 而应该用 containsKey() 方法来判断。  

 

哈希值的使用不同，HashTable直接使用对象的hashCode。而HashMap重新计算hash值 

### **时间复杂度O(n)、(O(1))、(O(logn))**

时间复杂度为O(n) 从头查询到尾部，查询多次

时间复杂度为O(1) 查询一次 比如根据数组下标查询

时间复杂度为O(logn) 平方查询  比如红黑树 

### **为什么重写equals还要重写****hashcode****方法**

Object 的 hashcode 方法是本地方法，也就是用 c 或 c++ 实现的，该方法直接返回对象的内存地址，让后再转换整数。

Equals方法

规定：

两个对象的Hashcode值相等，但是两个对象的内容值不一定相等；---Hash冲突的问题

两个对象的值Equals比较相等的情况下，则两个对象的Hashcode值一定相等；

 == 比较两个对象的内存地址是否相同、Equals默认的情况下比较两个对象的内存地址

1. 【强制】关于 hashCode 和 equals 的处理，遵循如下规则：

1） 只要覆写 equals，就必须覆写 hashCode。

2） 因为 Set 存储的是不重复的对象，依据 hashCode 和 equals 进行判断，所以 Set 存储的对象必须覆

写这两个方法。

3） 如果自定义对象作为 Map 的键，那么必须覆写 hashCode 和 equals。

说明：String 已覆写 hashCode 和 equals 方法，所以我们可以愉快地使用 String 对象作为 key 来使用。

### **异或****运算^无符号右移>>>&与运算**

<<(向左位移) 针对二进制，转换成二进制后向左移动2位，后面用0补齐

10的二进制1010

  0000 0000 0000 0000 0000 0000 0000 1010 ---32位

  0000 0000 0000 0000 0000 0000 0010 1000

System.out.println(10 << 2);//1010 =40

\>>(向右位移) 针对二进制，转换成二进制后向右移动2位，操作数移除右边界的位被屏蔽 正数高位

补0 负数补1

10的二进制1010

0000 0000 0000 0000 0000 0000 0000 1010

System.out.println(10 >> 2);//10=2

\>>>(不带符号右移) 针对二进制，转换成二进制后向右移动2位，操作数移除右边界的位被屏蔽

正数高位 补0 负数补0

异或运算^ 针对二进制，相同的为0，不同的为1

0010 --2

0011 --3

0001 --1

&（与运算） 针对二进制，00的0 11的1 10 的0

0010--2

0011--3

0010--2

### **HashMap如何避免内存泄漏问题**

## **HashMap面试题**

为什么重写Equals还要重写HashCode方法

HashMap如何避免内存泄漏问题

HashMap1.7底层是如何实现的

HashMapKey为null存放在什么位置 0

HashMap如何解决Hash冲突问题

HashMap底层采用单链表还是双链表 单向链表

时间复杂度O(1)、O(N)、O(Logn)区别

HashMap根据key查询的时间复杂度

HashMap如何实现数组扩容问题

HashMap底层是有序存放的吗？

LinkedHashMap 和 TreeMap底层如何实现有序的

HashMap底层如何降低Hash冲突概率

HashMap中hash函数是怎么实现的？

为什么不直接将key作为哈希值而是与高16位做异或运算？

HashMap如何存放1万条key效率最高

HashMap高低位与取模运算有那些好处

HashMap1.8如何避免多线程扩容死循环问题

为什么加载因子是0.75而不是1

为什么HashMap1.8需要引入红黑树

为什么链表长度>8需要转红黑树？而不是6？

什么情况下，需要从红黑树转换成链表存放？

HashMap底层如何降低Hash冲突概率

如何在高并发的情况下使用HashMap

ConcurrentHashMap底层实现的原理

# **HashMap底层实现原理**

##  **基于****Arraylist****集合方式实现**

   

```
public class ArraylistHashMap<K, V> {
    private List<Entry<K, V>> entries = new ArrayList<Entry<K, V>>();

    class Entry<K, V> {
        K k;
        V v;
        Entry next;

        public Entry(K k, V v) {
            this.k = k;
            this.v = v;
        }
    }

    public void put(K k, V v) {
        entries.add(new Entry<>(k, v));
    }

    public V get(K k) {
        for (Entry<K, V> entry :
                entries) {
            if (entry.k.equals(k)) {
                return entry.v;
            }
        }
        return null;
    }

    public static void main(String[] args) {
        ArraylistHashMap<String, String> arraylistHashMap = new ArraylistHashMap<>();
        arraylistHashMap.put("mayikt", "meite");
        arraylistHashMap.put("meite", "mayikt");
        System.out.println(arraylistHashMap.get("meite"));
    }
}
```



根据key查询时间复杂度为o(n),效率非常低。

##  **基于数组+****链表****方式实现(Jdk)**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MWYyOTZmZTdlMDkwNjQzODk4ZGJlNTFlZGViODMzYjJfOVhHR2kwZUg5eEJEVE50T2J3MU04VEJPckN0NVd6ampfVG9rZW46R2hTV2JhcWpKb05DNTJ4Q2RjRGM5MmhObmFkXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

HashMap1.7底层是如何实现的  基于数组+链表实现

同一个链表中存放的都是hashCode值可能相同，但是内容值却不同

```java
public class ExtHashMap<K, V> {
    private Entry[] objects = new Entry[10000];

    class Entry<K, V> {
        public K k;
        public V v;
        Entry next;

        public Entry(K k, V v) {
            this.k = k;
            this.v = v;
        }
    }

    public void put(K k, V v) {
        int index = k == null ? 0 : k.hashCode() % objects.length;
        Entry<K, V> oldEntry = objects[index];
        // 判断是否存在
        if (oldEntry == null) {
            objects[index] = new Entry<>(k, v);
        } else {
            // 发生hash碰撞则存放到链表后面
            oldEntry.next = new Entry<>(k, v);
        }
    }

    public V get(K k) {
//        if (k == null) {
//            for (Entry<K, V> oldEntry = objects[0]; oldEntry != null; oldEntry = oldEntry.next) {
//                if (oldEntry.k.equals(k)) {
//                    return oldEntry.v;
//                }
//            }
//        }
        int index = k == null ? 0 : k.hashCode() % objects.length;
        for (Entry<K, V> oldEntry = objects[index]; oldEntry != null; oldEntry = oldEntry.next) {
            if (oldEntry.k == null || oldEntry.k.equals(k)) {
                return oldEntry.v;
            }
        }
        return null;
    }

    public static void main(String[] args) {
        ExtHashMap<Object, String> hashMap = new ExtHashMap<>();
        hashMap.put("a", "a");
        hashMap.put(97, "97");
        hashMap.put(null, "nullmayikt");
        System.out.println(hashMap.get(97));

    }
}
```



## **HashMap底层是有序存放的吗？**

 无序、散列存放 

 遍历的时候从数组0开始遍历每个链表，遍历结果存储顺序不保证一致。

 如果需要根据存储顺序保存，可以使用LinkedHashMap底层是基于双向链表存放

LinkedHashMap基于双向链表实现

HashMap基本单向链表实现

### **LinkedHashMap实现缓存淘汰框架**

LRU(最近少使用)缓存淘汰算法

LFU(最不经常使用算法)缓存淘汰算法

ARC(自适应缓存替换算法)缓存淘汰算法

FIFO（先进先出算法）缓存淘汰算法

MRU(最近最常使用算法)缓存淘汰算法

LinkedHashMap基于双向链表实现，可以分为插入或者访问顺序两种，采用双链表的形式保证有序

可以根据插入或者读取顺序

LinkedHashMap是HashMap的子类，但是内部还有一个双向链表维护键值对的顺序，每个键值对既位于哈希表中，也位于双向链表中。LinkedHashMap支持两种顺序插入顺序 、 访问顺序

插入顺序：先添加的在前面，后添加的在后面。修改操作不影响顺序

执行get/put操作后，其对应的键值对会移动到链表末尾，所以最末尾的是最近访问的，最开始的是最久没有被访问的，这就是访问顺序。

其中参数accessOrder就是用来指定是否按访问顺序，如果为true，就是访问顺序,false根据新增顺序

```
public class LruCache<K, V> extends LinkedHashMap<K, V> {
    /**
     * 容量
     */
    private int capacity;

    public LruCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    /**
     * 如果超过存储容量则清除第一个
     *
     * @param eldest
     * @return
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }

    public static void main(String[] args) {
        LruCache<String, String> lruCache = new LruCache<>(3);
        lruCache.put("a", "a");
        lruCache.put("b", "b");
        lruCache.put("c", "c");
        // ca e
        lruCache.get("a");
        //cae
        lruCache.put("e", "emeite");
        lruCache.forEach((k, v) -> {
            System.out.println(k + "," + v);
        });
    }
}
```



## **HashMap如何降低Hash冲突概率**

```
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
((p = tab[i = (n - 1) & hash])

```

1、保证不会发生数组越界

首先我们要知道的是，在HashMap，数组的长度按规定一定是2的幂。因此，数组的长度的二进制形式是：10000…000, 1后面有偶数个0。 那么，length - 1 的二进制形式就是01111.111, 0后面有偶数个1。最高位是0, 和hash值相“与”，结果值一定不会比数组的长度值大，因此也就不会发生数组越界。一个哈希值是8，二进制是1000，一个哈希值是9，二进制是1001。和1111“与”运算后，结果分别是1000和1001，它们被分配在了数组的不同位置，这样，哈希的分布非常均匀。

## **HashMap源码解读**

### **modCount的作用**

我们知道 java.util.HashMap 不是线程安全的，因此如果在使用迭代器的过程中有其他线程修改了map，那么将抛出ConcurrentModificationException，这就是所谓fail-fast策略。这一策略在源码中的实现是通过 modCount 域，modCount 顾名思义就是修改次数，对HashMap 内容的修改都将增加这个值，那么在迭代器初始化过程中会将这个值赋给迭代器的 expectedModCount。在迭代过程中，判断 modCount 跟 expectedModCount 是否相等，如果不相等就表示已经有其他线程修改了 Map：

### **HashMap7扩容产生死循环问题**

**void** transfer(Entry[] newTable, **boolean** rehash) {    **int** newCapacity = newTable.**length**;    **for** (Entry<K,V> e : **table**) {        **while**(**null** != e) {            Entry<K,V> next = e.**next**;            **if** (rehash) {                e.**hash** = **null** == e.**key** ? 0 : hash(e.**key**);            }            **int** i = *indexFor*(e.**hash**, newCapacity);            e.**next** = newTable[i];            newTable[i] = e;            e = next;        }    } }

oldIndex=1  E的值=a；next=c；

newIndex=5 a存放在新table数组中是5；

newTable[i]=F a.next=f

newTable[i]=e；

新的e=next；C

循环第二次

E=C；Next=D

newIndex=5；C存放新table数组中是5；

C.Next=newTable[5];a.f

E.next=A.F

循环第三次

E=D；Next=null

DnewIndex=5；D存放table数组是5

Next=C.A.F

   

//HashMapTable数组

transient Node<K,V>[] table;

//初始容量为16 必须2的N的幂数

static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16

//最大容量是2的30次方 1073741824

static final int MAXIMUM_CAPACITY = 1 << 30;

//默认加载因子0.75 提前扩容

static final float DEFAULT_LOAD_FACTOR = 0.75f;

//链表转换成红黑树长度8

static final int TREEIFY_THRESHOLD = 8;

//红黑树的长度小于6转换成链表

static final int UNTREEIFY_THRESHOLD = 6;

//（数组容量>=64&链表长度大于8）

static final int MIN_TREEIFY_CAPACITY = 64;

// 实际存放大小个数

transient int size;

//hashMap迭代fastclass机制

transient int modCount;

// 扩容临界值16*0.75

int threshold;

// 加载因子

final float loadFactor;

1.无参构造函数赋值加载因子=0.75

this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted

2.N=table的长度 I=key计算的index值

Node<K,V>[] tab; Node<K,V> p; int n, i;

3.如果table数组为null或者N长度为<=0 则开始扩容初始化 （懒加载方式扩容）

 if ((tab = table) == null || (n = tab.length) == 0)

  n = (tab = resize()).length;

4.计算该key对应的index值是否有冲突，如果没有冲突直接插入

if ((p = tab[i = (n - 1) & hash]) == null)

tab[i] = newNode(hash, key, value, null);

5.else : 如果hash值相同且，内容值且相等的情况下，则直接修改

 Node<K,V> e; K k;

 if (p.hash == hash &&

 ((k = p.key) == key || (key != null && key.equals(k))))

 e = p;

6.判断对应的数据结构是否为红黑树，如果是为红黑树则使用红黑树存放

else if (p instanceof TreeNode)

e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);

7.

for (int binCount = 0; ; ++binCount) {

if ((e = p.next) == null) {

p.next = newNode(hash, key, value, null);

if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st

treeifyBin(tab, hash);

break;

 }

if (e.hash == hash &&

((k = e.key) == key || (key != null && key.equals(k))))

break;

p = e;

 

### **HashMap8扩容底层原理**

将原来的链表拆分两个链表存放； 低位还是存放原来index位置 高位存放index=j+原来长度

if ((e.hash & oldCap) == 0) { 由于oldCap原来的容量没有减去1 所以所有的hash&oldCap

为0或者1；

实例：

3&16=0

0000 0003

0001 0000

0000 0000 

4&16=0

0000 0100

0001 0000

0000 0000

16&16=16

0001 0000

0001 0000

0001 0000

17&16=16

0001 0001

0001 0000

0001 0000

### **HashMap加载因子为什么是0.75而不是1或者0.5**

产生背景：减少Hash冲突index的概率；

查询效率与空间问题；

简单推断的情况下，提前做扩容：

如果加载因子越大，空间利用率比较高，有可能冲突概率越大；

如果加载因子越小，有可能冲突概率比较小，空间利用率不高；

空间和时间上平衡点：0.75

统计学概率：泊松分布是统计学和概率学常见的离散概率分布

### **HashMap如何存放1万条key效率最高**

参考阿里巴巴官方手册：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ODU5YmQ0ZTQ2OWM5ZjZlYTA5Mzk4MDA1ODc4ZDI2ZWRfb0k4SENhRDdDa2FKeVVleXk3NzdoNDdwRW1EQ0hCbnFfVG9rZW46Q0o3ZGI1Wldhb1FUekp4TmJmemNEOGlKbldlXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

 (需要存储的元素个数 / 负载因子) + 1

10000/0.75+1=13334

正常如果存放1万个key的情况下 大概扩容10次=16384

### **为什么JDK官方不承认Jdk7扩容死循环Bug问题**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTg3OTBkODM4OTkxNjEyMTllNzFiNzU1Yjg0OWNkNzVfUjlBQVB2R3ZmWXZkQUlLUmNJT2taNVB5NHFNcUpZTG1fVG9rZW46WmNFRmJOZXRnb1FjbDZ4VUlHYmN5c0hVbmZnXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

https://bugs.java.com/bugdatabase/view_bug.do?bug_id=6423457

## **ConcurrentHashMap源码解读**

### **JDK1.7ConcurrentHashMap源码解读**

使用传统HashTable保证线程问题，是采用synchronized锁将整个HashTable中的数组锁住，

在多个线程中只允许一个线程访问Put或者Get，效率非常低，但是能够保证线程安全问题。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTRiOGMyODY5OWU1M2ExMzZjY2IxNDE0OWVkMGQyMjVfZWNHbmFtYkhaSEVVOVF2UDFldW5uUTZTNFpraFdRbjFfVG9rZW46RmJ5eGJMTk9Lb0hQdWd4RWtvMWNjazEybjNmXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

Jdk官方不推荐在多线程的情况下使用HashTable或者HashMap，建议使用ConcurrentHashMap分段HashMap。

效率非常高。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NGQ1MTUxNGIzYmRlNTQ3OGQyMjNmYzkyZWVkN2E2ZjZfQjg3VVJ2MXp1TVFuN2JSMWc1cEEwZHJzcXFBZ2ZXMXlfVG9rZW46U2RkcGJRZW1Eb2JrME94NnlHVmN5YjRKblBoXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

ConcurrentHashMap将一个大的HashMap集合拆分成n多个不同的小的HashTable（Segment），默认的情况下是分成16个不同的

Segment。每个Segment中都有自己独立的HashEntry<K,V>[] table；

#### **简单实现ConcurrentHashMap**

```java
public class MyConcurrentHashMap<K, V> {
    private Hashtable<K, V>[] segments;

    public MyConcurrentHashMap() {
        segments = new Hashtable[16];
    }

    public void put(K k, V v) {
        int segmentIndex = k.hashCode() & segments.length - 1;
        Hashtable hashtable = segments[segmentIndex];
        if (hashtable == null) {
            hashtable = new Hashtable<K, V>();
        }
        hashtable.put(k, v);
        segments[segmentIndex] = hashtable;
    }

    public V get(K k) {
        int segmentIndex = k.hashCode() & segments.length - 1;
        Hashtable<K, V> hashtable = segments[segmentIndex];
        if (hashtable != null) {
            return hashtable.get(k);
        }
        return null;
    }

    public static void main(String[] args) {
        MyConcurrentHashMap<String, String> concurrentHashMap = new MyConcurrentHashMap<>();
//        concurrentHashMap.put("a", "a");
//        concurrentHashMap.put("97", "97");
        for (int i = 0; i < 10; i++) {
            concurrentHashMap.put(i + "", i + "");
        }
//        System.out.println(concurrentHashMap.get("97"));
        for (int i = 0; i < 10; i++) {
            System.out.println(concurrentHashMap.get(i + ""));
        }
    }

}
```



#### **核心参数分析**

 ```java
 
 ##1.无参构造函数分析：
 initialCapacity ---16 
 loadFactor  HashEntry<K,V>[] table； 加载因子0.75
 concurrencyLevel 并发级别 默认是16
 ##2. 并发级别是能够大于2的16次方
 if (concurrencyLevel > MAX_SEGMENTS)
 concurrencyLevel = MAX_SEGMENTS;
 ##3.sshift 左移位的次数 ssize 作用：记录segment数组大小
         int sshift = 0;
         int ssize = 1;
         while (ssize < concurrencyLevel) {
             ++sshift;
             ssize <<= 1;
         }
 ##4. segmentShift segmentMask：ssize - 1 做与运算的时候能够将key均匀存放；
         this.segmentShift = 32 - sshift;
         this.segmentMask = ssize - 1;
 ##5. 初始化Segment0 赋值为下标0的位置
 Segment<K,V> s0 =
             new Segment<K,V>(loadFactor, (int)(cap * loadFactor),
                              (HashEntry<K,V>[])new HashEntry[cap]);    
 ##6.采用CAS修改复制给Segment数组
  UNSAFE.putOrderedObject(ss, SBASE, s0); // or     
 
 
 
 
 
 Put方法底层的实现  简单分析
 
         
         Segment<K,V> s;
         if (value == null)
             throw new NullPointerException();
         ###计算key存放那个Segment数组下标位置；
         int hash = hash(key);
         int j = (hash >>> segmentShift28) & segmentMask15;
         ###使用cas 获取Segment[10]对象 如果没有获取到的情况下，则创建一个新的segment对象
         if ((s = (Segment<K,V>)UNSAFE.getObject          // nonvolatile; recheck
              (segments, (j << SSHIFT) + SBASE)) == null) //  in ensureSegment
             s = ensureSegment(j);
         ### 使用lock锁对put方法保证线程安全问题
         return s.put(key, hash, value, false);
 
 
 
 0000 0000 00000 0000 0000 0000 0000 0011
                                     0000 0000 00000 0000 0000 0000 0000 0011
 
 
 
 深度分析：
 Segment<K,V> ensureSegment(int k) 
   
     private Segment<K,V> ensureSegment(int k) {
         final Segment<K,V>[] ss = this.segments;
         long u = (k << SSHIFT) + SBASE; // raw offset
         Segment<K,V> seg;
         ### 使用UNSAFE强制从主内存中获取 Segment对象，如果没有获取到的情况=null
         if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u)) == null) {
         	## 使用原型模式 将下标为0的Segment设定参数信息 赋值到新的Segment对象中
             Segment<K,V> proto = ss[0]; // use segment 0 as prototype
             int cap = proto.table.length;
             float lf = proto.loadFactor;
             int threshold = (int)(cap * lf);
             HashEntry<K,V>[] tab = (HashEntry<K,V>[])new HashEntry[cap];
             #### 使用UNSAFE强制从主内存中获取 Segment对象，如果没有获取到的情况=null
             if ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u))
                 == null) { // recheck
             	###创建一个新的Segment对象
                 Segment<K,V> s = new Segment<K,V>(lf, threshold, tab);
                 while ((seg = (Segment<K,V>)UNSAFE.getObjectVolatile(ss, u))
                        == null) {
                 	###使用CAS做修改
                     if (UNSAFE.compareAndSwapObject(ss, u, null, seg = s))
                         break;
                 }
             }
         }
         return seg;
 }
 
    final V put(K key, int hash, V value, boolean onlyIfAbsent) {
    	###尝试获取锁，如果获取到的情况下则自旋
             HashEntry<K,V> node = tryLock() ? null :
                 scanAndLockForPut(key, hash, value);
             V oldValue;
             try {
                 HashEntry<K,V>[] tab = table;
                 ###计算该key存放的index下标位置
                 int index = (tab.length - 1) & hash;
                 HashEntry<K,V> first = entryAt(tab, index);
                 for (HashEntry<K,V> e = first;;) {
                     if (e != null) {
                         K k;
                         ###查找链表如果链表中存在该key的则修改
                         if ((k = e.key) == key ||
                             (e.hash == hash && key.equals(k))) {
                             oldValue = e.value;
                             if (!onlyIfAbsent) {
                                 e.value = value;
                                 ++modCount;
                             }
                             break;
                         }
                         e = e.next;
                     }
                     else {
                         if (node != null)
                             node.setNext(first);
                         else
                         	###创建一个新的node结点 头插入法
                             node = new HashEntry<K,V>(hash, key, value, first);
                         int c = count + 1;
                           ###如果达到阈值提前扩容
                         if (c > threshold && tab.length < MAXIMUM_CAPACITY)
                             rehash(node);
                         else
                             setEntryAt(tab, index, node);
                         ++modCount;
                         count = c;
                         oldValue = null;
                         break;
                     }
                 }
             } finally {
             	###释放锁
                 unlock();
             }
             return oldValue;
         }
 ```



#### **核心Api**

GetObjectVolatile

此方法和上面的getObject功能类似，不过附加了'volatile'加载语义，也就是强制从主存中获取属性值。类似的方法有getIntVolatile、getDoubleVolatile等等。这个方法要求被使用的属性被volatile修饰，否则功能和getObject方法相同。

tryLock()方法是有返回值的，它表示用来尝试获取锁，如果获取成功，则返回true，如果获取失败（即锁已被其他线程获取），则返回false，这个方法无论如何都会立即返回。在拿不到锁时不会一直在那等待。

### **JDK1.8ConcurrentHashMap源码解读**

ConcurrentHashMap1.8的取出取消segment分段设计，采用对CAS + synchronized保证并发线程安全问题，将锁的粒度拆分到每个index

下标位置，实现的效率与ConcurrentHashMap1.7相同。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjQ1NjQ5OTM2OTBlOWM3ODJmOThlOTNhMTNmODdlY2RfcU81TE5IdnJFRGpqT1ZUNnhqT1UybFRRV2VhVURoaklfVG9rZW46R0V3ZGJicXlpb0Y5UXN4OTlqSGN6SWJIbnlmXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

#### **源码解读**

sizeCtl ：默认为0，用来控制table的初始化和扩容操作，具体应用在后续会体现出来。

-1 代表table正在初始化

N 表示有N-1个线程正在进行扩容操作

其余情况：

1、如果table未初始化，表示table需要初始化的大小。 0

2、如果table初始化完成，表示table的容量，默认是table大小的0.75倍，居然用这个公式算0.75（n - (n >>> 2)）。

### CounterCells 记录每个线程size++的次数

#### **Arraylist集合源码解读**

Arraylist底层是基于数组实现

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTVjZDgyNDkxNzUyNzM3NDM4MzVmMDNjODk5MDBhOWVfOFpubE8ybVBMZndsSzJMSjJUcE10YWZrRVo0RnFYRzVfVG9rZW46TXMycWJYcHNvb1BJeWt4S2FqQ2NxSGxVbkhmXzE3ODE3NDU3MDA6MTc4MTc0OTMwMF9WNA&add_watermark=true&scene_type=CCM)

​     System.arraycopy(elementData, index+1, elementData, index,

​                             numMoved);

Object src : 原数组

int srcPos : 从元数据的起始位置开始

Object dest : 目标数组

int destPos : 目标数组的开始起始位置

int length  : 要copy的数组的长度

```java
public class MayiktArraylist<T> {
    /**
     * 存放数据元素
     */
    private Object[] elementData;
    /**
     * 记录存放的个数
     */
    private int size = 0;
    /**
     * 默认容量为10
     */
    private static final int DEFAULT_CAPACITY = 10;


    public void add(T t) {
        if (elementData == null) {
            elementData = new Object[10];
        }
        // 判断是否需要扩容
        if ((size + 1) - elementData.length > 0) {
            // 原来容量10
            int oldCapacity = elementData.length;
            // 新的容量 10+5;
            int newCapacity = oldCapacity + (oldCapacity >> 1);
            // 扩容
            elementData = Arrays.copyOf(elementData, newCapacity);
        }
        elementData[size++] = t;
    }

    public T get(int index) {
        return (T) elementData[index];
    }

    public boolean remove(T value) {
        for (int i = 0; i < size; i++) {
            T oldValue = (T) elementData[i];
            if (oldValue.equals(value)) {
                int numMoved = size - i - 1;
                if (numMoved > 0)
                    //remove
                    System.arraycopy(elementData, i + 1, elementData, i,
                            numMoved);
                elementData[--size] = null;
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        MayiktArraylist<String> arraylist = new MayiktArraylist<>();
        for (int i = 0; i < 100; i++) {
            arraylist.add("mayikt" + i);
        }
        arraylist.remove("mayikt2");
//        arraylist.add("mayikt11");
        for (int i = 0; i < arraylist.size; i++) {
            System.out.println(arraylist.get(i));
        }
//
//        System.out.println(arraylist.get(0));
    }
}
```

