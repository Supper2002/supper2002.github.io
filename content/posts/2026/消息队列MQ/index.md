---
title: "消息队列 MQ"
date: 2024-08-18
draft: false
categories:
  - 开发
tags:
  - 消息队列
resources:
  - name: featured-image
    src: featured-image.jpg
---

# 消息队列MQ

# **概述**

## **什么是****消息队列**

MQ全称**Message Queue**翻译过来就是消息队列，是在**消息的传输过程中保存消息的容器**。

它允许消息**发送者和接收者以异步的方式通信**，发送者将消息发送到队列中，接收者则可以从队列中取出消息。

消息队列的主要目的是提供路由并保证消息的传递，如果发送消息时接收者不可用，消息队列会保留消息，直到可以成功地传递它。发送者和接受者直接并不直接通信，它们直接通过共享的队列进行间接通信。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ODMyZjVmMDIwOWNiMjRkZjVlZmYxZTgzNzNkMjc3MjJfQXo1YlozNUhrWDduMnNKMUdpSUZKdkdicVRFTXZQajRfVG9rZW46VUpFdWJmaWlTb0t0TWp4MGdLcWNZanZGbkVmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

## **为什么需要****消息队列****（应用场景）**

消息队列在多个场景下都显得非常重要，特别是在高并发和分布式系统中。MQ有几个特点

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ODNiYjA0NDMwMzQwY2RjODAxZjQzM2ZhYTkwYjQzMGJfSVdkZ2lxMzV1SUVBZkpkVmkweE10cTNScGNkN3QzUFJfVG9rZW46QVNCUmJPQUw0bzRIcW54MXQzcmNwaHk3bnZiXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

1. **异步处理**：在高并发场景下，服务端可能来不及同步处理过多的请求，通过使用消息队列，可以将请求异步处理，将消息发送到队列中，不需要等待响应，从而缓解系统的压力。允许接收方可以独立处理，提高了系统的可伸缩性和性能。
2. **解耦**：消息队列可以实现发送方和接收方之间的解耦，使它们可以独立的开发和演进。方送方不需要关系接收方如何处理，这种松散耦合的设计提高了系统的灵活性和可维护性。
3. **可靠性**：消息队列通常提供持久化机制，确保消息在发送和就收的过程中的可靠性。即时消息方送后接收方暂时不可用，消息也会被保存在队列中，这种机制可以防止消息丢失，并提供了一种机制来处理系统中的故障和异常情况。
4. **流量削峰和缓冲**：在高并发场景下，请求可能瞬间达到峰值，通过消息队列，可以将请求进行缓冲，平衡消息生产者和消费者之间的速度差异，实现流量的削峰填谷，避免系统过载。

## **MQ****类型**

**点对点**

点对点队列模式是一种一对一的消息传递模型，其中每个消息只能被一个接收者消费。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=Mzk5ZTgzMDA1ZjViYThlMTA4NWM0MTVkYmY4YjM3NDVfV1FONGtzT2gyeWJKekU0SzYwNU01NlhGRW5EQWF1c1pfVG9rZW46VW5wb2IwbFV1b1B1WE94S0lNZWNMQ0ozbjVmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

发送者将消息发送的队列中，而接收者从队列中获取消息并进行处理，一旦消息被接收者消费，就从队列中删除。

**这种模式适用于需要可靠传输的消息，以及需要确保消息只被一个接收者处理的场景。**

**发布订阅**

发布/订阅模式是一种一对多的消息传递模式，其中消息被发送到一个主题，而订阅该主题的所有接收者都会接收到该消息。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTZlMTdmN2QwNjE4NjUxODU3NjM5MTQ1NDllNjA1YTBfTHB2Z09WbDZUbWNBTFZqRlpublRHOTV5emZ4YW1QaDlfVG9rZW46Sml6ZWJzTTB0b1hrN294eURZU2NjRTNMbmpqXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

发布订阅模式包括三个角色：主题(Topic)，发布者(Publisher)，订阅者(Subscriber)。

发送者将消息发布到主题，而订阅者通过订阅感兴趣的主题来接收消息。

**这种模式使用于需要将消息广播给对个接收者的场景，如：实时广播、事件通知等。**

## **MQ****设计**

mq核心设计一般都包含几个环节：

1. **Producer（生产者）**

生产者是消息队列中消息的发送方，它产生消息并将其发送到消息队列中

1. **Consumer（消费者）**

消费者是消息队列中消息的接收方，它从消息队列中获取消息并进行处理。

1. **Broker（代理）**

代理是消息队列的核心组件，它负责：接收从生产者发送来的消息，并存储在队列中，然后将消息发送给消费者。

消息队列需要一个可靠的存储机制来存储消息，以便在生产者和消费者直接传递。

消息持久化可以通过将消息写入持久化介质（如磁盘）来实现，持久化存储通常会涉及到：日志文件、数据库、或者其他持久化系统。

1. **Queue（队列）**

通常，消息队列会使用一种高效的数据结构来存储消息，如：队列来存储消息。

队列是消息在代理中存储的地方，它保证了消息的顺序性，并且可以根据需要进行持久化。

1. **Message（消息）**

消息是生产者和消费之间的传递数据的单元，它可以是任何形式的数据，例如：文本、JSON、XML等。

1. **消息路由**

消息队列需要实现消息的路由机制，即确定消息从生产者发送到那个消费者。

消息路由可以根据消息的主题、标签或者其他属性来进行路由，通常会有一种发布-订阅模式(Pub/Sub)或者队列(Queue)模式来实现消息的路由。

1. **Ackonwledgement（确认机制）**

确认机制用于确保消息的可靠性传递，一旦消息被消费者成功处理，消费者会向代理对象发送确认消息，代理会将该消息从队列中删除。

1. **高可用和****容错性**

消息队列通常要实现高可用性和容错性机制，以确保即使在系统故障或网络故障时，消息队列仍然能够正常运行。

涉及到：数据复制、故障转移、负载均衡等技术。

## **常用的****MQ**

### **RabbitMQ**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=Zjk3YzMyYWRhZWE0ZTM3ZDlhZDNmNGZiODI2YjZhZWZfZUxwTG5tbnV2TXJuQmNsdW5sRHE0RU00aVVZZktrcVVfVG9rZW46QUk4bWJCRkVTb1ZCMFl4Vk9KcGM2RG16bmVmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

RabbitMQ是一个开源的消息队列系统，它实现了AMQP(Advanced Message Queuing Protocol，高级消息队列协议)，AMQP是一个开放标准的应用层协议，用于通过消息中间件在应用程序之间进行通信。它支持多种消息队列、发布/订阅、路由功能等，被广泛应用于分布式系统中。

RabbitMQ提供了多端语言的客户端，包括：JAVA、Python、C#等，可以快速方便的集成。

RabbitMQ支持多种消息模式，包括：点对点模式、发布订阅模式、主题模式等。

并且，RabbitMQ提供了多种机制来保持消息的可靠性，包括：持久化、消息确认、发布者确认等。它还支持**集群模式和镜像队列**，以提高可用性和可靠性。

### **Apache Kafka**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NTRhMmIxMTYwNzdiOTViNTRiMmIwYzk4YWMxOWI0M2FfRVFWOXdSanVNRXhBa3dVaHVEc3dQMjJqZkhaTzZKYk9fVG9rZW46SFY3RWIzYm1Bb1I0RzV4Yk5Wc2N4cWVubndoXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

开源分布式流处理平台，设计用于高吞吐量的消息发布和订阅场景。特点包括持久化、高吞吐、低延迟，支持多分区及水平扩展，适用于实时数据处理和大数据管道。

Kafka是一个高吞吐量、可持久化、分布式的消息队列系统。

Kafka能够处理大规模数据流，并且有非常高的吞吐量，每秒可以达到百万级的处理能力。

Kafka由多个节点组成，每个节点称为Kafka broker，Kafka集群中的多个broker协同工作，共同承担数据的存储、传输和处理任务。

Kafka提供了：主题和分区（Partition）的概念，可以根据需求选择合适的模式。

主题是逻辑上的数据流，每个主题可以分成一个或多个分区，分区允许数据水平扩展，并且支持并发读写操作，从而提高系统的吞吐量和性能。

### **ActiveMQ**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NTViOGEzMWU3ZmJhZTdmNWU0NzgxMDE1MjNiMzA3NjNfUU8ya1lZdU9pSXZlS29idW9iMDFQRTBwVzdOeXY0dGNfVG9rZW46TUF0M2JwUmNWb0N0b1h4alRmd2NOOVFObmtjXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

一个老牌且全面支持JMS规范的消息中间件。特点包括支持多种协议（如AMQP、STOMP、MQTT等），在传统企业集成和SOA架构中广泛应用。是最早的MQ，如今用的相对少了。

### **RocketMQ**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGZiOTM5YzU0ZjQwMDVmMGZjYzVlZGNhNGY1Nzg3ZDZfTDRLQUN3UDZkamo3VEEzQnlTWVVzcEM3SEx2ZUQ2QUhfVG9rZW46TFE0MWIwMGFFb2t5Y3p4S0N4U2NBaGlEbjRjXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

阿里巴巴开源的消息中间件，后来成为Apache顶级项目。特点包括**高性能、高可靠、易用，支持事务消息、定时/延时消息、消息重试、消息轨迹**以及大规模分布式系统中的消息传递。

RocketMQ支持发布和订阅模型，消息生产者应用创建Topic并将消息发送到Topic。消费者应用创建对Topic的订阅以便从其接收消息。通信可以是一对多（扇出）、多对一（扇入）和多对多。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NGVkN2Y4OGM3NmQ0NzBmMDc4MTVlOTYzZTU5N2RhZDhfYjlld1RDTllveHF3UDQ2dzFvZ1RlazVvTkdJWWtnRUdfVG9rZW46RTBwcmJKbHlVb0lNZjd4WHpseWNNTThmbndnXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

### **Apache Pulsar**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjU5ZmIxMThiYTFkOGFlN2RkMmQwNzc3NjU1MjhjMGVfY0xqWTc1bXZ2YlBaUFhPYXZoTzhGZVhPU2lObW1FNmFfVG9rZW46UVNyamJvWXpnb09CYUt4RHBtZWNlYVVCbmVlXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

分布式发布-订阅消息系统，与Kafka类似，但采用了分层存储架构，支持更细粒度的数据管理和更低延迟。特点包括可伸缩性和容错性，并支持跨地域复制，是下一代云原生分布式消息流平台。

## **如何选择****消息队列**

在选择消息队列时，主要考虑以下四个方面：

1. **功能特性**：消息队列应具备基本的消息发送、接收和存储功能。此外，还可以考虑队列管理、消息路由、消息过滤等高级功能。
2. **性能**：性能主要衡量指标包括吞吐量、消息延迟和消息错误率。需要根据实际业务需求选择合适的性能指标。
3. **可靠性**：消息队列应具备数据完整性、有序性和可靠性要求，并能够提供可靠性保障手段。
4. **用户体验**：消息队列使用起来应该简单易用，具备相应的开发工具和文档。

作为一款及格的消息队列，必须具备的几个特性包括：

- 消息的可靠传递：确保不丢消息；
- Cluster：支持集群，确保不会因为某个节点宕机导致服务不可用，当然也不能丢消息；
- 性能：具备足够好的性能，能满足绝大多数场景的性能要求。

各个消息队列直接的优缺点：

### **RabbitMQ**

优势：

- RabbitMQ 于 2007 年发布，是使用 Erlang 编程语言编写的，少数几个支持 AMQP 协议的消息队列之一
- RabbitMQ 是一个相当轻量级的消息队列，非常容易部署和使用。
- RabbitMQ 一个比较有特色的功能是支持非常灵活的路由配置，和其他消息队列不同的是，它在生产者（Producer）和队列（Queue）之间增加了一个 **Exchange** 模块，可以理解为交换机。Exchange 模块的作用和交换机非常相似，根据配置的路由规则将生产者发出的消息分发到不同的队列中。路由的规则也非常灵活，甚至可以自己来实现路由规则。如果正好需要这个功能，RabbitMQ 是个不错的选择。

劣势：

- RabbitMQ 对消息堆积的支持并不好，当大量消息积压的时候，会导致 RabbitMQ 的性能急剧下降。
- RabbitMQ 的性能是这几个消息队列中最差的，大概每秒钟可以处理**几万到十几万**条消息。如果应用对消息队列的性能要求非常高，那不要选择 RabbitMQ。
- RabbitMQ 使用的编程语言 **Erlang**，扩展和二次开发成本高。

### **RocketMQ**

优势：

- 阿里巴巴在 2012 年开源的消息队列产品，用 Java 语言实现，在设计时参考了 [Kafka]，并做出了自己的一些改进，2017 正式毕业，成为 Apache 的顶级项目。
- RocketMQ 有后发优势，在阿里内部被广泛应用在订单，交易，充值，流计算，消息推送，日志流式处理，Binglog 分发等场景。经历过多次双十一考验，它的性能、稳定性和可靠性都是值得信赖的。具备一个现代的消息队列应该有的几乎全部功能和特性，并且它还在持续的成长中。
- RocketMQ 有非常活跃的中文社区，大多数问题可以找到中文的答案。RocketMQ 使用 Java 语言开发，源代码相对比较容易读懂，容易对 RocketMQ 进行扩展或者二次开发。
- RocketMQ 对在线业务的响应时延做了很多的优化，大多数情况下可以做到毫秒级的响应，如果你的应用场景很在意响应时延，那应该选择使用 RocketMQ。
- RocketMQ 的性能比 RabbitMQ 要高一个数量级，每秒钟大概能处理**几十万**条消息。

劣势：

- RocketMQ 的劣势是与周边生态系统的集成和兼容程度不够。

### **Kafka**

优势：

- Apache Kafka 是一个分布式消息发布订阅系统。它最初由 LinkedIn 公司基于独特的设计实现为一个分布式的日志提交系统，之后成为 Apache 项目的一部分。
- Kafka 已经发展为一个非常成熟的消息队列产品，无论在数据可靠性、稳定性和功能特性等方面都可以满足绝大多数场景的需求。
- Kafka 与周边生态系统的兼容性是最好的没有之一，尤其在大数据和流计算领域，几乎所有的相关开源软件系统都会优先支持 Kafka。
- Kafka 性能高效、可扩展良好并且可持久化。它的分区特性，可复制和可容错都是不错的特性。
- Kafka 使用 Scala 和 Java 语言开发，设计上大量使用了批量和异步的思想，使得 Kafka 能做到超高的性能。Kafka 的性能，尤其是异步收发的性能，是三者中最好的，但与 RocketMQ 并没有量级上的差异，大约每秒钟可以处理**几十万**条消息。在有足够的客户端并发进行异步批量发送，并且开启压缩的情况下，Kafka 的极限处理能力可以超过每秒 **2000** 万条消息。

劣势：

- Kafka 异步批量的设计带来的问题是，它的同步收发消息的响应时延比较高，因为当客户端发送一条消息的时候，**Kafka 并不会立即发送出去，而是要等一会儿攒一批再发送，在它的 Broker 中，很多地方都会使用这种先攒一波再一起处理的设计。**当你的业务场景中，每秒钟消息数量没有那么多的时候，Kafka 的时延反而会比较高。所以，Kafka 不太适合在线业务场景。

### **选型参考**

三者对比：

|                   | Kafka                                                        | RocketMQ                                                     | RabbitMQ                                                     |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 定位              | 日志消息、监控数据                                           | 非日志的可靠消息传输                                         | 非日志的可靠消息传输                                         |
| 开发语言          | Java & Scala                                                 | Java                                                         | Erlang                                                       |
| 消息可靠性        | 异步刷盘，优化后零丢失                                       | 可同步可异步刷盘，优化有零丢失                               | 同步刷盘，有较低概率丢失                                     |
| 消息延时          | 毫秒级                                                       | 毫秒级                                                       | 微妙级                                                       |
| 可用性            | 非常高（分布式）                                             | 非常高（主从）                                               | 高（主从）                                                   |
| 消费模式          | Pull                                                         | Pull+Push                                                    | Pull+Push                                                    |
| 单机吞吐量        | 十万级（百万）                                               | 十万级                                                       | 万级                                                         |
| 堆积能力          | 非常好                                                       | 非常好                                                       | 一般                                                         |
| topic对吞吐量影响 | 几十上百时性能大幅度下降                                     | 几十上千时性能小幅度下降                                     | \                                                            |
| 顺序消费          | 支持，一台broker宕机后，消息会乱序                           | 支持，顺序消息场景下，消息消费失败时队列对暂停               | 支持，一个消息消费失败，此消息的顺序会被打乱                 |
| 定时消息          | 不支持                                                       | 支持                                                         | 支持                                                         |
| 事务消息          | 不支持                                                       | 支持                                                         | 不支持                                                       |
| 消息重试          | 不支持                                                       | 支持                                                         | 支持                                                         |
| 死信队列          | 不支持                                                       | 支持                                                         | 支持                                                         |
| 访问权限          | 无                                                           | 无                                                           | 类似数据库，配置用户名密码                                   |
| 总结              | 吞吐量高，分布式高可用，最好是支持topic少的场景，会有消息重复现象 | 可支持大规模topic，有完备的文档和活跃的社区，支持多种消息，方便二次开发和扩展 | 支持非常灵活的路由配置，容易部署和使用，但是性能较低不适合大规模分布式模式，且不是java语言开发，二次开发扩展难度高 |

