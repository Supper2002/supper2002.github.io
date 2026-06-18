---
title: "JVM 调优"
date: 2024-08-18
draft: false
categories:
  - 开发
tags:
  - Java
  - JVM
  - 性能优化
resources:
  - name: featured-image
    src: featured-image.jpg
---

## JVM调优

### 前言

> 为什么要进行jvm调优？

jvm需要调优的主要原因是为了**提高Java应用程序的性能、稳定性和资源利用率**。在Java应用程序的运行过程中，可能会遇到各种性能问题，如高内存占用、高CPU使用率、频繁的垃圾收集（GC）等，这些问题都可能影响应用程序的响应速度和吞吐量。通过JVM调优，可以优化这些性能问题，提高应用程序的整体性能。

> 什么情况下需要调优？

以下是一些需要JVM调优的场景和原因：

1. **解决性能瓶颈**
   1. 当应用程序在运行过程中出现性能瓶颈时，如响应速度慢、吞吐量低等，可能需要对JVM进行调优。通过调整JVM的配置参数，如堆内存大小、新生代和老年代的大小比例、垃圾收集器的选择等，可以改善应用程序的性能。
2. **应对高并发和短生命周期对象**
   1. 对于Web服务器或高性能计算环境等应用，它们会产生大量的短生命周期对象。为了优化性能，可以调整JVM参数，如设置堆内存大小初始化和最大值、调整新生代大小等，以减少内存分配和垃圾收集的开销。
3. **防止频繁Full GC导致延迟**
   1. 在大型企业级应用中，系统可能会频繁触发Full GC，导致整体响应速度下降。这时可以通过调整JVM参数，如调整老年代大小、选择合适的垃圾收集器等，来减少Full GC的频率。
4. **CPU占用过高**
   1. 如果服务器CPU占用率长期过高，可能是程序中存在循环次数过多的代码或死循环。这时可以通过JVM的监控工具定位问题所在，并进行相应的优化。
5. **内存泄漏**
   1. 内存泄漏是常见的性能问题之一。JVM提供了各种工具来帮助开发人员检测和定位内存泄漏问题，如使用jmap、jhat等工具进行堆内存分析。通过调优可以找出并修复内存泄漏问题。
6. **应用程序负载变化**
   1. 当应用程序的负载发生变化时，如用户数量增加或应用程序的功能发生改变，可能需要重新调整JVM的配置参数以适应新的负载情况。
7. **发生****OOM**
   1. 如果程序发生了oom异常，说明肯定是程序中出现了严重的错误，需要结合工具，判断问题，进行针对性优化。

### JVM常用监控工具

#### 在线监控工具

##### 1.JPS（打印java进程信息）

> 简介

`jps`（Java Virtual Machine Process Status Tool）是JDK提供的一个命令行工具，用于列出当前正在运行的Java虚拟机（JVM）进程及其相关信息。这个工具对于系统管理员、开发者以及那些需要监控和管理Java应用程序的人来说非常有用。

当你执行`jps`命令时，它会显示一个列表，其中包含了每个Java进程的进程ID（PID）以及与每个进程相关联的`main`类名（或JAR文件名）和任何传递给`main`方法的参数。

> 使用

**使用场景 ：** 查看当前机器的所有Java进程信息（可追踪到应用进程ID 、启动类名、文件路径。）

**指令****格式 :** jps 【选项 】 [hostid]

**使用方法：**在命令行中直接输入`jps`即可列出当前所有Java进程。你还可以使用各种选项来定制输出。

**选项**

- `-l`：输出主类全名或JAR文件的完整路径名。
- `-v`：输出传递给JVM的参数。
- `-m`：输出传递给`main`方法的参数。
- `-q`：只输出进程ID。
- `-J`：用于传递JVM选项给`jps`命令本身，而不是传递给Java应用程序。

> 示例

```Bash
# 列出所有Java进程及其PID、主类全名和传递给main方法的参数：
[root@iZy176vefq2r85Z ~]# jps -lvm
27092 sun.tools.jps.Jps -lvm -Denv.class.path=.:/usr/java/jdk1.8.0/lib/dt.jar:/usr/java/jdk1.8.0/lib -Dapplication.home=/usr/java/jdk1.8.0 -Xms8m
23060 ruoyi-admin.jar --server.port=8083 --server.ser vlet.context-path=/renren-fast -Xms128m -Xmx512m -Dspring.profiles.active=xinye
32541 pension-project.jar --server.port=16000 --server.ser vlet.context-path=/renren-fast -Dspring.profiles.active=prod -Xms256m -Xmx512m
21135 jzacme_loveapp-0.0.1-SNAPSHOT.jar --server.port=8080 --server.ser vlet.context-path=/renren-fast -Dspring.profiles.active=prod -Xms256m -Xmx512m
```

##### 2.Jstat （JVM内存信息统计）

`Jstat`是Java虚拟机（JVM）提供的一个命令行工具，主要用于监控Java应用程序的资源和性能。它利用JVM内建的指令对Java应用程序的资源和性能进行实时的命令行监控，**包括了对堆大小、****垃圾回收****状况等的监控**。

> 主要功能

- **监控****JVM****内存**：Jstat可以监控JVM内存中的堆（Heap）和非堆（Non-Heap）的大小及其内存使用量。
- **垃圾回收****监控**：Jstat可以显示垃圾回收（GC）的信息，包括GC的次数、时间等。具体来说，它可以显示年轻代（Young Generation）和老年代（Old Generation）的GC次数、时间，以及总的GC时间。
- **类加载信息**：Jstat还可以显示加载的类的数量以及所占空间等信息。
- **编译器信息**：此外，Jstat还可以显示JVM实时编译的数量等信息。

> 使用

**使用场景 ：**用于查看各个功能和区域的统计信息（如：类加载、编译相关信息统计，各个内存区域GC概况和统计）

**格式 ：** jstat 【选项】 【进程ID】 [间隔时间 ] [查询次数]

[间隔时间 ] 可选参数，每隔多长时间输出一次信息，单位为毫秒。

[查询次数] 可选参数，总共输出多少次信息。

**使用方法：**在命令行中直接输入`jstat pid`

**选项：**

- `-class`：显示加载的类的数量及所占空间。
- `-compiler`：显示VM实时编译的数量。
- `-gc`：显示GC的信息，包括GC的次数和时间。
- `-gccapacity`：显示VM内存中三代（young/old/perm）对象的使用和占用大小。
- `-gcnew`：显示年轻代对象的信息。
- `-gcold`：显示老年代对象的信息。
- `-gcutil`：统计GC信息的百分比。
- `-gccause`：显示最近一次GC的统计和原因。
- 以及其他一些选项，如`-printcompilation`等。

> 示例

```Bash
#输出 21135 的 gc 每隔一秒输出一次 一个输出三次
[root@iZy176vefq2r85Z ~]# jstat -gc 21135 1000 3 

#输出信息将包括S0C（第一个幸存区的大小）、S1C（第二个幸存区的大小）、EC（伊甸园区的大小）、OC（老年代大小）等字段，以及YGC（年轻代GC次数）、YGCT（年轻代GC时间）、FGC（老年代GC次数）、FGCT（老年代GC时间）和GCT（总GC时间）等统计信息。
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU    CCSC   CCSU   YGC     YGCT    FGC    FGCT     GCT   
4096.0 4096.0  0.0   3035.8 78848.0  44052.0   175104.0   174800.3  79512.0 75002.4 9648.0 8861.9   5379  157.950   3      1.348  159.298
4096.0 4096.0  0.0   3035.8 78848.0  44052.0   175104.0   174800.3  79512.0 75002.4 9648.0 8861.9   5379  157.950   3      1.348  159.298
4096.0 4096.0  0.0   3035.8 78848.0  44052.0   175104.0   174800.3  79512.0 75002.4 9648.0 8861.9   5379  157.950   3      1.348  159.298

S0C 和 S0U    #S0区的总内存大小和已使用的内存大小。
 
S1C: 和S1U   #S1区的总内存大小和已使用的内存大小。。
 
EC 和 EU     #Eden区的总内存大小 和已使用的内存大小。
 
OC和OU       #Old区的总内存大小 和已使用的内存大小。
 
MC和MU       #方法区的总内存大小 和已使用的内存大小。
 
CCSC和CCSU   #压缩类空间大小 和已使用的内存大小。
 
YGC和 YGCT   #Young GC 的总次数 和消耗总时间。
 
FGC和 FGCT   #Full Gc的总次数和消耗总时间。
 
GCT         #所有GC的消耗时间。
```

##### 3.Jinfo（JVM参数查看和修改）

`jinfo`是Java虚拟机（JVM）自带的一个工具，用于实时地查看和调整虚拟机的各项参数。它通常与`jps`和`jstack`等其他JVM调试工具一起使用，帮助开发人员更好地理解和优化Java应用程序的性能。

jinfo的主要功能是**实时地查看和调整JVM的各项配置参数，包括堆大小、线程数、垃圾回收器类型等**。使用jinfo命令，可以**查询某个JVM进程的配置参数**，也可以修改**支持动态更改的配置参数**。

> 使用

**使用场景 ：** 查看和调整JVM启动和运行参数。

**指令格式 :**

- jinfo 【进程ID】
- jinfo 【选项】【进程ID】
- jinfo 【选项】【具体选项参数名】【进程ID】

**选项**：

1. `-flags`：打印命令行参数和系统属性。
2. `-sysprops`：打印Java系统属性。
3. `-flag [+|-]name`：启用或禁用某个标志（Flag），其中`+`表示开启，`-`表示关闭。但请注意，这只对支持动态更改的标志有效。

> 示例

```Bash
#查看JVM整个系统参数信息
[root@iZy176vefq2r85Z ~]# jinfo 21135
Attaching to process ID 21135, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.74-b02
Java System Properties:

java.runtime.name = Java(TM) SE Runtime Environment
java.vm.version = 25.74-b02
sun.boot.library.path = /usr/java/jdk1.8.0/jre/lib/amd64
java.protocol.handler.pkgs = org.springframework.boot.loader
java.vendor.url = http://java.oracle.com/
java.vm.vendor = Oracle Corporation
path.separator = :
file.encoding.pkg = sun.io
java.vm.name = Java HotSpot(TM) 64-Bit Server VM
sun.os.patch.level = unknown
sun.java.launcher = SUN_STANDARD
user.country = US
user.dir = /usr/project/jzacme_loveapp_prod
java.vm.specification.name = Java Virtual Machine Specification
PID = 21135
java.runtime.version = 1.8.0_74-b02
java.awt.graphicsenv = sun.awt.X11GraphicsEnvironment
os.arch = amd64
java.endorsed.dirs = /usr/java/jdk1.8.0/jre/lib/endorsed
spring.profiles.active = prod
line.separator = 

java.io.tmpdir = /tmp
java.vm.specification.vendor = Oracle Corporation
os.name = Linux
sun.jnu.encoding = UTF-8
java.library.path = /usr/java/packages/lib/amd64:/usr/lib64:/lib64:/lib:/usr/lib
spring.beaninfo.ignore = true
java.specification.name = Java Platform API Specification
java.class.version = 52.0
sun.management.compiler = HotSpot 64-Bit Tiered Compilers
os.version = 3.10.0-1160.11.1.el7.x86_64
LOG_FILE = ./logs/runing.log
user.home = /root
user.timezone = Asia/Shanghai
catalina.useNaming = false
java.awt.printerjob = sun.print.PSPrinterJob
file.encoding = UTF-8
java.specification.version = 1.8
catalina.home = /tmp/tomcat.4197285406127585031.8080
user.name = root
java.class.path = jzacme_loveapp-0.0.1-SNAPSHOT.jar
java.vm.specification.version = 1.8
sun.arch.data.model = 64
sun.java.command = jzacme_loveapp-0.0.1-SNAPSHOT.jar --server.port=8080 --server.ser vlet.context-path=/renren-fast
java.home = /usr/java/jdk1.8.0/jre
user.language = en
java.specification.vendor = Oracle Corporation
awt.toolkit = sun.awt.X11.XToolkit
java.vm.info = mixed mode
java.version = 1.8.0_74
java.ext.dirs = /usr/java/jdk1.8.0/jre/lib/ext:/usr/java/packages/lib/ext
sun.boot.class.path = /usr/java/jdk1.8.0/jre/lib/resources.jar:/usr/java/jdk1.8.0/jre/lib/rt.jar:/usr/java/jdk1.8.0/jre/lib/sunrsasign.jar:/usr/java/jdk1.8.0/jre/lib/jsse.jar:/usr/java/jdk1.8.0/jre/lib/jce.jar:/usr/java/jdk1.8.0/jre/lib/charsets.jar:/usr/java/jdk1.8.0/jre/lib/jfr.jar:/usr/java/jdk1.8.0/jre/classes
java.awt.headless = true
java.vendor = Oracle Corporation
catalina.base = /tmp/tomcat.4197285406127585031.8080
com.zaxxer.hikari.pool_number = 1
file.separator = /
java.vendor.url.bug = http://bugreport.sun.com/bugreport/
sun.io.unicode.encoding = UnicodeLittle
sun.font.fontmanager = sun.awt.X11FontManager
sun.cpu.endian = little
sun.cpu.isalist = 

VM Flags:
Non-default VM flags: -XX:CICompilerCount=2 -XX:InitialHeapSize=268435456 -XX:MaxHeapSize=536870912 -XX:MaxNewSize=178782208 -XX:MinHeapDeltaBytes=524288 -XX:NewSize=89128960 -XX:OldSize=179306496 -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseFastUnorderedTimeStamps -XX:+UseParallelGC 
Command line:  -Dspring.profiles.active=prod -Xms256m -Xmx512m
-----------------------
#查看某个具体参数
#比如查询老年代大小
[root@iZy176vefq2r85Z ~]# jinfo -flag OldSize 21135
-XX:OldSize=179306496
#修改系统的参数信息
#比如打开gc日志打印
[root@iZy176vefq2r85Z ~]# jinfo -flag HeapDumpOnOutOfMemoryError 21135 #查询是否开启
-XX:-HeapDumpOnOutOfMemoryError #没有开启的
[root@iZy176vefq2r85Z ~]# jinfo -flag +HeapDumpOnOutOfMemoryError 21135 #使用命令开启
-XX:+HeapDumpOnOutOfMemoryError #开启了 
```

