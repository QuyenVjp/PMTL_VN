What is OpenTelemetry?
A brief explanation of what OpenTelemetry is and isn’t.
OpenTelemetry is:

An observability framework and toolkit designed to facilitate the

Generation
Export
Collection
of telemetry data such as traces, metrics, and logs.

Open source, as well as vendor- and tool-agnostic, meaning that it can be used with a broad variety of observability backends, including open source tools like Jaeger and Prometheus, as well as commercial offerings. OpenTelemetry is not an observability backend itself.

A major goal of OpenTelemetry is to enable easy instrumentation of your applications and systems, regardless of the programming language, infrastructure, and runtime environments used.

The backend (storage) and the frontend (visualization) of telemetry data are intentionally left to other tools.


For more videos in this series and additional resources, see What next?

What is observability?
Observability is the ability to understand the internal state of a system by examining its outputs. In the context of software, this means being able to understand the internal state of a system by examining its telemetry data, which includes traces, metrics, and logs.

To make a system observable, it must be instrumented. That is, the code must emit traces, metrics, or logs. The instrumented data must then be sent to an observability backend.

Why OpenTelemetry?
With the rise of cloud computing, microservices architectures, and increasingly complex business requirements, the need for software and infrastructure observability is greater than ever.

OpenTelemetry satisfies the need for observability while following two key principles:

You own the data that you generate. There’s no vendor lock-in.
You only have to learn a single set of APIs and conventions.
Both principles combined grant teams and organizations the flexibility they need in today’s modern computing world.

If you want to learn more, take a look at OpenTelemetry’s mission, vision, and values.

Main OpenTelemetry components
OpenTelemetry consists of the following major components:

A specification for all components
A standard protocol that defines the shape of telemetry data
Semantic conventions that define a standard naming scheme for common telemetry data types
APIs that define how to generate telemetry data
Language SDKs that implement the specification, APIs, and export of telemetry data
A library ecosystem that implements instrumentation for common libraries and frameworks
Automatic instrumentation components that generate telemetry data without requiring code changes
The OpenTelemetry Collector, a proxy that receives, processes, and exports telemetry data
Various other tools, such as the OpenTelemetry Operator for Kubernetes, OpenTelemetry Helm Charts, and community assets for FaaS
OpenTelemetry is used by a wide variety of libraries, services and apps that have OpenTelemetry integrated to provide observability by default.

OpenTelemetry is supported by numerous vendors, many of whom provide commercial support for OpenTelemetry and contribute to the project directly.

Extensibility
OpenTelemetry is designed to be extensible. Some examples of how it can be extended include:

Adding a receiver to the OpenTelemetry Collector to support telemetry data from a custom source
Loading custom instrumentation libraries into an SDK
Creating a distribution of an SDK or the Collector tailored to a specific use case
Creating a new exporter for a custom backend that doesn’t yet support the OpenTelemetry protocol (OTLP)
Creating a custom propagator for a nonstandard context propagation format
Although most users might not need to extend OpenTelemetry, the project is designed to make it possible at nearly every level.

History
OpenTelemetry is a Cloud Native Computing Foundation (CNCF) project that is the result of a merger between two prior projects, OpenTracing and OpenCensus. Both of these projects were created to solve the same problem: the lack of a standard for how to instrument code and send telemetry data to an Observability backend. As neither project was fully able to solve the problem independently, they merged to form OpenTelemetry and combine their strengths while offering a single solution.

If you are currently using OpenTracing or OpenCensus, you can learn how to migrate to OpenTelemetry in the Migration guide.

What next?
Getting started — jump right in!
Learn about OpenTelemetry concepts.
Watch videos from the OTel for beginners or other playlists.
Sign up for training, including the free course Getting started with OpenTelemetry.
Feedback
Was this page helpful?

Observability primer
Core observability concepts.
What is Observability?
Observability lets you understand a system from the outside by letting you ask questions about that system without knowing its inner workings. Furthermore, it allows you to easily troubleshoot and handle novel problems, that is, “unknown unknowns”. It also helps you answer the question “Why is this happening?”

To ask those questions about your system, your application must be properly instrumented. That is, the application code must emit signals such as traces, metrics, and logs. An application is properly instrumented when developers don’t need to add more instrumentation to troubleshoot an issue, because they have all of the information they need.

OpenTelemetry is the mechanism by which application code is instrumented to help make a system observable.

Reliability and metrics
Telemetry refers to data emitted from a system and its behavior. The data can come in the form of traces, metrics, and logs.

Reliability answers the question: “Is the service doing what users expect it to be doing?” A system could be up 100% of the time, but if, when a user clicks “Add to Cart” to add a black pair of shoes to their shopping cart, the system doesn’t always add black shoes, then the system could be unreliable.

Metrics are aggregations over a period of time of numeric data about your infrastructure or application. Examples include: system error rate, CPU utilization, and request rate for a given service. For more on metrics and how they relate to OpenTelemetry, see Metrics.

SLI, or Service Level Indicator, represents a measurement of a service’s behavior. A good SLI measures your service from the perspective of your users. An example SLI can be the speed at which a web page loads.

SLO, or Service Level Objective, represents the means by which reliability is communicated to an organization/other teams. This is accomplished by attaching one or more SLIs to business value.

Understanding distributed tracing
Distributed tracing lets you observe requests as they propagate through complex, distributed systems. Distributed tracing improves the visibility of your application or system’s health and lets you debug behavior that is difficult to reproduce locally. It is essential for distributed systems, which commonly have nondeterministic problems or are too complicated to reproduce locally.

To understand distributed tracing, you need to understand the role of each of its components: logs, spans, and traces.

Logs
A log is a timestamped message emitted by services or other components. Unlike traces, they aren’t necessarily associated with any particular user request or transaction. You can find logs almost everywhere in software. Logs have been heavily relied on in the past by both developers and operators to help them understand system behavior.

Sample log:

I, [2021-02-23T13:26:23.505892 #22473]  INFO -- : [6459ffe1-ea53-4044-aaa3-bf902868f730] Started GET "/" for ::1 at 2021-02-23 13:26:23 -0800
Logs aren’t enough for tracking code execution, as they usually lack contextual information, such as where they were called from.

They become far more useful when they are included as part of a span, or when they are correlated with a trace and a span.

For more on logs and how they pertain to OpenTelemetry, see Logs.

Spans
A span represents a single unit of work or operation. Spans track specific operations that a request makes, painting a picture of what happened during the time in which that operation was executed.

A span contains name, time-related data, structured log messages, and other metadata (that is, Attributes) to provide information about the operation it tracks.

Span attributes
Span attributes are metadata attached to a span.

The following table contains examples of span attributes:

Key	Value
http.request.method	"GET"
network.protocol.version	"1.1"
url.path	"/webshop/articles/4"
url.query	"?s=1"
server.address	"example.com"
server.port	8080
url.scheme	"https"
http.route	"/webshop/articles/:article_id"
http.response.status_code	200
client.address	"192.0.2.4"
client.socket.address	"192.0.2.5" (the client goes through a proxy)
user_agent.original	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0"
For more on spans and how they relate to OpenTelemetry, see Spans.

Distributed traces
A distributed trace, more commonly known as a trace, records the path taken by a single request (made by an application or end user) as it propagates through multiple services in an architecture, such as microservice or serverless applications.

A trace is made of one or more spans. The first span represents the root span. Each root span represents a request from start to finish. The spans underneath the parent provide a more in-depth context of what occurs during a request (or what steps make up a request).

For example, when a user loads a web page, the initial HTTP request may pass through an API gateway, a backend service, and a database. Each of these steps is represented by a span, and together they form a single trace that shows the end-to-end journey of the request.

Without tracing, finding the root cause of performance problems in a distributed system can be challenging. Tracing makes debugging and understanding distributed systems less daunting by breaking down what happens within a request as it flows through a distributed system.

Many Observability backends visualize traces as waterfall diagrams that look like this:

Sample Trace
Waterfall diagrams show the parent-child relationship between a root span and its child spans. When a span encapsulates another span, this also represents a nested relationship.

For more on traces and how they pertain to OpenTelemetry, see Traces.

Feedback
Was this page helpful?


Context propagation
Learn about the concept that enables Distributed Tracing.
With context propagation, signals (traces, metrics, and logs) can be correlated with each other, regardless of where they are generated. Although not limited to tracing, context propagation allows traces to build causal information about a system across services that are arbitrarily distributed across process and network boundaries.

To understand context propagation, you need to understand two separate concepts: context and propagation.

Context
Context is an object that contains the information for the sending and receiving service, or execution unit, to correlate one signal with another.

When Service A calls Service B, Service A includes a trace ID and a span ID as part of the context. Service B uses these values to create a new span that belongs to the same trace, setting the span from Service A as its parent. This makes it possible to track the full flow of a request across service boundaries.

Propagation
Propagation is the mechanism that moves context between services and processes. It serializes or deserializes the context object and provides the relevant information to be propagated from one service to another.

Propagation is usually handled by instrumentation libraries and is transparent to the user. In the event that you need to manually propagate context, you can use the Propagators API.

OpenTelemetry maintains several official propagators. The default propagator uses the headers specified by the W3C TraceContext specification.

Example
A service called Frontend that provides different HTTP endpoints such as POST /cart/add and GET /checkout/ reaches out to a downstream service Product Catalog via an HTTP endpoint GET /product to receive details on products that a user wants to add to the cart or that are part of the checkout. To understand activities in the Product Catalog service within the context of requests coming from Frontend, the context (here: Trace ID and Span ID as “Parent ID”) is propagated using the traceparent header as it is defined in the W3C TraceContext specification. This means the IDs are embedded in the fields of the header:

<version>-<trace-id>-<parent-id>-<trace-flags>
For example:

00-a0892f3577b34da6a3ce929d0e0e4736-f03067aa0ba902b7-01
Traces
As mentioned, context propagation allows traces to build causal information across services. In this example, the two calls to the HTTP endpoint GET /product of service Product Catalog can be correlated with their upstream calls in service Frontend by extracting the remote context from the traceparent header and injecting it into the local context to set the Trace ID and Parent ID. With that, it is possible in a backend like Jaeger to see two requests as spans of one trace.

Context propagation example showing trace correlation across services
Logs
OpenTelemetry SDKs are able to automatically correlate logs with traces. This means they can inject context (Trace ID, Span ID) into a log record. This not only enables you to see logs in the context of the trace and span they belong to, but it also enables you to see logs that belong together across service or execution unit boundaries.

Metrics
In the case of metrics, context propagation enables you to aggregate measurements in that context. For example, instead of only looking at the response time of all the GET /product requests, you can also get metrics for combinations of POST /cart/add > GET /product and GET /checkout < GET /product.

Name	Calls Per Second	Average Response Time
* > GET /product	370	300ms
POST /card/add > GET /product	330	130ms
GET /checkout > GET /product	40	1703ms
Custom Context Propagation
For most use cases, you will find instrumentation libraries or native library instrumentation that handle the context propagation for you. In some cases no such support is available and you want to create that support for yourself. To do so you need to leverage the previously mentioned Propagators API:

On the side of the sender, the context is injected into the carrier, for example, into the headers of an HTTP request. In other cases, you need to find a place that can store metadata for your request.
On the receiving side, the context is extracted from the carrier. Again, in the case of HTTP, this is retrieved from the headers. In other cases, you pick the place you chose on the sending side to store the context.
Note that it is possible to propagate context in protocols that do not have a dedicated field for metadata, but you have to make sure that on the receiving side they are extracted and removed before the data is processed, otherwise you may create undefined behavior.

For the following languages a step-by-step tutorial exists for custom context propagation:

Erlang
JavaScript
PHP
Python
Security best practices
Propagation involves sending and receiving data across service boundaries, which can have security implications.

External services
When your service interacts with external services (services you do not own or trust), consider the following:

Incoming context: Be cautious when accepting context from external sources. Malicious actors could send forged trace headers to manipulate your tracing data or potentially exploit vulnerabilities in context parsing. You might want to ignore or sanitize incoming context from untrusted sources.
Outgoing context: Be mindful of what you propagate to external services. Internal trace IDs, span IDs, or baggage items might reveal sensitive information about your internal architecture or business logic. You may want to configure your propagators to not send context to external or public-facing endpoints.
Baggage
Baggage allows you to propagate arbitrary key-value pairs. Since this data is propagated across service boundaries, avoid putting sensitive information (like user credentials, API keys, or PII) in baggage, as it might be logged or sent to untrusted downstream services.

Support in Language SDKs
For the individual language-specific implementations of the OpenTelemetry API & SDK, you will find details on the support of context propagation in the respective documentation pages:

C++
.NET
Erlang
Go
Java
JavaScript
PHP
Python
Ruby
Rust
Swift
Help wanted
For languages .NET, Rust, and Swift, the language-specific documentation for context propagation is missing. If you know any of those languages and are interested to help, learn how you can contribute!

Specification
To learn more about context propagation, see the Context specification.

Feedback
Was this page helpful?

Signals
Learn about the categories of telemetry supported by OpenTelemetry
The purpose of OpenTelemetry is to collect, process, and export signals. Signals are system outputs that describe the underlying activity of the operating system and applications running on a platform. A signal can be something you want to measure at a specific point in time, like temperature or memory usage, or an event that goes through the components of your distributed system that you’d like to trace. You can group different signals together to observe the inner workings of the same piece of technology under different angles.

OpenTelemetry currently supports:

Traces
Metrics
Logs
Baggage
Also under development or at the proposal stage:

Events, a specific type of log
Profiles
Traces
The path of a request through your application.

Metrics
A measurement captured at runtime.

Logs
A recording of an event.

Baggage
Contextual information that is passed between signals.

Profiles
A recording of resource usage at the code level.

Traces
The path of a request through your application.
Traces give us the big picture of what happens when a request is made to an application. Whether your application is a monolith with a single database or a sophisticated mesh of services, traces are essential to understanding the full “path” a request takes in your application.

Let’s explore this with three units of work, represented as Spans:

Note
The following JSON examples do not represent a specific format, and especially not OTLP/JSON, which is more verbose.

hello span:

{
  "name": "hello",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "051581bf3cb55c13"
  },
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {
    "http.route": "some_route1"
  },
  "events": [
    {
      "name": "Guten Tag!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
This is the root span, denoting the beginning and end of the entire operation. Note that it has a trace_id field indicating the trace, but has no parent_id. That’s how you know it’s the root span.

hello-greetings span:

{
  "name": "hello-greetings",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "5fb397be34d26b51"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {
    "http.route": "some_route2"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    },
    {
      "name": "bye now!",
      "timestamp": "2022-04-29T18:52:58.114585Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
This span encapsulates specific tasks, like saying greetings, and its parent is the hello span. Note that it shares the same trace_id as the root span, indicating it’s a part of the same trace. Additionally, it has a parent_id that matches the span_id of the hello span.

hello-salutations span:

{
  "name": "hello-salutations",
  "context": {
    "trace_id": "5b8aa5a2d2c872e8321cf37308d69df2",
    "span_id": "93564f51e1abe1c2"
  },
  "parent_id": "051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {
    "http.route": "some_route3"
  },
  "events": [
    {
      "name": "hey there!",
      "timestamp": "2022-04-29T18:52:58.114561Z",
      "attributes": {
        "event_attributes": 1
      }
    }
  ]
}
This span represents the third operation in this trace and, like the previous one, it’s a child of the hello span. That also makes it a sibling of the hello-greetings span.

These three blocks of JSON all share the same trace_id, and the parent_id field represents a hierarchy. That makes it a Trace!

Another thing you’ll note is that each Span looks like a structured log. That’s because it kind of is! One way to think of Traces is that they’re a collection of structured logs with context, correlation, hierarchy, and more baked in. However, these “structured logs” can come from different processes, services, VMs, data centers, and so on. This is what allows tracing to represent an end-to-end view of any system.

To understand how tracing in OpenTelemetry works, let’s look at a list of components that will play a part in instrumenting our code.

Tracer Provider
A Tracer Provider (sometimes called TracerProvider) is a factory for Tracers. In most applications, a Tracer Provider is initialized once and its lifecycle matches the application’s lifecycle. Tracer Provider initialization also includes Resource and Exporter initialization. It is typically the first step in tracing with OpenTelemetry. In some language SDKs, a global Tracer Provider is already initialized for you.

Tracer
A Tracer creates spans containing more information about what is happening for a given operation, such as a request in a service. Tracers are created from Tracer Providers.

Trace Exporters
Trace Exporters send traces to a consumer. This consumer can be standard output for debugging and development-time, the OpenTelemetry Collector, or any open source or vendor backend of your choice.

Context Propagation
Context Propagation is the core concept that enables Distributed Tracing. With Context Propagation, Spans can be correlated with each other and assembled into a trace, regardless of where Spans are generated. To learn more about this topic, see the concept page on Context Propagation.

Spans
A span represents a unit of work or operation. Spans are the building blocks of Traces. In OpenTelemetry, they include the following information:

Name
Parent span ID (empty for root spans)
Start and End Timestamps
Span Context
Attributes
Span Events
Span Links
Span Status
Sample span:

{
  "name": "/v1/sys/health",
  "context": {
    "trace_id": "7bba9f33312b3dbb8b2c2c62bb7abe2d",
    "span_id": "086e83747d0e381e"
  },
  "parent_id": "",
  "start_time": "2021-10-22 16:04:01.209458162 +0000 UTC",
  "end_time": "2021-10-22 16:04:01.209514132 +0000 UTC",
  "status_code": "STATUS_CODE_OK",
  "status_message": "",
  "attributes": {
    "net.transport": "IP.TCP",
    "net.peer.ip": "172.17.0.1",
    "net.peer.port": "51820",
    "net.host.ip": "10.177.2.152",
    "net.host.port": "26040",
    "http.method": "GET",
    "http.target": "/v1/sys/health",
    "http.server_name": "mortar-gateway",
    "http.route": "/v1/sys/health",
    "http.user_agent": "Consul Health Check",
    "http.scheme": "http",
    "http.host": "10.177.2.152:26040",
    "http.flavor": "1.1"
  },
  "events": [
    {
      "name": "",
      "message": "OK",
      "timestamp": "2021-10-22 16:04:01.209512872 +0000 UTC"
    }
  ]
}
Spans can be nested, as is implied by the presence of a parent span ID: child spans represent sub-operations. This allows spans to more accurately capture the work done in an application.

Span Context
Span context is an immutable object on every span that contains the following:

The Trace ID representing the trace that the span is a part of
The span’s Span ID
Trace Flags, a binary encoding containing information about the trace
Trace State, a list of key-value pairs that can carry vendor-specific trace information
Span context is the part of a span that is serialized and propagated alongside Distributed Context and Baggage.

Because Span Context contains the Trace ID, it is used when creating Span Links.

Attributes
Attributes are key-value pairs that contain metadata that you can use to annotate a Span to carry information about the operation it is tracking.

For example, if a span tracks an operation that adds an item to a user’s shopping cart in an eCommerce system, you can capture the user’s ID, the ID of the item to add to the cart, and the cart ID.

You can add attributes to spans during or after span creation. Prefer adding attributes at span creation to make the attributes available to SDK sampling. If you have to add a value after span creation, update the span with the value.

Attributes have the following rules that each language SDK implements:

Keys must be non-null string values
Values must be a non-null string, boolean, floating point value, integer, or an array of these values
Additionally, there are Semantic Attributes, which are known naming conventions for metadata that is typically present in common operations. It’s helpful to use semantic attribute naming wherever possible so that common kinds of metadata are standardized across systems.

Span Events
A Span Event can be thought of as a structured log message (or annotation) on a Span, typically used to denote a meaningful, singular point in time during the Span’s duration.

For example, consider two scenarios in a web browser:

Tracking a page load
Denoting when a page becomes interactive
A Span is best used to track the first scenario because it’s an operation with a start and an end.

A Span Event is best used to track the second scenario because it represents a meaningful, singular point in time.

When to use span events versus span attributes
Since span events also contain attributes, the question of when to use events instead of attributes might not always have an obvious answer. To inform your decision, consider whether a specific timestamp is meaningful.

For example, when you’re tracking an operation with a span and the operation completes, you might want to add data from the operation to your telemetry.

If the timestamp in which the operation completes is meaningful or relevant, attach the data to a span event.
If the timestamp isn’t meaningful, attach the data as span attributes.
Span Links
Links exist so that you can associate one span with one or more spans, implying a causal relationship. For example, let’s say we have a distributed system where some operations are tracked by a trace.

In response to some of these operations, an additional operation is queued to be executed, but its execution is asynchronous. We can track this subsequent operation with a trace as well.

We would like to associate the trace for the subsequent operations with the first trace, but we cannot predict when the subsequent operations will start. We need to associate these two traces, so we will use a span link.

You can link the last span from the first trace to the first span in the second trace. Now, they are causally associated with one another.

Links are optional but serve as a good way to associate trace spans with one another.

For more information see Span Links.

Span Status
Each span has a status. The three possible values are:

Unset
Error
Ok
The default value is Unset. A span status that is Unset means that the operation it tracked successfully completed without an error.

When a span status is Error, then that means some error occurred in the operation it tracks. For example, this could be due to an HTTP 500 error on a server handling a request.

When a span status is Ok, then that means the span was explicitly marked as error-free by the developer of an application. Although this is unintuitive, it’s not required to set a span status as Ok when a span is known to have completed without error, as this is covered by Unset. What Ok does is represent an unambiguous “final call” on the status of a span that has been explicitly set by a user. This is helpful in any situation where a developer wishes for there to be no other interpretation of a span other than “successful”.

To reiterate: Unset represents a span that completed without an error. Ok represents when a developer explicitly marks a span as successful. In most cases, it is not necessary to explicitly mark a span as Ok.

Span Kind
When a span is created, it is one of Client, Server, Internal, Producer, or Consumer. This span kind provides a hint to the tracing backend as to how the trace should be assembled. According to the OpenTelemetry specification, the parent of a server span is often a remote client span, and the child of a client span is usually a server span. Similarly, the parent of a consumer span is always a producer and the child of a producer span is always a consumer. If not provided, the span kind is assumed to be internal.

For more information regarding SpanKind, see SpanKind.

Client
A client span represents a synchronous outgoing remote call such as an outgoing HTTP request or database call. Note that in this context, “synchronous” does not refer to async/await, but to the fact that it is not queued for later processing.

Server
A server span represents a synchronous incoming remote call such as an incoming HTTP request or remote procedure call.

Internal
Internal spans represent operations which do not cross a process boundary. Things like instrumenting a function call or an Express middleware may use internal spans.

Producer
Producer spans represent the creation of a job which may be asynchronously processed later. It may be a remote job such as one inserted into a job queue or a local job handled by an event listener.

Consumer
Consumer spans represent the processing of a job created by a producer and may start long after the producer span has already ended.

Metrics
A measurement captured at runtime.
A metric is a measurement of a service captured at runtime. The moment of capturing a measurement is known as a metric event, which consists not only of the measurement itself, but also the time at which it was captured and associated metadata.

Application and request metrics are important indicators of availability and performance. Custom metrics can provide insights into how availability indicators impact user experience or the business. Collected data can be used to alert of an outage or trigger scheduling decisions to scale up a deployment automatically upon high demand.

To understand how metrics in OpenTelemetry works, let’s look at a list of components that will play a part in instrumenting our code.

Meter Provider
A Meter Provider (sometimes called MeterProvider) is a factory for Meters. In most applications, a Meter Provider is initialized once and its lifecycle matches the application’s lifecycle. Meter Provider initialization also includes Resource and Exporter initialization. It is typically the first step in metering with OpenTelemetry. In some language SDKs, a global Meter Provider is already initialized for you.

Meter
A Meter creates metric instruments, capturing measurements about a service at runtime. Meters are created from Meter Providers.

Metric Exporter
Metric Exporters send metric data to a consumer. This consumer can be standard output for debugging during development, the OpenTelemetry Collector, or any open source or vendor backend of your choice.

Metric Instruments
In OpenTelemetry measurements are captured by metric instruments. A metric instrument is defined by:

Name
Kind
Unit (optional)
Description (optional)
The name, unit, and description are chosen by the developer or defined via semantic conventions for common ones like request and process metrics.

The instrument kind is one of the following:

Counter: A value that accumulates over time – you can think of this like an odometer on a car; it only ever goes up.
Asynchronous Counter: Same as the Counter, but is collected once for each export. Could be used if you don’t have access to the continuous increments, but only to the aggregated value.
UpDownCounter: A value that accumulates over time, but can also go down again. An example could be a queue length, it will increase and decrease with the number of work items in the queue.
Asynchronous UpDownCounter: Same as the UpDownCounter, but is collected once for each export. Could be used if you don’t have access to the continuous changes, but only to the aggregated value (e.g., current queue size).
Gauge: Measures a current value at the time it is read. An example would be the fuel gauge in a vehicle. Gauges are synchronous.
Asynchronous Gauge: Same as the Gauge, but is collected once for each export. Could be used if you don’t have access to the continuous changes, but only to the aggregated value.
Histogram: A client-side aggregation of values, such as request latencies. A histogram is a good choice if you are interested in value statistics. For example: How many requests take fewer than 1s?
For more on synchronous and asynchronous instruments, and which kind is best suited for your use case, see Supplementary Guidelines.

Aggregation
In addition to the metric instruments, the concept of aggregations is an important one to understand. An aggregation is a technique whereby a large number of measurements are combined into either exact or estimated statistics about metric events that took place during a time window. The OTLP protocol transports such aggregated metrics. The OpenTelemetry API provides a default aggregation for each instrument which can be overridden using the Views. The OpenTelemetry project aims to provide default aggregations that are supported by visualizers and telemetry backends.

Unlike request tracing, which is intended to capture request lifecycles and provide context to the individual pieces of a request, metrics are intended to provide statistical information in aggregate. Some examples of use cases for metrics include:

Reporting the total number of bytes read by a service, per protocol type.
Reporting the total number of bytes read and the bytes per request.
Reporting the duration of a system call.
Reporting request sizes in order to determine a trend.
Reporting CPU or memory usage of a process.
Reporting average balance values from an account.
Reporting current active requests being handled.
Views
A view provides SDK users with the flexibility to customize the metrics output by the SDK. You can customize which metric instruments are to be processed or ignored. You can also customize aggregation and what attributes you want to report on metrics.

Language Support
Metrics are a stable signal in the OpenTelemetry specification. For the individual language specific implementations of the Metrics API & SDK, the status is as follows:

Language	Metrics
C++	Stable
C#/.NET	Stable
Erlang/Elixir	Development
Go	Stable
Java	Stable
JavaScript	Stable
PHP	Stable
Python	Stable
Ruby	Development
Rust	Beta
Swift	Development
Specification
To learn more about metrics in OpenTelemetry, see the metrics specification.

Feedback
Was this page helpful?

Logs
A recording of an event.
A log is a timestamped text record, either structured (recommended) or unstructured, with optional metadata. Of all telemetry signals, logs have the biggest legacy. Most programming languages have built-in logging capabilities or well-known, widely used logging libraries.

OpenTelemetry logs
OpenTelemetry provides a Logs API and SDK for producing log records, and language SDKs and logging bridges to integrate with existing logging frameworks. Logs are anything you send through a Logging Provider, and events are a special type of logs. Not all logs are events, but all events are logs. The Logs API is public and can be used directly by application code or indirectly via existing logging libraries and bridges.

OpenTelemetry is designed to work with the logs you already produce, offering tools to correlate logs with other signals, add contextual attributes, and normalize different sources into a common representation for processing and export.

OpenTelemetry logs in the OpenTelemetry Collector
The OpenTelemetry Collector provides several tools to work with logs:

Several receivers which parse logs from specific, known sources of log data.
The filelogreceiver, which reads logs from any file and provides features to parse them from different formats or use a regular expression.
Processors like the transformprocessor which lets you parse nested data, flatten nested structures, add/remove/update values, and more.
Exporters that let you emit log data in a non-OpenTelemetry format.
The first step in adopting OpenTelemetry frequently involves deploying a Collector as a general-purposes logging agent.

OpenTelemetry logs for applications
In applications, OpenTelemetry logs are created with any logging library or built-in logging capabilities. When you add autoinstrumentation or activate an SDK, OpenTelemetry will automatically correlate your existing logs with any active trace and span, wrapping the log body with their IDs. In other words, OpenTelemetry automatically correlates your logs and traces.

Language support
Logs are a stable signal in the OpenTelemetry specification. For the individual language specific implementations of the Logs API & SDK, the status is as follows:

Language	Logs
C++	Stable
C#/.NET	Stable
Erlang/Elixir	Development
Go	Beta
Java	Stable
JavaScript	Development
PHP	Stable
Python	Development
Ruby	Development
Rust	Beta
Swift	Development
Structured, unstructured, and semistructured logs
OpenTelemetry accepts any log format, but not all formats are equally useful for analysis. The following section explains the differences between structured, semistructured, and unstructured logs. Important: a log encoded as JSON is not automatically “structured” in the sense of having a stable schema —it may be semistructured. Structured logs imply a consistent schema or well-defined typed fields that downstream processing can reliably depend on.

Structured logs
A structured log is a log with a defined, consistent schema or typed fields that downstream systems can reliably parse and interpret. The textual encoding can be JSON, protobuf, or another format, but what makes a log structured is the presence of a stable schema (field names, types, and semantics), not merely that it is valid JSON. For example, a structured JSON log might look like:

{
  "timestamp": "2024-08-04T12:34:56.789Z",
  "level": "INFO",
  "service": "user-authentication",
  "environment": "production",
  "message": "User login successful",
  "context": {
    "userId": "12345",
    "username": "johndoe",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
  },
  "transactionId": "abcd-efgh-ijkl-mnop",
  "duration": 200,
  "request": {
    "method": "POST",
    "url": "/api/v1/login",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    "body": {
      "username": "johndoe",
      "password": "******"
    }
  },
  "response": {
    "statusCode": 200,
    "body": {
      "success": true,
      "token": "jwt-token-here"
    }
  }
}
and for infrastructure components, Common Log Format (CLF) is commonly used:

127.0.0.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234
It is also common to encounter hybrid or extended formats (for example, CLF fields combined with a trailing JSON blob).

192.168.1.1 - johndoe [04/Aug/2024:12:34:56 -0400] "POST /api/v1/login HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36" {"transactionId": "abcd-efgh-ijkl-mnop", "responseTime": 150, "requestBody": {"username": "johndoe"}, "responseHeaders": {"Content-Type": "application/json"}}
In those cases, parse or extract the parts you need into a normalized record so downstream tooling can analyze them consistently. The filelogreceiver in the OpenTelemetry Collector provides helpers to parse mixed formats.

Structured logs are preferred in production because their stable schema makes them straightforward to validate, parse, correlate with traces and metrics, and analyze at scale.

Unstructured logs
Unstructured logs are logs that don’t follow a consistent structure. They may be more human-readable, and are often used in development. However, it is not preferred to use unstructured logs for production observability purposes, since they are much more difficult to parse and analyze at scale.

Examples of unstructured logs:

[ERROR] 2024-08-04 12:45:23 - Failed to connect to database. Exception: java.sql.SQLException: Timeout expired. Attempted reconnect 3 times. Server: db.example.com, Port: 5432

System reboot initiated at 2024-08-04 03:00:00 by user: admin. Reason: Scheduled maintenance. Services stopped: web-server, database, cache. Estimated downtime: 15 minutes.

DEBUG - 2024-08-04 09:30:15 - User johndoe performed action: file_upload. Filename: report_Q3_2024.pdf, Size: 2.3 MB, Duration: 5.2 seconds. Result: Success
It is possible to store and analyze Unstructured logs in production, although you may need to do substantial work to parse or otherwise pre-process them to be machine-readable. For example, the above three logs will require a regular expression to parse their timestamps and custom parsers to consistently extract the bodies of the log message. This will typically be necessary for a logging backend to know how to sort and organize the logs by timestamp. Although it’s possible to parse unstructured logs for analysis purposes, doing this may be more work than switching to structured logging, such as via a standard logging framework in your applications.

Semistructured logs
Semistructured logs include machine-readable key/value pairs or delimited fields but do not guarantee a stable schema across emitters. Examples include key=value logging (shown below) or JSON blobs where field names and types vary between messages. Semistructured logs are often easier to parse than unstructured logs but may still require processing and normalization before analysis.

Example of a semistructured log:

2024-08-04T12:45:23Z level=ERROR service=user-authentication userId=12345 action=login message="Failed login attempt" error="Invalid password" ipAddress=192.168.1.1 userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
Semistructured logs may require mapping and type coercion during ingestion to be fully useful for downstream analysis.

OpenTelemetry logging components
The following lists of concepts and components power OpenTelemetry’s logging support.

Log Appender / Bridge
As an application developer, the Logs Bridge API should not be called by you directly, as it is provided for logging library authors to build log appenders / bridges. Instead, you just use your preferred logging library and configure it to use a log appender (or log bridge) that is able to emit logs into an OpenTelemetry LogRecordExporter.

OpenTelemetry language SDKs offer this functionality.

Logger Provider
Part of the Logs Bridge API and should only be used if you are the author of a logging library.

A Logger Provider (sometimes called LoggerProvider) is a factory for Loggers. In most cases, the Logger Provider is initialized once and its lifecycle matches the application’s lifecycle. Logger Provider initialization also includes Resource and Exporter initialization.

Logger
Part of the Logs Bridge API and should only be used if you are the author of a logging library.

A Logger creates log records. Loggers are created from Log Providers.

Log Record Exporter
Log Record Exporters send log records to a consumer. This consumer can be standard output for debugging and development-time, the OpenTelemetry Collector, or any open source or vendor backend of your choice.

Log Record
A log record represents the recording of an event. In OpenTelemetry a log record contains two kinds of fields:

Named top-level fields of specific type and meaning
Resource and attributes fields of arbitrary value and type
The top-level fields are:

Field Name	Description
Timestamp	Time when the event occurred.
ObservedTimestamp	Time when the event was observed.
TraceId	Request trace ID.
SpanId	Request span ID.
TraceFlags	W3C trace flag.
SeverityText	The severity text (also known as log level).
SeverityNumber	Numerical value of the severity.
Body	The body of the log record.
Resource	Describes the source of the log.
InstrumentationScope	Describes the scope that emitted the log.
Attributes	Additional information about the event.
For more details on log records and log fields, see Logs Data Model.

Specification
To learn more about logs in OpenTelemetry, see the logs specification.

Feedback
Was this page helpful?

Resources
Introduction
A resource represents the entity producing telemetry as resource attributes. For example, a process producing telemetry that is running in a container on Kubernetes has a process name, a pod name, a namespace, and possibly a deployment name. All four of these attributes can be included in the resource.

In your observability backend, you can use resource information to better investigate interesting behavior. For example, if your trace or metrics data indicate latency in your system, you can narrow it down to a specific container, pod, or Kubernetes deployment.

If you use Jaeger as your observability backend, resource attributes are grouped under the Process tab:

A screenshot from Jaeger showing an example output of resource attributes associated to a trace
A resource is added to the TracerProvider or MetricProvider when they are created during initialization. This association cannot be changed later. After a resource is added, all spans and metrics produced from a Tracer or Meter from the provider will have the resource associated with them.

Semantic Attributes with SDK-provided Default Value
There are attributes provided by the OpenTelemetry SDK. One of them is the service.name, which represents the logical name of the service. By default, SDKs will assign the value unknown_service for this value, so it is recommended to set it explicitly, either in code or via setting the environment variable OTEL_SERVICE_NAME.

Additionally, the SDK will also provide the following resource attributes to identify itself: telemetry.sdk.name, telemetry.sdk.language and telemetry.sdk.version.

Resource Detectors
Most language-specific SDKs provide a set of resource detectors that can be used to automatically detect resource information from the environment. Common resource detectors include:

Operating System
Host
Process and Process Runtime
Container
Kubernetes
Cloud-Provider-Specific Attributes
and more
Custom resources
You can also provide your own resource attributes. You can either provide them in code or via populating the environment variable OTEL_RESOURCE_ATTRIBUTES. If applicable, use the semantic conventions for your resource attributes. For example, you can provide the name of your deployment environment using deployment.environment.name:

env OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=production yourApp

Sampling
Learn about sampling and the different sampling options available in OpenTelemetry.
With traces, you can observe requests as they move from one service to another in a distributed system. Tracing is highly practical for both high-level and in-depth analysis of systems.

However, if the large majority of your requests are successful and finish with acceptable latency and no errors, you do not need 100% of your traces to meaningfully observe your applications and systems. You just need the right sampling.

Illustration shows that not all data needs to be traced, and that a sample of data is sufficient.
Terminology
It’s important to use consistent terminology when discussing sampling. A trace or span is considered “sampled” or “not sampled”:

Sampled: A trace or span is processed and exported. Because it is chosen by the sampler as a representative of the population, it is considered “sampled”.
Not sampled: A trace or span is not processed or exported. Because it is not chosen by the sampler, it is considered “not sampled”.
Sometimes, the definitions of these terms get mixed up. You might find someone states that they are “sampling out data” or that data not processed or exported is considered “sampled”. These are incorrect statements.

Why sampling?
Sampling is one of the most effective ways to reduce the costs of observability without losing visibility. Although there are other ways to lower costs, such as filtering or aggregating data, these other methods do not adhere to the concept of representativeness, which is crucial when performing in-depth analysis of application or system behavior.

Representativeness is the principle that a smaller group can accurately represent a larger group. Additionally, representativeness can be mathematically verified, meaning that you can have high confidence that a smaller sample of data accurately represents the larger group.

Additionally, the more data you generate, the less data you actually need to have a representative sample. For high-volume systems, it is quite common for a sampling rate of 1% or lower to very accurately represent the other 99% of data.

When to sample
Consider sampling if you meet any of the following criteria:

You generate 1000 or more traces per second.
Most of your trace data represents healthy traffic with little variation in data.
You have some common criteria, like errors or high latency, that usually means something is wrong.
You have domain-specific criteria you can use to determine relevant data beyond errors and latency.
You can describe some common rules that determine if data should be sampled or dropped.
You have a way to tell your services apart, so that high- and low-volume services are sampled differently.
You have the ability to route unsampled data (for “just in case” scenarios) to low-cost storage systems.
Finally, consider your overall budget. If you have limited budget for observability, but can afford to spend time to effectively sample, then sampling can generally be worth it.

When not to sample
Sampling might not be appropriate for you. You might want to avoid sampling if you meet any of the following criteria:

You generate very little data (tens of small traces per second or lower).
You only use observability data in aggregate, and can thus pre-aggregate data.
You are bound by circumstances such as regulation that prohibit dropping data (and cannot route unsampled data to low-cost storage).
Finally, consider the following three costs associated with sampling:

The direct cost of compute to effectively sample data, such as a tail sampling proxy.
The indirect engineering cost of maintaining effective sampling methodologies as more applications, systems, and data are involved.
The indirect opportunity cost of missing critical information with ineffective sampling techniques.
Sampling, while effective at reducing observability costs, might introduce other unexpected costs if not performed well. It could be cheaper to allocate more resources for observability instead, either with a vendor or compute when self-hosting, depending on your observability backend, the nature of your data, and your attempts to sample effectively.

Head Sampling
Head sampling is a sampling technique used to make a sampling decision as early as possible. A decision to sample or drop a span or trace is not made by inspecting the trace as a whole.

For example, the most common form of head sampling is Consistent Probability Sampling. This is also referred to as Deterministic Sampling. In this case, a sampling decision is made based on the trace ID and the desired percentage of traces to sample. This ensures that whole traces are sampled - no missing spans - at a consistent rate, such as 5% of all traces.

The upsides to head sampling are:

Easy to understand
Easy to configure
Efficient
Can be done at any point in the trace collection pipeline
The primary downside to head sampling is that it is not possible to make a sampling decision based on data in the entire trace. For example, you cannot ensure that all traces with an error within them are sampled with head sampling alone. For this situation and many others, you need tail sampling.

Tail Sampling
Tail sampling is where the decision to sample a trace takes place by considering all or most of the spans within the trace. Tail Sampling gives you the option to sample your traces based on specific criteria derived from different parts of a trace, which isn’t an option with Head Sampling.

Illustration shows how spans originate from a root span. After the spans are complete, the tail sampling processor makes a sampling decision.
Some examples of how you can use Tail Sampling include:

Always sampling traces that contain an error
Sampling traces based on overall latency
Sampling traces based on the presence or value of specific attributes on one or more spans in a trace; for example, sampling more traces originating from a newly deployed service
Applying different sampling rates to traces based on certain criteria, such as when traces only come from low-volume services versus traces with high-volume services.
As you can see, tail sampling allows for a much higher degree of sophistication in how you sample data. For larger systems that must sample telemetry, it is almost always necessary to use Tail Sampling to balance data volume with the usefulness of that data.

There are three primary downsides to tail sampling today:

Tail sampling can be difficult to implement. Depending on the kind of sampling techniques available to you, it is not always a “set and forget” kind of thing. As your systems change, so too will your sampling strategies. For a large and sophisticated distributed system, rules that implement sampling strategies can also be large and sophisticated.
Tail sampling can be difficult to operate. The component(s) that implement tail sampling must be stateful systems that can accept and store a large amount of data. Depending on traffic patterns, this can require dozens or even hundreds of compute nodes that all utilize resources differently. Furthermore, a tail sampler might need to “fall back” to less computationally intensive sampling techniques if it is unable to keep up with the volume of data it is receiving. Because of these factors, it is critical to monitor tail-sampling components to ensure that they have the resources they need to make the correct sampling decisions.
Tail samplers often end up as vendor-specific technology today. If you’re using a paid vendor for Observability, the most effective tail sampling options available to you might be limited to what the vendor offers.
Finally, for some systems, tail sampling might be used in conjunction with Head Sampling. For example, a set of services that produce an extremely high volume of trace data might first use head sampling to sample only a small percentage of traces, and then later in the telemetry pipeline use tail sampling to make more sophisticated sampling decisions before exporting to a backend. This is often done in the interest of protecting the telemetry pipeline from being overloaded.

Support
Collector
The OpenTelemetry Collector includes the following sampling processors:

Probabilistic Sampling Processor
Tail Sampling Processor
Language SDKs
For the individual language-specific implementations of the OpenTelemetry API & SDK, you will find support for sampling in the respective documentation pages:

Erlang/Elixir
Go
JavaScript
Ruby
Vendors
Many vendors offer comprehensive sampling solutions that incorporate head sampling, tail sampling, and other features that can support sophisticated sampling needs. These solutions may also be optimized specifically for the vendor’s backend. If you are sending telemetry to a vendor, consider using their sampling solutions.

Feedback
Was this page helpful?


Docs
Language APIs & SDKs
JavaScript
Sampling
Sampling
Reduce the amount of telemetry created
Sampling is a process that restricts the amount of traces that are generated by a system. The JavaScript SDK offers several head samplers.

Default behavior
By default, all spans are sampled, and thus, 100% of traces are sampled. If you do not need to manage data volume, don’t bother setting a sampler.

TraceIDRatioBasedSampler
When sampling, the most common head sampler to use is the TraceIdRatioBasedSampler. It deterministically samples a percentage of traces that you pass in as a parameter.

Environment Variables
You can configure the TraceIdRatioBasedSampler with environment variables:

export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
This tells the SDK to sample spans such that only 10% of traces get created.

Node.js
You can also configure the TraceIdRatioBasedSampler in code. Here’s an example for Node.js:

TypeScript
JavaScript
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Other SDK configuration parameters go here
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
Browser
You can also configure the TraceIdRatioBasedSampler in code. Here’s an example for browser apps:

TypeScript
JavaScript
import {
  WebTracerProvider,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-web';

const samplePercentage = 0.1;

const provider = new WebTracerProvider({
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});

Node.js
Get telemetry for your app in less than 5 minutes!
This page will show you how to get started with OpenTelemetry in Node.js.

You will learn how to instrument both traces and metrics and log them to the console.

Note
The logging library for OpenTelemetry for Node.js is still under development hence an example for it is not provided below. For status details, see Status and Releases.

Prerequisites
Ensure that you have the following installed locally:

Node.js
TypeScript, if you will be using TypeScript.
Example Application
The following example uses a basic Express application. If you are not using Express, that’s OK — you can use OpenTelemetry JavaScript with other web frameworks as well, such as Koa and Nest.JS. For a complete list of libraries for supported frameworks, see the registry.

For more elaborate examples, see examples.

Dependencies
To begin, set up an empty package.json in a new directory:

npm init -y
Next, install Express dependencies.

TypeScript
JavaScript
npm install express @types/express
npm install -D tsx  # a tool to run TypeScript (.ts) files directly with node
Create and launch an HTTP Server
Create a file named app.ts (or app.js if not using TypeScript) and add the following code to it:

TypeScript
JavaScript
/*app.ts*/
import express, { Express } from 'express';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.get('/rolldice', (req, res) => {
  res.send(getRandomNumber(1, 6).toString());
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
Run the application with the following command and open http://localhost:8080/rolldice in your web browser to ensure it is working.

TypeScript
JavaScript
 npx tsx app.ts
Instrumentation
The following shows how to install, initialize, and run an application instrumented with OpenTelemetry.

More Dependencies
First, install the Node SDK and autoinstrumentations package.

The Node SDK lets you initialize OpenTelemetry with several configuration defaults that are correct for the majority of use cases.

The auto-instrumentations-node package installs instrumentation libraries that will automatically create spans corresponding to code called in libraries. In this case, it provides instrumentation for Express, letting the example app automatically create spans for each incoming request.

npm install @opentelemetry/sdk-node \
  @opentelemetry/api \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/sdk-metrics \
  @opentelemetry/sdk-trace-node
To find all autoinstrumentation modules, you can look at the registry.

Setup
The instrumentation setup and configuration must be run before your application code. One tool commonly used for this task is the –import flag.

Create a file named instrumentation.ts (or instrumentation.mjs if not using TypeScript), which will contain your instrumentation setup code.

Note
The following examples using --import instrumentation.ts (TypeScript) require Node.js v.20 or later. If you are using Node.js v.18, please use the JavaScript example.

TypeScript
JavaScript
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
Run the instrumented app
Now you can run your application as you normally would, but you can use the --import flag to load the instrumentation before the application code. Make sure you don’t have other conflicting --import or --require flags such as --require @opentelemetry/auto-instrumentations-node/register in your NODE_OPTIONS environment variable.

TypeScript
JavaScript
 npx tsx --import ./instrumentation.ts app.ts
(Note: If your application is written in JavaScript as ECMAScript Modules (ESM), or compiled to ESM from TypeScript, then a loader hook is required to properly support instrumentation. Use node --experimental-loader=@opentelemetry/instrumentation/hook.mjs --require ./instrumentation.js app.js. See ESM support docs for details on ESM support in OpenTelemetry.)

Open http://localhost:8080/rolldice in your web browser and reload the page a few times. After a while you should see the spans printed in the console by the ConsoleSpanExporter.

View example output
The generated span tracks the lifetime of a request to the /rolldice route.

Send a few more requests to the endpoint. After a moment, you’ll see metrics in the console output, such as the following:

View example output
Next Steps
Enrich your instrumentation generated automatically with manual instrumentation of your own codebase. This gets you customized observability data.

You’ll also want to configure an appropriate exporter to export your telemetry data to one or more telemetry backends.

If you’d like to explore a more complex example, take a look at the OpenTelemetry Demo, which includes the JavaScript based Payment Service and the TypeScript based Frontend Service.

Troubleshooting
Did something go wrong? You can enable diagnostic logging to validate that OpenTelemetry is initialized correctly:

TypeScript
JavaScript
/*instrumentation.ts*/
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new NodeSDK({...
Note
The OpenTelemetry documentation assumes that the compiled application is run as CommonJS. If the application runs as ESM, add the loader hook as specified in the ESM Support Doc.


Instrumentation
Instrumentation for OpenTelemetry JavaScript
Instrumentation is the act of adding observability code to an app yourself.

If you’re instrumenting an app, you need to use the OpenTelemetry SDK for your language. You’ll then use the SDK to initialize OpenTelemetry and the API to instrument your code. This will emit telemetry from your app, and any library you installed that also comes with instrumentation.

If you’re instrumenting a library, only install the OpenTelemetry API package for your language. Your library will not emit telemetry on its own. It will only emit telemetry when it is part of an app that uses the OpenTelemetry SDK. For more on instrumenting libraries, see Libraries.

For more information about the OpenTelemetry API and SDK, see the specification.

Note
On this page you will learn how you can add traces, metrics and logs to your code manually. But, you are not limited to only use one kind of instrumentation: use automatic instrumentation to get started and then enrich your code with manual instrumentation as needed.

Also, for libraries your code depends on, you don’t have to write instrumentation code yourself, since they might come with OpenTelemetry built-in natively or you can make use of instrumentation libraries.

Example app preparation
This page uses a modified version of the example app from Getting Started to help you learn about manual instrumentation.

You don’t have to use the example app: if you want to instrument your own app or library, follow the instructions here to adapt the process to your own code.

Note
The OpenTelemetry documentation assumes that the compiled application is run as CommonJS. If the application runs as ESM, add the loader hook as specified in the ESM Support Doc.

Dependencies
Create an empty NPM package.json file in a new directory:

npm init -y
Next, install Express dependencies.

TypeScript
JavaScript
npm install express @types/express
npm install -D tsx  # a tool to run TypeScript (.ts) files directly with node
Create and launch an HTTP Server
To highlight the difference between instrumenting a library and a standalone app, split out the dice rolling into a library file, which then will be imported as a dependency by the app file.

Create the library file named dice.ts (or dice.js if you are not using TypeScript) and add the following code to it:

TypeScript
JavaScript
/*dice.ts*/
function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
Create the app file named app.ts (or app.js if not using TypeScript) and add the following code to it:

TypeScript
JavaScript
/*app.ts*/
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
To ensure that it is working, run the application with the following command and open http://localhost:8080/rolldice?rolls=12 in your web browser.

TypeScript
JavaScript
 npx tsx app.ts
Manual instrumentation setup
Dependencies
Install OpenTelemetry API packages:

npm install @opentelemetry/api @opentelemetry/resources @opentelemetry/semantic-conventions
Initialize the SDK
If you’re instrumenting a library, skip this step.

If you instrument a Node.js application install the OpenTelemetry SDK for Node.js:

npm install @opentelemetry/sdk-node
Before any other module in your application is loaded, you must initialize the SDK. If you fail to initialize the SDK or initialize it too late, no-op implementations will be provided to any library that acquires a tracer or meter from the API.

TypeScript
JavaScript
/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'yourServiceName',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
For debugging and local development purposes, the following example exports telemetry to the console. After you have finished setting up manual instrumentation, you need to configure an appropriate exporter to export the app’s telemetry data to one or more telemetry backends.

The example also sets up the mandatory SDK default attribute service.name, which holds the logical name of the service, and the optional (but highly encouraged!) attribute service.version, which holds the version of the service API or implementation.

Alternative methods exist for setting up resource attributes. For more information, see Resources.

Note
The following examples using --import instrumentation.ts (TypeScript) require Node.js v20 or later. If you are using Node.js v18, please use the JavaScript example.

TypeScript
JavaScript
npx tsx --import ./instrumentation.ts app.ts
This basic setup has no effect on your app yet. You need to add code for traces, metrics, and/or logs.

You can register instrumentation libraries with the OpenTelemetry SDK for Node.js in order to generate telemetry data for your dependencies. For more information, see Libraries.

Traces
Initialize Tracing
If you’re instrumenting a library, skip this step.

To enable tracing in your app, you’ll need to have an initialized TracerProvider that will let you create a Tracer.

If a TracerProvider is not created, the OpenTelemetry APIs for tracing will use a no-op implementation and fail to generate data. As explained next, modify the instrumentation.ts (or instrumentation.js) file to include all the SDK initialization code in Node and the browser.

Node.js
If you followed the instructions to initialize the SDK above, you have a TracerProvider setup for you already. You can continue with acquiring a tracer.

Browser
Warning
Client instrumentation for the browser is experimental and mostly unspecified. If you are interested in helping out, get in touch with the Client Instrumentation SIG.

First, ensure you’ve got the right packages:

npm install @opentelemetry/sdk-trace-web
Next, update instrumentation.ts (or instrumentation.js) to contain all the SDK initialization code in it:

TypeScript
JavaScript
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'service-name-here',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const exporter = new ConsoleSpanExporter();
const processor = new BatchSpanProcessor(exporter);

const provider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [processor],
});

provider.register();
You’ll need to bundle this file with your web application to be able to use tracing throughout the rest of your web application.

This will have no effect on your app yet: you need to create spans to have telemetry emitted by your app.

Picking the right span processor
By default, the Node SDK uses the BatchSpanProcessor, and this span processor is also chosen in the Web SDK example. The BatchSpanProcessor processes spans in batches before they are exported. This is usually the right processor to use for an application.

In contrast, the SimpleSpanProcessor processes spans as they are created. This means that if you create 5 spans, each will be processed and exported before the next span is created in code. This can be helpful in scenarios where you do not want to risk losing a batch, or if you’re experimenting with OpenTelemetry in development. However, it also comes with potentially significant overhead, especially if spans are being exported over a network - each time a call to create a span is made, it would be processed and sent over a network before your app’s execution could continue.

In most cases, stick with BatchSpanProcessor over SimpleSpanProcessor.

Acquiring a tracer
Anywhere in your application where you write manual tracing code should call getTracer to acquire a tracer. For example:

TypeScript
JavaScript
import opentelemetry from '@opentelemetry/api';
//...

const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// You can now use a 'tracer' to do tracing!
The values of instrumentation-scope-name and instrumentation-scope-version should uniquely identify the Instrumentation Scope, such as the package, module or class name. While the name is required, the version is still recommended despite being optional.

It’s generally recommended to call getTracer in your app when you need it rather than exporting the tracer instance to the rest of your app. This helps avoid trickier application load issues when other required dependencies are involved.

In the case of the example app, there are two places where a tracer may be acquired with an appropriate Instrumentation Scope:

First, in the application file app.ts (or app.js):

TypeScript
JavaScript
/*app.ts*/
import { trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
And second, in the library file dice.ts (or dice.js):

TypeScript
JavaScript
/*dice.ts*/
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
Create spans
Now that you have tracers initialized, you can create spans.

The API of OpenTelemetry JavaScript exposes two methods that allow you to create spans:

tracer.startSpan: Starts a new span without setting it on context.
tracer.startActiveSpan: Starts a new span and calls the given callback function passing it the created span as first argument. The new span gets set in context and this context is activated for the duration of the function call.
In most cases you want to use the latter (tracer.startActiveSpan), as it takes care of setting the span and its context active.

The code below illustrates how to create an active span.

TypeScript
JavaScript
import { trace, type Span } from '@opentelemetry/api';

/* ... */

export function rollTheDice(rolls: number, min: number, max: number) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', (span: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(min, max));
    }
    // Be sure to end the span!
    span.end();
    return result;
  });
}
If you followed the instructions using the example app up to this point, you can copy the code above in your library file dice.ts (or dice.js). You should now be able to see spans emitted from your app.

Start your app as follows, and then send it requests by visiting http://localhost:8080/rolldice?rolls=12 with your browser or curl.

TypeScript
JavaScript
npx tsx --import ./instrumentation.ts app.ts
After a while, you should see the spans printed in the console by the ConsoleSpanExporter, something like this:

{
  resource: {
    attributes: {
      'service.name': 'dice-server',
      'service.version': '0.1.0',
      // ...
    }
  },
  instrumentationScope: { name: 'dice-lib', version: undefined, schemaUrl: undefined },
  traceId: '30d32251088ba9d9bca67b09c43dace0',
  parentSpanContext: undefined,
  traceState: undefined,
  name: 'rollTheDice',
  id: 'cc8a67c2d4840402',
  kind: 0,
  timestamp: 1756165206470000,
  duration: 35.584,
  attributes: {},
  status: { code: 0 },
  events: [],
  links: []
}
Create nested spans
Nested spans let you track work that’s nested in nature. For example, the rollOnce() function below represents a nested operation. The following sample creates a nested span that tracks rollOnce():

TypeScript
JavaScript
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Be sure to end the span!
    parentSpan.end();
    return result;
  });
}
This code creates a child span for each roll that has parentSpan’s ID as their parent ID:

{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:0',
  id: '36423bc1ce7532b0',
  timestamp: 1756165362215000,
  duration: 85.667,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: {
    traceId: '6469e115dc1562dd768c999da0509615',
    spanId: '38691692d6bc3395',
    // ...
  },
  name: 'rollOnce:1',
  id: 'ed9bbba2264d6872',
  timestamp: 1756165362215000,
  duration: 16.834,
  // ...
}
{
  traceId: '6469e115dc1562dd768c999da0509615',
  parentSpanContext: undefined,
  name: 'rollTheDice',
  id: '38691692d6bc3395',
  timestamp: 1756165362214000,
  duration: 1022.209,
  // ...
}
Create independent spans
The previous examples showed how to create an active span. In some cases, you’ll want to create inactive spans that are siblings of one another rather than being nested.

const doWork = () => {
  const span1 = tracer.startSpan('work-1');
  // do some work
  const span2 = tracer.startSpan('work-2');
  // do some more work
  const span3 = tracer.startSpan('work-3');
  // do even more work

  span1.end();
  span2.end();
  span3.end();
};
In this example, span1, span2, and span3 are sibling spans and none of them are considered the currently active span. They share the same parent rather than being nested under one another.

This arrangement can be helpful if you have units of work that are grouped together but are conceptually independent from one another.

Get the current span
Sometimes it’s helpful to do something with the current/active span at a particular point in program execution.

const activeSpan = opentelemetry.trace.getActiveSpan();

// do something with the active span, optionally ending it if that is appropriate for your use case.
Get a span from context
It can also be helpful to get the span from a given context that isn’t necessarily the active span.

const ctx = getContextFromSomewhere();
const span = opentelemetry.trace.getSpan(ctx);

// do something with the acquired span, optionally ending it if that is appropriate for your use case.
Attributes
Attributes let you attach key/value pairs to a Span so it carries more information about the current operation that it’s tracking.

TypeScript
JavaScript
function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);

    // Add an attribute to the span
    span.setAttribute('dicelib.rolled', result.toString());

    span.end();
    return result;
  });
}
You can also add attributes to a span as it’s created:

tracer.startActiveSpan(
  'app.new-span',
  { attributes: { attribute1: 'value1' } },
  (span) => {
    // do some work...

    span.end();
  },
);
TypeScript
JavaScript
function rollTheDice(rolls: number, min: number, max: number) {
  return tracer.startActiveSpan(
    'rollTheDice',
    { attributes: { 'dicelib.rolls': rolls.toString() } },
    (span: Span) => {
      /* ... */
    },
  );
}
Semantic Attributes
There are semantic conventions for spans representing operations in well-known protocols like HTTP or database calls. Semantic conventions for these spans are defined in the specification at Trace Semantic Conventions. In the simple example of this guide the source code attributes can be used.

First add the semantic conventions as a dependency to your application:

npm install --save @opentelemetry/semantic-conventions
Add the following to the top of your application file:

TypeScript
JavaScript
import {
  ATTR_CODE_FUNCTION_NAME,
  ATTR_CODE_FILE_PATH,
} from '@opentelemetry/semantic-conventions';
Finally, you can update your file to include semantic attributes:

const doWork = () => {
  tracer.startActiveSpan('app.doWork', (span) => {
    span.setAttribute(ATTR_CODE_FUNCTION_NAME, 'doWork');
    span.setAttribute(ATTR_CODE_FILE_PATH, __filename);

    // Do some work...

    span.end();
  });
};
Span events
A Span Event is a human-readable message on an Span that represents a discrete event with no duration that can be tracked by a single timestamp. You can think of it like a primitive log.

span.addEvent('Doing something');

const result = doWork();
You can also create Span Events with additional Attributes:

span.addEvent('some log', {
  'log.severity': 'error',
  'log.message': 'Data not found',
  'request.id': requestId,
});
Span links
Spans can be created with zero or more Links to other Spans that are causally related. A common scenario is to correlate one or more traces with the current span.

const someFunction = (spanToLinkFrom) => {
  const options = {
    links: [
      {
        context: spanToLinkFrom.spanContext(),
      },
    ],
  };

  tracer.startActiveSpan('app.someFunction', options, (span) => {
    // Do some work...

    span.end();
  });
};
Span Status
A Status can be set on a Span, typically used to specify that a Span has not completed successfully - Error. By default, all spans are Unset, which means a span completed without error. The Ok status is reserved for when you need to explicitly mark a span as successful rather than stick with the default of Unset (i.e., “without error”).

The status can be set at any time before the span is finished.

TypeScript
JavaScript
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

tracer.startActiveSpan('app.doWork', (span) => {
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    if (i > 10000) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Error',
      });
    }
  }

  span.end();
});
Recording exceptions
It can be a good idea to record exceptions when they happen. It’s recommended to do this in conjunction with setting span status.

TypeScript
JavaScript
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api';

// ...

try {
  doWork();
} catch (ex) {
  if (ex instanceof Error) {
    span.recordException(ex);
  }
  span.setStatus({ code: SpanStatusCode.ERROR });
}
Using sdk-trace-base and manually propagating span context
In some cases, you may not be able to use either the Node.js SDK nor the Web SDK. The biggest difference, aside from initialization code, is that you’ll have to manually set spans as active in the current context to be able to create nested spans.

Initializing tracing with sdk-trace-base
Initializing tracing is similar to how you’d do it with Node.js or the Web SDK.

TypeScript
JavaScript
import opentelemetry from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';

opentelemetry.trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    // Configure span processor to send spans to the exporter
    spanProcessors: [new BatchSpanProcessor(new ConsoleSpanExporter())],
  }),
);

opentelemetry.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
);

// This is what we'll access in all instrumentation code
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
Like the other examples in this document, this exports a tracer you can use throughout the app.

Creating nested spans with sdk-trace-base
To create nested spans, you need to set whatever the currently-created span is as the active span in the current context. Don’t bother using startActiveSpan because it won’t do this for you.

const mainWork = () => {
  const parentSpan = tracer.startSpan('main');

  for (let i = 0; i < 3; i += 1) {
    doWork(parentSpan, i);
  }

  // Be sure to end the parent span!
  parentSpan.end();
};

const doWork = (parent, i) => {
  // To create a child span, we need to mark the current (parent) span as the active span
  // in the context, then use the resulting context to create a child span.
  const ctx = opentelemetry.trace.setSpan(
    opentelemetry.context.active(),
    parent,
  );
  const span = tracer.startSpan(`doWork:${i}`, undefined, ctx);

  // simulate some random work.
  for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // empty
  }

  // Make sure to end this child span! If you don't,
  // it will continue to track work beyond 'doWork'!
  span.end();
};
All other APIs behave the same when you use sdk-trace-base compared with the Node.js or Web SDKs.

Metrics
Metrics combine individual measurements into aggregates, and produce data which is constant as a function of system load. Aggregates lack details required to diagnose low level issues, but complement spans by helping to identify trends and providing application runtime telemetry.

Initialize Metrics
If you’re instrumenting a library, skip this step.

To enable metrics in your app, you’ll need to have an initialized MeterProvider that will let you create a Meter.

If a MeterProvider is not created, the OpenTelemetry APIs for metrics will use a no-op implementation and fail to generate data. As explained next, modify the instrumentation.ts (or instrumentation.js) file to include all the SDK initialization code in Node and the browser.

Node.js
If you followed the instructions to initialize the SDK above, you have a MeterProvider setup for you already. You can continue with acquiring a meter.

Initializing metrics with sdk-metrics
In some cases you may not be able or may not want to use the full OpenTelemetry SDK for Node.js. This is also true if you want to use OpenTelemetry JavaScript in the browser.

If so, you can initialize metrics with the @opentelemetry/sdk-metrics package:

npm install @opentelemetry/sdk-metrics
If you have not created it for tracing already, create a separate instrumentation.ts (or instrumentation.js) file that has all the SDK initialization code in it:

TypeScript
JavaScript
import opentelemetry from '@opentelemetry/api';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'dice-server',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});

const myServiceMeterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);
You’ll need to --import this file when you run your app, such as:

TypeScript
JavaScript
npx tsx --import ./instrumentation.ts app.ts
Now that a MeterProvider is configured, you can acquire a Meter.

Acquiring a Meter
Anywhere in your application where you have manually instrumented code you can call getMeter to acquire a meter. For example:

TypeScript
JavaScript
import opentelemetry from '@opentelemetry/api';

const myMeter = opentelemetry.metrics.getMeter(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// You can now use a 'meter' to create instruments!
The values of instrumentation-scope-name and instrumentation-scope-version should uniquely identify the Instrumentation Scope, such as the package, module or class name. While the name is required, the version is still recommended despite being optional.

It’s generally recommended to call getMeter in your app when you need it rather than exporting the meter instance to the rest of your app. This helps avoid trickier application load issues when other required dependencies are involved.

In the case of the example app, there are two places where a meter may be acquired with an appropriate Instrumentation Scope:

First, in the application file app.ts (or app.js):

TypeScript
JavaScript
/*app.ts*/
import { metrics, trace } from '@opentelemetry/api';
import express, { type Express } from 'express';
import { rollTheDice } from './dice';

const tracer = trace.getTracer('dice-server', '0.1.0');
const meter = metrics.getMeter('dice-server', '0.1.0');

const PORT: number = parseInt(process.env.PORT || '8080');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
And second, in the library file dice.ts (or dice.js):

TypeScript
JavaScript
/*dice.ts*/
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

function rollOnce(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rollTheDice(rolls: number, min: number, max: number) {
  const result: number[] = [];
  for (let i = 0; i < rolls; i++) {
    result.push(rollOnce(min, max));
  }
  return result;
}
Now that you have meters initialized, you can create metric instruments.

Using counters
Counters can be used to measure a non-negative, increasing value.

In the case of our example app we can use this to count how often the dice has been rolled:

TypeScript
JavaScript
/*dice.ts*/
const counter = meter.createCounter('dice-lib.rolls.counter');

function rollOnce(min: number, max: number) {
  counter.add(1);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
Using UpDown Counters
UpDown counters can increment and decrement, allowing you to observe a cumulative value that goes up or down.

const counter = myMeter.createUpDownCounter('events.counter');

//...

counter.add(1);

//...

counter.add(-1);
Using Histograms
Histograms are used to measure a distribution of values over time.

For example, here’s how you report a distribution of response times for an API route with Express:

TypeScript
JavaScript
import express from 'express';

const app = express();

app.get('/', (_req, _res) => {
  const histogram = myMeter.createHistogram('task.duration');
  const startTime = new Date().getTime();

  // do some work in an API call

  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  // Record the duration of the task operation
  histogram.record(executionTime);
});
Using Observable (Async) Counters
Observable counters can be used to measure an additive, non-negative, monotonically increasing value.

const events = [];

const addEvent = (name) => {
  events.push(name);
};

const counter = myMeter.createObservableCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... calls to addEvent
Using Observable (Async) UpDown Counters
Observable UpDown counters can increment and decrement, allowing you to measure an additive, non-negative, non-monotonically increasing cumulative value.

const events = [];

const addEvent = (name) => {
  events.push(name);
};

const removeEvent = () => {
  events.pop();
};

const counter = myMeter.createObservableUpDownCounter('events.counter');

counter.addCallback((result) => {
  result.observe(events.length);
});

//... calls to addEvent and removeEvent
Using Observable (Async) Gauges
Observable Gauges should be used to measure non-additive values.

let temperature = 32;

const gauge = myMeter.createObservableGauge('temperature.gauge');

gauge.addCallback((result) => {
  result.observe(temperature);
});

//... temperature variable is modified by a sensor
Describing instruments
When you create instruments like counters, histograms, etc. you can give them a description.

const httpServerResponseDuration = myMeter.createHistogram(
  'http.server.duration',
  {
    description: 'A distribution of the HTTP server response times',
    unit: 'milliseconds',
    valueType: ValueType.INT,
  },
);
In JavaScript, each configuration type means the following:

description - a human-readable description for the instrument
unit - The description of the unit of measure that the value is intended to represent. For example, milliseconds to measure duration, or bytes to count number of bytes.
valueType - The kind of numeric value used in measurements.
It’s generally recommended to describe each instrument you create.

Adding attributes
You can add Attributes to metrics when they are generated.

const counter = myMeter.createCounter('my.counter');

counter.add(1, { 'some.optional.attribute': 'some value' });
Configure Metric Views
A Metric View provides developers with the ability to customize metrics exposed by the Metrics SDK.

Selectors
To instantiate a view, one must first select a target instrument. The following are valid selectors for metrics:

instrumentType
instrumentName
meterName
meterVersion
meterSchemaUrl
Selecting by instrumentName (of type string) has support for wildcards, so you can select all instruments using * or select all instruments whose name starts with http by using http*.

Examples
Filter attributes on all metric types:

const limitAttributesView = {
  // only export the attribute 'environment'
  attributeKeys: ['environment'],
  // apply the view to all instruments
  instrumentName: '*',
};
Drop all instruments with the meter name pubsub:

const dropView = {
  aggregation: { type: AggregationType.DROP },
  meterName: 'pubsub',
};
Define explicit bucket sizes for the Histogram named http.server.duration:

const histogramView = {
  aggregation: {
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
    options: { boundaries: [0, 1, 5, 10, 15, 20, 25, 30] },
  },
  instrumentName: 'http.server.duration',
  instrumentType: InstrumentType.HISTOGRAM,
};
Attach to meter provider
Once views have been configured, attach them to the corresponding meter provider:

const meterProvider = new MeterProvider({
  views: [limitAttributesView, dropView, histogramView],
});
Logs
The logs API & SDK are currently under development.


Using instrumentation libraries
How to instrument libraries an app depends on
When you develop an app, you might use third-party libraries and frameworks to accelerate your work. If you then instrument your app using OpenTelemetry, you might want to avoid spending additional time to manually add traces, logs, and metrics to the third-party libraries and frameworks you use.

Many libraries and frameworks already support OpenTelemetry or are supported through OpenTelemetry instrumentation, so that they can generate telemetry you can export to an observability backend.

If you are instrumenting an app or service that use third-party libraries or frameworks, follow these instructions to learn how to use natively instrumented libraries and instrumentation libraries for your dependencies.

Use natively instrumented libraries
If a library comes with OpenTelemetry support by default, you can get traces, metrics, and logs emitted from that library by adding and setting up the OpenTelemetry SDK with your app.

The library might require some additional configuration for the instrumentation. Go to the documentation for that library to learn more.

Instrumentation for Next.js
Instrumentation for SvelteKit
Help wanted
If you are aware of a JavaScript library that has OpenTelemetry natively integrated, let us know.

Use Instrumentation Libraries
If a library does not come with OpenTelemetry out of the box, you can use instrumentation libraries in order to generate telemetry data for a library or framework.

For example, the instrumentation library for Express will automatically create spans based on the inbound HTTP requests.

Note
The OpenTelemetry documentation assumes that the compiled application is run as CommonJS. If the application runs as ESM, add the loader hook as specified in the ESM Support Doc.

Setup
Each instrumentation library is an NPM package. For example, here’s how you can install the instrumentation-express and instrumentation-http instrumentation libraries to instrument inbound and outbound HTTP traffic:

npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-express
OpenTelemetry JavaScript also defines metapackages auto-instrumentation-node and auto-instrumentation-web, that bundle all Node.js- or web-based instrumentation libraries into a single package. It’s a convenient way to add automatically-generated telemetry for all your libraries with minimal effort:

Node.js
Browser
npm install --save @opentelemetry/auto-instrumentations-node
Note, that using those metapackages increases your dependency graph size. Use individual instrumentation libraries if you know exactly which ones you need.

Registration
After installing the instrumentation libraries you need, register them with the OpenTelemetry SDK for Node.js. If you followed the Getting Started you already use the metapackages. If you followed the instructions to initialize the SDK for manual instrumentation, update your instrumentation.ts (or instrumentation.js) as follows:

TypeScript
JavaScript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // This registers all instrumentation packages
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
To disable individual instrumentation libraries you can apply the following change:

TypeScript
JavaScript
/*instrumentation.ts*/
...
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  ...
  // This registers all instrumentation packages
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start()
To only load individual instrumentation libraries, replace [getNodeAutoInstrumentations()] with the list of those you need:

TypeScript
JavaScript
/*instrumentation.ts*/
...
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

const sdk = new NodeSDK({
  ...
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ]
});

sdk.start()
Configuration
Some instrumentation libraries offer additional configuration options.

For example, Express instrumentation offers ways to ignore specified middleware or enrich spans created automatically with a request hook:

TypeScript
JavaScript
import { Span } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';
import {
  ExpressInstrumentation,
  ExpressLayerType,
  ExpressRequestInfo,
} from '@opentelemetry/instrumentation-express';

const expressInstrumentation = new ExpressInstrumentation({
  requestHook: function (span: Span, info: ExpressRequestInfo) {
    if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
      span.setAttribute(ATTR_HTTP_REQUEST_METHOD, info.request.method);
      span.setAttribute(ATTR_URL_FULL, info.request.baseUrl);
    }
  },
});
You’ll need to refer to each instrumentation library’s documentation for advanced configuration.

Available instrumentation libraries
You can find a list of available instrumentation in the registry.

Instrument a library natively
If you want to add native instrumentation to your library, you should review the following documentation:

The concept page Libraries provides you with insights on when to instrument and what to instrument
The manual instrumentation provides you with the required code examples to create traces, metrics and logs for your library
The Instrumentation Implementation Guide for Node.js and browser contains JavaScript specific best practices for creating library instrumentation.
Create an instrumentation library
While having out of the box observability for an application is the preferred way, this is not always possible or desired. In those cases, you can create an instrumentation library, which would inject instrumentation calls, using mechanisms such as wrapping interfaces, subscribing to library-specific callbacks, or translating existing telemetry into the OpenTelemetry model.

To create such a library follow the Instrumentation Implementation Guide for Node.js and browser.

Exporters
Process and export your telemetry data
Send telemetry to the OpenTelemetry Collector to make sure it’s exported correctly. Using the Collector in production environments is a best practice. To visualize your telemetry, export it to a backend such as Jaeger, Zipkin, Prometheus, or a vendor-specific backend.

Available exporters
The registry contains a list of exporters for JavaScript.

Among exporters, OpenTelemetry Protocol (OTLP) exporters are designed with the OpenTelemetry data model in mind, emitting OTel data without any loss of information. Furthermore, many tools that operate on telemetry data support OTLP (such as Prometheus, Jaeger, and most vendors), providing you with a high degree of flexibility when you need it. To learn more about OTLP, see OTLP Specification.

This page covers the main OpenTelemetry JavaScript exporters and how to set them up.

Note
If you use zero-code instrumentation, you can learn how to set up exporters by following the Configuration Guide.

OTLP
Collector Setup
Note
If you have a OTLP collector or backend already set up, you can skip this section and setup the OTLP exporter dependencies for your application.

To try out and verify your OTLP exporters, you can run the collector in a docker container that writes telemetry directly to the console.

In an empty directory, create a file called collector-config.yaml with the following content:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
exporters:
  debug:
    verbosity: detailed
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]
Now run the collector in a docker container:

docker run -p 4317:4317 -p 4318:4318 --rm -v $(pwd)/collector-config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector
This collector is now able to accept telemetry via OTLP. Later you may want to configure the collector to send your telemetry to your observability backend.

Dependencies
If you want to send telemetry data to an OTLP endpoint (like the OpenTelemetry Collector, Jaeger or Prometheus), you can choose between three different protocols to transport your data:

HTTP/protobuf
HTTP/JSON
gRPC
Start by installing the respective exporter packages as a dependency for your project:

HTTP/Proto
HTTP/JSON
gRPC
npm install --save @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/exporter-metrics-otlp-proto
Usage with Node.js
Next, configure the exporter to point at an OTLP endpoint. For example you can update the file instrumentation.ts (or instrumentation.js if you use JavaScript) from the Getting Started like the following to export traces and metrics via OTLP (http/protobuf) :

TypeScript
JavaScript
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: '<your-otlp-endpoint>/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
Usage in the Browser
When you use the OTLP exporter in a browser-based application, you need to note that:

Using gRPC for exporting is not supported
Content Security Policies (CSPs) of your website might block your exports
Cross-Origin Resource Sharing (CORS) headers might not allow your exports to be sent
You might need to expose your collector to the public internet
Below you will find instructions to use the right exporter, to configure your CSPs and CORS headers and what precautions you have to take when exposing your collector.

Use OTLP exporter with HTTP/JSON or HTTP/protobuf
OpenTelemetry Collector Exporter with gRPC works only with Node.js, therefore you are limited to use the OpenTelemetry Collector Exporter with HTTP/JSON or OpenTelemetry Collector Exporter with HTTP/protobuf.

Make sure that the receiving end of your exporter (collector or observability backend) accepts http/json if you are using OpenTelemetry Collector Exporter with HTTP/JSON, and that you are exporting your data to the right endpoint with your port set to 4318.

Configure CSPs
If your website is making use of Content Security Policies (CSPs), make sure that the domain of your OTLP endpoint is included. If your collector endpoint is https://collector.example.com:4318/v1/traces, add the following directive:

connect-src collector.example.com:4318/v1/traces
If your CSP is not including the OTLP endpoint, you will see an error message, stating that the request to your endpoint is violating the CSP directive.

Configure CORS headers
If your website and collector are hosted at a different origin, your browser might block the requests going out to your collector. You need to configure special headers for Cross-Origin Resource Sharing (CORS).

The OpenTelemetry Collector provides a feature for http-based receivers to add the required headers to allow the receiver to accept traces from a web browser:

receivers:
  otlp:
    protocols:
      http:
        include_metadata: true
        cors:
          allowed_origins:
            - https://foo.bar.com
            - https://*.test.com
          allowed_headers:
            - Example-Header
          max_age: 7200
Securely expose your collector
To receive telemetry from a web application you need to allow the browsers of your end-users to send data to your collector. If your web application is accessible from the public internet, you also have to make your collector accessible for everyone.

It is recommended that you do not expose your collector directly, but that you put a reverse proxy (NGINX, Apache HTTP Server, …) in front of it. The reverse proxy can take care of SSL-offloading, setting the right CORS headers, and many other features specific to web applications.

Below you will find a configuration for the popular NGINX web server to get you started:

server {
    listen 80 default_server;
    server_name _;
    location / {
        # Take care of preflight requests
        if ($request_method = 'OPTIONS') {
             add_header 'Access-Control-Max-Age' 1728000;
             add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
             add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
             add_header 'Access-Control-Allow-Credentials' 'true' always;
             add_header 'Content-Type' 'text/plain charset=UTF-8';
             add_header 'Content-Length' 0;
             return 204;
        }

        add_header 'Access-Control-Allow-Origin' 'name.of.your.website.example.com' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Accept-Language,Content-Language,Content-Type' always;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://collector:4318;
    }
}
Console
To debug your instrumentation or see the values locally in development, you can use exporters writing telemetry data to the console (stdout).

If you followed the Getting Started or Manual Instrumentation guides, you already have the console exporter installed.

The ConsoleSpanExporter is included in the @opentelemetry/sdk-trace-node package and the ConsoleMetricExporter is included in the @opentelemetry/sdk-metrics package:

Jaeger
Backend Setup
Jaeger natively supports OTLP to receive trace data. You can run Jaeger in a docker container with the UI accessible on port 16686 and OTLP enabled on ports 4317 and 4318:

docker run --rm \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
Usage
Now following the instruction to setup the OTLP exporters.

Prometheus
To send your metric data to Prometheus, you can either enable Prometheus’ OTLP Receiver and use the OTLP exporter or you can use the Prometheus exporter, a MetricReader that starts an HTTP server that collects metrics and serialize to Prometheus text format on request.

Backend Setup
Note
If you have Prometheus or a Prometheus-compatible backend already set up, you can skip this section and setup the Prometheus or OTLP exporter dependencies for your application.

You can run Prometheus in a docker container, accessible on port 9090 by following these instructions:

Create a file called prometheus.yml with the following content:

scrape_configs:
  - job_name: dice-service
    scrape_interval: 5s
    static_configs:
      - targets: [host.docker.internal:9464]
Run Prometheus in a docker container with the UI accessible on port 9090:

docker run --rm -v ${PWD}/prometheus.yml:/prometheus/prometheus.yml -p 9090:9090 prom/prometheus --web.enable-otlp-receiver
Note
When using Prometheus’ OTLP Receiver, make sure that you set the OTLP endpoint for metrics in your application to http://localhost:9090/api/v1/otlp.

Not all docker environments support host.docker.internal. In some cases you may need to replace host.docker.internal with localhost or the IP address of your machine.

Dependencies
Install the exporter package as a dependency for your application:

npm install --save @opentelemetry/exporter-prometheus
Update your OpenTelemetry configuration to use the exporter and to send data to your Prometheus backend:

TypeScript
JavaScript
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new opentelemetry.NodeSDK({
  metricReader: new PrometheusExporter({
    port: 9464, // optional - default is 9464
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
With the above you can access your metrics at http://localhost:9464/metrics. Prometheus or an OpenTelemetry Collector with the Prometheus receiver can scrape the metrics from this endpoint.

Zipkin
Backend Setup
Note
If you have Zipkin or a Zipkin-compatible backend already set up, you can skip this section and setup the Zipkin exporter dependencies for your application.

You can run Zipkin on in a Docker container by executing the following command:

docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin
Dependencies
To send your trace data to Zipkin, you can use the ZipkinExporter.

Install the exporter package as a dependency for your application:

npm install --save @opentelemetry/exporter-zipkin
Update your OpenTelemetry configuration to use the exporter and to send data to your Zipkin backend:

TypeScript
JavaScript
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new ZipkinExporter({}),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
Custom exporters
Finally, you can also write your own exporter. For more information, see the SpanExporter Interface in the API documentation.

Batching span and log records
The OpenTelemetry SDK provides a set of default span and log record processors, that allow you to either emit spans one-by-on (“simple”) or batched. Using batching is recommended, but if you do not want to batch your spans or log records, you can use a simple processor instead as follows:

TypeScript
JavaScript
/*instrumentation.ts*/
import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

Context
OpenTelemetry JavaScript Context API Documentation
In order for OpenTelemetry to work, it must store and propagate important telemetry data. For example, when a request is received and a span is started it must be available to a component which creates its child span. To solve this problem, OpenTelemetry stores the span in the Context. This document describes the OpenTelemetry context API for JavaScript and how it is used.

More information:

Context specification
Context API reference
Context Manager
The context API depends on a context manager to work. The examples in this document will assume you have already configured a context manager. Typically the context manager is provided by your SDK, however it is possible to register one directly like this:

import * as api from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

const contextManager = new AsyncHooksContextManager();
contextManager.enable();
api.context.setGlobalContextManager(contextManager);
Root Context
The ROOT_CONTEXT is the empty context. If no context is active, the ROOT_CONTEXT is active. Active context is explained below Active Context.

Context Keys
Context entries are key-value pairs. Keys can be created by calling api.createContextKey(description).

import * as api from '@opentelemetry/api';

const key1 = api.createContextKey('My first key');
const key2 = api.createContextKey('My second key');
Basic Operations
Get Entry
Entries are accessed using the context.getValue(key) method.

import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
// ROOT_CONTEXT is the empty context
const ctx = api.ROOT_CONTEXT;

const value = ctx.getValue(key);
Set Entry
Entries are created by using the context.setValue(key, value) method. Setting a context entry creates a new context with all the entries of the previous context, but with the new entry. Setting a context entry does not modify the previous context.

import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
const ctx = api.ROOT_CONTEXT;

// add a new entry
const ctx2 = ctx.setValue(key, 'context 2');

// ctx2 contains the new entry
console.log(ctx2.getValue(key)); // "context 2"

// ctx is unchanged
console.log(ctx.getValue(key)); // undefined
Delete Entry
Entries are removed by calling context.deleteValue(key). Deleting a context entry creates a new context with all the entries of the previous context, but without the entry identified by the key. Deleting a context entry does not modify the previous context.

import * as api from '@opentelemetry/api';

const key = api.createContextKey('some key');
const ctx = api.ROOT_CONTEXT;
const ctx2 = ctx.setValue(key, 'context 2');

// remove the entry
const ctx3 = ctx2.deleteValue(key);

// ctx3 does not contain the entry
console.log(ctx3.getValue(key)); // undefined

// ctx2 is unchanged
console.log(ctx2.getValue(key)); // "context 2"
// ctx is unchanged
console.log(ctx.getValue(key)); // undefined
Active Context
IMPORTANT: This assumes you have configured a Context Manager. Without one, api.context.active() will ALWAYS return the ROOT_CONTEXT.

The active context is the context which is returned by api.context.active(). The context object contains entries which allow tracing components which are tracing a single thread of execution to communicate with each other and ensure the trace is successfully created. For example, when a span is created it may be added to the context. Later, when another span is created it may use the span from the context as its parent span. This is accomplished through the use of mechanisms like async_hooks or AsyncLocalStorage in node, or zone.js on the web in order to propagate the context through a single execution. If no context is active, the ROOT_CONTEXT is returned, which is just the empty context object.

Get Active Context
The active context is the context which is returned by api.context.active().

import * as api from '@opentelemetry/api';

// Returns the active context
// If no context is active, the ROOT_CONTEXT is returned
const ctx = api.context.active();
Set Active Context
A context can be made active by use of api.context.with(ctx, callback). During execution of the callback, the context passed to with will be returned by context.active.

import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');
const ctx = api.context.active();

api.context.with(ctx.setValue(key, 'context 2'), async () => {
  // "context 2" is active
  console.log(api.context.active().getValue(key)); // "context 2"
});
The return value of api.context.with(context, callback) is the return value of the callback. The callback is always called synchronously.

import * as api from '@opentelemetry/api';

const name = await api.context.with(api.context.active(), async () => {
  const row = await db.getSomeValue();
  return row['name'];
});

console.log(name); // name returned by the db
Active context executions may be nested.

import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');
const ctx = api.context.active();

// No context is active
console.log(api.context.active().getValue(key)); // undefined

api.context.with(ctx.setValue(key, 'context 2'), () => {
  // "context 2" is active
  console.log(api.context.active().getValue(key)); // "context 2"
  api.context.with(ctx.setValue(key, 'context 3'), () => {
    // "context 3" is active
    console.log(api.context.active().getValue(key)); // "context 3"
  });
  // "context 2" is active
  console.log(api.context.active().getValue(key)); // "context 2"
});

// No context is active
console.log(api.context.active().getValue(key)); // undefined
Example
This more complex example illustrates how the context is not modified, but new context objects are created.

import * as api from '@opentelemetry/api';

const key = api.createContextKey('Key to store a value');

const ctx = api.context.active(); // Returns ROOT_CONTEXT when no context is active
const ctx2 = ctx.setValue(key, 'context 2'); // does not modify ctx

console.log(ctx.getValue(key)); //? undefined
console.log(ctx2.getValue(key)); //? "context 2"

const ret = api.context.with(ctx2, () => {
  const ctx3 = api.context.active().setValue(key, 'context 3');

  console.log(api.context.active().getValue(key)); //? "context 2"
  console.log(ctx.getValue(key)); //? undefined
  console.log(ctx2.getValue(key)); //? "context 2"
  console.log(ctx3.getValue(key)); //? "context 3"

  api.context.with(ctx3, () => {
    console.log(api.context.active().getValue(key)); //? "context 3"
  });
  console.log(api.context.active().getValue(key)); //? "context 2"

  return 'return value';
});

// The value returned by the callback is returned to the caller
console.log(ret); //? "return value"

an);
From there, when you have a deserialized active context, you can create spans that will be a part of the same trace from the other service.

You can also use the Context API to modify or set the deserialized context in other ways.

Custom protocol example
A common use case for when you need to propagate context manually is when you use a custom protocol between services for communication. The following example uses a basic text-based TCP protocol to send a serialized object from one service to another.

Start with creating a new folder called propagation-example and initialize it with dependencies as follows:

npm init -y
npm install @opentelemetry/api @opentelemetry/sdk-node
Next create files client.js and server.js with the following content:

// client.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('client');

// Connect to the server
const client = net.createConnection({ port: 8124 }, () => {
  // Send the serialized object to the server
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    client.write(JSON.stringify(objToSend), () => {
      client.end();
      span.end();
    });
  });
});
// server.js
const net = require('net');
const { context, propagation, trace } = require('@opentelemetry/api');

let tracer = trace.getTracer('server');

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const message = data.toString();
    // Parse the JSON object received from the client
    try {
      const json = JSON.parse(message);
      let activeContext = context.active();
      if (json._meta) {
        activeContext = propagation.extract(context.active(), json._meta);
        delete json._meta;
      }
      span = tracer.startSpan('receive', { kind: 1 }, activeContext);
      trace.setSpan(activeContext, span);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    } finally {
      span.end();
    }
  });
});