参考选择：

- 如果消息队列不是将要构建系统的重点，对消息队列功能和性能没有很高的要求，只需要一个快速上手易于维护的消息队列，建议使用 RabbitMQ。
- 如果系统使用消息队列主要场景是处理在线业务，比如在交易系统中用消息队列传递订单，需要低延迟和高稳定性，建议使用 RocketMQ。
- 如果需要处理海量的消息，像收集日志、监控信息或是埋点这类数据，或是你的应用场景大量使用了大数据、流计算相关的开源产品，那 Kafka 是最适合的消息队列。

# **RocketMQ**

## **前言**

RocketMQ是阿里巴巴旗下一款开源的MQ框架，经历过双十一考验、Java编程语言实现，有非常好完整生态系统。RocketMQ作为一款纯java、分布式、队列模型的开源消息中间件，支持事务消息、顺序消息、批量消息、定时消息、消息回溯等，是十分牛逼的一款开源消息队列。

## **核心概念**

- **NameServer**：可以理解为是一个注册中心，主要是用来保存topic路由信息，管理Broker。在NameServer的集群中，NameServer与NameServer之间是没有任何通信的。
- **Broker**：核心的一个角色，主要是用来保存topic的信息，接受生产者产生的消息，持久化消息。在一个Broker集群中，相同的BrokerName可以称为一个Broker组，一个Broker组中，BrokerId为0的为主节点，其它的为从节点。BrokerName和BrokerId是可以在Broker启动时通过配置文件配置的。每个Broker组只存放一部分消息。
- **生产者**：生产消息的一方就是生产者。
- **生产者组**：一个生产者组可以有很多生产者，只需要在创建生产者的时候指定生产者组，那么这个生产者就在那个生产者组。
- **消费者**：用来消费生产者消息的一方。
- **消费者组**：跟生产者一样，每个消费者都有所在的消费者组，一个消费者组可以有很多的消费者，不同的消费者组消费消息是互不影响的。
- **Message**：消息，需要发生的数据对象，生产者和消费者之间的传递介质。
- **topic（主题）**：可以理解为一个消息的集合的名字，生产者在发送消息的时候需要指定发到哪个topic下，消费者消费消息的时候也需要知道自己消费的是哪些topic底下的消息。
- **Tag（子主题）**：比topic低一级，可以用来区分同一topic下的不同业务类型的消息，发送消息的时候也需要指定。

tips：组的概念是因为可以用来做到不同的生产者组或者消费者组有不同的配置，这样就可以使得生产者或者消费者更加灵活。

## **工作流程**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NWE5ZTg3NzE5OTExMjQ4NzMxNzNkMGZjNGRmMGE4ZmVfWXZZOE5RVDE3NERkVEprUVc3Yjg2YWZUdVpNam1YWElfVG9rZW46TEtvbGJ5RUVqb0k5dHB4R3I3WWNETlczblhjXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

通过这张图就可以很清楚的知道，RocketMQ大致的工作流程：

- Broker启动的时候，会往每台NameServer（因为NameServer之间不通信，所以每台都得注册）注册自己的信息，这些信息包括自己的ip和端口号，自己这台Broker有哪些topic等信息。
- Producer在启动之后会跟会NameServer建立连接，定期从NameServer中获取Broker的信息，当发送消息的时候，会根据消息需要发送到哪个topic去找对应的Broker地址，如果有的话，就向这台Broker发送请求；没有找到的话，就看根据是否允许自动创建topic来决定是否发送消息。
- Broker在接收到Producer的消息之后，会将消息存起来，持久化，如果有从节点的话，也会主动同步给从节点，实现数据的备份。
- Consumer启动之后也会跟会NameServer建立连接，定期从NameServer中获取Broker和对应topic的信息，然后根据自己需要订阅的topic信息找到对应的Broker的地址，然后跟Broker建立连接，获取消息，进行消费。

## **安装和启动**

下载MQ相关资料：

- 链接: https://pan.baidu.com/s/1mHqd2wPSWTEE3yXhD-UGhw?pwd=yjmb 提取码: yjmb

下载好了将需要的文件上传到服务器，我这里是使用虚拟机：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=OTY3ZjBjMzQ3M2JmYjZhNmIxMGVhODYzOGJmMzIwYzhfWUFHTUJFMEE3blhjRXBCbWtNVVU4RE5VQndLcXlicjZfVG9rZW46WDlud2JMQXBtb0FneWp4R0IwS2Mxa2YyblllXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

新建文件夹并上传文件和解压：

```Bash
#新建文件夹
mkdir /usr/local/software
#上传文件 使用工具上传
ll #查看
jdk-8u161-linux-x64.tar.gz
rocketmq-all-4.4.0-bin-release.zip
#解压文件到local目录
tar -zxvf jdk-8u161-linux-x64.tar.gz -c /usr/local
#为了方便重命名文件夹
mv jdk-8u161-linux-x64 jdk1.8
#同样解压zip
unzip rocketmq-all-4.4.0-bin-release.zip -d /usr/local
#如果没有unzip就按照 rpm install -y unzip
mv rocketmq-all-4.4.0-bin-release rocketmq-4.4

#解压完成 配置环境变量
vi /etc/profile
#在最后添加
export JAVA_HOME=/usr/local/jdk1.8
export ROCKETMQ_HOME=/usr/local/rocketmq-4.4
export PATH=$JAVA_HOME/bin:$ROCKETMQ_HOME/bin:$PATH 
#重写加载文件
source /etc/profile
#使用命令查看是否配置成功
java -vsrsion
#输出如下 说明配置成功
java version "1.8.0_161"
Java(TM) SE Runtime Environment (build 1.8.0_161-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.161-b12, mixed mode)
```

启动MQ

因为MQ启动默认的配置需要8G，虚拟机内存不足，所以需要修改配置，然后再启动“

```Bash
#修改Broker配置
vi /usr/local/rocketmq-4.4/bin/runbroker.sh
#找到jvm配置 修改-Xms8g -Xmx8g -Xmn2g
# JVM Configuration
JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512g"

#修改NameServer配置
vi /usr/local/rocketmq-4.4/bin/runserver.sh
# JVM Configuration 修改-Xms8g -Xmx8g -Xmn1g
JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512g -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```

修改完成后，执行命令启动：

**启动NameServer**

```Bash
#启动命令
nohup sh mqnamesrv &
[1] 1976
[root@localhost local]# nohup: 忽略输入并把输出追加到"nohup.out"
#查看状态
jps -l
#输出
1979 org.apache.rocketmq.namesrv.NamesrvStartup #启动成功
1998 sun.tools.jps.Jps
```

或者可以查看日志

```Bash
tail -f ~/logs/rocketmqlogs/namesrv.log
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTUyMGI5MmFhNDFhNDVjMzhmODg5OGFjZWZhMTI1NjJfOWJWWUlRaVFjVnM1VTVTaHU0YmR4RnAyOFllUm8xa3RfVG9rZW46RWM0VGI4clJYb3NMUUF4dEFWZmNNZlFYblBnXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

**启动Broker**

```Bash
#启动broker 需要知道nameserver地址和端口 9876，也可以在配置文件中指定 和配置文件broker.conf
nohup sh mqbroker -n localhost:9876 -c /usr/local/rocketmq-4.4/conf/broker.conf &
[2] 2041
[root@localhost logs]# nohup: 忽略输入并把输出追加到"nohup.out"
#命令查看启动
jsp
#启动成功
2045 BrokerStartup
```

修改配置文件指定NameServer：

```Bash
vi conf/broker.conf
#文件末尾追加地址
namesrvAddr = localhost:9876
#启动
nohup sh bin/mqbroker -c conf/broker.conf &
```

查看日志文件：

```Bash
tail -f ~/logs/rocketmqlogs/broker.log 
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YzZiZmIxNDZmYzFmMzEwMDRjMTY1NzllMWZkZTM1MThfQ0V2dDVzY1EwWlo0ODRoMkNwemJLN0x4VnBvTTJEQ0pfVG9rZW46Snh0UmJyUkgzb05NM0V4Yk9Ra2N1UldpbmlmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

启动完成，为了测试和方便使用需要关闭防火墙：

```Bash
#关闭防火墙
sudo systemctl stop firewalld
sudo systemctl disable firewalld
#查看状态
sudo firewall-cmd --state
#如果输出是not running，那么firewalld防火墙就是关闭的。
```

### **可视化管理平台**

使用管理台测试连接：

找到下载文件的`管控台console`文件夹，里面有jar包文件，和配置文件，可以部署在虚拟机上也可以直接运行，因为需要内存比较大所以直接运行就可以了，修改配置文件：

```Plaintext
server.port=9999 #后端访问地址
rocketmq.config.namesrvAddr=192.168.152.128:9876 #自己的虚拟机ip
```

修改完成，直接在cmd运行当前文件中的rocketmq-console-ng-1.0.1.jar包文件，这里需要保持jdk的版本为1.8：

```Bash
java -jar rocketmq-console-ng-1.0.1.jar
```

我这里上传到了虚拟机服务器，为了方便启动，编写脚本`start_rocketmq-console.sh`：

```Shell
#!/bin/bash  
  
# 设置Java的初始堆内存和最大堆内存  
JAVA_OPTS="-Xms256m -Xmx256m"  
  
# 设置RocketMQ NameServer的地址  
ROCKETMQ_NAMESRV_ADDR="localhost:9876"  
  
# 设置RocketMQ Console的端口  
SERVER_PORT="8888"  
  
# Java的jar包路径  
JAR_PATH="/usr/local/software/rocketmq-console-ng-1.0.1.jar"  
  
# 使用nohup在后台启动，并将输出重定向到日志文件  
nohup java $JAVA_OPTS -Drocketmq.config.namesrvAddr=$ROCKETMQ_NAMESRV_ADDR -Dserver.port=$SERVER_PORT -jar $JAR_PATH > rocketmq-console.log 2>&1 &  
  
# 输出启动成功的消息  
echo "RocketMQ Console has been started in the background."
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=OWEyM2E4MmFhZjRlNzVhZjE5OTMwY2U5NjQ1MDUyOGNfam9KOGJvcjFpZEV5djltZlhkUktGZlRCbXFvWmJnMmxfVG9rZW46VHpkUGJjYzF0b2ZuOWp4VktrTmN4QVpDbm1OXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

测试访问：

```HTTP
#浏览器输入地址 直接访问
http://http://192.168.152.128:8888/#/
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MDQyZGQxNTAxZTZiNThlZGNiNTY4MmQwZjY2ZmJkYzNfSEVFUklVbVdDbDNiRTRWN1ZMejVtMW1kN284NTNDbENfVG9rZW46VmkxVWJub2JJb0xmdWZ4d0FFd2N5Q3VRbjBjXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

访问成功，看到broker集群连接成功，至此，安装启动完成，接下来就可以测试使用了！！！

## **集群模式**

为了追求更好的性能，RocketMQ的最佳实践方式都是在集群模式下完成，官方提供了三种集群搭建模式：

### **单Master模式**

- 定义：单节点模式，Broker节点独立运行。
- 优缺点：
  - 优点：配置简单。
  - 缺点：一旦Broker宕机或者重启，会导致应用程序不可用，因此不建议使用。

### **多Master模式**

- 定义：集群中不存在Slave模式，全部都是Master节点，例如两个Master或者三个Master组成的集群模式。
- 优缺点：
  - 优点：
    - 配置简单。
    - 单个Master宕机或者重启后对应用无任何影响。
    - 当磁盘配置的是RAID10时，即使机器宕机不可恢复的情况下，消息数据也不会丢失。
    - 异步刷盘丢失少量消息，同步刷盘不丢失数据且性能最高。
  - 缺点：
    - 单台节点宕机期间，这台节点上的消息没有被消费时，在节点恢复之前不可以被消费，消息的实时性会受到影响。

### **多Master多Slave模式（异步）**

- 定义：集群中存在Master和Slave节点，每个Master节点配置一个Slave或者多个Slave节点，Slave只读不能写。Master和Slave组成一组，在集群中可以有多组Master-Slave，高可用采用异步复制的方式，主备之间数据同步存在短暂的消息延迟。
- 优缺点：
  - 优点：
    - 即使磁盘损坏，消息丢失的非常少。
    - 消息实时性不会受影响。
    - Master宕机后，消费者仍然可以从Slave消费，此过程对应用透明，不需要人工干预。
    - 性能同多Master模式几乎一样。
  - 缺点：
    - Master宕机，磁盘损坏情况下会丢失少量消息。

### **Dleger高可用集群**

- 定义：Rcoker在4.5之后引入了第三方的Dleger高可用集群。Dledger集群是RocketMQ的一种高可用集群模式，它采用多副本机制来确保数据的高可用性和服务的连续性。
- 优缺点：
  - 优点
    - 每个Master节点都有一个或多个Slave节点作为备份，确保数据的高可用性
    - 当Master节点出现故障时，Dledger机制会自动选择一个Slave节点升级为新的Master节点，确保服务的连续性。
    - Dledger集群在正常情况下，性能和单Master模式相近，因为读操作可以分散到多个Slave节点上。
  - 缺点
    - 相比其他集群模式，Dledger集群的配置相对复杂，需要为每个节点设置ID标记，并通过此标记来绑定与之相关的主机地址。
    - 需要准备多台服务器来部署Dledger集群，通常包括一个主节点和多个从节点。
    - 在配置Dledger ID时，第一个可以随意编写，但第2个开始必须为数字。
    - 4.5+版本才支持Dledger集群模式。
- Dleger的选举逻辑：
- 使用**Raft协议**，是分布式系统中的一种共识算法，用于在集群中选举Leader管理集群。Raft协议中有以下角色：
  - Leader（领导者）：集群中的领导者，负责管理集群。
  - Candidate（候选者）：具有竞选Leader资格的角色，如果集群需要选举Leader，节点需要先转为候选者角色才可以发起竞选。
  - Follower（跟随者 ）：Leader的跟随者，接收和处理来自Leader的消息，与Leader之间保持通信，如果通信超时或者其他原因导致节点与Leader之间通信失败，节点会认为集群中没有Leader，就会转为候选者发起竞选，推荐自己成为Leader。
- **Raft协议中还有一个Term（任期/轮次）的概念，任期会随着每一轮选举发生变化，一般是单调递增**
- 简单来说，一般有一个领导者和多个跟随者，一直保持着心跳，一旦心跳断开，或者说领导者的时间片用完，就会发起选举，所有的跟随者就会变成候选者，发起投票，在同一个时间片上，谁的TermId越大，也就是说谁存活的旧代表有更完备的数据，谁就会成为新的领导者，其他竞选者将变成跟随者。如果有多个竞选者出现一样的TermId那就采用随机休眠，让其中一个竞选者休眠一会儿，重新在选举。
- ==Leader的选举非常的频繁，在心跳断开或者时间片用完就会发起选举，主要是防止脑裂现象。==

**其他相关组件和概念**：

- **Name Server**：无状态节点，可集群部署，集群节点间相互独立没有信息交换。主要功能为更新和发现Broker服务，生产者或消费者能够通过其查找到各主题相应的Broker IP列表。
- **Broker Server**：消息中转角色，负责存储消息，转发消息。分为Master Broker和Slave Broker，一个Master Broker可以对应多个Slave Broker，但一个Slave Broker只能对应一个Master Broker。

## **mqadmin管理工具**

`mqadmin`是RocketMQ自带的命令行管理工具，用于管理RocketMQ的topic，broker，集群，消息等资源和执行相关操作。

**mqadmin基础参数**

- Broker 相关参数
  - `-b`：Broker 地址，表示执行命令的 Broker 地址，格式为`ip:port`，只支持单台 Broker。
  - `-c`：集群名称，表示命令作用于指定集群中的所有 Broker。
  - `-h`：打印帮助信息。
  - `-n`：NameServer 服务地址，格式为`ip:port`。
- Topic 相关参数
  - `-t`：Topic 名称。
  - `-p`：设置 Topic 的读写权限，可选值为`2`（W，只写）、`4`（R，只读）、`6`（RW，读写）。
  - `-r`：可读队列数，默认为`8`。
  - `-w`：可写队列数，默认为`8`。