##### 4.Jmap（JVM内存占用信息和快照）

`jmap` 是 Java 提供的一个命令行工具，用于打印 Java 堆内存中的对象实例信息、堆内存布局的详细信息（包括每个类的实例数量、内存大小等）以及垃圾回收的详细信息。这个工具对于分析 Java 应用程序的内存使用情况、查找内存泄漏等问题非常有用。

> 使用

**使用场景：** 监控堆内存使用情况和对象占用情况， 生成堆内存快照文件，查看堆内存区域配置信息。

**格式：**jmap 【选项】【进程ID】

**选项：**

- `-dump`：生成java堆转储快照，格式为`-dump:[live.]format=b.flie=<filename>`，其中live子参数说明是否只dump出存活对象。
- `-finalizerinfo`：显示在`F-Queue`中等待`Finalizer`线程执行`finalize`方法的对象。只在Linux/Solaris平台下有效
- `-heap`：显示Java堆详细信息，如使用哪种回收器、参数配置、分状况等。只在Linux/Solaris平台下有效
- `-histo`：显示堆中对象统计信息，包括类、实例数量、合计容量
- `-permstar`： 以`ClassLoader`为统计口径显示永久代内存状态。只在Linux/Solaris平台下有效
- `-F`：当虚拟机进程对`-dump`选项没有响应时,可使用这个选项强制生成dump快照。只在Linux/Solaris平台下有效。

> 示例一 查看堆内存的配置和使用情况

```Bash
jmap -heap 21135
[root@iZy176vefq2r85Z ~]# jmap -heap 21135 #查看21135的堆使用情况
Attaching to process ID 21135, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.74-b02

using thread-local object allocation.
Parallel GC with 2 thread(s)

Heap Configuration: 
   MinHeapFreeRatio         = 0 #JVM堆缩减空间比率，低于则进行内存缩减
   MaxHeapFreeRatio         = 100 #JVM堆扩大内存空闲比例，高于则进行内存扩张 
   MaxHeapSize              = 536870912 (512.0MB) #堆最大内
   NewSize                  = 89128960 (85.0MB) #新生代初始化内存大小
   MaxNewSize               = 178782208 (170.5MB) #新生代最大内存
   OldSize                  = 179306496 (171.0MB) #老年代最大内存
   NewRatio                 = 2 #新生代和老年代占堆内存的比率 
   SurvivorRatio            = 8 #s区和eden区占新生代的比率
   MetaspaceSize            = 21807104 (20.796875MB) #元空间的初始化内存
   CompressedClassSpaceSize = 1073741824 (1024.0MB) #类指针压缩空间大小
   MaxMetaspaceSize         = 17592186044415 MB #元空间最大内存代销
   G1HeapRegionSize         = 0 (0.0MB) #G1收集器的region单元大小

Heap Usage:
PS Young Generation
Eden Space:
   capacity = 80740352 (77.0MB) #Eden区总容量
   used     = 73964304 (70.53785705566406MB) #Eden区使用容量
   free     = 6776048 (6.4621429443359375MB) #Eden区剩余容量
   91.60760656579748% used #Eden区使用比例
From Space: #From区(也就是Survivor中的S1区)
   capacity = 4194304 (4.0MB) #S1区总容量大小
   used     = 3108688 (2.9646759033203125MB) #S1区使用容量大小
   free     = 1085616 (1.0353240966796875MB) #S1区剩余容量大小
   74.11689758300781% used #s1区使用比率
To Space: #To区(也就是Survivor中的S0区)
   capacity = 4194304 (4.0MB) #S1区总容量大小
   used     = 0 (0.0MB) #S1区使用容量大小
   free     = 4194304 (4.0MB) #S1区剩余容量大小
   0.0% used #s0区使用比率
PS Old Generation
   capacity = 179306496 (171.0MB) #老年代总容量大小
   used     = 178995480 (170.7033920288086MB) #老年代使用容量大小
   free     = 311016 (0.29660797119140625MB) #老年代剩余容量大小
   99.82654504608689% used #老年代使用比率

29752 interned Strings occupying 3043968 bytes.
```

> 示例二 查看JVM中对应类型对象的数量、占用内存情况

```Bash
jmap -histo 21135 | sort -n -r -k 2 | head -10  #统计实例最多的类 前十位有哪些
jmap -histo 21135 | sort -n -r -k 3 | head -10  #统计合计容量前十的类有哪些  
[root@iZy176vefq2r85Z ~]# jmap -histo 21135 | sort -n -r -k 2 | head -10
Total       2157748      190900528
   4:        389661       12469152  java.util.HashMap$Node
   3:        209758       19442816  [C
   7:        208171        4996104  java.lang.String
   6:        166200        5318400  com.mysql.cj.conf.BooleanProperty
   5:        159323        6372920  java.util.TreeMap$Entry
   9:         81438        2606016  com.mysql.cj.conf.StringProperty
  11:         61291        1961312  java.util.concurrent.ConcurrentHashMap$Node
  15:         59611        1430664  java.util.concurrent.ConcurrentLinkedQueue$Node
  13:         53184        1701888  com.mysql.cj.conf.IntegerProperty
[root@iZy176vefq2r85Z ~]# jmap -histo 21135 | sort -n -r -k 3 | head -10
Total       2165605      192000696
   1:         37648       53851384  [B
   2:         24834       50891800  [I
   3:        209814       19448080  [C
   4:        389661       12469152  java.util.HashMap$Node
   5:        166680        6667200  java.util.TreeMap$Entry
   6:        166200        5318400  com.mysql.cj.conf.BooleanProperty
   7:        208206        4996944  java.lang.String
   8:         19813        3306136  [Ljava.util.HashMap$Node;
   9:         81438        2606016  com.mysql.cj.conf.StringProperty
```

> 示例三 dump 堆快照

```Bash
jmap -dump:live,format=b,file=/home/myheapdump.hprof 21135
live   加上live代表只dump存活的对象 ；
fomat  格式
filie  导出的文件名
18230  java进程ID
#执行
[root@iZy176vefq2r85Z ~]# jmap -dump:live,format=b,file=/home/myheapdump.hprof 21135
Dumping heap to /home/myheapdump.hprof ...
Heap dump file created
#
[root@iZy176vefq2r85Z ~]# cd /home/
[root@iZy176vefq2r85Z home]# ll
total 81252
-rw------- 1 root   root   83184243 Jun  2 16:38 myheapdump.hprof #文件生成完成

#这里生成的 dump文件可以用我们后面讲的可视化工具VisualVM来打开文件对里面的内容进行分析
```

##### 5.jstack（JVM线程信息监控）

`jstack`是Java开发工具包(JDK)中的一个命令行工具，用于生成Java虚拟机(JVM)当前时刻的线程快照。

主要功能：

- jstack主要用于生成JVM当前时刻的线程快照，这个快照包含了当前JVM内每一条线程正在执行的方法堆栈的集合。
- 通过分析线程快照，可以定位线程出现长时间停顿的原因，如线程间死锁、死循环、请求外部资源导致的长时间等待等。
- 当线程出现停顿或异常时，通过jstack查看各个线程的调用堆栈，可以了解没有响应的线程在后台的具体活动或等待的资源。

主要作用：

- **线程分析**：分析Java应用程序的线程信息，包括线程的状态、调用栈、锁信息等。
- **排查性能问题**：分析哪些线程占用了过多的CPU时间或处于长时间的阻塞状态，从而定位性能瓶颈。
- **监控与诊断**：对Java应用程序的运行状态进行监控和诊断，及时发现并解决潜在的线程相关问题。
- **调试分析**：在应用程序出现异常或错误时，使用jstack帮助开发人员快速定位和解决bug。

> 使用

**使用场景：** 查看JVM线程信息 和生成线程快照。

**格式：**

- jstack 【选项】 【进程ID】
- jstack [ 选项 ] executable core
- jstack [ 选项 ] [进程ID]远程IP

**选项：**

- `-F`：当正常输出的请求不被响应时，强制输出线程堆栈。
- `-l`：除堆栈外，显示关于锁的附加信息，例如属于java.util.concurrent的ownable synchronizers列表。
- `-m`：如果调用到本地方法的话，加上此参数可以显示本地方法的堆栈。
- `-h | -help`：打印帮助信息。

**常用方法：**

- 如果Java程序崩溃并生成了core文件，jstack可以用来获取core文件的Java stack和native stack信息，从而了解程序崩溃的原因和位置。
- 当Java程序处于hung（挂起）状态时，jstack可以attach到正在运行的Java程序中，获取当时的Java stack和native stack信息，帮助诊断问题。

> 实例

```Bash
#生成线程快照
jstack 21135
#简化示例
"Thread-1" #11 prio=5 os_prio=0 tid=0x00007f8878001000 nid=0x1234 runnable [0x0000700007a9e000]  
   java.lang.Thread.State: RUNNABLE  
        at com.example.MyClass.myMethod(MyClass.java:100)  
        at java.lang.Thread.run(Thread.java:748)  
  
"Thread-2" #12 prio=5 os_prio=0 tid=0x00007f8878002000 nid=0x1235 BLOCKED (on object monitor)  
    at com.example.MyOtherClass.synchronizedMethod(MyOtherClass.java:50)  
    - waiting to lock <0x000000076abcdef0> (a java.lang.Object)  
    at com.example.MyOtherClass.anotherMethod(MyOtherClass.java:60)  
    at java.lang.Thread.run(Thread.java:748)  
  
... 其他线程信息 ...
```

分析：

- **线程状态**：在上面的示例中，`Thread-1`处于`RUNNABLE`状态，表示它正在执行代码；而`Thread-2`处于`BLOCKED`状态，表示它正在等待获取某个对象的锁。
- **调用堆栈**：`Thread-1`正在执行`MyClass`类的`myMethod`方法；而`Thread-2`在等待获取一个`java.lang.Object`实例的锁，并且这个锁被其他线程持有（可能是`Thread-1`或其他线程）。
- **锁信息**：`Thread-2`在等待的锁的地址是`<0x000000076abcdef0>`，这可以帮助我们进一步定位问题。

#### 离线分析工具(VisualVM)

##### 概述

VisualVM是一个功能强大的Java虚拟机(JVM)监控、故障排除和性能分析工具。它提供了一个可视化的界面，允许开发人员和系统管理员深入查看Java应用程序的运行状态，从而诊断和解决性能问题。

**功能特点**

1. **监控功能**
   1. 监控应用程序的性能指标，如CPU使用率、内存使用率、线程活动等。
   2. 提供详细的CPU、内存、线程和类加载器等监控视图。
   3. 支持远程监控，可以连接到远程JVM实例并获取其实时性能数据。
2. **分析功能**
   1. 分析应用程序的性能瓶颈，包括CPU消耗、内存泄漏、线程死锁等。
   2. 提供CPU分析器、内存分析器和线程分析器等工具，帮助识别和解决性能问题。
   3. 可以生成性能快照和堆转储文件，用于离线分析。
3. **报告和快照功能**
   1. 生成CPU和内存快照，记录应用程序在特定时刻的状态和性能数据。
   2. 导出报告和快照文件，便于与团队成员共享和进一步分析。