// Listen on port 8124
server.listen(8124, () => {
  console.log('Server listening on port 8124');
});
Start a first shell to run the server:

 node server.js
Then in a second shell run the client:

node client.js
The client should terminate immediately and the server should output the following:

Parsed JSON: { key: 'value' }
Since the example so far only took dependency on the OpenTelemetry API all calls to it are no-op instructions and the client and server behave as if OpenTelemetry is not used.

Important
This is especially important if your server and client code are libraries, since they should only use the OpenTelemetry API. To understand why, read the concept page on how to add instrumentation to your library.

To enable OpenTelemetry and see the context propagation in action, create an additional file called instrumentation.js with the following content:

// instrumentation.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

sdk.start();
Use this file to run both, the server and the client, with instrumentation enabled:

 node --import ./instrumentation.mjs server.js
and

node --import ./instrumentation.mjs client.js
After the client has sent data to the server and terminated you should see spans in the console output of both shells.

The output for the client looks like the following:

{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: undefined,
  traceState: undefined,
  name: 'send',
  id: '92f125fa335505ec',
  kind: 1,
  timestamp: 1718879823424000,
  duration: 1054.583,
  // ...
}
The output for the server looks like the following:

{
  resource: {
    attributes: {
      // ...
    }
  },
  traceId: '4b5367d540726a70afdbaf49240e6597',
  parentId: '92f125fa335505ec',
  traceState: undefined,
  name: 'receive',
  id: '53da0c5f03cb36e5',
  kind: 1,
  timestamp: 1718879823426000,
  duration: 959.541,
  // ...
}
Similar to the manual example the spans are connected using the traceId and the id/parentId.

Resources
Add details about your applications’ environment to your telemetry
A resource represents the entity producing telemetry as resource attributes. For example, a process producing telemetry that is running in a container on Kubernetes has a process name, a pod name, a namespace, and possibly a deployment name. All four of these attributes can be included in the resource.

In your observability backend, you can use resource information to better investigate interesting behavior. For example, if your trace or metrics data indicate latency in your system, you can narrow it down to a specific container, pod, or Kubernetes deployment.

Below you will find introductions on how to set up resource detection with the Node.js SDK.

Setup
Follow the instructions in the Getting Started - Node.js, so that you have the files package.json, app.js (or app.ts) and instrumentation.mjs (or instrumentation.ts).

Note
The OpenTelemetry documentation assumes that the compiled application is run as CommonJS. If the application runs as ESM, add the loader hook as specified in the ESM Support Doc.

Process & Environment Resource Detection
Out of the box, the Node.js SDK detects process and process runtime resources and takes attributes from the environment variable OTEL_RESOURCE_ATTRIBUTES. You can verify what it detects by turning on diagnostic logging in your instrumentation file:

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
Run the application with some values set to OTEL_RESOURCE_ATTRIBUTES, e.g. we set the host.name to identify the Host:

 env OTEL_RESOURCE_ATTRIBUTES="host.name=localhost" \
Adding resources with environment variables
In the above example, the SDK detected the process and also added the host.name=localhost attribute set via the environment variable automatically.

Below you will find instructions to get resources detected automatically for you. However, you might run into the situation that no detector exists for the resource you need. In that case, use the environment variable OTEL_RESOURCE_ATTRIBUTES to inject whatever you need. Additionally, you can use the environment variable OTEL_SERVICE_NAME to set value of the service.name resource attribute. For example, the following script adds Service, Host and OS resource attributes:

 env OTEL_SERVICE_NAME="app.js" OTEL_RESOURCE_ATTRIBUTES="service.namespace=tutorial,service.version=1.0,service.instance.id=`uuidgen`,host.name=${HOSTNAME},host.type=`uname -m`,os.name=`uname -s`,os.version=`uname -r`" \
Adding resources in code
Custom resources can also be configured in your code. The NodeSDK provides a configuration option, where you can set them. For example you can update your instrumentation file like the following to have service.* attributes set:

...
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
...
const sdk = new opentelemetry.NodeSDK({
  ...
  resource: resourceFromAttributes({
    [ ATTR_SERVICE_NAME ]: "yourServiceName",
    [ ATTR_SERVICE_VERSION ]: "1.0",
  })
  ...
});
...
Note
If you set your resource attributes via environment variable and code, the values set via the environment variable take precedence.

Container Resource Detection
Use the same setup (package.json, app.js and instrumentation.mjs with debugging turned on) and Dockerfile with the following content in the same directory:

FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "--import", "./instrumentation.mjs", "app.js" ]
To make sure that you can stop your docker container with Ctrl + C (SIGINT) add the following to the bottom of app.js:

process.on('SIGINT', function () {
  process.exit();
});
To get the ID of your container detected automatically for you, install the following additional dependency:

npm install @opentelemetry/resource-detector-container
Next, update your instrumentation.mjs like the following:

const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [containerDetector],
});

sdk.start();
Build your docker image:

docker build . -t nodejs-otel-getting-started
Run your docker container:

$ docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': 'fffbeaf682f32ef86916f306ff9a7f88cc58048ab78f7de464da3c3201db5c54'
  }
}
The detector has extracted the container.id for you. However you might recognize that in this example, the process attributes and the attributes set via an environment variable are missing! To resolve this, when you set the resourceDetectors list you also need to specify the envDetector and processDetector detectors:

const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const {
  containerDetector,
} = require('@opentelemetry/resource-detector-container');
const { envDetector, processDetector } = require('@opentelemetry/resources');

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  // Make sure to add all detectors you need here!
  resourceDetectors: [envDetector, processDetector, containerDetector],
});

sdk.start();
Rebuild your image and run your container once again:

docker run --rm -p 8080:8080 nodejs-otel-getting-started
@opentelemetry/api: Registered a global for diag v1.2.0.
...
Listening for requests on http://localhost:8080
EnvDetector found resource. Resource { attributes: {} }
ProcessDetector found resource. Resource {
  attributes: {
    'process.pid': 1,
    'process.executable.name': 'node',
    'process.command': '/usr/src/app/app.js',
    'process.command_line': '/usr/local/bin/node /usr/src/app/app.js',
    'process.runtime.version': '18.9.0',
    'process.runtime.name': 'nodejs',
    'process.runtime.description': 'Node.js'
  }
}
DockerCGroupV1Detector found resource. Resource {
  attributes: {
    'container.id': '654d0670317b9a2d3fc70cbe021c80ea15339c4711fb8e8b3aa674143148d84e'
  }
}
...
Sampling
Reduce the amount of telemetry created
Sampling is a process that restricts the amount of traces that are generated by a system. The JavaScript SDK offers several head samplers.

Default behavior
By default, all spans are sampled, and thus, 100% of traces are sampled. If you do not need to manage data volume, don’t bother setting a sampler.

TraceIDRatioBasedSampler
When sampling, the most common head sampler to use is the TraceIdRatioBasedSampler. It deterministically samples a percentage of traces that you pass in as a parameter.

Environment Variables
You can configure the TraceIdRatioBasedSampler with environment variables:

export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="0.1"
This tells the SDK to sample spans such that only 10% of traces get created.

Node.js
You can also configure the TraceIdRatioBasedSampler in code. Here’s an example for Node.js:

TypeScript
JavaScript
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

const samplePercentage = 0.1;

const sdk = new NodeSDK({
  // Other SDK configuration parameters go here
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});
Browser
You can also configure the TraceIdRatioBasedSampler in code. Here’s an example for browser apps:

TypeScript
JavaScript
import {
  WebTracerProvider,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-web';

const samplePercentage = 0.1;

const provider = new WebTracerProvider({
  sampler: new TraceIdRatioBasedSampler(samplePercentage),
});

Quick start
Setup and collect telemetry in minutes!
The OpenTelemetry Collector receives traces, metrics, and logs, processes the telemetry, and exports it to a wide variety of observability backends using its components. For a conceptual overview of the Collector, see Collector.

You are going to learn to do the following in less than five minutes:

Set up and run the OpenTelemetry Collector.
Send telemetry and see it processed by the Collector.
Prerequisites
Make sure that your developer environment has the following. This page assumes that you’re using bash. Adapt configuration and commands as necessary for your preferred shell.

Docker or any compatible containers’ runtime.
Go 1.20 or higher
GOBIN environment variable is set; if unset, initialize it appropriately, for example1:
export GOBIN=${GOBIN:-$(go env GOPATH)/bin}
Set up the environment
Pull in the OpenTelemetry Collector core Docker image:

docker pull otel/opentelemetry-collector:0.148.0
Install the telemetrygen utility:

go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
This utility can simulate a client generating traces, metrics, and logs.

Generate and collect telemetry
Launch the Collector, listening on ports 4317 (for OTLP gRPC), 4318 (for OTLP HTTP) and 55679 (for ZPages):

docker run \
  -p 127.0.0.1:4317:4317 \
  -p 127.0.0.1:4318:4318 \
  -p 127.0.0.1:55679:55679 \
  otel/opentelemetry-collector:0.148.0 \
  2>&1 | tee collector-output.txt # Optionally tee output for easier search later
In a separate terminal window, generate a few sample traces:

$GOBIN/telemetrygen traces --otlp-insecure --traces 3
Among the output generated by the utility, you should see a confirmation that traces were generated:

2024-01-16T14:33:15.692-0500  INFO  traces/worker.go:99  traces generated  {"worker": 0, "traces": 3}
2024-01-16T14:33:15.692-0500  INFO  traces/traces.go:58  stop the batch span processor
For an easier time seeing relevant output you can filter it:

$GOBIN/telemetrygen traces --otlp-insecure \
  --traces 3 2>&1 | grep -E 'start|traces|stop'
In the terminal window running the Collector container, you should see trace ingest activity similar to what is shown in the following example:

 grep -E '^Span|(ID|Name|Kind|time|Status \w+)\s+:' ./collector-output.txt
Open http://localhost:55679/debug/tracez and select one of the samples in the table to see the traces you’ve just generated.

After you are done, shutdown the Collector container, for example, using Control-C.

Next steps
In this tutorial you’ve started the OpenTelemetry Collector and sent telemetry to it. As next steps, consider doing the following:

Explore different ways to install the Collector.
Learn about the different modes of the Collector in Deployment Methods.
Familiarize yourself with the Collector configuration files and structure.
Explore available components in the registry.
Learn how to build a custom Collector with the OpenTelemetry Collector Builder (OCB).

Install the Collector with Docker
The following commands pull a Docker image and run the Collector in a container. Replace 0.148.0 with the version of the Collector you want to run.

DockerHub
ghcr.io
docker pull otel/opentelemetry-collector:0.148.0
docker run otel/opentelemetry-collector:0.148.0
To load a custom configuration file from your working directory, mount the file as a volume:

DockerHub
ghcr.io
docker run -v $(pwd)/config.yaml:/etc/otelcol/config.yaml otel/opentelemetry-collector:0.148.0
Docker Compose
You can also add the OpenTelemetry Collector to your existing docker-compose.yaml file:

otel-collector:
  image: otel/opentelemetry-collector
  volumes:
    - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
  ports:
    - 1888:1888 # pprof extension
    - 8888:8888 # Prometheus metrics exposed by the Collector
    - 8889:8889 # Prometheus exporter metrics
    - 13133:13133 # health_check extension
    - 4317:4317 # OTLP gRPC receiver
    - 4318:4318 # OTLP http receiver
    - 55679:55679 # zpages extension
The otel-collector-config.yaml file is required for the Collector to start. For more information, see Collector configuration.

Below is a minimal Collector configuration that logs all received telemetry.

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      exporters: [debug]
    logs:
      receivers: [otlp]
      exporters: [debug]


      Configuration
Learn how to configure the Collector to suit your needs
You can configure the OpenTelemetry Collector to suit your observability needs. Before you learn how Collector configuration works, familiarize yourself with the following content:

Data collection concepts, to understand the repositories applicable to the OpenTelemetry Collector.
Security guidance for end users
Security guidance for component developers
Location
By default, the Collector configuration is located in /etc/<otel-directory>/config.yaml, where <otel-directory> can be otelcol, otelcol-contrib, or another value, depending on the Collector version or the Collector distribution you’re using.

You can provide one or more configurations using the --config option. For example:

otelcol --config=customconfig.yaml
The --config flag accepts either a file path or values in the form of a config URI "<scheme>:<opaque_data>". Currently, the OpenTelemetry Collector supports the following providers for scheme:

file - Reads configuration from a file. E.g. file:path/to/config.yaml.
env - Reads configuration from an environment variable. E.g. env:MY_CONFIG_IN_AN_ENVVAR.
yaml - Reads configuration from a YAML string, with :: delimiting subpaths. E.g. yaml:exporters::debug::verbosity: detailed.
http - Reads configuration from an HTTP URI. E.g. http://www.example.com
https - Reads configuration from an HTTPS URI. E.g. https://www.example.com
You can also provide multiple configurations using multiple files at different paths. Each file can be a full or partial configuration, and the files can reference components from each other. If the merger of files does not constitute a complete configuration, the user receives an error since required components are not added by default. Pass in multiple file paths at the command line as follows:

otelcol --config=file:/path/to/first/file --config=file:/path/to/second/file
You can also provide configurations using environment variables, HTTP URIs, or YAML paths. For example:

otelcol --config=env:MY_CONFIG_IN_AN_ENVVAR --config=https://server/config.yaml
otelcol --config="yaml:exporters::debug::verbosity: normal"
Tip
When referring to nested keys in YAML paths, make sure to use double colons (::) to avoid confusion with namespaces that contain dots. For example: receivers::docker_stats::metrics::container.cpu.utilization::enabled: false.

To validate a configuration file, use the validate command. For example:

otelcol validate --config=customconfig.yaml
Configuration structure
The structure of any Collector configuration file consists of four classes of pipeline components that access telemetry data:

Receivers 
Processors 
Exporters 
Connectors 
After each pipeline component is configured you must enable it using the pipelines within the service section of the configuration file.

Besides pipeline components you can also configure extensions, which provide capabilities that can be added to the Collector, such as diagnostic tools. Extensions don’t require direct access to telemetry data and are enabled through the service section.

The following is an example of Collector configuration with a receiver, a processor, an exporter, and three extensions.

Warning
While it is generally preferable to bind endpoints to localhost when all clients are local, our example configurations use the “unspecified” address 0.0.0.0 as a convenience. The Collector currently defaults to 0.0.0.0, but the default will be changed to localhost in the near future. For details concerning either of these choices as endpoint configuration value, see Safeguards against denial of service attacks.

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
Note that receivers, processors, exporters and pipelines are defined through component identifiers following the type[/name] format, for example otlp or otlp/2. You can define components of a given type more than once as long as the identifiers are unique. For example:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  otlp/2:
    protocols:
      grpc:
        endpoint: 0.0.0.0:55690

exporters:
  otlp_grpc:
    endpoint: otelcol:4317
    sending_queue:
      batch:
  otlp_grpc/2:
    endpoint: otelcol2:4317
    sending_queue:
      batch:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_grpc]
    traces/2:
      receivers: [otlp/2]
      exporters: [otlp_grpc/2]
    metrics:
      receivers: [otlp]
      exporters: [otlp_grpc]
    logs:
      receivers: [otlp]
      exporters: [otlp_grpc]