- 其他参数
  - `-i`：消息 ID。
  - `-k`：消息 Key。
  - `-g`：消费者组名称。
  - `-s`：消息大小，单位为字节。
  - `-a`：探测次数。
  - `-m`：所属机房。
  - `-l`：打印间隔，单位为秒。
  - `-o`：偏移量。
  - `-q`：查询队列 ID。
  - `-f`：是否强制重置偏移量。
  - `-u`：用户名。
  - `-w`：密码。

这些参数可以组合使用，以执行不同的管理操作，例如创建或更新 Topic、删除 Topic、查看 Topic 路由信息、查询消息等。具体的参数组合和用法可以通过`mqadmin -h`命令查看帮助信息。

以下是一些常见的mqadmin命令及其用法：

- **创建或更新Topic**

```Bash
./mqadmin updateTopic -n <nameserver_address> -t <topic_name> -c <cluster_name> -a +message.type=NORMAL。
#参数含义
-n #<nameserver_address>：指定 NameServer 的地址，用于连接到 RocketMQ 集群。
-t #<topic_name>：指定要更新的 Topic 的名称。
-c #<cluster_name>：指定 Topic 所属的集群名称。
-a #+message.type=NORMAL：设置 Topic 的消息类型为NORMAL。在 RocketMQ 5.0 中，引入了TopicMessageType的概念，通过该属性可以指定 Topic 的消息类型。NORMAL表示普通消息类型。
```

- **删除Topic**：./mqadmin deleteTopic -n <nameserver_address> -t <topic_name> -c <cluster_name>。
- **查看Topic列表信息**：./mqadmin topicList -n <nameserver_address> -c <cluster_name>。
- **查看Topic路由信息**：./mqadmin topicRoute -n <nameserver_address> -t <topic_name>。
- **查看Topic消息队列offset**：./mqadmin topicStatus -n <nameserver_address> -t <topic_name>。
- **查看Topic所在集群列表**：./mqadmin topicClusterList -n <nameserver_address> -t <topic_name>。
- **打印Topic订阅关系、TPS、积累量、24h读写总量等信息**：./mqadmin statsAll -n <nameserver_address> -t <topic_name>。

## **基础使用**

创建项目连接测试，新建一个maven项目，导入依赖：

### **测试生产者**

```Java
package com.zunhui.mq.producer;

import org.apache.rocketmq.client.producer.DefaultMQProducer;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.common.message.Message;

/**
 * @author zunhui
 * @description
 * @date 2024/6/18 16:08
 */
public class ProducerTest {

    public static void main(String[] args) {

        //1.创建生产者
        DefaultMQProducer producer = new DefaultMQProducer("helloProducerGroup");
        //2.设置namesrver地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        //3.启动生产者
        try {
            producer.start();
            //4.创建消息目的地 topic
            String topic = "helloTopic";
            for (int i = 0; i < 10; i++) {
                //5.封装消息
                Message message = new Message(topic, ("hello world" + i).getBytes());
                //6.发送消息
                SendResult result = producer.send(message);
                System.out.println("发送结果：" + result);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            //7.关闭生产者
            producer.shutdown();
        }

    }

}
```

- 构建一个消息生产者DefaultMQProducer实例，然后指定生产者组为helloProducerGroup；
- 指定NameServer的地址：服务器的ip:9876，因为需要从NameServer拉取Broker的信息
- producer.start() 启动生产者
- 循环构建内容为“hello world+i”的十条消息，然后指定这个消息往helloTopic这个topic发送
- producer.send(msg)：发送消息，返回result打印结果。
- producer.shutdown()关闭生产者。

运行代码，打印结果：

sendStatus=SEND_OK 说明发送成功了，此时就能后控制台看到未消费的消息了。

```Plaintext
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0C230000, offsetMsgId=C0A8988000002A9F0000000000000000, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=3], queueOffset=0]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D160001, offsetMsgId=C0A8988000002A9F00000000000000A5, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=0], queueOffset=0]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D180002, offsetMsgId=C0A8988000002A9F000000000000014A, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=1], queueOffset=0]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D210003, offsetMsgId=C0A8988000002A9F00000000000001EF, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=2], queueOffset=0]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D310004, offsetMsgId=C0A8988000002A9F0000000000000294, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=3], queueOffset=1]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D470005, offsetMsgId=C0A8988000002A9F0000000000000339, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=0], queueOffset=1]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D4E0006, offsetMsgId=C0A8988000002A9F00000000000003DE, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=1], queueOffset=1]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D5E0007, offsetMsgId=C0A8988000002A9F0000000000000483, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=2], queueOffset=1]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D6A0008, offsetMsgId=C0A8988000002A9F0000000000000528, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=3], queueOffset=2]
发送结果：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E257000B4AAC25B0A0D730009, offsetMsgId=C0A8988000002A9F00000000000005CD, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=0], queueOffset=2]
```

打开控制台查看：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MmFlN2Q1OGZmNTNlOTEwYzUwNWE1NGU0MWY3NDE4YTlfZ25OOHhvblBleWFUbzRDdEtSSmpySVI5eDhJV2lCOUdfVG9rZW46WVE3WmJrSmRmb3ZvYmx4dzU5RWNNYmUxbm9oXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

没有消费者，消息也发送成功了，实现了解耦。

> 注：如果消息发送成功没有查询到，可能是因为服务器时间和系统时间不一致，需要更改查询时间范围，或者同步下虚拟机时间。

### **测试消费者**

编写消费者代码：

```Java
package com.zunhui.mq.consumer;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;
import org.apache.rocketmq.common.message.MessageExt;

import java.util.List;

/**
 * @author zunhui
 * @description
 * @date 2024/6/18 16:39
 */
public class ConsumerTest {
    public static void main(String[] args) throws InterruptedException {
        //1.创建消费者
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("helloConsumerGroup");
        //2.设置nameserver地址
        consumer.setNamesrvAddr("192.168.152.128:9876");
        try {
            //3.订阅主题 *代表订阅所有helloTopic下所有消息
            consumer.subscribe("helloTopic", "*");
            //4.注册监听器(多线程的方式)
            consumer.setMessageListener(new MessageListenerConcurrently() {
                @Override
                public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                    for (MessageExt msg : list){
                        //消息内容
                        System.out.println(Thread.currentThread().getName()+"----"+msg.getMsgId()+"----"+new String(msg.getBody()));
                    }
                    //返回消费状态
                    //CONSUME_SUCCESS 消费成功
                    //RECONSUME_LATER 消费失败，需要重试
                    //CONSUME_REJECTED 消费失败，需要拒绝
                    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
                }
            });
            //5.启动消费者
            consumer.start();
        }catch (Exception e){
            e.printStackTrace();
        }
        //6.关闭消费者
        Thread.sleep(1000);
        consumer.shutdown();
    }

}
```

- 创建一个消费者实例对象，指定消费者组为helloConsumerGroup
- 指定NameServer的地址：服务器的ip:9876
- 订阅 helloTopic这个topic的所有信息
- consumer.registerMessageListener ，这个很重要，是注册一个监听器，这个监听器是当有消息的时候就会回调这个监听器，处理消息，所以需要用户实现这个接口，然后处理消息。
- 启动消费者

启动之后，消费者就会消费刚才生产者发送的消息，于是控制台就打印出如下信息：

```LaTeX
ConsumeMessageThread_10----C0A8AE8E257000B4AAC25B0A0D6A0008----hello world8
ConsumeMessageThread_7----C0A8AE8E257000B4AAC25B0A0D5E0007----hello world7
ConsumeMessageThread_8----C0A8AE8E257000B4AAC25B0A0C230000----hello world0
ConsumeMessageThread_5----C0A8AE8E257000B4AAC25B0A0D4E0006----hello world6
ConsumeMessageThread_6----C0A8AE8E257000B4AAC25B0A0D210003----hello world3
ConsumeMessageThread_3----C0A8AE8E257000B4AAC25B0A0D730009----hello world9
ConsumeMessageThread_9----C0A8AE8E257000B4AAC25B0A0D310004----hello world4
ConsumeMessageThread_2----C0A8AE8E257000B4AAC25B0A0D470005----hello world5
ConsumeMessageThread_1----C0A8AE8E257000B4AAC25B0A0D160001----hello world1
ConsumeMessageThread_4----C0A8AE8E257000B4AAC25B0A0D180002----hello world2
#多线程处理所以乱序
```

消息接收成功！！！查看工作台消息，发现有消费记录了

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YjlmN2FjZDZjN2YxNzg4ZWIzYjQwYjRkZmQxZThjM2VfZ3U4TnN3b1VFRnJOOE5mR3pHZmpCbEJ3dU0wTklPRlpfVG9rZW46SWdtamJuVWw1b3hyZnl4d2piNWNET011blltXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

## **消息发送**

### **消息的诞生和发送**

一般消息是由业务系统在运行过程产生的，当我们的业务系统产生了消息，我们就可以调用RocketMQ提供的API向RocketMQ发送消息。

```Java
DefaultMQProducer producer = new DefaultMQProducer("sanyouProducer");
//指定NameServer的地址
producer.setNamesrvAddr("localhost:9876");
//启动生产者
producer.start();
//同步发送消息
Message msg = new Message("sanyouTopic", "", "hello ".getBytes(RemotingHelper.DEFAULT_CHARSET));
// 发送消息并得到消息的发送结果，然后打印
SendResult sendResult = producer.send(msg);
```

消息诞生于业务系统，那他们如何发送和消费，值得思考：

- 代码中只设置了NameServer的地址，那么生产者是如何知道Broker所在机器的地址，然后向Broker发送消息的？
- 一个topic会有很多队列，那么生产者是如何选择哪个队列发送消息？
- 消息一旦发送失败了怎么办？

#### **路由表**

当Broker在启动的过程中，Broker就会往NameServer注册自己这个Broker的信息，这些信息就包括自身所在服务器的ip和端口，还有就是自己这个Broker有哪些topic和对应的队列信息，这些信息就是路由信息，也称为路由表。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=OWY4MmRmNTExMTVjYWQ5YzRiYzQwYjk0ZGYyY2QzN2JfYzBSWmdmWE83ZDBxMWRZbzNGYXFSNHlrTmR2eFdYdTVfVG9rZW46WXVFWGJpNjdybzlJVUl4QUJjS2NiOW5xbnVkXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

当生产者启动的时候，会从NameServer中拉取到路由表，缓存到本地，同时会开启一个定时任务，默认是每隔**30s从NameServer中重新拉取路由信息，更新本地缓存**。

#### **队列的选择**

生产者连接后通过从NameServer拉取到Broker的路由表的信息，这样生产者就知道了topic对应的队列的信息了。

如果一个topic可能会有很多的队列，那么应该将消息发送到哪个队列上呢？

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MGVmMThiYjAwZjExYjI0ZTAxZWFjNTliZmFkMTg1NDhfdzJxUFhNT0laRTRzWlVpdjBVV2ViM3djS3RRa1BIUENfVG9rZW46SlhiUmI1U2g5b1c3eUJ4RGFseGNzdm1HbnZlXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

面对这种情况，RocketMQ提供了两种消息队列的选择算法。

- 轮询算法
- 最小投递延迟算法
- 自定义队列选择算法

**轮询算法**： 就是一个队列一个队列发送消息，这些就能保证消息能够均匀分布在不同的队列底下，这也是RocketMQ**默认**的队列选择算法。

但是由于机器性能或者其它情况可能会出现某些Broker上的Queue可能投递延迟较严重，这样就会导致生产者不能及时发消息，造成生产者压力过大的问题。所以RocketMQ提供了最小投递延迟算法。

**最小投递延迟算法**：每次消息投递的时候会统计投递的时间延迟，在选择队列的时候会**优先选择投递延迟时间小的队列**。这种算法可能会导致消息分布不均匀的问题。

如果你想启用最小投递延迟算法，只需要按如下方法设置一下即可。

```Plaintext
producer.setSendLatencyFaultEnable(true);
```

**自定义队列选择算法**：通过实现MessageQueueSelector接口，在发送消息的时候可以自己定义规则。

```Java
SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        //从mqs中选择一个队列
        return null;
    }
}, new Object());
```

**MessageQueueSelector**RocketMQ也提供了三种实现：

- 随机算法
- Hash算法
- 根据机房选择算法（空实现）

#### **发送异常处理**

不论是通过RocketMQ默认的队列选择算法也好，又或是自定义队列选择算法也罢，终于选择到了一个队列，那么此时就可以跟这个队列所在的Broker机器建立网络连接，然后通过网络请求将消息发送到Broker上。

但是万一Broker挂了，又或者是机器负载太高了，发送消息超时了，那么此时RockerMQ就会进行重试。

RockerMQ重试其实很简单，就是重新选择其它Broker机器中的一个队列进行消息发送，**默认会重试两次。**

```Java
producer.setRetryTimesWhenSendFailed(10); //可以通过设置修改默认的重试次数
```

#### **过大消息处理**

对于过大的消息（超过4k），RocketMQ是会对消息进行**压缩**之后再发送到Broker上，这样在消息发送的时候就可以减少网络资源的占用。

### **消息发送的三种方式**

#### **同步发送模式（Sync）**

- 原理：发送方发送消息后会等待消息被成功发送到消息队列服务器并收到确认消息后才返回发送结果给调用方。
- 特点：发送方会阻塞等待Broker返回发送结果，直到收到确认消息或者超时。
- 应用场景：对消息的**可靠性和顺序性要求较高的场景**，如**订单支付、账单生成、库存扣减**等关键业务操作。
- 注意事项：在发送消息时，可以设置合理的重试次数和重试间隔，以应对发送失败的情况。

```Java
public class ProducerSyncMessageTest {

    public static void main(String[] args) throws Exception {

        //创建一个生产者，指定生产者组为sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("helloConsumerGroup");

        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        // 第一次发送可能会超时，我设置的比较大
        producer.setSendMsgTimeout(60000);

        // 启动生产者
        producer.start();

        // 创建一条消息
        // topic为 helloTopic
        // 消息内容为  今天是个好日子
        Message msg = new Message("helloTopic", "今天是个好日子".getBytes(RemotingHelper.DEFAULT_CHARSET));

        // 同步发送消息并等待得到消息的发送结果，然后打印
        SendResult sendResult = producer.send(msg);
        System.out.printf("%s%n", sendResult);
                //
        // 关闭生产者
        producer.shutdown();
    }

}
```

输出：

```Java
//输出 
SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E67CC00B4AAC25B6F447E0000, offsetMsgId=C0A8988000002A9F0000000000000720, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=3], queueOffset=3]
//可以通过SendResult.sendStatus判断发送状态 编写合理的重试机制
```

#### **异步发送模式（Async）**

- 原理：发送方发送消息后**不会阻塞等待**，而是立即返回一个Future对象给调用方。**发送方在后台线程中异步等待消息发送结果，并通过回调函数处理发送结果**。
- 特点：适用于对响应时间有要求的场景，通常用于提高发送吞吐量。
- 应用场景：**日志收集、用户行为追踪、实时数据采集等需要高吞吐量的场景**。
- 注意事项：同样可以设置合理的重试次数和重试间隔来处理发送失败的情况。

```Java
public class ProducerAsyncMessageTest {

    public static void main(String[] args) throws Exception {

        //创建一个生产者，指定生产者组为sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("helloConsumerGroup");

        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        // 第一次发送可能会超时，我设置的比较大
        producer.setSendMsgTimeout(60000);

        // 启动生产者
        producer.start();

        // 创建一条消息
        // topic为 helloTopic
        // 消息内容为  今天是个好日子
        Message msg = new Message("helloTopic", "今天是个好日子".getBytes(RemotingHelper.DEFAULT_CHARSET));

        // 异发送消息不等待消息的发送结果，交给回调函数取解决，使用额外的线程
        System.out.println(Thread.currentThread().getName()+",发送消息开始...");
        producer.send(msg, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                //发送成功的回调函数
                System.out.println(Thread.currentThread().getName()+",发送消息成功，结果为："+sendResult);
            }
            @Override
            public void onException(Throwable throwable) {
                //发送异常的回调函数
                System.out.println(Thread.currentThread().getName()+",发送消息失败，异常信息为："+throwable);
            }
        });
        System.out.println(Thread.currentThread().getName()+",发送消息结束...");

        // 关闭生产者
        TimeUnit.SECONDS.sleep(2);
        producer.shutdown();
    }

}
```

输出：

```Java
//主线程不阻塞 接收回调的线程是另外的线程 NettyClientPublicExecutor_1
main,发送消息开始...
main,发送消息结束...
NettyClientPublicExecutor_1,发送消息成功，结果为：SendResult [sendStatus=SEND_OK, msgId=C0A8AE8E63A000B4AAC25B7DCA540000, offsetMsgId=C0A8988000002A9F000000000000087C, messageQueue=MessageQueue [topic=helloTopic, brokerName=broker-a, queueId=2], queueOffset=3]
```

