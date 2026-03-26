node-redis guide (JavaScript)
Connect your Node.js/JavaScript application to a Redis database

node-redis is the Redis client for Node.js/JavaScript. The sections below explain how to install node-redis and connect your application to a Redis database.

Note:
node-redis is the recommended client library for Node.js/JavaScript, but we also support and document our older JavaScript client ioredis. See Migrate from ioredis if you are interested in converting an existing ioredis project to node-redis.
node-redis requires a running Redis server. See here for Redis Open Source installation instructions.

You can also access Redis with an object-mapping client interface. See RedisOM for Node.js for more information.

Install 
To install node-redis, run:

npm install redis

Connect and test 
Connect to localhost on port 6379.

Language:

JavaScript (node-redis)
Run in browser
Copied!


Foundational: Create a client connection to a Redis server using node-redis
import { createClient } from 'redis';

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
Node.js Quick-Start
Store and retrieve a simple string.

Language:

JavaScript (node-redis)
Run in browser
Copied!


Foundational: Set and retrieve string values using SET and GET commands
await client.set('key', 'value');
const value = await client.get('key');
console.log(value); // >>> value
Node.js Quick-Start
Store and retrieve a map.

Language:

JavaScript (node-redis)
Run in browser
Copied!


Foundational: Store and retrieve hash data structures using HSET and HGET commands
await client.hSet('user-session:123', {
    name: 'John',
    surname: 'Smith',
    company: 'Redis',
    age: 29
})

let userSession = await client.hGetAll('user-session:123');
console.log(JSON.stringify(userSession, null, 2));
/* >>>
{
  "surname": "Smith",
  "name": "John",
  "company": "Redis",
  "age": "29"
}
 */
Node.js Quick-Start
To connect to a different host or port, use a connection string in the format redis[s]://[[username][:password]@][host][:port][/db-number]:

createClient({
  url: 'redis://alice:foobared@awesome.redis.server:6380'
});

To check if the client is connected and ready to send commands, use client.isReady, which returns a Boolean. client.isOpen is also available. This returns true when the client's underlying socket is open, and false when it isn't (for example, when the client is still connecting or reconnecting after a network error).

When you have finished using a connection, close it with client.quit().

Language:

JavaScript (node-redis)
Run in browser
Copied!


Foundational: Close a Redis client connection using the quit() method
await client.quit();
Node.js Quick-Start
More information 
The node-redis website has more examples. The Github repository also has useful information, including a guide to the connection configuration options you can use.

See also the other pages in this section for more information and examples:

Connect to the server
Connect your Node.js application to a Redis database

Connect to Azure Managed Redis
Learn how to authenticate to an Azure Managed Redis (AMR) database

Index and query documents
Learn how to use Redis Search with JSON and hash documents.

Index and query vectors
Learn how to index and query vector embeddings with Redis

Vector set embeddings
Index and query embeddings with Redis vector sets

Pipelines and transactions
Learn how to use Redis pipelines and transactions

Probabilistic data types
Learn how to use approximate calculations with Redis.

Error handling
Learn how to handle errors when using node-redis.

Production usage
Get your Node.js app ready for production

Migrate from ioredis
Discover the differences between ioredis and node-redis.

Error handling
Learn how to handle errors when using node-redis.

node-redis uses promises for error handling. Most Redis JavaScript examples throughout the documentation mainly show the "happy path" and omit error handling for brevity. This page shows how to apply error handling techniques in node-redis for real world code. For an overview of some common general error types and strategies for handling them, see Error handling. See also Production usage for more information on connection management, timeouts, and other aspects of app reliability.

Common error types 
node-redis throws errors as rejected promises. Common error types include:

Error	When it occurs	Recoverable	Recommended action
ECONNREFUSED	Connection refused	✅	Retry with backoff or fall back
ETIMEDOUT	Command timeout	✅	Retry with backoff
ECONNRESET	Connection reset by peer	✅	Retry with backoff
EAI_AGAIN	DNS resolution failure	✅	Retry with backoff
ReplyError (WRONGTYPE)	Type mismatch	❌	Fix schema or code
ReplyError (BUSY, TRYAGAIN, LOADING)	Redis busy/loading	⚠️	Retry with backoff (bounded)
See Categories of errors for a more detailed discussion of these errors and their causes.

Async/await in examples 
The examples on this page and throughout the node-redis docs use async/await style for clarity.

// Using async/await (shown in examples below)
try {
    const result = await client.get(key);
    // Handle success
} catch (error) {
    // Handle error
}

Alternatively, you can use promise chains with .then() and .catch():

// Using promise chains (equivalent approach)
client.get(key)
    .then(result => {
        // Handle success
    })
    .catch(error => {
        // Handle error
    });

Error events 
Node-Redis provides multiple events to handle various scenarios, among which the most critical is the error event.

This event is triggered whenever an error occurs within the client.

It is crucial to listen for error events.

If a client does not register at least one error listener and an error occurs, the system will throw that error, potentially causing the Node.js process to exit unexpectedly. See the EventEmitter docs for more details.

const client = createClient({
  // ... client options
});
// Always ensure there's a listener for errors in the client to prevent process crashes due to unhandled errors
client.on('error', error => {
    console.error(`Redis client error:`, error);
});

Applying error handling patterns 
The Error handling overview describes four common error handling patterns. The sections below show how to implement these patterns in node-redis:

Pattern 1: Fail fast 
Catch specific errors that represent unrecoverable errors and re-throw them (see Pattern 1: Fail fast for a full description).

try {
    await client.get(key);
} catch (err) {
    if (err.name === 'ReplyError' && /WRONGTYPE|ERR /.test(err.message)) {
        throw err; // Fix code or data type
    }
    throw err;
}

Pattern 2: Graceful degradation 
Catch connection errors and fall back to an alternative (see Pattern 2: Graceful degradation for a full description).

try {
    const val = await client.get(key);
    if (val != null) return val;
} catch (err) {
    if (['ECONNREFUSED','ECONNRESET','ETIMEDOUT','EAI_AGAIN'].includes(err.code)) {
        logger.warn('Cache unavailable; falling back to DB');
        return database.get(key);
    }
    throw err;
}
return database.get(key);

Pattern 3: Retry with backoff 
Retry on temporary errors like timeouts (see Pattern 3: Retry with backoff for a full description).