4. **插件和扩展**
   1. VisualVM支持插件和扩展机制，可以通过安装插件来增强其功能。
   2. 插件可以提供额外的监控和分析功能，如GC日志分析、数据库连接池监控等。

##### 使用说明

1. **安装与启动**
   1. VisualVM通常随JDK一同安装，无需单独下载。
   2. 在命令行中运行`jvisualvm`命令即可启动VisualVM。
2. **连接JVM实例**
   1. 在VisualVM中，可以通过“本地”或“远程”选项卡连接到要监控的JVM实例。
   2. 对于远程JVM实例，需要配置JMX参数以便VisualVM能够连接到它。
3. **查看监控数据**
   1. 在VisualVM的监控选项卡下，可以查看CPU、内存、线程和类加载器等监控数据。
   2. 可以使用工具栏上的各种按钮和选项来定制监控视图的显示内容。
4. **使用分析器**
   1. VisualVM提供了CPU分析器、内存分析器和线程分析器等工具，可以帮助分析性能问题。
   2. 例如，可以使用CPU分析器来查看CPU时间轴并识别CPU消耗最高的方法和线程；使用内存分析器来检测内存泄漏和分析对象的内存使用情况。
5. **使用插件**
   1. 通过VisualVM的插件中心可以浏览和安装可用的插件。
   2. 安装插件后，可以在VisualVM的工具栏或菜单中找到并使用它们提供的功能。

VisualVM 不需要额外安装，我们安装JDK的时候就自带了VisualVM，在安装JDK的 bin目录下可以找到jvisualvm.exe

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTRhYzE1ZDVmNzZhNGU1NDRmNDE1NDczMDQxN2IxMTlfemhNOGVRd2d2UDNqRGZRQUZXdnJOdGh6cXlDbTU2Yk5fVG9rZW46VlhIOGI2OXlCb3NZV0x4SXpXaGNEVGpDbktiXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

##### 分析dump文件

因为我们通常都是没办法直接在生产环境进行调优分析的，所以一般都会把相关的内存、线程的dump文件拿到自己的电脑进行分析，VisualVM 支持导入dump文件的方式。

> 生成dump

```Bash
jmap -dump:live,format=b,file=/home/myheapdump.hprof 21135
//我们之前已经生成了直接导出到本地就可以
```

> 用VisualVM打开dump文件

点击文件->装入，导入你的myheapdump.hprof文件。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NDUwY2ZlMmZlMzk2MGIwYmEzNGEyYjdjYjlhNDc1ZmVfZURHQ0p6OHNlQVZYWU4wMGM2cFlpMTdZYkFzNE1EWFJfVG9rZW46TFhsZWJEUXNKb21kbnp4aU1CUGNhcXdJbkZjXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

导入成功后可以进行分析。