#### **单向发送模式（Oneway）**

- 原理：一次性消息，消息发送完之后就不管了，不管发送成功没成功，是最不可靠的一种方式。
- 特点：发送方**只负责发送消息，不等待服务器回应且没有回调函数触发**。
- 应用场景：对消息的可靠性要求较低，不需要等待确认消息的场景，如**日志记录、广播通知、通知类消息等。**
- 注意事项：由于不等待确认，因此无法保证消息的可靠传输，适用于对可靠性要求不高的场景。

```Java
public class ProducerOnewayMessageTest {

    public static void main(String[] args) throws Exception {

        //创建一个生产者，指定生产者组为sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("helloConsumerGroup");

        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        // 第一次发送可能会超时，我设置的比较大
        producer.setSendMsgTimeout(60000);

        // 启动生产者
        producer.start();

        // 创建一条消息
        // topic为 helloTopic
        // 消息内容为  今天是个好日子
        Message msg = new Message("helloTopic", "今天是个好日子".getBytes(RemotingHelper.DEFAULT_CHARSET));

        // 一次性消息 没有返回值 也没有回调
        producer.sendOneway(msg);

        // 关闭生产者
        producer.shutdown();
    }
}
```

## **消息存储**

### **如何保证高性能读写**

消息发送成功后来到了Broker，接收到了生产者发送的消息了，但是为了能够保证Broker重启之后消息也不丢失，此时就需要将消息持久化到磁盘。

由于涉及到消息持久化操作，就涉及到磁盘数据的读写操作，那么如何实现文件的高性能读写呢？

#### **传统IO读写方式**

比如现在需要将磁盘文件通过网络传输出去，那么整个传统的IO读写模型:

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MWQxNmQ5Y2YzNzVkODc4MmEzMzQzOGU4ZGNhNGUzNmFfejZuYW1aQkpEZnFuZkNwdUhzT1FZYTJGOVAxMzg0cW5fVG9rZW46UHF6bGJyQTBFb2l3V0V4RzFyR2NrNWVNbllkXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

传统的IO读写其实就是**read + write**的操作，整个过程会分为如下几步

- 用户调用read()方法，开始读取数据，此时发生一次上下文从用户态到内核态的切换，也就是图示的切换1
- 将磁盘数据通过DMA(直接内存访问，允许数据在内存和外设之间直接传输，而无需CPU的直接参与)拷贝到内核缓存区
- 将内核缓存区的数据拷贝到用户缓冲区，这样用户，也就是我们写的代码就能拿到文件的数据
- read()方法返回，此时就会从内核态切换到用户态，也就是图示的切换2
- 当我们拿到数据之后，就可以调用write()方法，此时上下文会从用户态切换到内核态，即图示切换3
- CPU将用户缓冲区的数据拷贝到Socket缓冲区
- 将Socket缓冲区数据拷贝至网卡
- write()方法返回，上下文重新从内核态切换到用户态，即图示切换4

整个过程发生了4次上下文切换和4次数据的拷贝，这在高并发场景下肯定会严重影响读写性能。

为了减少上下文切换次数和数据拷贝次数，就引入了零拷贝技术。

#### **零拷贝技术**

零拷贝技术是一个思想，指的是指计算机执行操作时，CPU不需要先将数据从某处内存复制到另一个特定区域。

实现零拷贝的有以下几种方式

- mmap()
- sendfile()

##### **mmap()**

mmap（memory map）是一种**内存映射文件**的方法，即将一个文件或者其它对象映射到进程的地址空间，实现文件磁盘地址和进程虚拟地址空间中一段虚拟地址的一一对映关系。

简单地说就是内核缓冲区和应用缓冲区共享，从而减少了从读缓冲区到用户缓冲区的一次CPU拷贝。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MThkYzg5ZDg5OTk4YTMyYTc3ZTcxMDc3ZjlkZmJjMDlfNVg4Z3VLYnpDdUlHaHRaUXBFdG5jS2JpQ0Nkem1HOUdfVG9rZW46R3ZkRWJMTkZub1RsVXF4aFA2ZGNKMVJwbndnXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

基于mmap IO读写其实就变成mmap + write的操作，也就是用mmap替代传统IO中的read操作。

当用户发起mmap调用的时候会发生上下文切换1，进行内存映射，然后数据被拷贝到内核缓冲区，mmap返回，发生上下文切换2；

随后用户调用write，发生上下文切换3，将内核缓冲区的数据拷贝到Socket缓冲区，write返回，发生上下文切换4。

整个过程相比于传统IO主要是不用将内核缓冲区的数据拷贝到用户缓冲区，而是直接将数据拷贝到Socket缓冲区。上下文切换的次数仍然是4次，但是拷贝次数只有3次，少了一次CPU拷贝。

在Java中，提供了相应的api可以实现mmap，当然底层也还是调用Linux系统的mmap()实现的

```Java
//拿到MappedByteBuffer，之后就可以基于MappedByteBuffer去读写。
FileChannel fileChannel = new RandomAccessFile("test.txt", "rw").getChannel();
MappedByteBuffer mappedByteBuffer = fileChannel.map(FileChannel.MapMode.READ_WRITE, 0, fileChannel.size());
```

##### **sendfile()**

sendfile()跟mmap()一样，也会减少一次CPU拷贝，但是它同时也会减少两次上下文切换。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NjU4YjcwNDhhMGRmNDRhYmU0ZDNkNTU1ZjllZWFiMmFfSFlCTVgyY1RnZ01OREhxZ3phMFBWY051QU5QeWVVaUdfVG9rZW46Tm4yRWJ3N25Yb3oyVnR4UEYxdGMxR2lWbkFnXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

用户在发起sendfile()调用时会发生切换1，之后数据通过DMA拷贝到内核缓冲区，之后再将内核缓冲区的数据CPU拷贝到Socket缓冲区，最后拷贝到网卡，sendfile()返回，发生切换2。

Java也提供了相应的api，底层还是操作系统的sendfile()

```Java
FileChannel channel = FileChannel.open(Paths.get("./test.txt"), StandardOpenOption.WRITE, StandardOpenOption.CREATE);
//调用transferTo方法向目标数据传输
channel.transferTo(position, len, target);
```

通过FileChannel的transferTo方法即可实现。transferTo方法（sendfile）主要是用于文件传输，比如将文件传输到另一个文件，又或者是网络。

**RocketMQ内部主要是使用基于mmap实现的零拷贝**(其实就是调用上述提到的api)，用来读写文件，这也是RocketMQ为什么快的一个很重要原因。

#### **CommitLog**

消息需要持久化到磁盘文件中，而CommitLog其实就是存储消息的文件的一个称呼，所有的消息都存在CommitLog中，**一个Broker实例只有一个CommitLog**。

由于消息数据可能会很大，同时兼顾内存映射的效率，不可能将所有消息都写到同一个文件中，所以CommitLog在物理磁盘文件上被分为多个磁盘文件，每个文件默认的固定大小是**1G**。

当生产者将消息发送过来的时候，就会将消息按照顺序写到文件中，当文件空间不足时，就会重新建一个新的文件，消息写到新的文件中。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTE4NDkxZmVkMjAzMTk0NjQ4OWYxYzE0N2RjYTVmMDhfUUpWV2hRdFNaQVhLeWRZSXVGdXFnemlmNjRlYUpJcVRfVG9rZW46THhXUmI3cWFSbzV4dEh4T01tbmNQVXRhbktkXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

**消息在写入到文件时，不仅仅会包含消息本身的数据，也会包含其它的对消息进行描述的数据，比如这个消息来自哪台机器、消息是哪个topic的、消息的长度等等，这些数据会和消息本身按照一定的顺序同时写到文件中**。

### **刷盘机制**

同步刷盘和异步刷盘是消息队列系统中常用的两种数据持久化策略，它们的主要区别在于数据写入磁盘的时机和方式。RocketMQ在将消息写到CommitLog文件中时并不是直接就写到文件中，而是先写到**PageCache**，也就是**内核缓存区**，所以RocketMQ提供了两种刷盘机制，来将内核缓存区的数据刷到磁盘。以下是关于这两种刷盘策略的详细解释：

#### **同步刷盘**

**定义**：

- 同步刷盘就是指Broker将消息写到PageCache的时候，会等待异步线程将消息成功刷到磁盘之后再返回给生产者说消息存储成功。

**特点**：

1. **数据安全性高**：由于数据在写入内存后会立即被刷新到磁盘，因此即使系统发生宕机或重启，数据也不会丢失，保证了数据的安全性。
2. **效率较低**：由于客户端需要等待数据被写入磁盘后才能收到成功的响应，因此这种方式的效率相对较低。为了提高效率，通常会采用批量刷盘的方式，即每次刷盘时将内存中的所有数据都刷新到磁盘。

**适用场景**：

- 对于对数据安全性要求非常高的场景，如**金融、医疗**等领域，通常会采用同步刷盘策略。

#### **异步刷盘**

**定义**：

- 异步刷盘就是指Broker将消息写到PageCache的时候，就直接返回给生产者说消息存储成功了，然后通过另一个后台线程来将消息刷到磁盘，这个后台线程是在RokcetMQ启动的时候就会开启。异步刷盘方式也是RocketMQ**默认**的刷盘方式。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YjcyYjFhN2JmOTNiZDFlYjA5ZjNiNzU3ODQ2ZGYyM2VfWWRRYjVxWWtCb3RjT3BIU3lmWGZDR0plbnBqU1lFVzFfVG9rZW46RHpNRmJpQng3b1FuQWV4Q2xZUWNhNTk4bkNEXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

RocketMQ的异步刷盘也有两种不同的方式:

- 一种是固定时间，默认是每隔**0.5s**就会刷一次盘，**默认的方式**。
- 另一种就是频率会快点，就是**每存一次消息就会通知去刷盘**，但不会去等待刷盘的结果，同时如果0.5s内没被通知去刷盘，也会主动去刷一次盘。

**特点**：

1. **性能高**：由于客户端不需要等待数据被写入磁盘即可收到成功的响应，因此这种方式的性能较高。
2. **数据可能丢失**：由于数据是异步地写入磁盘的，如果在数据写入磁盘之前系统发生宕机或重启，那么这部分数据可能会丢失。

**适用场景**：

- 对于对性能要求非常高，且对数据安全性要求相对较低的场景，如互联网领域的实时消息传输、日志收集等，通常会采用异步刷盘策略。

## **消息消费**

Broker在成功存储消息之后，终于消费者要消费消息了。

消费者在启动的时候会从NameSrever拉取消费者订阅的topic的路由信息，这样就知道订阅的topic有哪些queue，以及queue所在Broker的地址信息。

这样消费者就可以准确的知道topic对应的哪些queue，因为在消费消息的时候是以队列为消费单元的，消费者需要告诉Broker拉取的是哪个队列的消息。

### **消费者如何拉取消息**

在RocketMQ中，消息的消费单元是以队列来的，所以RocketMQ为了方便快速的查找和消费消息，会为每个Topic的每个队列也单独创建一个文件。

RocketMQ给这个文件也起了一个高大上的名字：**ConsumeQueue**，每一个Topic的Queue，都对应一个ConsumeQueue。

当消息被存到CommitLog之后，其实还会往这条消息所在队列的ConsumeQueue文件中插一条数据

每个队列的ConsumeQueue也是由多个文件组成，每个文件默认是存30万条数据

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=OTk1NThlYzJjYWUzMjBhMTRjMGQxYTU1MDY2YmJhNjRfUzE2Z2Z5RmxKY0VRVTJXa1V4c3Z1RzZING8wc2VrVGFfVG9rZW46T3FRZ2Jodkk0b0dBYXV4RlJyQWNTZVdCbnF5XzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

插入ConsumeQueue中的每条数据由20个字节组成，包含3部分信息

- 消息在CommitLog的起始位置（8个字节）
- 消息在CommitLog存储的长度（8个字节）
- 消息tag的hashCode（4个字节）

每条数据也有自己的编号（offset），默认从0开始，依次递增

**当消费者拉取消息的时候，会告诉服务端自己消费哪个队列（queueId），哪个位置的消息（offset）的消息**。

Broker在接受到消息的时候，会找到queueId对应的ConsumeQueue，由于每条数据固定是20个字节，所以可以轻易地计算出queueOffset对应的那条数据在哪个文件的哪个位置上，然后读出20个字节，从这20个字节中在解析出消息在CommitLog的起始位置和存储的长度，之后再到CommitLog中去查找，这样就找到了消息，然后在进行一些处理操作返回给消费者。

所以，ConsumeQueue其实就相当于是一个索引文件，方便我们快速查找在CommitLog中的消息

==要想查找到某个Topic下的消息，那么一定是先找这个Topic队列对应的ConsumeQueue，之后再通过ConsumeQueue中的数据去CommitLog文件查找真正的消息内容==

### **拉取消息的两种模式**

**Pull（拉取）模式**：

- **主动权在消费者**：消费者主动向Broker请求消息，决定拉取的时机和拉取的数量。消费者拥有更大的控制权，可以根据自己的需求灵活地拉取消息。
- **消息拉取频率**：消费者可以根据实际情况决定拉取消息的频率，例如可以定时拉取，也可以根据业务负载动态调整拉取消息的速度。
- **流量控制**：Pull模式下，消费者可以根据自身情况进行流量控制，避免瞬时大量消息涌入导致负载过重。
- **示例**：消费者首先通过打算消费的Topic拿到MessageQueue的集合，遍历MessageQueue集合，然后针对每个MessageQueue批量取消息，一次取完后，记录该队列下一次要取的开始offset，直到取完了，再换另一个MessageQueue。

**Push（推送）模式**：

- **主动权在Broker**：虽然从严格意义上讲，RocketMQ并没有实现真正的Push模式，而是对Pull模式进行了一层包装。但在用户体验上，Broker会主动地将消息推送给消费者。一般默认都使用Push模式，帮我们做了封装，简化了代码。
- **实时性**：采用Push方式，可以尽可能实时地将消息发送给消费者进行消费。
- **慢消费问题**：然而，在消费者的处理消息的能力较弱的时候（比如消费者端的业务系统处理一条消息的流程比较复杂，其中的调用链路比较多导致消费时间比较久），Broker不断地向消费者Push消息，消费者端的缓冲区可能会溢出，导致异常。
- **实现原理**：Push的方式实际上是Broker通过不断轮询的方式向消费者推送消息。当不存在新消息时，Broker会挂起请求，直到有新消息产生，再取消挂起并返回新消息。

### **消费的两种模式**

消费者是有个消费者组的概念，在启动消费者的时候会指定该消费者属于哪个消费者组。

```Java
//指定消费者组
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("xxConsumer");
```

一个消费者组中可以有多个消费者，不同消费者组之间消费消息是互不干扰的。

在同一个消费者组中，消息消费有两种模式。

- 集群模式
- 广播模式

#### **集群消费模式（Clustering Consumer）**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NmNkZTExYmJmNGIxNTY1ZmU4NmFhNzliOTcyMDEyNWZfZTl0Tm1ZRU5EMjRPYmtJMDVYSFBxVUVVNWlTZm1zRE9fVG9rZW46WVEyUGJReUJEb1dHdTZ4NnRrN2NxS25ZbnFmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

- 定义：
  - **集群消费模式是RocketMQ的默认消费模式**。在这种模式下，多个消费者实例共同消费同一个消费组（Consumer Group）的消息。
  - 同一条消息只能被同一个消费组下的一个消费者消费，也就是说，同一条消息在同一个消费者组底下只会被消费一次，这就叫集群消费。
  - 集群消费的实现就是将队列按照一定的算法分配给消费者，默认是按照平均分配的（**轮循**）。
- 特点：
  - 消息会均匀分发给每个消费者实例，每个消费者实例只处理其中一部分消息。
  - **适用于一组消费者实例协同处理同一个消息队列的场景**。例如，在电商平台的订单处理中，多个消费者实例可以同时消费订单消息，每个消费者实例处理其中一部分订单，以提高消息的处理效率。

#### **广播消费模式（Broadcasting Consumer）**

如果要使用广播模式，需要添加配置：

```Java
consumer.setMessageModel(MessageModel.BROADCASTING);        
```

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=YTZjNzUzYzhhNDViNzMzNTgwNWM3YTg4MzhlOGEwNDdfenpwT05yc1NMNDdralBqdXpiVWlWWjBScHpMSG95bndfVG9rZW46SXRHa2JyRHRZb2ZTT0J4ZXdhQ2NsQUx1bjRjXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

- 定义：
  - 广播消费模式是指每个消费者实例都会消费同一个消费组的所有消息，每个消费者实例都会处理完整的消息集合。