async function getWithRetry(key, { attempts = 3, baseDelayMs = 100 } = {}) {
  let delay = baseDelayMs;
  for (let i = 0; i < attempts; i++) {
    try {
      return await client.get(key);
    } catch (err) {
      if (
        i < attempts - 1 &&
        (['ETIMEDOUT','ECONNRESET','EAI_AGAIN'].includes(err.code) ||
         (err.name === 'ReplyError' && /(BUSY|TRYAGAIN|LOADING)/.test(err.message)))
      ) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
}

Note that you can also configure node-redis to reconnect to the server automatically when the connection is lost. See Reconnect after disconnection for more information.

Pattern 4: Log and continue 
Log non-critical errors and continue (see Pattern 4: Log and continue for a full description).

try {
    await client.setEx(key, 3600, value);
} catch (err) {
    if (['ECONNREFUSED','ECONNRESET','ETIMEDOUT','EAI_AGAIN'].includes(err.code)) {
        logger.warn(`Failed to cache ${key}, continuing without cache`);
    } else {
        throw err;
    }
}

See also 
Error handling
Production usage



Production usage
Get your Node.js app ready for production

This guide offers recommendations to get the best reliability and performance in your production environment.

Checklist 
Each item in the checklist below links to the section for a recommendation. Use the checklist icons to record your progress in implementing the recommendations.


❌
Handling errors

❌
Handling reconnections

❌
Connection timeouts

❌
Command execution reliability

❌
Smart client handoffs
✅ = 0/5, ❌ = 5/5, 🔍 = 0/5,
(∅ = 0)
Recommendations 
Handling errors 
Node-Redis provides multiple events to handle various scenarios, among which the most critical is the error event.

This event is triggered whenever an error occurs within the client, and it is very important to set a handler to listen for it. See Error events for more information and an example of setting an error handler.

Handling reconnections 
When the socket closes unexpectedly (without calling the quit() or disconnect() methods), the client can automatically restore the connection. A simple exponential backoff strategy for reconnection is enabled by default, but you can replace this with your own custom strategy. See Reconnect after disconnection for more information.

Timeouts 
To set a timeout for a connection, use the connectTimeout option (the default timeout is 5 seconds):

const client = createClient({
  socket: {
    // setting a 10-second timeout  
    connectTimeout: 10000 // in milliseconds
  }
});
client.on('error', error => console.error('Redis client error:', error));

You can also set timeouts for individual commands using AbortController:

import { createClient, commandOptions } from 'redis';

const client = createClient({ url: 'redis://localhost:6379' });
await client.connect();

const ac = new AbortController();
const t = setTimeout(() => ac.abort(), 1000);
try {
  const val = await client.get(commandOptions({ signal: ac.signal }), key);
} finally {
  clearTimeout(t);
}

Command execution reliability 
By default, node-redis reconnects automatically when the connection is lost (but see Handling reconnections, if you want to customize this behavior). While the connection is down, any commands that you execute will be queued and sent to the server when the connection is restored. This might occasionally cause problems if the connection fails while a non-idempotent command is being executed. In this case, the command could change the data on the server without the client removing it from the queue. When the connection is restored, the command will be sent again, resulting in incorrect data.

If you need to avoid this situation, set the disableOfflineQueue option to true when you create the client. This will cause the client to discard unexecuted commands rather than queuing them:

const client = createClient({
  disableOfflineQueue: true,
      .
      .
});

Use a separate connection with the queue disabled if you want to avoid queuing only for specific commands.

Smart client handoffs 
Smart client handoffs (SCH) is a feature of Redis Cloud and Redis Software servers that lets them actively notify clients about planned server maintenance shortly before it happens. This lets a client take action to avoid disruptions in service.

See Smart client handoffs for more information about SCH and Connect using Smart client handoffs for example code.


Pipelines and transactions
Learn how to use Redis pipelines and transactions

Redis lets you send a sequence of commands to the server together in a batch. There are two types of batch that you can use:

Pipelines avoid network and processing overhead by sending several commands to the server together in a single communication. The server then sends back a single communication with all the responses. See the Pipelining page for more information.
Transactions guarantee that all the included commands will execute to completion without being interrupted by commands from other clients. See the Transactions page for more information.
Execute a pipeline 
There are two ways to execute commands in a pipeline. Firstly, node-redis will automatically pipeline commands that execute within the same "tick" of the event loop. You can ensure that commands happen in the same tick very easily by including them in a Promise.all() call, as shown in the following example. The chained then(...) callback is optional and you can often omit it for commands that write data and only return a status result.

await Promise.all([
  client.set('seat:0', '#0'),
  client.set('seat:1', '#1'),
  client.set('seat:2', '#2'),
]).then((results) =>{
    console.log(results);
    // >>> ['OK', 'OK', 'OK']
});

await Promise.all([
    client.get('seat:0'),
    client.get('seat:1'),
    client.get('seat:2'),
]).then((results) =>{
    console.log(results);
    // >>> ['#0', '#1', '#2']
});

You can also create a pipeline object using the multi() method and then add commands to it using methods that resemble the standard command methods (for example, set() and get()). The commands are buffered in the pipeline and only execute when you call the execAsPipeline() method on the pipeline object. Again, the then(...) callback is optional.

await client.multi()
    .set('seat:3', '#3')
    .set('seat:4', '#4')
    .set('seat:5', '#5')
    .execAsPipeline()
    .then((results) => {
        console.log(results);
        // >>> ['OK', 'OK', 'OK']
    });

The two approaches are almost equivalent, but they have different behavior when the connection is lost during the execution of the pipeline. After the connection is re-established, a Promise.all() pipeline will continue execution from the point where the interruption happened, but a multi() pipeline will discard any remaining commands that didn't execute.

Execute a transaction 
A transaction works in a similar way to a pipeline. Create a transaction object with the multi() command, call command methods on that object, and then call the transaction object's exec() method to execute it.

const [res1, res2, res3] = await client.multi()
    .incrBy("counter:1", 1)
    .incrBy("counter:2", 2)
    .incrBy("counter:3", 3)
    .exec();

console.log(res1); // >>> 1
console.log(res2); // >>> 2
console.log(res3); // >>> 3

Watch keys for changes 
Redis supports optimistic locking to avoid inconsistent updates to different keys. The basic idea is to watch for changes to any keys that you use in a transaction while you are are processing the updates. If the watched keys do change, you must restart the updates with the latest data from the keys. See Transactions for more information about optimistic locking.

The code below reads a string that represents a PATH variable for a command shell, then appends a new command path to the string before attempting to write it back. If the watched key is modified by another client before writing, the transaction aborts. Note that you should call read-only commands for the watched keys synchronously on the usual client object but you still call commands for the transaction on the transaction object created with multi().

For production usage, you would generally call code like the following in a loop to retry it until it succeeds or else report or log the failure.

// Set initial value of `shellpath`.
client.set('shellpath', '/usr/syscmds/');

// Watch the key we are about to update.
await client.watch('shellpath');

const currentPath = await client.get('shellpath');
const newPath = currentPath + ':/usr/mycmds/';

// Attempt to write the watched key.
await client.multi()    
    .set('shellpath', newPath)
    .exec()
    .then((result) => {
        // This is called when the pipeline executes
        // successfully.
        console.log(result);
    }, (err) => {
        // This is called when a watched key was changed.
        // Handle the error here.
        console.log(err);
    });

const updatedPath = await client.get('shellpath');
console.log(updatedPath);
// >>> /usr/syscmds/:/usr/mycmds/

In an environment where multiple concurrent requests are sharing a connection (such as a web server), you must use a connection pool to get an isolated connection, as shown below:

import { createClientPool } from 'redis';

const pool = await createClientPool()
  .on('error', err => console.error('Redis Client Pool Error', err));

try {
  await pool.execute(async client => {
    await client.watch('key');

    const multi = client.multi()
      .ping()
      .get('key');

    if (Math.random() > 0.5) {
      await client.watch('another-key');
      multi.set('another-key', await client.get('another-key') / 2);
    }

    return multi.exec();
  });
} catch (err) {
  if (err instanceof WatchError) {
    // the transaction aborted
  }
}

This is important because the server tracks the state of the WATCH on a per-connection basis, and concurrent WATCH and MULTI/EXEC calls on the same connection will interfere with one another. See RedisClientPool for more information.











Manage streams and consumer groups in Redis Insight
Learn how to manage streams and consumer groups in Redis Insight

A stream is an append-only log file. When you add data to it, you cannot change it. That may seem like a disadvantage; however, a stream serves as a log or single source of truth. It can also be used as a buffer between processes that work at different speeds and do not need to know about each other. For more conceptual information about streams, see Redis Streams.

In this topic, you will learn how to add and work with streams as well as consumer groups in Redis Insight.

Here's a stream that models temperature and humidity sensors. Processes interacting with the stream perform one of two roles: consumer and producer. The point of a stream is that it's not going to end, so you cannot capture whole datasets and do some processing on them.

In this stream, sensors are considered producers, which broadcast data. A consumer reads from the stream and does some work on it. For example, if the temperature is above a certain threshold, it puts a message out to turn on the air conditioner in that unit or notify the maintenance.

A stream that models temperature and humidity sensors.
It is possible to have multiple consumers doing different jobs, one measuring humidity, and another taking temperature measurements over periods of time. Redis stores a copy of the entire dataset in memory, which is a finite resource. To avoid runaway data, streams can be trimmed when you add something to them. When adding to a stream with XADD, you can optionally specify that the stream should be trimmed to a specific or approximate number of the newest entries, or to only include entries whose ID is higher than the ID specified. You can also manage the storage required for streaming data using key expiry. For example, by writing each day's data to its own stream in Redis and expiring each stream's key after a period of time, say a week. An ID can be any number, but each new entry in the stream must have an ID whose value is higher than the last ID added to the stream.

Adding new entries 
Use XADD with * for the ID to have Redis automatically generate a new ID for you consisting of a millisecond precision timestamp, a dash and a sequence number. For example 1656416957625-0. Then supply the field names and values to store in the new stream entry.

There are a couple of ways of retrieving things. You can retrieve entries by time range or you could ask for everything that's happened since a timestamp or ID that you specify. Using a single command you can ask for anything from 10:30 until 11:15 am on a given day.

Consumer groups 
A more realistic use case would be a system with many temperature sensors whose data Redis puts in a stream, records the time they arrive, and orders them.

A stream that models temperature and humidity sensors.
On the right side we have two consumers that read the stream. One of them is alerting if the temperature is over a certain number and texting the maintenance crew that they need to do something, and the other is a data warehouse that is taking the data and putting it into a database.

They run independently of each other. Up in the right, we have another sort of task. Let's assume that alerting and data warehouse are really fast. You get a message whether the temperature is larger than a specific value, which might take a millisecond. And alerting can keep up with the data flow. One way you can scale consumers is consumer groups, which allows multiple instances of the same consumer or same code to work as a team to process the stream.

Managing streams in Redis Insight 
You can add a stream in Redis Insight in two ways: create a new stream or add to an existing stream.

To create a stream, start by selecting the key type (stream). You cannot set time to live (TTL) because it cannot be put on a message in a stream; it can only be done on a Redis key. Name the stream mystream. Then, set the Entry ID to * to default to timestamp. If you have your own ID generation strategy, enter the next ID from your sequence. Remember that the ID must be higher than the ID of any other entry in the stream.

Then, enter fields and values using + to add more than one (for example, name and location). Now you have a stream that appears in the Streams view and you can continue adding fields and values to it.

Redis Insight runs read commands for you so you can see the stream entries in the Streams view. And the Consumer Groups view shows each consumers in a given consumer group and the last time Redis allocated a message, what the ID of it was and how many times that process has happened, and whether a consumer has you have told Redis that you are finished working with that task using the XACK command.

Monitor temperature and humidity from sensors in Redis Insight 
This example shows how to bring an existing stream into Redis Insight and work with it.

Setup 
Install Redis Insight.
Download and install Node.js (LTS version).
Install Redis. In Docker, check that Redis is running locally on the default port 6379 (with no password set).
Clone the code repository for this example. See the README for more information about this example and installation tips.
On your command-line, navigate to the folder containing the code repository and install the Node.js package manager (npm).
npm install

Run the producer 
To start the producer, which will add a new entry to the stream every few seconds, enter:

npm run producer

> streams@1.0.0 producer
> node producer.js

Starting producer...
Adding reading for location: 62, temperature: 40.3, humidity: 36.5
Added as 1632771056648-0
Adding reading for location: 96, temperature: 15.4, humidity: 70
Added as 1632771059039-0
...

The producer runs indefinitely. Select Ctrl+C to stop it. You can start multiple instances of the producer if you want to add entries to the stream faster.

Run the consumer 
To start the consumer, which reads from the stream every few seconds, enter:

npm run consumer

> streams@1.0.0 consumer
> node consumer.js

Starting consumer...
Resuming from ID 1632744741693-0
Reading stream...
Received entry 1632771056648-0:
[ 'location', '62', 'temp', '40.3', 'humidity', '36.5' ]
Finished working with entry 1632771056648-0
Reading stream...
Received entry 1632771059039-0:
[ 'location', '96', 'temp', '15.4', 'humidity', '70' ]

The consumer stores the last entry ID that it read in a Redis string at the key consumer:lastid. It uses this string to pick up from where it left off after it is restarted. Try this out by stopping it with Ctrl+C and restarting it.

Once the consumer has processed every entry in the stream, it will wait indefinitely for instances of the producer to add more:

Reading stream...
No new entries since entry 1632771060229-0.
Reading stream...
No new entries since entry 1632771060229-0.
Reading stream...

Stop it using Ctrl+C.

Run a consumer group 
A consumer group consists of multiple consumer instances working together. Redis manages allocation of entries read from the stream to members of a consumer group. A consumer in a group will receive a subset of the entries, with the group as a whole receiving all of them. When working in a consumer group, a consumer process must acknowledge receipt/processing of each entry.

Using multiple terminal windows, start three instances of the consumer group consumer, giving each a unique name:

npm run consumergroup consumer1

> streams@1.0.0 consumergroup
> node consumer_group.js -- "consumer1"

Starting consumer consumer1...
Consumer group temphumidity_consumers exists, not created.
Reading stream...
Received entry 1632771059039-0:
[ 'location', '96', 'temp', '15.4', 'humidity', '70' ]
Acknowledged processing of entry 1632771059039-0.
Reading stream...

In a second terminal:

npm run consumergroup consumer2

And in a third:

npm run consumergroup consumer3

The consumers will run indefinitely, waiting for new messages to be added to the stream by a producer instance when they have collectively consumed the entire stream. Note that in this model, each consumer instance does not receive all of the entries from the stream, but the three members of the group each receive a subset.

View the stream in Redis Insight 
Launch Redis Insight.
Select localhost:6379
Select STREAM. Optionally, select full screen from the upper right corner to expand the view.
The Streams view in Redis Insight.
You can now toggle between Stream and Consumer Groups views to see your data. As mentioned earlier in this topic, a stream is an append-only log so you can't modify the contents of an entry, but you can delete an entire entry. A case when that's useful is in the event of a so-called poison-pill message that can cause consumers to crash. You can physically remove such messages in the Streams view or use the XDEL command at the command-line interface (CLI).

You can continue interacting with your stream at the CLI. For example, to get the current length of a stream, use the XLEN command:

XLEN ingest:temphumidity

Use streams for auditing and processing events in banking, gaming, supply chain, IoT, social media, and so on.




Tutorial

Getting Started with Node and Redis
February 25, 2026
8 minute read
Ajeet Raina
Ajeet Raina
Simon Prickett
Simon Prickett
TL;DR:
Install the redis npm package (node-redis) or ioredis, call createClient() to connect Node.js to Redis, then use set and get for basic operations. Both clients support modern async/await patterns and deliver sub-millisecond response times.
#What you'll learn
How to install and configure node-redis or ioredis
How to connect Node.js to a Redis server
How to run basic Redis commands (strings, sorted sets) from JavaScript
How node-redis and ioredis compare so you can choose the right Redis npm package
Where to go next with Express, Redis OM, and more
#Prerequisites
Node.js v18 or later (LTS recommended)
npm or yarn package manager
A running Redis server — follow the Redis quick start to set one up
#Introduction
Redis is an open source, in-memory, key-value data store most commonly used as a primary database, cache, message broker, and queue. Redis cache delivers sub-millisecond response times, enabling fast and powerful real-time applications in industries such as gaming, fintech, ad-tech, social media, healthcare, and IoT.
Redis is a great database for use with Node.js. Both Redis and Node share similar type conventions and threading models, which makes for a very predictable development experience. By pairing Node.js and Redis together you can achieve a scalable and productive development platform.
Redis has two primary Node.js clients which are node-redis and ioredis. Both are available through npm. We generally suggest using node-redis, as it has wide support for Redis modules, is easily extended, and is widely used. Check out a list of Redis clients that the community has built (search Node).
#How do I install node-redis?
Run the following command to install the Redis npm package:
npm install redis
Copied!
#How do I connect to Redis from Node.js?
Use createClient() from the redis package to open a connection. The example below connects to Redis, sets and gets a string key, adds items to a sorted set, and iterates over the results:
import { createClient } from 'redis';

async function nodeRedisDemo() {
    try {
        const client = createClient();
        await client.connect();

        await client.set('mykey', 'Hello from node redis');
        const myKeyValue = await client.get('mykey');
        console.log(myKeyValue);

        const numAdded = await client.zAdd('vehicles', [
            {
                score: 4,
                value: 'car',
            },
            {
                score: 2,
                value: 'bike',
            },
        ]);
        console.log(`Added ${numAdded} items.`);

        for await (const { score, value } of client.zScanIterator('vehicles')) {
            console.log(`${value} -> ${score}`);
        }

        await client.quit();
    } catch (e) {
        console.error(e);
    }
}

nodeRedisDemo();
Copied!
#How do I use ioredis with Node.js?
#Step 1. Install ioredis using npm (or yarn)
npm install ioredis
Copied!
#Step 2. Write your application code
const Redis = require('ioredis');

async function ioredisDemo() {
    try {
        const client = new Redis();

        await client.set('mykey', 'Hello from io-redis!');
        const myKeyValue = await client.get('mykey');
        console.log(myKeyValue);

        const numAdded = await client.zadd('vehicles', 4, 'car', 2, 'bike');
        console.log(`Added ${numAdded} items.`);

        const stream = client.zscanStream('vehicles');

        stream.on('data', (items) => {
            // items = array of value, score, value, score...
            for (let n = 0; n < items.length; n += 2) {
                console.log(`${items[n]} -> ${items[n + 1]}`);
            }
        });

        stream.on('end', async () => {
            await client.quit();
        });
    } catch (e) {
        console.error(e);
    }
}

ioredisDemo();
Copied!
#node-redis vs ioredis: which should I use?
Feature	node-redis	ioredis
Redis module support	Full support (RediSearch, RedisJSON, etc.)	Limited
API style	Async/await with client.connect()	Auto-connect on instantiation
Cluster support	Yes	Yes
Sentinel support	Yes	Yes
Lua scripting	evalSha / eval	defineCommand helper
TypeScript	Built-in types	Built-in types
Maintained by	Redis official	Community
Recommendation: Use node-redis if you need advanced Redis data structure support (Search, JSON, time series, probabilistic, vectors) or want the officially maintained Redis JavaScript client.
#Example projects
#Hacker News Clone in Node.js
Hacker News Clone project illustration built with Next.js and Redis
A Hacker News Clone project built in Next.js, Node.js, and Express based on Search and JSON.
#Shopping Cart application in Node.js
Shopping Cart application illustration showing Node.js and Redis integration for e-commerce
Shopping Cart app in Node.js module functionalities.
#More developer resources
#Sample code
Basic Redis Caching — This application calls the GitHub API and caches the results into Redis.
Redis Rate-Limiting — This is a very simple app that demonstrates rate-limiting feature using Redis.
﻿Notifications with WebSocket, Vue & Redis — This project allows you to push notifications in a Vue application from a Redis PUBLISH using WebSockets.
#Technical articles & videos
Redis Rapid Tips: ioredis (YouTube)
﻿Mapping Objects between Node and Redis (YouTube)
#Redis University
Build full-fledged Redis applications with Node.js and Express.

Mastering Redis in Node.js: A Comprehensive Guide
March 15, 2024
·
26 min read
Mastering Redis in Node.js: A Comprehensive Guide
Redis is an in-memory data structure store used as a database, cache, and message broker. It’s known for its high performance and versatility, making it a popular choice for caching, real-time analytics, session storage, and more. In this guide, we’ll explore Redis in depth, covering its core data types, caching strategies, pub/sub, and advanced use cases in Node.js applications.

Why Use Redis?
Redis provides numerous benefits, including:

High Performance: Being an in-memory store, Redis can handle high-throughput operations with low latency.
Data Persistence: Redis offers persistence options, allowing you to save data on disk.
Versatile Data Structures: Redis supports various data types, including strings, hashes, lists, sets, and sorted sets.
Pub/Sub Messaging: Redis’s publish/subscribe model enables real-time communication between services.
With these features, Redis is ideal for caching, session storage, rate limiting, real-time notifications, and more.

Redis Architecture Overview
graph TB
    subgraph "Application Layer"
        APP1[Node.js App 1]
        APP2[Node.js App 2]
        APP3[Node.js App 3]
    end
    
    subgraph "Redis Layer"
        subgraph "Redis Instance"
            MEM[In-Memory Storage<br/>Primary data storage]
            PERS[Persistence Layer<br/>RDB + AOF]
        end
        
        subgraph "Data Types"
            STR[Strings<br/>Simple key-value]
            HASH[Hashes<br/>Field-value pairs]
            LIST[Lists<br/>Ordered collections]
            SET[Sets<br/>Unique values]
            ZSET[Sorted Sets<br/>Scored unique values]
        end
        
        subgraph "Features"
            PUB[Pub/Sub<br/>Messaging]
            EXPIRE[Expiration<br/>TTL support]
            TRANS[Transactions<br/>MULTI/EXEC]
        end
    end
    
    subgraph "Storage Layer"
        RDB[(RDB Files<br/>Point-in-time snapshots)]
        AOF[(AOF Files<br/>Append-only logs)]
    end
    
    APP1 --> MEM
    APP2 --> MEM
    APP3 --> MEM
    
    MEM --> STR
    MEM --> HASH
    MEM --> LIST
    MEM --> SET
    MEM --> ZSET
    
    MEM --> PUB
    MEM --> EXPIRE
    MEM --> TRANS
    
    PERS --> RDB
    PERS --> AOF
    
    style MEM fill:#e1f5fe
    style STR fill:#f3e5f5
    style HASH fill:#fff3e0
    style LIST fill:#e8f5e8
    style PUB fill:#fce4ec

Show all 55 lines

Setting Up Redis in Node.js
Step 1: Install Redis Server
To use Redis locally, download and install it from the official Redis website or install it via a package manager.

script.sh
5 lines


# macOS with Homebrew
brew install redis
# Ubuntu
sudo apt update && sudo apt install redis-server
Step 2: Install Redis Client for Node.js
In your Node.js project, install the redis package:

npm install redis

Step 3: Configure Redis Client in Node.js
Create a redisClient.js file to initialize and export the Redis client.

redisClient.js

config.js
13 lines


const redis = require('redis')

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

client.on('connect', () => console.log('Connected to Redis'))
client.on('error', (err) => console.error('Redis connection error:', err))

client.connect()

module.exports = client
In this configuration:

connect logs successful connections, and error logs any connection issues.
You can customize the Redis URL, password, or port as needed in production.
Core Redis Data Types and Operations
Redis supports various data types, each suitable for different use cases. Let’s go over the main ones and how to use them in Node.js.

1. Strings
Strings are the simplest data type in Redis, used for storing text, numbers, JSON, or serialized objects.

Set and Get Strings
index.js
7 lines


// Set a string value
await client.set('name', 'Redis')

// Get the value of a key
const name = await client.get('name')
console.log(name) // Output: Redis
2. Hashes
Hashes store key-value pairs within a key, similar to objects in JavaScript. They are useful for representing structured data, like user profiles.

Set and Get Hash Fields
index.js
18 lines


// Set multiple fields in a hash
await client.hSet(
  'user:1',
  'name',
  'Alice',
  'age',
  '30',
  'email',
  'alice@example.com'
)

// Get a single field
const name = await client.hGet('user:1', 'name')

// Get all fields in the hash
const user = await client.hGetAll('user:1')
console.log(user) // Output: { name: 'Alice', age: '30', email: 'alice@example.com' }
3. Lists
Lists are ordered collections of strings, useful for queues, recent activity logs, or other ordered data.

Add and Retrieve List Items
index.js
7 lines


// Add items to a list
await client.rPush('tasks', 'Task 1', 'Task 2', 'Task 3')

// Retrieve all items in the list
const tasks = await client.lRange('tasks', 0, -1)
console.log(tasks) // Output: ['Task 1', 'Task 2', 'Task 3']
4. Sets
Sets are unordered collections of unique values, ideal for managing collections where each item must be unique (e.g., tags or user interests).

Add and Retrieve Set Members
index.js
7 lines


// Add members to a set
await client.sAdd('tags', 'redis', 'nodejs', 'database')

// Get all members of the set
const tags = await client.sMembers('tags')
console.log(tags) // Output: ['redis', 'nodejs', 'database']
5. Sorted Sets
Sorted sets are collections of unique values with a score, allowing you to retrieve items in order by their score. They’re commonly used for ranking systems, like leaderboards.

Add and Retrieve Sorted Set Members
index.js
12 lines


// Add members with scores to a sorted set
await client.zAdd('leaderboard', [
  { score: 100, value: 'Alice' },
  { score: 200, value: 'Bob' },
])

// Get sorted set members ordered by score
const leaderboard = await client.zRange('leaderboard', 0, -1, {
  WITHSCORES: true,
})
console.log(leaderboard) // Output: [ 'Alice', '100', 'Bob', '200' ]
Caching with Redis in Node.js
Redis caching helps speed up responses and reduce database load by storing frequently accessed data. Let’s implement a caching strategy in Node.js.

Example: Caching Database Queries
Suppose you have a function that retrieves books from a database. You can cache the result in Redis to avoid repeated database calls.

booksService.js

index.js
14 lines


const client = require('./redisClient')
const Book = require('./models/Book')

const getBooks = async () => {
  const cachedBooks = await client.get('books')
  if (cachedBooks) {
    return JSON.parse(cachedBooks) // Return cached data
  }

  const books = await Book.find()
  await client.set('books', JSON.stringify(books), { EX: 3600 }) // Cache for 1 hour
  return books
}
In this example:

The function first checks if books is cached in Redis.
If cached, it returns the data; otherwise, it queries the database and stores the result in Redis for 1 hour.
Rate Limiting with Redis
Rate limiting helps prevent abuse by limiting the number of requests a user can make within a given period. Redis makes it easy to track request counts and enforce limits.

Implementing Rate Limiting
Suppose we want to limit each user to 100 requests per hour. Here’s how to do it:

rateLimiter.js

config.js
23 lines


const client = require('./redisClient')

const rateLimiter = async (req, res, next) => {
  const userKey = `rate:${req.ip}` // Unique key based on user IP
  const ttl = 3600 // Time window in seconds (1 hour)

  const requests = await client.incr(userKey) // Increment request count

  if (requests === 1) {
    // Set expiration time on the first request
    await client.expire(userKey, ttl)
  }

  if (requests > 100) {
    // Deny access if request limit is exceeded
    return res.status(429).json({ message: 'Rate limit exceeded' })
  }

  next() // Proceed if limit is not exceeded
}

module.exports = rateLimiter

Show all 23 lines
Using the Rate Limiter Middleware
Apply the rate limiter as middleware in your routes.

server.js

server.js
14 lines


const express = require('express')
const rateLimiter = require('./middleware/rateLimiter')

const app = express()
const port = process.env.PORT || 5000

app.use(rateLimiter)

app.get('/api/data', (req, res) => {
  res.json({ message: 'Data retrieved successfully' })
})

app.listen(port, () => console.log(`Server running on port ${port}`))
In this setup:

Each request increments the user’s request count in Redis.
If the user exceeds 100 requests within the hour, they receive a 429 Too Many Requests response.
Using Redis Pub/Sub for Real-Time Messaging
Redis’s Pub/Sub feature allows for real-time messaging, making it ideal for notifications, chat applications, and broadcasting events across services.

Setting Up Redis Pub/Sub
Publisher: Publishes messages to a channel.
Subscriber: Listens for messages on a channel.
publisher.js

index.js
8 lines


const client = require('./redisClient')

const publishMessage = async (channel, message) => {
  await client.publish(channel, message)
}

publishMessage('news', 'Breaking News: Redis Pub/Sub in Node.js!')
subscriber.js

index.js
10 lines


const client = require('./redisClient')

const subscribeToChannel = async (channel) => {
  await client.subscribe(channel, (message) => {
    console.log(`Received message on ${channel}: ${message}`)
  })
}

subscribeToChannel('news')
In this setup:

The publisher sends messages to the news channel.
The subscriber listens to the news channel and logs any incoming messages.
Advanced Redis Use Cases
Session Storage: Redis is commonly used for storing user session data
in distributed systems. 2. Distributed Locks: Redis can implement distributed locking to coordinate access to shared resources. 3. Task Queues: Use Redis to create a task queue, especially with libraries like Bull to manage job processing.

Best Practices for Using Redis
Set Expiration for Cache Data: Define TTL for cache data to avoid stale data and free up memory.
Monitor Redis Performance: Use tools like Redis Monitor and Redis Insight to track performance.
Avoid Overuse of Redis: Cache only frequently accessed data. Overusing Redis can increase memory consumption.
Use Redis for Real-Time Use Cases: Redis is excellent for real-time applications but may not be the best choice for persistent, critical data.
Conclusion
Redis is a powerful and flexible tool for caching, real-time messaging, and managing application state in Node.js. By mastering Redis data types, caching strategies, rate limiting, and Pub/Sub, you can build fast, scalable, and efficient applications.

Integrate these techniques into your Node.js projects to fully leverage Redis’s capabilities, improving performance and scalability.

Mastering Redis in Node.js: A Comprehensive Guide
March 15, 2024
·
26 min read
Mastering Redis in Node.js: A Comprehensive Guide
Redis is an in-memory data structure store used as a database, cache, and message broker. It’s known for its high performance and versatility, making it a popular choice for caching, real-time analytics, session storage, and more. In this guide, we’ll explore Redis in depth, covering its core data types, caching strategies, pub/sub, and advanced use cases in Node.js applications.

Why Use Redis?
Redis provides numerous benefits, including:

High Performance: Being an in-memory store, Redis can handle high-throughput operations with low latency.
Data Persistence: Redis offers persistence options, allowing you to save data on disk.
Versatile Data Structures: Redis supports various data types, including strings, hashes, lists, sets, and sorted sets.
Pub/Sub Messaging: Redis’s publish/subscribe model enables real-time communication between services.
With these features, Redis is ideal for caching, session storage, rate limiting, real-time notifications, and more.

Redis Architecture Overview
graph TB
    subgraph "Application Layer"
        APP1[Node.js App 1]
        APP2[Node.js App 2]
        APP3[Node.js App 3]
    end
    
    subgraph "Redis Layer"
        subgraph "Redis Instance"
            MEM[In-Memory Storage<br/>Primary data storage]
            PERS[Persistence Layer<br/>RDB + AOF]
        end
        
        subgraph "Data Types"
            STR[Strings<br/>Simple key-value]
            HASH[Hashes<br/>Field-value pairs]
            LIST[Lists<br/>Ordered collections]
            SET[Sets<br/>Unique values]
            ZSET[Sorted Sets<br/>Scored unique values]
        end
        
        subgraph "Features"
            PUB[Pub/Sub<br/>Messaging]
            EXPIRE[Expiration<br/>TTL support]
            TRANS[Transactions<br/>MULTI/EXEC]
        end
    end
    
    subgraph "Storage Layer"
        RDB[(RDB Files<br/>Point-in-time snapshots)]
        AOF[(AOF Files<br/>Append-only logs)]
    end
    
    APP1 --> MEM
    APP2 --> MEM
    APP3 --> MEM
    
    MEM --> STR
    MEM --> HASH
    MEM --> LIST
    MEM --> SET
    MEM --> ZSET
    
    MEM --> PUB
    MEM --> EXPIRE
    MEM --> TRANS
    
    PERS --> RDB
    PERS --> AOF
    
    style MEM fill:#e1f5fe
    style STR fill:#f3e5f5
    style HASH fill:#fff3e0
    style LIST fill:#e8f5e8
    style PUB fill:#fce4ec

Show all 55 lines

Setting Up Redis in Node.js
Step 1: Install Redis Server
To use Redis locally, download and install it from the official Redis website or install it via a package manager.

script.sh
5 lines


# macOS with Homebrew
brew install redis
# Ubuntu
sudo apt update && sudo apt install redis-server
Step 2: Install Redis Client for Node.js
In your Node.js project, install the redis package:

npm install redis

Step 3: Configure Redis Client in Node.js
Create a redisClient.js file to initialize and export the Redis client.

redisClient.js

config.js
13 lines


const redis = require('redis')

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

client.on('connect', () => console.log('Connected to Redis'))
client.on('error', (err) => console.error('Redis connection error:', err))

client.connect()

module.exports = client
In this configuration:

connect logs successful connections, and error logs any connection issues.
You can customize the Redis URL, password, or port as needed in production.
Core Redis Data Types and Operations
Redis supports various data types, each suitable for different use cases. Let’s go over the main ones and how to use them in Node.js.

1. Strings
Strings are the simplest data type in Redis, used for storing text, numbers, JSON, or serialized objects.

Set and Get Strings
index.js
7 lines


// Set a string value
await client.set('name', 'Redis')

// Get the value of a key
const name = await client.get('name')
console.log(name) // Output: Redis
2. Hashes
Hashes store key-value pairs within a key, similar to objects in JavaScript. They are useful for representing structured data, like user profiles.

Set and Get Hash Fields
index.js
18 lines


// Set multiple fields in a hash
await client.hSet(
  'user:1',
  'name',
  'Alice',
  'age',
  '30',
  'email',
  'alice@example.com'
)

// Get a single field
const name = await client.hGet('user:1', 'name')

// Get all fields in the hash
const user = await client.hGetAll('user:1')
console.log(user) // Output: { name: 'Alice', age: '30', email: 'alice@example.com' }
3. Lists
Lists are ordered collections of strings, useful for queues, recent activity logs, or other ordered data.

Add and Retrieve List Items
index.js
7 lines


// Add items to a list
await client.rPush('tasks', 'Task 1', 'Task 2', 'Task 3')

// Retrieve all items in the list
const tasks = await client.lRange('tasks', 0, -1)
console.log(tasks) // Output: ['Task 1', 'Task 2', 'Task 3']
4. Sets
Sets are unordered collections of unique values, ideal for managing collections where each item must be unique (e.g., tags or user interests).

Add and Retrieve Set Members
index.js
7 lines


// Add members to a set
await client.sAdd('tags', 'redis', 'nodejs', 'database')

// Get all members of the set
const tags = await client.sMembers('tags')
console.log(tags) // Output: ['redis', 'nodejs', 'database']
5. Sorted Sets
Sorted sets are collections of unique values with a score, allowing you to retrieve items in order by their score. They’re commonly used for ranking systems, like leaderboards.

Add and Retrieve Sorted Set Members
index.js
12 lines


// Add members with scores to a sorted set
await client.zAdd('leaderboard', [
  { score: 100, value: 'Alice' },
  { score: 200, value: 'Bob' },
])

// Get sorted set members ordered by score
const leaderboard = await client.zRange('leaderboard', 0, -1, {
  WITHSCORES: true,
})
console.log(leaderboard) // Output: [ 'Alice', '100', 'Bob', '200' ]
Caching with Redis in Node.js
Redis caching helps speed up responses and reduce database load by storing frequently accessed data. Let’s implement a caching strategy in Node.js.

Example: Caching Database Queries
Suppose you have a function that retrieves books from a database. You can cache the result in Redis to avoid repeated database calls.

booksService.js

index.js
14 lines


const client = require('./redisClient')
const Book = require('./models/Book')

const getBooks = async () => {
  const cachedBooks = await client.get('books')
  if (cachedBooks) {
    return JSON.parse(cachedBooks) // Return cached data
  }

  const books = await Book.find()
  await client.set('books', JSON.stringify(books), { EX: 3600 }) // Cache for 1 hour
  return books
}
In this example:

The function first checks if books is cached in Redis.
If cached, it returns the data; otherwise, it queries the database and stores the result in Redis for 1 hour.
Rate Limiting with Redis
Rate limiting helps prevent abuse by limiting the number of requests a user can make within a given period. Redis makes it easy to track request counts and enforce limits.

Implementing Rate Limiting
Suppose we want to limit each user to 100 requests per hour. Here’s how to do it:

rateLimiter.js

config.js
23 lines


const client = require('./redisClient')

const rateLimiter = async (req, res, next) => {
  const userKey = `rate:${req.ip}` // Unique key based on user IP
  const ttl = 3600 // Time window in seconds (1 hour)

  const requests = await client.incr(userKey) // Increment request count

  if (requests === 1) {
    // Set expiration time on the first request
    await client.expire(userKey, ttl)
  }

  if (requests > 100) {
    // Deny access if request limit is exceeded
    return res.status(429).json({ message: 'Rate limit exceeded' })
  }

  next() // Proceed if limit is not exceeded
}

module.exports = rateLimiter

Show all 23 lines
Using the Rate Limiter Middleware
Apply the rate limiter as middleware in your routes.

server.js

server.js
14 lines


const express = require('express')
const rateLimiter = require('./middleware/rateLimiter')

const app = express()
const port = process.env.PORT || 5000

app.use(rateLimiter)

app.get('/api/data', (req, res) => {
  res.json({ message: 'Data retrieved successfully' })
})

app.listen(port, () => console.log(`Server running on port ${port}`))
In this setup:

Each request increments the user’s request count in Redis.
If the user exceeds 100 requests within the hour, they receive a 429 Too Many Requests response.
Using Redis Pub/Sub for Real-Time Messaging
Redis’s Pub/Sub feature allows for real-time messaging, making it ideal for notifications, chat applications, and broadcasting events across services.

Setting Up Redis Pub/Sub
Publisher: Publishes messages to a channel.
Subscriber: Listens for messages on a channel.
publisher.js

index.js
8 lines


const client = require('./redisClient')

const publishMessage = async (channel, message) => {
  await client.publish(channel, message)
}

publishMessage('news', 'Breaking News: Redis Pub/Sub in Node.js!')
subscriber.js

index.js
10 lines


const client = require('./redisClient')

const subscribeToChannel = async (channel) => {
  await client.subscribe(channel, (message) => {
    console.log(`Received message on ${channel}: ${message}`)
  })
}

subscribeToChannel('news')
In this setup:

The publisher sends messages to the news channel.
The subscriber listens to the news channel and logs any incoming messages.
Advanced Redis Use Cases
Session Storage: Redis is commonly used for storing user session data
in distributed systems. 2. Distributed Locks: Redis can implement distributed locking to coordinate access to shared resources. 3. Task Queues: Use Redis to create a task queue, especially with libraries like Bull to manage job processing.

Best Practices for Using Redis
Set Expiration for Cache Data: Define TTL for cache data to avoid stale data and free up memory.
Monitor Redis Performance: Use tools like Redis Monitor and Redis Insight to track performance.
Avoid Overuse of Redis: Cache only frequently accessed data. Overusing Redis can increase memory consumption.
Use Redis for Real-Time Use Cases: Redis is excellent for real-time applications but may not be the best choice for persistent, critical data.
Conclusion
Redis is a powerful and flexible tool for caching, real-time messaging, and managing application state in Node.js. By mastering Redis data types, caching strategies, rate limiting, and Pub/Sub, you can build fast, scalable, and efficient applications.

Integrate these techniques into your Node.js projects to fully leverage Redis’s capabilities, improving performance and scalability.



How to implement Redis pipelining in Node.Js using ioredis
Yash
Yash

Follow
4 min read
·
Mar 16, 2023
10




Hi, This article goes over how to implement pipelining in Redis using ioredis in Node.Js


We all know Redis is used as an in-memory cache. Why caching?
Sometimes our use case is fetching some piece of data again and again from our databases or some other data factory. We know that database operations are costly and quite slow when the data set is very large. So, what we do is we create a layer over our databases, Caching layer. This layer serves as a temporary storage for data and it is lightning-fast in nature. Redis serves us as this caching layer. If the data you’re looking for is present in your Redis cache, you don’t have to make a request to your database which means you save time and serve data faster to your client/front end. Redis stores data in key-value pair data structures.

For installing Redis on your machine, Please check out this — https://redis.io/docs/getting-started/installation/
Now, Once Redis is installed on your machine we need a Redis client through which our Node.Js application can connect to the Redis server. We'll be using ioredis — https://www.npmjs.com/package/ioredis

Installing ioredis on our machine —

npm install ioredis
Our problem statement —
Let’s say we are generating a lot of data in form of key-value pairs in our applications which are to be used again in near future and will become invalid after a certain amount of time.
We want this data to be served lightning-fast to our clients or front end.
Approaches —
Basic Approach —
We can store these pairs in our SQL or no-SQL databases. The insert and fetch operations on databases are not that optimized. Database calls are quite costly, and slow too.
Caching Approach —
We can store these pairs in our Redis cache. The GET operations are very fast. Once the data is invalid, We’ll remove that pair from our Redis cache.
Now, the major issue is how to feed data to Redis. What we know is that we are generating data on a very high frequency. We can SET data in Redis sequentially. But why? Why SET data sequentially, Who needs to wait for the response from the data SET operation? We will use Redis pipelining here!

Get Yash’s stories in your inbox
Join Medium for free to get updates from this writer.

Enter your email
Subscribe

Remember me for faster sign in

Redis pipelining is a technique for improving performance by issuing multiple commands at once without waiting for the response to each individual command. Pipelining is supported by most Redis clients. This document describes the problem that pipelining is designed to solve and how pipelining works in Redis.

Implementation for Redis pipelining —
// Configuring an Express app.
const express = require("express");
const Redis = require("ioredis");
const app = express();
const port = 3000;

// Setting up Redis config. There are many ways for connecting to Redis server.
// You can check this -> https://github.com/luin/ioredis#connect-to-redis
const redis = new Redis({
    port: 6379, 
    host: "127.0.0.1", 
    username: "default", 
    password: "changeit",
    db: 1
});

// I have added 2 endpoints to show the differences how sequential commands
// works, And how the pipelining works in Redis
// run-sequential endpoint is triggering a for loop which sequentially
// executes 50,000 SET operations in Redis server.

app.get("/run-sequential", async (req, res) => {
    console.time("sequential time");
    for (let i = 0; i < 50000; i++) {
        await setKeyFunction("foo", "test-test")
    }
    console.timeEnd("sequential time");
    res.send("OK");
});

// run-pipeline endpoint is creating a pipeline object.
// In the for loop we are batching commands in that pipeline object.
// After for loop, We are executing the pipeling with 50,000 commands in it.

app.get("/run-pipeline", async (req, res) => {
    console.time("pipeline time");
    const pipeline = redis.pipeline();
    for (let i = 0; i < 50000; i++) {
        pipeline.set("foo", "test-test");
    }
    await pipeline.exec();
    console.timeEnd("pipeline time");
    res.send("OK");
});

// An async function for setting a key-value pair in Redis cache
const setKeyFunction = async (name, value) => {
    return await redis.set(name, value);
}

app.listen(port, () => {
    console.log(`Io-Redis pipelining demo app listening on port ${port}`);
});
Running the application by command —
nodemon index.js 
Result time —
Press enter or click to view image in full size

Logs printed show time taken by sequential call & Pipeling call
As we can see clearly — The pipeline process took something around 243 ms whereas the sequential process took something around 2.6 seconds. This is a huge difference.

In the article, What we have seen -
1. How Redis pipelining can save plenty of our time by executing multiple commands in a single go.
2. Pipelining is not just a way to reduce the latency cost associated with the round trip time, it actually greatly improves the number of operations you can perform per second in a given Redis server.

Thanks for Visiting this page!



up the project?
We're using Redis as our database—that's the whole idea behind Redis OM. So, you'll need some Redis, specifically with Search and JSON installed. The easiest way to do this is to set up a free Redis Cloud instance. But, you can also use Docker:
docker run -p 6379:6379 redis:latest
Copied!
I'm assuming you are relatively Node.js savvy so you should be able to get that installed on your own. We'll be using the top-level await feature for modules that was introduced in Node v14.8.0 so do make sure you have that version, or a newer one. If you don't, go and get it.
Once you have that, it's time to create a project:
npm init
Copied!
Give it a name, version, and description. Use whatever you like. I called mine "Metalpedia".
Install Express and Redis OM for Node.js:
npm install express redis-om --save
Copied!
And, just to make our lives easy, we'll use nodemon:
npm install nodemon --save-dev
Copied!
Now that stuff is installed, let's set up some other details in our package.json. First, set the "type" to "module", so we can use ES6 Modules:
  "type": "module",
Copied!
The "test" script that npm init generates isn't super useful for us. Replace that with a "start" script that calls nodemon. This will allow the service we build to restart automatically whenever we change a file. Very convenient:
  "scripts": {
    "start": "nodemon server.js"
  },
Copied!
I like to make my packages private, so they don't accidentally get pushed to NPM:
  "private": true,
Copied!
Oh, and you don't need the "main" entry. We're not building a package to share. So go ahead and remove that.
Now, you should have a package.json that looks something like this:
{
    "name": "metalpedia",
    "version": "1.0.0",
    "description": "Sample application for building a music repository backed by Redis and Redis OM.",
    "type": "module",
    "scripts": {
        "start": "nodemon server.js"
    },
    "author": "Guy Royse <guy@guyroyse.com> (http://guyroyse.com/)",
    "license": "MIT",
    "private": true,
    "dependencies": {
        "express": "^4.17.1",
        "redis-om": "^0.2.0"
    },
    "devDependencies": {
        "nodemon": "^2.0.14"
    }
}
Copied!
Excellent. Set up done. Let's write some code!
#How do I set up an Express server with Redis?
I like to write my services with a little version and name endpoint at the root. That way if some random developer hits the site of the service, they'll get a clue as to what it is. So let's do that:
Create a file named server.js in the root of your project folder and populate it thus:
import express from 'express';

// create an express app and use JSON
let app = new express();
app.use(express.json());

// setup the root level GET to return name and version from package.json
app.get('/', (req, res) => {
    res.send({
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
    });
});

// start listening
app.listen(8080);
Copied!
We now have enough to actually run something. So let's run it:
npm start
Copied!
Then, hit http://localhost:8080/ in your favorite browser. You should see something like this:
{
    "name": "metalpedia",
    "version": "1.0.0"
}
Copied!
Or, hit your service using curl (and json_pp if you want to be fancy):
$ curl -X GET http://localhost:8080 -s | json_pp
{
  "name": "metalpedia",
  "version": "1.0.0"
}
Copied!
Cool. Let's add some Redis.
#How do I map JavaScript objects to Redis JSON?
We're going to use Redis OM to map data for a song from JSON data in Redis to JavaScript objects.
Create a file named song-repository.js in the root of your project folder. In it, import all the parts from Redis OM that you'll need:
import { Entity, Schema, Client, Repository } from 'redis-om';
Copied!
Entities are the classes that you work with—the thing being mapped to. They are what you create, read, update, and delete. Any class that extends Entity is an entity. We'll define our Song entity with a single line for now, but we'll add some more to it later:
class Song extends Entity {}
Copied!
Schemas define the fields on your entity, their types, and how they are mapped internally to Redis. By default, entities map to Hashes in Redis but we want ours to use JSON instead. When a Schema is created, it will add properties to the provided entity class based on the schema information provided. Here's a Schema that maps to our Song:
let schema = new Schema(Song, {
    title: { type: 'string' }, // the title of the song
    artist: { type: 'string' }, // who performed the song
    genres: { type: 'string[]' }, // array of strings for the genres of the song
    lyrics: { type: 'text' }, // the full lyrics of the song
    music: { type: 'text' }, // who wrote the music for the song
    year: { type: 'number' }, // the year the song was releases
    duration: { type: 'number' }, // the duration of the song in seconds
    link: { type: 'string' }, // link to a YouTube video of the song
});
Copied!
Clients are used to connect to Redis. Create a Client and pass your Redis URL in the constructor. If you don't specify a URL, it will default to redis://localhost:6379. Clients have methods to .open, .close, and .execute raw Redis commands, but we're just going to open it:
let client = await new Client().open();
Copied!
NOTE
Remember that top-level await stuff I mentioned at the top of the document? There it is!
Now we have all the pieces that we need to create a Repository. Repositories are the main interface into Redis OM. They give us the methods to read, write, and remove entities. Create a repository—and make sure it's exported as you'll need it when we get into the Express stuff:
export let songRepository = client.fetchRepository(schema);
Copied!
We're almost done with setting up our repository. But we still need to create an index or we won't be able to search on anything. We do that by calling .createIndex. If an index already exists and it's the same, this function won't do anything. If it is different, it'll drop it and create a new one. In a real environment, you'd probably want to create your index as part of CI/CD. But we'll just cram them into our main code for this example:
await songRepository.createIndex();
Copied!
We have what we need to talk to Redis. Now, let's use it to make some routes in Express.
#How do I implement CRUD operations with Redis OM?
Let's create a truly RESTful API with the CRUD operations mapping to PUT, GET, POST, and DELETE respectively. We're going to do this using Express Routers as this makes our code nice and tidy. So, create a file called song-router.js in the root of your project folder. Then add the imports and create a Router:
import { Router } from 'express';
import { songRepository as repository } from './song-repository.js';

export let router = Router();
Copied!
This router needs to be added in server.js under the /song path so let's do that next. Add the following line of code to at the top of server.js—with all the other imports—to import the song router:
import { router as songRouter } from './song-router.js';
Copied!
Also add a line of code to call .use so that the router we are about to implement is, well, used:
app.use('/song', songRouter);
Copied!
Our server.js should now look like this:
import express from 'express';
import { router as songRouter } from './song-router.js';

// create an express app and use JSON
let app = new express();
app.use(express.json());

// bring in some routers
app.use('/song', songRouter);

// setup the root level GET to return name and version from package.json
app.get('/', (req, res) => {
    res.send({
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
    });
});

// start listening
app.listen(8080);
Copied!
#Add a Create Route
Now, let's start putting some routes in our song-router.js. We'll create a song first as you need to have songs in Redis before you can do any of the reading, updating, or deleting of them. Add the PUT route below. This route will call .createEntity to create an entity, set all the properties on the newly created entity, and then call .save to persist it:
router.put('/', async (req, res) => {
    // create the Song so we can save it
    let song = repository.createEntity();

    // set all the properties, converting missing properties to null
    song.title = req.body.title ?? null;
    song.artist = req.body.artist ?? null;
    song.genres = req.body.genres ?? null;
    song.lyrics = req.body.lyrics ?? null;
    song.music = req.body.music ?? null;
    song.year = req.body.year ?? null;
    song.duration = req.body.duration ?? null;
    song.link = req.body.link ?? null;

    // save the Song to Redis
    let id = await repository.save(song);

    // return the id of the newly created Song
    res.send({ id });
});
Copied!
Now that we have a way to shove songs into Redis, let's start shoving. Out on GitHub, there are a bunch of JSON files with song data in them. (Thanks Dylan!) Go ahead and pull those down and place them in a folder under your project root called songs.
Let's use curl to load in a song. I'm partial to HTML, sung to the tune of AC/DC's Highway to Hell, so let's use that one:
curl -X PUT -H "Content-Type: application/json" -d "@songs/html.json" http://localhost:8080/song -s | json_pp
Copied!
You should get back the ID of that newly inserted song:
{
    "id": "01FKRW9WMVXTGF71NBEM3EBRPY"
}
Copied!
We're shipping HTML indeed. If you have the redis-cli handy—or want to use Redis Insight—you can take a look and see how Redis has stored this:
> json.get Song:01FKRW9WMVXTGF71NBEM3EBRPY
"{"title":"HTML","artist":"Dylan Beattie and the Linebreakers","genres":["blues rock","hard rock","parody","rock"],"lyrics":"W3C, RFC, a JIRA ticket and a style guide.\\
I deploy with FTP, run it all on the client side\\
Don\xe2\x80\x99t need Ruby, don\xe2\x80\x99t need Rails,\\
Ain\xe2\x80\x99t nothing running on my stack\\
I\xe2\x80\x99m hard wired, for web scale,\\
Yeah, I\xe2\x80\x99m gonna bring the 90s back\\
\\
I\xe2\x80\x99m shipping HTML,\\
HTML,\\
I\xe2\x80\x99m shipping HTML,\\
HTML\xe2\x80\xa6\\
\\
No logins, no trackers,\\
No cookie banners to ignore\\
I ain\xe2\x80\x99t afraid of, no hackers\\
Just the occasional 404\\
They hatin\xe2\x80\x99, what I do,\\
But that\xe2\x80\x99s \xe2\x80\x98cos they don\xe2\x80\x99t understand\\
Mark it up, break it down,\\
Remember to escape your ampersands\xe2\x80\xa6\\
\\
I\xe2\x80\x99m shipping HTML,\\
HTML,\\
I\xe2\x80\x99m shipping HTML,\\
HTML\xe2\x80\xa6\\
\\
(But it\xe2\x80\x99s really just markdown.)","music":"\"Highway to Hell\" by AC/DC","year":2020,"duration":220,"link":"https://www.youtube.com/watch?v=woKUEIJkwxI"}"
Copied!
Yep. Looks like JSON.
#Add a Read Route
Create down, let's add a GET route to read this song from HTTP instead of using the redis-cli:
router.get('/:id', async (req, res) => {
    // fetch the Song
    let song = await repository.fetch(req.params.id);

    // return the Song we just fetched
    res.send(song);
});
Copied!
Now you can use curl or your browser to load http://localhost:8080/song/01FKRW9WMVXTGF71NBEM3EBRPY to fetch the song:
curl -X GET http://localhost:8080/song/01FKRW9WMVXTGF71NBEM3EBRPY -s | json_pp
Copied!
And you should get back the JSON for the song:
{
    "link": "https://www.youtube.com/watch?v=woKUEIJkwxI",
    "genres": ["blues rock", "hard rock", "parody", "rock"],
    "entityId": "01FKRW9WMVXTGF71NBEM3EBRPY",
    "title": "HTML",
    "lyrics": "W3C, RFC, a JIRA ticket and a style guide.\
I deploy with FTP, run it all on the client side\
Don't need Ruby, don't need Rails,\
Ain't nothing running on my stack\
I'm hard wired, for web scale,\
Yeah, I'm gonna bring the 90s back\
\
I'm shipping HTML,\
HTML,\
I'm shipping HTML,\
HTML…\
\
No logins, no trackers,\
No cookie banners to ignore\
I ain't afraid of, no hackers\
Just the occasional 404\
They hatin', what I do,\
But that's ‘cos they don't understand\
Mark it up, break it down,\
Remember to escape your ampersands…\
\
I'm shipping HTML,\
HTML,\
I'm shipping HTML,\
HTML…\
\
(But it's really just markdown.)",
    "duration": 220,
    "artist": "Dylan Beattie and the Linebreakers",
    "music": ""Highway to Hell" by AC/DC",
    "year": 2020
}
Copied!
Now that we can read and write, let's implement the REST of the HTTP verbs. REST... get it?
#Add an Update Route
Here's the code to update using a POST route. You'll note this code is nearly identical to the GET route. Feel free to refactor to a helper function but since this is just a tutorial, I'll skip that for now.:
router.post('/:id', async (req, res) => {
    // fetch the Song we are replacing
    let song = await repository.fetch(req.params.id);

    // set all the properties, converting missing properties to null
    song.title = req.body.title ?? null;
    song.artist = req.body.artist ?? null;
    song.genres = req.body.genres ?? null;
    song.lyrics = req.body.lyrics ?? null;
    song.music = req.body.music ?? null;
    song.year = req.body.year ?? null;
    song.duration = req.body.duration ?? null;
    song.link = req.body.link ?? null;

    // save the Song to Redis
    let id = await repository.save(song);

    // return the id of the Song we just saved
    res.send({ id });
});
Copied!
And the curl command to try it out, replacing Dylan's HTML with D.M.C.A.—sung to the tune of Y.M.C.A. by the Village People:
curl -X POST -H "Content-Type: application/json" -d "@songs/d-m-c-a.json" http://localhost:8080/song/01FKRW9WMVXTGF71NBEM3EBRPY -s | json_pp
Copied!
You should get back the ID of that updated song:
{
    "id": "01FKRW9WMVXTGF71NBEM3EBRPY"
}
Copied!
#Add a Delete Route
And, finally, let's implement a DELETE route:
router.delete('/:id', async (req, res) => {
    // delete the Song with its id
    await repository.remove(req.params.id);

    // respond with OK
    res.type('application/json');
    res.send('OK');
});
Copied!
And test it out:
$ curl -X DELETE http://localhost:8080/song/01FKRW9WMVXTGF71NBEM3EBRPY -s
OK
Copied!
This just returns "OK", which is technically JSON but aside from the response header, is indistinguishable from plain text.
#How do I search Redis data with Redis OM?
All the CRUD is done. Let's add some search. Search is where Redis OM really starts to shine. We're going to create routes to:
Return all the songs, like, all of them.
Fetch songs for a particular artist, like "Dylan Beattie and the Linebreakers".
Fetch songs that are in a certain genre, like "rock" or "electronic".
Fetch songs between years, like all the songs from the 80s.
Fetch songs that have certain words in their lyrics, like "html" or "markdown".
#Load Songs into Redis
Before we get started, let's load up Redis with a bunch of songs—so we have stuff to search for. I've written a short shell script that loads all the song data on GitHub into Redis using the server we just made. It just calls curl in a loop. It's on GitHub, so go grab it and put it in your project root. Then run it:
./load-data.sh
Copied!
You should get something like:
{"id":"01FM310A8AVVM643X13WGFQ2AR"} <- songs/big-rewrite.json
{"id":"01FM310A8Q07D6S7R3TNJB146W"} <- songs/bug-in-the-javascript.json
{"id":"01FM310A918W0JCQZ8E57JQJ07"} <- songs/d-m-c-a.json
{"id":"01FM310A9CMJGQHMHY01AP0SG4"} <- songs/enterprise-waterfall.json
{"id":"01FM310A9PA6DK4P4YR275M58X"} <- songs/flatscreens.json
{"id":"01FM310AA2XTEQV2NZE3V7K3M7"} <- songs/html.json
{"id":"01FM310AADVHEZXF7769W6PQZW"} <- songs/lost-it-on-the-blockchain.json
{"id":"01FM310AASNA81Y9ACFMCGP05P"} <- songs/meetup-2020.json
{"id":"01FM310AB4M2FKTDPGEEMM3VTV"} <- songs/re-bass.json
{"id":"01FM310ABFGFYYJXVABX2YXGM3"} <- songs/teams.json
{"id":"01FM310ABW0ANYSKN9Q1XEP8BJ"} <- songs/tech-sales.json
{"id":"01FM310AC6H4NRCGDVFMKNGKK3"} <- songs/these-are-my-own-devices.json
{"id":"01FM310ACH44414RMRHPCVR1G8"} <- songs/were-gonna-build-a-framework.json
{"id":"01FM310ACV8C72Y69VDQHA12C1"} <- songs/you-give-rest-a-bad-name.json
Copied!
Note that this script will not erase any data. So any songs that you have in there already will still be there, alongside these. And if you run this script more than once, it will gleefully add the songs a second time.
#Adding a Songs Router
Like with the CRUD operations for songs, we need to first create a router. This time we'll name the file songs-router.js. Note the plural. Add all the imports and exports to that file like before:
import { Router } from 'express';
import { songRepository as repository } from './song-repository.js';

export let router = Router();
Copied!
Add this router to Express in server.js under /songs, also like we did before. And, again, note the plural. Your server.js should now look like this:
import express from 'express';
import { router as songRouter } from './song-router.js';
import { router as songsRouter } from './songs-router.js';

// create an express app and use JSON
let app = new express();
app.use(express.json());

// bring in some routers
app.use('/song', songRouter);
app.use('/songs', songsRouter);

// setup the root level GET to return name and version from package.json
app.get('/', (req, res) => {
    res.send({
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
    });
});

// start listening
app.listen(8080);
Copied!
#Add Some Search Routes
Now we can add some search routes. We initiate a search by calling .search on our repository. Then we call .where to add any filters we want—if we want any at all. Once we've specified the filters, we call .returnAll to get all the matching entities.
Here's the simplest search—it just returns everything. Go ahead and add it to songs-router.js:
router.get('/', async (req, res) => {
    let songs = await repository.search().returnAll();
    res.send(songs);
});
Copied!
Then try it out with curl or your browser:
curl -X GET http://localhost:8080/songs -s | json_pp
Copied!
We can search for a specific field by calling .where and .eq. This route finds all songs by a particular artist. Note that you must specify the complete name of the artist for this to work:
router.get('/by-artist/:artist', async (req, res) => {
    let artist = req.params.artist;
    let songs = await repository
        .search()
        .where('artist')
        .eq(artist)
        .returnAll();
    res.send(songs);
});
Copied!
Then try it out with curl or your browser too:
curl -X GET http://localhost:8080/songs/by-artist/Dylan%20Beattie -s | json_pp
Copied!
Genres are stored as an array of strings. You can use .contains to see if the array contains that genre or not:
router.get('/by-genre/:genre', async (req, res) => {
    let genre = req.params.genre;
    let songs = await repository
        .search()
        .where('genres')
        .contains(genre)
        .returnAll();
    res.send(songs);
});
Copied!
And try it out:
curl -X GET http://localhost:8080/songs/by-genre/rock -s | json_pp
curl -X GET http://localhost:8080/songs/by-genre/parody -s | json_pp
Copied!
This route lets you get all the songs between two years. Great for finding all those 80s hits. Of course, all of Dylan's songs are more recent than that, so we'll go a little more narrow when we try it out:
router.get('/between-years/:start-:stop', async (req, res) => {
    let start = Number.parseInt(req.params.start);
    let stop = Number.parseInt(req.params.stop);
    let songs = await repository
        .search()
        .where('year')
        .between(start, stop)
        .returnAll();
    res.send(songs);
});
Copied!
And, try it out, of course:
curl -X GET http://localhost:8080/songs/between-years/2020-2021 -s | json_pp
Copied!
Let's add the final route to find songs that have certain words in the lyrics using .match:
router.get('/with-lyrics/:lyrics', async (req, res) => {
    let lyrics = req.params.lyrics;
    let songs = await repository
        .search()
        .where('lyrics')
        .match(lyrics)
        .returnAll();
    res.send(songs);
});
Copied!
We can try this out too, getting all the songs that contain both the words "html" and "markdown":
curl -X GET http://localhost:8080/songs/with-lyrics/html%20markdown -s | json_pp
Copied!
#Wrapping Up
And that's a wrap. I've walked you through some of the basics with this tutorial. But you should totally go deeper. If you want to learn more, go ahead and check out Redis OM for Node.js on GitHub. It explains the capabilities of Redis OM for Node.js in greater detail.
If you have any questions or are stuck, feel free to jump on the Redis Discord server and ask there. I'm always hanging out and happy to help.
And, if you find a flaw, bug, or just think this tutorial could be improved, send a pull request or open an issue.
Thanks!
#Next steps
Now that you've built a CRUD API with Redis OM, here are some ways to keep going:
Learn the fundamentals: If you haven't already, check out the Getting Started with Node and Redis tutorial for a deeper dive into the node-redis client library that Redis OM builds on.
Explore Redis OM in depth: The Redis OM for Node.js README covers advanced schema options, custom entity IDs, and more complex search queries.
Add vector search: Combine Redis OM with Redis vector search to build AI-powered similarity search into your API.
Deploy to production: Set up a free Redis Cloud instance to move beyond your local Docker setup.