**概要信息 (相当于Jinfo指令获取的信息）**

这里面主要可以了解JVM环境配置、JDK版本，应用基本信息。

包括基本信息（dump文件的基本信息）、环境(jdk基本信息)、系统属性（应用参数信息）。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTU4MWU2NTEyZDljYTMyYTcwMDJmOTJhZjYwNTQ1ZjVfSm1yZWVHeEZyQzVCOGZ0N1hJUlFhTndhSEtFN1ZqbFVfVG9rZW46RWtOQWIyM3Zib0FFdWd4WkdqQWNuQUx2bjNjXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

**类信息（相当于Jmap 指令获取的信息）**

在这个栏目里面主要关注的是对应类型的对象 在内存中的实例对象实例树 、总占用空间大小分别是多少，如果是因为产生大对象、或者突然产生大批量的对象则可以通过这里定位到问题。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTZjOTEyYTE0NjRmNWM1OTYwZGQ5NWExNjY4YTI2ODBfN0p2elBCekVORXFLaGJlTFpJaUMxNk9LT2NJTllGV0RfVG9rZW46V09iRWI2YmJSbzJUMU54OEdkbGNZT2d2bkVoXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

> 示例 分析一个oom的dump文件

首先编写一个会导致oom的类：

```Java
public class HeapOOMTest {

    public static void main(String[] args) {
        // //返回虚拟机运行时试图调用的最大内存
        // long max = Runtime.getRuntime().maxMemory();
        // //返回jvm的总内存
        // long totalMemory = Runtime.getRuntime().totalMemory();
        //
        // System.out.println("max = " + max+"字节\t"+(max/(double)1024/1024)+"Mb");
        // System.out.println("totalMemory = " + totalMemory+"字节\t"+(totalMemory/(double)1024/1024)+"Mb");

        ArrayList<Picture> objects = new ArrayList<>();
        while (true) {
            objects.add(new Picture(new Random().nextInt(1024 * 1024)));
        }
    }
}

class Picture {
    int size;

    public Picture(int size) {
        this.size = size;

    }
}
```

设置参数，在oom时输出dump文件：

```Java
//设置内存8m 方便快速溢出
-Xms8m -Xmx8m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=D:\Documents\个人材料\笔记\jvm\dump
```

运行main函数：

```Java
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space //堆内存溢出
        at java.util.Arrays.copyOf(Arrays.java:3210)
        at java.util.Arrays.copyOf(Arrays.java:3181)
        at java.util.ArrayList.grow(ArrayList.java:267)
        at java.util.ArrayList.ensureExplicitCapacity(ArrayList.java:241)
        at java.util.ArrayList.ensureCapacityInternal(ArrayList.java:233)
        at java.util.ArrayList.add(ArrayList.java:464)
        at com.zunhui.basics.jvm.HeapOOMTest.main(HeapOOMTest.java:26)
```

找到dump文件，装入visualvm中：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTFlMzRmOTAyMjY4MmY2ZTBlOGIxNmY2NDJkNzM3YzFfRktQS1VlcG0yRHpLYUptRnkzY2o3N2xmUEN3TW1BeUJfVG9rZW46VmpGRmJpVG9wb0VKazl4cmpQOGNxUjdxblJjXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

直接在摘要中就显示出哪里发生了异常，点击main跳转对应的线程：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGUxNjk1MDIzOWZmYzg5ODE0NzA5MTEwN2E3ZjI2M2RfR25NR2hqYlVkY0Q5R1I1S3BVZjFwVlFKaU5ERzJoMDlfVG9rZW46VWlPU2J6U2ZTb0hTWFd4UGpwbmMzT1hwblVoXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

直接找到报错线程，告诉我们在HeapOOMTest类中的26行代码引起报错：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDU3MzNiMTU4N2YzZTVhMGVlNTdlNjU0NjYyYWE0ZGVfdERpemFYWXdjR2dWdnVnQjRLamxoWE95Wk1FR0ZqTUZfVG9rZW46THQ1U2JobDlIb1UwTEZ4Y0ZrZWNZS1Q1bkVmXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

回到程序，确实是26行代码，不停的往集合添加对象，导致溢出，这样就快速定位到了问题。

##### VisualVM远程监控

VisualVM 不仅能监控本地的应用程序，还可以监控远程服务器上的应用，虽然远程监控一般不会用于生产环境的，但是在测试环境做一些压力测试做一些性能的预调优，这个时候使用VisualVM来远程监控测试服务器的JVM使用情况，这样有助于我们了解到JVM的实时运行状态而进行优化和调整。

> 不作为重点 后面补充

#### 第三方在线监控工具(Arthas)

##### 概述

**Arthas是一款由阿里巴巴开源的Java线上监控诊断工具，为开发人员提供了强大的工具来实时查看应用的状态信息，并进行业务问题的诊断，而无需修改应用代码。**

官方文档：(https://arthas.aliyun.com/doc/)

##### 功能特点

- **实时监控**：Arthas支持实时监控Java应用的运行状态，包括应用的load、内存、GC（垃圾回收）和线程状态等，涵盖jps ,jstat ,jinfo ,jstack ,jmap部分功能。
- **故障诊断**：能够查看方法调用的出入参、异常，监测方法执行耗时，类加载信息等，为开发人员提供全面的监控和诊断能力。
- **支持JDK6+**：Arthas兼容性强，支持从JDK 6到更高版本的Java应用。
- **跨平台**：在Linux、Mac和Windows系统上均可使用。
- **命令行交互**：采用命令行交互模式，提供丰富的Tab自动补全功能，方便问题的定位和诊断。
- **动态代码修改**：Arthas支持JavaAgent技术，能够在运行时修改Java类的字节码，获取类加载信息，甚至获取某个对象的大小。
- **支持扩展**：提供多种命令和工具，如`Thread`（查看线程相关堆栈信息）、`jvm`（查看JVM相关信息）、`sysprop`（查看/修改系统属性）、`sm`（查看已加载方法信息）等。

##### 使用场景

- 当线上环境某个方法数据处理有问题，但没有日志埋点等记录入参和出参信息，无法debug，并且本地环境无法重现问题时。
- 线上接口调用响应缓慢，耗时高，但接口逻辑复杂，接口内部又调用很多其他系统的接口或第三方的jar，无法定位到具体方法时。
- 出问题的方法被执行的路径非常多，无法确定该方法是在哪些具体的地方被调用或执行时。
- 无法确定线上环境是否是最新提交的代码，需要验证服务器上的class文件时。
- 线上出现偶发问题或只是某些条件下才会触发，通过日志不容易排查时。

##### 安装与配置

Arthas的安装和配置过程相对简便，可以通过Shell脚本、手动下载压缩包或在Windows系统中直接下载as.bat文件来进行安装。

- 下载 ：`curl -O https://arthas.aliyun.com/arthas-boot.jar`
- 启动：`java -jar arthas-boot.jar`
- 选择监控的应用:athas启动成功后会打印出来当前服务器的所有java进程，然后以编号的形式排列出来，在控制台输入你想要监控的应用编号即可进入arthas的监控控制台。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NmZiMzc2NTdmMDg1ZTZhNWViYTMyMjAwOTIzNWM1ZjNfeDY5UnM0OHI5bVdWZ2ZjM21YQ3BhU1RSNVhKbnhsUHJfVG9rZW46T3lacWJiV1R1b2JPOTZ4ZlBHV2NuUmNubjFmXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

##### 核心监视功能

**Dashboard**命令

在控制台输入dashboard 回车后会看到下图对应的信息，这里主要展示了当前监控的进程信息、包括 实时的线程信息、内存分配和使用状态信息、系统环境信息。

输入 `q` 或者 `Ctrl+C` 可以退出dashboard命令

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=Nzc3NWU1MDg3NWYwMWRiNmViYjdkMTcwZjIwZjE4MjZfQUFEemR4NnBjY2xXVGpoRzJsWkZ6T2huMkl5V2pTeTRfVG9rZW46UWlxdGJ1ZVQ2b3BsbTV4R09nZGM0dnJLbkRSXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

数据说明：

- `ID`：Java级别的线程ID，注意这个ID不能跟jstack中的nativeID一一对应
- `NAME`：线程名
- `GROUP`：线程组名
- `PRIORITY`：线程优先级, 1~10之间的数字，越大表示优先级越高
- `STATE`：线程的状态
- `CPU%`：线程消耗的cpu占比，采样100ms，将所有线程在这100ms内的cpu使用量求和，再算出每个线程的cpu使用占比。
- `TIME`：线程运行总时间，数据格式为`分：秒`
- `INTERRUPTED`：线程当前的中断位状态
- `DAEMON`：是否是daemon线程

`monitor`**监控方法的执行情况**

监控指定类中方法的执行情况

用来监视一个时间段中指定方法的执行次数，成功次数，失败次数，耗时等这些信息

参数：方法拥有一个命名参数 `[c:]`，意思是统计周期（cycle of output），拥有一个整型的参数值

```Bash
#表示监视demo.MathGame类的primeFactors方法每5s更新一次
monitor demo.MathGame primeFactors -c 5
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGMyOWEwZjM3MzUyYWUxNjM4MGMzNjk2NmIwODBkMTRfV2FseTdCMU40RjhNSGVKWW9OMFBZWXJWdzJqYXI2MFlfVG9rZW46UWxsZWJHTVdZb2V6STd4V1RwSGNyWnJoblJnXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

监控指标：

| 监控项    | 说明                       |
| --------- | -------------------------- |
| timestamp | 时间戳                     |
| class     | Java类                     |
| method    | 方法（构造方法、普通方法） |
| total     | 调用次数                   |
| success   | 成功次数                   |
| fail      | 失败次数                   |
| rt        | 平均耗时                   |
| fail-rate | 失败率                     |

`watch`**检测函数返回值**：

方法执行数据观测，让你能方便的观察到指定方法的调用情况。

能观察到的范围为：`返回值`、`抛出异常`、`入参`，通过编写`OGNL`表达式进行对应变量的查看。

参数说明：

watch 的参数比较多，主要是因为它能在 4 个不同的场景观察对象

| 参数名称          | 参数说明                                          |
| ----------------- | ------------------------------------------------- |
| class-pattern     | 类名表达式匹配                                    |
| method-pattern    | 方法名表达式匹配                                  |
| express           | 观察表达式                                        |
| condition-express | 条件表达式                                        |
| [b]               | 在**方法调用之前**观察before                      |
| [e]               | 在**方法异常之后**观察 exception                  |
| [s]               | 在**方法返回之后**观察 success                    |
| [f]               | 在**方法结束之后**(正常返回和异常返回)观察 finish |
| [E]               | 开启正则表达式匹配，默认为通配符匹配              |
| [x:]              | 指定输出结果的属性遍历深度，默认为 1              |

这里重点要说明的是观察表达式，观察表达式的构成主要由ognl 表达式组成，所以你可以这样写`"{params,returnObj}"`，只要是一个合法的 ognl 表达式，都能被正常支持。

> 示例

```Bash
#        查看方法执行的返回值
watch demo.MathGame primeFactors returnObj
#        观察demo.MathGame类中primeFactors方法出参和返回值，结果属性遍历深度为2。
#        params：表示所有参数数组(因为不确定是几个参数)。
#        returnObject：表示返回值
watch demo.MathGame primeFactors "{params,returnObj}" -x 2
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTQyYjZjYWJiNzZiODQxMGE1YjYwMzkzYTBjYjM4ZWFfbGFBUzFSdUpwZmJOTzl3ZHlKUnBvSTBONTNJcWtlNFRfVG9rZW46WFBrTGJwOEFUb1Z6dHZ4cU9iRGNuVzhXbkFkXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

检测方法在执行前`-b`、执行后`-s`的入参`params`、属性`target`和返回值`returnObj`

```Shell
watch demo.MathGame primeFactors "{params,target,returnObj}" -x 2 -b -s -n 2
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTRjZGQ4OWE2ZmRmNmVhNDZkN2ZiMDY0NDM2MDU1YWNfcGVHOUpCTkI4UjBJTUE1d3M5aGl2eW5xUjRJRTFWNTZfVG9rZW46QUpxRWIwT1J3b1ppMm94anhCSWM2RW9JbnFnXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

**`trace`****：根据路径追踪，并记录消耗时间**

对方法内部调用路径进行追踪，并输出方法路径上的每个节点上耗时。

trace 命令能主动搜索 class-pattern／method-pattern 对应的方法调用路径，渲染和统计整个调用链路上的所有性能开销和追踪调用链路。

> 示例

```Bash
#        trace函数指定类的指定方法
trace demo.MathGame run
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NWI2NmU2MGMwYmU1NzQ2MTZlNDkzMjdmNjZmOWExMTJfMUlEbFRnUkRTczZrRGtSZ0U5eVJzaU9VUjBPdVp6bHRfVG9rZW46TDR6WmJHQWJHb0dGbXh4N2h3OWN1Q0ZjbjBiXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

`stack`：**输出当前方法被调用的调用路径**

输出当前方法被调用的调用路径

很多时候我们都知道一个方法被执行，但这个方法被执行的路径非常多，或者你根本就不知道这个方法是从那里被执行了，此时你需要的是 stack 命令。

**参数说明**

| 参数名称            | 参数说明                             |
| ------------------- | ------------------------------------ |
| *class-pattern*     | 类名表达式匹配                       |
| *method-pattern*    | 方法名表达式匹配                     |
| *condition-express* | 条件表达式，OGNL                     |
| [E]                 | 开启正则表达式匹配，默认为通配符匹配 |
| [n:]                | 执行次数限制                         |

> 示例

```Bash
#        获取primeFactors的调用路径
stack demo.MathGame primeFactors
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTBiMzc2MDBhNzk1MTk3Y2VlOTdmMWVjMDRmODRjN2JfMDREM3VDREV4cE5yS2VkdkV5WG5ydmkwN2psYTdlVmVfVG9rZW46Szdvd2JMQUlsb0diRWh4cHhmQWNwSHQzbmFiXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

**`tt`****：时间隧道，记录多个请求**

time-tunnel 时间隧道。

记录下指定方法每次调用的入参和返回信息，并能对这些不同时间下调用的信息进行观测

> 简介

watch 虽然很方便和灵活，但需要提前想清楚观察表达式的拼写，这对排查问题而言要求太高，因为很多时候我们并不清楚问题出自于何方，只能靠蛛丝马迹进行猜测。

这个时候如果能记录下当时方法调用的所有入参和返回值、抛出的异常会对整个问题的思考与判断非常有帮助。

于是乎，TimeTunnel 命令就诞生了。

作用：记录指定方法每次调用的入参和返回值，并后期还可以对这些信息进行观测

**参数解析：**

| tt的参数  | 说明                             |
| --------- | -------------------------------- |
| -t        | 记录某个方法在一个时间段中的调用 |
| -l        | 显示所有已经记录的列表           |
| -n 次数   | 只记录多少次                     |
| -s 表达式 | 搜索表达式                       |
| -i 索引号 | 查看指定索引号的详细调用信息     |
| -p        | 重新调用：指定的索引号时间碎片   |

- `-t`
- tt 命令有很多个主参数，-t 就是其中之一。这个参数表明希望记录下类 *Test 的 print 方法的每次执行情况。
- `-n 3`
- 当你执行一个调用量不高的方法时可能你还能有足够的时间用 CTRL+C 中断 tt 命令记录的过程，但如果遇到调用量非常大的方法，瞬间就能将你的 JVM 内存撑爆。
- 此时你可以通过 -n 参数指定你需要记录的次数，当达到记录次数时 Arthas 会主动中断tt命令的记录过程，避免人工操作无法停止的情况。

> 示例

```Bash
#        最基本的使用来说，就是记录下当前方法的每次调用环境现场。
tt -t demo.MathGame primeFactors
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NmQ5NGMxMzU5OGEzMWNhYjQ1ZjI5N2FkZDViMjc1ZmNfbkN1QVhiWDNRMnpRSkhBdzFlTmNhVHJXQjJmUFh6R0ZfVG9rZW46RVQ0eGJPSHh2b05mWVh4d3IzemNscGc2bnZlXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

字段说明：

| 表格字段  | 字段解释                                                     |
| --------- | ------------------------------------------------------------ |
| INDEX     | 时间片段记录编号，每一个编号代表着一次调用，后续tt还有很多命令都是基于此编号指定记录操作，非常重要。 |
| TIMESTAMP | 方法执行的本机时间，记录了这个时间片段所发生的本机时间       |
| COST(ms)  | 方法执行的耗时                                               |
| IS-RET    | 方法是否以正常返回的形式结束                                 |
| IS-EXP    | 方法是否以抛异常的形式结束                                   |
| OBJECT    | 执行对象的`hashCode()`，注意，曾经有人误认为是对象在JVM中的内存地址，但很遗憾他不是。但他能帮助你简单的标记当前执行方法的类实体 |
| CLASS     | 执行的类名                                                   |
| METHOD    | 执行的方法名                                                 |

```Bash
#        对现有记录进行检索
#        需要筛选出 `primeFactors` 方法的调用信息
tt -s 'method.name=="primeFactors"'
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDJhMGNkZGJhYjA0MTI5YmFlMjc4MGEzYWM1NWJmNWJfcWpLdUlVbHhQRjg5ZzFLa25YYm1BRDRqbDZnQzFpZ2VfVG9rZW46SjdESWJtS29qb05LWnh4SGNtTWNtMlJkbjZjXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

```Bash
#        查看某条记录详细信息
tt -i 1002
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTU0OWE2NmQ2ZjU0Yzc2OTMyZmYwNTZjNzNiZGQ0MDJfWHBJcTlUVVl2T1ppNWtoZEF2VVJyelhhZDJIMUIwdFRfVG9rZW46THZleGJTOWdGb29GanZ4ZjRRQWMyWUI1bm5iXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

##### 项目中常用

```Bash
#        在浏览器上进行登录操作，检查最耗时的方法
trace *.DispatcherServlet *

#可以分步trace，请求最终是被DispatcherServlet#doDispatch()处理了
trace *.FrameworkServlet doService

#trace结果里把调用的行号打印出来了，我们可以直接在IDE里查看代码（也可以用jad命令反编译）
jad --source-only *.DispatcherServlet doDispatch

#trace：查询最耗时应用
watch *.DispatcherServlet getHandler 'returnObj'
#捕获耗时应用入参、返回值
watch com.itleima.controller.* * {params,returnObj} -x 2
```

##### 基础命令

```Bash
help：显示Arthas命令介绍
cat：显示文件下，文本内容
grep： 管道命令
        -n        显示行号
        -i        忽略大小写查找
        -m 行数        最大显示行数，要与查询字符串一起使用
        -e “正则表达式”        使用正则表达式查找
pwd：打印当前的工作目录
session：查看当前会话的信息
reset：重置增强后类 重置增强类，将被 Arthas 增强过的类全部还原，Arthas 服务端关闭时会重置所有增强过的类
version：查看当前Arthas版本
history：查看历史命令
quit：退出Arthas客户端
stop：关闭 Arthas 服务端 所有 Arthas 客户端全部退出
keymap：查看Arthas快捷键
```

##### Jvm相关命令

| jvm相关命令 | 说明                                                  |
| ----------- | ----------------------------------------------------- |
| dashboard   | 仪表板，可以显示：线程，内存，堆栈，GC，Runtime等信息 |
| thread      | 显示线程信息                                          |
| jvm         | 与JVM相关的信息                                       |
| sysprop     | 显示系统属性信息，也可以修改某个属性                  |
| sysenv      | 查看JVM环境变量的值                                   |
| vmoption    | 查看JVM中选项，可以修改                               |
| getstatic   | 获取静态成员变量                                      |
| ognl        | 执行一条ognl表达式，对象图导航语言                    |

```Bash
#thread相关
thread                                #        显示所有线程的信息
thread 1                        #        显示1号线程的运行堆栈
thread -b                        #        查看阻塞的线程信息
thread -n 3                        #        查看最忙的3个线程，并打印堆栈
thread -i 1000 -n 3        #        指定采样时间间隔，每过1000毫秒采样，显示最占时间的3个线程
#查看处于等待状态的线程（WAITING、BLOCKED）
thread --state WAITING
#死锁线程查看
thread                # 查看线程状态
thread -b        #        查看阻塞的线程信息
#jvm
#sysprop 查看/修改属性
sysprop                                                #        查看所有属性
sysprop java.version                #        查看单个属性，支持通过tab补全
#修改某个属性
sysprop user.country
user.country=US
#sysenv
# 查看所有环境变量
sysenv
# 查看单个环境变量
sysenv USER
#vmpotion：查看JVM中选项
#查看所有的选项
vmoption
#查看指定的选项
vmoption PrintGCDetails
#更新指定的选项
vmoption PrintGCDetails true
#getstatic：获取静态成员变量
#语法
getstatic 类名 属性名
#显示demo.MathGame类中静态属性random
getstatic demo.MathGame random
#ognl：执行ognl表达式
#获取系统变量中值，并且打印(只会打印有返回值函数)
ognl '@java.lang.System@out.println("hello")'
#获取代码中的运行返回值
ognl '@demo.MathGame@random'
#计算value1、value2值，并存在List集合中
ognl '#value1=@System@getProperty("java.home"), #value2=@System@getProperty("java.runtime.name"), {#value1, #value2}'
```

##### 类加载相关

```Bash
#模糊搜索，demo包下所有的类
sc demo.*
#打印类的详细信息
sc -d demo.MathGame

#显示String类加载的方法
sm java.lang.String
# 看方法信息
sm demo.MathGame
#查看方法信息(详细信息-d)
sm -d demo.MathGame
#        反编译MathGame方法
jad demo.MathGame

#反编绎时只显示源代码(排除ClassLoader信息)。
#默认情况下，反编译结果里会带有ClassLoader信息，通过--source-only选项，可以只打印源代码。方便和mc/redefine命令结合使用。
jad --source-only demo.MathGame
#反编译到指定文件中
jad --source-only demo.MathGame > Hello.java
#只反编译mathGame类型中main方法
jad demo.MathGame main

#在内存中编译Hello.java为Hello.class
mc /root/Hello.java
#可以通过-d命令指定输出目录
mc -d /root/bbb /root/Hello.java

#redefine：加载外部.class文件
#1. 使用jad反编译demo.MathGame输出到/root/MathGame.java
jad --source-only demo.MathGame > /root/MathGame.java
#2.按上面的代码编辑完毕以后，使用mc内存中对新的代码编译
mc /root/MathGame.java -d /root
#3.使用redefine命令加载新的字节码
redefine /root/demo/MathGame.class

#dump 保存已加载字节码文件到本地
#把String类的字节码文件保存到~/logs/arthas/classdump/目录下
dump java.lang.String
#把demo包下所有的类的字节码文件保存到~/logs/arthas/classdump/目录下
dump demo.*

#默认按类加载器的类型查看统计信息
classloader
#按类加载器的实例查看统计信息，可以看到类加载的hashCode
classloader -l
#查看ClassLoader的继承树
classloader -t
#通过类加载器的hash，查看此类加载器实际所在的位置
classloader -c 680f2737
#使用ClassLoader去查找指定资源resource所在的位置
classloader -c 680f2737 -r META-INF/MANIFEST.MF
#使用ClassLoader去查找类的class文件所在的位置
classloader -c 680f2737 -r java/lang/String.class
#使用ClassLoader去加载类
classloader -c 70dea4e --load java.lang.String
```

##### profiler火焰图

`profiler` 命令支持生成应用热点的火焰图。本质上是通过不断的采样，然后把收集到的采样结果生成火焰图。

**常用命令**

| profiler            | 命令作用                                                     |
| ------------------- | ------------------------------------------------------------ |
| profiler start      | 启动profiler，默认情况下，生成cpu的火焰图                    |
| profiler list       | 显示所有支持的事件                                           |
| profiler getSamples | 获取已采集的sample的数量                                     |
| profiler status     | 查看profiler的状态，运行的时间                               |
| profiler stop       | 停止profiler，生成火焰图的结果，指定输出目录和输出格式：svg或html |

**启动****`profiler`**

```Shell
profiler start
```

默认情况下，生成的是cpu的火焰图，即event为`cpu`。可以用`--event`参数来指定。

**显示支持的事件**

```Shell
profiler list
```

**获取已采集的****`sample`****的数量**

```Shell
profiler getSamples
```

**查看****`profiler`****状态**(可以查看当前`profiler`在采样哪种`event`和采样时间。)

```Shell
profiler status
```

**停止****`profiler`****，并同步生成文件**（默认在`工作目录`下的`arthas-output`目录。）

```Shell
profiler stop
profiler output file: /tmp/demo/arthas-output/20191125-135546.svg
```

**通过** **`--file`****参数来指定输出结果路径**

```Plaintext
# 指定生成的文件名以及路径
profiler stop --file /tmp/result.svg
```

**可以用****`--format`****指定生成格式**

```Shell
profiler stop --format html
```

生成的图

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YjAwNGU0NTY4NTVmMDI2NWEwMDhlMTBhYWVjOTAyMWFfU0NXRWVHVzhZcWJnUzFPNUdQVUVva1VSSHZqWXRLQmZfVG9rZW46SUdqcGJHSXpPb0N3T0x4VEZKZ2Nxcm5vblJkXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

**火焰图的含义**

火焰图是基于 perf 结果产生的SVG 图片，用来展示 CPU 的调用栈。

- y 轴表示调用栈，每一层都是一个函数。**调用栈越深，火焰就越高，顶部就是正在执行的函数，下方都是它的父函数**。
- x 轴表示抽样数，如果一个函数在 x 轴占据的**宽度越宽，就表示它被抽到的次数多，即执行的时间长**。注意，x 轴不代表时间，而是所有的调用栈合并后，按字母顺序排列的。

**火焰图就是看顶层的哪个函数占据的宽度最大。只要有"平顶"（plateaus），就表示该函数可能存在性能问题。**

颜色没有特殊含义，因为火焰图表示的是 CPU 的繁忙程度，所以一般选择暖色调。

其他相关学习，看官网。

### GC日志

#### GC日志采集

在服务器上我们需要配置一些参数才能采集到历史的GC日志信息，这些参数通常在项目启动的时候就需要指定

```Bash
java  -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+UseGCLogFileRotation  -XX:+PrintHeapAtGC -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M    -Xloggc:/opt/ard-user-gc-%t.log  -jar test-user-1.0-SNAPSHOT.jar 
```

这些参数意思是把GC日志记录到/opt/app/abc-user/test-user-gc-%t.log 这个文件里，每个文件大小为20M，一共生成5个文件，超过的话则覆盖。

相关参数说明：

```Bash
-Xloggc:/opt/app/ard-user/ard-user-gc-%t.log   #设置日志目录和日志名称
-XX:+UseGCLogFileRotation           #开启滚动生成日志
-XX:NumberOfGCLogFiles=5            #滚动GC日志文件数，默认0，不滚动
-XX:GCLogFileSize=20M               #GC文件滚动大小，需开启UseGCLogFileRotation
-XX:+PrintGCDetails                 #开启记录GC日志详细信息（包括GC类型、各个操作使用的时间）,并且在程序运行结束打印出JVM的内存占用情况
-XX:+ PrintGCDateStamps             #记录系统的GC时间           
-XX:+PrintGCCause                   #产生GC的原因(默认开启)
```

#### Ps+Po日志解析

**ParallelScavenge + Parallel Old日志主要会包括下面几类信息：**

**1、GC类型：** 这里会告诉我们产生的是YGC （YGC 代表新生代的GC只会收集Eden区和Survivor ）、 还是Full GC（Full GC是针对于整个堆进行搜集）

**2、GC产生的原因：**这里一般都会告诉我们是因为什么原因导致产生GC，一般通过这里可以分析出具体是因为哪个区域空间不够了导致的GC。

**3、回收的情况：**这里主要体现出回收的成果，通过数据告诉我们 回收之前的区域对象占用空间大小、回收之后区域对象占用空间的大小 、当前区域的空间大小、回收使用的时长。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MjM4NTA2NGQ2NTlkM2UxMmFhZDUyODAzMjAzMjRkOWFfbXlnME5WdjJaZFdyd2ZKdVFPTFdiUWZ6QTBIeWcxd2FfVG9rZW46SFlsaGJGQUt2b1JPSzh4SENHOGNMa2VPbm1iXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

#### CMS日志解析

如果老年代采用的CMS收集器，那么JVM默认会选择ParNew作为新生代收集器与CMS配合。所以使用CMS后主要是有两种日志类型，一种是ParNew的新生代收集日志，一种是CMS的老年代收集日志。

> 新生代GC日志（PaNew）

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YzFkMTQ3MTBlMDc3YTlkNWM0YTllZjhlNmFlNzk2MmNfYnh6b0pPOUJPOWZyR0szSDlLOUtVZ2FNVDh1U25sYTJfVG9rZW46Rmg2Y2JNTERWbzNtVUl4OVppcWNRR1ZLbm5nXzE3ODE3NDUyMTQ6MTc4MTc0ODgxNF9WNA&add_watermark=true&scene_type=CCM)

> 老年代的GC日志（CMS）

CMS日志和之前PS+PO的日志有很大区别，主要是CMS收集机制与之前的收集器不一样，CMS根据阶段来记录GC日志的，GC日志主要分为6个阶段。

```Java
//第一阶段 初始标记，CMS的第一个STW阶段，这个阶段会所有的GC Roots进行标记。
 2020-10-20T17:04:45.424+0800: 10.756: [GC (CMS Initial Mark) [1 CMS-initial-mark: 68287K(68288K)] 69551K(99008K), 0.0019516 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
 解析：CMS Initial Mark 说明该阶段为初始标记阶段，68287K(68288K)当前老年代空间的用量和总量，69551K(99008K)当前堆空间的用量和总量，0.0019516 secs初始化标记所耗费的时间。


 //第二阶段并发标记
 2020-10-20T17:04:45.426+0800: 10.758: [CMS-concurrent-mark-start]
 2020-10-20T17:04:45.519+0800: 10.850: [CMS-concurrent-mark: 0.092/0.092 secs] [Times: user=0.56 sys=0.01, real=0.09 secs]
 解析:CMS-concurrent-mark: 0.092/0.092 secs] 并发标记所所耗费的时间


 //第三阶段 并发预清理阶段，并发执行的阶段。在本阶段，会查找前一阶段执行过程中,从新生代晋升或新分配或被更新的对象。通过并发地重新扫描这些对象，预清理阶段可以减少重新标记阶段的工作量。
 2020-10-20T17:04:45.519+0800: 10.850: [CMS-concurrent-preclean-start]
 2020-10-20T17:04:45.598+0800: 10.930: [CMS-concu解析rrent-preclean: 0.080/0.080 secs] [Times: user=0.46 sys=0.00, real=0.08 secs]
 解析： [CMS-concurrent-preclean: 0.080/0.080 secs] 预清阶段所使用功能的时间。


 //第四阶段 并发可中止的预清理阶段。这个阶段工作和上一个阶段差不多。增加这一阶段是为了让我们可以控制这个阶段的结束时机，比如扫描多长时间（默认5秒）或者Eden区使用占比达到期望比例（默认50%）就结束本阶段。
 2020-10-20T17:04:45.599+0800: 10.930: [CMS-concurrent-abortable-preclean-start]
 2020-10-20T17:04:45.599+0800: 10.930: [CMS-concurrent-abortable-preclean: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]


 //第五阶段 重新标记阶段，需要STW，从GC Root开始重新扫描整堆，标记存活的对象。需要注意的是，虽然CMS只回收老年代的垃圾对象，但是这个阶段依然需要扫描新生代，因为很多GC Root都在新生代。
 2020-10-20T17:04:45.608+0800: 10.939: [GC (CMS Final Remark) [YG occupancy: 25310 K (30720 K)]2020-10-20T17:04:45.608+0800: 10.939: [Rescan (parallel) , 0.0117481 secs]2020-10-20T17:04:45.620+0800: 10.951: [weak refs processing, 0.0000354 secs]2020-10-20T17:04:45.620+0800: 10.951: [class unloading, 0.0268352 secs]2020-10-20T17:04:45.647+0800: 10.978: [scrub symbol table, 0.0053781 secs]2020-10-20T17:04:45.652+0800: 10.983: [scrub string table, 0.0006005 secs][1 CMS-remark: 68287K(68288K)] 93598K(99008K), 0.0447563 secs] [Times: user=0.18 sys=0.00, real=0.04 secs]
 解析：
  [YG occupancy: 25310 K (30720 K)] =》 新生代空间占用大小，新生代总大小。
 [Rescan (parallel) , 0.0117481 secs] =》 暂停用户线程的情况下完成对所有存活对象的标记，此阶段所花费的时间。
 [weak refs processing, 0.0000354 secs] =》第一步 标记处理弱引用；
 [class unloading, 0.0033120 secs] =》 第二步，标记那些已卸载未使用的类；
  [scrub symbol table, 0.0053781 secs][scrub string table, 0.0004780 secs =》 最后标记未被引用的常量池对象。
  [1 CMS-remark: 68287K(68288K)] 93598K(99008K), 0.0447563 secs] =》 重新标记完成后 老年代使用量与总量，堆空间使用量与总量。
  [Times: user=0.18 sys=0.00, real=0.04 secs] =》 各个维度的时间消耗。


  //第六阶段 并发清理阶段， 对前面标记的所有可回收对象进行回收
 2020-10-20T17:04:45.653+0800: 10.984: [CMS-concurrent-sweep-start]
 2020-10-20T17:04:45.689+0800: 11.020: [CMS-concurrent-sweep: 0.036/0.036 secs] [Times: user=0.20 sys=0.01, real=0.04 secs]
 2020-10-20T17:04:45.689+0800: 11.020: [CMS-concurrent-reset-start]
 2020-10-20T17:04:45.689+0800: 11.021: [CMS-concurrent-reset: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]
 解析：
 [CMS-concurrent-sweep: 0.036/0.036 secs]  开并发清理所耗费的时间。
 [CMS-concurrent-reset: 0.000/0.000 secs]  重置数据和结构信息。
```

#### G1日志解析

G1会有3种类型的GC，YGC（只会对新生代空间进行GC）、Miexd GC（混合GC，对新生代和部分老年代进行GC）、FGC（Full FC ，对整堆进行GC）。

> Young GC日志

对新生代内存空间进行回收。

```Java
2020-10-20T20:06:24.845+0800: 3.927: [GC pause (G1 Evacuation Pause) (young), 0.0142232 secs]     //GC发生的系统时间，GC发生在程序启动后的多少秒后产生的GC。
//该GC产生STW(由对象复制空间不足造成的STW）(发生在young区)，整个阶段的耗时。

//下面是整个GC细节过程的耗时情况
[Parallel Time: 12.9 ms, GC Workers: 8]        // 开启了8个GC线程            
[GC Worker Start (ms): Min: 3926.9, Avg: 3934.2, Max: 3939.7, Diff: 12.8] // 工作线程启动时间
[Ext Root Scanning (ms): Min: 0.0, Avg: 0.3, Max: 2.5, Diff: 2.5, Sum: 2.6] //扫描root的耗时
[Update RS (ms): Min: 0.0, Avg: 0.3, Max: 2.1, Diff: 2.1, Sum: 2.1]    //更新RS的耗时
[Processed Buffers: Min: 0, Avg: 1.9, Max: 15, Diff: 15, Sum: 15]   
[Scan RS (ms): Min: 0.0, Avg: 0.0, Max: 0.1, Diff: 0.0, Sum: 0.1]     //扫描RS的耗时
[Code Root Scanning (ms): Min: 0.0, Avg: 0.1, Max: 0.6, Diff: 0.6, Sum: 0.6]  //
[Object Copy (ms): Min: 0.0, Avg: 4.5, Max: 7.1, Diff: 7.1, Sum: 35.9] //对象拷贝耗时
[Termination (ms): Min: 0.0, Avg: 0.4, Max: 0.5, Diff: 0.5, Sum: 2.9]
[Termination Attempts: Min: 1, Avg: 74.2, Max: 133, Diff: 132, Sum: 594]
[GC Worker Other (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.1] 
[GC Worker Total (ms): Min: 0.0, Avg: 5.5, Max: 12.8, Diff: 12.8, Sum: 44.3]
[GC Worker End (ms): Min: 3939.7, Avg: 3939.7, Max: 3939.8, Diff: 0.0]
[Code Root Fixup: 0.0 ms]
[Code Root Purge: 0.0 ms]
[Clear CT: 0.3 ms]
[Other: 1.1 ms]          //其它任务的耗时
[Choose CSet: 0.0 ms]  //CSet选择Region的时间
[Ref Proc: 0.7 ms]    //处理对象引用的时间
[Ref Enq: 0.0 ms]     //引用入ReferenceQueues队列的时间
[Redirty Cards: 0.2 ms]
[Humongous Register: 0.0 ms]
[Humongous Reclaim: 0.0 ms]
[Free CSet: 0.0 ms]               //释放CSet时间


[Eden: 52.0M(52.0M)->0.0B(52.0M) Survivors: 8192.0K->8192.0K Heap: 74.2M(100.0M)->25.6M(100.0M)]
Eden 回收前用量（总容量)->回收后用量(总容量),Survivors区回收前用量-回收后用量， 堆内存回收前用量（总容量）->回收后用量（总容量）
```

> Miexd GC日志

Miexd GC回收整个新生代和部分老年代。

```Java
 2020-10-20T20:06:25.068+0800: 4.151: [GC pause (Metadata GC Threshold) (young) (initial-mark), 0.0076494 secs]
 //GC产生STW(Metadata空间不足引起的GC）(initial-mark 说明整个GC属于混合GC，YGC和初始化标记阶段同时进行)。
 
 //下面和YGC一样，是整个GC细节过程的耗时情况,
    [Parallel Time: 6.1 ms, GC Workers: 8]
       [GC Worker Start (ms): Min: 4150.8, Avg: 4150.9, Max: 4151.0, Diff: 0.1]
       [Ext Root Scanning (ms): Min: 0.6, Avg: 2.3, Max: 5.8, Diff: 5.2, Sum: 18.3]
       [Update RS (ms): Min: 0.0, Avg: 0.5, Max: 0.8, Diff: 0.8, Sum: 4.2]
          [Processed Buffers: Min: 0, Avg: 2.2, Max: 7, Diff: 7, Sum: 18]
       [Scan RS (ms): Min: 0.0, Avg: 0.1, Max: 0.2, Diff: 0.2, Sum: 0.5]
       [Code Root Scanning (ms): Min: 0.0, Avg: 0.0, Max: 0.3, Diff: 0.3, Sum: 0.3]
       [Object Copy (ms): Min: 0.0, Avg: 2.7, Max: 4.2, Diff: 4.2, Sum: 21.8]
       [Termination (ms): Min: 0.0, Avg: 0.2, Max: 0.2, Diff: 0.2, Sum: 1.3]
          [Termination Attempts: Min: 1, Avg: 4.6, Max: 11, Diff: 10, Sum: 37]
       [GC Worker Other (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.1]
       [GC Worker Total (ms): Min: 5.8, Avg: 5.8, Max: 5.9, Diff: 0.1, Sum: 46.6]
       [GC Worker End (ms): Min: 4156.7, Avg: 4156.7, Max: 4156.7, Diff: 0.0]
    [Code Root Fixup: 0.0 ms]
    [Code Root Purge: 0.0 ms]
    [Clear CT: 0.2 ms]
    [Other: 1.3 ms]
       [Choose CSet: 0.0 ms]
       [Ref Proc: 1.0 ms]
       [Ref Enq: 0.0 ms]
       [Redirty Cards: 0.2 ms]
       [Humongous Register: 0.0 ms]
       [Humongous Reclaim: 0.0 ms]
       [Free CSet: 0.0 ms]
    [Eden: 50.0M(52.0M)->0.0B(53.0M) Survivors: 8192.0K->7168.0K Heap: 75.1M(100.0M)->28.6M(100.0M)]
 Heap after GC invocations=6 (full 0):
  garbage-first heap   total 102400K, used 29326K [0xdf000000, 0xdf100190, 0xe5400000)
   region size 1024K, 7 young (7168K), 7 survivors (7168K)
  Metaspace       used 16139K, capacity 16346K, committed 16384K, reserved 16688K
 }
  [Times: user=0.03 sys=0.00, real=0.01 secs] 
  
 
 //初始标记阶段STW
 2020-10-20T20:06:25.076+0800: 4.159: [GC concurrent-root-region-scan-start]
 2020-10-20T20:06:25.080+0800: 4.162: [GC concurrent-root-region-scan-end, 0.0039639 secs]
 
 //并发标记阶段
 2020-10-20T20:06:25.080+0800: 4.163: [GC concurrent-mark-start]
 2020-10-20T20:06:25.097+0800: 4.180: [GC concurrent-mark-end, 0.0170679 secs]
 
 //最终标记阶段STW
 2020-10-20T20:06:25.098+0800: 4.180: [GC remark 2020-10-20T20:06:25.098+0800: 4.180: [Finalize Marking, 0.0005518 secs] 2020-10-20T20:06:25.098+0800: 4.180: [GC ref-proc, 0.0003269 secs] 2020-10-20T20:06:25.098+0800: 4.181: [Unloading, 0.0040534 secs], 0.0052224 secs]
  [Times: user=0.02 sys=0.00, real=0.00 secs] 
  
  //筛选回收阶段STW
 2020-10-20T20:06:25.103+0800: 4.185: [GC cleanup 32M->30M(100M), 0.0008868 secs]
  [Times: user=0.00 sys=0.00, real=0.01 secs] 
 2020-10-20T20:06:25.104+0800: 4.186: [GC concurrent-cleanup-start]
 2020-10-20T20:06:25.104+0800: 4.186: [GC concurrent-cleanup-end, 0.0000233 secs]
  字段解析：
  [GC cleanup 32M->30M(100M), 0.0008868 secs] 回收前用量->回收之后用量（总容量）
```

> Full GC日志

回收整个堆，包括新生代、老年代、元空间等 。

```Java
 //回收前内存占情况
 Heap before GC invocations=297 (full 0):
  garbage-first heap   total 102400K, used 102278K [0xdf000000, 0xdf100190, 0xe5400000)
   region size 1024K, 0 young (0K), 0 survivors (0K)
  Metaspace       used 33404K, capacity 33769K, committed 33920K, reserved 34096K]
  字段解析：
   heap   total 102400K  used 102278K [0xdf000000, 0xdf100190, 0xe5400000)  => 堆空间总大小 已使用大小
 内存空间开始位置、已使用空间位置，结束位置。
 
   region size 1024K, 0 young (0K), 0 survivors (0K) => 单个region 大小，
   Metaspace       used 33404K, capacity 33769K, committed 33920K, reserved 34096K]
   
   
  //FGC 详情
 2020-10-20T20:06:34.447+0800: 13.529: [Full GC (Allocation Failure)  99M->74M(100M), 0.3039405 secs]
    [Eden: 0.0B(5120.0K)->0.0B(13.0M) Survivors: 0.0B->0.0B Heap: 99.9M(100.0M)->74.0M(100.0M)], [Metaspace: 33404K->33307K(34096K)]
  字段解析：
  [Full GC (Allocation Failure) =》 GC类型为Full GC, 原因是分配内存失败导致的Full GC。
   99M->74M(100M), 0.3039405 secs]  =》 回收前堆内空间占用量，回收后堆内存占用量（堆内存总量），耗费时间。
  [Eden: 0.0B(5120.0K)->0.0B(13.0M) =》 回收前eden区空间用量（总量），回收后Eden区空间用量（总量）。
   Survivors: 0.0B->0.0B  =》   回收前Survivorsn区空间用量），回收后Survivors区空间用量）。
   Heap: 99.9M(100.0M)->74.0M(100.0M)] =》 回收前堆空间用量（总量），回收后堆空间用量（总量）
 [Metaspace: 33404K->33307K(34096K)] =》 回收前元数据空间用量，回收后元数据空间用量（总量）
   
   
  //回收后内存占用情况
 Heap after GC invocations=298 (full 1):
  garbage-first heap   total 102400K, used 75785K [0xdf000000, 0xdf100190, 0xe5400000)
   region size 1024K, 0 young (0K), 0 survivors (0K)
  Metaspace       used 33307K, capacity 33649K, committed 33920K, reserved 34096K
 }
```

### JVM常用配置参数

#### 1.堆内存配置参数

有时候我们需要根据GC的情况实时情况，动态调整各个区域的大小，所以会配置JVM内存各个区域的内存大小是我们经常会用到的配置参数。

```Bash
#设置堆初始值
-Xms2g
-XX:InitialHeapSize=2048m

#设置堆区最大值
-Xmx2g
-XX:MaxHeapSize=2048m

#设置线程栈的大小
-Xss256k
-XX:ThreadStackSize=256k

#新生代内存配置
-Xmn512m
-XX:MaxNewSize=512m

#缩小堆内存的时机
-XX:MaxHeapFreeRatio=70 #堆内存使用率大于70时扩张堆内存，如果最大堆内存=初始堆内存时该参数无效，默认值70
#扩张堆内存的时机
-XX:MinHeapFreeRatio=40 #堆内存使用率小于40时缩减堆内存，如果最大堆内存=初始堆内存时该参数无效，默认值40

#survivor区和Eden区大小比率
-XX:SurvivorRatio=6  #S区和Eden区占新生代比率为1:6,两个S区2:6
#新生代和老年代的占比
-XX:NewRatio=4  #表示新生代:老年代 = 1:4 即老年代占整个堆的4/5；默认值=2

#初始化的Metaspace大小
-XX:MetaspaceSize 
#Metaspace最大值
-XX:MaxMetaspaceSize
```

#### 2.垃圾收集器配置

```Bash
#Serial垃圾收集器（新生代）
#开启：
-XX:+UseSerialGC
#关闭：
-XX:-UseSerialGC
#新生代使用Serial  老年代则使用SerialOld
 
#ParNew垃圾收集器（新生代）
#开启 
-XX:+UseParNewGC
#关闭 
-XX:-UseParNewGC
#新生代使用功能ParNew 老年代则使用功能CMS
 
#Parallel Scavenge收集器（新生代）
#开启 
-XX:+UseParallelOldGC
#关闭 
-XX:-UseParallelOldGC
#新生代使用功能Parallel Scavenge 老年代将会使用Parallel Old收集器
 
#ParallelOl垃圾收集器（老年代）
#开启 
-XX:+UseParallelGC
#关闭 
-XX:-UseParallelGC
#新生代使用功能Parallel Scavenge 老年代将会使用Parallel Old收集器
 
#CMS垃圾收集器（老年代）
#开启 
-XX:+UseConcMarkSweepGC
#关闭 
-XX:-UseConcMarkSweepGC

#G1垃圾收集器
#开启 
-XX:+UseG1GC
#关闭 
-XX:-UseG1GC
```

#### 3.GC策略配置

```Bash
#GC停顿时间，垃圾收集器会尝试用各种手段达到这个时间，比如减小年轻代
-XX:MaxGCPauseMillis 
 
#堆占用了多少比例的时候触发GC，就即触发标记周期的 Java 堆占用率阈值。默认占用率是整个 Java 堆的 45%
-XX:InitiatingHeapOccupancyPercent=n 
 
#新生代可容纳的最大对象,大于则直接会分配到老年代，0代表没有限制。
-XX:PretenureSizeThreshold=1000000
   
#进入老年代最小的GC年龄,年轻代对象转换为老年代对象最小年龄值，默认值7
-XX:InitialTenuringThreshol=7 

#升级老年代年龄，最大值15
-XX:MaxTenuringThreshold 
   
#GC并行执行线程数
-XX:ParallelGCThreads=16   
    
#禁用 System.gc()
#由于该方法默认会触发 FGC，并且忽略参数中的 UseG1GC 和 UseConcMarkSweepGC，因此必要时可以禁用该方法。
-XX:-+DisableExplicitGC 

#设置吞吐量大小,默认99
-XX:GCTimeRatio 

#打开自适应策略,各个区域的比率，晋升老年代的年龄等参数会被自动调整。以达到吞吐量，停顿时间的平衡点。
-XX:UseAdaptiveSizePolicy

#设置GC时间占用程序运行时间的百分比
GCTimeRatio 
```

#### 4.GC日志配置

```Bash
#启动时配置
#开启记录GC日志详细信息（包括GC类型、各个操作使用的时间）,并且在程序运行结束打印出JVM的内存占用情况
-XX:+PrintGCDetails 
#记录系统的GC时间
-XX:+PrintGCDateStamps 
#开启滚动生成日志
-XX:+UseGCLogFileRotation 
#打印堆的详细信息，包括堆的总大小、已使用大小、空闲大小等信息。
-XX:+PrintHeapAtGC 
#滚动GC日志文件数，默认0，不滚动 
-XX:NumberOfGCLogFiles=5  #5个文件
#GC文件滚动大小，需开启UseGCLogFileRotation
-XX:GCLogFileSize=20M    
#设置日志目录和日志名称
-Xloggc:/opt/ard-user-gc-%t.log   
```

#### 5.cms常用参数

```Bash
#CMS并发标记和搜集线程数量
-XX:ParallelCMSThreads 
 
#使用多少比例的老年代后开始CMS收集，默认是68%，如果频繁发生SerialOld卡顿，应该调小
-XX:CMSInitiatingOccupancyFraction
 
#在FGC时进行压缩
-XX:+UseCMSCompactAtFullCollection 

#多少次FGC之后进行压缩
-XX:CMSFullGCsBeforeCompaction 

#达到什么比例时进行Perm回收
-XX:CMSInitiatingPermOccupancyFraction 

#垃圾回收时是否同时卸载不用的class信息，默认关闭
-XX:+CMSClassUnloadingEnabled
```

#### 6.G1常用参数

```Bash
#设置Region大小，建议逐渐增大该值，1 2 4 8 16 32。 增大会使垃圾的存活时间更长,GC次数减少,单次GC的时间增加
-XX:+G1HeapRegionSize

#新生代最小比例，默认为5%
-XX:G1NewSizePercent=5 
#新生代最大比例，默认为60%
-XX:G1MaxNewSizePercent=60  

#设置并发标记的GC线程数。 默认值约等于 ParallelGCThreads 值的 1/4。
-XX:ConcGCThreads

#G1不会回收的内存大小，默认是堆大小的5%。GC会收集所有的Region，如果值达到5%，就会停下来不再收集了
-XX:G1HeapWastePercent

#混合垃圾回收周期中要包括的旧区域设置占用率阈值。默认占用率为 65%
-XX:G1MixedGCLiveThresholdPercent=65 
```

#### 7.dump 日志参数配置

> OutOfMemory异常时生成dump文件

```Bash
#开启 
-XX:+HeapDumpOnOutOfMemoryError
#关闭 
-XX:-HeapDumpOnOutOfMemoryError
#可以通过jinfo -flag [+|-]HeapDumpOnOutOfMemoryError <pid> 或 jinfo -flag HeapDumpOnOutOfMemoryError=<value> <pid> 来动态开启或设置值

-XX:HeapDumpPath=/data/dump/jvm.dump//设置文件路径
#当HeapDumpOnOutOfMemoryError开启的时候，dump文件的保存路径，默认为工作目录下的
```

> 在Full GC时生成dump文件

```Bash
-XX:+HeapDumpBeforeFullGC       #实现在Full GC前dump
-XX:+HeapDumpAfterFullGC        #实现在Full GC后dump。
-XX:HeapDumpPath=d:\dump        #设置Dump保存的路径
#JAVA_OPTS="-XX:+HeapDumpOnOutOfMemoryError  -XX:HeapDumpPath=/data/dump/jvm.dump"
```

#### 8.常用启动参数

**设置堆内存大小**

设置堆内存大小，Xms 最小内存，Xmx最大内存，不设置默认为物理机内存的四分之一。

```Bash
-Xms2g  -Xmx2g    #一般建议将Java堆内存的最小值和最大值设置为相同的大小，以获得更稳定和可预测的内存管理效果。
```

**异常时记录内存日志**

抛出内存溢出错误时导出堆信息到指定文件，内存溢出时需要对此日志进行分析

```Bash
-XX:+HeapDumpOnOutOfMemoryError  #异常后打印堆内存信息
-XX:HeapDumpPath=/data/dump/jvm.dump #生成的堆内存日志的路径
```

**案例**

```Plaintext
nohup java  -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+UseGCLogFileRotation  -XX:+PrintHeapAtGC -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=50M    -Xloggc:/opt/emps-gc-%t.log -XX:+HeapDumpOnOutOfMemoryError  -XX:HeapDumpPath=/opt/emps-heap.hprof -jar user-1.0-SNAPSHOT.jar&
```

**Tomcat中设置**

linux 在tomcat 的bin目录下catalina.sh 文件里增加配置参数

```Bash
JAVA_OPTS="-Xms1024m -Xmx4096m -Xss1024K -XX:PermSize=512m -XX:MaxPermSize=2048m"
```

### JVM调优策略

#### JVM调优的核心关注指标

调优之前首先我们要知道怎样才算是“优”，不能笼统的说我的程序性能很好，所以就需要有一个具体的指标来衡量性能情况，而在JVM里面衡量性能两个指标分别“吞吐量”和“停顿时间”。

**吞吐量：**程序运行过程中执行两种任务，分别是执行业务代码和进行垃圾回收，**吞吐量大意就是说程序运行业务代码的时间越多程序的吞吐量就越高**，其计算公式 ，吞吐量 = CPU在用户应用程序运行的时间 / （CPU在用户应用程序运行的时间 + CPU垃圾回收的时间），一般而言GC 的吞吐量不能低于 **95%**。

**停顿时间：** 因为JVM进行垃圾回收的时候，某些阶段必须要停止业务线程专心进行垃圾收集，停顿时间就是指**JVM停止业务线程而去进行垃圾收集的这段时长**，停顿时间越长就意味着用户线程等待的时间越长，停顿时间会直接影响用户使用系统的体验。

**垃圾回收频率：**通常来说垃圾回收频率是越低越好，垃圾收集的过程是非常占用CPU资源的，资源有限如果垃圾收集占用的资源越多那么意味着其他事情所用的资源会减少，系统所能做的事情也会越少。当然也不能一味的追求GC次数减少，GC次数减少了有可能就会使得单次GC的时间变长，那么就可能会增加单次GC的停顿时长，所以需要在这两者之间做一些平衡。

#### 如果获得这些指标?

在项目启动的时候 增加参数来收集GC日志，然后通过第三方的日志分析工具（GCesay:[https://gceasy.io/](https://link.zhihu.com/?target=https%3A//gceasy.io/)）分析收集到的GC日志来得到吞吐量、停顿时间相关的统计数据。

或者第三方的一些软件检测，比如`Arthas`。

#### 确定调优的标准

不同的项目对应的不同的应用场景也是不同的，对于吞吐量和停顿时间以及系统的稳定度要求都不一样，所以没有一个合适的指标真正做到适合所有的项目，所以不要为了调优而调优，适合、稳定就是最好的。

要想调整到最优的性能，其实首先要确认的是自己的需求目标是什么，我们需要做的就是根据这个目标去慢慢的调整各项指标从而达到一个最佳的平衡点。

**吞吐量和停顿时间的选择**

**调优前首先要确定大方向，是选择基于吞吐量调优、还是停顿时间调优，哪个是你的硬性指标，这个硬性标准就是指导你进行调优的原则**。

如果你的应用和用户没有什么交互，完全不需要关注用户体验，那么你的硬性标准就是不顾一切的提升吞吐量，达到程序性能的最优。

相反如果你的应用是频繁和用户进行交互的，那么提升用户体验就是一个非常重要的指标了，这个时候你的原则就是在用户能忍受卡顿时间(停顿时间)范围之内，来调整指标来找到停顿时间和吞吐量的一个平衡值 。

举个不是很恰当但有助于你理解这个思路的例子：

如果用户在点击一个功能之后500ms之内没有返回，就会使用户焦虑，那么500ms就是影响用户体验的一个标准了。如果你的业务代码执行到返回的时间需要运行的时间为400ms，那么意味着垃圾回收的停顿的时间必须控制在100ms之内才对用户体验没有影响。 所以这个时候你的调优硬性标准就是把停顿时间控制在100ms之内，然后在这个时间范围的基础上去调整JVM参数让吞吐量越高越好。

有了指导原则后，我们就需要在这两个指标上进行平衡达到最优值了，比如这个时候如果有两组指标，第一组：停顿时间为80ms，吞吐量为92，第二组停顿时间为98ms,吞吐量为98，那么相对而言第二组指标是一个合适调优结果，因为它即符合100ms停顿时间的原则，又将吞吐量最大化了。

#### 常用调优策略

##### 1.选择合适的垃圾回收器

CPU单核，那么毫无疑问Serial 垃圾收集器是你唯一的选择。

CPU多核，关注吞吐量 ，那么选择PS+PO组合。

CPU多核，关注用户停顿时间，JDK版本1.6或者1.7，那么选择CMS。

CPU多核，关注用户停顿时间，JDK1.8及以上，JVM可用内存6G以上，那么选择G1。

```Bash
#设置Serial垃圾收集器（新生代）
-XX:+UseSerialGC

#设置PS+PO,新生代使用功能Parallel Scavenge 老年代将会使用Parallel Old收集器
-XX:+UseParallelOldGC

#CMS垃圾收集器（老年代）
-XX:+UseConcMarkSweepGC

#设置G1垃圾收集器
-XX:+UseG1GC
```

##### 2.增加内存大小

现象：**垃圾收集频率非常频繁**。

原因：如果内存太小，就会导致频繁的需要进行垃圾收集才能释放出足够的空间来创建新的对象，所以增加堆内存大小的效果是非常显而易见的。

注意：**如果垃圾收集次数非常频繁，但是每次能回收的对象非常少，那么这个时候并非内存太小，而可能是内存泄漏导致对象无法回收，从而造成频繁GC。**

```Plaintext
-Xms2g -Xmx2g -Xmn512m
```

##### 3.设置符合预期的停顿时间

在CMS和G1垃圾收集器下可设置。

现象：程序间接性的卡顿

原因：如果没有确切的停顿时间设定，垃圾收集器以吞吐量为主，那么垃圾收集时间就会不稳定。

```Bash
-XX:MaxGCPauseMillis=xx
#对于交互性较高的应用程序，如Web应用或实时系统，通常希望垃圾回收停顿时间尽可能短，一般可以设置在几十毫秒到几百毫秒之间。
#对于后台批处理或数据处理应用程序，可以接受稍长的停顿时间，一般可以设置在几百毫秒到几秒之间。
#对于需要极低停顿时间的应用程序，如金融交易系统或实时视频处理系统，可能需要将停顿时间控制在几毫秒以内。
#需要注意的是，设置较低的停顿时间可能会增加垃圾回收器的开销，可能会影响应用程序的吞吐量。因此，在设置 MaxGCPauseMillis 参数时，需要进行实际测试和评估，综合考虑停顿时间、吞吐量和系统资源利用率等因素，以找到一个合适的平衡点。
```

==注意：不要设置不切实际的停顿时间，设置较低的停顿时间可能会增加垃圾回收器的开销，可能会影响应用程序的吞吐量且单次时间越短也意味着需要更多的GC次数才能回收完原有数量的垃圾==

##### 4.调整内存区域大小比率

现象：某一个区域的GC频繁，其他都正常。

原因：如果对应区域空间不足，导致需要频繁GC来释放空间，在JVM堆内存无法增加的情况下，可以调整对应区域的大小比率。

```Bash
#survivor区和Eden区大小比率
-XX:SurvivorRatio=3  #S区和Eden区占新生代比率为1:3,两个S区1:1:3 

#新生代和老年代的占比
-XX:NewRatio=0.5  #表示新生代:老年代 = 2:1 即老年代占整个堆的1/3；默认值=2
```

==注意：也许并非空间不足，而是因为内存泄漏造成内存无法回收。从而导致GC频繁。==

##### 5.调整对象升老年代的年龄

现象：老年代频繁GC，每次回收的对象很多。

原因：如果升代年龄小，新生代的对象很快就进入老年代了，导致老年代对象变多，而这些对象其实在随后的很短时间内就可以回收，这时候可以调整对象的升级老年代的年龄，让对象不那么容易进入老年代解决老年代空间不足频繁GC问题。

注意：增加了年龄之后，这些对象在新生代的时间会变长可能导致新生代的GC频率增加，并且频繁复制这些对象新生的GC时间也可能变长。

配置参数：

```Bash
#进入老年代最小的GC年龄,年轻代对象转换为老年代对象最小年龄值，默认值7 最大15
-XX:InitialTenuringThreshol=7
```

##### 6.调整大对象的标准

现象：老年代频繁GC，每次回收的对象很多，而且单个对象的体积都比较大。

原因：如果大量的大对象直接分配到老年代，导致老年代容易被填满而造成频繁GC，可设置对象直接进入老年代的标准，或者调整新生代的大小，让新生代占比增高。

注意：这些大对象进入新生代后可能会使新生代的GC频率和时间增加。

配置参数：

```Bash
#新生代可容纳的最大对象,大于则直接会分配到老年代，0代表没有限制。
-XX:PretenureSizeThreshold=1000000 
```

##### 7.调整GC的触发时机

现象：CMS，G1 经常 Full GC，程序卡顿严重。

原因：G1和CMS 部分GC阶段是并发进行的，业务线程和垃圾收集线程一起工作，也就说明垃圾收集的过程中业务线程会生成新的对象，所以在GC的时候需要预留一部分内存空间来容纳新产生的对象，如果这个时候内存空间不足以容纳新产生的对象，那么JVM就会停止并发收集暂停所有业务线程（STW）来保证垃圾收集的正常运行。这个时候可以调整GC触发的时机（比如在老年代占用60%就触发GC），这样就可以预留足够的空间来让业务线程创建的对象有足够的空间分配。

注意：提早触发GC会增加老年代GC的频率。

配置参数：

```Bash
#使用多少比例的老年代后开始CMS收集，默认是68%，如果频繁发生SerialOld卡顿，应该调小
-XX:CMSInitiatingOccupancyFraction

#G1混合垃圾回收周期中要包括的旧区域设置占用率阈值。默认占用率为 65%
-XX:G1MixedGCLiveThresholdPercent=65 
```

##### 8.调整 JVM本地内存大小

现象：GC的次数、时间和回收的对象都正常，堆内存空间充足，但是报OOM

原因： JVM除了堆内存之外还有一块堆外内存，这片内存也叫本地内存，可是这块内存区域不足了并不会主动触发GC，只有在**堆内存区域触发的时候顺带会把本地内存回收了，而一旦本地内存分配不足就会直接报OOM异常**。

注意： 本地内存异常的时候除了上面的现象之外，异常信息可能是OutOfMemoryError：Direct buffer memory。 解决方式除了调整本地内存大小之外，也可以在出现此异常时进行捕获，手动触发GC（System.gc()）。

配置参数：

```Bash
-XX:MaxDirectMemorySize
```

##### 9.优化业务代码。

绝大部分的问题都出自于业务代码本身的问题，在JVM调优里面也不例外，要减少GC的频率，其实业务代码做一个很简单的优化就可以达到。

比如我们如果业务代码中稍微减少了非必要的对象、字段、属性，对象变少了，体积变小了，那么是不是就可以很大程序的减少GC次数和时间问题。

提升方法的运行效率，方法执行完后产生的对象就可以释放进行回收了，方法运行时间越长那么这些对象呆在堆内存的时间就越久，内存就越容易堆满，GC的频率就会增加。

还有由于业务代码的不合理导致的内存泄露长期无法回收，这也是JVM最常见的问题。所以解决业务代码的问题有时候远比上面的参数调优要有效得多。

### JVM调优场景案例

下面主要介绍一些实际场景的JVM调优案例和一些通用的问题排错思路，我们可以通过这些案例场景来学习一些调优的思路。

#### 场景一：网站流量浏览量暴增后，网站反应页面响很慢。

1、问题推测：在测试环境测速度比较快，但是一到生产就变慢，所以推测可能是因为垃圾收集导致的业务线程停顿。

2、定位：为了确认推测的正确性，在线上通过jstat -gc 指令 看到JVM进行GC 次数频率非常高，GC所占用的时间非常长，所以基本推断就是因为GC频率非常高，所以导致业务线程经常停顿，从而造成网页反应很慢。

3、解决方案：因为网页访问量很高，所以对象创建速度非常快，导致堆内存容易填满从而频繁GC，所以这里问题在于新生代内存太小，所以这里可以增加JVM内存就行了，所以初步从原来的2G内存增加到16G内存。

4、第二个问题：增加内存后的确平常的请求比较快了，但是又出现了另外一个问题，就是不定期的会间断性的卡顿，而且单次卡顿的时间要比之前要长很多。

5、问题推测：联系到之前优化加大了内存，所以推测可能是因为内存加大了，从而导致单次GC的时间变长从而导致间接性的卡顿。

6、定位：还是通过jstat -gc 指令 查看到 的确FGC次数并不是很高，但是花费在FGC上的时间是非常高的,根据GC日志 查看到单次FGC的时间有达到几十秒的。

7、解决方案： 因为JVM默认使用的是PS+PO的组合，PS+PO垃圾标记和收集阶段都是STW，所以内存加大了之后，需要进行垃圾回收的时间就变长了，所以这里要想避免单次GC时间过长，所以需要更换并发类的收集器，因为当前的JDK版本为1.7，所以最后选择CMS垃圾收集器，根据之前垃圾收集情况设置了一个预期的停顿的时间，上线后网站再也没有了卡顿问题。

#### 场景二：后台导出数据引发的OOM

**问题描述：**公司的后台系统，偶发性的引发OOM异常，堆内存溢出。

1、因为是偶发性的，所以第一次简单的认为就是堆内存不足导致，所以单方面的加大了堆内存从4G调整到8G。

2、但是问题依然没有解决，只能从堆内存信息下手，通过开启了-XX:+HeapDumpOnOutOfMemoryError参数 获得堆内存的dump文件。

3、VisualVM 对 堆dump文件进行分析，通过VisualVM查看到占用内存最大的对象是String对象，本来想跟踪着String对象找到其引用的地方，但dump文件太大，跟踪进去的时候总是卡死，而String对象占用比较多也比较正常，最开始也没有认定就是这里的问题，于是就从线程信息里面找突破点。

4、通过线程进行分析，先找到了几个正在运行的业务线程，然后逐一跟进业务线程看了下代码，发现有个引起我注意的方法，导出订单信息。

5、因为订单信息导出这个方法可能会有几万的数据量，首先要从数据库里面查询出来订单信息，然后把订单信息生成excel，这个过程会产生大量的String对象。

6、为了验证自己的猜想，于是准备登录后台去测试下，结果在测试的过程中发现导出订单的按钮前端居然没有做点击后按钮置灰交互事件，结果按钮可以一直点，因为导出订单数据本来就非常慢，使用的人员可能发现点击后很久后页面都没反应，结果就一直点，结果就大量的请求进入到后台，堆内存产生了大量的订单对象和EXCEL对象，而且方法执行非常慢，导致这一段时间内这些对象都无法被回收，所以最终导致内存溢出。

7、知道了问题就容易解决了，最终没有调整任何JVM参数，只是在前端的导出订单按钮上加上了置灰状态，等后端响应之后按钮才可以进行点击，然后减少了查询订单信息的非必要字段来减少生成对象的体积，然后问题就解决了。

#### 场景三：单个缓存数据过大导致的系统CPU飚高。

1、系统发布后发现CPU一直飚高到600%，发现这个问题后首先要做的是定位到是哪个应用占用CPU高，通过top 找到了对应的一个java应用占用CPU资源600%。

2、**如果是应用的CPU飚高，那么基本上可以定位可能是锁资源竞争，或者是频繁GC造成的**。

3、所以准备首先从GC的情况排查，如果GC正常的话再从线程的角度排查，首先使用jstat -gc PID 指令打印出GC的信息，结果得到得到的GC 统计信息有明显的异常，应用在运行了才几分钟的情况下GC的时间就占用了482秒，那么问这很明显就是频繁GC导致的CPU飚高。

4、定位到了是GC的问题，那么下一步就是找到频繁GC的原因了，所以可以从两方面定位了，可能是哪个地方频繁创建对象，或者就是有内存泄露导致内存回收不掉。

5、根据这个思路决定把堆内存信息dump下来看一下，使用jmap -dump 指令把堆内存信息dump下来（**堆内存空间大的慎用这个指令否则容易导致会影响应用**，因为我们的堆内存空间才2G所以也就没考虑这个问题了）。

6、把堆内存信息dump下来后，就使用visualVM进行离线分析了，首先从占用内存最多的对象中查找，结果排名第三看到一个业务VO占用堆内存约10%的空间，很明显这个对象是有问题的。

7、通过业务对象找到了对应的业务代码，通过代码的分析找到了一个可疑之处，这个业务对象是查看新闻资讯信息生成的对象，由于想提升查询的效率，所以把新闻资讯保存到了redis缓存里面，每次调用资讯接口都是从缓存里面获取。

8、把新闻保存到redis缓存里面这个方式是没有问题的，有问题的是新闻的50000多条数据都是保存在一个key里面，这样就导致每次调用查询新闻接口都会从redis里面把50000多条数据都拿出来，再做筛选分页拿出10条返回给前端。50000多条数据也就意味着会产生50000多个对象，每个对象280个字节左右，50000个对象就有13.3M，这就意味着只要查看一次新闻信息就会产生至少13.3M的对象，那么并发请求量只要到10，那么每秒钟都会产生133M的对象，而这种大对象会被直接分配到老年代，这样的话一个2G大小的老年代内存，只需要几秒就会塞满，从而触发GC。

9、知道了问题所在后那么就容易解决了，问题是因为单个缓存过大造成的，那么只需要把缓存减小就行了，这里只需要把缓存以页的粒度进行缓存就行了，每个key缓存10条作为返回给前端1页的数据，这样的话每次查询新闻信息只会从缓存拿出10条数据，就避免了此问题的产生。

#### 场景三：CPU经常100% 问题定位思路。

问题分析：CPU高一定是某个程序长期占用了CPU资源。

1、所以先需要找出那个进行占用CPU高。

```Plaintext
top  列出系统各个进程的资源占用情况。
```

2、然后根据找到对应进行里哪个线程占用CPU高。

```Plaintext
top -Hp 进程ID   列出对应进程里面的线程占用资源情况
```

3、找到对应线程ID后，再打印出对应线程的堆栈信息

```Plaintext
printf "%x\n"  PID    把线程ID转换为16进制。
jstack PID 打印出进程的所有线程信息，从打印出来的线程信息中找到上一步转换为16进制的线程ID对应的线程信息。
```

4、最后根据线程的堆栈信息定位到具体业务方法,从代码逻辑中找到问题所在。

```Plaintext
查看是否有线程长时间的watting 或blocked
如果线程长期处于watting状态下， 关注watting on xxxxxx，说明线程在等待这把锁，然后根据锁的地址找到持有锁的线程。
```

#### 场景四：内存飚高问题定位思路。

分析： 内存飚高如果是发生在java进程上，一般是因为创建了大量对象所导致，持续飚高说明垃圾回收跟不上对象创建的速度，或者内存泄漏导致对象无法回收。

1、先观察垃圾回收的情况

```Plaintext
jstat -gc PID 1000 查看GC次数，时间等信息，每隔一秒打印一次。
  
jmap -histo PID | head -20   查看堆内存占用空间最大的前20个对象类型,可初步查看是哪个对象占用了内存。
```

如果每次GC次数频繁，而且每次回收的内存空间也正常，那说明是因为对象创建速度快导致内存一直占用很高；如果每次回收的内存非常少，那么很可能是因为内存泄露导致内存一直无法被回收。

2、导出堆内存文件快照

```Plaintext
jmap -dump:live,format=b,file=/home/myheapdump.hprof PID  dump堆内存信息到文件。
```

3、使用visualVM对dump文件进行离线分析,找到占用内存高的对象，再找到创建该对象的业务代码位置，从代码和业务场景中定位具体问题。

#### 场景五：循环时间太长导致的停顿时间长

在项目中使用循环处理数据，但是业务时间较长，循环次数比较多，使用了int循环，由于在HotSpot虚拟机中，为了避免给安全点带来过重的负担，所以在使用int等小的数据类型作为索引循环体默认是不会放置安全点的。

所以循环体如果执行的慢，而在这个时候要进行GC，而这个循环体线程还没有执行结束，无法快速到达安全点，就会导致其他线程在安全点等待，从而导致整个GC的时间变长。

所以在这种情况下，可以修改使用Long或者范围更大的类型作为循环索引，就会被称为不可数循环（Uncounted Loop）,将会在循环内放置安全点。