- 特点：
  - 在广播消费模式下，每个消费者实例都会独立地处理消息，不会存在消息的重复消费。
  - 适用于**每个消费者实例都需要独立处理所有消息的场景**。例如，**系统通知和广告消息**可以使用广播消费模式，确保每个消费者实例都能收到并处理这些消息。
- 需要注意的是，在广播消费模式下，即使增加或减少消费者数量，也不会影响消息的消费能力，因为每个消费者都会收到所有的消息。

## **消息过滤**

在消息中间件中，消息过滤是一个重要的特性，它允许消费者（Consumer）根据某些条件选择性地接收消息。在RocketMQ中，消息过滤主要基于Tag和SQL表达式两种方式来实现。

### **基于Tag的消息过滤**

在RocketMQ中，生产者（Producer）在发送消息时可以指定一个或多个Tag，消费者（Consumer）在订阅消息时可以订阅特定的Tag。这样，消费者只会接收到带有它所订阅的Tag的消息。

**生产者发送消息时指定Tag**

生产者发送消息时，可以通过`Message`的`setTags`方法指定消息的Tag。

```Java
//封装消息 指定一个或多个Tag  TagA||TagB
Message message = new Message(topic,"tagA", ("tag消息...").getBytes());
Message message2 = new Message(topic,"tagB", ("tag消息...").getBytes());
Message message3 = new Message(topic,"tagC", ("tag消息...").getBytes());
//发送消息
producer.send(message);
producer.send(message2);
producer.send(message3);
System.out.println("发送结果完毕");
```

**消费者订阅特定的Tag**

消费者通过`subscribe`方法订阅特定的Tag。

```Java
//订阅主题 *代表订阅所有helloTopic下所有消息
//consumer.subscribe("helloTopic", "tagA"); 
consumer.subscribe("helloTopic", "tagA || tagC");      
```

最后消息都被消费，但是只有tagA || tagC的输出，tagB的消息被客户端过滤掉了。

通过Tag过滤，消费者可以只接收与自己业务相关的消息，从而避免处理不必要的消息，提高系统的处理效率。

适用场景

- 当一个Topic需要支持多种类型的消息时，可以通过为每种类型的消息设置不同的Tag来实现。
- **示例**1：一个物流系统的Topic可能包含“揽件”、“运输中”、“已签收”等多种类型的消息，每种类型的消息使用不同的Tag进行区分。
- **示例2**：一个电商系统的订单Topic中，可以使用不同的Tag来表示订单的不同状态（如“待支付”、“已支付”、“已发货”等）。

### **基于SQL92的消息过滤**

RocketMQ还支持基于SQL表达式的消息过滤，这允许消费者根据消息的内容进行更复杂的过滤。RocketMQ的消息过滤机制支持使用SQL92表达式。当消费者订阅消息时，可以通过MessageSelector接口指定SQL92表达式来过滤消息。

**生产者发送消息**

- **设置方式**：生产者发送消息时，可以通过`putUserProperty`方法为消息添加键值对形式的属性集合。

```Java
public class ProducerSql92MessageTest {

    public static void main(String[] args) throws Exception {
        //1.创建生产者
        DefaultMQProducer producer = new DefaultMQProducer("helloProducerGroup");
        //2.设置namesrver地址
        producer.setNamesrvAddr("192.168.152.128:9876");

        //3.启动生产者
        producer.start();
        //4.创建消息目的地 topic
        String topic = "helloTopic";
        //5.封装消息
        Message message = new Message(topic, "tagA", ("zs-18...").getBytes());
        message.putUserProperty("name", "zs");
        message.putUserProperty("age", "18");
        Message message2 = new Message(topic, "tagA", ("ls-21...").getBytes());
        message2.putUserProperty("name", "ls");
        message2.putUserProperty("age", "21");
        Message message3 = new Message(topic, "tagA", ("zb-23...").getBytes());
        message3.putUserProperty("name", "zb");
        message3.putUserProperty("age", "23");
        //6.发送消息
        producer.send(message);
        producer.send(message2);
        producer.send(message3);
        System.out.println("发送结果完毕");
        //7.关闭生产者
        producer.shutdown();
    }
}
```

在这个示例中，我们设置了两个属性，`name`和`age`。

**消费者接收消息**

在consumer中通过`MessageSelector.bySql()`设置我们的sql过滤条件。例如：age > 20

```Java
package com.zunhui.mq.consumer;

import org.apache.rocketmq.client.consumer.DefaultMQPushConsumer;
import org.apache.rocketmq.client.consumer.MessageSelector;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyContext;
import org.apache.rocketmq.client.consumer.listener.ConsumeConcurrentlyStatus;
import org.apache.rocketmq.client.consumer.listener.MessageListenerConcurrently;
import org.apache.rocketmq.common.message.MessageExt;
import org.apache.rocketmq.common.protocol.heartbeat.MessageModel;

import java.util.Date;
import java.util.List;

/**
 * @author zunhui
 * @description
 * @date 2024/6/18 16:39
 */
public class ConsumerSql92Test {
    public static void main(String[] args) throws InterruptedException {
        //1.创建消费者
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("helloConsumerGroup");
        //2.设置nameserver地址
        consumer.setNamesrvAddr("192.168.152.128:9876");
        consumer.setMessageModel(MessageModel.BROADCASTING);
        try {
            //3.订阅主题 使用sql的方式来过滤接收数据
            consumer.subscribe("helloTopic", MessageSelector.bySql("age > 20"));
            //4.注册监听器(多线程的方式)
            consumer.setMessageListener(new MessageListenerConcurrently() {

                @Override
                public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
                    for (MessageExt msg : list){
                        //消息内容
                        System.out.println(Thread.currentThread().getName()+"----"+new Date() +"----"+new String(msg.getBody()));
                    }
                    //返回消费状态
                    //CONSUME_SUCCESS 消费成功
                    //RECONSUME_LATER 消费失败，需要重试
                    //CONSUME_REJECTED 消费失败，需要拒绝
                    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
                }
            });
            //5.启动消费者
            consumer.start();
        }catch (Exception e){
            e.printStackTrace();
        }
        //6.关闭消费者
//        Thread.sleep(1000);
//        consumer.shutdown();
    }

}
```

注意：这里的SQL表达式是基于Broker提供的消息过滤接口MessageSelector实现的，并不是真正的SQL查询。

启动消费者，发现报错：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NDQyNzVmM2JiYzQ3ZjkxMjgxMWFlZGM5NWUwMTNlMTVfN3JKbHRaOVJtenRHTDAzTXNPdUxpTVY4aWdndkVkQzJfVG9rZW46WVdaM2JnZkpQb21WZkl4V1NSWWNmZ3hobnNoXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

说明，RocketMQ默认是没有开启SQL92的过滤功能的，需要在配置文件中开启，查看集群borker的配置，找到`enablePropertyFilter`是false，没有开启，需要修改配置后重启Broker。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NDRkZmRiNGViZmMyMjZkMDkwZjYyMzBmZDI3ZWMzNTFfRDM5dGxNWE9iUXhaajhLS1FUaTFBaUJWSENQcjhpR2VfVG9rZW46S2Z2SmJPN2Uxb2J6NWF4eUt2TGNVM2VvbkllXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

在`broker.conf`中添加配置`enablePropertyFilter=true`，然后重启Broker。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTRiMDgyNzYyZDdjZWVjZDIyNjNjZDdlZWVkNTA3YmZfSWVaY0R5Z0w4RDNoQ0gxVW9RaTF2SGJUdWZwWG9JWWpfVG9rZW46U2NoOWJxV3Izb0x4bnJ4aTJ6N2MzYWc3bmM0XzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

再次查看broker配置，显示修改成功。再次启动消费者端：

```Java
ConsumeMessageThread_1----Wed Jun 19 18:20:40 CST 2024----ls-21...
ConsumeMessageThread_2----Wed Jun 19 18:20:40 CST 2024----zb-23...
```

只输出了两条信息，age<=20的数据被过滤了。

**SQL表达式过滤的特点**

- **灵活性**：SQL表达式过滤允许消费者根据消息的属性进行复杂的过滤操作，比基于Tag的过滤更加灵活。
- **性能考虑**：由于SQL表达式过滤需要在Broker端执行，因此对于过滤条件的选择和执行效率需要特别注意，以避免对Broker造成过大的性能压力。

### **使用建议**

- **简单条件使用Tag**：如果过滤条件比较简单，建议使用Tag进行过滤，因为Tag过滤的性能开销通常较小。
- **复杂条件使用SQL**：如果过滤条件比较复杂，可以考虑使用SQL表达式进行过滤。但请注意，需要权衡过滤需求和Broker的性能负载之间的关系。
- **优化过滤条件**：尽量使用简单的SQL语句和有效的索引来提高过滤效率。避免使用复杂的连接、子查询等可能导致性能下降的操作。

### **注意事项**

1. **性能考虑**：基于SQL表达式的消息过滤会增加Broker的CPU负载，因此在使用时需要权衡性能和过滤需求的关系。
2. **Tag与SQL表达式的选择**：如果过滤条件比较简单，建议使用Tag；如果过滤条件比较复杂，可以考虑使用SQL表达式。但请注意，SQL表达式的性能开销可能较大。
3. **过滤顺序**：RocketMQ首先根据Tag进行过滤，然后再根据SQL表达式进行过滤（如果设置了的话）。因此，如果同时使用了Tag和SQL表达式，需要注意它们的组合效果。

## **消息清理**

由于消息是存磁盘的，但是磁盘空间是有限的，所以对于磁盘上的消息是需要清理的。RocketMQ的消息清理涉及多个策略和机制，以确保系统的稳定运行和资源的有效利用。

消息文件删除策略

- **定时删除策略**：用户可以配置RocketMQ定期删除过期的消息文件和索引文件。一旦消息文件中的消息过期，RocketMQ将自动删除它们。
- **空间满策略**：如果存储磁盘空间达到一定限制，RocketMQ可以自动删除最早的消息文件，以释放磁盘空间。这个策略确保了存储空间不会无限制地增长。
- **指定时间段删除策略**：用户可以配置RocketMQ只删除特定时间段内的消息文件，以保留历史消息。

**消息归档**

- RocketMQ允许用户将历史消息归档到其他存储介质中，如云存储或本地归档系统，以减小消息服务器的存储负担。归档可以手动触发，也可以自动触发，具体取决于用户需求。

**消息过期时间和清理机制**

- 当消息被生产者发送到消息队列后，会附带一个过期时间戳。当消息到达消费者时，消费者会更新消息的过期时间戳。
- 当消息的过期时间戳早于当前时间时，该消息被视为过期消息。此时，消息队列会触发消息清理机制，将过期消息从队列中移除，并将其放入磁盘存储中。
- 消息的过期时间可以通过配置进行设置，以满足不同应用场景的需求。

**Commitlog文件的清理**

- 消息是被顺序存储在commitlog文件中的，且消息大小不定长。因此，消息的清理通常是以commitlog文件为单位进行的，以提高清理效率和降低复杂性。
- Commitlog文件存在一个过期时间，**默认为72小时**（即三天）。除了用户手动清理外，在以下情况下也会被自动清理：
  - 文件过期且到达清理时间点（**默认为凌晨4点**）后，自动清理过期文件。
  - 文件过期且磁盘空间占用率已达过期清理警戒线（**默认75%**）后，无论是否达到清理时间点，都会自动清理过期文件。
  - 磁盘占用率达到清理警戒线（**默认85%**）后，开始按照设定好的规则清理文件，无论是否过期。默认会**从最老的文件开始清理**。
  - **磁盘占用率达到系统危险警戒线（默认90%）后，Broker将拒绝消息写入**。

**清理操作的影响**

- 对于RocketMQ系统来说，删除一个大型文件是一个压力巨大的IO操作，可能会导致系统性能下降。因此，默认清理时间点通常设置在访问量最小的时间，如凌晨4点。
- 官方建议RocketMQ服务的Linux文件系统采用ext4，因为ext4在文件删除操作上的性能要比ext3更好。

如果消息没有被消费，那么会被清理么？

答案是，会被清理的，因为清理消息是直接删除CommitLog文件，所以只要达到上面的条件就会直接删除CommitLog文件，无论文件内的消息是否被消费过。

## **消息类型（11种）**

### **普通消息（Normal Message）**

- 这是最基本的消息类型，没有任何特殊属性。
- 生产者发送消息到指定的主题，消费者从主题订阅并消费这些消息。
- 普通消息不保证严格的顺序。

```Java
public class Producer {
    public static void main(String[] args) throws Exception {
        //创建一个生产者，指定生产者组为 helloProducerGroup
        DefaultMQProducer producer = new DefaultMQProducer("helloProducerGroup");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:987");
        // 启动生产者
        producer.start();

        //创建一条消息 topic为 helloTopic 消息内容为 zunhui的日记
        Message msg = new Message("helloTopic", "zunhui的日记".getBytes(RemotingHelper.DEFAULT_CHARSET));
        // 发送消息并得到消息的发送结果，然后打印
        SendResult sendResult = producer.send(msg);
        System.out.printf("%s%n", sendResult);

        // 关闭生产者
        producer.shutdown();
    }

}
```

### **批量消息（Batch Message）**

- 允许生产者将多个消息打包成一个批次发送，提高传输效率和吞吐量。
- 适用于消息体较小且发送频率较高的场景。

```Java
public class Producer {
    public static void main(String[] args) throws Exception {
        //创建一个生产者，指定生产者组为 helloProducerGroup
        DefaultMQProducer producer = new DefaultMQProducer("helloProducerGroup");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:987");
        // 启动生产者
        producer.start();

        //用以及集合保存多个消息
        List<Message> messages = new ArrayList<>();
        messages.add(new Message("helloTopic", "zunhui的mq日记 0".getBytes()));
        messages.add(new Message("helloTopic", "zunhui的mq日记 1".getBytes()));
        messages.add(new Message("helloTopic", "zunhui的mq日记 2".getBytes()));
        // 发送消息并得到消息的发送结果，然后打印
        SendResult sendResult = producer.send(msg);
        System.out.printf("%s%n", sendResult);

        // 关闭生产者
        producer.shutdown();
    }

}
```

多个普通消息同时发送，这就是批量消息

不过在使用批量消息的时候，需要注意以下两点

- 每条消息的Topic必须都得是一样的
- 不支持延迟消息和事务消息

普通消息和批量消息比较简单，没有复杂的逻辑，就是将消息发送过去，在ConsumeQueue和CommitLog存上对应的数据就可以了

### **顺序消息（Ordered Message）**

- 保证同一个队列（Message Queue）中的消息被顺序消费。也就是生产者发送消息的顺序跟消费者消费消息的顺序是一致的。
- 对于需要严格按照消息发送顺序执行的业务场景（如订单创建、支付、发货等）非常有用。

RocketMQ可以保证同一个队列的消息绝对顺序，**先进入队列的消息会先被消费者拉取到**，但是无法保证一个Topic内消息的绝对顺序，因为一个topic可能有多个队列

所以要想通过RocketMQ实现顺序消费，需要保证两点

- 生产者将需要保证顺序的消息发送到同一个队列
- 消费者按照顺序消费拉取到的消息

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NTI4ZDg5NDJiYTRiY2Q0OWUzYWY3NzhkY2U5NDVhMTVfTUF3NVFWZUhUMTEwNjV6dzNmRDlkMjN5SjRWTzMyNkRfVG9rZW46VTUxeGJGZWh1b2VHZm14cDQ3ZGNVSHdBbjVmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

**如何消息发送到同一个队列？**

RocketMQ发送消息的时候会选择一个队列进行发送，默认是通过**轮询算法**来选择队列的，这就无法保证需要顺序消费的消息会存到同一个队列底下，所以，默认情况下是不行了，我们需要自定义队列的选择算法，才能保证消息都在同一个队列中。

RocketMQ提供了自定义队列选择的接口`MessageQueueSelector`，我们可以实现这个接口，保证相同订单id的消息都选择同一个队列，在消息发送的时候手动指定要发送到那个队列。

```Java
SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        //可以根据业务的id从mqs中选择一个队列
        return null;
    }
}, new Object());
```

**保证消息顺序发送之后，消费者怎么按照顺序消费拉取到的消息？**

RocketMQ在消费消息的时候已经考虑到了，提供了两种方式：

- 并发消费
- 顺序消费

并发消费，**多个线程同时处理同一个队列拉取到的消息**

- 使用`MessageListenerConcurrently`实现