The configuration can also include other files, causing the Collector to merge them in a single in-memory representation of the YAML configuration:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters: ${file:exporters.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
With the exporters.yaml file being:

otlp_grpc:
  endpoint: otelcol.observability.svc.cluster.local:443
The final result in memory will be:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp_grpc:
    endpoint: otelcol.observability.svc.cluster.local:443

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
Receivers 
Receivers collect telemetry from one or more sources. They can be pull or push based, and may support one or more data sources.

Receivers are configured in the receivers section. Many receivers come with default settings, so that specifying the name of the receiver is enough to configure it. If you need to configure a receiver or want to change the default configuration, you can do so in this section. Any setting you specify overrides the default values, if present.

Configuring a receiver does not enable it. Receivers are enabled by adding them to the appropriate pipelines within the service section.

The Collector requires one or more receivers. The following example shows various receivers in the same configuration file:

receivers:
  # Data sources: logs
  fluentforward:
    endpoint: 0.0.0.0:8006

  # Data sources: metrics
  hostmetrics:
    scrapers:
      cpu:
      disk:
      filesystem:
      load:
      memory:
      network:
      process:
      processes:
      paging:

  # Data sources: traces
  jaeger:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      thrift_binary:
      thrift_compact:
      thrift_http:

  # Data sources: traces, metrics, logs
  kafka:
    protocol_version: 2.0.0

  # Data sources: traces, metrics
  opencensus:

  # Data sources: traces, metrics, logs
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: cert.pem
          key_file: cert-key.pem
      http:
        endpoint: 0.0.0.0:4318

  # Data sources: metrics
  prometheus:
    config:
      scrape_configs:
        - job_name: otel-collector
          scrape_interval: 5s
          static_configs:
            - targets: [localhost:8888]

  # Data sources: traces
  zipkin:
For detailed receiver configuration, see the receiver README.

Processors 
Processors take the data collected by receivers and modify or transform it before sending it to the exporters. Data processing happens according to rules or settings defined for each processor, which might include filtering, dropping, renaming, or recalculating telemetry, among other operations. The order of the processors in a pipeline determines the order of the processing operations that the Collector applies to the signal.

Processors are optional, although some are recommended.

You can configure processors using the processors section of the Collector configuration file. Any setting you specify overrides the default values, if present.

Configuring a processor does not enable it. Processors are enabled by adding them to the appropriate pipelines within the service section.

The following example shows several default processors in the same configuration file. You can find the full list of processors by combining the list from opentelemetry-collector-contrib and the list from opentelemetry-collector.

processors:
  # Data sources: traces
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: db.statement
        action: delete
      - key: email
        action: hash

  # Data sources: metrics, metrics, logs
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["container.name"] == "app_container_1"'
        - 'resource.attributes["host.name"] == "localhost"'
        - 'name == "app_3"'
      spanevent:
        - 'attributes["grpc"] == true'
        - 'IsMatch(name, ".*grpc.*")'
    metrics:
      metric:
        - 'name == "my.metric" and resource.attributes["my_label"] == "abc123"'
        - 'type == METRIC_DATA_TYPE_HISTOGRAM'
      datapoint:
        - 'metric.type == METRIC_DATA_TYPE_SUMMARY'
        - 'resource.attributes["service.name"] == "my_service_name"'
    logs:
      log_record:
        - 'IsMatch(body, ".*password.*")'
        - 'severity_number < SEVERITY_NUMBER_WARN'

  # Data sources: traces, metrics, logs
  memory_limiter:
    check_interval: 5s
    limit_mib: 4000
    spike_limit_mib: 500

  # Data sources: traces
  resource:
    attributes:
      - key: cloud.zone
        value: zone-1
        action: upsert
      - key: k8s.cluster.name
        from_attribute: k8s-cluster
        action: insert
      - key: redundant-attribute
        action: delete

  # Data sources: traces
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 15

  # Data sources: traces
  span:
    name:
      to_attributes:
        rules:
          - ^\/api\/v1\/document\/(?P<documentId>.*)\/update$
      from_attributes: [db.svc, operation]
      separator: '::'
For detailed processor configuration, see the processor README.

Exporters 
Exporters send data to one or more backends or destinations. Exporters can be pull or push based, and may support one or more data sources.

Each key within the exporters section defines an exporter instance, The key follows the type/name format, where type specifies the exporter type (e.g., otlp, kafka, prometheus), and name (optional) can be appended to provide a unique name for multiple instance of the same type.

Most exporters require configuration to specify at least the destination, as well as security settings, like authentication tokens or TLS certificates. Any setting you specify overrides the default values, if present.

Configuring an exporter does not enable it. Exporters are enabled by adding them to the appropriate pipelines within the service section.

The Collector requires one or more exporters. The following example shows various exporters in the same configuration file:

exporters:
  # Data sources: traces, metrics, logs
  file:
    path: ./filename.json

  # Data sources: traces
  otlp_grpc/jaeger:
    endpoint: jaeger-server:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Data sources: traces, metrics, logs
  kafka:
    protocol_version: 2.0.0

  # Data sources: traces, metrics, logs
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`
  debug:
    verbosity: detailed

  # Data sources: traces, metrics
  opencensus:
    endpoint: otelcol2:55678

  # Data sources: traces, metrics, logs
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      cert_file: cert.pem
      key_file: cert-key.pem

  # Data sources: traces, metrics
  otlp_http:
    endpoint: https://otlp.example.com:4318

  # Data sources: metrics
  prometheus:
    endpoint: 0.0.0.0:8889
    namespace: default

  # Data sources: metrics
  prometheusremotewrite:
    endpoint: http://prometheus.example.com:9411/api/prom/push
    # When using the official Prometheus (running via Docker)
    # endpoint: 'http://prometheus:9090/api/v1/write', add:
    # tls:
    #   insecure: true

  # Data sources: traces
  zipkin:
    endpoint: http://zipkin.example.com:9411/api/v2/spans
Notice that some exporters require x.509 certificates in order to establish secure connections, as described in setting up certificates.

For more information on exporter configuration, see the exporter README.md.

Connectors 
Connectors join two pipelines, acting as both exporter and receiver. A connector consumes data as an exporter at the end of one pipeline and emits data as a receiver at the beginning of another pipeline. The data consumed and emitted may be of the same type or of different data types. You can use connectors to summarize consumed data, replicate it, or route it.

You can configure one or more connectors using the connectors section of the Collector configuration file. By default, no connectors are configured. Each type of connector is designed to work with one or more pairs of data types and may only be used to connect pipelines accordingly.

Configuring a connector doesn’t enable it. Connectors are enabled through pipelines within the service section.

The following example shows the count connector and how it’s configured in the pipelines section. Notice that the connector acts as an exporter for traces and as a receiver for metrics, connecting both pipelines:

receivers:
  foo:

exporters:
  bar:

connectors:
  count:
    spanevents:
      my.prod.event.count:
        description: The number of span events from my prod environment.
        conditions:
          - 'attributes["env"] == "prod"'
          - 'name == "prodevent"'

service:
  pipelines:
    traces:
      receivers: [foo]
      exporters: [count]
    metrics:
      receivers: [count]
      exporters: [bar]
For detailed connector configuration, see the connector README.

Extensions 
Extensions are optional components that expand the capabilities of the Collector to accomplish tasks not directly involved with processing telemetry data. For example, you can add extensions for Collector health monitoring, service discovery, or data forwarding, among others.

You can configure extensions through the extensions section of the Collector configuration file. Most extensions come with default settings, so you can configure them just by specifying the name of the extension. Any setting you specify overrides the default values, if present.

Configuring an extension doesn’t enable it. Extensions are enabled within the service section.

By default, no extensions are configured. The following example shows several extensions configured in the same file:

extensions:
  health_check:
    endpoint: 0.0.0.0:13133
  pprof:
    endpoint: 0.0.0.0:1777
  zpages:
    endpoint: 0.0.0.0:55679
For detailed extension configuration, see the extension README.

Service section
The service section is used to configure what components are enabled in the Collector based on the configuration found in the receivers, processors, exporters, and extensions sections. If a component is configured, but not defined within the service section, then it’s not enabled.

The service section consists of three subsections:

Extensions
Pipelines
Telemetry
Extensions
The extensions subsection consists of a list of desired extensions to be enabled. For example:

service:
  extensions: [health_check, pprof, zpages]
Pipelines
The pipelines subsection is where the pipelines are configured, which can be of the following types:

traces collect and processes trace data.
metrics collect and processes metric data.
logs collect and processes log data.
A pipeline consists of a set of receivers, processors and exporters. Before including a receiver, processor, or exporter in a pipeline, make sure to define its configuration in the appropriate section.

You can use the same receiver, processor, or exporter in more than one pipeline. When a processor is referenced in multiple pipelines, each pipeline gets a separate instance of the processor.

The following is an example of pipeline configuration. Note that the order of processors dictates the order in which data is processed:

service:
  pipelines:
    metrics:
      receivers: [opencensus, prometheus]
      exporters: [opencensus, prometheus]
    traces:
      receivers: [opencensus, jaeger]
      processors: [memory_limiter]
      exporters: [opencensus, zipkin]
As with components, use the type[/name] syntax to create additional pipelines for a given type. Here is an example extending the previous configuration:

service:
  pipelines:
    # ...
    traces:
      # ...
    traces/2:
      receivers: [opencensus]
      exporters: [zipkin]
Telemetry
The telemetry config section is where you can set up observability for the Collector itself. It consists of two subsections: logs and metrics. To learn how to configure these signals, see Activate internal telemetry in the Collector.

Other Information
Environment variables
The use and expansion of environment variables is supported in the Collector configuration. For example to use the values stored on the DB_KEY and OPERATION environment variables you can write the following:

processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY}
        action: ${env:OPERATION}
You can pass defaults to an environment variable using the bash syntax: ${env:DB_KEY:-some-default-var}

processors:
  attributes/example:
    actions:
      - key: ${env:DB_KEY:-mydefault}
        action: ${env:OPERATION:-}
Use $$ to indicate a literal $. For example, representing $DataVisualization would look like the following:

exporters:
  prometheus:
    endpoint: prometheus:8889
    namespace: $$DataVisualization
Proxy support
Exporters that use the net/http package respect the following proxy environment variables:

HTTP_PROXY: Address of the HTTP proxy
HTTPS_PROXY: Address of the HTTPS proxy
NO_PROXY: Addresses that must not use the proxy
If set at Collector start time, exporters, regardless of the protocol, proxy traffic or bypass proxy traffic as defined by these environment variables.

Authentication
Most receivers exposing an HTTP or gRPC port can be protected using the Collector’s authentication mechanism. Similarly, most exporters using HTTP or gRPC clients can add authentication to outgoing requests.

The authentication mechanism in the Collector uses the extensions mechanism, allowing for custom authenticators to be plugged into Collector distributions. Each authentication extension has two possible usages:

As client authenticator for exporters, adding auth data to outgoing requests
As server authenticator for receivers, authenticating incoming connections.
For a list of known authenticators, see the Registry. If you’re interested in developing a custom authenticator, see Building an authenticator extension.

To add a server authenticator to a receiver in the Collector, follow these steps:

Add the authenticator extension and its configuration under .extensions.
Add a reference to the authenticator to .services.extensions, so that it’s loaded by the Collector.
Add a reference to the authenticator under .receivers.<your-receiver>.<http-or-grpc-config>.auth.
The following example uses the OIDC authenticator on the receiver side, making this suitable for a remote Collector that receives data from an OpenTelemetry Collector acting as agent:

extensions:
  oidc:
    issuer_url: http://localhost:8080/auth/realms/opentelemetry
    audience: collector

receivers:
  otlp/auth:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        auth:
          authenticator: oidc

processors:

exporters:
  # NOTE: Prior to v0.86.0 use `logging` instead of `debug`.
  debug:

service:
  extensions:
    - oidc
  pipelines:
    traces:
      receivers:
        - otlp/auth
      processors: []
      exporters:
        - debug
On the agent side, this is an example that makes the OTLP exporter obtain OIDC tokens, adding them to every RPC made to a remote Collector:

extensions:
  oauth2client:
    client_id: agent
    client_secret: some-secret
    token_url: http://localhost:8080/auth/realms/opentelemetry/protocol/openid-connect/token

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:

exporters:
  otlp_grpc/auth:
    endpoint: remote-collector:4317
    auth:
      authenticator: oauth2client

service:
  extensions:
    - oauth2client
  pipelines:
    traces:
      receivers:
        - otlp
      processors: []
      exporters:
        - otlp_grpc/auth
Configuring certificates
In a production environment, use TLS certificates for secure communication or mTLS for mutual authentication. Follow these steps to generate self-signed certificates as in this example. You might want to use your current cert provisioning procedures to procure a certificate for production usage.

Install cfssl and create the following csr.json file:

{
  "hosts": ["localhost", "127.0.0.1"],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "O": "OpenTelemetry Example"
    }
  ]
}
Then run the following commands:

cfssl genkey -initca csr.json | cfssljson -bare ca
cfssl gencert -ca ca.pem -ca-key ca-key.pem csr.json | cfssljson -bare cert
This creates two certificates:

An “OpenTelemetry Example” Certificate Authority (CA) in ca.pem, with the associated key in ca-key.pem
A client certificate in cert.pem, signed by the OpenTelemetry Example CA, with the associated key in cert-key.pem.
Using certificates in the Collector
Once you have the certificates, configure the Collector to use them.

TLS configuration for receivers (server-side)
Configure TLS on a receiver to encrypt incoming connections. Use cert_file and key_file to specify the server certificate:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
      http:
        endpoint: 0.0.0.0:4318
        tls:
          cert_file: /path/to/cert.pem
          key_file: /path/to/cert-key.pem
TLS configuration for exporters (client-side)
Configure TLS on an exporter to encrypt outgoing connections. Use ca_file to verify the server’s certificate:

exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
If you also need to present a client certificate to the server:

exporters:
  otlp_grpc:
    endpoint: otelcol2:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/cert.pem
      key_file: /path/to/cert-key.pem
mTLS configuration (mutual TLS)
For mTLS, both the receiver and the exporter verify each other’s certificates. On the receiver, add client_ca_file to verify client certificates:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
        tls:
          cert_file: /path/to/server-cert.pem
          key_file: /path/to/server-key.pem
          client_ca_file: /path/to/ca.pem
On the exporter, provide both the CA to verify the server and the client certificate:

exporters:
  otlp_grpc:
    endpoint: remote-collector:4317
    tls:
      ca_file: /path/to/ca.pem
      cert_file: /path/to/client-cert.pem
      key_file: /path/to/client-key.pem
Common TLS settings
The following settings are available for TLS configuration:

Setting	Description
ca_file	Path to the CA certificate to verify the peer certificate
cert_file	Path to the TLS certificate
key_file	Path to the TLS private key
client_ca_file	Path to the CA certificate to verify client certificates
insecure	Disable TLS verification (not recommended for production)
insecure_skip_verify	Skip server certificate verification (not recommended)
min_version	Minimum TLS version (for example, 1.2 or 1.3)
max_version	Maximum TLS version
reload_interval	Duration after which the certificate is reloaded
For more details on TLS configuration options, see the configtls documentation.

Override settings
You can override Collector settings using the --set option. The settings you define with this method are merged into the final configuration after all --config sources are resolved and merged.

The following examples show how to override settings inside nested sections:

Simple property
The --set option takes always one key/value pair, and it is used like this: --set key=value. The YAML equivalent of that is:

key: value
Complex nested keys
Use two colons (::) in the pair’s name as key separator to reference nested map values. For example, --set outer::inner=value is translated into this:

outer:
  inner: value
Multiple values
To set multiple values specify multiple –set flags, so --set a=b --set c=d becomes:

a: b
c: d
Array values
Arrays can be expressed by enclosing values in []. For example, --set "key=[a, b, c]" translates to:

key:
  - a
  - b
  - c
If you need to represent more complex data structures, the use of YAML is highly recommended.

Caution
The --set option has the following limitations:

Does not support setting a key that contains a dot ..
Does not support setting a key that contains an equal sign =.
The configuration key separator inside the value part of the property is “::”. For example --set "name={a::b: c}" is equivalent with --set name::a::b=c.
Embedding other configuration providers
One configuration provider can make references to other config providers, like the following:

receivers:
  otlp:
    protocols:
      grpc:

exporters: ${file:otlp-exporter.yaml}

service:
  extensions: []
  pipelines:
    traces:
      receivers: [otlp]
      processors: []
      exporters: [otlp_grpc]
How to check components available in a distribution
Use the sub command build-info. Below is an example:

otelcol components
Sample output:

buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.143.0
receivers:
  - otlp
processors:
  - memory_limiter
exporters:
  - otlp_grpc
  - otlp_http
  - debug
extensions:
  - zpages
How to examine the final configuration
Caution
This command is an experimental functionality. Its behavior may change with no warning.

Use print-config in the default mode (--mode=redacted) and --feature-gates=otelcol.printInitialConfig:

otelcol print-config --config=file:examples/local/otel-config.yaml
Note that by default the configuration will only print when it is valid, and that sensitive information will be redacted. To print a potentially invalid configuration, use --validate=false.

How to view sensitive fields
Use print-config with --mode=unredacted and --feature-gates=otelcol.printInitialConfig:

otelcol print-config --mode=unredacted --config=file:examples/local/otel-config.yaml
How to print the final configuration in JSON format
Caution
This command is an experimental functionality. Its behavior may change with no warning.

Use print-config with --format=json and --feature-gates=otelcol.printInitialConfig. Note that JSON format is considered unstable.

otelcol print-config --format=json --config=file:examples/local/otel-config.yaml



Receivers
List of available OpenTelemetry Collector receivers
Receivers collect telemetry data from various sources and formats. For more information on how to configure receivers, see the Collector configuration documentation.

Note
Components marked with ⚠️ are unmaintained and have no active codeowners. They may not receive regular updates or bug fixes.

Name	Distributions1	Traces2	Metrics2	Logs2
activedirectorydsreceiver	contrib	-	beta	-
aerospikereceiver	contrib	-	alpha	-
apachereceiver	contrib	-	beta	-
apachesparkreceiver	contrib	-	alpha	-
awscloudwatchreceiver	contrib	-	-	alpha
awscontainerinsightreceiver	contrib	-	beta	-
awsecscontainermetricsreceiver	contrib	-	beta	-
awsfirehosereceiver	contrib	-	alpha	alpha
awslambdareceiver	contrib	-	development	development
awss3receiver	contrib	alpha	alpha	alpha
awsxrayreceiver	contrib	beta	-	-
azureblobreceiver	contrib	alpha	-	alpha
azureeventhubreceiver	contrib	beta	beta	beta
azuremonitorreceiver	contrib	-	alpha	-
carbonreceiver	contrib	-	beta	-
chronyreceiver	contrib	-	beta	-
ciscoosreceiver	contrib	-	alpha	-
cloudflarereceiver	contrib	-	-	alpha
cloudfoundryreceiver	contrib	-	beta	development
collectdreceiver	contrib	-	beta	-
couchdbreceiver	contrib	-	beta	-
datadogreceiver	contrib	alpha	alpha	alpha
dockerstatsreceiver	contrib	-	alpha	-
elasticsearchreceiver	contrib	-	beta	-
envoyalsreceiver	contrib	-	-	alpha
expvarreceiver	contrib	-	alpha	-
faroreceiver	contrib	alpha	-	alpha
filelogreceiver	contrib, K8s	-	-	beta
filestatsreceiver	contrib	-	beta	-
flinkmetricsreceiver	contrib	-	alpha	-
fluentforwardreceiver	contrib, K8s	-	-	beta
githubreceiver	contrib	development	alpha	-
gitlabreceiver	contrib	alpha	-	-
googlecloudmonitoringreceiver	contrib	-	alpha	-
googlecloudpubsubpushreceiver	contrib	-	-	development
googlecloudpubsubreceiver	contrib	beta	beta	beta
googlecloudspannerreceiver	contrib	-	beta	-
haproxyreceiver	contrib	-	beta	-
hostmetricsreceiver	contrib, core, K8s	-	beta	development
httpcheckreceiver	contrib, K8s	-	alpha	-
huaweicloudcesreceiver	contrib	-	alpha	-
icmpcheckreceiver	contrib	-	development	-
iisreceiver	contrib	-	beta	-
influxdbreceiver	contrib	-	beta	-
jaegerreceiver	contrib, core, K8s	beta	-	-
jmxreceiver	contrib	-	deprecated	-
journaldreceiver	contrib, K8s	-	-	alpha
k8sclusterreceiver	contrib, K8s	-	beta	development
k8seventsreceiver	contrib, K8s	-	-	alpha
k8slogreceiver ⚠️	contrib	-	-	unmaintained
k8sobjectsreceiver	contrib, K8s	-	-	beta
kafkametricsreceiver	contrib	-	beta	-
kafkareceiver	contrib, core	beta	beta	beta
kubeletstatsreceiver	contrib, K8s	-	beta	-
libhoneyreceiver	contrib	alpha	-	alpha
lokireceiver	contrib	-	-	alpha
macosunifiedloggingreceiver	contrib	-	-	alpha
memcachedreceiver	contrib	-	beta	-
mongodbatlasreceiver	contrib	-	beta	beta
mongodbreceiver	contrib	-	beta	-
mysqlreceiver	contrib	-	beta	development
namedpipereceiver	contrib	-	-	alpha
netflowreceiver	contrib	-	-	alpha
nginxreceiver	contrib	-	beta	-
nopreceiver	contrib, core	beta	beta	beta
nsxtreceiver	contrib	-	alpha	-
ntpreceiver	contrib	-	beta	-
oracledbreceiver	contrib	-	alpha	development
osqueryreceiver	contrib	-	-	development
otelarrowreceiver	contrib, K8s	beta	beta	beta
otlpjsonfilereceiver	contrib	alpha	alpha	alpha
otlpreceiver	contrib, core, K8s, otlp	stable	stable	stable
podmanreceiver	contrib	-	alpha	-
postgresqlreceiver	contrib	-	beta	development
pprofreceiver	contrib	-	-	-
prometheusreceiver	contrib, core, K8s	-	beta	-
prometheusremotewritereceiver	contrib	-	alpha	-
pulsarreceiver	contrib	alpha	alpha	alpha
purefareceiver	contrib	-	alpha	-
purefbreceiver	contrib	-	alpha	-
rabbitmqreceiver	contrib	-	beta	-
receivercreator	contrib, K8s	alpha	beta	alpha
redfishreceiver	contrib	-	development	-
redisreceiver	contrib	-	beta	-
riakreceiver	contrib	-	beta	-
saphanareceiver	contrib	-	alpha	-
signalfxreceiver	contrib	-	deprecated	deprecated
simpleprometheusreceiver	contrib	-	beta	-
skywalkingreceiver	contrib	beta	development	-
snmpreceiver	contrib	-	alpha	-
snowflakereceiver	contrib	-	alpha	-
solacereceiver	contrib	beta	-	-
splunkenterprisereceiver	contrib	-	alpha	-
splunkhecreceiver	contrib	-	beta	beta
sqlqueryreceiver	contrib	-	alpha	development
sqlserverreceiver	contrib	-	beta	development
sshcheckreceiver	contrib	-	beta	-
statsdreceiver	contrib	-	beta	-
stefreceiver	contrib	-	alpha	-
syslogreceiver	contrib	-	-	beta
systemdreceiver	contrib	-	alpha	-
tcpcheckreceiver	contrib	-	alpha	-
tcplogreceiver	contrib	-	-	alpha
tlscheckreceiver	contrib	-	alpha	-
udplogreceiver	contrib	-	-	alpha
vcenterreceiver	contrib	-	alpha	-
vcrreceiver	contrib	development	development	development
wavefrontreceiver	contrib	-	deprecated	-
webhookeventreceiver	contrib	-	-	beta
windowseventlogreceiver	contrib	-	-	alpha
windowsperfcountersreceiver	contrib	-	beta	-
windowsservicereceiver	contrib	-	development	-
yanggrpcreceiver	contrib	-	alpha	-
zipkinreceiver	contrib, core, K8s	beta	-	-
zookeeperreceiver	contrib	-	alpha	-
Shows which distributions (core, contrib, K8s, etc.) include this component.
For details about component stability levels, see the OpenTelemetry Collector component stability definitions.
Feedback
Was this page helpful?

Processors
List of available OpenTelemetry Collector processors
Processors transform, filter, and enrich telemetry data as it flows through the pipeline. For more information on how to configure processors, see the Collector configuration documentation.

Name	Distributions1	Traces2	Metrics2	Logs2
attributesprocessor	contrib, core, K8s	beta	beta	beta
batchprocessor	contrib, core, K8s	beta	beta	beta
coralogixprocessor	contrib	alpha	-	-
cumulativetodeltaprocessor	contrib, K8s	-	beta	-
datadogsemanticsprocessor	contrib	deprecated	-	-
deltatocumulativeprocessor	contrib, K8s	-	alpha	-
deltatorateprocessor	contrib, K8s	-	alpha	-
dnslookupprocessor	contrib	development	development	development
filterprocessor	contrib, core, K8s	alpha	alpha	alpha
geoipprocessor	contrib	alpha	alpha	alpha
groupbyattrsprocessor	contrib, K8s	beta	beta	beta
groupbytraceprocessor	contrib, K8s	beta	-	-
intervalprocessor	contrib, K8s	-	alpha	-
isolationforestprocessor	contrib	alpha	alpha	alpha
k8sattributesprocessor	contrib, K8s	beta	beta	beta
logdedupprocessor	contrib, K8s	-	-	alpha
logstransformprocessor	contrib	-	-	development
lookupprocessor	contrib	-	-	development
memorylimiterprocessor	contrib, core, K8s	beta	beta	beta
metricsgenerationprocessor	contrib	-	alpha	-
metricstarttimeprocessor	contrib	-	beta	-
metricstransformprocessor	contrib, K8s	-	beta	-
probabilisticsamplerprocessor	contrib, core, K8s	beta	-	alpha
redactionprocessor	contrib, K8s	beta	alpha	alpha
remotetapprocessor	contrib, K8s	alpha	alpha	alpha
resourcedetectionprocessor	contrib, K8s	beta	beta	beta
resourceprocessor	contrib, core, K8s	beta	beta	beta
schemaprocessor	contrib	development	development	development
spanprocessor	contrib, core	alpha	-	-
sumologicprocessor	contrib	beta	beta	beta
tailsamplingprocessor	contrib, K8s	beta	-	-
transformprocessor	contrib, K8s	beta	beta	beta
unrollprocessor	contrib	-	-	alpha
Shows which distributions (core, contrib, K8s, etc.) include this component.
For details about component stability levels, see the OpenTelemetry Collector component stability definitions.


Exporters
List of available OpenTelemetry Collector exporters
Exporters send telemetry data to observability backends and destinations. For more information on how to configure exporters, see the Collector configuration documentation.

Note
Components marked with ⚠️ are unmaintained and have no active codeowners. They may not receive regular updates or bug fixes.

Name	Distributions1	Traces2	Metrics2	Logs2
alertmanagerexporter	contrib	development	-	-
alibabacloudlogserviceexporter ⚠️	contrib	unmaintained	unmaintained	unmaintained
awscloudwatchlogsexporter	contrib	-	-	alpha
awsemfexporter	contrib	-	beta	-
awskinesisexporter	contrib	beta	beta	beta
awss3exporter	contrib	alpha	alpha	alpha
awsxrayexporter	contrib	beta	-	-
azureblobexporter	contrib	alpha	alpha	alpha
azuredataexplorerexporter	contrib	beta	beta	beta
azuremonitorexporter	contrib	beta	beta	beta
bmchelixexporter	contrib	-	alpha	-
cassandraexporter	contrib	alpha	-	alpha
clickhouseexporter	contrib	beta	alpha	beta
coralogixexporter	contrib	beta	beta	beta
datadogexporter	contrib	beta	beta	beta
datasetexporter	contrib	alpha	-	alpha
debugexporter	contrib, core, K8s	alpha	alpha	alpha
dorisexporter	contrib	alpha	alpha	alpha
elasticsearchexporter	contrib	beta	development	beta
faroexporter	contrib	alpha	-	alpha
fileexporter	contrib, core, K8s	alpha	alpha	alpha
googlecloudexporter	contrib	beta	beta	beta
googlecloudpubsubexporter	contrib	beta	beta	beta
googlecloudstorageexporter	contrib	development	-	alpha
googlemanagedprometheusexporter	contrib	-	beta	-
honeycombmarkerexporter	contrib	-	-	alpha
influxdbexporter	contrib	beta	beta	beta
kafkaexporter	contrib, core	beta	beta	beta
loadbalancingexporter	contrib, K8s	beta	development	beta
logicmonitorexporter	contrib	alpha	-	alpha
logzioexporter	contrib	beta	-	beta
mezmoexporter	contrib	-	-	beta
nopexporter	contrib, core, K8s	beta	beta	beta
opensearchexporter	contrib	alpha	-	alpha
otelarrowexporter	contrib, K8s	beta	beta	beta
otlpexporter	contrib, core, K8s, otlp	stable	stable	stable
otlphttpexporter	contrib, core, K8s, otlp	stable	stable	stable
prometheusexporter	contrib, core	-	beta	-
prometheusremotewriteexporter	contrib, core	-	beta	-
pulsarexporter	contrib	alpha	alpha	alpha
rabbitmqexporter	contrib	alpha	alpha	alpha
sapmexporter	contrib	deprecated	-	-
sematextexporter	contrib	-	development	development
sentryexporter	contrib	alpha	-	alpha
signalfxexporter	contrib	beta	beta	beta
splunkhecexporter	contrib	beta	beta	beta
stefexporter	contrib	-	alpha	-
sumologicexporter	contrib	beta	beta	beta
syslogexporter	contrib	-	-	alpha
tencentcloudlogserviceexporter	contrib	-	-	beta
tinybirdexporter	contrib	alpha	alpha	alpha
zipkinexporter	contrib, core	beta	-	-
Shows which distributions (core, contrib, K8s, etc.) include this component.
For details about component stability levels, see the OpenTelemetry Collector component stability definitions.


Internal telemetry
You can inspect the health of any OpenTelemetry Collector instance by checking its own internal telemetry. Read on to learn about this telemetry and how to configure it to help you monitor and troubleshoot the Collector.

Warning
The Collector uses the OpenTelemetry SDK declarative configuration schema for configuring how to export its internal telemetry. This schema is still under development and may undergo breaking changes in future releases. We intend to keep supporting older schemas until a 1.0 schema release is available, and offer a transition period for users to update their configurations before dropping pre-1.0 schemas. For details and to track progress see issue #10808.

Activate internal telemetry in the Collector
By default, the Collector exposes its own telemetry in two ways:

Internal metrics are exposed using a Prometheus interface which defaults to port 8888.
Logs are emitted to stderr by default.
Configure resource attributes
The Collector’s automatically attaches the service.name, service.version, and service.instance.id (randomly generated) resource attributes to its internal telemetry signals. These can be disabled by setting the attribute value to null (ex. service.name: null).

If you’d like to add additional resource attributes to the Collector’s internal telemetry signals (traces, metrics, and logs) you can set them under service::telemetry::resource:

service:
  telemetry:
    resource:
      attribute_key: 'attribute_value'
Configure internal metrics
OTLP exporter for internal metrics
You can configure how internal metrics are generated and exposed by the Collector. By default, the Collector generates basic metrics about itself and exposes them using the OpenTelemetry Go Prometheus exporter for scraping at http://127.0.0.1:8888/metrics.

The Collector can push its internal metrics to an OTLP backend via the following configuration:

service:
  telemetry:
    metrics:
      readers:
        - periodic:
            exporter:
              otlp:
                protocol: http/protobuf
                endpoint: https://backend:4318
Prometheus endpoint for internal metrics
Alternatively, you can expose the Prometheus endpoint to one specific or all network interfaces when needed. For containerized environments, you might want to expose this port on a public interface.

Set the Prometheus config under service::telemetry::metrics:

service:
  telemetry:
    metrics:
      readers:
        - pull:
            exporter:
              prometheus:
                host: '0.0.0.0'
                port: 8888
If you want to add additional labels to the Prometheus metrics, you can add them with prometheus::with_resource_constant_labels:

prometheus:
  host: '0.0.0.0'
  port: 8888
  with_resource_constant_labels:
    included:
      - label_key
And then reference the labels in service::telemetry::resource:

resource:
  label_key: label_value
Service address
Internal telemetry configuration changes
As of Collector v0.123.0, the service::telemetry::metrics::address setting is ignored. In earlier versions, it could be configured with:

service:
  telemetry:
    metrics:
      address: 0.0.0.0:8888
Metric verbosity
You can adjust the verbosity of the Collector metrics output by setting the level field to one of the following values:

none: no telemetry is collected.
basic: essential service telemetry.
normal: the default level, adds standard indicators on top of basic.
detailed: the most verbose level, includes dimensions and views.
Each verbosity level represents a threshold at which certain metrics are emitted. For the complete list of metrics, with a breakdown by level, see Lists of internal metrics.

The default level for metrics output is normal. To use another level, set service::telemetry::metrics::level:

service:
  telemetry:
    metrics:
      level: detailed
Metric views
You can further configure how metrics from the Collector are emitted by using views. For example, the following configuration updates the metric named otelcol_process_uptime to emit a new name process_uptime and description:

Note
When configuring the Prometheus exporter for internal metrics manually (using readers), otelcol_process_uptime may be exported as otelcol_process_uptime_seconds_total unless without_type_suffix and without_units are set to true. Use the instrument_name value otelcol_process_uptime (the OTLP name) in views regardless. To control Prometheus-specific suffixes, see Unit suffixes.

service:
  telemetry:
    metrics:
      views:
        - selector:
            instrument_name: otelcol_process_uptime
            instrument_type:
          stream:
            name: process_uptime
            description: The amount of time the Collector has been up
You can also use views to update the resulting aggregation, attributes, and cardinality limits. For the full list of options, see the examples in the OpenTelemetry Configuration schema repository.

Configure internal logs
Log output is found in stderr. You can configure logs in the config service::telemetry::logs. The configuration options are:

Field name	Default value	Description
level	INFO	Sets the minimum enabled logging level. Other possible values are DEBUG, WARN, and ERROR.
development	false	Puts the logger in development mode.
encoding	console	Sets the logger’s encoding. The other possible value is json.
disable_caller	false	Stops annotating logs with the calling function’s file name and line number. By default, all logs are annotated.
disable_stacktrace	false	Disables automatic stacktrace capturing. Stacktraces are captured for logs at WARN level and above in development and at ERROR level and above in production.
sampling::enabled	true	Sets a sampling policy.
sampling::tick	10s	The interval in seconds that the logger applies to each sampling.
sampling::initial	10	The number of messages logged at the start of each sampling::tick.
sampling::thereafter	100	Sets the sampling policy for subsequent messages after sampling::initial messages are logged. When sampling::thereafter is set to N, every Nth message is logged and all others are dropped. If N is zero, the logger drops all messages after sampling::initial messages are logged.
output_paths	["stderr"]	A list of URLs or file paths to write logging output to.
error_output_paths	["stderr"]	A list of URLs or file paths to write logger errors to.
initial_fields		A collection of static key-value pairs added to all log entries to enrich logging context. By default, there is no initial field.
You can also see logs for the Collector on a Linux systemd system using journalctl:

All logs
Errors only
journalctl | grep otelcol
The following configuration can be used to emit internal logs from the Collector to an OTLP/HTTP backend:

service:
  telemetry:
    logs:
      processors:
        - batch:
            exporter:
              otlp:
                protocol: http/protobuf
                endpoint: https://backend:4318
Configure internal traces
The Collector does not expose traces by default, but it can be configured to.

Caution
Internal tracing is an experimental feature, and no guarantees are made as to the stability of the emitted span names and attributes.

The following configuration can be used to emit internal traces from the Collector to an OTLP backend:

service:
  telemetry:
    traces:
      processors:
        - batch:
            exporter:
              otlp:
                protocol: http/protobuf
                endpoint: https://backend:4318
See the example configuration for additional options. Note that the tracer_provider section there corresponds to traces here.

Types of internal telemetry
The OpenTelemetry Collector aims to be a model of observable service by clearly exposing its own operational metrics. Additionally, it collects host resource metrics that can help you understand if problems are caused by a different process on the same host. Specific components of the Collector can also emit their own custom telemetry. In this section, you will learn about the different types of observability emitted by the Collector itself.

Summary of values observable with internal metrics
The Collector emits internal metrics for at least the following values:

Process uptime and CPU time since start.
Process memory and heap usage.
For receivers: Items accepted and refused, per data type.
For processors: Incoming and outgoing items.
For exporters: Items the exporter sent, failed to enqueue, and failed to send, per data type.
For exporters: Queue size and capacity.
Count, duration, and size of HTTP/gRPC requests and responses.
A more detailed list is available in the following sections.

Metric names
This section explains special naming conventions applied to some internal metrics.

otelcol_ prefix
As of Collector v0.106.1, internal metric names are handled differently based on their source:

Metrics generated from Collector components are prefixed with otelcol_.
Metrics generated from instrumentation libraries do not use the otelcol_ prefix by default, unless their metric names are explicitly prefixed.
For Collector versions prior to v0.106.1, all internal metrics emitted using the Prometheus exporter, regardless of their origin, are prefixed with otelcol_. This includes metrics from both Collector components and instrumentation libraries.

_total suffix
By default and unique to Prometheus, the Prometheus exporter adds a _total suffix to summation metrics to follow Prometheus naming conventions, such as otelcol_exporter_send_failed_spans_total. This behavior can be disabled by setting without_type_suffix: true in the Prometheus exporter’s configuration.

If you leave out service::telemetry::metrics::readers in the Collector configuration, the default Prometheus exporter set up by the Collector already has without_type_suffix set to false. However, if you customize the readers and add a Prometheus exporter manually, you must set that option to return to the “raw” metric name. For more information, see the Collector v1.25.0/v0.119.0 release notes.

Internal metrics exported through OTLP do not have this behavior. The internal metrics on this page are listed in OTLP format, such as otelcol_exporter_send_failed_spans.

_seconds and other unit suffixes
The Prometheus exporter appends a unit suffix to metrics that carry a unit. For example, otelcol_process_uptime (unit: seconds) can be exported as otelcol_process_uptime_seconds_total — the _seconds unit suffix is added first, then the _total counter suffix.

The default Prometheus exporter configured by the Collector (when no readers are specified) already sets without_type_suffix and without_units to true for backwards compatibility, so otelcol_process_uptime is used as-is.

However, when you manually configure the Prometheus exporter under service::telemetry::metrics::readers, those options are not set by default. To keep the original, shorter metric names, explicitly set both options to true:

service:
  telemetry:
    metrics:
      readers:
        - pull:
            exporter:
              prometheus:
                host: '0.0.0.0'
                port: 8888
                without_type_suffix: true
                without_units: true
With this configuration, otelcol_process_uptime_seconds_total is exported as otelcol_process_uptime.

Dots (.) v. underscores (_)
http* and rpc* metrics come from instrumentation libraries. Their original names used dots (.). Prior to Collector v0.120.0, internal metrics exposed with Prometheus changed dots (.) to underscores (_) to match Prometheus naming conventions, resulting in metric names that looked like rpc_server_duration.

Versions 0.120.0 and later of the Collector use Prometheus 3.0 scrapers, so the original http* and rpc* metric names with dots are preserved. The internal metrics on this page are listed in their original form, such asrpc.server.duration. For more information, see the Collector v0.120.0 release notes.

Lists of internal metrics
The following tables group each internal metric by level of verbosity: basic, normal, and detailed. Each metric is identified by name and description and categorized by instrumentation type.

basic-level metrics
Metric name	Description	Type
otelcol_exporter_enqueue_failed_
log_records	Number of logs that exporter(s) failed to enqueue.	Counter
otelcol_exporter_enqueue_failed_
metric_points	Number of metric points that exporter(s) failed to enqueue.	Counter
otelcol_exporter_enqueue_failed_
spans	Number of spans that exporter(s) failed to enqueue.	Counter
otelcol_exporter_queue_capacity	Fixed capacity of the sending queue, in batches.	Gauge
otelcol_exporter_queue_size	Current size of the sending queue, in batches.	Gauge
otelcol_exporter_send_failed_
log_records	Number of logs that exporter(s) failed to send to destination.	Counter
otelcol_exporter_send_failed_
metric_points	Number of metric points that exporter(s) failed to send to destination.	Counter
otelcol_exporter_send_failed_
spans	Number of spans that exporter(s) failed to send to destination.	Counter
otelcol_exporter_sent_log_records	Number of logs successfully sent to destination.	Counter
otelcol_exporter_sent_metric_points	Number of metric points successfully sent to destination.	Counter
otelcol_exporter_sent_spans	Number of spans successfully sent to destination.	Counter
otelcol_process_cpu_seconds	Total CPU user and system time in seconds.	Counter
otelcol_process_memory_rss	Total physical memory (resident set size) in bytes.	Gauge
otelcol_process_runtime_heap_
alloc_bytes	Bytes of allocated heap objects (see ‘go doc runtime.MemStats.HeapAlloc’).	Gauge
otelcol_process_runtime_total_
alloc_bytes	Cumulative bytes allocated for heap objects (see ‘go doc runtime.MemStats.TotalAlloc’).	Counter
otelcol_process_runtime_total_
sys_memory_bytes	Total bytes of memory obtained from the OS (see ‘go doc runtime.MemStats.Sys’).	Gauge
otelcol_process_uptime	Uptime of the process in seconds.	Counter
otelcol_processor_incoming_items	Number of items passed to the processor.	Counter
otelcol_processor_outgoing_items	Number of items emitted from the processor.	Counter
otelcol_receiver_accepted_
log_records	Number of logs successfully ingested and pushed into the pipeline.	Counter
otelcol_receiver_accepted_
metric_points	Number of metric points successfully ingested and pushed into the pipeline.	Counter
otelcol_receiver_accepted_spans	Number of spans successfully ingested and pushed into the pipeline.	Counter
otelcol_receiver_refused_
log_records	Number of logs that could not be pushed into the pipeline.	Counter
otelcol_receiver_refused_
metric_points	Number of metric points that could not be pushed into the pipeline.	Counter
otelcol_receiver_refused_spans	Number of spans that could not be pushed into the pipeline.	Counter
otelcol_scraper_errored_
metric_points	Number of metric points the Collector failed to scrape.	Counter
otelcol_scraper_scraped_
metric_points	Number of metric points scraped by the Collector.	Counter
Additional normal-level metrics
Metric name	Description	Type
otelcol_processor_batch_batch_
send_size	Number of units in the batch that was sent.	Histogram
otelcol_processor_batch_batch_size_
trigger_send	Number of times the batch was sent due to a size trigger.	Counter
otelcol_processor_batch_metadata_
cardinality	Number of distinct metadata value combinations being processed.	Counter
otelcol_processor_batch_timeout_
trigger_send	Number of times the batch was sent due to a timeout trigger.	Counter
Batch processor metrics level changes
In Collector v0.99.0, all batch processor metrics were upgraded from basic to normal (current level), except for otelcol_processor_batch_batch_send_size_bytes, which has been detailed since its introduction. Note however that these metrics were inadvertently reverted to basic from v0.109.0 to v0.121.0.

Additional detailed-level metrics
Metric name	Description	Type
http.client.request.body.size	Measures the size of HTTP client request bodies.	Counter
http.client.request.duration	Measures the duration of HTTP client requests.	Histogram
http.server.request.body.size	Measures the size of HTTP server request bodies.	Counter
http.server.request.duration	Measures the duration of HTTP server requests.	Histogram
http.server.response.body.size	Measures the size of HTTP server response bodies.	Counter
otelcol_processor_batch_batch_
send_size_bytes	Number of bytes in the batch that was sent.	Histogram
rpc.client.duration	Measures the duration of outbound RPC.	Histogram
rpc.client.request.size	Measures the size of RPC request messages (uncompressed).	Histogram
rpc.client.requests_per_rpc	Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs.	Histogram
rpc.client.response.size	Measures the size of RPC response messages (uncompressed).	Histogram
rpc.client.responses_per_rpc	Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.	Histogram
rpc.server.duration	Measures the duration of inbound RPC.	Histogram
rpc.server.request.size	Measures the size of RPC request messages (uncompressed).	Histogram
rpc.server.requests_per_rpc	Measures the number of messages received per RPC. Should be 1 for all non-streaming RPCs.	Histogram
rpc.server.response.size	Measures the size of RPC response messages (uncompressed).	Histogram
rpc.server.responses_per_rpc	Measures the number of messages sent per RPC. Should be 1 for all non-streaming RPCs.	Histogram
Note
The http* and rpc* metrics are not covered by the maturity levels below since they are not under the Collector SIG control.

The otelcol_processor_batch_ metrics are unique to the batchprocessor.

The otelcol_receiver_, otelcol_scraper_, otelcol_processor_, and otelcol_exporter_ metrics come from their respective helper packages. As such, some components not using those packages might not emit them.

Events observable with internal logs
The Collector logs the following internal events:

A Collector instance starts or stops.
Data dropping begins due to throttling for a specified reason, such as local saturation, downstream saturation, downstream unavailable, etc.
Data dropping due to throttling stops.
Data dropping begins due to invalid data. A sample of the invalid data is included.
Data dropping due to invalid data stops.
A crash is detected, differentiated from a clean stop. Crash data is included if available.
Telemetry maturity levels
The Collector telemetry levels apply to all first-party telemetry produced by the Collector. Third-party libraries, including those of OpenTelemetry Go, are not covered by these maturity levels.

Traces
Tracing instrumentation is still under active development, and changes might be made to span names, attached attributes, instrumented endpoints, or other aspects of the telemetry. Until this feature graduates to stable, there are no guarantees of backwards compatibility for tracing instrumentation.

Metrics
The Collector’s first-party metrics follow this lifecycle:

StabilityLevels

In Development

Alpha

Beta

Stable

Deprecated

Removed

The stability levels follow Semantic Conventions guidance, derived from OTEP-0232. Collector metrics skip the release_candidate level.

Note that the deprecated and deleted stages are lifecycle states, not stability levels.

Third-party metrics, including those generated by OpenTelemetry Go instrumentation libraries, are not covered by these maturity levels.

Development
Development metrics are still under active development and may change in any release.

Alpha
Alpha metrics have no stability guarantees. These metrics can be modified or deleted at any time.

Beta
Beta metrics may still change between releases, but component owners should try to minimize breaking changes. This stage encourages broader usage and is the final step before stable.

Stable
Stable metrics are guaranteed to not change. This means:

A stable metric without a deprecated signature will not be deleted or renamed.
A stable metric’s type and attributes will not be modified.
Deprecated
Deprecated metrics are slated for deletion but are still available for use. The description of these metrics include an annotation about the version in which they became deprecated. For example:

Before deprecation:

# HELP otelcol_exporter_queue_size this counts things
# TYPE otelcol_exporter_queue_size counter
otelcol_exporter_queue_size 0
After deprecation:

# HELP otelcol_exporter_queue_size (Deprecated since 1.15.0) this counts things
# TYPE otelcol_exporter_queue_size counter
otelcol_exporter_queue_size 0
Deleted
Deleted metrics are no longer published and cannot be used.

Logs
Individual log entries and their formatting might change from one release to the next. There are no stability guarantees at this time.

Use internal telemetry to monitor the Collector
This section recommends best practices for monitoring the Collector using its own telemetry.

Monitoring
Queue length
Most exporters provide a queue and/or retry mechanism that is recommended for use in any production deployment of the Collector.

The otelcol_exporter_queue_capacity metric indicates the capacity, in batches, of the sending queue. The otelcol_exporter_queue_size metric indicates the current size of the sending queue. Use these two metrics to check if the queue capacity can support your workload.

Using the following three metrics, you can identify the number of spans, metric points, and log records that failed to reach the sending queue:

otelcol_exporter_enqueue_failed_spans
otelcol_exporter_enqueue_failed_metric_points
otelcol_exporter_enqueue_failed_log_records
These failures could be caused by a queue filled with unsettled elements. You might need to decrease your sending rate or horizontally scale Collectors.

The queue or retry mechanism also supports logging for monitoring. Check the logs for messages such as Dropping data because sending_queue is full.

Receive failures
Sustained rates of otelcol_receiver_refused_log_records, otelcol_receiver_refused_spans, and otelcol_receiver_refused_metric_points indicate that too many errors were returned to clients. Depending on the deployment and the clients’ resilience, this might indicate clients’ data loss.

Sustained rates of otelcol_exporter_send_failed_log_records, otelcol_exporter_send_failed_spans, and otelcol_exporter_send_failed_metric_points indicate that the Collector is not able to export data as expected. These metrics do not inherently imply data loss since there could be retries. But a high rate of failures could indicate issues with the network or backend receiving the data.

Data flow
You can monitor data ingress with the otelcol_receiver_accepted_log_records, otelcol_receiver_accepted_spans, and otelcol_receiver_accepted_metric_points metrics and data egress with the otelcol_exporter_sent_log_records, otelcol_exporter_sent_spans, and otelcol_exporter_sent_metric_points metrics.

Troubleshooting
Recommendations for troubleshooting the Collector
On this page, you can learn how to troubleshoot the health and performance of the OpenTelemetry Collector.

Troubleshooting tools
The Collector provides a variety of metrics, logs, and extensions for debugging issues.

Internal telemetry
You can configure and use the Collector’s own internal telemetry to monitor its performance.

Local exporters
For certain types of issues, such as configuration verification and network debugging, you can send a small amount of test data to a Collector configured to output to local logs. Using a local exporter, you can inspect the data being processed by the Collector.

For live troubleshooting, consider using the debug exporter, which can confirm that the Collector is receiving, processing, and exporting data. For example:

receivers:
  zipkin:
exporters:
  debug:
service:
  pipelines:
    traces:
      receivers: [zipkin]
      processors: []
      exporters: [debug]
To begin testing, generate a Zipkin payload. For example, you can create a file called trace.json that contains:

[
  {
    "traceId": "5982fe77008310cc80f1da5e10147519",
    "parentId": "90394f6bcffb5d13",
    "id": "67fae42571535f60",
    "kind": "SERVER",
    "name": "/m/n/2.6.1",
    "timestamp": 1516781775726000,
    "duration": 26000,
    "localEndpoint": {
      "serviceName": "api"
    },
    "remoteEndpoint": {
      "serviceName": "apip"
    },
    "tags": {
      "data.http_response_code": "201"
    }
  }
]
With the Collector running, send this payload to the Collector:

curl -X POST localhost:9411/api/v2/spans -H'Content-Type: application/json' -d @trace.json
You should see a log entry like the following:

2023-09-07T09:57:43.468-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
You can also configure the debug exporter so the entire payload is printed:

exporters:
  debug:
    verbosity: detailed
If you re-run the previous test with the modified configuration, the log output looks like this:

2023-09-07T09:57:12.820-0700    info    TracesExporter  {"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": 2}
2023-09-07T09:57:12.821-0700    info    ResourceSpans #0
Resource SchemaURL: https://opentelemetry.io/schemas/1.4.0
Resource attributes:
     -> service.name: Str(telemetrygen)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope telemetrygen
Span #0
    Trace ID       : 0c636f29e29816ea76e6a5b8cd6601cf
    Parent ID      : 1a08eba9395c5243
    ID             : 10cebe4b63d47cae
    Name           : okey-dokey
    Kind           : Internal
    Start time     : 2023-09-07 16:57:12.045933 +0000 UTC
    End time       : 2023-09-07 16:57:12.046058 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> span.kind: Str(server)
     -> net.peer.ip: Str(1.2.3.4)
     -> peer.service: Str(telemetrygen)
Check Collector components
Use the following sub-command to list the available components in a Collector distribution, including their stability levels. Please note that the output format might change across versions.

otelcol components
Sample output:

buildinfo:
  command: otelcol
  description: OpenTelemetry Collector
  version: 0.96.0
receivers:
  - name: opencensus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Beta
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
  - name: zipkin
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Beta
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
processors:
  - name: resource
    stability:
      logs: Beta
      metrics: Beta
      traces: Beta
  - name: span
    stability:
      logs: Undefined
      metrics: Undefined
      traces: Alpha
  - name: probabilistic_sampler
    stability:
      logs: Alpha
      metrics: Undefined
      traces: Beta
exporters:
  - name: otlp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: otlphttp
    stability:
      logs: Beta
      metrics: Stable
      traces: Stable
  - name: debug
    stability:
      logs: Development
      metrics: Development
      traces: Development
  - name: prometheus
    stability:
      logs: Undefined
      metrics: Beta
      traces: Undefined
connectors:
  - name: forward
    stability:
      logs-to-logs: Beta
      logs-to-metrics: Undefined
      logs-to-traces: Undefined
      metrics-to-logs: Undefined
      metrics-to-metrics: Beta
      traces-to-traces: Beta
extensions:
  - name: zpages
    stability:
      extension: Beta
  - name: health_check
    stability:
      extension: Beta
  - name: pprof
    stability:
      extension: Beta
Extensions
Here is a list of extensions you can enable for debugging the Collector.

Performance Profiler (pprof)
The pprof extension, which is available locally on port 1777, allows you to profile the Collector as it runs. This is an advanced use-case that should not be needed in most circumstances.

zPages
The zPages extension, which is exposed locally on port 55679, can be used to inspect live data from the Collector’s receivers and exporters.

The TraceZ page, exposed at /debug/tracez, is useful for debugging trace operations, such as:

Latency issues. Find the slow parts of an application.
Deadlocks and instrumentation problems. Identify running spans that don’t end.
Errors. Determine what types of errors are occurring and where they happen.
Note that zpages might contain error logs that the Collector does not emit itself.

For containerized environments, you might want to expose this port on a public interface instead of just locally. The endpoint can be configured using the extensions configuration section:

extensions:
  zpages:
    endpoint: 0.0.0.0:55679
Checklist for debugging complex pipelines
It can be difficult to isolate problems when telemetry flows through multiple Collectors and networks. For each “hop” of telemetry through a Collector or other component in your pipeline, it’s important to verify the following:

Are there error messages in the logs of the Collector?
How is the telemetry being ingested into this component?
How is the telemetry being modified (for example, sampling or redacting) by this component?
How is the telemetry being exported from this component?
What format is the telemetry in?
How is the next hop configured?
Are there any network policies that prevent data from getting in or out?
Troubleshooting in Kubernetes environments
When running the OpenTelemetry Collector on Kubernetes, you can use ephemeral debug containers to investigate Collector-related issues.

Common Collector issues
This section covers how to resolve common Collector issues.

Collector is experiencing data issues
The Collector and its components might experience data issues.

Collector is dropping data
The Collector might drop data for a variety of reasons, but the most common are:

The Collector is improperly sized, resulting in an inability to process and export the data as fast as it is received.
The exporter destination is unavailable or accepting the data too slowly.
To mitigate drops, configure the queued retry options on enabled exporters, in particular the Sending queue batch settings.

Collector is not receiving data
The Collector might not receive data for the following reasons:

A network configuration issue.
An incorrect receiver configuration.
An incorrect client configuration.
The receiver is defined in the receivers section but not enabled in any pipelines.
Check the Collector’s logs as well as zPages for potential issues.

Collector is not processing data
Most processing issues result from of a misunderstanding of how the processor works or a misconfiguration of the processor. For example:

The attributes processor works only for “tags” on spans. The span name is handled by the span processor.
Processors for trace data (except tail sampling) work only on individual spans.
Collector is not exporting data
The Collector might not export data for the following reasons:

A network configuration issue.
An incorrect exporter configuration.
The destination is unavailable.
Check the Collector’s logs as well as zPages for potential issues.

Exporting data often does not work because of a network configuration issue, such as a firewall, DNS, or proxy issue. Note that the Collector does have proxy support.

Collector is experiencing control issues
The Collector might experience failed startups or unexpected exits or restarts.

Collector exits or restarts
The Collector might exit or restart due to:

Memory pressure from a missing or misconfigured memory_limiter processor.
Improper sizing for load.
Improper configuration. For example, a queue sized to be larger than available memory.
Infrastructure resource limits. For example, Kubernetes.
Collector fails to start in Windows Docker containers
With v0.90.1 and earlier, the Collector might fail to start in a Windows Docker container, producing the error message The service process could not connect to the service controller. In this case, the NO_WINDOWS_SERVICE=1 environment variable must be set to force the Collector to start as if it were running in an interactive terminal, without attempting to run as a Windows service.

Collector is experiencing configuration issues
The Collector might experience problems due to configuration issues.

Null maps
During configuration resolution of multiple configs, values in earlier configs are removed in favor of later configs, even if the later value is null. You can fix this issue by

Using {} to represent an empty map, such as processors: {} instead of processors:.
Omitting empty configurations such as processors: from the configuration.
See confmap troubleshooting for more information.

Feedback
Was this page helpful?



Build a receiver
OpenTelemetry defines distributed tracing as:

Traces that track the progression of a single request, known as a trace, as it is handled by services that make up an application. The request may be initiated by a user or an application. Distributed tracing is a form of tracing that traverses process, network, and security boundaries.

Although distributed traces are defined in an application-centric way, you can think of them as a timeline for any request that moves through your system. Each distributed trace shows how long a request took from start to finish and breaks down the steps taken to complete it.

If your system generates tracing telemetry, you can configure your OpenTelemetry Collector with a trace receiver designed to receive and convert that telemetry. The receiver converts your data from its original format into the OpenTelemetry trace model so the Collector can process it.

To implement a trace receiver, you need the following:

A Config implementation so the trace receiver can gather and validate its configurations in the Collector config.yaml.

A receiver.Factory implementation so the Collector can properly instantiate the trace receiver component.

A receiver.Traces implementation that collects the telemetry, converts it to the internal trace representation, and passes the telemetry to the next consumer in the pipeline.

This tutorial shows you how to create a trace receiver called tailtracer that simulates a pull operation and generates traces as an outcome of that operation.

Setting up receiver development and testing environment
First, use the Building a Custom Collector tutorial to create a Collector instance named otelcol-dev; all you need is to copy the builder-config.yaml described in Configure the OpenTelemetry Collector Builder and run the builder. As an outcome, you should now have a folder structure like this:

.
├── builder-config.yaml
├── ocb
└── otelcol-dev
    ├── components.go
    ├── components_test.go
    ├── go.mod
    ├── go.sum
    ├── main.go
    ├── main_others.go
    ├── main_windows.go
    └── otelcol-dev
To properly test your trace receiver, you may need a distributed tracing backend so the Collector can send the telemetry to it. We will be using Jaeger. If you don’t have a Jaeger instance running, you can easily start one using Docker with the following command:

docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 14317:4317 \
  -p 14318:4318 \
  jaegertracing/all-in-one:1.41
Once the container is up and running, you can access Jaeger UI via this URL: http://localhost:16686/

Now, create a Collector config file named config.yaml to set up the Collector components and pipelines.

touch config.yaml
For now, you just need a basic traces pipeline with the otlp receiver and the otlp and debug exporters. Here is what your config.yaml file should look like:

config.yaml

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true
    sending_queue:
      batch:

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
Note
Here, we use the insecure flag in the otlp exporter config for simplicity; you should use TLS certificates for secure communication or mTLS for mutual authentication when running the Collector in production, by following this guide.

To verify that the Collector is properly set up, run this command:

./otelcol-dev/otelcol-dev --config config.yaml
The output may look like this:

2023-11-08T18:38:37.183+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-08T18:38:37.185+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-08T18:38:37.185+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-08T18:38:37.186+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-08T18:38:37.186+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-08T18:38:37.186+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}

<OMITTED>

2023-11-08T18:38:37.189+0800	info	service@v0.88.0/service.go:169	Everything is ready. Begin running and processing data.
2023-11-08T18:38:37.189+0800	info	zapgrpc/zapgrpc.go:178	[core] [Server #3 ListenSocket #4] ListenSocket created	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1 SubChannel #2] Subchannel Connectivity change to READY	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [pick-first-lb 0x140005efdd0] Received SubConn state update: 0x140005eff80, {ConnectivityState:READY ConnectionError:<nil>}	{"grpc_log": true}
2023-11-08T18:38:37.195+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
If everything went well, the Collector instance should be up and running.

You may use the telemetrygen to further verify the setup. For example, open another console and run the following commands:

go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest

telemetrygen traces --otlp-insecure --traces 1
You should be able to see detailed logs in the console and the traces in Jaeger UI via this URL: http://localhost:16686/.

Press Ctrl + C to stop the Collector instance in the Collector console.

Setting up Go module
Every Collector component should be created as a Go module. Let’s create a tailtracer folder to host our receiver project and initialize it as Go module.

mkdir tailtracer
cd tailtracer
go mod init github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer
Note
The module path above is a mock path, which can be your desired private or public path. See the initial trace-receiver code.

It is recommended to enable Go Workspaces since we’re going to manage multiple Go modules: the otelcol-dev and tailtracer, and possibly more components over time.

cd ..
go work init
go work use otelcol-dev
go work use tailtracer
Designing and validating receiver settings
A receiver may have some configurable settings, which can be set via the Collector config file.

The tailtracer receiver will have the following settings:

interval: a string representing the time interval (in minutes) between telemetry pull operations.
number_of_traces: the number of mock traces generated for each interval.
Here is what the tailtracer receiver settings will look like:

receivers:
  tailtracer: # this line represents the ID of your receiver
    interval: 1m
    number_of_traces: 1
Create a file named config.go under the folder tailtracer where you will write all the code to support your receiver settings.

touch tailtracer/config.go
To implement the configuration aspects of a receiver, you need to create a Config struct. Add the following code to your config.go file:

package tailtracer

type Config struct{

}
To be able to give your receiver access to its settings, the Config struct must have a field for each of the receiver’s settings.

Here is what the config.go file should look like after you implemented the requirements above:

tailtracer/config.go

package tailtracer

// Config represents the receiver config settings in the Collector config.yaml
type Config struct {
   Interval    string `mapstructure:"interval"`
   NumberOfTraces int `mapstructure:"number_of_traces"`
}
Check your work
Added the Interval and the NumberOfTraces fields to properly have access to their values from the config.yaml.
Now that you have access to the settings, you can provide any kind of validation needed for those values by implementing the Validate method according to the optional ConfigValidator interface.

In this case, the interval value will be optional (we will look at generating default values later). But when defined, it should be at least 1 minute (1m) and the number_of_traces will be a mandatory value. Here is what the config.go looks like after implementing the Validate method:

tailtracer/config.go

package tailtracer

import (
	"fmt"
	"time"
)

// Config represents the receiver config settings in the Collector config.yaml
type Config struct {
	Interval       string `mapstructure:"interval"`
	NumberOfTraces int    `mapstructure:"number_of_traces"`
}

// Validate checks if the receiver configuration is valid
func (cfg *Config) Validate() error {
	interval, _ := time.ParseDuration(cfg.Interval)
	if interval.Minutes() < 1 {
		return fmt.Errorf("when defined, the interval has to be set to at least 1 minute (1m)")
	}

	if cfg.NumberOfTraces < 1 {
		return fmt.Errorf("number_of_traces must be greater or equal to 1")
	}
	return nil
}
Check your work
Imported the fmt package to properly format print error messages.
Added the Validate method to the Config struct to check if the interval setting value is at least 1 minute (1m), and if the number_of_traces setting value is greater or equal to 1. If that is not true, the Collector will generate an error during its startup process and display the message accordingly.
If you want to take a closer look at the structs and interfaces involved in the configuration aspects of a component, refer to the component/config.go file inside the Collector GitHub project.

Implementing the receiver.Factory interface
The tailtracer receiver must provide a receiver.Factory implementation. Although the receiver.Factory interface is defined in the receiver/receiver.go file within the Collector project, the right way to implement it is by using the functions available in the go.opentelemetry.io/collector/receiver package.

Create a file named factory.go:

touch tailtracer/factory.go
Now, let’s follow the convention and add a function named NewFactory() that will be responsible for instantiating the tailtracer factory. Go ahead and add the following code to your factory.go file:

package tailtracer

import (
	"go.opentelemetry.io/collector/receiver"
)

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return nil
}
To instantiate your tailtracer receiver factory, you will use the following function from the receiver package:

func NewFactory(cfgType component.Type, createDefaultConfig component.CreateDefaultConfigFunc, options ...FactoryOption) Factory
The receiver.NewFactory() instantiates and returns a receiver.Factory and it requires the following parameters:

component.Type: a unique string identifier for your receiver across all Collector components.

component.CreateDefaultConfigFunc: a reference to a function that returns the component.Config instance for your receiver.

...FactoryOption: the slice of receiver.FactoryOptions that will determine what type of signal your receiver is capable of processing.

Let’s now implement the code to support all the parameters required by receiver.NewFactory().

Identifying and providing default settings
Previously, we mentioned that the interval setting for the tailtracer receiver would be optional. You will need to provide a default value for it so it can be used as part of the default settings.

Go ahead and add the following code to your factory.go file:

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)
As for default settings, you just need to add a function that returns a component.Config holding the default configurations for the tailtracer receiver.

To accomplish that, go ahead and add the following code to your factory.go file:

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}
After these two changes you will notice a few imports are missing, so here is what your factory.go file should look like with the proper imports:

tailtracer/factory.go

package tailtracer

import (
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return nil
}
Check your work
Imported the time package to support the time.Duration type for the defaultInterval.
Imported the go.opentelemetry.io/collector/component package, which is where component.Config is declared.
Imported the go.opentelemetry.io/collector/receiver package, which is where receiver.Factory is declared.
Added a time.Duration constant called defaultInterval to represent the default value for our receiver’s Interval setting. We will be setting the default value for 1 minute, hence the assignment of 1 * time.Minute as its value.
Added a function named createDefaultConfig, which is responsible for returning a component.Config implementation, which in this case is going to be an instance of our tailtracer.Config struct.
The tailtracer.Config.Interval field was initialized with the defaultInterval constant.
Specifying the receiver’s capabilities
A receiver component can process traces, metrics, and logs. The receiver’s factory is responsible for specifying the capabilities that the receiver would provide.

Given that tracing is the subject of this tutorial, we will enable the tailtracer receiver to work with traces only. The receiver package provides the following function and type to help the factory describe the trace processing capabilities:

func WithTraces(createTracesReceiver CreateTracesFunc, sl component.StabilityLevel) FactoryOption
The receiver.WithTraces() instantiates and returns a receiver.FactoryOption and it requires the following parameters:

createTracesReceiver: A reference to a function that matches the receiver.CreateTracesFunc type. The receiver.CreateTracesFunc type is a pointer to a function that is responsible for instantiating and returning a receiver.Traces instance, and it requires the following parameters:
context.Context: the reference to the Collector context.Context, so your trace receiver can properly manage its execution context.
receiver.Settings: the reference to some of the Collector settings under which your receiver is created.
component.Config: the reference for the receiver config settings passed by the Collector to the factory so it can properly read its settings from the Collector config.
consumer.Traces: the reference to the next consumer.Traces in the pipeline, which is where received traces will go. This is either a processor or an exporter.
Start by adding the bootstrap code to properly implement the receiver.CreateTracesFunc function pointer. Go ahead and add the following code to your factory.go file:

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}
You now have all the necessary components to successfully instantiate your receiver factory using the receiver.NewFactory function. Go ahead and update your NewFactory() function in the factory.go file as follows:

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
After these changes, you will notice a few imports are missing, so here is what your factory.go file should look like with the proper imports:

tailtracer/factory.go

package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {
	return nil, nil
}

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
Check your work
Imported the context package to support the context.Context type referenced in the createTracesReceiver function.
Imported the go.opentelemetry.io/collector/consumer package to support the consumer.Traces type referenced in the createTracesReceiver function.
Updated the NewFactory() function so it returns the receiver.Factory generated by the receiver.NewFactory() call with the required parameters. The generated receiver factory will be capable of processing traces via the call to receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha)
Implementing the receiver component
All the receiver APIs are currently declared in the receiver/receiver.go file in the Collector project. Open the file and take a minute to browse through all the interfaces.

Notice that receiver.Traces (and its siblings receiver.Metrics and receiver.Logs) at this point, doesn’t describe any specific methods other than the ones it “inherits” from component.Component.

It may feel weird, but remember, the Collector API was meant to be extensible. The components and their signals may evolve in different ways, so the role of those interfaces exists to help support that.

To create a receiver.Traces, you need to implement the following methods described by component.Component interface:

Start(ctx context.Context, host Host) error
Shutdown(ctx context.Context) error
Both methods act as event handlers used by the Collector to communicate with its components as part of their lifecycle.

The Start() method represents a signal of the Collector telling the component to start its processing. As part of the event, the Collector will pass the following information:

context.Context: Most of the time, a receiver will be processing a long-running operation, so the recommendation is to ignore this context and actually create a new one from context.Background().
Host: The host is meant to enable the receiver to communicate with the Collector host once it is up and running.
The Shutdown() method represents a signal of the Collector telling the component that the service is getting shutdown and as such, the component should stop its processing and make all the necessary cleanup work required:

context.Context: the context passed by the Collector as part of the shutdown operation.
You will start the implementation by creating a new file called trace-receiver.go in tailtracer folder:

touch tailtracer/trace-receiver.go
And then add the declaration to a type called tailtracerReceiver as follows:

type tailtracerReceiver struct{

}
Now that you have the tailtracerReceiver type, you can implement the Start() and Shutdown() methods so the receiver type can be compliant with the receiver.Traces interface.

tailtracer/trace-receiver.go

package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	return nil
}
Check your work
Imported the context package which is where the Context type and functions are declared.
Imported the go.opentelemetry.io/collector/component package which is where the Host type is declared.
Added a bootstrap implementation of the Start(ctx context.Context, host component.Host) method to comply with the receiver.Traces interface.
Added a bootstrap implementation of the Shutdown(ctx context.Context) method to comply with the receiver.Traces interface.
The Start() method is passing 2 references (context.Context and component.Host) that your receiver may need to keep so they can be used as part of its processing operations.

The context.Context reference should be used for creating a new context to support the receiver processing operations. You will need to decide the best way to handle context cancellation so you can finalize it properly as part of the component’s shutdown in the Shutdown() method.

The component.Host can be useful during the whole lifecycle of the receiver so keep that reference in the tailtracerReceiver type.

Here is what the tailtracerReceiver type declaration will look like after you include the fields for keeping the references suggested above:

type tailtracerReceiver struct {
	host   component.Host
	cancel context.CancelFunc
}
Now you need to update the Start() method so the receiver can properly initialize its own processing context, keep the cancellation function in the cancel field, and initialize its host field value. You will also update the Stop() method to finalize the context by calling the cancel function.

Here is what the trace-receiver.go file looks like after making the changes:

tailtracer/trace-receiver.go

package tailtracer

import (
	"context"
	"go.opentelemetry.io/collector/component"
)

type tailtracerReceiver struct {
	host   component.Host
	cancel context.CancelFunc
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	if tailtracerRcvr.cancel != nil {
		tailtracerRcvr.cancel()
	}
	return nil
}
Check your work
Updated the Start() method by adding the initialization to the host field with the component.Host reference passed by the Collector.

Set the cancel function field with the cancellation based on a new context created with context.Background() (according to the Collector API documentation suggestions).
Updated the Shutdown() method by adding a call to the cancel() context cancellation function.
Keeping information passed by the receiver’s factory
Now that you have implemented the receiver.Traces interface methods, your tailtracer receiver component is ready to be instantiated and returned by its factory.

Open the tailtracer/factory.go file and navigate to the createTracesReceiver() function. Notice that the factory will pass references as part of the createTracesReceiver() function parameters that your receiver requires to work properly. These include its configuration settings (component.Config), the next Consumer in the pipeline that will consume the generated traces (consumer.Traces), and the Collector logger. This is so that the tailtracer receiver can add meaningful events to it (receiver.Settings).

Given that all this information will only be made available to the receiver at the moment it is instantiated by the factory, the tailtracerReceiver type will need fields to keep that information and use it in other stages of its lifecycle.

Here is what the trace-receiver.go file looks like with the updated tailtracerReceiver type declaration:

tailtracer/trace-receiver.go

package tailtracer

import (
	"context"
	"time"
	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.uber.org/zap"
)

type tailtracerReceiver struct {
	host         component.Host
	cancel       context.CancelFunc
	logger       *zap.Logger
	nextConsumer consumer.Traces
	config       *Config
}

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}

func (tailtracerRcvr *tailtracerReceiver) Shutdown(ctx context.Context) error {
	if tailtracerRcvr.cancel != nil {
		tailtracerRcvr.cancel()
	}
	return nil
}
Check your work
Imported the go.opentelemetry.io/collector/consumer which is where the pipeline’s consumer types and interfaces are declared.
Imported the go.uber.org/zap package, which is what the Collector uses for its debugging capabilities.
Added a zap.Logger field named logger so we can have access to the Collector logger reference from within the receiver.
Added a consumer.Traces field named nextConsumer so we can push the traces generated by the tailtracer receiver to the next consumer, declared in the Collector pipeline.
Added a Config field named config so we can have access to receiver’s configuration settings defined in the Collector config.
Added a variable named interval that is initialized as a time.Duration based on the value of the interval settings of the tailtracer receiver, defined in the Collector config.
Added a go func() to implement the ticker mechanism so the receiver can generate traces every time the ticker reaches the amount of time specified by the interval variable.
Used the tailtracerRcvr.logger field to generate an info message every time the receiver is supposed to generate traces.
The tailtracerReceiver type is ready to be instantiated and will keep all meaningful information passed by its factory.

Open the tailtracer/factory.go file and navigate to the createTracesReceiver() function.

The receiver is only instantiated if it is declared as a component in a pipeline, and the factory is responsible to make sure the next consumer (either a processor or exporter) in the pipeline is valid. Otherwise, it should generate an error.

The createTracesReceiver() function will need a guard clause to make that validation.

You will also need variables to properly initialize the config and the logger fields of the tailtracerReceiver instance.

Here is what the factory.go file looks like with the updated createTracesReceiver() function:

tailtracer/factory.go

package tailtracer

import (
	"context"
	"time"

	"go.opentelemetry.io/collector/component"
	"go.opentelemetry.io/collector/consumer"
	"go.opentelemetry.io/collector/receiver"
)

var (
	typeStr         = component.MustNewType("tailtracer")
)

const (
	defaultInterval = 1 * time.Minute
)

func createDefaultConfig() component.Config {
	return &Config{
		Interval: string(defaultInterval),
	}
}

func createTracesReceiver(_ context.Context, params receiver.Settings, baseCfg component.Config, consumer consumer.Traces) (receiver.Traces, error) {

	logger := params.Logger
	tailtracerCfg := baseCfg.(*Config)

	traceRcvr := &tailtracerReceiver{
		logger:       logger,
		nextConsumer: consumer,
		config:       tailtracerCfg,
	}

	return traceRcvr, nil
}

// NewFactory creates a factory for tailtracer receiver.
func NewFactory() receiver.Factory {
	return receiver.NewFactory(
		typeStr,
		createDefaultConfig,
		receiver.WithTraces(createTracesReceiver, component.StabilityLevelAlpha))
}
Check your work
Added a variable called logger and initialized it with the Collector logger that is available as a field named Logger, in the receiver.Settings reference.
Added a variable called tailtracerCfg and initialized it by casting the component.Config reference to the tailtracer receiver Config.
Added a variable called traceRcvr and initialized it with the tailtracerReceiver instance using the factory information stored in the variables.
Updated the return statement to include the traceRcvr instance.
So far, the skeleton of the receiver has been fully implemented.

Updating the Collector initialization process with the receiver
For the receiver to participate in the Collector pipelines, we need to make some updates in the generated otelcol-dev/components.go file where all the Collector components are registered and instantiated.

The tailtracer receiver factory instance has to be added to the factories map so the Collector can load it properly as part of its initialization process.

Here is what the components.go file looks like after making the changes to support that:

otelcol-dev/components.go

// Code generated by "go.opentelemetry.io/collector/cmd/builder". DO NOT EDIT.

package main

import (
	"go.opentelemetry.io/collector/exporter"
	"go.opentelemetry.io/collector/extension"
	"go.opentelemetry.io/collector/otelcol"
	"go.opentelemetry.io/collector/processor"
	"go.opentelemetry.io/collector/receiver"
	debugexporter "go.opentelemetry.io/collector/exporter/debugexporter"
	otlpexporter "go.opentelemetry.io/collector/exporter/otlpexporter"
	otlpreceiver "go.opentelemetry.io/collector/receiver/otlpreceiver"
	tailtracer "github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer" // newly added line
)

func components() (otelcol.Factories, error) {
	var err error
	factories := otelcol.Factories{}

	factories.Extensions, err = otelcol.MakeFactoryMap[extension.Factory](
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Receivers, err = otelcol.MakeFactoryMap[receiver.Factory](
		otlpreceiver.NewFactory(),
		tailtracer.NewFactory(), // newly added line
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Exporters, err = otelcol.MakeFactoryMap[exporter.Factory](
		debugexporter.NewFactory(),
		otlpexporter.NewFactory(),
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	factories.Processors, err = otelcol.MakeFactoryMap[processor.Factory](
	)
	if err != nil {
		return otelcol.Factories{}, err
	}

	return factories, nil
}
Check your work
Imported the receiver module github.com/open-telemetry/opentelemetry-tutorials/trace-receiver/tailtracer, which is where the receiver types and functions are.
Added a call to tailtracer.NewFactory() as a parameter of the otelcol.MakeFactoryMap() call so your tailtracer receiver factory is properly added to the factories map.
Running and debugging the receiver
Ensure that the Collector config.yaml has been updated properly with the tailtracer receiver configured as one of the receivers used in the pipeline(s).

config.yaml

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
  tailtracer: # this line represents the ID of your receiver
    interval: 1m
    number_of_traces: 1

exporters:
  debug:
    verbosity: detailed
  otlp/jaeger:
    endpoint: localhost:14317
    tls:
      insecure: true
    sending_queue:
      batch:

service:
  pipelines:
    traces:
      receivers: [otlp, tailtracer]
      exporters: [otlp/jaeger, debug]
  telemetry:
    logs:
      level: debug
Let’s use the go run command instead of the previously generated ./otelcol-dev/otelcol-dev binary file, to start the updated Collector as we have had code changes in the otelcol-dev/components.go file.

go run ./otelcol-dev --config config.yaml
The output should look like this:

2023-11-08T21:38:36.621+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-08T21:38:36.621+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-08T21:38:36.621+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-08T21:38:36.621+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-08T21:38:36.621+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-08T21:38:36.621+0800	debug	receiver@v0.88.0/receiver.go:294	Alpha component. May change in the future.	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-08T21:38:36.622+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-08T21:38:36.622+0800	info	extensions/extensions.go:33	Starting extensions...

<OMITTED>

2023-11-08T21:38:36.636+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
2023-11-08T21:39:36.626+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-08T21:40:36.626+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
...
As you can see from the logs, the tailtracer has been initialized successfully. Every minute, there will be a message that reads, I should start processing traces now!, triggered by the dummy ticker in tailtracer/trace-receiver.go.

Tip
To stop the process press Ctrl + C in your Collector terminal.

Additionally, you may use your IDE of choice to debug the receiver, just as you would normally debug a Go project. Here is a simple launch.json file for Visual Studio Code for your reference:

{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch otelcol-dev",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}/otelcol-dev",
      "args": ["--config", "${workspaceFolder}/config.yaml"]
    }
  ]
}
As a big milestone, let’s take a look at how the folder structure looks like now:

In the next section, you will learn more about the OpenTelemetry Trace data model so the tailtracer receiver can finally generate meaningful traces!

The Collector Trace Data Model
You may be familiar with OpenTelemetry traces by using the SDKs and instrumenting an application to observe and evaluate your traces in a distributed tracing backend like Jaeger.

Here is what a trace looks like in Jaeger:

Jaeger trace
Although this is a Jaeger trace, it was generated by a trace pipeline in the Collector. This can help you understand a few things about the OTel trace data model:

A trace consists of one or more spans structured in a hierarchy to represent dependencies.
The spans can represent operations within a service and/or across services.
Creating a trace in the trace receiver will be slightly different from how you would do it with the SDKs, so let’s begin by reviewing the high level concepts.

Working with Resources
In the OTel world, all telemetry is generated by a Resource. Here is the definition according to the OTel spec:

A Resource is an immutable representation of the entity producing telemetry as Attributes. For example, a process producing telemetry that is running in a container on Kubernetes has a Pod name, runs in a namespace and may be part of a Deployment with its own name. All three of these attributes can be included in the Resource.

Traces are most commonly used to represent a service request (the Services entity described in Jaeger’s model), which is normally implemented as processes running in a compute unit. However, OTel’s API approach to describe a Resource through attributes, is flexible enough to represent any entity that you may need, such as ATMs, IoT sensors, and much more.

So it’s safe to say that for a trace to exist, a Resource will have to start it.

In this tutorial, we will simulate a system with telemetry that demonstrates ATMs located in 2 different states (for example, Illinois and California) accessing the Account’s backend system to execute balance, deposit and withdrawal operations. To achieve this, we will implement code to create the Resource types representing the ATM and the backend system.

Go ahead and create a file named model.go inside the tailtracer folder.

touch tailtracer/model.go
Now, in the model.go file, add the definition for the Atm and the BackendSystem types as follows:

tailtracer/model.go

package tailtracer

type Atm struct{
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}
These types are meant to represent the entities as they appear in the system being observed. They contain information that would be quite meaningful to add to the traces as part of the Resource definition. You will add some helper functions to generate the instances of these types.

Here is what the model.go file will look like with the added helper functions:

tailtracer/model.go

package tailtracer

import (
	"math/rand"
	"time"
)

type Atm struct{
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct{
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm{
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
		case 1:
			newAtm = Atm{
				ID: 111,
				Name: "ATM-111-IL",
				SerialNumber: "atmxph-2022-111",
				Version: "v1.0",
				ISPNetwork: "comcast-chicago",
				StateID: "IL",

			}

		case 2:
			newAtm = Atm{
				ID: 222,
				Name: "ATM-222-CA",
				SerialNumber: "atmxph-2022-222",
				Version: "v1.0",
				ISPNetwork: "comcast-sanfrancisco",
				StateID: "CA",
			}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem{
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName: "accounts",
		Version: "v2.5",
		OSType: "lnx",
		OSVersion: "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion: "us-east-2",
	}

	switch i {
		case 1:
		 	newBackend.Endpoint = "api/v2.5/balance"
		case 2:
		  	newBackend.Endpoint = "api/v2.5/deposit"
		case 3:
			newBackend.Endpoint = "api/v2.5/withdrawn"

	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max - min + 1) + min)
	return i
}
Check your work
Imported the math/rand and time packages to support the implementation of the generateRandomNumber function.
Added the generateAtm function, that instantiates an Atm type and randomly assigns either Illinois or California as the value for StateID, along with the corresponding value for ISPNetwork.
Added the generateBackendSystem function, which creates an instance of the BackendSystemtype and randomly assigns service endpoint values to the Endpoint field.
Added the generateRandomNumber function to generate random numbers within a specified range.
Now that you have the functions to generate object instances representing the entities generating telemetry, you are ready to represent those entities in the OTel Collector world.

The Collector API provides a package named ptrace, which is nested under the pdata package. It includes all the types, interfaces and helper functions required to work with traces in the Collector pipeline components.

Open the tailtracer/model.go file and add go.opentelemetry.io/collector/pdata/ptrace to the import clause so you can have access to the ptrace package capabilities.

Before you can define a Resource, you need to create a ptrace.Traces that will be responsible for propagating the traces via the Collector pipeline. You can use the helper function ptrace.NewTraces(), to instantiate it. You will also need to create instances of the Atm and BackendSystem types so you can have data to represent the telemetry sources involved in your trace.

Open the tailtracer/model.go file and add the following function to it:

func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()
	}

	return traces
}
By now, you have heard and read enough about how traces are made up of spans. You may have even written some instrumentation code using the SDK’s functions and types available to create them. However, what you may not know is that there are other types of “spans” involved in the creation of a trace in the Collector API.

You will start with a type called ptrace.ResourceSpans which represents the resource and all the operations that it originated or received while participating in a trace. You can find its definition in the /pdata/ptrace/generated_resourcespans.go file.

ptrace.Traces has a method named ResourceSpans() which returns an instance of a helper type called ptrace.ResourceSpansSlice. The ptrace.ResourceSpansSlice type has methods to help you handle the array of ptrace.ResourceSpans. The array will contain as many items as the number of Resource entities participating in the request represented by the trace.

ptrace.ResourceSpansSlice has a method named AppendEmpty() that adds a new ptrace.ResourceSpan to the array and returns its reference.

Once you have an instance of a ptrace.ResourceSpan, you will use a method named Resource() which will return the instance of the pcommon.Resource associated with the ResourceSpan.

Update the generateTrace() function with the following changes:

add a variable named resourceSpan to represent the ResourceSpan.
add a variable named atmResource to represent the pcommon.Resource associated with the ResourceSpan.
Use the methods mentioned above to initialize both variables, respectively.
Here is what the function should look like after you implement the changes:

func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
	}

	return traces
}
Check your work
Added the resourceSpan variable and initialized it with the ResourceSpan reference returned by the traces.ResourceSpans().AppendEmpty() call.
Added the atmResource variable and initialized it with the pcommon.Resource reference returned by the resourceSpan.Resource() call.
Describing Resources through attributes
The Collector API provides a package named pcommon, which is nested under the pdata package. It contains all the types and helper functions required to describe a Resource.

In the context of the Collector, a Resource is described by attributes in a key/value pair format represented by the pcommon.Map type.

You can refer to the definition of the pcommon.Map type and its related helper functions for creating attribute values using the supported formats in the /pdata/pcommon/map.go file in the Collector GitHub project.

Key/value pairs provide a lot of flexibility to help model your Resource data. The OTel specification has some guidelines in place to help organize and minimize the conflicts across all the different types of telemetry generation entities that it may need to represent.

These guidelines are known as Resource Semantic Conventions and are documented in the OTel specification.

When creating your own attributes to represent your own telemetry generation entities, you should follow the guidelines provided by the specification:

Attributes are grouped logically by the type of concept that they describe. Attributes in the same group have a common prefix that ends with a dot. For example, all attributes that describe Kubernetes properties start with k8s.

Let’s start by opening the tailtracer/model.go file and adding go.opentelemetry.io/collector/pdata/pcommon to the import clause so you can have access to the pcommon package capabilities.

Now, go ahead and add a function to read the field values from an Atm instance and write them as attributes (grouped by the prefix “atm.”) into a pcommon.Resource instance. Here is what the function looks like:

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm){
   atmAttrs := resource.Attributes()
   atmAttrs.PutInt("atm.id", atm.ID)
   atmAttrs.PutStr("atm.stateid", atm.StateID)
   atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
   atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
}
Check your work
Declared a variable called atmAttrs and initialized it with the pcommon.Map reference returned by the resource.Attributes() call.
Used the PutInt() and PutStr() methods from pcommon.Map to add int and string attributes based on the equivalent Atm field types. Notice that because these attributes are specific to and only represent the Atm entity, they are all grouped within the atm. prefix.
The resource semantic conventions also have prescriptive attribute names and well-known values to represent telemetry generation entities that are common and applicable across different domains such as compute unit, environment and others.

For the BackendSystem entity, it has fields representing information relating to Operating System and Cloud. We will use the attribute names and values specified by the resource semantic convention to represent this information on its Resource.

All the resource semantic convention attribute names and well known-values are kept in the /semconv/v1.9.0/generated_resource.go file in the Collector GitHub project.

Let’s create a function to read the field values from a BackendSystem instance and write them as attributes into a pcommon.Resource instance. Open the tailtracer/model.go file and add the following function:

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem){
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
		case backend.CloudProvider == "amzn":
			cloudProvider = semconv.AttributeCloudProviderAWS
		case backend.OSType == "mcrsft":
			cloudProvider = semconv.AttributeCloudProviderAzure
		case backend.OSType == "gogl":
			cloudProvider = semconv.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(semconv.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(semconv.AttributeCloudRegion, backend.CloudRegion)

	switch {
		case backend.OSType == "lnx":
			osType = semconv.AttributeOSTypeLinux
		case backend.OSType == "wndws":
			osType = semconv.AttributeOSTypeWindows
		case backend.OSType == "slrs":
			osType = semconv.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(semconv.AttributeOSType, osType)
	backendAttrs.PutStr(semconv.AttributeOSVersion, backend.OSVersion)
 }
Notice that we didn’t add an attribute named “atm.name” or “backendsystem.name” to the pcommon.Resource representing the Atm and BackendSystem entity names. This is because most (not to say all) distributed tracing backend systems compatible with the OTel trace specification interpret the pcommon.Resource described in a trace as a Service. Therefore, they expect the pcommon.Resource to have a required attribute named service.name as prescribed by the resource semantic convention.

We will also use a non-required attribute named service.version to represent the version information for both the Atm and BackendSystem entities.

Here is what the tailtracer/model.go file looks like after adding the code for properly assigning the “service.” group attributes:

tailtracer/model.go

package tailtracer

import (
	"math/rand"
	"time"

	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.opentelemetry.io/otel/semconv/v1.38.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(semconv.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(semconv.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = semconv.AttributeCloudProviderAWS
	case backend.OSType == "mcrsft":
		cloudProvider = semconv.AttributeCloudProviderAzure
	case backend.OSType == "gogl":
		cloudProvider = semconv.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(semconv.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(semconv.AttributeCloudRegion, backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = semconv.AttributeOSTypeLinux
	case backend.OSType == "wndws":
		osType = semconv.AttributeOSTypeWindows
	case backend.OSType == "slrs":
		osType = semconv.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(semconv.AttributeOSType, osType)
	backendAttrs.PutStr(semconv.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(semconv.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(semconv.AttributeServiceVersion, backend.Version)
}
Check your work
Updated the fillResourceWithAtm() function by adding lines to properly assign the “service.name” and “service.version” attributes to the pcommon.Resource that represents the Atm entity.
Updated the fillResourceWithBackendSystem() function by adding lines to properly assign the “service.name” and “service.version” attributes to the pcommon.Resource that represents the BackendSystem entity.
Updated the generateTraces function by adding lines to properly instantiate a pcommon.Resource and fill in the attribute information for both Atm and BackendSystem entities using the fillResourceWithAtm() and fillResourceWithBackendSystem() functions.
Representing operations with spans
You now have a ResourceSpan instance with the respective Resource properly filled with attributes to represent the Atm and BackendSystem entities. You are now ready to represent the operations that each Resource executes as part of a trace in the ResourceSpan.

In the OTel world, for a system to generate telemetry, it needs to be instrumented either manually or automatically via an instrumentation library.

The instrumentation libraries are responsible for setting the scope (also known as the instrumentation scope), within which the operations participating in a trace occur, and describing these operations as spans in the context of the trace.

pdata.ResourceSpans has a method named ScopeSpans() which returns an instance of a helper type called ptrace.ScopeSpansSlice. The ptrace.ScopeSpansSlice type has methods to help you handle the array of ptrace.ScopeSpans. The array will contain as many items as the number of ptrace.ScopeSpan representing the different instrumentation scopes and the spans it generated within the context of a trace.

ptrace.ScopeSpansSlice has a method named AppendEmpty() that adds a new ptrace.ScopeSpans to the array and return its reference.

Let’s create a function to instantiate a ptrace.ScopeSpans representing the ATM system’s instrumentation scope and its spans. Open the tailtracer/model.go file and add the following function:

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()

	return scopeSpans
}
The ptrace.ScopeSpans has a method named Scope() that returns a reference to the pcommon.InstrumentationScope instance representing the instrumentation scope that generated the spans.

pcommon.InstrumentationScope has the following methods to describe an instrumentation scope:

SetName(v string) sets the name for the instrumentation library.

SetVersion(v string) sets the version for the instrumentation library.

Name() string returns the name associated with the instrumentation library.

Version() string returns the version associated with the instrumentation library.

Let’s update the appendAtmSystemInstrScopeSpans function so we can set the name and version of the instrumentation scope for the new ptrace.ScopeSpans. Here is what appendAtmSystemInstrScopeSpans looks like after the update:

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}
You can now update the generateTraces function and add variables to represent the instrumentation scope used by both Atm and BackendSystem entities by initializing them with the appendAtmSystemInstrScopeSpans(). Here is what generateTraces() looks like after the update:

func generateTraces(numberOfTraces int) ptrace.Traces{
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++{
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)
	}

	return traces
}
At this point, you have everything needed to represent the telemetry generation entities in your system, as well as the instrumentation scope responsible for identifying operations and generating the traces for the system. The next step is to create the spans representing the operations that the given instrumentation scope generated as part of a trace.

ptrace.ScopeSpans has a method named Spans() which returns an instance of a helper type called ptrace.SpanSlice. The ptrace.SpanSlice type has methods to help you handle the array of ptrace.Span. The array will contain as many items as the number of operations the instrumentation scope was able to identify and describe as part of the trace.

ptrace.SpanSlice has a method named AppendEmpty() that adds a new ptrace.Span to the array and return its reference.

ptrace.Span has the following methods to describe an operation:

SetTraceID(v pcommon.TraceID) sets the pcommon.TraceID uniquely identifying the trace that this span is associated with.

SetSpanID(v pcommon.SpanID) sets the pcommon.SpanID uniquely identifying this span in the context of the trace it is associated with.

SetParentSpanID(v pcommon.SpanID) sets pcommon.SpanID for the parent span/operation in case the operation represented by this span is executed as part of the parent (nested).

SetName(v string) sets the name of the operation for the span

SetKind(v ptrace.SpanKind) sets ptrace.SpanKind defining the kind of operation the span represents.

SetStartTimestamp(v pcommon.Timestamp) sets the pcommon.Timestamp representing the date and time when the operation associated with the span has started.

SetEndTimestamp(v pcommon.Timestamp) sets the pcommon.Timestamp representing the date and time when the operation associated with the span has ended.

As you can see from the methods above, a ptrace.Span is uniquely identified by 2 required IDs; their own unique ID represented by the pcommon.SpanID type and the ID of the trace they are associated with, represented by a pcommon.TraceID type.

The pcommon.TraceID has to carry a globally unique ID represented as a 16-byte array, and should follow the W3C Trace Context specification. The pcommon.SpanID is a unique ID in the context of the trace they are associated with and is represented as an 8-byte array.

The pcommon package provides the following types for generating span IDs:

type TraceID [16]byte

type SpanID [8]byte

For this tutorial, you will create the IDs using functions from the github.com/google/uuid package for the pcommon.TraceID, and functions from the crypto/rand package to randomly generate the pcommon.SpanID. First, open the tailtracer/model.go file and add both packages to the import statement. After that, add the following functions to help generate both IDs:

import (
	crand "crypto/rand"
	"math/rand"
  	...
)

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}
Check your work
Imported crypto/rand as crand, to avoid conflicts with math/rand.
Added new functions NewTraceID() and NewSpanID(), to generate trace ID and span ID, respectively.
Now that you have a way to identify the spans properly, you can start creating them to represent the operations both within and across the entities in your system.

As part of the generateBackendSystem() function, we have randomly assigned the operations that the BackEndSystem entity can provide as services to the system. Next, we will open the tailtracer/model.go file and look at the function named appendTraceSpans(), which will be responsible for creating a trace and appending spans that represent the BackendSystem operations. Here is what the initial implementation for the appendTraceSpans() function looks like:

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
Check your work
Added traceId and backendSpanId variables to represent the trace and the span ID, respectively, and initialized them with the helper functions created previously.
Added backendSpanStartTime and backendSpanFinishTime to represent the start and the end time of the operation. For the tutorial, any BackendSystem operation will take 1 second.
Added a variable named backendSpan which will hold the instance of the ptrace.Span representing this operation.
Set the Name of the span with the Endpoint field value from the BackendSystem instance.
Set the Kind of the span to ptrace.SpanKindServer. Refer to the SpanKind section in the trace specification to understand how to define SpanKind properly.
Used all the methods mentioned above to fill the ptrace.Span with the proper values to represent the BackendSystem operation.
You may have noticed that there are 2 references to ptrace.ScopeSpans as parameters in the appendTraceSpans() function, but we only used one of them. Don’t worry about it for now; we will get back to it later.

Next, you will update the generateTraces() function so that it can generate the trace by calling the appendTraceSpans() function. Here is what the updated generateTraces() function looks like:

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}
You now have the BackendSystem entity and its operations represented in spans in a proper trace context! Next, you need to push the generated trace through the pipeline so that the next consumer, either a processor or an exporter, can receive and process it.

Here is how the tailtracer/model.go file looks:

tailtracer/model.go

package tailtracer

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	"go.opentelemetry.io/otel/semconv/v1.38.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(semconv.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(semconv.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = semconv.AttributeCloudProviderAWS
	case backend.OSType == "mcrsft":
		cloudProvider = semconv.AttributeCloudProviderAzure
	case backend.OSType == "gogl":
		cloudProvider = semconv.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(semconv.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(semconv.AttributeCloudRegion, backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = semconv.AttributeOSTypeLinux
	case backend.OSType == "wndws":
		osType = semconv.AttributeOSTypeWindows
	case backend.OSType == "slrs":
		osType = semconv.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(semconv.AttributeOSType, osType)
	backendAttrs.PutStr(semconv.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(semconv.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(semconv.AttributeServiceVersion, backend.Version)
}

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()
	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("1s")
	backendSpanStartTime := time.Now()
	backendSpanFinishTime := backendSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(traceId)
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(backendSpanFinishTime))
}
The consumer.Traces has a method called ConsumeTraces(), which is responsible for pushing the generated traces to the next consumer in the pipeline. You need to update the Start() method in the tailtracerReceiver type and add the code to use it.

Open the tailtracer/trace-receiver.go file and update the Start() method as follows:

func (tailtracerRcvr *tailtracerReceiver) Start(ctx context.Context, host component.Host) error {
	tailtracerRcvr.host = host
	ctx = context.Background()
	ctx, tailtracerRcvr.cancel = context.WithCancel(ctx)

	interval, _ := time.ParseDuration(tailtracerRcvr.config.Interval)
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
				case <-ticker.C:
					tailtracerRcvr.logger.Info("I should start processing traces now!")
					tailtracerRcvr.nextConsumer.ConsumeTraces(ctx, generateTraces(tailtracerRcvr.config.NumberOfTraces)) // new line added
				case <-ctx.Done():
					return
			}
		}
	}()

	return nil
}
Check your work
Added a line under the case <=ticker.C condition calling the tailtracerRcvr.nextConsumer.ConsumeTraces() method, passing the new context created in the Start() method (ctx), and a call to the generateTraces() function so the generated traces can be pushed to the next consumer in the pipeline.
Now let’s run the otelcol-dev again:

go run ./otelcol-dev --config config.yaml
You should see the output like this after a few minutes:

2023-11-09T11:38:19.890+0800	info	service@v0.88.0/telemetry.go:84	Setting up own telemetry...
2023-11-09T11:38:19.890+0800	info	service@v0.88.0/telemetry.go:201	Serving Prometheus metrics	{"address": ":8888", "level": "Basic"}
2023-11-09T11:38:19.890+0800	debug	exporter@v0.88.0/exporter.go:273	Stable component.	{"kind": "exporter", "data_type": "traces", "name": "otlp/jaeger"}
2023-11-09T11:38:19.890+0800	info	exporter@v0.88.0/exporter.go:275	Development component. May change in the future.	{"kind": "exporter", "data_type": "traces", "name": "debug"}
2023-11-09T11:38:19.891+0800	debug	receiver@v0.88.0/receiver.go:294	Stable component.	{"kind": "receiver", "name": "otlp", "data_type": "traces"}
2023-11-09T11:38:19.891+0800	debug	receiver@v0.88.0/receiver.go:294	Alpha component. May change in the future.	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-09T11:38:19.891+0800	info	service@v0.88.0/service.go:143	Starting otelcol-dev...	{"Version": "1.0.0", "NumCPU": 10}
2023-11-09T11:38:19.891+0800	info	extensions/extensions.go:33	Starting extensions...

<OMITTED>

2023-11-09T11:38:19.903+0800	info	zapgrpc/zapgrpc.go:178	[core] [Channel #1] Channel Connectivity change to READY	{"grpc_log": true}
2023-11-09T11:39:19.894+0800	info	tailtracer/trace-receiver.go:33	I should start processing traces now!	{"kind": "receiver", "name": "tailtracer", "data_type": "traces"}
2023-11-09T11:39:19.913+0800	info	TracesExporter	{"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 4, "spans": 2}
2023-11-09T11:39:19.913+0800	info	ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> atm.id: Int(222)
     -> atm.stateid: Str(CA)
     -> atm.ispnetwork: Str(comcast-sanfrancisco)
     -> atm.serialnumber: Str(atmxph-2022-222)
     -> service.name: Str(ATM-222-CA)
     -> service.version: Str(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
ResourceSpans #1
Resource SchemaURL:
Resource attributes:
     -> cloud.provider: Str(aws)
     -> cloud.region: Str(us-east-2)
     -> os.type: Str(linux)
     -> os.version: Str(4.16.10-300.fc28.x86_64)
     -> service.name: Str(accounts)
     -> service.version: Str(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : bbcb00aead044a138cf96c0bf4a4ba83
    Parent ID      :
    ID             : 5056fe4e9adf621c
    Name           : api/v2.5/withdrawn
    Kind           : Server
    Start time     : 2023-11-09 03:39:19.894881 +0000 UTC
    End time       : 2023-11-09 03:39:20.894881 +0000 UTC
    Status code    : Unset
    Status message :
ResourceSpans #2
Resource SchemaURL:
Resource attributes:
     -> atm.id: Int(111)
     -> atm.stateid: Str(IL)
     -> atm.ispnetwork: Str(comcast-chicago)
     -> atm.serialnumber: Str(atmxph-2022-111)
     -> service.name: Str(ATM-111-IL)
     -> service.version: Str(v1.0)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
ResourceSpans #3
Resource SchemaURL:
Resource attributes:
     -> cloud.provider: Str(aws)
     -> cloud.region: Str(us-east-2)
     -> os.type: Str(linux)
     -> os.version: Str(4.16.10-300.fc28.x86_64)
     -> service.name: Str(accounts)
     -> service.version: Str(v2.5)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope
Span #0
    Trace ID       : ba013b8223ec4d29806ae493ecd1a5e4
    Parent ID      :
    ID             : 4feb47b55c9c4129
    Name           : api/v2.5/withdrawn
    Kind           : Server
    Start time     : 2023-11-09 03:39:19.894953 +0000 UTC
    End time       : 2023-11-09 03:39:20.894953 +0000 UTC
    Status code    : Unset
    Status message :
	{"kind": "exporter", "data_type": "traces", "name": "debug"}
...
Here is what the generated trace looks like in Jaeger:Jaeger trace

What you currently see in Jaeger represents a service that is receiving a request from an external entity that is not instrumented by an OTel SDK. As a result, it cannot be identified as the origin/start of the trace. For a ptrace.Span to understand that it is representing an operation that was executed as a result of another operation that originated either within or outside (nested/child) the Resource in the same trace context, you will need to:

Set the same trace context as the caller operation by calling the SetTraceID() method and passing the pcommon.TraceID of the parent/caller ptrace.Span as a parameter.
Define the caller operation in the context of the trace by calling the SetParentId() method and passing the pcommon.SpanID of the parent/caller ptrace.Span as a parameter.
You will now create a ptrace.Span that represents the Atm entity operations and set it as the parent for the BackendSystem span. Open the tailtracer/model.go file and update the appendTraceSpans() function as follows:

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
		case strings.Contains(backend.Endpoint, "balance"):
			atmOperationName = "Check Balance"
		case strings.Contains(backend.Endpoint, "deposit"):
			atmOperationName = "Make Deposit"
		case strings.Contains(backend.Endpoint, "withdraw"):
			atmOperationName = "Fast Cash"
		}

	atmSpanId := NewSpanID()
	atmSpanStartTime := time.Now()
	atmDuration, _ := time.ParseDuration("4s")
	atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)

	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))

	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
	backendSpanStartTime := atmSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())
}
Here is what the final tailtracer/model.go file looks like:

tailtracer/model.go

package tailtracer

import (
	crand "crypto/rand"
	"encoding/binary"
	"math/rand"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/collector/pdata/pcommon"
	"go.opentelemetry.io/collector/pdata/ptrace"
	 "go.opentelemetry.io/otel/semconv/v1.38.0"
)

type Atm struct {
	ID           int64
	Version      string
	Name         string
	StateID      string
	SerialNumber string
	ISPNetwork   string
}

type BackendSystem struct {
	Version       string
	ProcessName   string
	OSType        string
	OSVersion     string
	CloudProvider string
	CloudRegion   string
	Endpoint      string
}

func generateAtm() Atm {
	i := getRandomNumber(1, 2)
	var newAtm Atm

	switch i {
	case 1:
		newAtm = Atm{
			ID:           111,
			Name:         "ATM-111-IL",
			SerialNumber: "atmxph-2022-111",
			Version:      "v1.0",
			ISPNetwork:   "comcast-chicago",
			StateID:      "IL",
		}

	case 2:
		newAtm = Atm{
			ID:           222,
			Name:         "ATM-222-CA",
			SerialNumber: "atmxph-2022-222",
			Version:      "v1.0",
			ISPNetwork:   "comcast-sanfrancisco",
			StateID:      "CA",
		}
	}

	return newAtm
}

func generateBackendSystem() BackendSystem {
	i := getRandomNumber(1, 3)

	newBackend := BackendSystem{
		ProcessName:   "accounts",
		Version:       "v2.5",
		OSType:        "lnx",
		OSVersion:     "4.16.10-300.fc28.x86_64",
		CloudProvider: "amzn",
		CloudRegion:   "us-east-2",
	}

	switch i {
	case 1:
		newBackend.Endpoint = "api/v2.5/balance"
	case 2:
		newBackend.Endpoint = "api/v2.5/deposit"
	case 3:
		newBackend.Endpoint = "api/v2.5/withdrawn"
	}

	return newBackend
}

func getRandomNumber(min int, max int) int {
	rand.Seed(time.Now().UnixNano())
	i := (rand.Intn(max-min+1) + min)
	return i
}

func generateTraces(numberOfTraces int) ptrace.Traces {
	traces := ptrace.NewTraces()

	for i := 0; i <= numberOfTraces; i++ {
		newAtm := generateAtm()
		newBackendSystem := generateBackendSystem()

		resourceSpan := traces.ResourceSpans().AppendEmpty()
		atmResource := resourceSpan.Resource()
		fillResourceWithAtm(&atmResource, newAtm)

		atmInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		resourceSpan = traces.ResourceSpans().AppendEmpty()
		backendResource := resourceSpan.Resource()
		fillResourceWithBackendSystem(&backendResource, newBackendSystem)

		backendInstScope := appendAtmSystemInstrScopeSpans(&resourceSpan)

		appendTraceSpans(&newBackendSystem, &backendInstScope, &atmInstScope)
	}

	return traces
}

func fillResourceWithAtm(resource *pcommon.Resource, atm Atm) {
	atmAttrs := resource.Attributes()
	atmAttrs.PutInt("atm.id", atm.ID)
	atmAttrs.PutStr("atm.stateid", atm.StateID)
	atmAttrs.PutStr("atm.ispnetwork", atm.ISPNetwork)
	atmAttrs.PutStr("atm.serialnumber", atm.SerialNumber)
	atmAttrs.PutStr(semconv.AttributeServiceName, atm.Name)
	atmAttrs.PutStr(semconv.AttributeServiceVersion, atm.Version)

}

func fillResourceWithBackendSystem(resource *pcommon.Resource, backend BackendSystem) {
	backendAttrs := resource.Attributes()
	var osType, cloudProvider string

	switch {
	case backend.CloudProvider == "amzn":
		cloudProvider = semconv.AttributeCloudProviderAWS
	case backend.OSType == "mcrsft":
		cloudProvider = semconv.AttributeCloudProviderAzure
	case backend.OSType == "gogl":
		cloudProvider = semconv.AttributeCloudProviderGCP
	}

	backendAttrs.PutStr(semconv.AttributeCloudProvider, cloudProvider)
	backendAttrs.PutStr(semconv.AttributeCloudRegion, backend.CloudRegion)

	switch {
	case backend.OSType == "lnx":
		osType = semconv.AttributeOSTypeLinux
	case backend.OSType == "wndws":
		osType = semconv.AttributeOSTypeWindows
	case backend.OSType == "slrs":
		osType = semconv.AttributeOSTypeSolaris
	}

	backendAttrs.PutStr(semconv.AttributeOSType, osType)
	backendAttrs.PutStr(semconv.AttributeOSVersion, backend.OSVersion)

	backendAttrs.PutStr(semconv.AttributeServiceName, backend.ProcessName)
	backendAttrs.PutStr(semconv.AttributeServiceVersion, backend.Version)
}

func appendAtmSystemInstrScopeSpans(resourceSpans *ptrace.ResourceSpans) ptrace.ScopeSpans {
	scopeSpans := resourceSpans.ScopeSpans().AppendEmpty()
	scopeSpans.Scope().SetName("atm-system")
	scopeSpans.Scope().SetVersion("v1.0")
	return scopeSpans
}

func NewTraceID() pcommon.TraceID {
	return pcommon.TraceID(uuid.New())
}

func NewSpanID() pcommon.SpanID {
	var rngSeed int64
	_ = binary.Read(crand.Reader, binary.LittleEndian, &rngSeed)
	randSource := rand.New(rand.NewSource(rngSeed))

	var sid [8]byte
	randSource.Read(sid[:])
	spanID := pcommon.SpanID(sid)

	return spanID
}

func appendTraceSpans(backend *BackendSystem, backendScopeSpans *ptrace.ScopeSpans, atmScopeSpans *ptrace.ScopeSpans) {
	traceId := NewTraceID()

	var atmOperationName string

	switch {
	case strings.Contains(backend.Endpoint, "balance"):
		atmOperationName = "Check Balance"
	case strings.Contains(backend.Endpoint, "deposit"):
		atmOperationName = "Make Deposit"
	case strings.Contains(backend.Endpoint, "withdraw"):
		atmOperationName = "Fast Cash"
	}

	atmSpanId := NewSpanID()
	atmSpanStartTime := time.Now()
	atmDuration, _ := time.ParseDuration("4s")
	atmSpanFinishTime := atmSpanStartTime.Add(atmDuration)

	atmSpan := atmScopeSpans.Spans().AppendEmpty()
	atmSpan.SetTraceID(traceId)
	atmSpan.SetSpanID(atmSpanId)
	atmSpan.SetName(atmOperationName)
	atmSpan.SetKind(ptrace.SpanKindClient)
	atmSpan.Status().SetCode(ptrace.StatusCodeOk)
	atmSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(atmSpanStartTime))
	atmSpan.SetEndTimestamp(pcommon.NewTimestampFromTime(atmSpanFinishTime))

	backendSpanId := NewSpanID()

	backendDuration, _ := time.ParseDuration("2s")
	backendSpanStartTime := atmSpanStartTime.Add(backendDuration)

	backendSpan := backendScopeSpans.Spans().AppendEmpty()
	backendSpan.SetTraceID(atmSpan.TraceID())
	backendSpan.SetSpanID(backendSpanId)
	backendSpan.SetParentSpanID(atmSpan.SpanID())
	backendSpan.SetName(backend.Endpoint)
	backendSpan.SetKind(ptrace.SpanKindServer)
	backendSpan.Status().SetCode(ptrace.StatusCodeOk)
	backendSpan.SetStartTimestamp(pcommon.NewTimestampFromTime(backendSpanStartTime))
	backendSpan.SetEndTimestamp(atmSpan.EndTimestamp())
}
Run the otelcol-dev again:

go run ./otelcol-dev --config config.yaml
After about 2 minutes, you should start seeing traces in Jaeger that look like the following:Jaeger trace

We now have services representing both the Atm and the BackendSystem telemetry generation entities in our system. We fully understand how both entities are being used and how they contribute to the performance of an operation executed by a user.

Here is the detailed view of one of those traces in Jaeger:Jaeger trace

That’s it! You have now reached the end of this tutorial and successfully implemented a trace receiver, congratulations!


OpenTelemetry semantic conventions 1.40.0
The Semantic Conventions define a common set of (semantic) attributes which provide meaning to data when collecting, producing and consuming it. The Semantic Conventions specify among other things span names and kind, metric instruments and units as well as attribute names, types, meaning and valid values. For a detailed definition of the Semantic Conventions’ scope see Semantic Conventions Stability. The benefit to using Semantic Conventions is in following a common naming scheme that can be standardized across a codebase, libraries, and platforms. This allows easier correlation and consumption of data.

Semantic Conventions are defined for the following areas:

General: General Semantic Conventions.
CICD: Semantic Conventions for CICD systems.
Cloud Providers: Semantic Conventions for cloud providers libraries.
CloudEvents: Semantic Conventions for the CloudEvents specification.
Database: Semantic Conventions for database operations.
Exceptions: Semantic Conventions for exceptions.
FaaS: Semantic Conventions for Function as a Service (FaaS) operations.
Feature Flags: Semantic Conventions for feature flag evaluations.
Generative AI: Semantic Conventions for generative AI (LLM, etc.) operations.
GraphQL: Semantic Conventions for GraphQL implementations.
HTTP: Semantic Conventions for HTTP client and server operations.
Messaging: Semantic Conventions for messaging operations and systems.
Object Stores: Semantic Conventions for object stores operations.
RPC: Semantic Conventions for RPC client and server operations.
System: System Semantic Conventions.
Semantic Conventions by signals:

Events: Semantic Conventions for event data.
Logs: Semantic Conventions for logs data.
Metrics: Semantic Conventions for metrics.
Profiles: Semantic Conventions for profiles.
Resource: Semantic Conventions for resources.
Trace: Semantic Conventions for traces and spans.
Also see:

How to write semantic conventions
Non-normative supplementary information
Registry
General semantic conventions
Semantic conventions for .NET
Semantic conventions for Apps
Semantic conventions for Azure resource logs
Semantic conventions for Browser
Semantic conventions for CICD
Semantic conventions for CLI programs
Semantic conventions for cloud providers
Semantic conventions for CloudEvents
Semantic conventions for database calls and systems
Semantic conventions for DNS
Semantic conventions for exceptions
Semantic conventions for Function-as-a-Service
Semantic conventions for feature flags
Semantic conventions for generative AI systems
Semantic conventions for GraphQL
Semantic conventions for hardware
How to write semantic conventions
Semantic conventions for HTTP
Semantic conventions for messaging systems
Semantic conventions for mobile platform
Semantic conventions for NFS
Non-normative supplementary information
Semantic conventions for object stores
Semantic conventions for OpenTelemetry SDK
Resource semantic conventions
Semantic conventions for RPC
Semantic conventions for runtime environment
System semantic conventions
Semantic conventions for URL



Handling sensitive data
Best practices and guidance for handling sensitive data in OpenTelemetry
When implementing OpenTelemetry, it’s crucial to be mindful of sensitive data handling. The collection of telemetry data always carries the risk of inadvertently capturing sensitive or personal information that may be subject to various privacy regulations and compliance requirements.

Your responsibility
OpenTelemetry collects telemetry data, but it can’t determine what data is sensitive in your specific context on its own. As the implementer, you are responsible for:

Ensuring compliance with applicable privacy laws and regulations.
Protecting sensitive information in your telemetry data.
Obtaining necessary consents for data collection.
Implementing appropriate data handling and storage practices.
Additionally, you are responsible for understanding and reviewing the telemetry data emitted by any instrumentation libraries you use, as these libraries may collect and expose sensitive information as well.

Sensitive data considerations
What data is sensitive varies from situation to situation. Examples include:

Personal Identifiable Information (PII)
Authentication credentials
Session tokens
Financial information
Health-related data
User behavior data
Data minimization
When collecting potentially sensitive data through telemetry, follow the principle of data minimization. This means:

Only collect data that serves an observability purpose.
Avoid collecting personal information unless absolutely necessary.
Consider whether aggregated or anonymized data could serve the same purpose.
Regularly review collected attributes to ensure they remain necessary.
Protecting sensitive data
As outlined in the previous section, the best way to prevent the collection of sensitive data is not to collect data that might be sensitive. However, you might want to collect this data under certain circumstances, or perhaps have no full control over the data being collected, and need ways to scrape the data in post processing. The following suggestions can help you with that.

The OpenTelemetry Collector provides several processors that can help manage sensitive data:

attribute processor: Remove or modify specific attributes.
filter processor: Filter out entire spans or metrics containing sensitive data.
redaction processor: Delete span, log, and metric datapoint attributes that don’t match a list of allowed attributes.
transform processor: Transform data using regular expressions.
Deleting and hashing user information
The following configuration for the attribute processor is hashing the user.email and deleting user.full_name from sensitive user information:

processors:
  attributes/example:
    actions:
      - key: user.email
        action: hash
      - key: user.full_name
        action: delete
Replacing user.id with user.hash
The following configuration for the transform processor can be used to remove the user.id and replace it with a user.hash:

transform:
  trace_statements:
    - context: span
      statements:
        - set(attributes["user.hash"], SHA256(attributes["user.id"]))
        - delete_key(attributes, "user.id")
Risk and limitations of hashing for anonymization
Hashing the ID or name of a user may not provide the level of anonymization you need, since hashes are reversible in practice if the input space is small and predictable (e.g. numeric user IDs).

Truncating IP addresses
As an alternative to hashing you can truncate data, or group it by a common prefix or suffix. This for example applies to

dates, where you keep only the year or the year and the month, but drop the day.
email addresses, where you drop the local part and only keep the domain.
IP addresses, where you drop drop the last octet of IPv4 or the last 80 bits of IPv6.
The following configuration for the transform processor drops the last octet of a client.address attribute:

transform:
  trace_statements:
    - context: span
      statements:
        - replace_pattern(attributes["client.address"], "\\.\\d+$", ".0")
Delete attributes with redaction processor
Finally, an example for the redaction processor to delete certain attributes can be found in the section “Scrub sensitive data” of the security best practices page for Collector configurations.


Collector configuration best practices
When configuring the OpenTelemetry (OTel) Collector, consider these best practices to better secure your Collector instance.

Create secure configurations
Follow these guidelines to secure your Collector’s configuration and its pipelines.

Store your configuration securely
The Collector’s configuration might contain sensitive information including:

Authentication information such as API tokens.
TLS certificates including private keys.
You should store sensitive information securely such as on an encrypted filesystem or secret store. You can use environment variables to handle sensitive and non-sensitive data as the Collector supports environment variable expansion.

Use encryption and authentication
Your OTel Collector configuration should include encryption and authentication.

For communication encryption, see Configuring certificates.
For authentication, use the OTel Collector’s authentication mechanism, as described in Authentication.
Minimize the number of components
We recommend limiting the set of components in your Collector configuration to only those you need. Minimizing the number of components you use minimizes the attack surface exposed.

Use the OpenTelemetry Collector Builder (ocb) to create a Collector distribution that uses only the components you need.
Remove unused components from your configuration.
Configure with care
Some components can increase the security risk of your Collector pipelines.

Receivers, exporters, and other components should establish network connections over a secure channel, potentially authenticated as well.
Receivers and exporters might expose buffer, queue, payload, and worker settings using configuration parameters. If these settings are available, you should proceed with caution before modifying the default configuration values. Improperly setting these values might expose the OpenTelemetry Collector to additional attack vectors.
Set permissions carefully
Avoid running the Collector as a root user. Some components might require special permissions, however. In those cases, follow the principle of least privilege and make sure your components only have the access they need to do their job.

Observers
Observers are implemented as extensions. Extensions are a type of component that adds capabilities on top of the primary functions of the Collector. Extensions don’t require direct access to telemetry and aren’t part of pipelines, but they can still pose security risks if they require special permissions.

An observer discovers networked endpoints such as a Kubernetes pod, Docker container, or local listening port on behalf of the receiver creator. In order to discover services, observers might require greater access. For example, the k8s_observer requires role-based access control (RBAC) permissions in Kubernetes.

Manage specific security risks
Configure your Collector to block these security threats.

Protect against denial of service attacks
For server-like receivers and extensions, you can protect your Collector from exposure to the public internet or to wider networks than necessary by binding these components’ endpoints to addresses that limit connections to authorized users. Try to always use specific interfaces, such as a pod’s IP, or localhost instead of 0.0.0.0. For more information, see CWE-1327: Binding to an Unrestricted IP Address.

From Collector v0.110.0, the default host for all servers in Collector components is localhost. For earlier versions of the Collector, change the default endpoint from 0.0.0.0 to localhost in all components by enabling the component.UseLocalHostAsDefaultHost feature gate.

If localhost resolves to a different IP due to your DNS settings, then explicitly use the loopback IP instead: 127.0.0.1 for IPv4 or ::1 for IPv6. For example, here’s an IPv4 configuration using a gRPC port:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 127.0.0.1:4317
In IPv6 setups, make sure your system supports both IPv4 and IPv6 loopback addresses so the network functions properly in dual-stack environments and applications, where both protocol versions are used.

If you are working in environments that have nonstandard networking setups, such as Docker or Kubernetes, localhost might not work as expected. The following examples show setups for the OTLP receiver gRPC endpoint. Other Collector components might need similar configuration.

Docker
You can run the Collector in Docker by binding to the correct address. Here is a config.yaml configuration file for an OTLP exporter in Docker:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: my-hostname:4317 # Use the same hostname from your docker run command
In your docker run command, use the --hostname argument to bind the Collector to the my-hostname address. You can access the Collector from outside that Docker network (for example, on a regular program running on the host) by connecting to 127.0.0.1:4567. Here is an example docker run command:

docker run --hostname my-hostname --name container-name -p 127.0.0.1:4567:4317 otel/opentelemetry-collector:0.148.0
Docker Compose
Similarly to plain Docker, you can run the Collector in Docker by binding to the correct address.

The Docker compose.yaml file:

services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.148.0
    ports:
      - '4567:4317'
The Collector config.yaml file:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: otel-collector:4317 # Use the service name from your Docker compose file
You can connect to this Collector from another Docker container running in the same network by connecting to otel-collector:4317. You can access the Collector from outside that Docker network (for example, on a regular program running on the host) by connecting to 127.0.0.1:4567.

Kubernetes
If you run the Collector as a DaemonSet, you can use a configuration like the following:

apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: collector
spec:
  selector:
    matchLabels:
      name: collector
  template:
    metadata:
      labels:
        name: collector
    spec:
      containers:
        - name: collector
          image: otel/opentelemetry-collector:0.148.0
          ports:
            - containerPort: 4317
              hostPort: 4317
              protocol: TCP
              name: otlp-grpc
            - containerPort: 4318
              hostPort: 4318
              protocol: TCP
              name: otlp-http
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  fieldPath: status.podIP
In this example, you use the Kubernetes Downward API to get your own Pod IP, then bind to that network interface. Then, we use the hostPort option to ensure that the Collector is exposed on the host. The Collector’s config should look like this:

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: ${env:MY_POD_IP}:4317
      http:
        endpoint: ${env:MY_POD_IP}:4318
You can send OTLP data to this Collector from any Pod on the Node by accessing ${MY_HOST_IP}:4317 to send OTLP over gRPC and ${MY_HOST_IP}:4318 to send OTLP over HTTP, where MY_HOST_IP is the Node’s IP address. You can get this IP from the Downward API:

env:
  - name: MY_HOST_IP
    valueFrom:
      fieldRef:
        fieldPath: status.hostIP
Scrub sensitive data
Processors are the Collector components that sit between receivers and exporters. They are responsible for processing telemetry before it’s analyzed. You can use the OpenTelemetry Collector’s redaction processor to obfuscate or scrub sensitive data before exporting it to a backend.

The redaction processor deletes span, log, and metric datapoint attributes that don’t match a list of allowed attributes. It also masks attribute values that match a blocked value list. Attributes that aren’t on the allowed list are removed before any value checks are done.

For example, here is a configuration that masks values containing credit card numbers:

processors:
  redaction:
    allow_all_keys: false
    allowed_keys:
      - description
      - group
      - id
      - name
    ignored_keys:
      - safe_attribute
    blocked_values: # Regular expressions for blocking values of allowed span attributes
      - '4[0-9]{12}(?:[0-9]{3})?' # Visa credit card number
      - '(5[1-5][0-9]{14})' # MasterCard number
    summary: debug
See the documentation to learn how to add the redaction processor to your Collector configuration.

Safeguard resource utilization
After implementing safeguards for resource utilization in your hosting infrastructure, consider also adding these safeguards to your OpenTelemetry Collector configuration.

Batching your telemetry and limiting the memory available to your Collector can prevent out-of-memory errors and usage spikes. You can also handle traffic spikes by adjusting queue sizes to manage memory usage while avoiding data loss. For example, use the exporterhelper to manage queue size for your otlp exporter:

exporters:
  otlp:
    endpoint: <ENDPOINT>
    sending_queue:
      queue_size: 800
Filtering unwanted telemetry is another way you can protect your Collector’s resources. Not only does filtering protect your Collector instance, but it also reduces the load on your backend. You can use the filter processor to drop logs, metrics, and spans you don’t need. For example, here’s a configuration that drops non-HTTP spans:

processors:
  filter:
    error_mode: ignore
    traces:
      span:
        - attributes["http.request.method"] == nil
You can also configure your components with appropriate timeout and retry limits. These limits should allow your Collector to handle failures without accumulating too much data in memory. See the exporterhelper documentation for more information.

Finally, consider using compression with your exporters to reduce the send size of your data and conserve network and CPU resources. By default, the otlp exporter uses gzip compression.


Collector hosting best practices
When setting up hosting for OpenTelemetry (OTel) Collector, consider these best practices to better secure your hosting instance.

Store data securely
Your Collector configuration file might contain sensitive data, including authentication tokens or TLS certificates. See the best practices for securing your configuration.

If you are storing telemetry for processing, make sure to restrict access to those directories to prevent tampering with raw data.

Keep your secrets safe
Kubernetes secrets are credentials that hold confidential data. They authenticate and authorize privileged access. If you’re using a Kubernetes deployment for your Collector, make sure to follow these recommended practices to improve security for your clusters.

Apply the principle of least privilege
The Collector should not require privileged access, except where the data it’s collecting is in a privileged location. For example, in a Kubernetes deployment, system logs, application logs, and container runtime logs are often stored in a node volume that requires special permission to access. If your Collector is running as a daemonset on the node, make sure to grant only the specific volume mount permissions it needs to access these logs and no more. You can configure privilege access with role-based access control (RBAC). See RBAC good practices for more information.

Control access to server-like components
Some Collector components such as receivers and exporters can function like servers. To limit access to authorized users, you should:

Enable authentication by using bearer token authentication extensions and basic authentication extensions, for example.
Restrict the IPs that your Collector runs on.
Safeguard resource utilization
Use the Collector’s own internal telemetry to monitor its performance. Collect metrics from the Collector about its CPU, memory, and throughput usage and set alerts for resource exhaustion.

If resource limits are reached, consider horizontally scaling the Collector by deploying multiple instances in a load-balanced configuration. Scaling your Collector distributes the resource demands and prevents bottlenecks.

Once you secure resource utilization in your deployment, make sure your Collector instance also uses safeguards in its configuration.