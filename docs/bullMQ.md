# Producers

Job producers add jobs to queues. Producers are typically application services (Nest providers). To add jobs to a queue, first inject the queue into the service as follows:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

{% hint style="info" %}
The **`@InjectQueue()`** decorator identifies the queue by its name, as provided in the **`registerQueue()`**.
{% endhint %}

Now, add a job by calling the queue's add() method.

```typescript
const job = await this.audioQueue.add('sample', {
  foo: 'bar',
});
```

## Flow Producers

To add flows, first inject the flow producer into the service as follows:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { FlowProducer } from 'bullmq';

@Injectable()
export class FlowService {
  constructor(
    @InjectFlowProducer('flow') private fooFlowProducer: FlowProducer,
  ) {}
}
```

{% hint style="info" %}
The **`@InjectFlowProducer()`** decorator identifies the flow producer by its `name`, as provided in the **`registerFlowProducer()`**.
{% endhint %}

Now, add a flow by calling the flow producer's \`add()\`\` method.

```typescript
const job = await this.fooFlowProducer.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name,
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
    },
  ],
});
```

### Read more:

* 💡 [Queues Technique](https://docs.nestjs.com/techniques/queues)


# Producers

Job producers add jobs to queues. Producers are typically application services (Nest providers). To add jobs to a queue, first inject the queue into the service as follows:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

{% hint style="info" %}
The **`@InjectQueue()`** decorator identifies the queue by its name, as provided in the **`registerQueue()`**.
{% endhint %}

Now, add a job by calling the queue's add() method.

```typescript
const job = await this.audioQueue.add('sample', {
  foo: 'bar',
});
```

## Flow Producers

To add flows, first inject the flow producer into the service as follows:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { FlowProducer } from 'bullmq';

@Injectable()
export class FlowService {
  constructor(
    @InjectFlowProducer('flow') private fooFlowProducer: FlowProducer,
  ) {}
}
```

{% hint style="info" %}
The **`@InjectFlowProducer()`** decorator identifies the flow producer by its `name`, as provided in the **`registerFlowProducer()`**.
{% endhint %}

Now, add a flow by calling the flow producer's \`add()\`\` method.

```typescript
const job = await this.fooFlowProducer.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name,
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
    },
  ],
});
```

### Read more:

* 💡 [Queues Technique](https://docs.nestjs.com/techniques/queues)

# Connections

In order to start working with a Queue, a connection to a Redis instance is necessary. BullMQ uses the node module [ioredis](https://github.com/luin/ioredis), and the options you pass to BullMQ are just passed to the constructor of ioredis. If you do not provide any options, it will default to port 6379 and localhost.

Every class will consume at least one Redis connection, but it is also possible to reuse connections in some situations. For example, the *Queue* and *Worker* classes can accept an existing ioredis instance, and by that reusing that connection, however *QueueScheduler* and *QueueEvents* cannot do that because they require blocking connections to Redis, which makes it impossible to reuse them.

Some examples:

```typescript
import { Queue, Worker } from 'bullmq';

// Create a new connection in every instance
const myQueue = new Queue('myqueue', {
  connection: {
    host: 'myredis.taskforce.run',
    port: 32856,
  },
});

const myWorker = new Worker('myqueue', async job => {}, {
  connection: {
    host: 'myredis.taskforce.run',
    port: 32856,
  },
});
```

```typescript
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis();

// Reuse the ioredis instance in 2 different producers
const myFirstQueue = new Queue('myFirstQueue', { connection });
const mySecondQueue = new Queue('mySecondQueue', { connection });
```

```typescript
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

// Reuse the ioredis instance in 2 different consumers
const myFirstWorker = new Worker('myFirstWorker', async job => {}, {
  connection,
});
const mySecondWorker = new Worker('mySecondWorker', async job => {}, {
  connection,
});
```

Note that in the third example, even though the ioredis instance is being reused, the worker will create a duplicated connection that it needs internally to make blocking connections. Consult the [ioredis](https://github.com/luin/ioredis/blob/master/API.md) documentation to learn how to properly create an instance of `IORedis`.

#### `maxRetriesPerRequest`

This setting tells the ioredis client how many times to try a command that fails before throwing an error. So even though Redis is not reachable or offline, the command will be retried until this situation changes or the maximum number of attempts is reached.

This guarantees that the workers will keep processing forever as long as there is a working connection. If you create a Redis client manually, BullMQ will throw an exception if this setting is not set to null when it is passed into worker instances.

### Queue

Also note that simple Queue instance used for managing the queue such as adding jobs, pausing, using getters, etc. usually has different requirements from the worker.

For example, say that you are adding jobs to a queue as the result of a call to an HTTP endpoint - producer service. The caller of this endpoint cannot wait forever if the connection to Redis happens to be down when this call is made. Therefore the `maxRetriesPerRequest` setting should either be left at its default (which currently is 20) or set it to another value, maybe 1 so that the user gets an error quickly and can retry later.

On the other hand, if you are adding jobs inside a Worker processor, this process is expected to happen in the background - consumer service. In this case you can share the same connection.

For more details, refer to the [persistent connections](https://docs.bullmq.io/bull/patterns/persistent-connections) page.

{% hint style="danger" %}
When using ioredis connections, be careful not to use the "keyPrefix" option in [ioredis](https://redis.github.io/ioredis/interfaces/CommonRedisOptions.html#keyPrefix) as this option is not compatible with BullMQ, which provides its own key prefixing mechanism by using [prefix](https://api.docs.bullmq.io/interfaces/v5.QueueOptions.html#prefix) option.
{% endhint %}

If you can afford many connections, by all means just use them. Redis connections have quite low overhead, so you should not need to care about reusing connections unless your service provider imposes hard limitations.

{% hint style="danger" %}
Make sure that your redis instance has the setting

`maxmemory-policy=noeviction`

in order to avoid automatic removal of keys which would cause unexpected errors in BullMQ
{% endhint %}
# Queues

A Queue is nothing more than a list of jobs waiting to be processed. The jobs can be small, message like, so that the queue can be used as a message broker, or they can be larger long running jobs.

Queues are controlled with the `Queue` class. As all classes in BullMQ, this is a lightweight class with a handful of methods that gives you control over the queue:

```typescript
const queue = new Queue('Cars');
```

{% hint style="info" %}
See [Connections](https://docs.bullmq.io/guide/connections) for details on how to pass Redis details to use by the queue.
{% endhint %}

When you instantiate a Queue, BullMQ will just *upsert* a small "meta-key", so if the queue existed before it will just pick it up and you can continue adding jobs to it.

The most important method is probably the [***add***](https://api.docs.bullmq.io/classes/v5.Queue.html#add) method. This method allows you to add jobs to the queue in different fashions:

```typescript
await queue.add('paint', { color: 'red' });
```

The code above will add a job named *paint* to the queue, with payload `{ color: 'red' }`. This job will now be stored in Redis in a list waiting for some worker to pick it up and process it. Workers may not be running when you add the job, however as soon as one worker is connected to the queue it will pick the job and process it.

When adding a job you can also specify an options object. This options object can dramatically change the behaviour of the added jobs. For example you can add a job that is delayed:

```typescript
await queue.add('paint', { color: 'blue' }, { delay: 5000 });
```

The job will now wait **at** **least** 5 seconds before it is processed.

{% hint style="danger" %}
Prior to BullMQ 2.0, in order for delay jobs to work you need to have at least one `QueueScheduler` somewhere in your infrastructure. Read more [here](https://docs.bullmq.io/guide/queuescheduler).

From BullMQ 2.0 and onwards, the `QueueScheduler` is not needed anymore.
{% endhint %}

There are many other options available such as priorities, backoff settings, lifo behaviour, remove-on-complete policies, etc. Please check the remainder of this guide for more information regarding these options.

## Read more:

* 💡 [Queue API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html)
# Workers

Workers are the actual instances that perform some job based on the jobs that are added in the queue. A worker is equivalent to a "message" receiver in a traditional message queue. The worker's duty is to complete the job. If it succeeds, the job will be moved to the "completed" status. If the worker throws an exception during its processing, the job will automatically be moved to the "failed" status.

{% hint style="info" %}
Failed jobs can be automatically retried, see [Retrying failing jobs](https://docs.bullmq.io/guide/retrying-failing-jobs)
{% endhint %}

A worker is instantiated with the `Worker` class, and the work itself will be performed in the *process function*. Process functions are meant to be asynchronous, using either the `async` keyword or returning a promise.

```typescript
import { Worker, Job } from 'bullmq';

const worker = new Worker(queueName, async (job: Job) => {
  // Optionally report some progress
  await job.updateProgress(42);

  // Optionally sending an object as progress
  await job.updateProgress({ foo: 'bar' });

  // Do something with job
  return 'some value';
});
```

The processor function can also receive an optional third parameter for job cancellation support:

```typescript
const worker = new Worker(
  queueName,
  async (job: Job, token?: string, signal?: AbortSignal) => {
    // signal can be used to detect when a job has been cancelled
    return 'some value';
  },
);
```

{% hint style="info" %}
Learn more about [cancelling jobs](https://docs.bullmq.io/guide/workers/cancelling-jobs) in the dedicated guide.
{% endhint %}

{% hint style="info" %}
When a worker instance is created, it launches the processor immediately
{% endhint %}

In order to decide when your processor should start its execution, pass `autorun: false` as part of worker options:

```typescript
import { Worker, Job } from 'bullmq';

const worker = new Worker(
  queueName,
  async (job: Job) => {
    // Optionally report some progress
    await job.updateProgress(42);

    // Optionally sending an object as progress
    await job.updateProgress({ foo: 'bar' });

    // Do something with job
    return 'some value';
  },
  { autorun: false },
);

worker.run();
```

Note that a processor can optionally return a value. This value can be retrieved either by getting the job and accessing the `returnvalue` property or by listening to the `completed` event:

```typescript
worker.on('completed', (job: Job, returnvalue: any) => {
  // Do something with the return value.
});
```

#### Progress

Inside the worker process function it is also possible to emit progress events. Calling `job.progress` you can specify a number or an object if you have more complex needs. The `progress` event can be listened for in the same way as the `completed` event:

```typescript
worker.on('progress', (job: Job, progress: number | object) => {
  // Do something with the return value.
});
```

Finally, when the process fails with an exception it is possible to listen for the `failed` event too:

```typescript
worker.on('failed', (job: Job | undefined, error: Error, prev: string) => {
  // Do something with the return value.
});
```

It is also possible to listen to global events in order to get notifications of job completions, progress and failures:

```typescript
import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents('Paint');

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  // Called every time a job is completed by any worker.
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  // Called whenever a job is moved to failed by any worker.
});

queueEvents.on('progress', ({ jobId, data }) => {
  // jobId received a progress event
});
```

Finally, you should attach an error listener to your worker to avoid NodeJS raising an unhandled exception when an error occurs. For example:

```typescript
worker.on('error', err => {
  // log the error
  console.error(err);
});
```

{% hint style="danger" %}
If the error handler is missing, your worker may stop processing jobs when an error is emitted! Find more info [here](https://nodejs.org/api/events.html#events_error_events).
{% endhint %}

## Typescript typings

It is also possible to specify the data types for the Job data and return value using generics:

```typescript
const worker = new Worker<MyData, MyReturn>(queueName, async (job: Job) => {});
```

## Read more:

* 💡 [Worker API Reference](https://api.docs.bullmq.io/classes/v5.Worker.html)
* 💡 [Queue Events API Reference](https://api.docs.bullmq.io/classes/v5.QueueEvents.html)
# Concurrency

By default, there is no limit on the number of jobs that workers can run in parallel for every group. Even using a rate limit, that would only limit the processing speed, but still you could have an unbounded number of jobs processed simultaneously in every group.

It is possible to constrain how many jobs are allowed to be processed concurrently per group. For example, if you choose 3 as max concurrency factor, the workers will never work on more than 3 jobs at the same time for any given group. This limits only the group; you could have any number of concurrent jobs as long as they are not from the same group.

The concurrency factor is configured as follows:

```typescript
import { WorkerPro } from '@taskforcesh/bullmq-pro';

const worker = new WorkerPro('myQueue', processFn, {
  group: {
    concurrency: 3, // Limit to max 3 parallel jobs per group
  },
  concurrency: 100,
  connection,
});
```

The concurrency factor is global, so in the example above, independently of the concurrency factor per worker or the number of workers that you instantiate in your application, it will never process more than 3 jobs per group at any given time.
# Graceful shutdown

BullMQ supports graceful shutdowns of workers. This is important so that we can minimize stalled jobs when a worker for some reason must be shutdown. But note that even in the event of a "ungraceful shutdown", the stalled mechanism in BullMQ allows for new workers to pick up stalled jobs and continue working on them.

{% hint style="danger" %}
Prior to BullMQ 2.0, in order for stalled jobs to be picked up by other workers you need to have a [`QueueScheduler`](https://docs.bullmq.io/guide/queuescheduler) class running in the system.

From BullMQ 2.0 and onwards, the `QueueScheduler` is not needed anymore, so the information above is only valid for older versions.
{% endhint %}

In order to perform a shutdown just call the ***`close`*** method:

```typescript
await worker.close();
```

The above call will mark the worker as *closing* so it will not pick up new jobs, and at the same time it will wait for all the current jobs to be processed (or failed). This call will not timeout by itself, so you should make sure that your jobs finalize in a timely manner. If this call fails for some reason or it is not able to complete, the pending jobs will be marked as stalled and processed by other workers (if correct stalled options are configured on the [`QueueScheduler`](https://api.docs.bullmq.io/interfaces/v1.QueueSchedulerOptions.html)).
# Rate limiting

BullMQ provides queue rate limiting. It is possible to configure workers so that they obey a given rate limiting option:

```typescript
import { Worker, QueueScheduler } from 'bullmq';

const worker = new Worker('painter', async job => paintCar(job), {
  limiter: {
    max: 10,
    duration: 1000,
  },
});

const scheduler = new QueueScheduler('painter');
```

{% hint style="warning" %}
Jobs that get rate limited will actually stay in the waiting state.
{% endhint %}

{% hint style="danger" %}
From BullMQ 2.0 and onwards, the `QueueScheduler` is not needed anymore.
{% endhint %}

{% hint style="info" %}
The rate limiter is global, so if you have for example 10 workers for one queue with the above settings, still only 10 jobs will be processed by second.
{% endhint %}

### Group keys

{% hint style="danger" %}
From BullMQ 3.0 and onwards, group keys support is removed to improve global rate limit, so the information below is only valid for older versions.
{% endhint %}

It is also possible to define a rate limiter based on group keys, for example you may want to have a rate limiter per *customer* instead of a global rate limiter for all customers:

```typescript
import { Queue, Worker, QueueScheduler } from 'bullmq';

const queue = new Queue('painter', {
  limiter: {
    groupKey: 'customerId',
  },
});

const worker = new Worker('painter', async job => paintCar(job), {
  limiter: {
    max: 10,
    duration: 1000,
    groupKey: 'customerId',
  },
});

const scheduler = new QueueScheduler('painter');

// jobs will be rate limited by the value of customerId key:
await queue.add('rate limited paint', { customerId: 'my-customer-id' });
```

### Manual rate-limit

Sometimes is useful to rate-limit a queue manually instead of based on some static options. For example, you may have an API that returns `429 Too Many Requests`, and you want to rate-limit the queue based on that response.

For this purpose, you can use the worker method **`rateLimit`** like this:

```typescript
import { Worker } from 'bullmq';

const worker = new Worker(
  'myQueue',
  async () => {
    const [isRateLimited, duration] = await doExternalCall();
    if (isRateLimited) {
      await worker.rateLimit(duration);
      // Do not forget to throw this special exception,
      // since we must differentiate this case from a failure
      // in order to move the job to wait again.
      throw Worker.RateLimitError();
    }
  },
  {
    connection,
    limiter: {
      max: 1,
      duration: 500,
    },
  },
);
```

{% hint style="warning" %}
Don't forget to pass limiter options into your worker's options as *limiter.max* is used to determine if we need to execute the rate limit validation.
{% endhint %}

### Get Queue Rate Limit Ttl

Sometimes is useful to know if our queue is rate limited.

For this purpose, you can use the **`getRateLimitTtl`** method like this:

```typescript
import { Queue } from 'bullmq';

const queue = new Queue('myQueue', { connection });
const maxJobs = 100;

const ttl = await queue.getRateLimitTtl(maxJobs);

if (ttl > 0) {
  console.log('Queue is rate limited');
}
```

### Remove Rate Limit Key

Sometimes is useful to stop a rate limit delay.

For this purpose, you can use the **`removeRateLimitKey`** method like this:

```typescript
import { Queue } from 'bullmq';

const queue = new Queue('myQueue', { connection });

await queue.removeRateLimitKey();
```

By removing rate limit key, workers will be able to pick jobs again and your rate limit counter is reset to zero.

## Read more:

* 💡 [Rate Limit API Reference](https://api.docs.bullmq.io/classes/v5.Worker.html#ratelimit)
* 💡 [Get Rate Limit Ttl API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getratelimitttl)
* 💡 [Remove Rate Limit Key API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#removeratelimitkey)
# Retrying failing jobs

As your queues process jobs, it is inevitable that over time some of these jobs will fail. In BullMQ, a job is considered failed in the following scenarios:

* The processor function defined in your [`Worker`](https://docs.bullmq.io/guide/workers) has thrown an exception.
* The job has become [*stalled*](https://docs.bullmq.io/guide/jobs/stalled) and it has consumed the "max stalled count" setting.

{% hint style="danger" %}
The exceptions thrown in a processor must be an [`Error`](https://nodejs.org/api/errors.html#class-error) object for BullMQ to work correctly.

In general, as a best practice, it is better to always throw `Error` objects. There is even an [ESLint rule](https://eslint.org/docs/latest/rules/no-throw-literal) if you want to enforce it.
{% endhint %}

## Retrying failing jobs

When a processor throws an exception, the worker will catch it and move the job to the failed set. Depending on your [Queue settings](https://docs.bullmq.io/guide/queues/auto-removal-of-jobs), the job may stay in the failed set forever, or it could be automatically removed.

Often it is desirable to automatically retry failed jobs so that we do not give up until a certain amount of retries have failed. In order to activate automatic job retries you should use the [`attempts`](https://api.docs.bullmq.io/interfaces/v5.BaseJobOptions.html#attempts) setting with a value larger than 1 (see the examples below).

BullMQ supports retries of failed jobs using back-off functions. It is possible to use the **built-in** backoff functions or provide **custom** ones. If you do not specify a back-off function, the jobs will be retried without delay as soon as they fail.

{% hint style="info" %}
Retried jobs will respect their priority when they are moved back to waiting state.
{% endhint %}

### Built-in backoff strategies

The current built-in backoff functions are **fixed** and **exponential**.

#### Fixed

With a fixed backoff, it will retry after `delay` milliseconds, so with a delay of 3000 milliseconds, it will retry *every* attempt 3000 milliseconds after the previous attempt.

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('foo');

await queue.add(
  'test-retry',
  { foo: 'bar' },
  {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 1000,
    },
  },
);
```

You can also provide a [jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) option, it will generate random delays between `delay` and 0 milliseconds depending on the percentage of jitter usage. For example, you can provide a jitter value of 0.5 value and a delay of 1000 milliseconds, it will generate a delay between `1000` milliseconds = 1 second and `1000 * 0.5` milliseconds = 500ms.

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('foo');

await queue.add(
  'test-retry',
  { foo: 'bar' },
  {
    attempts: 8,
    backoff: {
      type: 'fixed',
      delay: 1000,
      jitter: 0.5,
    },
  },
);
```

#### Exponential

With exponential backoff, it will retry after `2 ^ (attempts - 1) * delay` milliseconds. For example, with a delay of 3000 milliseconds, for the 7th attempt, it will retry `2^6 * 3000` milliseconds = 3.2 minutes after the previous attempt.

The code below shows how to specify the built-in "exponential" backoff function with a 1-second delay as a seed value, so it will retry at most 2 times (after the first attempt, reaching a total 3 attempts) spaced after 1 second, 2 seconds, and 4 seconds respectively:

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('foo');

await queue.add(
  'test-retry',
  { foo: 'bar' },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
);
```

You can also provide a [jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) option, it will generate random delays between `2 ^ (attempts - 1) * delay` and 0 milliseconds depending on the percentage of jitter usage. For example, you can provide a jitter value of 0.5 value and a delay of 3000 milliseconds, for the 7th attempt, it will generate a delay between `2^6 * 3000` milliseconds = 192000ms and `2^6 * 3000 * 0.5` milliseconds = 96000ms after the previous attempt.

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('foo');

await queue.add(
  'test-retry',
  { foo: 'bar' },
  {
    attempts: 8,
    backoff: {
      type: 'exponential',
      delay: 3000,
      jitter: 0.5,
    },
  },
);
```

You can also define the back-off strategy in the queue's `defaultJobOptions`, and it will apply to all jobs added to the queue unless overridden when adding the job. For example:

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('foo', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

await queue.add('test-retry', { foo: 'bar' });
```

{% hint style="info" %}
Jitter percentage option value must be between 0 and 1. 0 percentage means no randomness is applied (default behavior), while 1 means that random delays will be generated beween 0 and max generated value by any of our built-in strategies.
{% endhint %}

### Custom back-off strategies

If you want to define your custom backoff function, you need to define it in the worker settings:

```typescript
import { Worker } from 'bullmq';

const worker = new Worker('foo', async job => doSomeProcessing(), {
  settings: {
    backoffStrategy: (attemptsMade: number) => {
      return attemptsMade * 1000;
    },
  },
});
```

{% hint style="info" %}
If your backoffStrategy returns 0, jobs will be moved at the end of our waiting list (priority 0) or moved back to prioritized state (priority > 0).

If your backoffStrategy returns -1, jobs won't be retried, instead they will be moved to failed state.
{% endhint %}

You can then use your custom strategy when adding jobs:

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('foo');

await queue.add(
  'test-retry',
  { foo: 'bar' },
  {
    attempts: 3,
    backoff: {
      type: 'custom',
    },
  },
);
```

If you want to define multiple custom backoff types you need to define them like in the following example:

```typescript
import { Worker } from 'bullmq';

const worker = new Worker('foo', async job => doSomeProcessing(), {
  settings: {
    backoffStrategy: (
      attemptsMade: number,
      type: string,
      err: Error,
      job: Job,
    ) => {
      switch (type) {
        case 'custom1': {
          return attemptsMade * 1000;
        }
        case 'custom2': {
          return attemptsMade * 2000;
        }
        default: {
          throw new Error('invalid type');
        }
      }
    },
  },
});
```

## Read more:

* 💡 [Stop Retrying Jobs](https://docs.bullmq.io/patterns/stop-retrying-jobs)
# Events

All classes in BullMQ emit useful events that inform on the lifecycles of the jobs that are running in the queue. Every class is an `EventEmitter` and emits different events.

Some examples:

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('Paint');

myQueue.on('waiting', (job: Job) => {
  // Job is waiting to be processed.
});
```

```typescript
import { Worker } from 'bullmq';

const myWorker = new Worker('Paint');

myWorker.on('drained', () => {
  // Queue is drained, no more jobs left
});

myWorker.on('completed', (job: Job) => {
  // job has completed
});

myWorker.on('failed', (job: Job) => {
  // job has failed
});
```

The events above are local for the workers that actually completed the jobs. However, in many situations you want to listen to all the events emitted by all the workers in one single place. For this you can use the [`QueueEvents`](https://api.docs.bullmq.io/classes/v5.QueueEvents.html) class:

```typescript
import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents('Paint');

queueEvents.on('completed', ({ jobId }) => {
  // Called every time a job is completed in any worker.
});

queueEvents.on(
  'progress',
  ({ jobId, data }: { jobId: string; data: number | object }) => {
    // jobId received a progress event
  },
);
```

The `QueueEvents` class is implemented using [Redis streams](https://redis.io/topics/streams-intro). This has some nice properties, for example, it provides guarantees that the events are delivered and not lost during disconnections such as it would be the case with standard pub-sub.

{% hint style="danger" %}
The event stream is auto-trimmed so that its size does not grow too much, by default it is \~10.000 events, but this can be configured with the `streams.events.maxLen` option.
{% endhint %}

### Manual trim events

In case you need to trim your events manually, you can use **`trimEvents`** method:

{% tabs %}
{% tab title="TypeScript" %}

```typescript
import { Queue } from 'bullmq';

const queue = new Queue('paint');

await queue.trimEvents(10); // leaves 10 events
```

{% endtab %}

{% tab title="Python" %}

```python
from bullmq import Queue

queue = Queue('paint')

await queue.trimEvents(10) # leaves 10 events
```

{% endtab %}
{% endtabs %}

## Read more:

* 💡 [Queue Events API Reference](https://api.docs.bullmq.io/classes/v5.QueueEvents.html)
* 💡 [Queue Events Listener API Reference](https://api.docs.bullmq.io/interfaces/v5.QueueEventsListener.html)
* 💡 [Queue Listener API Reference](https://api.docs.bullmq.io/interfaces/v5.QueueListener.html)
* 💡 [Worker Listener API Reference](https://api.docs.bullmq.io/interfaces/v5.WorkerListener.html)
# Idempotent jobs

In order to take advantage of [the ability to retry failed jobs](https://docs.bullmq.io/guide/retrying-failing-jobs), your jobs should be designed with failure in mind.

This means that it should not make a difference to the final state of the system if a job successfully completes on its first attempt, or if it fails initially and succeeds when retried. This is called *Idempotence*.

To achieve this behaviour, your jobs should be as atomic and simple as possible. Performing many different actions (such as database updates, API calls, ...) at once makes it hard to keep track of the process flow and, if needed, rollback partial progress when an exception occurs.

Simpler jobs also means simpler debugging, identifying bottlenecks, etc.

If necessary, split complex jobs [as described in the flow pattern](https://docs.bullmq.io/patterns/flows).
# Failing fast when Redis is down

By design, BullMQ reconnects to Redis automatically. If jobs are added to a queue while the queue instance is disconnected from Redis, the `add` command will not fail; instead, the call will keep waiting for a reconnection to occur until it can complete.

This behavior is not always desirable; for example, if you have implemented a REST API that results in a call to `add`, you do not want to keep the HTTP call busy while `add` is waiting for the queue to reconnect to Redis. In this case, you can pass the option `enableOfflineQueue: false`, so that `ioredis` do not queue the commands and instead throws an exception:

```typescript
const myQueue = new Queue("transcoding", {
  connection: {
    enableOfflineQueue: false,
  },
});

app.post("/jobs", async (req, res) => {
  try {
    const job = await myQueue.add("myjob", req.body);
    res.status(201).json(job.id);
  }catch(err){
    res.status(503).send(err);
  }
})
```

Using this approach, the caller can catch the exception and act upon it depending on its requirements (for example, retrying the call or giving up).

{% hint style="danger" %}
Currently, there is a limitation in that the Redis instance must at least be online while the queue is being instantiated.
{% endhint %}
# Global Concurrency

The global concurrency factor is a queue option that determines how many jobs are allowed to be processed in parallel across all your worker instances.

```typescript
import { Queue } from 'bullmq';

await queue.setGlobalConcurrency(4);
```

And in order to get this value:

```typescript
const globalConcurrency = await queue.getGlobalConcurrency();
```

{% hint style="info" %}
Note that if you choose a concurrency level in your workers, it will not override the global one, it will just be the maximum jobs a given worker can process in parallel but never more than the global one.
{% endhint %}

### Remove Global Concurrency

It can be done using the following method:

```typescript
await queue.removeGlobalConcurrency();
```

## Read more:

* 💡 [Set Global Concurrency API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#setglobalconcurrency)
* 💡 [Get Global Concurrency API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getglobalconcurrency)
* 💡 [Remove Global Concurrency API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#removeglobalconcurrency)
# Global Rate Limit

The global rate limit config is a queue option that determines how many jobs are allowed to be processed in a specific period of time.

```typescript
import { Queue } from 'bullmq';

// 1 job per second
await queue.setGlobalRateLimit(1, 1000);
```

In order to get these values:

```typescript
const { max, duration } = await queue.getGlobalRateLimit();
```

And in order to get current ttl:

```typescript
const ttl = await queue.getRateLimitTtl();
```

{% hint style="info" %}
Note that if you choose a rate limit level in your workers, it won't override the global one.
{% endhint %}

### Remove Global Rate Limit

It can be done using the following method:

```typescript
await queue.removeGlobalRateLimit();
```

## Read more:

* 💡 [Set Global Rate Limit API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#setglobalratelimit)
* 💡 [Get Global Rate Limit API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getglobalratelimit)
* 💡 [Get Rate Limit Ttl API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getratelimitttl)
* 💡 [Remove Global Rate Limit API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#removeglobalratelimit)
# Deduplication

Sometimes, you may want to decide when you want to stop deduplicating jobs.

## Until job is active

As soon as job is moved to active, you must call **removeDeduplicationKey** method:

```typescript
import { Job, Queue, Worker } from 'bullmq';

const myQueue = new Queue('Paint');

const worker = new Worker('Paint', async (job: Job) => {
  await job.removeDeduplicationKey();
  console.log('Do something with job');
  return 'some value';
});

myQueue.add('house', { color: 'white' }, { deduplication: { id: 'house' } });
```

{% hint style="info" %}
Previous example uses [Simple Mode](https://docs.bullmq.io/guide/jobs/deduplication#simple-mode) but it can be combined with [Throttle Mode](https://docs.bullmq.io/guide/jobs/deduplication#throttle-mode) or [Debounce Mode](https://docs.bullmq.io/guide/jobs/deduplication#debounce-mode).
{% endhint %}

## Using job schedulers

Sometimes it is desired to deduplicate jobs that are generated by job schedulers to save resources and avoid unnecessary work:

Deduplication options are not available in [`JobSchedulerTemplateOptions`](https://api.docs.bullmq.io/types/v5.JobSchedulerTemplateOptions.html) because they could interfere with job creation from scheduler templates. Since a new job is added as soon as the previous one moves to the active state, deduplication could disrupt this process by preventing the addition of this new record. However, there is an alternative to handle this. Let's look at an example:

```typescript
import { Queue, Worker } from 'bullmq';

const myQueue = new Queue('Paint');

const worker = new Worker(
  'Paint',
  async job => {
    if (job.name === 'paint-trigger') {
      // Add a job that will be deduplicated for 90 seconds.
      await myQueue.add(
        'house',
        { color: 'white' },
        { deduplication: { id: 'customValue', ttl: 90000 } },
      );
    }
  },
  { connection },
);

await myQueue.upsertJobScheduler('repeat', {
  pattern: '* * * * *', // every minute
  template: {
    name: 'paint-trigger',
    data: {},
  },
});
```

In this way, you can deduplicate a job when using job schedulers.

## Read more:

* 💡 [Add Job API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#add)
* 💡 [Deduplication Reference](https://docs.bullmq.io/guide/jobs/deduplication)
* 💡 [Remove Deduplication Key API Reference](https://api.docs.bullmq.io/classes/v5.Job.html#removededuplicationkey)
* 💡 [Upsert Job Scheduler API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#upsertJobScheduler)
# Job Ids

All jobs in BullMQ need to have a unique job id. This id is used to construct a key to store the data in Redis, and as a pointer to the job as it is moved between the different states it can be in during its lifetime.

By default, job ids are generated automatically as an increasing counter, however it is also possible to specify a *custom id*.

{% hint style="info" %}
The uniqueness requirement is scoped by queue, i.e. you can have the same job id in different queues without any issues. The counter for automatically generated ids is also scoped by queue.
{% endhint %}

The main reason to be able to specify a custom id is in cases when you want to avoid duplicated jobs. Since ids must be unique, if you add a job with an existing id then that job will just be ignored and not added to the queue at all.

{% hint style="danger" %}
Jobs that are removed from the queue (either manually, or when using settings such as `removeOnComplete`/`removeOnFailed`) will **not** be considered as duplicates, meaning that you can add the same job id many times over as long as the previous job has already been removed from the queue.
{% endhint %}

In order to specify a custom job id, use the `jobId` option when adding jobs to the queue:

```typescript
await myQueue.add(
  'wall',
  { color: 'pink' },
  {
    jobId: customJobId,
  },
);
```

{% hint style="danger" %}
Custom job ids must not contain the **:** separator as it will be translated in 2 different values, since we are also following Redis naming convention. So if you need to add a separator, use a different value, for example **-**, **\_**.
{% endhint %}

## Read more:

* 💡 [Duplicated Event Reference](https://api.docs.bullmq.io/interfaces/v5.QueueEventsListener.html#duplicated)
# Delayed

Delayed jobs are a special type of job that is placed into a special "delayed set", instead of being processed as fast as possible. After the delay time has passed, the job is processed as a regular job.

In order to add delayed jobs to the queue, use the `delay` option with the amount of time (in milliseconds) that you want to delay the job with.

Note that it is not guaranteed that the job will be processed at the *exact* delayed time specified, as it depends on how busy the workers are when the time has passed, and how many other delayed jobs are scheduled at that exact time. In practice, however, the delay time is quite accurate in most cases.

This is an example of how to add delayed jobs to a queue:

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('Paint');

// Add a job that will be delayed by at least 5 seconds.
await myQueue.add('house', { color: 'white' }, { delay: 5000 });
```

If you want to process the job after a specific point in time, just add the time remaining to that point in time. For example, let's say you want to process the job on the third of July 2035 at 10:30:

```typescript
const targetTime = new Date('03-07-2035 10:30');
const delay = Number(targetTime) - Number(new Date());

await myQueue.add('house', { color: 'white' }, { delay });
```

## Change delay

If you want to reschedule a delayed job *after* inserting it, use the **`changeDelay`** method. This method reschedules the job to execute after the specified number of milliseconds from the current time, regardless of the original delay. For example:

```typescript
const job = await Job.create(queue, 'test', { foo: 'bar' }, { delay: 2000 });

// Reschedule the job to execute 4000ms (4 seconds) from now
await job.changeDelay(4000);
```

{% hint style="warning" %}
Only jobs currently in the **delayed** state can have their delay changed.
{% endhint %}

## Read more:

* 💡 [Change Delay API Reference](https://api.docs.bullmq.io/classes/v5.Job.html#changedelay)
# Prioritized

Jobs can also include a `priority` option. Using priorities, job processing order will be affected by the specified `priority` instead of following a FIFO or LIFO pattern.

{% hint style="warning" %}
Adding prioritized jobs is a slower operation than the other types of jobs, with a complexity `O(log(n))` relative to the number of jobs in the prioritized set in the queue.
{% endhint %}

Note that the priorities go from `1` to `2 097 152`, where a lower number is always a **higher** priority than higher numbers.

{% hint style="danger" %}
Jobs without a `priority` assigned will get the highest priority, being processed before jobs with priorities assigned to them.
{% endhint %}

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('Paint');

await myQueue.add('wall', { color: 'pink' }, { priority: 10 });
await myQueue.add('wall', { color: 'brown' }, { priority: 5 });
await myQueue.add('wall', { color: 'blue' }, { priority: 7 });

// The wall will be painted first brown, then blue and
// finally pink.
```

If several jobs are added with the same priority value, then the jobs within that priority will be processed in [FIFO (*First in, first out*)](https://docs.bullmq.io/guide/jobs/fifo) fashion.

## Change priority

If you want to change the `priority` after inserting a job, use the **`changePriority`** method. For example, let's say that you want to change the `priority` from `16` to `1`:

```typescript
const job = await Job.create(queue, 'test2', { foo: 'bar' }, { priority: 16 });

await job.changePriority({
  priority: 1,
});
```

or if you want to use the [LIFO (*Last In, First Out*)](https://docs.bullmq.io/guide/jobs/lifo) option:

```typescript
const job = await Job.create(queue, 'test2', { foo: 'bar' }, { priority: 16 });

await job.changePriority({
  lifo: true,
});
```

## Get Prioritized jobs

As prioritized is a new state. You must use **`getJobs`** or **`getPrioritized`** method as:

```typescript
const jobs = await queue.getJobs(['prioritized']);

const jobs2 = await queue.getPrioritized();
```

## Get Counts per Priority

If you want to get the `count` of jobs in `prioritized` status (priorities higher than 0) or in `waiting` status (priority 0), use the **`getCountsPerPriority`** method. For example, let's say that you want to get counts for `priority` `1` and `0`:

```typescript
const counts = await queue.getCountsPerPriority([1, 0]);
/*
{
  '1': 11,
  '0': 10
}
*/
```

## Read more:

* 📋 [Faster Priority jobs](https://bullmq.io/news/062123/faster-priority-jobs/)
* 💡 [Change Priority API Reference](https://api.docs.bullmq.io/classes/v5.Job.html#changepriority)
* 💡 [Get Prioritized API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getprioritized)
* 💡 [Get Counts per Priority API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getcountsperpriority)
# Repeatable

{% hint style="danger" %}
Note: from BullMQ version 5.16.0 and onwards, we have deprecated these APIs in favor of ["Job Schedulers"](https://docs.bullmq.io/guide/job-schedulers), which provide a more cohesive and more robust API for handling repeatable jobs.
{% endhint %}

There is a special type of *meta* job called **repeatable**. These jobs are special in the sense that even though you only add one job to the queue, they will keep repeating according to a predefined schedule.

Adding a job with the `repeat` option set will actually do two things immediately: create a Repeatable Job configuration, and schedule a regular delayed job for the job's first run. This first run will be scheduled "on the hour", that is if you create a job that repeats every 15 minutes at 4:07, the job will first run at 4:15, then 4:30, and so on.

The Repeatable Job configuration is not a job, so it will not show up in methods like `getJobs()`. To manage Repeatable Job configurations, use [`getRepeatableJobs()`](https://api.docs.bullmq.io/classes/v5.Queue.html#getrepeatablejobs) and similar. This also means repeated jobs do **not** participate in evaluating `jobId` uniqueness - that is, a non-repeatable job can have the same `jobId` as a Repeatable Job configuration, and two Repeatable Job configurations can have the same `jobId` as long as they have different repeat options.

Every time a repeatable job is picked up for processing, the next repeatable job is added to the queue with a proper delay. Repeatable jobs are thus nothing more than delayed jobs that are added to the queue according to some settings.

{% hint style="info" %}
As Repeatable jobs are just delayed jobs, prior to BullMQ 2.0 you also need a `QueueScheduler` instance to schedule the jobs accordingly.

However, from BullMQ 2.0 onwards, the `QueueScheduler` is not needed anymore.
{% endhint %}

There are two ways to specify a repeatable's job repetition pattern, either with a cron expression (using [cron-parser](https://www.npmjs.com/package/cron-parser)'s "unix cron w/ optional seconds" format), or specifying a fixed amount of milliseconds between repetitions.

```typescript
import { Queue, QueueScheduler } from 'bullmq';

const myQueueScheduler = new QueueScheduler('Paint');
const myQueue = new Queue('Paint');

// Repeat job once every day at 3:15 (am)
await myQueue.add(
  'submarine',
  { color: 'yellow' },
  {
    repeat: {
      pattern: '0 15 3 * * *',
    },
  },
);

// Repeat job every 10 seconds but no more than 100 times
await myQueue.add(
  'bird',
  { color: 'bird' },
  {
    repeat: {
      every: 10000,
      limit: 100,
    },
  },
);
```

There are some important considerations regarding repeatable jobs:

* Bull is smart enough not to add the same repeatable job if the repeat options are the same.
* If there are no workers running, repeatable jobs will not accumulate next time a worker is online.
* Repeatable jobs can be removed using the [`removeRepeatable`](https://api.docs.bullmq.io/classes/v5.Queue.html#removerepeatable) or [`removeRepeatableByKey`](https://api.docs.bullmq.io/classes/v5.Queue.html#removerepeatablebykey) methods.

```typescript
import { Queue } from 'bullmq';

const repeat = { pattern: '*/1 * * * * *' };

const myQueue = new Queue('Paint');

const job1 = await myQueue.add('red', { foo: 'bar' }, { repeat });
const job2 = await myQueue.add('blue', { foo: 'baz' }, { repeat });

const isRemoved1 = await myQueue.removeRepeatableByKey(job1.repeatJobKey);
const isRemoved2 = await queue.removeRepeatable('blue', repeat);
```

All repeatable jobs have a repeatable job key that holds some metadata of the repeatable job itself. It is possible to retrieve all the current repeatable jobs in the queue calling [`getRepeatableJobs`](https://api.docs.bullmq.io/classes/v5.Queue.html#getrepeatablejobs):

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('Paint');

const repeatableJobs = await myQueue.getRepeatableJobs();
```

The standard `jobId` option does not work the same as with regular jobs. Because repeatable jobs are *delayed* jobs, and the repetition is achieved by generating a new delayed job precisely before the current job starts processing, the jobs require unique ids to avoid being considered duplicates. Therefore, with repeatable jobs, the `jobId` option is used to *generate* the unique ids (rather than itself being the unique id). For instance, if you have two repeatable jobs with the same name and options, you could use distinct `jobId`s to differentiate them:

```typescript
import { Queue, QueueScheduler } from 'bullmq';

const myQueueScheduler = new QueueScheduler('Paint');
const myQueue = new Queue('Paint');

// Repeat job every 10 seconds but no more than 100 times
await myQueue.add(
  'bird',
  { color: 'bird' },
  {
    repeat: {
      every: 10000,
      limit: 100,
    },
    jobId: 'colibri',
  },
);

await myQueue.add(
  'bird',
  { color: 'bird' },
  {
    repeat: {
      every: 10000,
      limit: 100,
    },
    jobId: 'pigeon',
  },
);
```

### Slow repeatable jobs

It is worth mentioning the case where the repeatable frequency is greater than the time it takes to process a job.

For instance, let's say that you have a job that is repeated every second, but the process of the job itself takes 5 seconds. As explained above, repeatable jobs are just delayed jobs, so this means that the next repeatable job will be added as soon as the next job is starting to be processed.

In this particular example, the worker will pick up the next job and also add the next repeatable job delayed 1 second since that is the repeatable interval. The worker will require 5 seconds to process the job, and if there is only 1 worker available then the next job will need to wait a full 5 seconds before it can be processed.

On the other hand, if there were 5 workers available, then they will most likely be able to process all the repeatable jobs with the desired frequency of one job per second.

### Repeat Strategy

By default, we are using [cron-parser](https://www.npmjs.com/package/cron-parser) in the default repeat strategy for cron expressions.

It is possible to define a different strategy to schedule repeatable jobs. For example we can create a custom one for RRULE:

```typescript
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { rrulestr } from 'rrule';

const settings = {
  repeatStrategy: (millis, opts) => {
    const currentDate =
      opts.startDate && new Date(opts.startDate) > new Date(millis)
        ? new Date(opts.startDate)
        : new Date(millis);
    const rrule = rrulestr(opts.pattern);
    if (rrule.origOptions.count && !rrule.origOptions.dtstart) {
      throw new Error('DTSTART must be defined to use COUNT with rrule');
    }

    const next_occurrence = rrule.after(currentDate, false);
    return next_occurrence?.getTime();
  },
};

const myQueueScheduler = new QueueScheduler('Paint');
const myQueue = new Queue('Paint', { settings });

// Repeat job every 10 seconds
await myQueue.add(
  'bird',
  { color: 'green' },
  {
    repeat: {
      pattern: 'RRULE:FREQ=SECONDLY;INTERVAL=;WKST=MO',
    },
    jobId: 'colibri',
  },
);

await myQueue.add(
  'bird',
  { color: 'gray' },
  {
    repeat: {
      pattern: 'RRULE:FREQ=SECONDLY;INTERVAL=;WKST=MO',
    },
    jobId: 'pigeon',
  },
);

const worker = new Worker(
  'Paint',
  async () => {
    doSomething();
  },
  { settings },
);
```

{% hint style="warning" %}
As you may notice, the repeat strategy setting should be provided in `Queue` and `Worker` classes. The reason we need in **both** places is because the first time we add the job to the `Queue` we need to calculate when is the next iteration, but after that the `Worker` takes over and we use the worker settings.
{% endhint %}

{% hint style="info" %}
The repeat strategy function receives an optional `jobName` third parameter.
{% endhint %}

### Custom Repeatable Key

By default, we are generating repeatable keys base on repeat options and job name.

In some cases, it is desired to pass a custom key to be able to differentiate your repeatable jobs even when they have same repeat options:

```typescript
import { Queue } from 'bullmq';

const myQueue = new Queue('Paint', { connection });

// Repeat job every 10 seconds
await myQueue.add(
  'bird',
  { color: 'gray' },
  {
    repeat: {
      every: 10_000,
      key: 'colibri',
    },
  },
);

// Repeat job every 10 seconds
await myQueue.add(
  'bird',
  { color: 'brown' },
  {
    repeat: {
      every: 10_000,
      key: 'eagle',
    },
  },
);
```

#### Updating repeatable job's options

Using custom keys allows to update existing repeatable jobs by just adding a new repeatable job using the same key, so for instance, if we wanted to change the repetition interval of the previous job that used the key "eagle" we could just a new job like this:

```typescript
// Repeat job every 25 seconds instead of 10 seconds
await myQueue.add(
  'bird',
  { color: 'turquoise' },
  {
    repeat: {
      every: 25_000,
      key: 'eagle',
    },
  },
);
```

The code above will not create a new repeatable meta job, it will just update the existing meta job's interval from 10 seconds to 25 seconds. Note that if there is already a job delayed for running within the 10 seconds it will be replaced by a new job using the new repeatable job's settings.

### Read more:

* 💡 [Repeat Strategy API Reference](https://api.docs.bullmq.io/types/v5.RepeatStrategy.html)
* 💡 [Remove Repeatable Job API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#removerepeatable)
* 💡 [Remove Repeatable Job by Key API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#removerepeatablebykey)
# Job Schedulers

A Job Scheduler acts as a factory , producing jobs based on specified "repeat" settings. The Job Scheduler is highly flexible, accommodating various scenarios, including jobs produced at fixed intervals, according to cron expressions, or based on custom requirements. For historical reasons, jobs produced by the Job Scheduler are often referred to as ‘Repeatable Jobs’.

To create a scheduler, simply use the "upsertJobScheduler" method as demonstrated in the following example:

```typescript
// Creates a new Job Scheduler that generates a job every 1000 milliseconds (1 second)
const firstJob = await queue.upsertJobScheduler('my-scheduler-id', {
  every: 1000,
});
```

This example will create a new Job Scheduler that will produce a new job every second. It will also return the first job created for this Job Scheduler, which will be in "delayed" status waiting to be processed after 1 second.

Now there are also a few important considerations that need to be explained here.:

* **Upsert vs. Add:** the 'upsert' is used instead of 'add' to simplify management of recurring jobs, especially in production deployments. It ensures the scheduler is updated or created without duplications.
* **Job Production Rate:** The scheduler will only generate new jobs when the last job begins processing. Therefore, if your queue is very busy, or if you do not have enough workers or concurrency, it is possible that you will get the jobs less frequently than the specified repetition interval.
* **Job Status:** As long as a Job Scheduler is producing jobs, there will be always one job associated to the scheduler in the "Delayed" status.

### Using Job Templates

You can also define a template with standard names, data, and options for jobs added to a queue. This ensures that all jobs produced by the Job Scheduler inherit these settings:

```typescript
// Create jobs every day at 3:15 (am)
const firstJob = await queue.upsertJobScheduler(
  'my-scheduler-id',
  { pattern: '0 15 3 * * *' },
  {
    name: 'my-job-name',
    data: { foo: 'bar' },
    opts: {
      backoff: 3,
      attempts: 5,
      removeOnFail: 1000,
    },
  },
);
```

All jobs produced by this scheduler will use the given settings. Note that in the future you could call "upsertJobScheduler" again with the given "my-scheduler-id" in order to update any settings of this particular job scheduler, such as the repeat options or/and the job's template settings.

{% hint style="info" %}
Since jobs produced by the Job Scheduler will get a special job ID in order to guarantee that jobs will never be created more often than the given repeat settings, you cannot choose a custom job id. However you can use the job's name if you need to discriminate these jobs from other jobs.
{% endhint %}

## Read more:

* 💡 [Upsert Job Scheduler API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#upsertjobscheduler)
# Metrics

BullMQ provides a simple metrics gathering functionality that allows you to track the performance of your queues. Workers can count the number of jobs they have processed **per minute** and store this data in a list inside Redis so that it can be queried later.

You enable it on the worker settings by specifying how many data points you want to keep, which basically are counters of the number of jobs that have been processed either completed or failed during 1 minute intervals.

As the metrics are aggregated in 1 minute intervals, using the recommended duration of 2 weeks of data should take a very small amount of total space, just around 120Kb of RAM per queue. The metrics will dispose older data points automatically so this RAM consumption will never increase after it reaches the maximum number of data points.

Check in this example how to enable metrics on a worker:

```typescript
import { Worker, MetricsTime } from 'bullmq';

const myWorker = new Worker('Paint', {
  connection,
  metrics: {
    maxDataPoints: MetricsTime.ONE_WEEK * 2,
  },
});
```

{% hint style="warning" %}
You need to use the same setting on all your workers to get consistent metrics.
{% endhint %}

In order to query the metrics, use the `getMetrics` method on the `Queue` class. You can choose to gather the metrics for the *completed* or *failed* jobs:

```typescript
import { Queue } from 'bullmq';
const myQueue = new Queue('Paint', {
  connection,
});

const metrics = await queue.getMetrics('completed', 0, MetricsTime.ONE_WEEK * 2);

/* Returns a Metrics object:
{
    data: number[];
    count: number;
    meta: {
      count: number;
      prevTS: number;
      prevCount: number;
    };
  }
*/
```

Let's analyze what data we are getting back. First we have the `meta` field. The `prevTS` and `prevCount` subfields are used internally by the metrics system and should not be used, however you can use the`count` subfield to get a total number for all completed or failed jobs, this counter is not just the number of completed jobs in the given interval, but since the queue started processing jobs.

The query also returns a `data` field which is an array where every position in the array represents 1 minute of time and has the total number of jobs that completed (or failed) in that minute.

Note that the `getMetrics` method also accepts a `start` and `end` argument (`0` and `-1` by default), that you can use if you want to implement pagination.

## Read more:

* 💡 [Get Metrics API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#getmetrics)
# Prometheus

BullMQ provides a simple API to export metrics to Prometheus. To use it, create an endpoint in your web server that calls `exportPrometheusMetrics()`, and configure Prometheus to scrape metrics from this endpoint.

#### Basic Usage

Below is an example using vanilla Node.js:

```typescript
import http from 'http';
import { Queue } from 'bullmq';

const queue = new Queue('my-queue');

const server = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
      if (req.url === '/metrics' && req.method === 'GET') {
        const metrics = await queue.exportPrometheusMetrics();

        res.writeHead(200, {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(metrics),
        });
        res.end(metrics);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (err: unknown) {
      res.writeHead(500);
      res.end(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  },
);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Prometheus metrics server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
```

Test the endpoint with:

```bash
curl http://localhost:3000/metrics
```

This will return an output like:

```
HELP bullmq_job_count Number of jobs in the queue by state
TYPE bullmq_job_count gauge
bullmq_job_count{queue="my-queue", state="waiting"} 5
bullmq_job_count{queue="my-queue", state="active"} 3
bullmq_job_count{queue="my-queue", state="completed"} 12
bullmq_job_count{queue="my-queue", state="failed"} 2
```

For a simpler setup with Express.js:

```typescript
import express from 'express';
import { Queue } from './src/queue';

const app = express();
const queue = new Queue('my-queue');

app.get('/metrics', async (req, res) => {
  try {
    const metrics = await queue.exportPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Prometheus metrics server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
```

#### Advanced Usage: Adding Global Variables as Labels

The `exportPrometheusMetrics` function also supports an optional globalVariables parameter. This allows you to include additional labels (e.g., env, server) in your metrics, which is particularly useful when aggregating metrics from multiple environments (like production or staging) in tools like Grafana. The globalVariables parameter accepts a record of key-value pairs that are added as labels to each metric.

#### Example with Global Variables

Here’s how to use this feature in vanilla Node.js:

```typescript
import http from 'http';
import { Queue } from 'bullmq';

const queue = new Queue('my-queue');

const server = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    try {
      if (req.url === '/metrics' && req.method === 'GET') {
        const globalVariables = { env: 'Production', server: '1' };
        const metrics = await queue.exportPrometheusMetrics(globalVariables);

        res.writeHead(200, {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(metrics),
        });
        res.end(metrics);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (err: unknown) {
      res.writeHead(500);
      res.end(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  },
);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Prometheus metrics server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
```

With globalVariables = { env: 'Production', server: '1' }, the output becomes:

```plaintext
# HELP bullmq_job_count Number of jobs in the queue by state
# TYPE bullmq_job_count gauge
bullmq_job_count{queue="my-queue", state="waiting", env="Production", server="1"} 5
bullmq_job_count{queue="my-queue", state="active", env="Production", server="1"} 3
bullmq_job_count{queue="my-queue", state="completed", env="Production", server="1"} 12
bullmq_job_count{queue="my-queue", state="failed", env="Production", server="1"} 2
```

These additional labels allow you to filter and group metrics in Prometheus or Grafana, making it easier to distinguish between different environments or servers.

## Read more:

* 💡 [Export Prometheus Metrics API Reference](https://api.docs.bullmq.io/classes/v5.Queue.html#exportprometheusmetrics)
# Telemetry

BullMQ provides a Telemetry interface that can be used to integrate it with any external telemetry backends. Currently we support the [OpenTelemetry](https://opentelemetry.io) specification, which is the new de-facto standard for telemetry purposes, however the interface if flexible enough to support any other backends in the future.

Telemetry is very useful for large applications where you want to get a detailed and general overview of the system. For BullMQ it helps to gain insight in the different statuses a job may be during its complete lifecycle. In a large application it helpts tracking the source of the jobs and all the interactions the jobs or messages may perform with other parts of the system.
# Traces

BullMQ provides comprehensive distributed tracing support through OpenTelemetry. Traces allow you to track the flow of jobs through your system, identify bottlenecks, and debug issues across distributed services.

## Enabling Traces

To enable tracing, pass a telemetry instance when creating Queue, Worker, or FlowProducer:

```typescript
import { Queue, Worker } from 'bullmq';
import { BullMQOtel } from 'bullmq-otel';

const telemetry = new BullMQOtel({
  tracerName: 'my-app',
  version: '1.0.0',
});

const queue = new Queue('myQueue', {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
  telemetry,
});

const worker = new Worker(
  'myQueue',
  async job => {
    return 'some value';
  },
  {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
    telemetry,
  },
);
```

## Span Kinds

BullMQ uses different span kinds to categorize operations:

| Span Kind  | Description                                                         |
| ---------- | ------------------------------------------------------------------- |
| `PRODUCER` | Operations that add jobs to a queue (producing work)                |
| `CONSUMER` | Operations that process jobs from a queue (consuming work)          |
| `INTERNAL` | Internal operations like pausing, resuming, or managing queue state |

## Available Traces

BullMQ automatically creates spans for the following operations:

### Queue Class

| Operation                | Span Name                            | Span Kind | Description                          |
| ------------------------ | ------------------------------------ | --------- | ------------------------------------ |
| `add`                    | `{queueName}.add`                    | PRODUCER  | Adding a single job to the queue     |
| `addBulk`                | `{queueName}.addBulk`                | PRODUCER  | Adding multiple jobs to the queue    |
| `pause`                  | `{queueName}.pause`                  | INTERNAL  | Pausing the queue                    |
| `resume`                 | `{queueName}.resume`                 | INTERNAL  | Resuming the queue                   |
| `close`                  | `{queueName}.close`                  | INTERNAL  | Closing the queue connection         |
| `rateLimit`              | `{queueName}.rateLimit`              | INTERNAL  | Setting rate limit on the queue      |
| `removeRepeatable`       | `{queueName}.removeRepeatable`       | INTERNAL  | Removing a repeatable job by options |
| `removeRepeatableByKey`  | `{queueName}.removeRepeatableByKey`  | INTERNAL  | Removing a repeatable job by key     |
| `removeDebounceKey`      | `{queueName}.removeDebounceKey`      | INTERNAL  | Removing a debounce key              |
| `removeDeduplicationKey` | `{queueName}.removeDeduplicationKey` | INTERNAL  | Removing a deduplication key         |
| `remove`                 | `{queueName}.remove`                 | INTERNAL  | Removing a job from the queue        |
| `updateJobProgress`      | `{queueName}.updateJobProgress`      | INTERNAL  | Updating job progress                |
| `drain`                  | `{queueName}.drain`                  | INTERNAL  | Draining the queue                   |
| `clean`                  | `{queueName}.clean`                  | INTERNAL  | Cleaning jobs from the queue         |
| `obliterate`             | `{queueName}.obliterate`             | INTERNAL  | Obliterating the queue (all data)    |
| `retryJobs`              | `{queueName}.retryJobs`              | PRODUCER  | Retrying failed jobs                 |
| `promoteJobs`            | `{queueName}.promoteJobs`            | INTERNAL  | Promoting delayed jobs               |
| `trimEvents`             | `{queueName}.trimEvents`             | INTERNAL  | Trimming events from the queue       |

### Worker Class

| Operation                | Span Name                            | Span Kind | Description                            |
| ------------------------ | ------------------------------------ | --------- | -------------------------------------- |
| `getNextJob`             | `{queueName}.getNextJob`             | INTERNAL  | Fetching the next job to process       |
| `rateLimit`              | `{queueName}.rateLimit`              | INTERNAL  | Worker rate limiting                   |
| `processJob`             | `{queueName}.{jobName}`              | CONSUMER  | Processing a job (main processor span) |
| `pause`                  | `{queueName}.pause`                  | INTERNAL  | Pausing the worker                     |
| `resume`                 | `{queueName}.resume`                 | INTERNAL  | Resuming the worker                    |
| `close`                  | `{queueName}.close`                  | INTERNAL  | Closing the worker                     |
| `startStalledCheckTimer` | `{queueName}.startStalledCheckTimer` | INTERNAL  | Starting stalled job check timer       |
| `moveStalledJobsToWait`  | `{queueName}.moveStalledJobsToWait`  | INTERNAL  | Moving stalled jobs back to waiting    |
| `extendLocks`            | `{queueName}.extendLocks`            | INTERNAL  | Extending locks on active jobs         |

### Job Class

| Operation         | Span Name              | Span Kind | Description                                      |
| ----------------- | ---------------------- | --------- | ------------------------------------------------ |
| `moveToCompleted` | `{queueName}.complete` | INTERNAL  | Completing a job successfully                    |
| `moveToFailed`    | `{queueName}.{state}`  | INTERNAL  | Job failure handling (state: fail, delay, retry) |

### JobScheduler Class

| Operation | Span Name                        | Span Kind | Description               |
| --------- | -------------------------------- | --------- | ------------------------- |
| `add`     | `{queueName}.upsertJobScheduler` | PRODUCER  | Upserting a job scheduler |

### FlowProducer Class

| Operation | Span Name             | Span Kind | Description                        |
| --------- | --------------------- | --------- | ---------------------------------- |
| `add`     | `{queueName}.addFlow` | PRODUCER  | Adding a flow (tree of jobs)       |
| `addBulk` | `addBulkFlows`        | PRODUCER  | Adding multiple flows              |
| `addNode` | `{queueName}.addNode` | PRODUCER  | Adding a node in a flow (internal) |

## Trace Attributes

Traces include various attributes for filtering and debugging:

### Common Attributes

| Attribute       | Key                      | Description                       |
| --------------- | ------------------------ | --------------------------------- |
| Queue Name      | `bullmq.queue.name`      | Name of the queue                 |
| Queue Operation | `bullmq.queue.operation` | Type of operation being performed |

### Job Attributes

| Attribute               | Key                                     | Description                                    |
| ----------------------- | --------------------------------------- | ---------------------------------------------- |
| Job Name                | `bullmq.job.name`                       | Name of the job                                |
| Job ID                  | `bullmq.job.id`                         | Unique identifier of the job                   |
| Job Key                 | `bullmq.job.key`                        | Redis key of the job                           |
| Job IDs                 | `bullmq.job.ids`                        | Multiple job IDs (bulk ops)                    |
| Job Options             | `bullmq.job.options`                    | Serialized job options                         |
| Job Progress            | `bullmq.job.progress`                   | Current job progress value                     |
| Job Type                | `bullmq.job.type`                       | Type/state of the job                          |
| Job Attempts Made       | `bullmq.job.attempts.made`              | Number of attempts made                        |
| Job Result              | `bullmq.job.result`                     | Result returned by the job                     |
| Job Failed Reason       | `bullmq.job.failed.reason`              | Reason for job failure                         |
| Job Attempt Finished    | `bullmq.job.attempt_finished_timestamp` | When the processing attempt ended              |
| Job Finished Timestamp  | `bullmq.job.finished.timestamp`         | When the processing attempt ended (deprecated) |
| Job Processed Timestamp | `bullmq.job.processed.timestamp`        | When the job was processed                     |
| Deduplication Key       | `bullmq.job.deduplication.key`          | Deduplication key if set                       |

### Bulk Operation Attributes

| Attribute  | Key                     | Description                      |
| ---------- | ----------------------- | -------------------------------- |
| Bulk Count | `bullmq.job.bulk.count` | Number of jobs in bulk operation |
| Bulk Names | `bullmq.job.bulk.names` | Comma-separated job names        |

### Worker Attributes

| Attribute            | Key                                  | Description                     |
| -------------------- | ------------------------------------ | ------------------------------- |
| Worker Name          | `bullmq.worker.name`                 | Name of the worker              |
| Worker ID            | `bullmq.worker.id`                   | Unique identifier of the worker |
| Worker Options       | `bullmq.worker.options`              | Serialized worker options       |
| Worker Rate Limit    | `bullmq.worker.rate.limit`           | Rate limit duration             |
| Do Not Wait Active   | `bullmq.worker.do.not.wait.active`   | Whether to wait for active jobs |
| Force Close          | `bullmq.worker.force.close`          | Whether closing is forced       |
| Stalled Jobs         | `bullmq.worker.stalled.jobs`         | Number of stalled jobs detected |
| Failed Jobs          | `bullmq.worker.failed.jobs`          | Number of failed stalled jobs   |
| Jobs to Extend Locks | `bullmq.worker.jobs.to.extend.locks` | Jobs needing lock extension     |

### Queue Operation Attributes

| Attribute        | Key                             | Description                 |
| ---------------- | ------------------------------- | --------------------------- |
| Drain Delay      | `bullmq.queue.drain.delay`      | Whether to delay drain      |
| Grace Period     | `bullmq.queue.grace`            | Grace period for clean op   |
| Clean Limit      | `bullmq.queue.clean.limit`      | Maximum jobs to clean       |
| Rate Limit       | `bullmq.queue.rate.limit`       | Rate limit settings         |
| Queue Options    | `bullmq.queue.options`          | Serialized queue options    |
| Event Max Length | `bullmq.queue.event.max.length` | Maximum event stream length |

### Flow Attributes

| Attribute | Key                | Description      |
| --------- | ------------------ | ---------------- |
| Flow Name | `bullmq.flow.name` | Name of the flow |

### Scheduler Attributes

| Attribute        | Key                       | Description             |
| ---------------- | ------------------------- | ----------------------- |
| Job Scheduler ID | `bullmq.job.scheduler.id` | ID of the job scheduler |

## Context Propagation

BullMQ automatically propagates trace context when jobs are added and processed. This allows you to track jobs across services:

1. **Producer side**: When adding a job, the trace context is captured and stored with the job data
2. **Consumer side**: When processing a job, the trace context is extracted and used to continue the trace

### Controlling Context Propagation

You can control context propagation per job using the `telemetry` job option:

```typescript
// Include trace context (default behavior)
await queue.add('job', data);

// Explicitly include context
await queue.add('job', data, {
  telemetry: {
    omitContext: false,
  },
});

// Omit trace context (start fresh trace when processing)
await queue.add('job', data, {
  telemetry: {
    omitContext: true,
  },
});

// Provide custom metadata
await queue.add('job', data, {
  telemetry: {
    metadata: customContextData,
  },
});
```

## Exporting Traces

To export traces to an observability backend, configure an OpenTelemetry trace exporter:

```typescript
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { trace } from '@opentelemetry/api';

// Configure the trace exporter
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
provider.register();

// Now BullMQOtel will automatically use the registered provider
```

## Example Trace Visualization

When properly configured, you can see traces in your observability platform showing the complete lifecycle of jobs:

```
├─ myQueue.add (PRODUCER)
│  └─ myQueue.myJob (CONSUMER)
│     └─ myQueue.complete (INTERNAL)
```

For flows with parent-child relationships:

```
├─ myQueue.addFlow (PRODUCER)
│  ├─ childQueue.addNode (PRODUCER)
│  │  └─ childQueue.childJob (CONSUMER)
│  │     └─ childQueue.complete (INTERNAL)
│  └─ parentQueue.addNode (PRODUCER)
│     └─ parentQueue.parentJob (CONSUMER)
│        └─ parentQueue.complete (INTERNAL)
```
# NestJs

There is a compatible module to be used in [NestJs](https://github.com/nestjs/nest).

```bash
npm i @nestjs/bullmq
```

Once the installation process is complete, we can import the **`BullModule`** into the root **`AppModule`**.

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

To register a queue, import the **`BullModule.registerQueue()`** dynamic module, as follows:

```typescript
BullModule.registerQueue({
  name: 'queueName',
});
```

To register a flow producer, import the **`BullModule.registerFlowProducer()`** dynamic module, as follows:

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});
```

## Processor

To register a processor, you may need to use the **`Processor`** decorator:

```typescript
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('queueName')
class TestProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    // do some stuff
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    // do some stuff
  }
}
```

And then register it as a provider:

```typescript
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queueName',
      connection: {
        host: '0.0.0.0',
        port: 6380,
      },
    }),
    BullModule.registerFlowProducer({
      name: 'flowProducerName',
      connection: {
        host: '0.0.0.0',
        port: 6380,
      },
    }),
  ],
  providers: [TestProcessor],
})
export class AppModule {}
```

### Read more:

* 💡 [Queues Technique](https://docs.nestjs.com/techniques/queues)
# Queue Events Listeners

To register a QueueEvents instance, you need to use the **`QueueEventsListener`** decorator:

```typescript
import {
  QueueEventsListener,
  QueueEventsHost,
  OnQueueEvent,
} from '@nestjs/bullmq';

@QueueEventsListener('queueName')
export class TestQueueEvents extends QueueEventsHost {
  @OnQueueEvent('completed')
  onCompleted({
    jobId,
  }: {
    jobId: string;
    returnvalue: string;
    prev?: string;
  }) {
    // do some stuff
  }
}
```

And then register it as a provider:

```typescript
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queueName',
      connection: {
        host: '0.0.0.0',
        port: 6380,
      },
    }),
  ],
  providers: [TestQueueEvents],
})
export class AppModule {}
```

## Read more:

* 💡 [Queues Technique](https://docs.nestjs.com/techniques/queues)
* 💡 [Register Queue API Reference](https://nestjs.bullmq.pro/classes/BullModule.html#registerQueue)
* 💡 [Queue Events Listener API Reference](https://api.docs.bullmq.io/interfaces/v5.QueueEventsListener.html)
# Going to production

In this chapter, we will offer crucial considerations and tips to help you achieve a robust solution when deploying your BullMQ-based application to production.

### Persistence

Since BullMQ is based on Redis, persistence needs to be configured manually. Many hosting solutions do not offer persistence by default; instead, it needs to be configured per instance. We recommend enabling [AOF (*Append Only File*)](https://redis.io/docs/management/persistence/#aof-advantages), which provides a robust and fast solution. Usually, 1 second per write is enough for most applications.

Even though persistence is very fast, it will have some effect on performance, so please make the proper benchmarks to know that it is not impacting your solution in a way that is not acceptable to you.

### Max memory policy

Redis is used quite often as a cache, meaning that it will remove keys according to some defined policy when it reaches several levels of memory consumption. BullMQ on the other hand cannot work properly if Redis evicts keys arbitrarily. **Therefore is very important to configure the `maxmemory-policy` setting to `noeviction`.** This is the **only** setting that guarantees the correct behavior of the queues.

### Automatic reconnections

In a production setting, one of the things that are crucial for system robustness is to be able to recover automatically after connection issues. It is impossible to guarantee that a connection between BullMQ and Redis will always stay online. However, the important thing is that it recovers as fast as possible when the connection can be re-established without any human intervention.

In order to understand how to properly handle disconnections it is important to understand some options provided by [IORedis](https://www.npmjs.com/package/ioredis#Auto-reconnect). The ones interesting for us are:

* `retryStrategy`
* `maxRetriesPerRequest`
* `enableOfflineQueue`

It is also important to understand the difference in behavior that is often desired for `Queue` and `Worker` classes. Normally the operations performed using the `Queue` class should [fail quickly](https://docs.bullmq.io/patterns/failing-fast-when-redis-is-down) if there is a temporal disconnection, whereas for `Worker`s we want to wait indefinitely without raising any exception.

#### `retryStrategy`

This option is used to determine the function used to perform retries. The retries will continue forever until the reconnection has been accomplished. For IORedis connections created inside BullMQ we use the following strategy:

```ts
 retryStrategy: function (times: number) {
    return Math.max(Math.min(Math.exp(times), 20000), 1000);
 }
```

In other words, it will retry using exponential backoff, with a minimum 1-second retry time and max of 20 seconds. This `retryStrategy` can easily be overridden by passing a custom one defining custom IORedis options.

#### `maxRetriesPerRequest`

This option sets a limit on the number of times a retry on a failed request will be performed. For `Worker`s, it is important to set this option to **`null`**. Otherwise, the exceptions raised by Redis when calling certain commands could break the worker functionality. When instantiating a `Worker` this option will always be set to `null` by default, but it could be overridden, either if passing an existing IORedis instance or by passing a different value for this option when instantiating the `Worker`. In both cases BullMQ will output a warning; please make sure to address this warning as it can have several unintended consequences.

#### `enableOfflineQueue`

IORedis provides a small offline queue that is used to queue commands while the connection is offline. You will probably want to disable this queue for the `Queue` instance, but leave it as is for `Worker` instances. That will make the `Queue` calls [fail quickly](https://docs.bullmq.io/patterns/failing-fast-when-redis-is-down) while leaving the `Worker`s to wait as needed until the connection has been re-established.

### Log errors

It is really useful to attach a handler for the error event which will be triggered when there are connection issues. This will be helpful when debugging your queues and prevent "unhandled errors".

```typescript
worker.on("error", (err) => {
  // Log your error.
})
```

```typescript
queue.on("error", (err) => {
  // Log your error.
})
```

### Gracefully shut-down workers

Since your workers will run on servers, it is unavoidable that these servers will need to be restarted from time to time. As your workers may be processing jobs when the server is about to restart, it is important to properly close the workers to minimize the risk of stalled jobs. If a worker is killed without waiting for their jobs to complete, these jobs will be marked as stalled and processed automatically when new workers come online (with a waiting time of about 30 seconds by default). However it is better to avoid having stalled jobs, and as mentioned this can be done by closing the workers when the server is going to be restarted.

In a Node.js server, it is considered good practice to listen for both `SIGINT` and `SIGTERM` signals to close gracefully. Here's why:

* `SIGINT` is typically sent when a user types Ctrl+C in the terminal to interrupt a process. Your server should listen to this signal during development or when it's running in the foreground, so you can shut it down properly when this key combination is pressed.
* `SIGTERM` is the signal that is usually sent to a process to request its termination. Unlike `SIGKILL`, this signal can be caught by the process (which can then clean up resources and exit gracefully). This is the signal that system daemons, orchestration tools like Kubernetes, or process managers like PM2 typically use to stop a service.

Here is an example on how you accomplish this:

```typescript

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, closing server...`);
  await worker.close();
  // Other asynchronous closings
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

```

Keep in mind that the code above does not guarantee that the jobs will never end up being stalled, as the job may take longer time than the grace period for the server to restart.

### Auto-job removal

By default, all jobs processed by BullMQ will be either *completed*, or *failed* and kept forever. This behavior is not usually the most desired, so you will likely want to configure a maximum number of jobs to keep. The most common configuration is to keep a handful of completed jobs, just to have some visibility of the latest completed, whereas you can keep either all of the failed jobs or a very large number in case you want to manually retry them or perform a deeper debugging study on the reason why the jobs failed.

You can read more about how to configure auto removal [here](https://docs.bullmq.io/guide/queues/auto-removal-of-jobs).

### Protecting data

Another important point to think about when deploying for production is the fact that the data field of the jobs is stored in clear text. **The best is to avoid storing sensitive data in the job altogether.** However, if this is not possible, then it is highly recommended to encrypt the part of the data that is sensitive before it is added to the queue.

**Please do not take security lightly as it should be a major concern today, and the risks of losing data and economic damage to your business are real and very serious.**

### Unhandled exceptions and rejections

Another common issue, especially in production environments, is the fact that NodeJS by default will break if there are unhandled exceptions. This is not unique for BullMQ-based applications, but a general rule for all NodeJS applications. We recommend that somewhere in your service you make sure that you handle the unhandled exceptions gracefully, and so you can fix them when they arise without any risk of the application breaking when they happen:

```typescript
process.on("uncaughtException", function (err) {
  // Handle the error safely
  logger.error(err, "Uncaught exception");
});

process.on("unhandledRejection", (reason, promise) => {
  // Handle the error safely
  logger.error({ promise, reason }, "Unhandled Rejection at: Promise");
});
```
# Troubleshooting

In this section, you will be able to find hints and solutions for some common errors you might encounter when using BullMQ.

### Missing Locks

An error that can be thrown by the workers has the following structure: “Missing lock for job 1234. moveToFinished.” This error occurs when a job being processed by a worker unexpectedly loses its “lock.”

When a worker processes a job, it requires a special lock key to ensure that the job is currently “owned” by that worker, preventing other workers from picking up the same job. However, this lock can be deleted, and such a deletion may not be detected until the worker tries to move the job to a completed or failed status.

A lock can be deleted for several reasons, the most common being:

* The worker is consuming too much CPU and has no time to renew the lock every 30 seconds (which is the default expiration time for locks)
* The worker has lost communication with Redis and cannot renew the lock in time.
* The job has been forcefully removed using one of BullMQ's APIs to remove jobs (or by removing the entire queue).
* The Redis instance has a wrong [maxmemory](https://docs.bullmq.io/guide/going-to-production#max-memory-policy) policy; it should be no-eviction to avoid Redis removing keys with the expiration date before hand.

### Invalid or Undefined Environment Variables

If you rely on environment variables (e.g., for queue names or job data), a common pitfall is passing them directly to BullMQ methods when those environment variables are:

* Undefined (not set at all)
* Empty strings (i.e., "")
* Non-string values (e.g., inadvertently passing objects or arrays)

This can cause BullMQ’s internal Lua scripts to throw ERR Error running script ... Lua redis() command arguments must be strings or integers. It typically happens when a parameter passed into the Redis command ends up being something other than a valid string or number.

**Best Practices to Avoid This Error**

1. Validate Environment Variables Early

   In your application’s initialization code, check all required environment variables:

```typescript
const queueName = process.env.QUEUE_NAME;
if (!queueName) {
  throw new Error("QUEUE_NAME is not defined or is empty.");
}

const queue = new Queue(queueName, { ... });
```

This ensures you fail fast if a variable isn’t set, instead of causing hidden Lua script errors.

2. Use TypeScript Strictness

If you’re using TypeScript, enable strictNullChecks and explicitly type environment variables as string | undefined. That way, any code that attempts to use them without proper checks will cause a compile-time error.

3. Provide Defaults Where Appropriate

In some cases, you may want a fallback value if an environment variable is missing:

```typescript
const queueName = process.env.QUEUE_NAME ?? 'defaultQueue';
```

But be sure this fallback is actually valid in your production workflow.

Following these guidelines helps prevent obscure Lua script errors in BullMQ that stem from passing undefined or invalid arguments into Redis commands.
# Flows

{% hint style="warning" %}
The following pattern, although still useful, has been mostly super-seeded by the new [Flows](https://docs.bullmq.io/guide/flows) functionality
{% endhint %}

In some situations, you may need to execute a flow of several actions, any of which could fail. For example, you may need to update a database, make calls to external services, or any other kind of asynchronous call.

Sometimes it may not be possible to create an [idempotent job](https://docs.bullmq.io/patterns/idempotent-jobs) that can execute all these actions again in the case one of them failed for any reason. Instead, we may want to be able to only re-execute the action that failed and continue executing the rest of the actions that have not yet been executed.

The pattern to solve this issue consists of dividing the flow of actions into one queue for every action. When the first action completes, it places the next action as a job in its corresponding queue.
# Get Flow Tree

In some situations, you need to get a job and all of its children, grandchildren, and so on.

The pattern to solve this requirement consists of using the [`getFlow`](https://api.docs.bullmq.io/classes/v5.FlowProducer.html#getflow) method.

```typescript
const flow = new FlowProducer({ connection });

const originalTree = await flow.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name,
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
      children: [
        {
          name,
          data: { idx: 4, foo: 'baz' },
          queueName: 'grandchildrenQueueName',
        },
      ],
    },
    {
      name,
      data: { idx: 2, foo: 'foo' },
      queueName: 'childrenQueueName',
    },
    {
      name,
      data: { idx: 3, foo: 'bis' },
      queueName: 'childrenQueueName',
    },
  ],
});

const { job: topJob } = originalTree;

const tree = await flow.getFlow({
  id: topJob.id,
  queueName: 'topQueueName',
});

const { children, job } = tree;
```

{% hint style="info" %}
Each *child* may have a `job` property and in the case they have children as well, they would have the `children` property
{% endhint %}

You may also need a way to limit that information if you have many children for one of the job nodes.

```typescript
const limitedTree = await flow.getFlow({
  id: topJob.id,
  queueName: 'topQueueName',
  depth: 1, // get only the first level of children
  maxChildren: 2, // get only 2 children per node
});

const { children, job } = limitedTree;
```

## Read more:

* 💡 [Get Flow API Reference](https://api.docs.bullmq.io/classes/v5.FlowProducer.html#getflow)
# Fail Parent

In certain workflows, you may need a parent job to fail immediately if any of its child jobs fail. The `failParentOnFailure` option allows you to achieve this behaviour. When set to true on a child job, it ensures that if the child fails, its parent job is also marked as failed. This effect can propagate recursively up the job hierarchy, potentially causing grandparents or higher-level ancestors to fail as well, depending on the configuration.

### Key Points

* Selective Application: Only child jobs with failParentOnFailure: true will trigger the failure of their parent job upon failing. Child jobs without this option will not affect the parent's state if they fail.
* Recursive Behavior: If a child with this option fails, and its parent also has failParentOnFailure: true, the failure propagates upward through the job tree, potentially affecting grandparents and beyond.
* Immediate Effect: As soon as a qualifying child job fails, the parent job is moved to the failed state.

### Example

```typescript
import { FlowProducer } from 'bullmq';

const flow = new FlowProducer({ connection });

const originalTree = await flow.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name: 'child-job',
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
      // This child will fail its parent if it fails
      opts: { failParentOnFailure: true },
      children: [
        {
          name,
          data: { idx: 1, foo: 'bah' },
          queueName: 'grandChildrenQueueName',
          // This grandchild will fail its parent if it fails
          opts: { failParentOnFailure: true },
        },
        {
          name,
          data: { idx: 2, foo: 'baz' },
          queueName: 'grandChildrenQueueName',
          // No failParentOnFailure; its failure won't affect the parent
        },
      ],
    },
    {
      name,
      data: { idx: 3, foo: 'foo' },
      queueName: 'childrenQueueName',
      // No failParentOnFailure; its failure won't affect the parent
    },
  ],
});
```

{% hint style="info" %}
As soon as a *child* with this option fails, the parent job will be marked as failed lazily. A worker must process the parent job before it transitions to the failed state. The failure will result in an *UnrecoverableError* with the message **child {childKey} failed**. Additionally, this option will be validated recursively, meaning a grandparent or higher-level ancestor could also fail depending on the configuration.
{% endhint %}

### How it Works

* If grandchild-job-1 fails, its parent (child-job-1) will fail because of failParentOnFailure: true. Since child-job-1 also has failParentOnFailure: true, the root job (root-job) will fail as well.
* If grandchild-job-2 fails, its parent (child-job-1) will not fail because failParentOnFailure is not set on this grandchild.
* Similarly, if child-job-2 fails, the root job will remain unaffected since failParentOnFailure is not enabled for that child.

### Use Case

This option is particularly useful in workflows where the success of a parent job depends critically on specific child jobs, allowing you to enforce strict dependencies and fail fast when necessary.

## Read more:

* 💡 [Add Flow API Reference](https://api.docs.bullmq.io/classes/v5.FlowProducer.html#add)
# Continue Parent

{% hint style="info" %}
Available since v5.58.0
{% endhint %}

The `continueParentOnFailure` option allows a parent job to start processing as soon as a child job fails, while the `removeUnprocessedChildren` method enables dynamic cleanup of unprocessed child jobs. Additionally, you can use the `getFailedChildrenValues`() method to determine whether the parent is processing due to a child failure or because all children completed successfully, allowing you to define distinct logic paths.

### continueParentOnFailure

When set to `true` on a child job, the `continueParentOnFailure` option causes the parent job to begin processing immediately if that child fails. This contrasts with the default behavior, where the parent waits for all children to finish.

* **Key Behavior**: The parent moves to the active state as soon as a child with this option fails, even if other children are still running or unprocessed.
* **Use Case**: Ideal for scenarios where a child’s failure requires immediate parent intervention, such as aborting the workflow or performing cleanup.

### removeUnprocessedChildren

This method, available on a job instance, removes all unprocessed child jobs (those in waiting or delayed states) from the queue. It’s particularly useful when paired with `continueParentOnFailure` to get rid of remaining children after a failure.

* **Key Behavior**: Only affects children that haven’t started processing; **active, completed or failed** children remain intact.
* **Usage**: Call within the parent’s processor to clean up dynamically.

### getFailedChildrenValues

The `getFailedChildrenValues()` method returns an object mapping the IDs of failed child jobs to their failure error messages. This allows the parent job to determine why it’s processing—whether due to a child failure (triggered by `continueParentOnFailure`) or because all children completed successfully.

* **Return Value**: An object where keys are job IDs and values are error messages (e.g., { "job-id-1": "Upload failed" }). If no children failed, the object is empty.
* **Usage**: Use this in the parent’s processor to branch logic based on the presence of failed children.

### Example

The following example shows how to combine these features, with the parent job reacting differently based on whether a child failed or all children succeeded:

```typescript
const { FlowProducer } = require('bullmq');
const flow = new FlowProducer({ connection });

// Define the flow
const originalTree = await flow.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name: 'child-job-1',
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
      opts: { continueParentOnFailure: true }, // Parent processes if this child fails
    },
    {
      name: 'child-job-2',
      data: { idx: 1, foo: 'baz' },
      queueName: 'childrenQueueName',
    },
    {
      name: 'child-job-3',
      data: { idx: 2, foo: 'qux' },
      queueName: 'childrenQueueName',
    },
  ],
});

// Processor for the parent job
const processor = async (job) => {
  // Check if any children failed
  const failedChildren = await job.getFailedChildrenValues();
  const hasFailedChildren = Object.keys(failedChildren).length > 0;

  if (hasFailedChildren) {
    // Path 1: A child failed, triggering continueParentOnFailure
    console.log(`Parent job ${job.name} triggered by child failure(s):`, failedChildren);
    
    // Remove unprocessed children
    await job.removeUnprocessedChildren();
    console.log('Unprocessed child jobs have been removed.');
    
    // Additional cleanup or error handling can go here
  } else {
    // Path 2: All children completed successfully
    console.log(`Parent job ${job.name} processing after all children completed successfully.`);
    
    // Proceed with normal parent logic (e.g., aggregating results)
  }
};

```

### Practical use case

Consider a workflow where child jobs upload files to different servers. If one upload fails (e.g., `child-job-1`), the parent can use continueParentOnFailure to react immediately, check `getFailedChildrenValues()` to confirm the failure, and call `removeUnprocessedChildren()` to cancel remaining uploads. If all uploads succeed, the parent might aggregate the results instead.
# Continue Parent

{% hint style="info" %}
Available since v5.58.0
{% endhint %}

The `continueParentOnFailure` option allows a parent job to start processing as soon as a child job fails, while the `removeUnprocessedChildren` method enables dynamic cleanup of unprocessed child jobs. Additionally, you can use the `getFailedChildrenValues`() method to determine whether the parent is processing due to a child failure or because all children completed successfully, allowing you to define distinct logic paths.

### continueParentOnFailure

When set to `true` on a child job, the `continueParentOnFailure` option causes the parent job to begin processing immediately if that child fails. This contrasts with the default behavior, where the parent waits for all children to finish.

* **Key Behavior**: The parent moves to the active state as soon as a child with this option fails, even if other children are still running or unprocessed.
* **Use Case**: Ideal for scenarios where a child’s failure requires immediate parent intervention, such as aborting the workflow or performing cleanup.

### removeUnprocessedChildren

This method, available on a job instance, removes all unprocessed child jobs (those in waiting or delayed states) from the queue. It’s particularly useful when paired with `continueParentOnFailure` to get rid of remaining children after a failure.

* **Key Behavior**: Only affects children that haven’t started processing; **active, completed or failed** children remain intact.
* **Usage**: Call within the parent’s processor to clean up dynamically.

### getFailedChildrenValues

The `getFailedChildrenValues()` method returns an object mapping the IDs of failed child jobs to their failure error messages. This allows the parent job to determine why it’s processing—whether due to a child failure (triggered by `continueParentOnFailure`) or because all children completed successfully.

* **Return Value**: An object where keys are job IDs and values are error messages (e.g., { "job-id-1": "Upload failed" }). If no children failed, the object is empty.
* **Usage**: Use this in the parent’s processor to branch logic based on the presence of failed children.

### Example

The following example shows how to combine these features, with the parent job reacting differently based on whether a child failed or all children succeeded:

```typescript
const { FlowProducer } = require('bullmq');
const flow = new FlowProducer({ connection });

// Define the flow
const originalTree = await flow.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name: 'child-job-1',
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
      opts: { continueParentOnFailure: true }, // Parent processes if this child fails
    },
    {
      name: 'child-job-2',
      data: { idx: 1, foo: 'baz' },
      queueName: 'childrenQueueName',
    },
    {
      name: 'child-job-3',
      data: { idx: 2, foo: 'qux' },
      queueName: 'childrenQueueName',
    },
  ],
});

// Processor for the parent job
const processor = async (job) => {
  // Check if any children failed
  const failedChildren = await job.getFailedChildrenValues();
  const hasFailedChildren = Object.keys(failedChildren).length > 0;

  if (hasFailedChildren) {
    // Path 1: A child failed, triggering continueParentOnFailure
    console.log(`Parent job ${job.name} triggered by child failure(s):`, failedChildren);
    
    // Remove unprocessed children
    await job.removeUnprocessedChildren();
    console.log('Unprocessed child jobs have been removed.');
    
    // Additional cleanup or error handling can go here
  } else {
    // Path 2: All children completed successfully
    console.log(`Parent job ${job.name} processing after all children completed successfully.`);
    
    // Proceed with normal parent logic (e.g., aggregating results)
  }
};

```

### Practical use case

Consider a workflow where child jobs upload files to different servers. If one upload fails (e.g., `child-job-1`), the parent can use continueParentOnFailure to react immediately, check `getFailedChildrenValues()` to confirm the failure, and call `removeUnprocessedChildren()` to cancel remaining uploads. If all uploads succeed, the parent might aggregate the results instead.
# Remove Child Dependency

In some situations, you may have a parent job and need to remove the dependency of one of its children.

The pattern to solve this requirement consists on using the **removeChildDependency** method. It will make sure that if the job is the last pending child, to move its parent to *waiting* and it won't be listed in unprocessed list of the parent.

```typescript
const flow = new FlowProducer({ connection });

const originalTree = await flow.add({
  name: 'root-job',
  queueName: 'topQueueName',
  data: {},
  children: [
    {
      name,
      data: { idx: 0, foo: 'bar' },
      queueName: 'childrenQueueName',
      opts: {},
    },
  ],
});

await originalTree.children[0].job.removeChildDependency();
```

{% hint style="info" %}
As soon as a **child** calls this method, it will verify if it has an existing parent, if not, it'll throw an error.
{% endhint %}

Failed or completed children using this option won't generate any removal as they won't be part of unprocessed list.
# Adding jobs in bulk across different queues

Sometimes it is necessary to atomically add jobs to different queues in bulk. For example, there could be a requirement that all the jobs must be created or none of them. Also, adding jobs in bulk can be faster, since it reduces the number of roundtrips to Redis:

You may be think of [`queue.addBulk`](https://api.docs.bullmq.io/classes/v5.Queue.html#addbulk), but this method only adds jobs to a single queue. Another option is [`flowProducer.addBulk`](https://api.docs.bullmq.io/classes/v5.FlowProducer.html#addbulk), so let's see an example:

```typescript
import { FlowProducer } from 'bullmq';

const flow = new FlowProducer({ connection });

const trees = await flow.addBulk([
  {
    name: 'job-1',
    queueName: 'queueName-1',
    data: {}
  },
  {
    name: 'job-2',
    queueName: 'queueName-2',
    data: {}
  },
]);
```

It is possible to add individual jobs without children.

This call can only succeed or fail, and all or none of the jobs will be added.

## Read more:

* 💡 [Add Bulk API Reference](https://api.docs.bullmq.io/classes/v5.FlowProducer.html#addbulk)
# Throttle jobs

Sometimes, you may want to enqueue a job in reaction to a frequently occurring event, without running that job for *every* event. For example, you may want to send an email to a user when they update their profile, but you don't want to send an email for every single update if they make many changes in rapid succession.

You can achieve this by setting an identical `jobId` (using `JobsOptions.jobId?: string` to override the default unique integer) so **"identical" jobs are considered duplicates and not added to the queue**. If you use this option, it is up to you to ensure the `jobId` is unique.

{% hint style="warning" %}
Hint: Be careful if using `removeOnComplete`/`removeOnFailed` options, since a removed job will not count as existing and a new job with the same job ID could be added to the queue without being detected as a duplicate.
{% endhint %}

example:

```typescript
import { Job, Queue, Worker } from 'bullmq';

const myQueue = new Queue('Paint');

const worker = new Worker('Paint', async (job: Job) => {
  console.log('Do something with job');
  return 'some value';
});

worker.on('completed', (job: Job, returnvalue: any) => {
  console.log('worker done painting', new Date());
});

worker.on('failed', (job: Job, error: Error) => {
  console.error('worker fail painting', job, error, new Date());
});

// Add only one job that will be delayed at least 1 second.
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
myQueue.add('house', { color: 'white' }, { delay: 1000, jobId: 'house' });
```
# Manual retrying

There are situations when it is useful to retry a job right away when it is being processed.

This can be handled using the `moveToWait` method. However, it is important to note that when a job is being processed by a worker, the worker keeps a lock on this job with a certain token value. For the `moveToWait` method to work, we need to pass said token so that it can unlock without error. Finally, we need to exit from the processor by throwing a special error (`WaitingError`) that will signal to the worker that the job has been retried so that it does not try to complete (or fail the job) instead.

```typescript
import { WaitingError, Worker } from 'bullmq';

const worker = new Worker(
  'queueName',
  async (job: Job, token?: string) => {
    try {
      await doSomething();
    } catch (error) {
      await job.moveToWait(token);
      throw new WaitingError();
    }
  },
  { connection },
);
```

## Read more:

* 💡 [Move To Wait API Reference](https://api.docs.bullmq.io/classes/v5.Job.html#movetowait)
# Timeout jobs

BullMQ does not provide a specific mechanism to timeout jobs, however this can be accomplished in many cases with a custom timeout code in the worker's process function.

The basic concept is to set up a timeout callback that will abort the job processing, and throw an UnrecoverableError (to avoid retries, although this may not alway be the desired behaviour, if so just throw a normal Error). Note how we specified the timeout as a property of the job's data, in case we want to have different timeouts depending on the job, but we could also have a fixed constant timeout for all jobs if we wanted.

```typescript
const worker = new Worker('foo', async job => {
  let controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), job.data.timeout);
    
  try {
    await doSomethingAbortable(controller.signal);
  } catch(err) {
     if (err.name == "AbortError") {
      throw new UnrecoverableError("Timeout");
    } else {
      throw err;
    }
  } finally {
    clearTimeout(timer);
  }
});
```

In this simple example we assume that doSomethingAbortable is an asynchronous function that can handle abort signals and abort itself gracefully.

Now let's see another case when we want to timeout a fetch call, it would look like this:

```typescript
const worker = new Worker("foo", async (job) => { 
  let controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), job.data.timeout);
  try {
    let response = await fetch("/slowserver.com", {
      signal: controller.signal,
    }); 
    const result = await response.text();
  } catch (err) {
    if (err.name == "AbortError") {
      throw new UnrecoverableError("Timeout");
    } else {
      throw err;
    }
  } finally {
    clearTimeout(timer)
  }
});
```

In this example we are aborting the fetch call using [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), which is the default mechanism provided by fetch to abort calls. Note that abort will even cause the async call to response.text() to also throw an Abort exception.

In summary, while it is possible to implement timeout in your jobs, the mechanism to do it may vary depending on the type of asynchronous operations your jobs is performing, but in many cases using AbortController in combination with a setTimeout is more than enough.
# Redis Cluster

Bull internals require atomic operations that span different keys. This behavior breaks Redis's rules for cluster configurations. However, it is still possible to use a cluster environment by using the proper bull prefix option as a cluster "hash tag". Hash tags are used to guarantee that certain keys are placed in the same hash slot, read more about hash tags in the [redis cluster tutorial](https://redis.io/topics/cluster-tutorial). A hash tag is defined with brackets. I.e. a key that has a substring inside brackets will use that substring to determine in which hash slot the key will be placed.

In summary, to make bull compatible with Redis cluster, use a queue prefix inside brackets. For example:

You can use two approaches in order to make the Queues compatible with Cluster. Either define a queue prefix:

```typescript
const queue = new Queue('cluster', {
  prefix: '{myprefix}',
});
```

or wrap the queue name itself:

```typescript
const queue = new Queue('{cluster}');
```

Note that If you use several queues in the same cluster, you should use different prefixes so that the queues are evenly placed in the cluster nodes, potentially increasing performance and memory usage.