```Java
//注册监听器(多线程的方式)
consumer.setMessageListener(new MessageListenerConcurrently() {
    @Override
    public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext consumeConcurrentlyContext) {
        for (MessageExt msg : list){
            //消息内容
            System.out.println(Thread.currentThread().getName()+"----"+msg.getMsgId()+"----"+new String(msg.getBody()));
        }
        //返回消费状态
        //CONSUME_SUCCESS 消费成功
        //RECONSUME_LATER 消费失败，需要重试
        //CONSUME_REJECTED 消费失败，需要拒绝
        return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
    }
});
```

顺序消费，**同一时间只有一个线程会处理同一个队列拉取到的消息**

- 使用`MessageListenerOrderly`实现顺序消费。

```Java
// 注册一个消费的监听器，当有消息的时候，会回调这个监听器来消费消息
consumer.registerMessageListener(new MessageListenerOrderly() {
    @Override
    public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
            for (MessageExt msg : msgs) {
                    //消息内容
            System.out.println(Thread.currentThread().getName()+"----"+msg.getMsgId()+"----"+new String(msg.getBody()));
            }

            return ConsumeOrderlyStatus.SUCCESS;
    }
});
```

**并发消费和顺序消费跟前面提到的集群消费和广播消费有什么区别？**

- 集群消费和广播消费指的是一个消费者组里的每个消费者是去**拉取全部队列的消息还是部分队列**的消息，也就是选择需要拉取的队列
- 而并发和顺序消费的意思是，是对**已经拉到的同一个队列的消息，是并发处理还是按照消息的顺序去处理**。

**顺序消费demo**

生产者代码：

```Java
//定义一个订单的类
public class OrderStep {

    private Long orderId;
    private String desc;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    @Override
    public String toString() {
        return "OrderStep{" +
                "orderId=" + orderId +
                ", desc='" + desc + '\'' +
                '}';
    }
}
//写个工具类 生成点数据
public class OrderStepUtils {
    //生成数据 arraylist是有序的 模拟多线程下订单下单乱序 有 1 2 3 三个订单
    public static List<OrderStep> getOrders() {
        List<OrderStep> list = new ArrayList<>();

        OrderStep orderStep = new OrderStep();
        orderStep.setOrderId(10001L);
        orderStep.setDesc("创建订单");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10001L);
        orderStep.setDesc("支付完成");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10002L);
        orderStep.setDesc("创建订单");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10002L);
        orderStep.setDesc("支付完成");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10001L);
        orderStep.setDesc("确认下单");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10002L);
        orderStep.setDesc("确认下单");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10001L);
        orderStep.setDesc("已推送物流");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10003L);
        orderStep.setDesc("创建订单");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10002L);
        orderStep.setDesc("已推送物流");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10003L);
        orderStep.setDesc("支付完成");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10003L);
        orderStep.setDesc("确认下单");
        list.add(orderStep);

        orderStep = new OrderStep();
        orderStep.setOrderId(10003L);
        orderStep.setDesc("已推送物流信息");
        list.add(orderStep);

        return list;
    }
}
//生产者代码
public class OrderProducerDemo {

    public static void main(String[] args) {
        //创建生产者
        DefaultMQProducer producer = new DefaultMQProducer("order_producer");
        //设置nameserver地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        //启动生产者
        try {
            producer.start();
            //获取订单列表
            List<OrderStep> orderSteps = OrderStepUtils.getOrders();
            //创建消息队列选择器 顺序消息自定义实现规则
            //参数1:消息队列列表 参数2:消息 参数3:订单id
            MessageQueueSelector selector = new MessageQueueSelector() {
                /**
                 * @param mqs 消息队列列表
                 * @param msg 消息本身
                 * @param arg 订单id
                 * @return
                 */
                @Override
                public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
                    //让订单id和队列长度取模 相同的就放入同一个队列 也可以定义其他规则
                    Long orderId = (Long) arg;
                    Long index = orderId % mqs.size();
                    return mqs.get(index.intValue());
                }
            };
            for (OrderStep orderStep : orderSteps) {
                //设置要发送的主题 并发生消息
                Message orderMessage = new Message("order_topic", orderStep.toString().getBytes());
                //使用自定义的队列选择器 
                producer.send(orderMessage, selector, orderStep.getOrderId());
            }
            System.out.println("发送完成");
        } catch (Exception e) {
            e.printStackTrace();
        }finally {
            //关闭生产者
            producer.shutdown();
        }
    }
}
```

消费者代码：

```Java
public class OrderConsumerDemo {

    public static void main(String[] args) throws Exception{
        //1.创建消费者
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("order_consumer");
        //2.设置nameserver地址
        consumer.setNamesrvAddr("192.168.152.128:9876");
        //3.订阅主题 *代表订阅所有helloTopic下所有消息
        consumer.subscribe("order_topic", "*");
        //4.注册监听器(单一线程绑定的方式)
        consumer.setMessageListener(new MessageListenerOrderly() {
            @Override
            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
                for (MessageExt msg : msgs) {
                    //消息内容
                    System.out.println("线程： " + Thread.currentThread() + "，队列信息：" + msg.getQueueId() + "--------" + new String(msg.getBody()));
                }
                return ConsumeOrderlyStatus.SUCCESS;
            }
        });
        //5.启动消费者
        consumer.start();
    }

}
```

启动消费者，然后启动生产者发生消息，输出如下：

```Java
线程： Thread[ConsumeMessageThread_2,5,main]，队列信息：1--------OrderStep{orderId=10001, desc='创建订单'}
线程： Thread[ConsumeMessageThread_1,5,main]，队列信息：3--------OrderStep{orderId=10003, desc='创建订单'}
线程： Thread[ConsumeMessageThread_3,5,main]，队列信息：2--------OrderStep{orderId=10002, desc='创建订单'}
线程： Thread[ConsumeMessageThread_1,5,main]，队列信息：3--------OrderStep{orderId=10003, desc='支付完成'}
线程： Thread[ConsumeMessageThread_2,5,main]，队列信息：1--------OrderStep{orderId=10001, desc='支付完成'}
线程： Thread[ConsumeMessageThread_1,5,main]，队列信息：3--------OrderStep{orderId=10003, desc='确认下单'}
线程： Thread[ConsumeMessageThread_2,5,main]，队列信息：1--------OrderStep{orderId=10001, desc='确认下单'}
线程： Thread[ConsumeMessageThread_3,5,main]，队列信息：2--------OrderStep{orderId=10002, desc='支付完成'}
线程： Thread[ConsumeMessageThread_2,5,main]，队列信息：1--------OrderStep{orderId=10001, desc='已推送物流'}
线程： Thread[ConsumeMessageThread_3,5,main]，队列信息：2--------OrderStep{orderId=10002, desc='确认下单'}
线程： Thread[ConsumeMessageThread_1,5,main]，队列信息：3--------OrderStep{orderId=10003, desc='已推送物流信息'}
线程： Thread[ConsumeMessageThread_3,5,main]，队列信息：2--------OrderStep{orderId=10002, desc='已推送物流'}
```

可以看到，相同订单号的数据被放到了同一个队列中，并且是按照订单创建-->支付-->确认-->推送物流的顺序消费的。

### **延时消息（Delayed Message）**

- 允许生产者发送消息后，消息不会立即被消费，而是在指定的延时时间后才可被消费。
- 适用于需要在未来某个时间点执行任务的场景，如：超时订单取消，限时拼团活动等。

RocketMQ的延迟消息用起来非常简单，只需要在创建消息的时候指定延迟级别，之后这条消息就成为延迟消息了。

```Java
//创建一条消息 topic为 helloTopic 消息内容为 zunhui的日记
Message msg = new Message("helloTopic", "zunhui的日记".getBytes(RemotingHelper.DEFAULT_CHARSET));
//延迟级别 例如指定的延时等级为3，则表示延迟时长为10s，即延迟等级是从1开始计数的。超过最大默认最大
message.setDelayTimeLevel(1);
```

RocketMQ延迟消息的延迟时间默认有18个级别，不同的延迟级别对应的延迟时间不同。

```Java
// MessageStoreConfig.java
private String messageDelayLevel = "1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h";
```

RocketMQ内部有一个Topic，专门用来表示是延迟消息的，叫`SCHEDULE_TOPIC_XXXX`，XXXX不是占位符，就是XXXX

RocketMQ会根据延迟级别的个数为SCHEDULE_TOPIC_XXXX这个Topic创建相对应数量的队列

比如**默认延迟级别是18，那么SCHEDULE_TOPIC_XXXX就有18个队列，队列的id从0开始**，所以延迟级别为1时，对应的队列id就是0，为2时对应的就是1，依次类推。

**SCHEDULE_TOPIC_XXXX有什么作用呢？**

这就得从消息存储时的一波**偷梁换柱**的骚操作了说起了

当服务端接收到消息的时候，判断延迟级别大于0的时候，说明是延迟消息，此时会干下面三件事：

- 将消息的Topic改成`SCHEDULE_TOPIC_XXXX`
- 将消息的队列id设置为延迟级别对应的队列id
- 将消息真正的Topic和队列id存到前面提到的消息存储时的额外信息中

之后消息就按照正常存储的步骤存到CommitLog文件中

由于消息存到的是`SCHEDULE_TOPIC_XXXX`这个Topic中，而不是消息真正的目标Topic中，**所以消费者此时是消费不到消息的**

比如：有条消息，Topic为sanyou，所在的队列id = 1，延迟级别 = 1，那么偷梁换柱之后的结果如下图所示：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NGRiMzhmMTljMjRjMzQ1OGNjMzY1NzU2NTNjZTgwZTZfSUVxRXdWbVFFY3BpMThVNTZjaGNyb0p5Y1A3U0NiM2JfVG9rZW46Qmo5amI4ZDQxb0Y3cWN4Vkp4dmNnUDRybmVmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

然后：BocketMQ在启动的时候，除了为每个延迟级别创建一个队列之后，还会为每个延迟级别创建一个**延迟任务，也就相当于一个定时任务，每隔100ms执行一次**。

这个延迟任务会去检查这个队列中的消息有没有到达延迟时间，也就是不是可以消费了

一旦发现到达延迟时间，可以消费了，此时就会**从这条消息额外存储的消息中拿到真正的Topic和队列id，重新构建一条新的消息，将新的消息的Topic和队列id设置成真正的Topic和队列id，内容还是原来消息的内容**

之后**再一次**将新构建的消息存储到CommitLog中

**由于新消息的Topic变成消息真正的Topic了，所以之后消费者就能够消费到这条消息了**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTY2ODA0ZWVhYTQ2ZjJlMTZlM2Q3NzJmNzUzNDQ4NGVfekluZWpqWnV5WEVJcGZMQkNLQkZyY2w4VkE5Mk1SbEhfVG9rZW46S1JvdWJoV3A4b1FqVkZ4UFpEc2NiOXRpblVmXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

所以延迟消息的本质就是，将延迟消息存储在`SCHEDULE_TOPIC_XXXX`这个Topic中，并且相同延迟级别的消息在同一个队列，然后有类似定时任务，每隔100ms去检查一次这个延迟队列中的消息，如果到达了延迟时间，就根据记录的额外信息中真正的主题和队列以及消息内容，重新生成一条消息发送本来偷梁换柱前的topic中，这样消费者就能对消息进行消费了。

### **事务消息（Transaction Message）**

- 允许将本地事务和消息发送结合起来。
- 生产者发送半消息（Prepared Message），本地事务执行成功后，再确认消息，此时消费者才能消费该消息。
- 如果本地事务执行失败，则回滚消息。

```Java
public class TransactionMessageTest {

    public static void main(String[] args) throws Exception {
        TransactionMQProducer transactionMQProducer = new TransactionMQProducer("sanyouProducer");
        transactionMQProducer.setNamesrvAddr("192.168.152.128:9876");

        //设置事务监听器
        transactionMQProducer.setTransactionListener(new TransactionListener() {

            @Override
            public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
                //处理本次事务
                return LocalTransactionState.COMMIT_MESSAGE;
            }

            @Override
            public LocalTransactionState checkLocalTransaction(MessageExt msg) {
                //检查本地事务
                return LocalTransactionState.COMMIT_MESSAGE;
            }
        });

        transactionMQProducer.start();

        Message message = new Message("helloTopic", "zunhui的java日记".getBytes());

        //发送消息
        transactionMQProducer.sendMessageInTransaction(message, new Object());
    }
}
```

事务消息发送相对于前面的例子主要有以下不同：

- 将前面的`DefaultMQProducer`换成`TransactionMQProducer`
- 需要设置事务的监听器`TransactionListener`，来执行本地事务
- 发送方法改成 sendMessageInTransaction

为什么要这么改，接下来我们来探讨背后的实现原理

事务消息的实现和延迟消息类似，也会进行偷梁换柱，将消息先存在`RMQ_SYS_TRANS_HALF_TOPIC`这个Topic下，同时也会将消息真正的Topic和队列id存到额外信息中。

由于消息不在真正目标的Topic下，所以这条消息消费者也是消费不到的

**当消息成功存储之后，服务端会向生产者响应，告诉生产者我消息存储成功了，你可以执行本地事务了**

之后生产者就会执行本地执行事务，也就是执行如下方法

```Java
TransactionListener#executeLocalTransaction
```

当本地事务执行完之后，会将执行的结果发送给服务端

服务端会根据事务的执行状态来执行对应的处理结果

- **commit**：提交事务消息，跟延迟消息一样，重新构建一条消息，Topic和队列id都设置成消息真正的Topic和队列id，然后重新存到CommitLog文件，这样消费者就可以消费到消息了
- **rollback**：回滚消息，其实并没有实际的操作，因为消息本身就不在真正的Topic下，所以消费者压根就消费不到，什么都不做就可以了
- **unknown**：本地事务执行异常时就是这个状态，导致无法正常提交本地事务的执行状态。

所以**在正常情况下**，事务消息整个运行流程如下

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=Nzk1MzI0YzA4NzljYmYxYTc2OTFlMzNlYmQwOTliZjNfMzNEUUlUVzJMOW9rTUhGMDNxa2dVTWZreWtzbUVMQ2VfVG9rZW46QTBkSGJ1Sm1ZbzFLZWh4Q3J3Y2NraGRubktlXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

既然有正常情况下，那么就有非正常情况下，比如前面提到的抛异常导致unknown，又或者什么乱七八糟的原因，导致无法正常提交本地事务的执行状态。

那此时应该怎么办？

RocketMQ有自己的一套补偿机制，**内部会起动一个线程**，默认每隔**1分钟**去检查没有被commit或者rollback的事务消息，当发现这条消息超过**6s**没有提交事务状态，那么此时就会向生产者发送一个请求，让生产者去检查一下本地的事务执行的状态，就是执行下面这行代码。

```Java
TransactionListener#checkLocalTransaction
```

之后会将这个方法返回的事务状态提交给服务端，服务端就可以知道事务的执行状态了

事务消息检查次数不是无限的，默认最大为**15**次，一旦超过15次，那么就不会再被检查了，而是会直接把这个消息存到`TRANS_CHECK_MAX_TIME_TOPIC`中

可以从这个Topic读取那些无法正常提交事务的消息。

**总结**：

- RocketMQ事务消息的实现主要是先将消息存到`RMQ_SYS_TRANS_HALF_TOPIC`这个中间Topic，有些资料会把这个消息称为半消息（half消息），这是因为这个消息不能被消费
- 之后会执行本地的事务，提交本地事务的执行状态
- RocketMQ会根据事务的执行状态去判断commit或者是rollback消息，也就是是不是可以让消费者消费这条消息的意思
- 在一些异常情况下，生产者无法及时正确提交事务执行状态
- RocketMQ会向生产者发送消息，让生产者去检查本地的事务，之后再提交事务状态
- 当然，这个检查次数默认不超过15次，如果超过15次还未成功提交事务状态，RocketMQ就会直接把这个消息存到`TRANS_CHECK_MAX_TIME_TOPIC`中

### **请求-应答消息（Request-reply message）**

这个消息类型比较有意思，类似一种RPC的模式

生产者发送消息之后**可以阻塞等待**消费者消费这个消息的之后返回的结果

生产者通过过调用request方法发送消息，接收回复消息

```Java
public class Producer {
    public static void main(String[] args) throws Exception {
        //创建一个生产者，指定生产者组为 helloProducer
        DefaultMQProducer producer = new DefaultMQProducer("helloProducer");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        // 启动生产者
        producer.start();

        Message message = new Message("helloTopic", "zunhui的java日记".getBytes());
        
        //发送消息，拿到响应结果， 3000代表超时时间，3s内未拿到响应结果，就超时，会抛出RequestTimeoutException异常
        Message result = producer.request(message, 3000);
        System.out.println("接收到响应消息：" + result);

        // 关闭生产者
        producer.shutdown();
    }

}
```

而对于消费者来着，当消费完消息之后，也要作为生产者，将响应的消息发送出去

```Java
public class Consumer {
    public static void main(String[] args) throws InterruptedException, MQClientException {

        //创建一个生产者，指定生产者组为 helloProducer
        DefaultMQProducer producer = new DefaultMQProducer("helloProducer");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.152.128:9876");
        // 启动生产者
        producer.start();


        // 通过push模式消费消息，指定消费者组
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("helloConsumer");
        // 指定NameServer的地址
        consumer.setNamesrvAddr("192.168.152.128:9876");

        // 订阅这个topic下的所有的消息
        consumer.subscribe("helloTopic", "*");
        // 注册一个消费的监听器，当有消息的时候，会回调这个监听器来消费消息
        consumer.registerMessageListener(new MessageListenerConcurrently() {

            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs,
                                                            ConsumeConcurrentlyContext context) {
                for (MessageExt msg : msgs) {
                    System.out.printf("消费消息:%s", new String(msg.getBody()) + "\n");

                    try {
                        // 用RocketMQ自带的工具类创建响应消息
                        Message replyMessage = MessageUtil.createReplyMessage(msg, "这是响应消息内容".getBytes(StandardCharsets.UTF_8));
                        // 将响应消息发送出去，拿到发送结果
                        SendResult replyResult = producer.send(replyMessage, 3000);
                        System.out.println("响应消息的结果 = " + replyResult);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });

        // 启动消费者
        consumer.start();

        System.out.printf("Consumer Started.%n");
    }
}
```

这种请求-应答消息实现原理也比较简单，如下

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NThiMThlNzIyNTQ0NzlkODI4Mjk3MTQ2MDcyNDg5ZThfbTZyZzUxd2d4aXVGRTRZbGhaSEN3SWY3alI4S2h2cEVfVG9rZW46S0QxUGJFZkJFb285RFJ4NDY0bmNDcHJHbnBlXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

生产者和消费者，会跟RocketMQ服务端进行网络连接

所以他们都是通过这个连接来发送和拉取消息的

当服务端接收到回复消息之后，有个专门处理回复消息的类，ReplyMessageProcessor

这个类就会直接找到发送消息的生产者的连接，之后会通过这个连接将回复消息发送给生产者

### **重试消息**

重试消息并不是我们业务中主动发送的，而是指当消费者消费消息失败之后，会**间隔一段时间**之后再次消费这条消息

重试的机制在并发消费模式和顺序消费模式下实现的原理并不相同

#### **并发消费模式重试实现原理**

RocetMQ会为**每个消费者组**创建一个重试消息所在的Topic，名字格式为

> %RETRY% + 消费者组名称

举个例子，假设消费者组为**helloConsumer**，那么重试Topic的名称为：`%RETRY%helloConsumer`

当消息消费失败后，RocketMQ会把消息存到这个Topic底下

消费者在启动的时候会主动去订阅这个Topic，那么自然而然就能消费到消费失败的消息了

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MjViNmI4MWVjNTk1M2FlNDg0YTcxZmZlYTFhOWNiMGRfSnNyUEFwQkFDSWhuVHNyc2ZnNWdPRlMwT0hNSnFRRkFfVG9rZW46QXI1UGJHU0t5b055RHB4WEtUcGNIejJqbnptXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

**为什么要为每个消费者组创建一个重试Topic呢？**

其实我前面已经说过，每个消费者组的消费是隔离的，互不影响

所以，每个消费者组消费失败的消息可能就不一样，自然要放到不同的Topic下了

**重试消息是如何实现间隔一段时间来消费呢？**

说到间隔一段时间消费，你有没有觉得似曾相识？

不错，间隔一段时间消费说白了不就是延迟消费么！

所以，并发消费模式下**间隔一段时间**底层就是使用的延迟消息来实现的

RocetMQ会为重试消息设置一个延迟级别

并且延迟级别与重试次数的关系为

> delayLevel = 3 + 已经重试次数

比如第一次消费失败，那么已经重试次数就是0，那么此时延迟级别就是3

对应的默认的延迟时间就是10s，也就是一次消息重试消费间隔时间是10s

随着重试次数越多，延迟级别也越来越高，重试的间隔也就越来越长，但是最大也是最大延迟级别的时间

> 不过需要注意的是，在并发消费模式下，只有集群消费才支持消息重试，对于广播消费模式来说，是不支持消息重试的，消费失败就失败了，不会管

#### **顺序消费模式重试实现原理**

顺序消费模式下重试就比较简单了

当消费失败的时候，他并不会将消息发送到服务端，而是直接在本地等1s钟之后重试

在这个等待的期间其它消息是不能被消费的

这是因为保证消息消费的顺序性，即使前面的消息消费失败了，它也需要等待前面的消息处理完毕才能处理后面的消息

> 顺序消费模式下，并发消费和集群消费均支持重试消息

### **死信消息（Dead Letter Message）**

- 当消息重试消费仍然失败，超过最大重试次数后，消息会被发送到一个特殊的死信队列。
- 应用可以监控这个队列来处理无法正常消费的消息，例如进行告警或人工干预。

死信消息就是指如果消息最终无法被正常消费，那么这条消息就会成为死信消息

RocketMQ中，消息会变成死信消息有两种情况

第一种就是消息重试次数已经达到了最大重试次数

最大重试次数取决于并发消费还是顺序消费

- 顺序消费，默认最大重试次数就是 `Integer.MAX_VALUE`，基本上就是无限次重试，所以**默认情况下顺序消费的消息几乎不可能成为死信消息**
- 并发消费的话，那么最大重试次数默认就是**16**次

当然可以通过如下的方法来设置最大重试次数

> DefaultMQPushConsumer#setMaxReconsumeTimes

**当在并发消费模式下**，你可以在消息消费失败之后手动指定，直接让消息变成死信消息

在并发消费消息的模式下，处理消息的方法有这么一个参数

> ConsumeConcurrentlyContext#**delayLevelWhenNextConsume**

这个参数值有三种情况，注释也有写：

- 小于0，那么直接会把消息放到死信队列，成为死信消息。注释写的是=-1，其实只要小于0就可以成为死信消息，不一定非得是-1
- 0，**默认就是0**，这个代表消息重试消费，并且重试的时间间隔（也就是延迟级别）由服务端决定，也即是前面重试消息提到的 `delayLevel = 3 + 已经重试次数`
- 大于0，此时就表示客户端指定消息重试的时间间隔，是几就代表延迟级别为几，比如设置成1，那么延迟级别就为1

所以，在并发消费模式下，可以通过设置这个参数值为-1，直接让处理失败的消息成为死信消息

当消息成为死信消息之后，消息并不会丢失

RocketMQ会将死信消息保存在死信Topic底下，Topic格式为

> %DLQ% + 消费者组名称

跟重试Topic的格式有点像，只是将`%RETRY%`换成了`%DLQ%`

如果你想知道有哪些死信消息，只需要订阅这个Topic即可获得

#### 总结

所以总的来说，两种情况会让消息成为死信消息：

- 消息重试次数超过最大次数，跟消息的处理方式有关，默认情况下顺序处理最大次数是几乎是无限次，也就是几乎不可能成为死信消息；并发处理的情况下，最大重试次数默认就是16次。最大重试次数是可以设置的。
- 在并发处理的情况下，通过`ConsumeConcurrentlyContext`将`delayLevelWhenNextConsume`属性设置成-1，让消息直接变成死信消息

当消息成为死信消息的时候，会被存到`%DLQ% + 消费者组名称`这个Topic下

用户可以通过这个Topic获取到死信消息，手动干预处理这些消息。

### **同步消息**

同步消息是指，当生产者发送消息的时候，需要阻塞等待服务端响应消息存储的结果

同步消息跟前面提到的消息类型并不是互斥的

比如前面说的普通消息时举的例子，他就是同步发送的，那么它也是一个同步消息

这种模式用于对数据一致性要求较高的场景中，但是等待也会消耗一定的时间

### **异步消息**

既然有了同步消息，那么相对应的就有异步消息

异步消息就是指生产者发送消息后，不需要阻塞等待服务端存储消息的结果

所以异步消息的好处就是可以减少等待响应过程消耗的时间

如果你想知道有没有发送成功，可以在发送消息的时候传个回调的接口`SendCallback`的实现

```Java
// 消息内容为  今天是个好日子
Message msg = new Message("helloTopic", "今天是个好日子".getBytes(RemotingHelper.DEFAULT_CHARSET));
// 异步发送消息不需要等待得到消息的发送结果，后台开启线程监听回调
producer.send(msg, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                //发送成功的回调函数
                System.out.println(Thread.currentThread().getName()+",发送消息成功，结果为："+sendResult);
            }
            @Override
            public void onException(Throwable throwable) {
                //发送异常的回调函数
                System.out.println(Thread.currentThread().getName()+",发送消息失败，异常信息为："+throwable);
            }
});
```

### **单向消息**

所谓的单向消息就是指，生产者发送消息给服务端之后，就直接不管了，也称一次性消息

所以对于生产者来说，他是不会去care消息发送的结果了，即使发送失败了，对于生产者来说也是无所谓的

所以这种方式的主要应用于那种能够忍受丢消息的操作场景

比如像日志收集就比较适合使用这种方式

单向消息的发送是通过`sendOneway`来调用的

```Java
Message message = new Message("sanyouTopic", "zunhui的java日记".getBytes());

//发送单向消息 没有返回值也没有回调函数 发了就没了
producer.sendOneway(message);
```

> 总的来说，同步消息、异步消息、单向消息代表的是消息的发送方式，主要是针对消息的发送方来说，对消息的存储之类是的没有任何影响的

## **消息的幂等**

幂等性：多次操作的造成的结果是一致的。那么，如何保证幂等性呢？

**在请求方式中幂等性的体现**

- get：相同条件下，多次get的结果是一样的
- post：添加，非幂等，多次提交相同的数据
- put：修改，幂等，根据Id修改
- delete：根据Id删除，幂等

对于非幂等的请求，我们需要再业务操作中保证幂等性。

**在消息队列中的幂等性体现**

消息队列中，很可能一条消息被多个消费者收到，就需要做幂等性保证，不然消息将会被重复消费。主要可能有几种情况：

- **生产者重复发送**：由于网络抖动，导致生产者没有收到broker的ack而再次重发消息，实际上broker收到了多条重复的消息，造成重复消费。
- **消费者重复消费**：由于网络波动，消费者没有返回ack给broker，导致消息重试二次消费。
- **rebalance时的重复消费**：在消费者消费完消息，还没有返回ack时，宕机了，那就会触发重分配，这时这条消息可能会被重现分配的消费者再次消费。

**如何保证消息的幂等消费**

- 首先在消息消费到下级，比如数据库入库的时候，使用业务主键，保证相同的消息id只能插入一条。
- 但是也不是所有的消息都包含主键的，所以可以使用redis或zk的分布式锁（**主流方案**）

## **高可用**

### **概述**

RocketMQ的高可用性主要体现在其架构设计和数据处理机制上，以下是关于RocketMQ高可用性的一些关键点：

**架构设计**

- **主从复制**：RocketMQ支持主从复制，即一个Broker可以有多个Slave。当Master出现故障时，Slave可以接管服务，保证系统的高可用性。
- **集群部署**：RocketMQ支持集群部署，多个Broker可以组成一个集群，共同提供服务。集群中的Broker可以相互备份，当一个Broker出现故障时，其他Broker可以接管其任务，确保服务不中断。
- **分布式系统**：RocketMQ作为一个分布式消息中间件，能够解决分布式系统中的异步通信、解耦、削峰填谷等问题，自然具有高可用性的特点。

**数据冗余和备份机制**

- **CommitLog**：RocketMQ使用CommitLog来存储消息数据，每条消息都会先写入到CommitLog中，然后再写入到ConsumeQueue和IndexFile中。这种设计保证了数据的冗余和备份，即使部分数据丢失或损坏，也可以通过其他方式恢复。
- **消息消费进度**：RocketMQ会定期将消费者消费的进度保存到磁盘中，确保在意外情况下消费者能够重新消费消息，并且不会重复消费已经消费过的消息。

**主从复制策略**

- **同步复制**：Master和Slave均写成功，才返回客户端成功。这种方式可以保证数据不丢失，但可能会增加数据写入延迟，降低吞吐量。
- **异步复制**：Master写成功，返回客户端成功。这种方式拥有较低的延迟和较高的吞吐量，但当Master出现故障后，有可能造成数据丢失。

**故障恢复和容错**

- **文件恢复机制**：当CommitLog中的消息数据丢失或损坏时，RocketMQ可以通过从ConsumeQueue和IndexFile中重新构建数据来进行恢复。
- **手动切换**：虽然RocketMQ目前还不支持主从自动切换，但可以通过手动切换的方式来实现高可用性。当一个Broker的Master出现故障时，可以将其中一个Slave提升为新的Master。

**负载均衡**

- **Producer负载均衡**：Producer在发送消息时，默认轮询所有queue，确保消息能够均匀地分布到不同的Broker和queue上。
- **Consumer负载均衡**：Consumer的负载均衡策略可以确保多个Consumer能够并行处理消息，提高系统的吞吐量和响应速度。

### **Broker集群（核心）**

经过学习，一个RokcetMQ中可以有很多个Broker实例，相同的BrokerName称为一个组，同一个Broker组下每个Broker实例保存的消息是一样的，不同的Broker组保存的消息是不一样的。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=NjJiYjE1OTRhOTRlMTNhODcwNmMxMDUwYTk1OTY0ZDVfeGpSSVFZSnh3R0U1VjA0eUQ1dTNwRXdTcmpNNHczY0RfVG9rZW46TWFJTWJqcWVwb3FFVGl4R0t4ZGNOcmhjblJjXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

两个BrokerA实例组成了一个Broker组，两个BrokerB实例也组成了一个Broker组。

前面说过，每个Broker实例都有一个CommitLog文件来存储消息的。那么两个BrokerA实例他们CommitLog文件存储的消息是一样的，两个BrokerB实例他们CommitLog文件存储的消息也是一样的。

**那么BrokerA和BrokerB存的消息不一样是什么意思呢？**

- 就是生产者会从NameServer拿到路由表，比如现在有一个topicHello存在BrokerA和BrokerB上，那么topicHello在BrokerA和BrokerB默认都会有4个队列。
- 发消息的时候需要选择一个队列进行消息的发送，假设第一次选择了BrokerA上的队列发送消息，那么此时这条消息就存在BrokerA上，假设第二次选择了BrokerB上的队列发送消息，那么那么此时这条消息就存在BrokerB上，所以说BrokerA和BrokerB存的消息是不一样的。

**为什么同一个Broker组内的Broker存储的消息是一样的呢？**

- 就是为了保证Broker的高可用，这样就算Broker组中的某个Broker挂了，这个Broker组依然可以对外提供服务。

**那么如何实现同Broker组的Broker存的消息数据相同的呢？**

RocketMQ提供了两种Broker的高可用模式

- 主从同步模式
- Dledger模式

### **主从同步模式**

在主从同步模式下，在启动的时候需要在配置文件中指定BrokerId，在同一个Broker组中，BrokerId为0的是主节点（master），其余为从节点(slave)。

当生产者将消息写入到主节点是，主节点会将消息内容同步到从节点机器上，这样一旦主节点宕机，从节点机器依然可以提供服务。

主从同步主要同步两部分数据

- topic等数据
- 消息

topic等数据是从节点每隔**10s钟主动去主节点拉取**，然后更新本身缓存的数据。

**消息是主节点主动推送到从节点的**。当主节点收到消息之后，会将消息通过两者之间建立的网络连接(TCP连接)发送出去，从节点接收到消息之后，写到CommitLog即可。

主从同步原理

- 当消息到达主节点（Master）后，主节点会将消息写入磁盘，并将消息同步给从节点（Slave）。
- 从节点在接收到主节点的消息后，也会将消息写入磁盘，并发送确认消息给主节点。
- 主节点在接收到从节点的确认消息后，将消息标记为已同步。
- 如果主节点在一定时间内未收到从节点的确认消息，主节点会将消息重新发送给从节点，直到收到确认消息为止。

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmUwN2FhMTgyMDNjNTEyYjE4ZmUyNjk0NWNkYjI0MGJfcWJUV05EWGxpU0Y5eWhoeHo4MFk0MlRVTE5KMXR6Q1BfVG9rZW46UlRMVGJwcFp5b1UzbWV4T01qUWNXZEI0bktlXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

从节点有两种方式知道主节点所在服务器的地址

- 第一种就是在配置文件指定。
- 第二种就是从节点在注册到NameServer的时候会返回主节点的地址。

同步模式

- **阻塞模式**：主节点等待从节点完成同步后才返回应答给生产者。这种模式下，消息会确保在从节点上也成功写入，但可能会增加消息的延迟。
- **非阻塞模式**：主节点不需要等待从节点完成同步，立即返回应答给生产者。这种模式下，主节点写成功后即可认为消息成功，但从节点可能存在短暂的延迟或丢失数据的风险。

容错与恢复

- 如果主节点出现故障，从节点可以接管服务，继续为消费者提供服务。但需要注意的是，从节点在接管服务前需要确保已经同步了主节点的所有消息数据。
- 在某些情况下，可能需要手动切换主从节点或重新同步数据。这需要根据具体的业务场景和需求进行配置和操作。

主从同步模式有一个比较严重的问题就是**如果集群中的主节点挂了，需要手动重启或者重新指定主节点，而非集群自己从从节点中选择一个节点升级为主节点**。

为了解决上述的问题，所以RocketMQ在4.5.0引入了Dledger模式。

### **Dledger模式**

Dledger模式是RocketMQ中实现的一种基于多副本的高可用集群模式，它在Master-Slave模式的基础上增加了Raft协议，以确保在节点故障时仍然能够保证消息的高可靠性和高可用性。以下是Dledger模式的主要特点和优势：

**多副本机制**

- Dledger模式采用多副本模式，每个副本都有完整的数据，这样可以确保数据的可靠性和一致性。
- 在RocketMQ 4.5版本之前，RocketMQ主要使用Master/Slave模式，但在Dledger模式下，每个节点都存储完整的数据，从而进一步增强了数据的可靠性。

**Raft协议**

- Dledger模式基于Raft协议来实现自动故障转移和数据一致性。Raft协议是一个为管理复制日志的一致性算法，用于构建强一致性的分布式系统。
- Raft协议通过选举Leader的方式确保系统没有单点故障，并且在Leader节点出现故障时，系统可以自动选举新的Leader，保证系统的高可用性。

**自动故障转移**

- **在Dledger模式下，当Leader节点出现故障时，系统可以自动选举新的Leader，无需人工干预。这大大提高了系统的容错能力和可维护性。**
- 与传统的Master/Slave模式相比，Dledger模式在故障转移方面更加灵活和高效。

**数据一致性**

- Dledger模式通过Raft协议保证强一致性，避免了数据不一致的问题。即使在网络分区或节点故障的情况下，也能够确保数据的一致性。

**自动恢复**

- 当数据出现不一致时，Dledger模式可以自动进行数据恢复，确保数据的正确性。这减少了人工干预的需要，提高了系统的自动化水平。

**轻量级Java库**

- DLedger是一个基于Raft协议的轻量级Java库，它对外提供的API非常简单，包括append和get等操作。这使得开发者可以更容易地集成和使用Dledger模式来构建高性能、高可靠性的分布式系统。

# **RocketMQ最佳实践**

## **保证消息顺序消费**

**为什么要保证有序？**

比如在物联网项目中，IOT的设备在初始化的时候需要按照指定顺序接收消息：

- 设备名称
- 设备网络
- 重启设备保存配置

如果这个顺序颠倒了，那设备就没有办法保存设置信息，只要按照顺序才能更改设备信息。

**那如何保证顺序消息呢？**

这里有两个概念，全局有序和局部有序。

- 全局有序：消费的所有信息都严格按照发送消息的顺序进行消费。
- 局部有序：消费的部分消息按照发送消息的顺序进行消费

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=OTE5MThkYjMxZjIyZDI4MGZiNTc0ZGNkODBjMGZhZTJfSG1aSGtFRFFLV2NVMFdxOEJUZnY2aklmUk8ySnkydDhfVG9rZW46VVFPTGJhT1lEb2ZQSnR4R09ZOWNzUkNHbnNnXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

mq只能保证消息的局部顺序，在单一队列中是顺序的，符合先进先出的特性，但是在生产者发送和消费者消费都是不能保证消顺序的，所以我们需要给生产者发送和消费者消费都做一些规定。

- 在生产者发送消息是使用自定义队列选择器，将一条业务线上的消息，按照业务顺序发送到同一个队列中。
- 在消费者消费消息时，使用顺序消费模式，保证一个队列中的消费只能被一个线程进行处理。

这样就能够保证消息的顺序消费。

实践：

模拟将同一组顺序的消息放到相同的队列中：

```Java
public class IOTServiceConfig {
        //模拟一个设备配置类 包含id 配置名 配置内容
    private Long iotId;
    private String productName;
    private String productConfig;
    //get set省略
}
public class IOTConfigUtils {
        //使用一个集合 模拟多线程发送消息 
    //模拟了三条配置记录 每一条单独是按顺序的(添加名称-添加网络-保存并重启) 但是三条数据整体之间是乱序的
    public static List<IOTServiceConfig> getIOTServiceConfigList() {
        ArrayList<IOTServiceConfig> list = new ArrayList<>();

        // 配置数据
        IOTServiceConfig iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(10000L);
        iotServiceConfig.setProductName("设备1");
        iotServiceConfig.setProductConfig("添加设备名称");
        list.add(iotServiceConfig);

        // 配置数据
        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(100002L);
        iotServiceConfig.setProductName("设备2");
        iotServiceConfig.setProductConfig("添加设备名称");
        list.add(iotServiceConfig);

        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(10000L);
        iotServiceConfig.setProductName("网络1");
        iotServiceConfig.setProductConfig("添加设备网络");
        list.add(iotServiceConfig);

        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(100002L);
        iotServiceConfig.setProductName("网络2");
        iotServiceConfig.setProductConfig("添加设备网络");
        list.add(iotServiceConfig);

        // 配置数据
        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(10003L);
        iotServiceConfig.setProductName("设备3");
        iotServiceConfig.setProductConfig("添加设备名称");
        list.add(iotServiceConfig);

        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(10003L);
        iotServiceConfig.setProductName("网络3");
        iotServiceConfig.setProductConfig("添加设备网络");

        list.add(iotServiceConfig);
        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(100002L);
        iotServiceConfig.setProductName("保存配置后重启");
        iotServiceConfig.setProductConfig("reload");
        list.add(iotServiceConfig);

        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(10000L);
        iotServiceConfig.setProductName("保存配置后重启");
        iotServiceConfig.setProductConfig("reload");
        list.add(iotServiceConfig);

        iotServiceConfig = new IOTServiceConfig();
        iotServiceConfig.setIotId(10003L);
        iotServiceConfig.setProductName("保存配置后重启");
        iotServiceConfig.setProductConfig("reload");
        list.add(iotServiceConfig);

        return list;
    }
}
//测试方法模拟顺序发送消息
@Test
void contextLoads6() throws Exception{
        //顺序消息
        //设置队列选择器
        rocketMQTemplate.setMessageQueueSelector(new MessageQueueSelector() {
            @Override
            public MessageQueue select(List<MessageQueue> list, org.apache.rocketmq.common.message.Message message, Object o) {
                //自定义选择队列的规则 相同配置id的放入一个队列
                String iotIdStr = o.toString();
                Long iotId = Long.parseLong(iotIdStr);
                return list.get((int) (iotId % list.size()));
            }
        });
        for (IOTServiceConfig iotServiceConfig : IOTConfigUtils.getIOTServiceConfigList()) {
            Message message = MessageBuilder.withPayload(iotServiceConfig).build();
            //使用设备id作为一个判断条件
            rocketMQTemplate.sendOneWayOrderly("iot-topic",message,iotServiceConfig.getIotId().toString());
        }
        System.out.println("发送完成");
}
```

模拟消息顺序消费，将同一个队列中的数据，交给一个线程来消费

```Java
@Component //consumeMode配置顺序消费模式
@RocketMQMessageListener(topic = "iot-topic", consumerGroup = "iot-group",consumeMode = ConsumeMode.ORDERLY )
public class IotMessageListener implements RocketMQListener<MessageExt> {
    @Override
    public void onMessage(MessageExt messageExt) {
        System.out.println("接收到消息：" + new String(messageExt.getBody())+"  队列id："+messageExt.getQueueId()+"  线程信息："+Thread.currentThread().getName());
    }
}
```

启动程序，输出：

> 接收到消息：{"iotId":10000,"productName":"设备1","productConfig":"添加设备名称"} 队列id：0 线程信息：ConsumeMessageThread_1 接收到消息：{"iotId":10003,"productName":"设备3","productConfig":"添加设备名称"} 队列id：3 线程信息：ConsumeMessageThread_3 接收到消息：{"iotId":10003,"productName":"网络3","productConfig":"添加设备网络"} 队列id：3 线程信息：ConsumeMessageThread_3 接收到消息：{"iotId":10003,"productName":"保存配置后重启","productConfig":"reload"} 队列id：3 线程信息：ConsumeMessageThread_3 接收到消息：{"iotId":100002,"productName":"设备2","productConfig":"添加设备名称"} 队列id：2 线程信息：ConsumeMessageThread_2 接收到消息：{"iotId":10000,"productName":"网络1","productConfig":"添加设备网络"} 队列id：0 线程信息：ConsumeMessageThread_4 接收到消息：{"iotId":10000,"productName":"保存配置后重启","productConfig":"reload"} 队列id：0 线程信息：ConsumeMessageThread_4 接收到消息：{"iotId":100002,"productName":"网络2","productConfig":"添加设备网络"} 队列id：2 线程信息：ConsumeMessageThread_2 接收到消息：{"iotId":100002,"productName":"保存配置后重启","productConfig":"reload"} 队列id：2 线程信息：ConsumeMessageThread_2

可以看到同一组消息被放在同一个队列，且由同一个线程来进行消费的，这样就保证了消息的顺序消费，在全局是是无序的，但是在单组消息处理和发送的过程都是有序的。

## **积压消息的快速处理**

MQ消息积压指的是在消息队列（MQ）系统中，等待被处理的消息数量超过了正常的处理速度，导致消息在队列中积压堆积的情况。

### **消息积压的常见表现**

- **系统资源使用率上升**：消息积压可能导致系统资源使用率上升，如CPU利用率、内存占用、磁盘活动等。
- **消息丢失或过期**：如果消息队列没有足够的容量来处理新消息，可能会导致旧消息被丢弃或过期，从而导致数据丢失。
- **系统警报和异常**：一些监控系统会检测到消息积压问题，并发出警报或异常通知。
- **队列故障或堵塞**：在极端情况下，消息积压可能导致消息队列系统的故障或堵塞，导致无法正常工作。

### **消息积压的常见原因**

- **生产者速度快于消费者**：如果消息生产者（产生消息的系统或组件）的速度比消息消费者（处理消息的系统或组件）的速度快，就会导致消息积压。
- **消费者故障**：如果消息消费者遇到故障或处理速度变慢，未能及时处理消息，也会导致积压。
- **高峰负载**：系统在高峰时段接收到大量的消息，超过了正常处理速度。
- **消息处理失败**：如果某些消息由于错误或异常而无法被正常处理，它们可能会在队列中积压。

### **解决消息积压的方法**

- **增加消费端数量**：通过增加消费者的数量来提高消息的处理速度。
- **提高消费端的处理能力**：优化消费端的代码逻辑和处理过程，提高消费端的处理能力。
- **调整消息处理的优先级**：根据消息的重要性和紧急程度，调整消息处理的优先级。
- **扩容MQ服务器**：如果MQ服务器性能达到瓶颈，可以考虑增加MQ服务器的数量或升级硬件配置。
- **增加队列分区**：如果消息队列支持分区，可以将消息分散到多个队列中，避免单个队列出现积压。
- **设置合理的超时机制**：在消费者端设置合理的超时机制，避免因为处理时间过长而导致消息积压。
- **监控和报警**：实时监控MQ的消息积压情况，设置阈值并触发报警机制。
- **数据清理和重试机制**：定期清理过期或无效的消息，避免队列中存在大量无效的消息占用资源。同时，建立重试机制，对于处理失败或异常的消息进行重试。
- **性能优化和调优**：对MQ的性能进行优化和调优，包括调整MQ的参数配置、网络优化、硬件优化等。

### **实践**

**如何知道消息队列有消息积压的情况？**

可以使用控制台进行一个查看，在消费者的消费者组里有详细信息，通过点击消费者-->订阅组-->消费详情就可以看到broker中每个队列的消费情况

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWZiMmNjZWQ4ZTZiMDJmODZlNDNkMzBkNjFhOTgzMzlfZmtiaGtPVVNjZkptZkF3eFdzVER1WEhQNlN3Q0N4eklfVG9rZW46REJzSGJjMFlSb3VtT3h4WHYzb2NUMHpGbmhlXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

**如何解决这个消费积压？**

- 限制生产者的消息发生速率，减少积压。
- 对存在积压的消费者组，使用多线程消费，充分利用机器性能进行消费，提升有限。
- 通过业务设计，缩短业务消息处理的时间，提升业务层消费能力。使用缓存数据库，使用分布式等等，但是提升也是有限
- 增加消费者数量，创建一个消费者，让其加入积压的消费者组，来增加消费能力，均摊压力。但是一个队列中的数据只能被一个消费者消费，队列数量有限，所以增加消费者也是有限的。
- 增加消费者组，新的消费者组不做业务处理，订阅同样的主题，但是只做消息转发，将原来brocker中积压的消息转发到一个新的broker中去，新的broker可以通过增加队列的方式分摊这些消息，然后再用新的消费者组去消费这个新broker中的消息，队列上限提升了那么消费者的上限也就可以提升，那消费能力上升，就能处理积压消息了。

对于消息的积压情况，其实优先应该从设计角度去考虑，是否有必要处理每一条消息，设置消息优先级，优先消费有用的数据。在生产者方面，选择合适的发送方式，比如建立相应的topic和tag，就能增加broker的数量和队列数量，使得每个队列中的数据量不过多。消费者方面使用多线程处理，优化业务处理等，减少响应时间。需要更多的从业务角度去考虑，机器的性能终究是有限的。

## **保证消息的可靠性投递**

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=M2IzYTU4ODdkZjM0MWNhNjc4NmE0OGE0NWFkM2QzYThfSnR2bGxWMGpNSUUwNE5DOXVZVkNJb2FRM3dvZnE0NkRfVG9rZW46Smh5VWJIUTB3b01JSHp4MVFaMWNXektrbjliXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

所谓的可靠性投递，也就是保证消息一定能被消费者消费到，我们可以把这个过程拆分成三部分：

- 生产者将消息发送到服务器
- 消息队列保存消息
- 消费者从消息队列获取消息并消费

这三个环节，每个环节都保证消息传递成功，才能保证消息一定被投递，所以要从三个环境的角度去考虑。

- 生产者方面：可以使用同步发送或者选择事务消息，确保在消息投递到消息队列中的过程没有问题，消息队列这边收到了消息。
- 消息队列方面：使用主从复制或集群模式保证高可用，主从之间可以使用同步模式，当消息确认主从都有，然后选择刷盘策略，使用同步刷盘模式，一定等消息写入磁盘文件在给生产者响应，确保数据落盘。
- 消费者方面：使用先消费后提交的方式，确保业务执行完成后再向消息队列提交。如果出错可以使用消息队列的重试机制和死信队列的方式，进行重试消费，确保消息一定能够被消费。

# **SpringBoot集成RocketMQ**

在实际项目中肯定不会像上面测试那样用，都是集成SpringBoot的。

## **引入依赖**

```XML
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.1.1</version>
</dependency>
```

## **yml配置**

```YAML
rocketmq:
  name-server: 192.168.152.128:9876
  producer:
    group: producer-group
```

## **测试消息发送**

```Java
@SpringBootTest
class SpringbootMqApplicationTests {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;
    @Test
    void contextLoads() {
        Message message = MessageBuilder.withPayload("hello world").build();
        rocketMQTemplate.syncSend("boot-topic", message);
    }
}
```

运行成功后，查看数据：

![img](https://my.feishu.cn/space/api/box/stream/download/asynccode/?code=MTQ5MDU2OWUzZGI5OTFiNGI0ZDIyZDEwMGU2MWY3YTlfYXplNjZubHNLQmZiTGtSekJ6d1lOVEVhMEQ3Mm01MkJfVG9rZW46SGdydGJtb2lOb0M3VXB4UlhYR2NxOXZabkxrXzE3ODE3NDU0Mzg6MTc4MTc0OTAzOF9WNA&add_watermark=true&scene_type=CCM)

成功！！！

## **测试消息消费**

SpringBoot底下只需要实现`RocketMQListener`接口，然后加上`@RocketMQMessageListener`注解即可

@RocketMQMessageListener需要指定消费者属于哪个消费者组，消费哪个topic，NameServer的地址已经通过yml配置文件配置类

```Java
@Component
@RocketMQMessageListener(topic = "boot-topic", consumerGroup = "hello-group")
public class HelloMessageListener implements RocketMQListener<MessageExt> {
    @Override
    public void onMessage(MessageExt messageExt) {
        System.out.println("接收到消息：" + new String(messageExt.getBody()));
    }
}
```

==注：consumerGroup不能重复，重复会启动报错==