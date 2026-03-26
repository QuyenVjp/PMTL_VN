# Overview

TanStack Query (formerly known as React Query) is often described as the missing data-fetching library for web applications, but in more technical terms, it makes **fetching, caching, synchronizing and updating server state** in your web applications a breeze.

## Motivation

Most core web frameworks **do not** come with an opinionated way of fetching or updating data in a holistic way. Because of this developers end up building either meta-frameworks which encapsulate strict opinions about data-fetching, or they invent their own ways of fetching data. This usually means cobbling together component-based state and side-effects, or using more general purpose state management libraries to store and provide asynchronous data throughout their apps.

While most traditional state management libraries are great for working with client state, they are **not so great at working with async or server state**. This is because **server state is totally different**. For starters, server state:

- Is persisted remotely in a location you may not control or own
- Requires asynchronous APIs for fetching and updating
- Implies shared ownership and can be changed by other people without your knowledge
- Can potentially become "out of date" in your applications if you're not careful

Once you grasp the nature of server state in your application, **even more challenges will arise** as you go, for example:

- Caching... (possibly the hardest thing to do in programming)
- Deduping multiple requests for the same data into a single request
- Updating "out of date" data in the background
- Knowing when data is "out of date"
- Reflecting updates to data as quickly as possible
- Performance optimizations like pagination and lazy loading data
- Managing memory and garbage collection of server state
- Memoizing query results with structural sharing

If you're not overwhelmed by that list, then that must mean that you've probably solved all of your server state problems already and deserve an award. However, if you are like a vast majority of people, you either have yet to tackle all or most of these challenges and we're only scratching the surface!

TanStack Query is hands down one of the _best_ libraries for managing server state. It works amazingly well **out-of-the-box, with zero-config, and can be customized** to your liking as your application grows.

TanStack Query allows you to defeat and overcome the tricky challenges and hurdles of _server state_ and control your app data before it starts to control you.

On a more technical note, TanStack Query will likely:

- Help you remove **many** lines of complicated and misunderstood code from your application and replace with just a handful of lines of TanStack Query logic
- Make your application more maintainable and easier to build new features without worrying about wiring up new server state data sources
- Have a direct impact on your end-users by making your application feel faster and more responsive than ever before
- Potentially help you save on bandwidth and increase memory performance

[//]: # 'Example'

## Enough talk, show me some code already!

In the example below, you can see TanStack Query in its most basic and simple form being used to fetch the GitHub stats for the TanStack Query GitHub project itself:

[Open in StackBlitz](https://stackblitz.com/github/TanStack/query/tree/main/examples/react/simple)

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('https://api.github.com/repos/TanStack/query').then((res) =>
        res.json(),
      ),
  })

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

[//]: # 'Example'
[//]: # 'Materials'

## You talked me into it, so what now?

- Consider taking the official [TanStack Query Course](https://query.gg?s=tanstack) (or buying it for your whole team!)
- Learn TanStack Query at your own pace with our amazingly thorough [Walkthrough Guide](./installation.md) and [API Reference](./reference/useQuery.md)
- See the Article [Why You Want React Query](https://tkdodo.eu/blog/why-you-want-react-query).

[//]: # 'Materials'
# Important Defaults

Out of the box, TanStack Query is configured with **aggressive but sane** defaults. **Sometimes these defaults can catch new users off guard or make learning/debugging difficult if they are unknown by the user.** Keep them in mind as you continue to learn and use TanStack Query:

- Query instances via `useQuery` or `useInfiniteQuery` by default **consider cached data as stale**.

> To change this behavior, you can configure your queries both globally and per-query using the `staleTime` option. Specifying a longer `staleTime` means queries will not refetch their data as often

- A Query that has a `staleTime` set is considered **fresh** until that `staleTime` has elapsed.
  - set `staleTime` to e.g. `2 * 60 * 1000` to make sure data is read from the cache, without triggering any kinds of refetches, for 2 minutes, or until the Query is [invalidated manually](./query-invalidation.md).
  - set `staleTime` to `Infinity` to never trigger a refetch until the Query is [invalidated manually](./query-invalidation.md).
  - set `staleTime` to `'static'` to **never** trigger a refetch, even if the Query is [invalidated manually](./query-invalidation.md).

- Stale queries are refetched automatically in the background when:
  - New instances of the query mount
  - The window is refocused
  - The network is reconnected

> Setting `staleTime` is the recommended way to avoid excessive refetches, but you can also customize the points in time for refetches by setting options like `refetchOnMount`, `refetchOnWindowFocus` and `refetchOnReconnect`.

- Queries can optionally be configured with a `refetchInterval` to trigger refetches periodically, which is independent of the `staleTime` setting.

- Query results that have no more active instances of `useQuery`, `useInfiniteQuery` or query observers are labeled as "inactive" and remain in the cache in case they are used again at a later time.
- By default, "inactive" queries are garbage collected after **5 minutes**.

  > To change this, you can alter the default `gcTime` for queries to something other than `1000 * 60 * 5` milliseconds.

- Queries that fail are **silently retried 3 times, with exponential backoff delay** before capturing and displaying an error to the UI.

  > To change this, you can alter the default `retry` and `retryDelay` options for queries to something other than `3` and the default exponential backoff function.

[//]: # 'StructuralSharing'

- Query results by default are **structurally shared to detect if data has actually changed** and if not, **the data reference remains unchanged** to better help with value stabilization with regards to useMemo and useCallback. If this concept sounds foreign, then don't worry about it! 99.9% of the time you will not need to disable this and it makes your app more performant at zero cost to you.

[//]: # 'StructuralSharing'

> Structural sharing only works with JSON-compatible values, any other value types will always be considered as changed. If you are seeing performance issues because of large responses for example, you can disable this feature with the `config.structuralSharing` flag. If you are dealing with non-JSON compatible values in your query responses and still want to detect if data has changed or not, you can provide your own custom function as `config.structuralSharing` to compute a value from the old and new responses, retaining references as required.

[//]: # 'Materials'

## Further Reading

Have a look at the following articles from our [Community Resources](../../../community-resources) for further explanations of the defaults:

- [Practical React Query](https://tkdodo.eu/blog/practical-react-query)
- [React Query as a State Manager](https://tkdodo.eu/blog/react-query-as-a-state-manager)
- [Thinking in React Query](https://tkdodo.eu/blog/thinking-in-react-query)

[//]: # 'Materials'
# Queries

## Query Basics

A query is a declarative dependency on an asynchronous source of data that is tied to a **unique key**. A query can be used with any Promise based method (including GET and POST methods) to fetch data from a server. If your method modifies data on the server, we recommend using [Mutations](./mutations.md) instead.

[//]: # 'SubscribeDescription'

To subscribe to a query in your components or custom hooks, call the `useQuery` hook with at least:

[//]: # 'SubscribeDescription'

- A **unique key for the query**
- A function that returns a promise that:
  - Resolves the data, or
  - Throws an error

[//]: # 'Example'

```tsx
import { useQuery } from '@tanstack/react-query'

function App() {
  const info = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
}
```

[//]: # 'Example'

The **unique key** you provide is used internally for refetching, caching, and sharing your queries throughout your application.

The query result returned by `useQuery` contains all of the information about the query that you'll need for templating and any other usage of the data:

[//]: # 'Example2'

```tsx
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

[//]: # 'Example2'

The `result` object contains a few very important states you'll need to be aware of to be productive. A query can only be in one of the following states at any given moment:

- `isPending` or `status === 'pending'` - The query has no data yet
- `isError` or `status === 'error'` - The query encountered an error
- `isSuccess` or `status === 'success'` - The query was successful and data is available

Beyond those primary states, more information is available depending on the state of the query:

- `error` - If the query is in an `isError` state, the error is available via the `error` property.
- `data` - If the query is in an `isSuccess` state, the data is available via the `data` property.
- `isFetching` - In any state, if the query is fetching at any time (including background refetching) `isFetching` will be `true`.

For **most** queries, it's usually sufficient to check for the `isPending` state, then the `isError` state, then finally, assume that the data is available and render the successful state:

[//]: # 'Example3'

```tsx
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  // We can assume by this point that `isSuccess === true`
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

[//]: # 'Example3'

If booleans aren't your thing, you can always use the `status` state as well:

[//]: # 'Example4'

```tsx
function Todos() {
  const { status, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (status === 'pending') {
    return <span>Loading...</span>
  }

  if (status === 'error') {
    return <span>Error: {error.message}</span>
  }

  // also status === 'success', but "else" logic works, too
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

[//]: # 'Example4'

TypeScript will also narrow the type of `data` correctly if you've checked for `pending` and `error` before accessing it.

### FetchStatus

In addition to the `status` field, you will also get an additional `fetchStatus` property with the following options:

- `fetchStatus === 'fetching'` - The query is currently fetching.
- `fetchStatus === 'paused'` - The query wanted to fetch, but it is paused. Read more about this in the [Network Mode](./network-mode.md) guide.
- `fetchStatus === 'idle'` - The query is not doing anything at the moment.

### Why two different states?

Background refetches and stale-while-revalidate logic make all combinations for `status` and `fetchStatus` possible. For example:

- a query in `success` status will usually be in `idle` fetchStatus, but it could also be in `fetching` if a background refetch is happening.
- a query that mounts and has no data will usually be in `pending` status and `fetching` fetchStatus, but it could also be `paused` if there is no network connection.

So keep in mind that a query can be in `pending` state without actually fetching data. As a rule of thumb:

- The `status` gives information about the `data`: Do we have any or not?
- The `fetchStatus` gives information about the `queryFn`: Is it running or not?

[//]: # 'Materials'

## Further Reading

For an alternative way of performing status checks, have a look at [this article by TkDodo](https://tkdodo.eu/blog/status-checks-in-react-query).

[//]: # 'Materials'
 # Query Keys

At its core, TanStack Query manages query caching for you based on query keys. Query keys have to be an Array at the top level, and can be as simple as an Array with a single string, or as complex as an array of many strings and nested objects. As long as the query key is serializable using `JSON.stringify`, and **unique to the query's data**, you can use it!

## Simple Query Keys

The simplest form of a key is an array with constants values. This format is useful for:

- Generic List/Index resources
- Non-hierarchical resources

[//]: # 'Example'

```tsx
// A list of todos
useQuery({ queryKey: ['todos'], ... })

// Something else, whatever!
useQuery({ queryKey: ['something', 'special'], ... })
```

[//]: # 'Example'

## Array Keys with variables

When a query needs more information to uniquely describe its data, you can use an array with a string and any number of serializable objects to describe it. This is useful for:

- Hierarchical or nested resources
  - It's common to pass an ID, index, or other primitive to uniquely identify the item
- Queries with additional parameters
  - It's common to pass an object of additional options

[//]: # 'Example2'

```tsx
// An individual todo
useQuery({ queryKey: ['todo', 5], ... })

// An individual todo in a "preview" format
useQuery({ queryKey: ['todo', 5, { preview: true }], ...})

// A list of todos that are "done"
useQuery({ queryKey: ['todos', { type: 'done' }], ... })
```

[//]: # 'Example2'

## Query Keys are hashed deterministically!

This means that no matter the order of keys in objects, all of the following queries are considered equal:

[//]: # 'Example3'

```tsx
useQuery({ queryKey: ['todos', { status, page }], ... })
useQuery({ queryKey: ['todos', { page, status }], ...})
useQuery({ queryKey: ['todos', { page, status, other: undefined }], ... })
```

[//]: # 'Example3'

The following query keys, however, are not equal. Array item order matters!

[//]: # 'Example4'

```tsx
useQuery({ queryKey: ['todos', status, page], ... })
useQuery({ queryKey: ['todos', page, status], ...})
useQuery({ queryKey: ['todos', undefined, page, status], ...})
```

[//]: # 'Example4'

## If your query function depends on a variable, include it in your query key

Since query keys uniquely describe the data they are fetching, they should include any variables you use in your query function that **change**. For example:

[//]: # 'Example5'

```tsx
function Todos({ todoId }) {
  const result = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => fetchTodoById(todoId),
  })
}
```

[//]: # 'Example5'

Note that query keys act as dependencies for your query functions. Adding dependent variables to your query key will ensure that queries are cached independently, and that any time a variable changes, _queries will be refetched automatically_ (depending on your `staleTime` settings). See the [exhaustive-deps](../../../eslint/exhaustive-deps.md) section for more information and examples.

[//]: # 'Materials'

## Further reading

For tips on organizing Query Keys in larger applications, have a look at [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys) and check the [Query Key Factory Package](https://github.com/lukemorales/query-key-factory) from
the [Community Resources](../../../community-resources).

[//]: # 'Materials'
# Query Functions

A query function can be literally any function that **returns a promise**. The promise that is returned should either **resolve the data** or **throw an error**.

All of the following are valid query function configurations:

[//]: # 'Example'

```tsx
useQuery({ queryKey: ['todos'], queryFn: fetchAllTodos })
useQuery({ queryKey: ['todos', todoId], queryFn: () => fetchTodoById(todoId) })
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const data = await fetchTodoById(todoId)
    return data
  },
})
useQuery({
  queryKey: ['todos', todoId],
  queryFn: ({ queryKey }) => fetchTodoById(queryKey[1]),
})
```

[//]: # 'Example'

## Handling and Throwing Errors

For TanStack Query to determine a query has errored, the query function **must throw** or return a **rejected Promise**. Any error that is thrown in the query function will be persisted on the `error` state of the query.

[//]: # 'Example2'

```tsx
const { error } = useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    if (somethingGoesWrong) {
      throw new Error('Oh no!')
    }
    if (somethingElseGoesWrong) {
      return Promise.reject(new Error('Oh no!'))
    }

    return data
  },
})
```

[//]: # 'Example2'

## Usage with `fetch` and other clients that do not throw by default

While most utilities like `axios` or `graphql-request` automatically throw errors for unsuccessful HTTP calls, some utilities like `fetch` do not throw errors by default. If that's the case, you'll need to throw them on your own. Here is a simple way to do that with the popular `fetch` API:

[//]: # 'Example3'

```tsx
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const response = await fetch('/todos/' + todoId)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
})
```

[//]: # 'Example3'

## Query Function Variables

Query keys are not just for uniquely identifying the data you are fetching, but are also conveniently passed into your query function as part of the QueryFunctionContext. While not always necessary, this makes it possible to extract your query functions if needed:

[//]: # 'Example4'

```tsx
function Todos({ status, page }) {
  const result = useQuery({
    queryKey: ['todos', { status, page }],
    queryFn: fetchTodoList,
  })
}

// Access the key, status and page variables in your query function!
function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey
  return new Promise()
}
```

[//]: # 'Example4'

### QueryFunctionContext

The `QueryFunctionContext` is the object passed to each query function. It consists of:

- `queryKey: QueryKey`: [Query Keys](./query-keys.md)
- `client: QueryClient`: [QueryClient](../../../reference/QueryClient.md)
- `signal?: AbortSignal`
  - [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) instance provided by TanStack Query
  - Can be used for [Query Cancellation](./query-cancellation.md)
- `meta: Record<string, unknown> | undefined`
  - an optional field you can fill with additional information about your query

Additionally, [Infinite Queries](./infinite-queries.md) get the following options passed:

- `pageParam: TPageParam`
  - the page parameter used to fetch the current page
- `direction: 'forward' | 'backward'`
  - **deprecated**
  - the direction of the current page fetch
  - To get access to the direction of the current page fetch, please add a direction to `pageParam` from `getNextPageParam` and `getPreviousPageParam`.
# Query Options

One of the best ways to share `queryKey` and `queryFn` between multiple places, yet keep them co-located to one another, is to use the `queryOptions` helper. At runtime, this helper just returns whatever you pass into it, but it has a lot of advantages when using it [with TypeScript](../typescript.md#typing-query-options). You can define all possible options for a query in one place, and you'll also get type inference and type safety for all of them.

[//]: # 'Example1'

```ts
import { queryOptions } from '@tanstack/react-query'

function groupOptions(id: number) {
  return queryOptions({
    queryKey: ['groups', id],
    queryFn: () => fetchGroups(id),
    staleTime: 5 * 1000,
  })
}

// usage:

useQuery(groupOptions(1))
useSuspenseQuery(groupOptions(5))
useQueries({
  queries: [groupOptions(1), groupOptions(2)],
})
queryClient.prefetchQuery(groupOptions(23))
queryClient.setQueryData(groupOptions(42).queryKey, newGroups)
```

[//]: # 'Example1'

For Infinite Queries, a separate [`infiniteQueryOptions`](../reference/infiniteQueryOptions.md) helper is available.

[//]: # 'SelectDescription'

You can still override some options at the component level. A very common and useful pattern is to create per-component [`select`](./render-optimizations.md#select) functions:

[//]: # 'SelectDescription'
[//]: # 'Example2'

```ts
// Type inference still works, so query.data will be the return type of select instead of queryFn

const query = useQuery({
  ...groupOptions(1),
  select: (data) => data.groupName,
})
```

[//]: # 'Example2'
# Mutations

Unlike queries, mutations are typically used to create/update/delete data or perform server side-effects. For this purpose, TanStack Query exports a `useMutation` hook.

Here's an example of a mutation that adds a new todo to the server:

[//]: # 'Example'

```tsx
function App() {
  const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post('/todos', newTodo)
    },
  })

  return (
    <div>
      {mutation.isPending ? (
        'Adding todo...'
      ) : (
        <>
          {mutation.isError ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Todo added!</div> : null}

          <button
            onClick={() => {
              mutation.mutate({ id: new Date(), title: 'Do Laundry' })
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  )
}
```

[//]: # 'Example'

A mutation can only be in one of the following states at any given moment:

- `isIdle` or `status === 'idle'` - The mutation is currently idle or in a fresh/reset state
- `isPending` or `status === 'pending'` - The mutation is currently running
- `isError` or `status === 'error'` - The mutation encountered an error
- `isSuccess` or `status === 'success'` - The mutation was successful and mutation data is available

Beyond those primary states, more information is available depending on the state of the mutation:

- `error` - If the mutation is in an `error` state, the error is available via the `error` property.
- `data` - If the mutation is in a `success` state, the data is available via the `data` property.

In the example above, you also saw that you can pass variables to your mutations function by calling the `mutate` function with a **single variable or object**.

Even with just variables, mutations aren't all that special, but when used with the `onSuccess` option, the [Query Client's `invalidateQueries` method](../../../reference/QueryClient.md#queryclientinvalidatequeries) and the [Query Client's `setQueryData` method](../../../reference/QueryClient.md#queryclientsetquerydata), mutations become a very powerful tool.

[//]: # 'Info1'

> IMPORTANT: The `mutate` function is an asynchronous function, which means you cannot use it directly in an event callback in **React 16 and earlier**. If you need to access the event in `onSubmit` you need to wrap `mutate` in another function. This is due to [React event pooling](https://reactjs.org/docs/legacy-event-pooling.html).

[//]: # 'Info1'
[//]: # 'Example2'

```tsx
// This will not work in React 16 and earlier
const CreateTodo = () => {
  const mutation = useMutation({
    mutationFn: (event) => {
      event.preventDefault()
      return fetch('/api', new FormData(event.target))
    },
  })

  return <form onSubmit={mutation.mutate}>...</form>
}

// This will work
const CreateTodo = () => {
  const mutation = useMutation({
    mutationFn: (formData) => {
      return fetch('/api', formData)
    },
  })
  const onSubmit = (event) => {
    event.preventDefault()
    mutation.mutate(new FormData(event.target))
  }

  return <form onSubmit={onSubmit}>...</form>
}
```

[//]: # 'Example2'

## Resetting Mutation State

It's sometimes the case that you need to clear the `error` or `data` of a mutation request. To do this, you can use the `reset` function to handle this:

[//]: # 'Example3'

```tsx
const CreateTodo = () => {
  const [title, setTitle] = useState('')
  const mutation = useMutation({ mutationFn: createTodo })

  const onCreateTodo = (e) => {
    e.preventDefault()
    mutation.mutate({ title })
  }

  return (
    <form onSubmit={onCreateTodo}>
      {mutation.error && (
        <h5 onClick={() => mutation.reset()}>{mutation.error}</h5>
      )}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <button type="submit">Create Todo</button>
    </form>
  )
}
```

[//]: # 'Example3'

## Mutation Side Effects

`useMutation` comes with some helper options that allow quick and easy side-effects at any stage during the mutation lifecycle. These come in handy for both [invalidating and refetching queries after mutations](./invalidations-from-mutations.md) and even [optimistic updates](./optimistic-updates.md)

[//]: # 'Example4'

```tsx
useMutation({
  mutationFn: addTodo,
  onMutate: (variables, context) => {
    // A mutation is about to happen!

    // Optionally return a result containing data to use when for example rolling back
    return { id: 1 }
  },
  onError: (error, variables, onMutateResult, context) => {
    // An error happened!
    console.log(`rolling back optimistic update with id ${onMutateResult.id}`)
  },
  onSuccess: (data, variables, onMutateResult, context) => {
    // Boom baby!
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    // Error or success... doesn't matter!
  },
})
```

[//]: # 'Example4'

When returning a promise in any of the callback functions it will first be awaited before the next callback is called:

[//]: # 'Example5'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    console.log("I'm first!")
  },
  onSettled: async () => {
    console.log("I'm second!")
  },
})
```

[//]: # 'Example5'

You might find that you want to **trigger additional callbacks** beyond the ones defined on `useMutation` when calling `mutate`. This can be used to trigger component-specific side effects. To do that, you can provide any of the same callback options to the `mutate` function after your mutation variable. Supported options include: `onSuccess`, `onError` and `onSettled`. Please keep in mind that those additional callbacks won't run if your component unmounts _before_ the mutation finishes.

[//]: # 'Example6'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, onMutateResult, context) => {
    // I will fire first
  },
  onError: (error, variables, onMutateResult, context) => {
    // I will fire first
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    // I will fire first
  },
})

mutate(todo, {
  onSuccess: (data, variables, onMutateResult, context) => {
    // I will fire second!
  },
  onError: (error, variables, onMutateResult, context) => {
    // I will fire second!
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    // I will fire second!
  },
})
```

[//]: # 'Example6'

### Consecutive mutations

There is a slight difference in handling `onSuccess`, `onError` and `onSettled` callbacks when it comes to consecutive mutations. When passed to the `mutate` function, they will be fired up only _once_ and only if the component is still mounted. This is due to the fact that mutation observer is removed and resubscribed every time when the `mutate` function is called. On the contrary, `useMutation` handlers execute for each `mutate` call.

> Be aware that most likely, `mutationFn` passed to `useMutation` is asynchronous. In that case, the order in which mutations are fulfilled may differ from the order of `mutate` function calls.

[//]: # 'Example7'

```tsx
useMutation({
  mutationFn: addTodo,
  onSuccess: (data, variables, onMutateResult, context) => {
    // Will be called 3 times
  },
})

const todos = ['Todo 1', 'Todo 2', 'Todo 3']
todos.forEach((todo) => {
  mutate(todo, {
    onSuccess: (data, variables, onMutateResult, context) => {
      // Will execute only once, for the last mutation (Todo 3),
      // regardless which mutation resolves first
    },
  })
})
```

[//]: # 'Example7'

## Promises

Use `mutateAsync` instead of `mutate` to get a promise which will resolve on success or throw on an error. This can for example be used to compose side effects.

[//]: # 'Example8'

```tsx
const mutation = useMutation({ mutationFn: addTodo })

try {
  const todo = await mutation.mutateAsync(todo)
  console.log(todo)
} catch (error) {
  console.error(error)
} finally {
  console.log('done')
}
```

[//]: # 'Example8'

## Retry

By default, TanStack Query will not retry a mutation on error, but it is possible with the `retry` option:

[//]: # 'Example9'

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  retry: 3,
})
```

[//]: # 'Example9'

If mutations fail because the device is offline, they will be retried in the same order when the device reconnects.

## Persist mutations

Mutations can be persisted to storage if needed and resumed at a later point. This can be done with the hydration functions:

[//]: # 'Example10'

```tsx
const queryClient = new QueryClient()

// Define the "addTodo" mutation
queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: addTodo,
  onMutate: async (variables, context) => {
    // Cancel current queries for the todos list
    await context.client.cancelQueries({ queryKey: ['todos'] })

    // Create optimistic todo
    const optimisticTodo = { id: uuid(), title: variables.title }

    // Add optimistic todo to todos list
    context.client.setQueryData(['todos'], (old) => [...old, optimisticTodo])

    // Return a result with the optimistic todo
    return { optimisticTodo }
  },
  onSuccess: (result, variables, onMutateResult, context) => {
    // Replace optimistic todo in the todos list with the result
    context.client.setQueryData(['todos'], (old) =>
      old.map((todo) =>
        todo.id === onMutateResult.optimisticTodo.id ? result : todo,
      ),
    )
  },
  onError: (error, variables, onMutateResult, context) => {
    // Remove optimistic todo from the todos list
    context.client.setQueryData(['todos'], (old) =>
      old.filter((todo) => todo.id !== onMutateResult.optimisticTodo.id),
    )
  },
  retry: 3,
})

// Start mutation in some component:
const mutation = useMutation({ mutationKey: ['addTodo'] })
mutation.mutate({ title: 'title' })

// If the mutation has been paused because the device is for example offline,
// Then the paused mutation can be dehydrated when the application quits:
const state = dehydrate(queryClient)

// The mutation can then be hydrated again when the application is started:
hydrate(queryClient, state)

// Resume the paused mutations:
queryClient.resumePausedMutations()
```

[//]: # 'Example10'
[//]: # 'PersistOfflineIntro'

### Persisting Offline mutations

If you persist offline mutations with the [persistQueryClient plugin](../plugins/persistQueryClient.md), mutations cannot be resumed when the page is reloaded unless you provide a default mutation function.

[//]: # 'PersistOfflineIntro'

This is a technical limitation. When persisting to an external storage, only the state of mutations is persisted, as functions cannot be serialized. After hydration, the component that triggers the mutation might not be mounted, so calling `resumePausedMutations` might yield an error: `No mutationFn found`.

[//]: # 'Example11'

```tsx
const persister = createSyncStoragePersister({
  storage: window.localStorage,
})
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

// we need a default mutation function so that paused mutations can resume after a page reload
queryClient.setMutationDefaults(['todos'], {
  mutationFn: ({ id, data }) => {
    return api.updateTodo(id, data)
  },
})

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        // resume mutations after initial restore from localStorage was successful
        queryClient.resumePausedMutations()
      }}
    >
      <RestOfTheApp />
    </PersistQueryClientProvider>
  )
}
```

[//]: # 'Example11'
[//]: # 'OfflineExampleLink'

We also have an extensive [offline example](../examples/offline) that covers both queries and mutations.

[//]: # 'OfflineExampleLink'

## Mutation Scopes

Per default, all mutations run in parallel - even if you invoke `.mutate()` of the same mutation multiple times. Mutations can be given a `scope` with an `id` to avoid that. All mutations with the same `scope.id` will run in serial, which means when they are triggered, they will start in `isPaused: true` state if there is already a mutation for that scope in progress. They will be put into a queue and will automatically resume once their time in the queue has come.

[//]: # 'ExampleScopes'

```tsx
const mutation = useMutation({
  mutationFn: addTodo,
  scope: {
    id: 'todo',
  },
})
```

[//]: # 'ExampleScopes'
[//]: # 'Materials'

## Further reading

For more information about mutations, have a look at [TkDodo's article on Mastering Mutations in React Query](https://tkdodo.eu/blog/mastering-mutations-in-react-query).

[//]: # 'Materials'
# Query Invalidation

Waiting for queries to become stale before they are fetched again doesn't always work, especially when you know for a fact that a query's data is out of date because of something the user has done. For that purpose, the `QueryClient` has an `invalidateQueries` method that lets you intelligently mark queries as stale and potentially refetch them too!

[//]: # 'Example'

```tsx
// Invalidate every query in the cache
queryClient.invalidateQueries()
// Invalidate every query with a key that starts with `todos`
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

[//]: # 'Example'

> Note: Where other libraries that use normalized caches would attempt to update local queries with the new data either imperatively or via schema inference, TanStack Query gives you the tools to avoid the manual labor that comes with maintaining normalized caches and instead prescribes **targeted invalidation, background-refetching and ultimately atomic updates**.

When a query is invalidated with `invalidateQueries`, two things happen:

- It is marked as stale. This stale state overrides any `staleTime` configurations being used in `useQuery` or related hooks
- If the query is currently being rendered via `useQuery` or related hooks, it will also be refetched in the background

## Query Matching with `invalidateQueries`

When using APIs like `invalidateQueries` and `removeQueries` (and others that support partial query matching), you can match multiple queries by their prefix, or get really specific and match an exact query. For information on the types of filters you can use, please see [Query Filters](./filters.md#query-filters).

In this example, we can use the `todos` prefix to invalidate any queries that start with `todos` in their query key:

[//]: # 'Example2'

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Get QueryClient from the context
const queryClient = useQueryClient()

queryClient.invalidateQueries({ queryKey: ['todos'] })

// Both queries below will be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
const todoListQuery = useQuery({
  queryKey: ['todos', { page: 1 }],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example2'

You can even invalidate queries with specific variables by passing a more specific query key to the `invalidateQueries` method:

[//]: # 'Example3'

```tsx
queryClient.invalidateQueries({
  queryKey: ['todos', { type: 'done' }],
})

// The query below will be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
})

// However, the following query below will NOT be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example3'

The `invalidateQueries` API is very flexible, so even if you want to **only** invalidate `todos` queries that don't have any more variables or subkeys, you can pass an `exact: true` option to the `invalidateQueries` method:

[//]: # 'Example4'

```tsx
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: true,
})

// The query below will be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})

// However, the following query below will NOT be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example4'

If you find yourself wanting **even more** granularity, you can pass a predicate function to the `invalidateQueries` method. This function will receive each `Query` instance from the query cache and allow you to return `true` or `false` for whether you want to invalidate that query:

[//]: # 'Example5'

```tsx
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' && query.queryKey[1]?.version >= 10,
})

// The query below will be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 20 }],
  queryFn: fetchTodoList,
})

// The query below will be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 10 }],
  queryFn: fetchTodoList,
})

// However, the following query below will NOT be invalidated
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 5 }],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example5'
# Invalidations from Mutations

Invalidating queries is only half the battle. Knowing **when** to invalidate them is the other half. Usually when a mutation in your app succeeds, it's VERY likely that there are related queries in your application that need to be invalidated and possibly refetched to account for the new changes from your mutation.

For example, assume we have a mutation to post a new todo:

[//]: # 'Example'

```tsx
const mutation = useMutation({ mutationFn: postTodo })
```

[//]: # 'Example'

When a successful `postTodo` mutation happens, we likely want all `todos` queries to get invalidated and possibly refetched to show the new todo item. To do this, you can use `useMutation`'s `onSuccess` options and the `client`'s `invalidateQueries` function:

[//]: # 'Example2'

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
const mutation = useMutation({
  mutationFn: addTodo,
  onSuccess: async () => {
    // If you're invalidating a single query
    await queryClient.invalidateQueries({ queryKey: ['todos'] })

    // If you're invalidating multiple queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['todos'] }),
      queryClient.invalidateQueries({ queryKey: ['reminders'] }),
    ])
  },
})
```

[//]: # 'Example2'

Returning a Promise on `onSuccess` makes sure the data is updated before the mutation is entirely complete (i.e., isPending is true until onSuccess is fulfilled)

[//]: # 'Example2'

You can wire up your invalidations to happen using any of the callbacks available in the [`useMutation` hook](./mutations.md)

[//]: # 'Materials'

## Further reading

For a technique to automatically invalidate Queries after Mutations, have a look at [TkDodo's article on Automatic Query Invalidation after Mutations](https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations).

[//]: # 'Materials'
# Updates from Mutation Responses

When dealing with mutations that **update** objects on the server, it's common for the new object to be automatically returned in the response of the mutation. Instead of refetching any queries for that item and wasting a network call for data we already have, we can take advantage of the object returned by the mutation function and update the existing query with the new data immediately using the [Query Client's `setQueryData`](../../../reference/QueryClient.md#queryclientsetquerydata) method:

[//]: # 'Example'

```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: editTodo,
  onSuccess: (data) => {
    queryClient.setQueryData(['todo', { id: 5 }], data)
  },
})

mutation.mutate({
  id: 5,
  name: 'Do the laundry',
})

// The query below will be updated with the response from the
// successful mutation
const { status, data, error } = useQuery({
  queryKey: ['todo', { id: 5 }],
  queryFn: fetchTodoById,
})
```

[//]: # 'Example'

You might want to tie the `onSuccess` logic into a reusable mutation, for that you can
create a custom hook like this:

[//]: # 'Example2'

```tsx
const useMutateTodo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editTodo,
    // Notice the second argument is the variables object that the `mutate` function receives
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['todo', { id: variables.id }], data)
    },
  })
}
```

[//]: # 'Example2'

## Immutability

Updates via `setQueryData` must be performed in an _immutable_ way. **DO NOT** attempt to write directly to the cache by mutating data (that you retrieved from the cache) in place. It might work at first but can lead to subtle bugs along the way.

[//]: # 'Example3'

```tsx
queryClient.setQueryData(['posts', { id }], (oldData) => {
  if (oldData) {
    // ❌ do not try this
    oldData.title = 'my new post title'
  }
  return oldData
})

queryClient.setQueryData(
  ['posts', { id }],
  // ✅ this is the way
  (oldData) =>
    oldData
      ? {
          ...oldData,
          title: 'my new post title',
        }
      : oldData,
)
```

[//]: # 'Example3'
# Optimistic Updates

React Query provides two ways to optimistically update your UI before a mutation has completed. You can either use the `onMutate` option to update your cache directly, or leverage the returned `variables` to update your UI from the `useMutation` result.

## Via the UI

This is the simpler variant, as it doesn't interact with the cache directly.

[//]: # 'ExampleUI1'

```tsx
const addTodoMutation = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  // make sure to _return_ the Promise from the query invalidation
  // so that the mutation stays in `pending` state until the refetch is finished
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

const { isPending, submittedAt, variables, mutate, isError } = addTodoMutation
```

[//]: # 'ExampleUI1'

you will then have access to `addTodoMutation.variables`, which contain the added todo. In your UI list, where the query is rendered, you can append another item to the list while the mutation `isPending`:

[//]: # 'ExampleUI2'

```tsx
<ul>
  {todoQuery.items.map((todo) => (
    <li key={todo.id}>{todo.text}</li>
  ))}
  {isPending && <li style={{ opacity: 0.5 }}>{variables}</li>}
</ul>
```

[//]: # 'ExampleUI2'

We're rendering a temporary item with a different `opacity` as long as the mutation is pending. Once it completes, the item will automatically no longer be rendered. Given that the refetch succeeded, we should see the item as a "normal item" in our list.

If the mutation errors, the item will also disappear. But we could continue to show it, if we want, by checking for the `isError` state of the mutation. `variables` are _not_ cleared when the mutation errors, so we can still access them, maybe even show a retry button:

[//]: # 'ExampleUI3'

```tsx
{
  isError && (
    <li style={{ color: 'red' }}>
      {variables}
      <button onClick={() => mutate(variables)}>Retry</button>
    </li>
  )
}
```

[//]: # 'ExampleUI3'

### If the mutation and the query don't live in the same component

This approach works very well if the mutation and the query live in the same component. However, you also get access to all mutations in other components via the dedicated `useMutationState` hook. It is best combined with a `mutationKey`:

[//]: # 'ExampleUI4'

```tsx
// somewhere in your app
const { mutate } = useMutation({
  mutationFn: (newTodo: string) => axios.post('/api/data', { text: newTodo }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  mutationKey: ['addTodo'],
})

// access variables somewhere else
const variables = useMutationState<string>({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables,
})
```

[//]: # 'ExampleUI4'

`variables` will be an `Array`, because there might be multiple mutations running at the same time. If we need a unique key for the items, we can also select `mutation.state.submittedAt`. This will even make displaying concurrent optimistic updates a breeze.

## Via the cache

When you optimistically update your state before performing a mutation, there is a chance that the mutation will fail. In most of these failure cases, you can just trigger a refetch for your optimistic queries to revert them to their true server state. In some circumstances though, refetching may not work correctly and the mutation error could represent some type of server issue that won't make it possible to refetch. In this event, you can instead choose to roll back your update.

To do this, `useMutation`'s `onMutate` handler option allows you to return a value that will later be passed to both `onError` and `onSettled` handlers as the last argument. In most cases, it is most useful to pass a rollback function.

### Updating a list of todos when adding a new todo

[//]: # 'Example'

```tsx
const queryClient = useQueryClient()

useMutation({
  mutationFn: updateTodo,
  // When mutate is called:
  onMutate: async (newTodo, context) => {
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    await context.client.cancelQueries({ queryKey: ['todos'] })

    // Snapshot the previous value
    const previousTodos = context.client.getQueryData(['todos'])

    // Optimistically update to the new value
    context.client.setQueryData(['todos'], (old) => [...old, newTodo])

    // Return a result with the snapshotted value
    return { previousTodos }
  },
  // If the mutation fails,
  // use the result returned from onMutate to roll back
  onError: (err, newTodo, onMutateResult, context) => {
    context.client.setQueryData(['todos'], onMutateResult.previousTodos)
  },
  // Always refetch after error or success:
  onSettled: (data, error, variables, onMutateResult, context) =>
    context.client.invalidateQueries({ queryKey: ['todos'] }),
})
```

[//]: # 'Example'

### Updating a single todo

[//]: # 'Example2'

```tsx
useMutation({
  mutationFn: updateTodo,
  // When mutate is called:
  onMutate: async (newTodo, context) => {
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    await context.client.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // Snapshot the previous value
    const previousTodo = context.client.getQueryData(['todos', newTodo.id])

    // Optimistically update to the new value
    context.client.setQueryData(['todos', newTodo.id], newTodo)

    // Return a result with the previous and new todo
    return { previousTodo, newTodo }
  },
  // If the mutation fails, use the result we returned above
  onError: (err, newTodo, onMutateResult, context) => {
    context.client.setQueryData(
      ['todos', onMutateResult.newTodo.id],
      onMutateResult.previousTodo,
    )
  },
  // Always refetch after error or success:
  onSettled: (newTodo, error, variables, onMutateResult, context) =>
    context.client.invalidateQueries({ queryKey: ['todos', newTodo.id] }),
})
```

[//]: # 'Example2'

You can also use the `onSettled` function in place of the separate `onError` and `onSuccess` handlers if you wish:

[//]: # 'Example3'

```tsx
useMutation({
  mutationFn: updateTodo,
  // ...
  onSettled: async (newTodo, error, variables, onMutateResult, context) => {
    if (error) {
      // do something
    }
  },
})
```

[//]: # 'Example3'

## When to use what

If you only have one place where the optimistic result should be shown, using `variables` and updating the UI directly is the approach that requires less code and is generally easier to reason about. For example, you don't need to handle rollbacks at all.

However, if you have multiple places on the screen that would require to know about the update, manipulating the cache directly will take care of this for you automatically.

[//]: # 'Materials'

## Further reading

Have a look at the guide by TkDodo on [Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query).

[//]: # 'Materials'
# Infinite Queries

Rendering lists that can additively "load more" data onto an existing set of data or "infinite scroll" is also a very common UI pattern. TanStack Query supports a useful version of `useQuery` called `useInfiniteQuery` for querying these types of lists.

When using `useInfiniteQuery`, you'll notice a few things are different:

- `data` is now an object containing infinite query data:
- `data.pages` array containing the fetched pages
- `data.pageParams` array containing the page params used to fetch the pages
- The `fetchNextPage` and `fetchPreviousPage` functions are now available (`fetchNextPage` is required)
- The `initialPageParam` option is now available (and required) to specify the initial page param
- The `getNextPageParam` and `getPreviousPageParam` options are available for both determining if there is more data to load and the information to fetch it. This information is supplied as an additional parameter in the query function
- A `hasNextPage` boolean is now available and is `true` if `getNextPageParam` returns a value other than `null` or `undefined`
- A `hasPreviousPage` boolean is now available and is `true` if `getPreviousPageParam` returns a value other than `null` or `undefined`
- The `isFetchingNextPage` and `isFetchingPreviousPage` booleans are now available to distinguish between a background refresh state and a loading more state

> Note: Options `initialData` or `placeholderData` need to conform to the same structure of an object with `data.pages` and `data.pageParams` properties.

## Example

Let's assume we have an API that returns pages of `projects` 3 at a time based on a `cursor` index along with a cursor that can be used to fetch the next group of projects:

```tsx
fetch('/api/projects?cursor=0')
// { data: [...], nextCursor: 3}
fetch('/api/projects?cursor=3')
// { data: [...], nextCursor: 6}
fetch('/api/projects?cursor=6')
// { data: [...], nextCursor: 9}
fetch('/api/projects?cursor=9')
// { data: [...] }
```

With this information, we can create a "Load More" UI by:

- Waiting for `useInfiniteQuery` to request the first group of data by default
- Returning the information for the next query in `getNextPageParam`
- Calling `fetchNextPage` function

[//]: # 'Example'

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

function Projects() {
  const fetchProjects = async ({ pageParam }) => {
    const res = await fetch('/api/projects?cursor=' + pageParam)
    return res.json()
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  })

  return status === 'pending' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.data.map((project) => (
            <p key={project.id}>{project.name}</p>
          ))}
        </React.Fragment>
      ))}
      <div>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetching}
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
              ? 'Load More'
              : 'Nothing more to load'}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
    </>
  )
}
```

[//]: # 'Example'

It's essential to understand that calling `fetchNextPage` while an ongoing fetch is in progress runs the risk of overwriting data refreshes happening in the background. This situation becomes particularly critical when rendering a list and triggering `fetchNextPage` simultaneously.

Remember, there can only be a single ongoing fetch for an InfiniteQuery. A single cache entry is shared for all pages, attempting to fetch twice simultaneously might lead to data overwrites.

If you intend to enable simultaneous fetching, you can utilize the `{ cancelRefetch: false }` option (default: true) within `fetchNextPage`.

To ensure a seamless querying process without conflicts, it's highly recommended to verify that the query is not in an `isFetching` state, especially if the user won't directly control that call.

[//]: # 'Example1'

```jsx
<List onEndReached={() => hasNextPage && !isFetching && fetchNextPage()} />
```

[//]: # 'Example1'

## What happens when an infinite query needs to be refetched?

When an infinite query becomes `stale` and needs to be refetched, each group is fetched `sequentially`, starting from the first one. This ensures that even if the underlying data is mutated, we're not using stale cursors and potentially getting duplicates or skipping records. If an infinite query's results are ever removed from the queryCache, the pagination restarts at the initial state with only the initial group being requested.

## What if I want to implement a bi-directional infinite list?

Bi-directional lists can be implemented by using the `getPreviousPageParam`, `fetchPreviousPage`, `hasPreviousPage` and `isFetchingPreviousPage` properties and functions.

[//]: # 'Example3'

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
})
```

[//]: # 'Example3'

## What if I want to show the pages in reversed order?

Sometimes you may want to show the pages in reversed order. If this is case, you can use the `select` option:

[//]: # 'Example4'

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  select: (data) => ({
    pages: [...data.pages].reverse(),
    pageParams: [...data.pageParams].reverse(),
  }),
})
```

[//]: # 'Example4'

## What if I want to manually update the infinite query?

### Manually removing first page:

[//]: # 'Example5'

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(1),
  pageParams: data.pageParams.slice(1),
}))
```

[//]: # 'Example5'

### Manually removing a single value from an individual page:

[//]: # 'Example6'

```tsx
const newPagesArray =
  oldPagesArray?.pages.map((page) =>
    page.filter((val) => val.id !== updatedId),
  ) ?? []

queryClient.setQueryData(['projects'], (data) => ({
  pages: newPagesArray,
  pageParams: data.pageParams,
}))
```

[//]: # 'Example6'

### Keep only the first page:

[//]: # 'Example7'

```tsx
queryClient.setQueryData(['projects'], (data) => ({
  pages: data.pages.slice(0, 1),
  pageParams: data.pageParams.slice(0, 1),
}))
```

[//]: # 'Example7'

Make sure to always keep the same data structure of pages and pageParams!

## What if I want to limit the number of pages?

In some use cases you may want to limit the number of pages stored in the query data to improve the performance and UX:

- when the user can load a large number of pages (memory usage)
- when you have to refetch an infinite query that contains dozens of pages (network usage: all the pages are sequentially fetched)

The solution is to use a "Limited Infinite Query". This is made possible by using the `maxPages` option in conjunction with `getNextPageParam` and `getPreviousPageParam` to allow fetching pages when needed in both directions.

In the following example only 3 pages are kept in the query data pages array. If a refetch is needed, only 3 pages will be refetched sequentially.

[//]: # 'Example8'

```tsx
useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor,
  maxPages: 3,
})
```

[//]: # 'Example8'

## What if my API doesn't return a cursor?

If your API doesn't return a cursor, you can use the `pageParam` as a cursor. Because `getNextPageParam` and `getPreviousPageParam` also get the `pageParam`of the current page, you can use it to calculate the next / previous page param.

[//]: # 'Example9'

```tsx
return useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    if (lastPage.length === 0) {
      return undefined
    }
    return lastPageParam + 1
  },
  getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
    if (firstPageParam <= 1) {
      return undefined
    }
    return firstPageParam - 1
  },
})
```

[//]: # 'Example9'
[//]: # 'Materials'

## Further reading

To get a better understanding of how Infinite Queries work under the hood, see the article [How Infinite Queries work](https://tkdodo.eu/blog/how-infinite-queries-work).

[//]: # 'Materials'
# Paginated / Lagged Queries

Rendering paginated data is a very common UI pattern and in TanStack Query, it "just works" by including the page information in the query key:

[//]: # 'Example'

```tsx
const result = useQuery({
  queryKey: ['projects', page],
  queryFn: () => fetchProjects(page),
})
```

[//]: # 'Example'

However, if you run this simple example, you might notice something strange:

**The UI jumps in and out of the `success` and `pending` states because each new page is treated like a brand new query.**

This experience is not optimal and unfortunately is how many tools today insist on working. But not TanStack Query! As you may have guessed, TanStack Query comes with an awesome feature called `placeholderData` that allows us to get around this.

## Better Paginated Queries with `placeholderData`

Consider the following example where we would ideally want to increment a pageIndex (or cursor) for a query. If we were to use `useQuery`, **it would still technically work fine**, but the UI would jump in and out of the `success` and `pending` states as different queries are created and destroyed for each page or cursor. By setting `placeholderData` to `(previousData) => previousData` or `keepPreviousData` function exported from TanStack Query, we get a few new things:

- **The data from the last successful fetch is available while new data is being requested, even though the query key has changed**.
- When the new data arrives, the previous `data` is seamlessly swapped to show the new data.
- `isPlaceholderData` is made available to know what data the query is currently providing you

[//]: # 'Example2'

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import React from 'react'

function Todos() {
  const [page, setPage] = React.useState(0)

  const fetchProjects = (page = 0) =>
    fetch('/api/projects?page=' + page).then((res) => res.json())

  const { isPending, isError, error, data, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: ['projects', page],
      queryFn: () => fetchProjects(page),
      placeholderData: keepPreviousData,
    })

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          {data.projects.map((project) => (
            <p key={project.id}>{project.name}</p>
          ))}
        </div>
      )}
      <span>Current Page: {page + 1}</span>
      <button
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Previous Page
      </button>
      <button
        onClick={() => {
          if (!isPlaceholderData && data.hasMore) {
            setPage((old) => old + 1)
          }
        }}
        // Disable the Next Page button until we know a next page is available
        disabled={isPlaceholderData || !data?.hasMore}
      >
        Next Page
      </button>
      {isFetching ? <span> Loading...</span> : null}
    </div>
  )
}
```

[//]: # 'Example2'

## Lagging Infinite Query results with `placeholderData`

While not as common, the `placeholderData` option also works flawlessly with the `useInfiniteQuery` hook, so you can seamlessly allow your users to continue to see cached data while infinite query keys change over time.
# Disabling/Pausing Queries

If you ever want to disable a query from automatically running, you can use the `enabled = false` option. The enabled option also accepts a callback that returns a boolean.

When `enabled` is `false`:

- If the query has cached data, then the query will be initialized in the `status === 'success'` or `isSuccess` state.
- If the query does not have cached data, then the query will start in the `status === 'pending'` and `fetchStatus === 'idle'` state.
- The query will not automatically fetch on mount.
- The query will not automatically refetch in the background.
- The query will ignore query client `invalidateQueries` and `refetchQueries` calls that would normally result in the query refetching.
- `refetch` returned from `useQuery` can be used to manually trigger the query to fetch. However, it will not work with `skipToken`.

> TypeScript users may prefer to use [skipToken](#typesafe-disabling-of-queries-using-skiptoken) as an alternative to `enabled = false`.

[//]: # 'Example'

```tsx
function Todos() {
  const { isLoading, isError, data, error, refetch, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
    enabled: false,
  })

  return (
    <div>
      <button onClick={() => refetch()}>Fetch Todos</button>

      {data ? (
        <ul>
          {data.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      ) : isError ? (
        <span>Error: {error.message}</span>
      ) : isLoading ? (
        <span>Loading...</span>
      ) : (
        <span>Not ready ...</span>
      )}

      <div>{isFetching ? 'Fetching...' : null}</div>
    </div>
  )
}
```

[//]: # 'Example'

Permanently disabling a query opts out of many great features that TanStack Query has to offer (like background refetches), and it's also not the idiomatic way. It takes you from the declarative approach (defining dependencies when your query should run) into an imperative mode (fetch whenever I click here). It is also not possible to pass parameters to `refetch`. Oftentimes, all you want is a lazy query that defers the initial fetch:

## Lazy Queries

The enabled option can not only be used to permanently disable a query, but also to enable / disable it at a later time. A good example would be a filter form where you only want to fire off the first request once the user has entered a filter value:

[//]: # 'Example2'

```tsx
function Todos() {
  const [filter, setFilter] = React.useState('')

  const { data } = useQuery({
    queryKey: ['todos', filter],
    queryFn: () => fetchTodos(filter),
    // ⬇️ disabled as long as the filter is empty
    enabled: !!filter,
  })

  return (
    <div>
      // 🚀 applying the filter will enable and execute the query
      <FiltersForm onApply={setFilter} />
      {data && <TodosTable data={data} />}
    </div>
  )
}
```

[//]: # 'Example2'

### isLoading (Previously: `isInitialLoading`)

Lazy queries will be in `status: 'pending'` right from the start because `pending` means that there is no data yet. This is technically true, however, since we are not currently fetching any data (as the query is not _enabled_), it also means you likely cannot use this flag to show a loading spinner.

If you are using disabled or lazy queries, you can use the `isLoading` flag instead. It's a derived flag that is computed from:

`isPending && isFetching`

so it will only be true if the query is currently fetching for the first time.

## Typesafe disabling of queries using `skipToken`

If you are using TypeScript, you can use the `skipToken` to disable a query. This is useful when you want to disable a query based on a condition, but you still want the query to be type safe.

> **IMPORTANT**: `refetch` from `useQuery` will not work with `skipToken`. Calling `refetch()` on a query that uses `skipToken` will result in a `Missing queryFn` error because there is no valid query function to execute. If you need to manually trigger queries, consider using `enabled: false` instead, which allows `refetch()` to work properly. Other than this limitation, `skipToken` works the same as `enabled: false`.

[//]: # 'Example3'

```tsx
import { skipToken, useQuery } from '@tanstack/react-query'

function Todos() {
  const [filter, setFilter] = React.useState<string | undefined>()

  const { data } = useQuery({
    queryKey: ['todos', filter],
    // ⬇️ disabled as long as the filter is undefined or empty
    queryFn: filter ? () => fetchTodos(filter) : skipToken,
  })

  return (
    <div>
      // 🚀 applying the filter will enable and execute the query
      <FiltersForm onApply={setFilter} />
      {data && <TodosTable data={data} />}
    </div>
  )
}
```

[//]: # 'Example3'
# Query Retries

When a `useQuery` query fails (the query function throws an error), TanStack Query will automatically retry the query if that query's request has not reached the max number of consecutive retries (defaults to `3`) or a function is provided to determine if a retry is allowed.

You can configure retries both on a global level and an individual query level.

- Setting `retry = false` will disable retries.
- Setting `retry = 6` will retry failing requests 6 times before showing the final error thrown by the function.
- Setting `retry = true` will infinitely retry failing requests.
- Setting `retry = (failureCount, error) => ...` allows for custom logic based on why the request failed. Note that `failureCount` starts at `0` for the first retry attempt.

[//]: # 'Info'

> On the server, retries default to `0` to make server rendering as fast as possible.

[//]: # 'Info'
[//]: # 'Example'

```tsx
import { useQuery } from '@tanstack/react-query'

// Make a specific query retry a certain number of times
const result = useQuery({
  queryKey: ['todos', 1],
  queryFn: fetchTodoListPage,
  retry: 10, // Will retry failed requests 10 times before displaying an error
})
```

[//]: # 'Example'

> Info: Contents of the `error` property will be part of `failureReason` response property of `useQuery` until the last retry attempt. So in above example any error contents will be part of `failureReason` property for first 9 retry attempts (Overall 10 attempts) and finally they will be part of `error` after last attempt if error persists after all retry attempts.

## Retry Delay

By default, retries in TanStack Query do not happen immediately after a request fails. As is standard, a back-off delay is gradually applied to each retry attempt.

The default `retryDelay` is set to double (starting at `1000`ms) with each attempt, but not exceed 30 seconds:

[//]: # 'Example2'

```tsx
// Configure for all queries
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

[//]: # 'Example2'

Though it is not recommended, you can obviously override the `retryDelay` function/integer in both the Provider and individual query options. If set to an integer instead of a function the delay will always be the same amount of time:

[//]: # 'Example3'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  retryDelay: 1000, // Will always wait 1000ms to retry, regardless of how many retries
})
```

[//]: # 'Example3'

## Background Retry Behavior

When using `refetchInterval` with `refetchIntervalInBackground: true`, retries will pause when the browser tab is inactive. This happens because retries respect the same focus behavior as regular refetches.

If you need continuous retries in the background, consider disabling retries and implementing a custom refetch strategy:

[//]: # 'Example4'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchInterval: (query) => {
    // Refetch more frequently when in error state
    return query.state.status === 'error' ? 5000 : 30000
  },
  refetchIntervalInBackground: true,
  retry: false, // Disable built-in retries
})
```

[//]: # 'Example4'

This approach lets you control retry timing manually while keeping refetches active in the background.
# Prefetching & Router Integration

When you know or suspect that a certain piece of data will be needed, you can use prefetching to populate the cache with that data ahead of time, leading to a faster experience.

There are a few different prefetching patterns:

1. In event handlers
2. In components
3. Via router integration
4. During Server Rendering (another form of router integration)

In this guide, we'll take a look at the first three, while the fourth will be covered in depth in the [Server Rendering & Hydration guide](./ssr.md) and the [Advanced Server Rendering guide](./advanced-ssr.md).

One specific use of prefetching is to avoid Request Waterfalls, for an in-depth background and explanation of those, see the [Performance & Request Waterfalls guide](./request-waterfalls.md).

## prefetchQuery & prefetchInfiniteQuery

Before jumping into the different specific prefetch patterns, let's look at the `prefetchQuery` and `prefetchInfiniteQuery` functions. First a few basics:

- Out of the box, these functions use the default `staleTime` configured for the `queryClient` to determine whether existing data in the cache is fresh or needs to be fetched again
- You can also pass a specific `staleTime` like this: `prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })`
  - This `staleTime` is only used for the prefetch, you still need to set it for any `useQuery` call as well
  - If you want to ignore `staleTime` and instead always return data if it's available in the cache, you can use the `ensureQueryData` function.
  - Tip: If you are prefetching on the server, set a default `staleTime` higher than `0` for that `queryClient` to avoid having to pass in a specific `staleTime` to each prefetch call
- If no instances of `useQuery` appear for a prefetched query, it will be deleted and garbage collected after the time specified in `gcTime`
- These functions return `Promise<void>` and thus never return query data. If that's something you need, use `fetchQuery`/`fetchInfiniteQuery` instead.
- The prefetch functions never throw errors because they usually try to fetch again in a `useQuery` which is a nice graceful fallback. If you need to catch errors, use `fetchQuery`/`fetchInfiniteQuery` instead.

This is how you use `prefetchQuery`:

[//]: # 'ExamplePrefetchQuery'

```tsx
const prefetchTodos = async () => {
  // The results of this query will be cached like a normal query
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

[//]: # 'ExamplePrefetchQuery'

Infinite Queries can be prefetched like regular Queries. Per default, only the first page of the Query will be prefetched and will be stored under the given QueryKey. If you want to prefetch more than one page, you can use the `pages` option, in which case you also have to provide a `getNextPageParam` function:

[//]: # 'ExamplePrefetchInfiniteQuery'

```tsx
const prefetchProjects = async () => {
  // The results of this query will be cached like a normal query
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    pages: 3, // prefetch the first 3 pages
  })
}
```

[//]: # 'ExamplePrefetchInfiniteQuery'

Next, let's look at how you can use these and other ways to prefetch in different situations.

## Prefetch in event handlers

A straightforward form of prefetching is doing it when the user interacts with something. In this example we'll use `queryClient.prefetchQuery` to start a prefetch on `onMouseEnter` or `onFocus`.

[//]: # 'ExampleEventHandler'

```tsx
function ShowDetailsButton() {
  const queryClient = useQueryClient()

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['details'],
      queryFn: getDetailsData,
      // Prefetch only fires when data is older than the staleTime,
      // so in a case like this you definitely want to set one
      staleTime: 60000,
    })
  }

  return (
    <button onMouseEnter={prefetch} onFocus={prefetch} onClick={...}>
      Show Details
    </button>
  )
}
```

[//]: # 'ExampleEventHandler'

## Prefetch in components

Prefetching during the component lifecycle is useful when we know some child or descendant will need a particular piece of data, but we can't render that until some other query has finished loading. Let's borrow an example from the Request Waterfall guide to explain:

[//]: # 'ExampleComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  if (isPending) {
    return 'Loading article...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      <Comments id={id} />
    </>
  )
}

function Comments({ id }) {
  const { data, isPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  ...
}
```

[//]: # 'ExampleComponent'

This results in a request waterfall looking like this:

```
1. |> getArticleById()
2.   |> getArticleCommentsById()
```

As mentioned in that guide, one way to flatten this waterfall and improve performance is to hoist the `getArticleCommentsById` query to the parent and pass down the result as a prop, but what if this is not feasible or desirable, for example when the components are unrelated and have multiple levels between them?

In that case, we can instead prefetch the query in the parent. The simplest way to do this is to use a query but ignore the result:

[//]: # 'ExampleParentComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  // Prefetch
  useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
    // Optional optimization to avoid rerenders when this query changes:
    notifyOnChangeProps: [],
  })

  if (isPending) {
    return 'Loading article...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      <Comments id={id} />
    </>
  )
}

function Comments({ id }) {
  const { data, isPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  ...
}
```

[//]: # 'ExampleParentComponent'

This starts fetching `'article-comments'` immediately and flattens the waterfall:

```
1. |> getArticleById()
1. |> getArticleCommentsById()
```

[//]: # 'Suspense'

If you want to prefetch together with Suspense, you will have to do things a bit differently. You can't use `useSuspenseQueries` to prefetch, since the prefetch would block the component from rendering. You also can not use `useQuery` for the prefetch, because that wouldn't start the prefetch until after suspenseful query had resolved. For this scenario, you can use the [`usePrefetchQuery`](../reference/usePrefetchQuery.md) or the [`usePrefetchInfiniteQuery`](../reference/usePrefetchInfiniteQuery.md) hooks available in the library.

You can now use `useSuspenseQuery` in the component that actually needs the data. You _might_ want to wrap this later component in its own `<Suspense>` boundary so the "secondary" query we are prefetching does not block rendering of the "primary" data.

```tsx
function ArticleLayout({ id }) {
  usePrefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  return (
    <Suspense fallback="Loading article">
      <Article id={id} />
    </Suspense>
  )
}

function Article({ id }) {
  const { data: articleData, isPending } = useSuspenseQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  ...
}
```

Another way is to prefetch inside of the query function. This makes sense if you know that every time an article is fetched it's very likely comments will also be needed. For this, we'll use `queryClient.prefetchQuery`:

```tsx
const queryClient = useQueryClient()
const { data: articleData, isPending } = useQuery({
  queryKey: ['article', id],
  queryFn: (...args) => {
    queryClient.prefetchQuery({
      queryKey: ['article-comments', id],
      queryFn: getArticleCommentsById,
    })

    return getArticleById(...args)
  },
})
```

Prefetching in an effect also works, but note that if you are using `useSuspenseQuery` in the same component, this effect wont run until _after_ the query finishes which might not be what you want.

```tsx
const queryClient = useQueryClient()

useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })
}, [queryClient, id])
```

To recap, if you want to prefetch a query during the component lifecycle, there are a few different ways to do it, pick the one that suits your situation best:

- Prefetch before a suspense boundary using `usePrefetchQuery` or `usePrefetchInfiniteQuery` hooks
- Use `useQuery` or `useSuspenseQueries` and ignore the result
- Prefetch inside the query function
- Prefetch in an effect

Let's look at a slightly more advanced case next.

[//]: # 'Suspense'

### Dependent Queries & Code Splitting

Sometimes we want to prefetch conditionally, based on the result of another fetch. Consider this example borrowed from the [Performance & Request Waterfalls guide](./request-waterfalls.md):

[//]: # 'ExampleConditionally1'

```tsx
// This lazy loads the GraphFeedItem component, meaning
// it wont start loading until something renders it
const GraphFeedItem = React.lazy(() => import('./GraphFeedItem'))

function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return 'Loading feed...'
  }

  return (
    <>
      {data.map((feedItem) => {
        if (feedItem.type === 'GRAPH') {
          return <GraphFeedItem key={feedItem.id} feedItem={feedItem} />
        }

        return <StandardFeedItem key={feedItem.id} feedItem={feedItem} />
      })}
    </>
  )
}

// GraphFeedItem.tsx
function GraphFeedItem({ feedItem }) {
  const { data, isPending } = useQuery({
    queryKey: ['graph', feedItem.id],
    queryFn: getGraphDataById,
  })

  ...
}
```

[//]: # 'ExampleConditionally1'

As noted over in that guide, this example leads to the following double request waterfall:

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
3.     |> getGraphDataById()
```

If we can not restructure our API so `getFeed()` also returns the `getGraphDataById()` data when necessary, there is no way to get rid of the `getFeed->getGraphDataById` waterfall, but by leveraging conditional prefetching, we can at least load the code and data in parallel. Just like described above, there are multiple ways to do this, but for this example, we'll do it in the query function:

[//]: # 'ExampleConditionally2'

```tsx
function Feed() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: async (...args) => {
      const feed = await getFeed(...args)

      for (const feedItem of feed) {
        if (feedItem.type === 'GRAPH') {
          queryClient.prefetchQuery({
            queryKey: ['graph', feedItem.id],
            queryFn: getGraphDataById,
          })
        }
      }

      return feed
    }
  })

  ...
}
```

[//]: # 'ExampleConditionally2'

This would load the code and data in parallel:

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
2.   |> getGraphDataById()
```

There is a tradeoff however, in that the code for `getGraphDataById` is now included in the parent bundle instead of in `JS for <GraphFeedItem>` so you'll need to determine what's the best performance tradeoff on a case by case basis. If `GraphFeedItem` are likely, it's probably worth to include the code in the parent. If they are exceedingly rare, it's probably not.

[//]: # 'Router'

## Router Integration

Because data fetching in the component tree itself can easily lead to request waterfalls and the different fixes for that can be cumbersome as they accumulate throughout the application, an attractive way to do prefetching is integrating it at the router level.

In this approach, you explicitly declare for each _route_ what data is going to be needed for that component tree, ahead of time. Because Server Rendering has traditionally needed all data to be loaded before rendering starts, this has been the dominating approach for SSR'd apps for a long time. This is still a common approach and you can read more about it in the [Server Rendering & Hydration guide](./ssr.md).

For now, let's focus on the client side case and look at an example of how you can make this work with [TanStack Router](https://tanstack.com/router). These examples leave out a lot of setup and boilerplate to stay concise, you can check out a [full React Query example](https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query-file-based) over in the [TanStack Router docs](https://tanstack.com/router/latest/docs).

When integrating at the router level, you can choose to either _block_ rendering of that route until all data is present, or you can start a prefetch but not await the result. That way, you can start rendering the route as soon as possible. You can also mix these two approaches and await some critical data, but start rendering before all the secondary data has finished loading. In this example, we'll configure an `/article` route to not render until the article data has finished loading, as well as start prefetching comments as soon as possible, but not block rendering the route if comments haven't finished loading yet.

```tsx
const queryClient = new QueryClient()
const routerContext = new RouterContext()
const rootRoute = routerContext.createRootRoute({
  component: () => { ... }
})

const articleRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'article',
  beforeLoad: () => {
    return {
      articleQueryOptions: { queryKey: ['article'], queryFn: fetchArticle },
      commentsQueryOptions: { queryKey: ['comments'], queryFn: fetchComments },
    }
  },
  loader: async ({
    context: { queryClient },
    routeContext: { articleQueryOptions, commentsQueryOptions },
  }) => {
    // Fetch comments asap, but don't block
    queryClient.prefetchQuery(commentsQueryOptions)

    // Don't render the route at all until article has been fetched
    await queryClient.prefetchQuery(articleQueryOptions)
  },
  component: ({ useRouteContext }) => {
    const { articleQueryOptions, commentsQueryOptions } = useRouteContext()
    const articleQuery = useQuery(articleQueryOptions)
    const commentsQuery = useQuery(commentsQueryOptions)

    return (
      ...
    )
  },
  errorComponent: () => 'Oh crap!',
})
```

Integration with other routers is also possible, see the [react-router](../examples/react-router) for another demonstration.

[//]: # 'Router'

## Manually Priming a Query

If you already have the data for your query synchronously available, you don't need to prefetch it. You can just use the [Query Client's `setQueryData` method](../../../reference/QueryClient.md#queryclientsetquerydata) to directly add or update a query's cached result by key.

[//]: # 'ExampleManualPriming'

```tsx
queryClient.setQueryData(['todos'], todos)
```

[//]: # 'ExampleManualPriming'
[//]: # 'Materials'

## Further reading

For a deep-dive on how to get data into your Query Cache before you fetch, see the [article Seeding the Query Cache by TkDodo](https://tkdodo.eu/blog/seeding-the-query-cache).

Integrating with Server Side routers and frameworks is very similar to what we just saw, with the addition that the data has to be passed from the server to the client to be hydrated into the cache there. To learn how, continue on to the [Server Rendering & Hydration guide](./ssr.md).

[//]: # 'Materials'
# Prefetching & Router Integration

When you know or suspect that a certain piece of data will be needed, you can use prefetching to populate the cache with that data ahead of time, leading to a faster experience.

There are a few different prefetching patterns:

1. In event handlers
2. In components
3. Via router integration
4. During Server Rendering (another form of router integration)

In this guide, we'll take a look at the first three, while the fourth will be covered in depth in the [Server Rendering & Hydration guide](./ssr.md) and the [Advanced Server Rendering guide](./advanced-ssr.md).

One specific use of prefetching is to avoid Request Waterfalls, for an in-depth background and explanation of those, see the [Performance & Request Waterfalls guide](./request-waterfalls.md).

## prefetchQuery & prefetchInfiniteQuery

Before jumping into the different specific prefetch patterns, let's look at the `prefetchQuery` and `prefetchInfiniteQuery` functions. First a few basics:

- Out of the box, these functions use the default `staleTime` configured for the `queryClient` to determine whether existing data in the cache is fresh or needs to be fetched again
- You can also pass a specific `staleTime` like this: `prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })`
  - This `staleTime` is only used for the prefetch, you still need to set it for any `useQuery` call as well
  - If you want to ignore `staleTime` and instead always return data if it's available in the cache, you can use the `ensureQueryData` function.
  - Tip: If you are prefetching on the server, set a default `staleTime` higher than `0` for that `queryClient` to avoid having to pass in a specific `staleTime` to each prefetch call
- If no instances of `useQuery` appear for a prefetched query, it will be deleted and garbage collected after the time specified in `gcTime`
- These functions return `Promise<void>` and thus never return query data. If that's something you need, use `fetchQuery`/`fetchInfiniteQuery` instead.
- The prefetch functions never throw errors because they usually try to fetch again in a `useQuery` which is a nice graceful fallback. If you need to catch errors, use `fetchQuery`/`fetchInfiniteQuery` instead.

This is how you use `prefetchQuery`:

[//]: # 'ExamplePrefetchQuery'

```tsx
const prefetchTodos = async () => {
  // The results of this query will be cached like a normal query
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

[//]: # 'ExamplePrefetchQuery'

Infinite Queries can be prefetched like regular Queries. Per default, only the first page of the Query will be prefetched and will be stored under the given QueryKey. If you want to prefetch more than one page, you can use the `pages` option, in which case you also have to provide a `getNextPageParam` function:

[//]: # 'ExamplePrefetchInfiniteQuery'

```tsx
const prefetchProjects = async () => {
  // The results of this query will be cached like a normal query
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    pages: 3, // prefetch the first 3 pages
  })
}
```

[//]: # 'ExamplePrefetchInfiniteQuery'

Next, let's look at how you can use these and other ways to prefetch in different situations.

## Prefetch in event handlers

A straightforward form of prefetching is doing it when the user interacts with something. In this example we'll use `queryClient.prefetchQuery` to start a prefetch on `onMouseEnter` or `onFocus`.

[//]: # 'ExampleEventHandler'

```tsx
function ShowDetailsButton() {
  const queryClient = useQueryClient()

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['details'],
      queryFn: getDetailsData,
      // Prefetch only fires when data is older than the staleTime,
      // so in a case like this you definitely want to set one
      staleTime: 60000,
    })
  }

  return (
    <button onMouseEnter={prefetch} onFocus={prefetch} onClick={...}>
      Show Details
    </button>
  )
}
```

[//]: # 'ExampleEventHandler'

## Prefetch in components

Prefetching during the component lifecycle is useful when we know some child or descendant will need a particular piece of data, but we can't render that until some other query has finished loading. Let's borrow an example from the Request Waterfall guide to explain:

[//]: # 'ExampleComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  if (isPending) {
    return 'Loading article...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      <Comments id={id} />
    </>
  )
}

function Comments({ id }) {
  const { data, isPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  ...
}
```

[//]: # 'ExampleComponent'

This results in a request waterfall looking like this:

```
1. |> getArticleById()
2.   |> getArticleCommentsById()
```

As mentioned in that guide, one way to flatten this waterfall and improve performance is to hoist the `getArticleCommentsById` query to the parent and pass down the result as a prop, but what if this is not feasible or desirable, for example when the components are unrelated and have multiple levels between them?

In that case, we can instead prefetch the query in the parent. The simplest way to do this is to use a query but ignore the result:

[//]: # 'ExampleParentComponent'

```tsx
function Article({ id }) {
  const { data: articleData, isPending } = useQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  // Prefetch
  useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
    // Optional optimization to avoid rerenders when this query changes:
    notifyOnChangeProps: [],
  })

  if (isPending) {
    return 'Loading article...'
  }

  return (
    <>
      <ArticleHeader articleData={articleData} />
      <ArticleBody articleData={articleData} />
      <Comments id={id} />
    </>
  )
}

function Comments({ id }) {
  const { data, isPending } = useQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  ...
}
```

[//]: # 'ExampleParentComponent'

This starts fetching `'article-comments'` immediately and flattens the waterfall:

```
1. |> getArticleById()
1. |> getArticleCommentsById()
```

[//]: # 'Suspense'

If you want to prefetch together with Suspense, you will have to do things a bit differently. You can't use `useSuspenseQueries` to prefetch, since the prefetch would block the component from rendering. You also can not use `useQuery` for the prefetch, because that wouldn't start the prefetch until after suspenseful query had resolved. For this scenario, you can use the [`usePrefetchQuery`](../reference/usePrefetchQuery.md) or the [`usePrefetchInfiniteQuery`](../reference/usePrefetchInfiniteQuery.md) hooks available in the library.

You can now use `useSuspenseQuery` in the component that actually needs the data. You _might_ want to wrap this later component in its own `<Suspense>` boundary so the "secondary" query we are prefetching does not block rendering of the "primary" data.

```tsx
function ArticleLayout({ id }) {
  usePrefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })

  return (
    <Suspense fallback="Loading article">
      <Article id={id} />
    </Suspense>
  )
}

function Article({ id }) {
  const { data: articleData, isPending } = useSuspenseQuery({
    queryKey: ['article', id],
    queryFn: getArticleById,
  })

  ...
}
```

Another way is to prefetch inside of the query function. This makes sense if you know that every time an article is fetched it's very likely comments will also be needed. For this, we'll use `queryClient.prefetchQuery`:

```tsx
const queryClient = useQueryClient()
const { data: articleData, isPending } = useQuery({
  queryKey: ['article', id],
  queryFn: (...args) => {
    queryClient.prefetchQuery({
      queryKey: ['article-comments', id],
      queryFn: getArticleCommentsById,
    })

    return getArticleById(...args)
  },
})
```

Prefetching in an effect also works, but note that if you are using `useSuspenseQuery` in the same component, this effect wont run until _after_ the query finishes which might not be what you want.

```tsx
const queryClient = useQueryClient()

useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['article-comments', id],
    queryFn: getArticleCommentsById,
  })
}, [queryClient, id])
```

To recap, if you want to prefetch a query during the component lifecycle, there are a few different ways to do it, pick the one that suits your situation best:

- Prefetch before a suspense boundary using `usePrefetchQuery` or `usePrefetchInfiniteQuery` hooks
- Use `useQuery` or `useSuspenseQueries` and ignore the result
- Prefetch inside the query function
- Prefetch in an effect

Let's look at a slightly more advanced case next.

[//]: # 'Suspense'

### Dependent Queries & Code Splitting

Sometimes we want to prefetch conditionally, based on the result of another fetch. Consider this example borrowed from the [Performance & Request Waterfalls guide](./request-waterfalls.md):

[//]: # 'ExampleConditionally1'

```tsx
// This lazy loads the GraphFeedItem component, meaning
// it wont start loading until something renders it
const GraphFeedItem = React.lazy(() => import('./GraphFeedItem'))

function Feed() {
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  if (isPending) {
    return 'Loading feed...'
  }

  return (
    <>
      {data.map((feedItem) => {
        if (feedItem.type === 'GRAPH') {
          return <GraphFeedItem key={feedItem.id} feedItem={feedItem} />
        }

        return <StandardFeedItem key={feedItem.id} feedItem={feedItem} />
      })}
    </>
  )
}

// GraphFeedItem.tsx
function GraphFeedItem({ feedItem }) {
  const { data, isPending } = useQuery({
    queryKey: ['graph', feedItem.id],
    queryFn: getGraphDataById,
  })

  ...
}
```

[//]: # 'ExampleConditionally1'

As noted over in that guide, this example leads to the following double request waterfall:

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
3.     |> getGraphDataById()
```

If we can not restructure our API so `getFeed()` also returns the `getGraphDataById()` data when necessary, there is no way to get rid of the `getFeed->getGraphDataById` waterfall, but by leveraging conditional prefetching, we can at least load the code and data in parallel. Just like described above, there are multiple ways to do this, but for this example, we'll do it in the query function:

[//]: # 'ExampleConditionally2'

```tsx
function Feed() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({
    queryKey: ['feed'],
    queryFn: async (...args) => {
      const feed = await getFeed(...args)

      for (const feedItem of feed) {
        if (feedItem.type === 'GRAPH') {
          queryClient.prefetchQuery({
            queryKey: ['graph', feedItem.id],
            queryFn: getGraphDataById,
          })
        }
      }

      return feed
    }
  })

  ...
}
```

[//]: # 'ExampleConditionally2'

This would load the code and data in parallel:

```
1. |> getFeed()
2.   |> JS for <GraphFeedItem>
2.   |> getGraphDataById()
```

There is a tradeoff however, in that the code for `getGraphDataById` is now included in the parent bundle instead of in `JS for <GraphFeedItem>` so you'll need to determine what's the best performance tradeoff on a case by case basis. If `GraphFeedItem` are likely, it's probably worth to include the code in the parent. If they are exceedingly rare, it's probably not.

[//]: # 'Router'

## Router Integration

Because data fetching in the component tree itself can easily lead to request waterfalls and the different fixes for that can be cumbersome as they accumulate throughout the application, an attractive way to do prefetching is integrating it at the router level.

In this approach, you explicitly declare for each _route_ what data is going to be needed for that component tree, ahead of time. Because Server Rendering has traditionally needed all data to be loaded before rendering starts, this has been the dominating approach for SSR'd apps for a long time. This is still a common approach and you can read more about it in the [Server Rendering & Hydration guide](./ssr.md).

For now, let's focus on the client side case and look at an example of how you can make this work with [TanStack Router](https://tanstack.com/router). These examples leave out a lot of setup and boilerplate to stay concise, you can check out a [full React Query example](https://tanstack.com/router/latest/docs/framework/react/examples/basic-react-query-file-based) over in the [TanStack Router docs](https://tanstack.com/router/latest/docs).

When integrating at the router level, you can choose to either _block_ rendering of that route until all data is present, or you can start a prefetch but not await the result. That way, you can start rendering the route as soon as possible. You can also mix these two approaches and await some critical data, but start rendering before all the secondary data has finished loading. In this example, we'll configure an `/article` route to not render until the article data has finished loading, as well as start prefetching comments as soon as possible, but not block rendering the route if comments haven't finished loading yet.

```tsx
const queryClient = new QueryClient()
const routerContext = new RouterContext()
const rootRoute = routerContext.createRootRoute({
  component: () => { ... }
})

const articleRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'article',
  beforeLoad: () => {
    return {
      articleQueryOptions: { queryKey: ['article'], queryFn: fetchArticle },
      commentsQueryOptions: { queryKey: ['comments'], queryFn: fetchComments },
    }
  },
  loader: async ({
    context: { queryClient },
    routeContext: { articleQueryOptions, commentsQueryOptions },
  }) => {
    // Fetch comments asap, but don't block
    queryClient.prefetchQuery(commentsQueryOptions)

    // Don't render the route at all until article has been fetched
    await queryClient.prefetchQuery(articleQueryOptions)
  },
  component: ({ useRouteContext }) => {
    const { articleQueryOptions, commentsQueryOptions } = useRouteContext()
    const articleQuery = useQuery(articleQueryOptions)
    const commentsQuery = useQuery(commentsQueryOptions)

    return (
      ...
    )
  },
  errorComponent: () => 'Oh crap!',
})
```

Integration with other routers is also possible, see the [react-router](../examples/react-router) for another demonstration.

[//]: # 'Router'

## Manually Priming a Query

If you already have the data for your query synchronously available, you don't need to prefetch it. You can just use the [Query Client's `setQueryData` method](../../../reference/QueryClient.md#queryclientsetquerydata) to directly add or update a query's cached result by key.

[//]: # 'ExampleManualPriming'

```tsx
queryClient.setQueryData(['todos'], todos)
```

[//]: # 'ExampleManualPriming'
[//]: # 'Materials'

## Further reading

For a deep-dive on how to get data into your Query Cache before you fetch, see the [article Seeding the Query Cache by TkDodo](https://tkdodo.eu/blog/seeding-the-query-cache).

Integrating with Server Side routers and frameworks is very similar to what we just saw, with the addition that the data has to be passed from the server to the client to be hydrated into the cache there. To learn how, continue on to the [Server Rendering & Hydration guide](./ssr.md).

[//]: # 'Materials'
# Server Rendering & Hydration

In this guide you'll learn how to use React Query with server rendering.

See the guide on [Prefetching & Router Integration](./prefetching.md) for some background. You might also want to check out the [Performance & Request Waterfalls guide](./request-waterfalls.md) before that.

For deeper examples on hydration + prefetching (including code splitting), see the [Dependent Queries & Code Splitting](./prefetching.md#dependent-queries-code-splitting) section.

For advanced server rendering patterns, such as streaming, Server Components and the new Next.js app router, see the [Advanced Server Rendering guide](./advanced-ssr.md).

If you just want to see some code, you can skip ahead to the [Full Next.js pages router example](#full-nextjs-pages-router-example) or the [Full Remix example](#full-remix-example) below.

## Server Rendering & React Query

So what is server rendering anyway? The rest of this guide will assume you are familiar with the concept, but let's spend some time to look at how it relates to React Query. Server rendering is the act of generating the initial html on the server, so that the user has some content to look at as soon as the page loads. This can happen on demand when a page is requested (SSR). It can also happen ahead of time either because a previous request was cached, or at build time (SSG).

If you've read the [Performance & Request Waterfalls guide](./request-waterfalls.md), you might remember this:

```
1. |-> Markup (without content)
2.   |-> JS
3.     |-> Query
```

With a client rendered application, these are the minimum 3 server roundtrips you will need to make before getting any content on the screen for the user. One way of viewing server rendering is that it turns the above into this:

```
1. |-> Markup (with content AND initial data)
2.   |-> JS
```

As soon as **1.** is complete, the user can see the content and when **2.** finishes, the page is interactive and clickable. Because the markup also contains the initial data we need, step **3.** does not need to run on the client at all, at least until you want to revalidate the data for some reason.

This is all from the clients perspective. On the server, we need to **prefetch** that data before we generate/render the markup, we need to **dehydrate** that data into a serializable format we can embed in the markup, and on the client we need to **hydrate** that data into a React Query cache so we can avoid doing a new fetch on the client.

Read on to learn how to implement these three steps with React Query.

## A quick note on Suspense

This guide uses the regular `useQuery` API. While we don't necessarily recommend it, it is possible to replace this with `useSuspenseQuery` instead **as long as you always prefetch all your queries**. The upside is that you get to use `<Suspense>` for loading states on the client.

If you do forget to prefetch a query when you are using `useSuspenseQuery`, the consequences will depend on the framework you are using. In some cases, the data will Suspend and get fetched on the server but never be hydrated to the client, where it will fetch again. In these cases you will get a markup hydration mismatch, because the server and the client tried to render different things.

## Initial setup

The first steps of using React Query is always to create a `queryClient` and wrap the application in a `<QueryClientProvider>`. When doing server rendering, it's important to create the `queryClient` instance **inside of your app**, in React state (an instance ref works fine too). **This ensures that data is not shared between different users and requests**, while still only creating the `queryClient` once per component lifecycle.

Next.js pages router:

```tsx
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// NEVER DO THIS:
// const queryClient = new QueryClient()
//
// Creating the queryClient at the file root level makes the cache shared
// between all requests and means _all_ data gets passed to _all_ users.
// Besides being bad for performance, this also leaks any sensitive data.

export default function MyApp({ Component, pageProps }) {
  // Instead do this, which ensures each request has its own cache:
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

Remix:

```tsx
// app/root.tsx
import { Outlet } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
```

## Get started fast with `initialData`

The quickest way to get started is to not involve React Query at all when it comes to prefetching and not use the `dehydrate`/`hydrate` APIs. What you do instead is passing the raw data in as the `initialData` option to `useQuery`. Let's look at an example using Next.js pages router, using `getServerSideProps`.

```tsx
export async function getServerSideProps() {
  const posts = await getPosts()
  return { props: { posts } }
}

function Posts(props) {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialData: props.posts,
  })

  // ...
}
```

This also works with `getStaticProps` or even the older `getInitialProps` and the same pattern can be applied in any other framework that has equivalent functions. This is what the same example looks like with Remix:

```tsx
export async function loader() {
  const posts = await getPosts()
  return json({ posts })
}

function Posts() {
  const { posts } = useLoaderData<typeof loader>()

  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialData: posts,
  })

  // ...
}
```

The setup is minimal and this can be a quick solution for some cases, but there are a **few tradeoffs to consider** when compared to the full approach:

- If you are calling `useQuery` in a component deeper down in the tree you need to pass the `initialData` down to that point
- If you are calling `useQuery` with the same query in multiple locations, passing `initialData` to only one of them can be brittle and break when your app changes since. If you remove or move the component that has the `useQuery` with `initialData`, the more deeply nested `useQuery` might no longer have any data. Passing `initialData` to **all** queries that needs it can also be cumbersome.
- There is no way to know at what time the query was fetched on the server, so `dataUpdatedAt` and determining if the query needs refetching is based on when the page loaded instead
- If there is already data in the cache for a query, `initialData` will never overwrite this data, **even if the new data is fresher than the old one**.
  - To understand why this is especially bad, consider the `getServerSideProps` example above. If you navigate back and forth to a page several times, `getServerSideProps` would get called each time and fetch new data, but because we are using the `initialData` option, the client cache and data would never be updated.

Setting up the full hydration solution is straightforward and does not have these drawbacks, this will be the focus for the rest of the documentation.

## Using the Hydration APIs

With just a little more setup, you can use a `queryClient` to prefetch queries during a preload phase, pass a serialized version of that `queryClient` to the rendering part of the app and reuse it there. This avoids the drawbacks above. Feel free to skip ahead for full Next.js pages router and Remix examples, but at a general level these are the extra steps:

- In the framework loader function, create a `const queryClient = new QueryClient(options)`
- In the loader function, do `await queryClient.prefetchQuery(...)` for each query you want to prefetch
  - You want to use `await Promise.all(...)` to fetch the queries in parallel when possible
  - It's fine to have queries that aren't prefetched. These wont be server rendered, instead they will be fetched on the client after the application is interactive. This can be great for content that are shown only after user interaction, or is far down on the page to avoid blocking more critical content.
- From the loader, return `dehydrate(queryClient)`, note that the exact syntax to return this differs between frameworks
- Wrap your tree with `<HydrationBoundary state={dehydratedState}>` where `dehydratedState` comes from the framework loader. How you get `dehydratedState` also differs between frameworks.
  - This can be done for each route, or at the top of the application to avoid boilerplate, see examples

> An interesting detail is that there are actually _three_ `queryClient`s involved. The framework loaders are a form of "preloading" phase that happens before rendering, and this phase has its own `queryClient` that does the prefetching. The dehydrated result of this phase gets passed to **both** the server rendering process **and** the client rendering process which each has its own `queryClient`. This ensures they both start with the same data so they can return the same markup.

> Server Components are another form of "preloading" phase, that can also "preload" (pre-render) parts of a React component tree. Read more in the [Advanced Server Rendering guide](./advanced-ssr.md).

### Full Next.js pages router example

> For app router documentation, see the [Advanced Server Rendering guide](./advanced-ssr.md).

Initial setup:

```tsx
// _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

In each route:

```tsx
// pages/posts.tsx
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

// This could also be getServerSideProps
export async function getStaticProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Posts() {
  // This useQuery could just as well happen in some deeper child to
  // the <PostsRoute>, data will be available immediately either way
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // This query was not prefetched on the server and will not start
  // fetching until on the client, both patterns are fine to mix
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}

export default function PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

### Full Remix example

Initial setup:

```tsx
// app/root.tsx
import { Outlet } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function MyApp() {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
```

In each route, note that it's fine to do this in nested routes too:

```tsx
// app/routes/posts.tsx
import { json } from '@remix-run/node'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

export async function loader() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return json({ dehydratedState: dehydrate(queryClient) })
}

function Posts() {
  // This useQuery could just as well happen in some deeper child to
  // the <PostsRoute>, data will be available immediately either way
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // This query was not prefetched on the server and will not start
  // fetching until on the client, both patterns are fine to mix
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}

export default function PostsRoute() {
  const { dehydratedState } = useLoaderData<typeof loader>()
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

## Optional - Remove boilerplate

Having this part in every route might seem like a lot of boilerplate:

```tsx
export default function PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
```

While there is nothing wrong with this approach, if you want to get rid of this boilerplate, here's how you can modify your setup in Next.js:

```tsx
// _app.tsx
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

// pages/posts.tsx
// Remove PostsRoute with the HydrationBoundary and instead export Posts directly:
export default function Posts() { ... }
```

With Remix, this is a little bit more involved, we recommend checking out the [use-dehydrated-state](https://github.com/maplegrove-io/use-dehydrated-state) package.

## Prefetching dependent queries

Over in the Prefetching guide we learned how to [prefetch dependent queries](./prefetching.md#dependent-queries-code-splitting), but how do we do this in framework loaders? Consider the following code, taken from the [Dependent Queries guide](./dependent-queries.md):

```tsx
// Get the user
const { data: user } = useQuery({
  queryKey: ['user', email],
  queryFn: getUserByEmail,
})

const userId = user?.id

// Then get the user's projects
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery({
  queryKey: ['projects', userId],
  queryFn: getProjectsByUser,
  // The query will not execute until the userId exists
  enabled: !!userId,
})
```

How would we prefetch this so it can be server rendered? Here's an example:

```tsx
// For Remix, rename this to loader instead
export async function getServerSideProps() {
  const queryClient = new QueryClient()

  const user = await queryClient.fetchQuery({
    queryKey: ['user', email],
    queryFn: getUserByEmail,
  })

  if (user?.userId) {
    await queryClient.prefetchQuery({
      queryKey: ['projects', userId],
      queryFn: getProjectsByUser,
    })
  }

  // For Remix:
  // return json({ dehydratedState: dehydrate(queryClient) })
  return { props: { dehydratedState: dehydrate(queryClient) } }
}
```

This can get more complex of course, but since these loader functions are just JavaScript, you can use the full power of the language to build your logic. Make sure you prefetch all queries that you want to be server rendered.

## Error handling

React Query defaults to a graceful degradation strategy. This means:

- `queryClient.prefetchQuery(...)` never throws errors
- `dehydrate(...)` only includes successful queries, not failed ones

This will lead to any failed queries being retried on the client and that the server rendered output will include loading states instead of the full content.

While a good default, sometimes this is not what you want. When critical content is missing, you might want to respond with a 404 or 500 status code depending on the situation. For these cases, use `queryClient.fetchQuery(...)` instead, which will throw errors when it fails, letting you handle things in a suitable way.

```tsx
let result

try {
  result = await queryClient.fetchQuery(...)
} catch (error) {
  // Handle the error, refer to your framework documentation
}

// You might also want to check and handle any invalid `result` here
```

If you for some reason want to include failed queries in the dehydrated state to avoid retries, you can use the option `shouldDehydrateQuery` to override the default function and implement your own logic:

```tsx
dehydrate(queryClient, {
  shouldDehydrateQuery: (query) => {
    // This will include all queries, including failed ones,
    // but you can also implement your own logic by inspecting `query`
    return true
  },
})
```

## Serialization

When doing `return { props: { dehydratedState: dehydrate(queryClient) } }` in Next.js, or `return json({ dehydratedState: dehydrate(queryClient) })` in Remix, what happens is that the `dehydratedState` representation of the `queryClient` is serialized by the framework so it can be embedded into the markup and transported to the client.

By default, these frameworks only support returning things that are safely serializable/parsable, and therefore do not support `undefined`, `Error`, `Date`, `Map`, `Set`, `BigInt`, `Infinity`, `NaN`, `-0`, regular expressions etc. This also means that you can not return any of these things from your queries. If returning these values is something you want, check out [superjson](https://github.com/blitz-js/superjson) or similar packages.

If you are using a custom SSR setup, you need to take care of this step yourself. Your first instinct might be to use `JSON.stringify(dehydratedState)`, but because this doesn't escape things like `<script>alert('Oh no..')</script>` by default, this can easily lead to **XSS-vulnerabilities** in your application. [superjson](https://github.com/blitz-js/superjson) also **does not** escape values and is unsafe to use by itself in a custom SSR setup (unless you add an extra step for escaping the output). Instead we recommend using a library like [Serialize JavaScript](https://github.com/yahoo/serialize-javascript) or [devalue](https://github.com/Rich-Harris/devalue) which are both safe against XSS injections out of the box.

## A note about request waterfalls

In the [Performance & Request Waterfalls guide](./request-waterfalls.md) we mentioned we would revisit how server rendering changes one of the more complex nested waterfalls. Check back for the [specific code example](./request-waterfalls#code-splitting), but as a refresher, we have a code split `<GraphFeedItem>` component inside a `<Feed>` component. This only renders if the feed contains a graph item and both of these components fetches their own data. With client rendering, this leads to the following request waterfall:

```
1. |> Markup (without content)
2.   |> JS for <Feed>
3.     |> getFeed()
4.       |> JS for <GraphFeedItem>
5.         |> getGraphDataById()
```

The nice thing about server rendering is that we can turn the above into:

```
1. |> Markup (with content AND initial data)
2.   |> JS for <Feed>
2.   |> JS for <GraphFeedItem>
```

Note that the queries are no longer fetched on the client, instead their data was included in the markup. The reason we can now load the JS in parallel is that since `<GraphFeedItem>` was rendered on the server we know that we are going to need this JS on the client as well and can insert a script-tag for this chunk in the markup. On the server, we would still have this request waterfall:

```
1. |> getFeed()
2.   |> getGraphDataById()
```

We simply can not know before we have fetched the feed if we also need to fetch graph data, they are dependent queries. Because this happens on the server where latency is generally both lower and more stable, this often isn't such a big deal.

Amazing, we've mostly flattened our waterfalls! There's a catch though. Let's call this page the `/feed` page, and let's pretend we also have another page like `/posts`. If we type in `www.example.com/feed` directly in the url bar and hit enter, we get all these great server rendering benefits, BUT, if we instead type in `www.example.com/posts` and then **click a link** to `/feed`, we're back to this:

```
1. |> JS for <Feed>
2.   |> getFeed()
3.     |> JS for <GraphFeedItem>
4.       |> getGraphDataById()
```

This is because with SPA's, server rendering only works for the initial page load, not for any subsequent navigation.

Modern frameworks often try to solve this by fetching the initial code and data in parallel, so if you were using Next.js or Remix with the prefetching patterns we outlined in this guide, including how to prefetch dependent queries, it would actually look like this instead:

```
1. |> JS for <Feed>
1. |> getFeed() + getGraphDataById()
2.   |> JS for <GraphFeedItem>
```

This is much better, but if we want to improve this further we can flatten this to a single roundtrip with Server Components. Learn how in the [Advanced Server Rendering guide](./advanced-ssr.md).

## Tips, Tricks and Caveats

### Staleness is measured from when the query was fetched on the server

A query is considered stale depending on when it was `dataUpdatedAt`. A caveat here is that the server needs to have the correct time for this to work properly, but UTC time is used, so timezones do not factor into this.

Because `staleTime` defaults to `0`, queries will be refetched in the background on page load by default. You might want to use a higher `staleTime` to avoid this double fetching, especially if you don't cache your markup.

This refetching of stale queries is a perfect match when caching markup in a CDN! You can set the cache time of the page itself decently high to avoid having to re-render pages on the server, but configure the `staleTime` of the queries lower to make sure data is refetched in the background as soon as a user visits the page. Maybe you want to cache the pages for a week, but refetch the data automatically on page load if it's older than a day?

### High memory consumption on server

In case you are creating the `QueryClient` for every request, React Query creates the isolated cache for this client, which is preserved in memory for the `gcTime` period. That may lead to high memory consumption on server in case of high number of requests during that period.

On the server, `gcTime` defaults to `Infinity` which disables manual garbage collection and will automatically clear memory once a request has finished. If you are explicitly setting a non-Infinity `gcTime` then you will be responsible for clearing the cache early.

Avoid setting `gcTime` to `0` as it may result in a hydration error. This occurs because the [Hydration Boundary](../reference/hydration.md#hydrationboundary) places necessary data into the cache for rendering, but if the garbage collector removes the data before the rendering completes, issues may arise. If you require a shorter `gcTime`, we recommend setting it to `2 * 1000` to allow sufficient time for the app to reference the data.

To clear the cache after it is not needed and to lower memory consumption, you can add a call to [`queryClient.clear()`](../../../reference/QueryClient.md#queryclientclear) after the request is handled and dehydrated state has been sent to the client.

Alternatively, you can set a smaller `gcTime`.

### Caveat for Next.js rewrites

There's a catch if you're using [Next.js' rewrites feature](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites) together with [Automatic Static Optimization](https://nextjs.org/docs/pages/building-your-application/rendering/automatic-static-optimization) or `getStaticProps`: It will cause a second hydration by React Query. That's because [Next.js needs to ensure that they parse the rewrites](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites#rewrite-parameters) on the client and collect any params after hydration so that they can be provided in `router.query`.

The result is missing referential equality for all the hydration data, which for example triggers wherever your data is used as props of components or in the dependency array of `useEffect`s/`useMemo`s.
# Render Optimizations

React Query applies a couple of optimizations automatically to ensure that your components only re-render when they actually need to. This is done by the following means:

## structural sharing

React Query uses a technique called "structural sharing" to ensure that as many references as possible will be kept intact between re-renders. If data is fetched over the network, usually, you'll get a completely new reference by json parsing the response. However, React Query will keep the original reference if _nothing_ changed in the data. If a subset changed, React Query will keep the unchanged parts and only replace the changed parts.

> Note: This optimization only works if the `queryFn` returns JSON compatible data. You can turn it off by setting `structuralSharing: false` globally or on a per-query basis, or you can implement your own structural sharing by passing a function to it.

### referential identity

The top level object returned from `useQuery`, `useInfiniteQuery`, `useMutation` and the Array returned from `useQueries` is **not referentially stable**. It will be a new reference on every render. However, the `data` properties returned from these hooks will be as stable as possible.

## tracked properties

React Query will only trigger a re-render if one of the properties returned from `useQuery` is actually "used". This is done by using [Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This avoids a lot of unnecessary re-renders, e.g. because properties like `isFetching` or `isStale` might change often, but are not used in the component.

You can customize this feature by setting `notifyOnChangeProps` manually globally or on a per-query basis. If you want to turn that feature off, you can set `notifyOnChangeProps: 'all'`.

> Note: The get trap of a proxy is invoked by accessing a property, either via destructuring or by accessing it directly. If you use object rest destructuring, you will disable this optimization. We have a [lint rule](../../../eslint/no-rest-destructuring.md) to guard against this pitfall.

## select

You can use the `select` option to select a subset of the data that your component should subscribe to. This is useful for highly optimized data transformations or to avoid unnecessary re-renders.

```js
export const useTodos = (select) => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
  })
}

export const useTodoCount = () => {
  return useTodos((data) => data.length)
}
```

A component using the `useTodoCount` custom hook will only re-render if the length of the todos changes. It will **not** re-render if e.g. the name of a todo changed.

> Note: `select` operates on successfully cached data and is not the appropriate place to throw errors. The source of truth for errors is the `queryFn`, and a `select` function that returns an error results in `data` being `undefined` and `isSuccess` being `true`. We recommend handling errors in the `queryFn` if you wish to have a query fail on incorrect data, or outside of the query hook if you have a error case not related to caching.

### memoization

The `select` function will only re-run if:

- the `select` function itself changed referentially
- `data` changed

This means that an inlined `select` function, as shown above, will run on every render. To avoid this, you can wrap the `select` function in `useCallback`, or extract it to a stable function reference if it doesn't have any dependencies:

```js
// wrapped in useCallback
export const useTodoCount = () => {
  return useTodos(useCallback((data) => data.length, []))
}
```

```js
// extracted to a stable function reference
const selectTodoCount = (data) => data.length

export const useTodoCount = () => {
  return useTodos(selectTodoCount)
}
```

## Further Reading

For an in-depth guide about these topics, read [React Query Render Optimizations](https://tkdodo.eu/blog/react-query-render-optimizations) from
the TkDodo. To learn how to best optimize the `select` option, read [React Query Selectors, Supercharged](https://tkdodo.eu/blog/react-query-selectors-supercharged)
# QueryClient

## `QueryClient`

The `QueryClient` can be used to interact with a cache:

```tsx
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})

await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts })
```

Its available methods are:

- [`queryClient.fetchQuery`](#queryclientfetchquery)
- [`queryClient.fetchInfiniteQuery`](#queryclientfetchinfinitequery)
- [`queryClient.prefetchQuery`](#queryclientprefetchquery)
- [`queryClient.prefetchInfiniteQuery`](#queryclientprefetchinfinitequery)
- [`queryClient.getQueryData`](#queryclientgetquerydata)
- [`queryClient.ensureQueryData`](#queryclientensurequerydata)
- [`queryClient.ensureInfiniteQueryData`](#queryclientensureinfinitequerydata)
- [`queryClient.getQueriesData`](#queryclientgetqueriesdata)
- [`queryClient.setQueryData`](#queryclientsetquerydata)
- [`queryClient.getQueryState`](#queryclientgetquerystate)
- [`queryClient.setQueriesData`](#queryclientsetqueriesdata)
- [`queryClient.invalidateQueries`](#queryclientinvalidatequeries)
- [`queryClient.refetchQueries`](#queryclientrefetchqueries)
- [`queryClient.cancelQueries`](#queryclientcancelqueries)
- [`queryClient.removeQueries`](#queryclientremovequeries)
- [`queryClient.resetQueries`](#queryclientresetqueries)
- [`queryClient.isFetching`](#queryclientisfetching)
- [`queryClient.isMutating`](#queryclientismutating)
- [`queryClient.getDefaultOptions`](#queryclientgetdefaultoptions)
- [`queryClient.setDefaultOptions`](#queryclientsetdefaultoptions)
- [`queryClient.getQueryDefaults`](#queryclientgetquerydefaults)
- [`queryClient.setQueryDefaults`](#queryclientsetquerydefaults)
- [`queryClient.getMutationDefaults`](#queryclientgetmutationdefaults)
- [`queryClient.setMutationDefaults`](#queryclientsetmutationdefaults)
- [`queryClient.getQueryCache`](#queryclientgetquerycache)
- [`queryClient.getMutationCache`](#queryclientgetmutationcache)
- [`queryClient.clear`](#queryclientclear)
- [`queryClient.resumePausedMutations`](#queryclientresumepausedmutations)

**Options**

- `queryCache?: QueryCache`
  - Optional
  - The query cache this client is connected to.
- `mutationCache?: MutationCache`
  - Optional
  - The mutation cache this client is connected to.
- `defaultOptions?: DefaultOptions`
  - Optional
  - Define defaults for all queries and mutations using this queryClient.
  - You can also define defaults to be used for [hydration](../framework/react/reference/hydration.md)

## `queryClient.fetchQuery`

`fetchQuery` is an asynchronous method that can be used to fetch and cache a query. It will either resolve with the data or throw with the error. Use the `prefetchQuery` method if you just want to fetch a query without needing the result.

If the query exists and the data is not invalidated or older than the given `staleTime`, then the data from the cache will be returned. Otherwise it will try to fetch the latest data.

```tsx
try {
  const data = await queryClient.fetchQuery({ queryKey, queryFn })
} catch (error) {
  console.log(error)
}
```

Specify a `staleTime` to only fetch when the data is older than a certain amount of time:

```tsx
try {
  const data = await queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: 10000,
  })
} catch (error) {
  console.log(error)
}
```

**Options**

The options for `fetchQuery` are exactly the same as those of [`useQuery`](../framework/react/reference/useQuery.md), except the following: `enabled, refetchInterval, refetchIntervalInBackground, refetchOnWindowFocus, refetchOnReconnect, refetchOnMount, notifyOnChangeProps, throwOnError, select, suspense, placeholderData`; which are strictly for useQuery and useInfiniteQuery. You can check the [source code](https://github.com/TanStack/query/blob/7cd2d192e6da3df0b08e334ea1cf04cd70478827/packages/query-core/src/types.ts#L119) for more clarity.

**Returns**

- `Promise<TData>`

## `queryClient.fetchInfiniteQuery`

`fetchInfiniteQuery` is similar to `fetchQuery` but can be used to fetch and cache an infinite query.

```tsx
try {
  const data = await queryClient.fetchInfiniteQuery({ queryKey, queryFn })
  console.log(data.pages)
} catch (error) {
  console.log(error)
}
```

**Options**

The options for `fetchInfiniteQuery` are exactly the same as those of [`fetchQuery`](#queryclientfetchquery).

**Returns**

- `Promise<InfiniteData<TData, TPageParam>>`

## `queryClient.prefetchQuery`

`prefetchQuery` is an asynchronous method that can be used to prefetch a query before it is needed or rendered with `useQuery` and friends. The method works the same as `fetchQuery` except that it will not throw or return any data.

```tsx
await queryClient.prefetchQuery({ queryKey, queryFn })
```

You can even use it with a default queryFn in your config!

```tsx
await queryClient.prefetchQuery({ queryKey })
```

**Options**

The options for `prefetchQuery` are exactly the same as those of [`fetchQuery`](#queryclientfetchquery).

**Returns**

- `Promise<void>`
  - A promise is returned that will either immediately resolve if no fetch is needed or after the query has been executed. It will not return any data or throw any errors.

## `queryClient.prefetchInfiniteQuery`

`prefetchInfiniteQuery` is similar to `prefetchQuery` but can be used to prefetch and cache an infinite query.

```tsx
await queryClient.prefetchInfiniteQuery({ queryKey, queryFn })
```

**Options**

The options for `prefetchInfiniteQuery` are exactly the same as those of [`fetchQuery`](#queryclientfetchquery).

**Returns**

- `Promise<void>`
  - A promise is returned that will either immediately resolve if no fetch is needed or after the query has been executed. It will not return any data or throw any errors.

## `queryClient.getQueryData`

`getQueryData` is a synchronous function that can be used to get an existing query's cached data. If the query does not exist, `undefined` will be returned.

```tsx
const data = queryClient.getQueryData(queryKey)
```

**Options**

- `queryKey: QueryKey`: [Query Keys](../framework/react/guides/query-keys.md)

**Returns**

- `data: TQueryFnData | undefined`
  - The data for the cached query, or `undefined` if the query does not exist.

## `queryClient.ensureQueryData`

`ensureQueryData` is an asynchronous function that can be used to get an existing query's cached data. If the query does not exist, `queryClient.fetchQuery` will be called and its results returned.

```tsx
const data = await queryClient.ensureQueryData({ queryKey, queryFn })
```

**Options**

- the same options as [`fetchQuery`](#queryclientfetchquery)
- `revalidateIfStale: boolean`
  - Optional
  - Defaults to `false`
  - If set to `true`, stale data will be refetched in the background, but cached data will be returned immediately.

**Returns**

- `Promise<TData>`

## `queryClient.ensureInfiniteQueryData`

`ensureInfiniteQueryData` is an asynchronous function that can be used to get an existing infinite query's cached data. If the query does not exist, `queryClient.fetchInfiniteQuery` will be called and its results returned.

```tsx
const data = await queryClient.ensureInfiniteQueryData({
  queryKey,
  queryFn,
  initialPageParam,
  getNextPageParam,
})
```

**Options**

- the same options as [`fetchInfiniteQuery`](#queryclientfetchinfinitequery)
- `revalidateIfStale: boolean`
  - Optional
  - Defaults to `false`
  - If set to `true`, stale data will be refetched in the background, but cached data will be returned immediately.

**Returns**

- `Promise<InfiniteData<TData, TPageParam>>`

## `queryClient.getQueriesData`

`getQueriesData` is a synchronous function that can be used to get the cached data of multiple queries. Only queries that match the passed queryKey or queryFilter will be returned. If there are no matching queries, an empty array will be returned.

```tsx
const data = queryClient.getQueriesData(filters)
```

**Options**

- `filters: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)
  - if a filter is passed, the data with queryKeys matching the filter will be returned

**Returns**

- `[queryKey: QueryKey, data: TQueryFnData | undefined][]`
  - An array of tuples for the matched query keys, or `[]` if there are no matches. The tuples are the query key and its associated data.

**Caveats**

Because the returned data in each tuple can be of varying structures (i.e. using a filter to return "active" queries can return different data types), the `TData` generic defaults to `unknown`. If you provide a more specific type to `TData` it is assumed that you are certain each tuple's data entry is all the same type.

This distinction is more a "convenience" for ts devs that know which structure will be returned.

## `queryClient.setQueryData`

`setQueryData` is a synchronous function that can be used to immediately update a query's cached data. If the query does not exist, it will be created. **If the query is not utilized by a query hook in the default `gcTime` of 5 minutes, the query will be garbage collected**. To update multiple queries at once and match query keys partially, you need to use [`queryClient.setQueriesData`](#queryclientsetqueriesdata) instead.

> The difference between using `setQueryData` and `fetchQuery` is that `setQueryData` is sync and assumes that you already synchronously have the data available. If you need to fetch the data asynchronously, it's suggested that you either refetch the query key or use `fetchQuery` to handle the asynchronous fetch.

```tsx
queryClient.setQueryData(queryKey, updater)
```

**Options**

- `queryKey: QueryKey`: [Query Keys](../framework/react/guides/query-keys.md)
- `updater: TQueryFnData | undefined | ((oldData: TQueryFnData | undefined) => TQueryFnData | undefined)`
  - If non-function is passed, the data will be updated to this value
  - If a function is passed, it will receive the old data value and be expected to return a new one.

**Using an updater value**

```tsx
setQueryData(queryKey, newData)
```

If the value is `undefined`, the query data is not updated.

**Using an updater function**

For convenience in syntax, you can also pass an updater function which receives the current data value and returns the new one:

```tsx
setQueryData(queryKey, (oldData) => newData)
```

If the updater function returns `undefined`, the query data will not be updated. If the updater function receives `undefined` as input, you can return `undefined` to bail out of the update and thus _not_ create a new cache entry.

**Immutability**

Updates via `setQueryData` must be performed in an _immutable_ way. **DO NOT** attempt to write directly to the cache by mutating `oldData` or data that you retrieved via `getQueryData` in place.

## `queryClient.getQueryState`

`getQueryState` is a synchronous function that can be used to get an existing query's state. If the query does not exist, `undefined` will be returned.

```tsx
const state = queryClient.getQueryState(queryKey)
console.log(state.dataUpdatedAt)
```

**Options**

- `queryKey: QueryKey`: [Query Keys](../framework/react/guides/query-keys.md)

## `queryClient.setQueriesData`

`setQueriesData` is a synchronous function that can be used to immediately update cached data of multiple queries by using filter function or partially matching the query key. Only queries that match the passed queryKey or queryFilter will be updated - no new cache entries will be created. Under the hood, [`setQueryData`](#queryclientsetquerydata) is called for each existing query.

```tsx
queryClient.setQueriesData(filters, updater)
```

**Options**

- `filters: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)
  - if a filter is passed, queryKeys matching the filter will be updated
- `updater: TQueryFnData | (oldData: TQueryFnData | undefined) => TQueryFnData`
  - the [setQueryData](#queryclientsetquerydata) updater function or new data, will be called for each matching queryKey

## `queryClient.invalidateQueries`

The `invalidateQueries` method can be used to invalidate and refetch single or multiple queries in the cache based on their query keys or any other functionally accessible property/state of the query. By default, all matching queries are immediately marked as invalid and active queries are refetched in the background.

- If you **do not want active queries to refetch**, and simply be marked as invalid, you can use the `refetchType: 'none'` option.
- If you **want inactive queries to refetch** as well, use the `refetchType: 'all'` option
- For refetching, [queryClient.refetchQueries](#queryclientrefetchqueries) is called.

```tsx
await queryClient.invalidateQueries(
  {
    queryKey: ['posts'],
    exact,
    refetchType: 'active',
  },
  { throwOnError, cancelRefetch },
)
```

**Options**

- `filters?: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)
  - `queryKey?: QueryKey`: [Query Keys](../framework/react/guides/query-keys.md)
  - `refetchType?: 'active' | 'inactive' | 'all' | 'none'`
    - Defaults to `'active'`
    - When set to `active`, only queries that match the refetch predicate and are actively being rendered via `useQuery` and friends will be refetched in the background.
    - When set to `inactive`, only queries that match the refetch predicate and are NOT actively being rendered via `useQuery` and friends will be refetched in the background.
    - When set to `all`, all queries that match the refetch predicate will be refetched in the background.
    - When set to `none`, no queries will be refetched, and those that match the refetch predicate will be marked as invalid only.
- `options?: InvalidateOptions`:
  - `throwOnError?: boolean`
    - When set to `true`, this method will throw if any of the query refetch tasks fail.
  - `cancelRefetch?: boolean`
    - Defaults to `true`
      - Per default, a currently running request will be cancelled before a new request is made
    - When set to `false`, no refetch will be made if there is already a request running.

## `queryClient.refetchQueries`

The `refetchQueries` method can be used to refetch queries based on certain conditions.

Examples:

```tsx
// refetch all queries:
await queryClient.refetchQueries()

// refetch all stale queries:
await queryClient.refetchQueries({ stale: true })

// refetch all active queries partially matching a query key:
await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })

// refetch all active queries exactly matching a query key:
await queryClient.refetchQueries({
  queryKey: ['posts', 1],
  type: 'active',
  exact: true,
})
```

**Options**

- `filters?: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)
- `options?: RefetchOptions`:
  - `throwOnError?: boolean`
    - When set to `true`, this method will throw if any of the query refetch tasks fail.
  - `cancelRefetch?: boolean`
    - Defaults to `true`
      - Per default, a currently running request will be cancelled before a new request is made
    - When set to `false`, no refetch will be made if there is already a request running.

**Returns**

This function returns a promise that will resolve when all of the queries are done being refetched. By default, it **will not** throw an error if any of those queries refetches fail, but this can be configured by setting the `throwOnError` option to `true`

**Notes**

- Queries that are "disabled" because they only have disabled Observers will never be refetched.
- Queries that are "static" because they only have Observers with a Static StaleTime will never be refetched.

## `queryClient.cancelQueries`

The `cancelQueries` method can be used to cancel outgoing queries based on their query keys or any other functionally accessible property/state of the query.

This is most useful when performing optimistic updates since you will likely need to cancel any outgoing query refetches so they don't clobber your optimistic update when they resolve.

```tsx
await queryClient.cancelQueries(
  { queryKey: ['posts'], exact: true },
  { silent: true },
)
```

**Options**

- `filters?: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)
- `cancelOptions?: CancelOptions`: [Cancel Options](../framework/react/guides/query-cancellation.md#cancel-options)

**Returns**

This method does not return anything

## `queryClient.removeQueries`

The `removeQueries` method can be used to remove queries from the cache based on their query keys or any other functionally accessible property/state of the query.

```tsx
queryClient.removeQueries({ queryKey, exact: true })
```

**Options**

- `filters?: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)

**Returns**

This method does not return anything

## `queryClient.resetQueries`

The `resetQueries` method can be used to reset queries in the cache to their
initial state based on their query keys or any other functionally accessible
property/state of the query.

This will notify subscribers &mdash; unlike `clear`, which removes all
subscribers &mdash; and reset the query to its pre-loaded state &mdash; unlike
`invalidateQueries`. If a query has `initialData`, the query's data will be
reset to that. If a query is active, it will be refetched.

```tsx
queryClient.resetQueries({ queryKey, exact: true })
```

**Options**

- `filters?: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)
- `options?: ResetOptions`:
  - `throwOnError?: boolean`
    - When set to `true`, this method will throw if any of the query refetch tasks fail.
  - `cancelRefetch?: boolean`
    - Defaults to `true`
      - Per default, a currently running request will be cancelled before a new request is made
    - When set to `false`, no refetch will be made if there is already a request running.

**Returns**

This method returns a promise that resolves when all active queries have been refetched.

## `queryClient.isFetching`

This `isFetching` method returns an `integer` representing how many queries, if any, in the cache are currently fetching (including background-fetching, loading new pages, or loading more infinite query results)

```tsx
if (queryClient.isFetching()) {
  console.log('At least one query is fetching!')
}
```

TanStack Query also exports a handy [`useIsFetching`](../framework/react/reference/useIsFetching.md) hook that will let you subscribe to this state in your components without creating a manual subscription to the query cache.

**Options**

- `filters?: QueryFilters`: [Query Filters](../framework/react/guides/filters.md#query-filters)

**Returns**

This method returns the number of fetching queries.

## `queryClient.isMutating`

This `isMutating` method returns an `integer` representing how many mutations, if any, in the cache are currently fetching.

```tsx
if (queryClient.isMutating()) {
  console.log('At least one mutation is fetching!')
}
```

TanStack Query also exports a handy [`useIsMutating`](../framework/react/reference/useIsMutating.md) hook that will let you subscribe to this state in your components without creating a manual subscription to the mutation cache.

**Options**

- `filters: MutationFilters`: [Mutation Filters](../framework/react/guides/filters.md#mutation-filters)

**Returns**

This method returns the number of fetching mutations.

## `queryClient.getDefaultOptions`

The `getDefaultOptions` method returns the default options which have been set when creating the client or with `setDefaultOptions`.

```tsx
const defaultOptions = queryClient.getDefaultOptions()
```

## `queryClient.setDefaultOptions`

The `setDefaultOptions` method can be used to dynamically set the default options for this queryClient. Previously defined default options will be overwritten.

```tsx
queryClient.setDefaultOptions({
  queries: {
    staleTime: Infinity,
  },
})
```

## `queryClient.getQueryDefaults`

The `getQueryDefaults` method returns the default options which have been set for specific queries:

```tsx
const defaultOptions = queryClient.getQueryDefaults(['posts'])
```

> Note that if several query defaults match the given query key, they will be merged together based on the order of registration.
> See [`setQueryDefaults`](#queryclientsetquerydefaults).

## `queryClient.setQueryDefaults`

`setQueryDefaults` can be used to set default options for specific queries:

```tsx
queryClient.setQueryDefaults(['posts'], { queryFn: fetchPosts })

function Component() {
  const { data } = useQuery({ queryKey: ['posts'] })
}
```

**Options**

- `queryKey: QueryKey`: [Query Keys](../framework/react/guides/query-keys.md)
- `options: QueryOptions`

> As stated in [`getQueryDefaults`](#queryclientgetquerydefaults), the order of registration of query defaults does matter.
> Since the matching defaults are merged by `getQueryDefaults`, the registration should be made in the following order: from the **most generic key** to the **least generic one** .
> This way, more specific defaults will override more generic defaults.

## `queryClient.getMutationDefaults`

The `getMutationDefaults` method returns the default options which have been set for specific mutations:

```tsx
const defaultOptions = queryClient.getMutationDefaults(['addPost'])
```

## `queryClient.setMutationDefaults`

`setMutationDefaults` can be used to set default options for specific mutations:

```tsx
queryClient.setMutationDefaults(['addPost'], { mutationFn: addPost })

function Component() {
  const { data } = useMutation({ mutationKey: ['addPost'] })
}
```

**Options**

- `mutationKey: unknown[]`
- `options: MutationOptions`

> Similar to [`setQueryDefaults`](#queryclientsetquerydefaults), the order of registration does matter here.

## `queryClient.getQueryCache`

The `getQueryCache` method returns the query cache this client is connected to.

```tsx
const queryCache = queryClient.getQueryCache()
```

## `queryClient.getMutationCache`

The `getMutationCache` method returns the mutation cache this client is connected to.

```tsx
const mutationCache = queryClient.getMutationCache()
```

## `queryClient.clear`

The `clear` method clears all connected caches.

```tsx
queryClient.clear()
```

## `queryClient.resumePausedMutations`

Can be used to resume mutations that have been paused because there was no network connection.

```tsx
queryClient.resumePausedMutations()
```
# useQuery

```tsx
const {
  data,
  dataUpdatedAt,
  error,
  errorUpdatedAt,
  failureCount,
  failureReason,
  fetchStatus,
  isError,
  isFetched,
  isFetchedAfterMount,
  isFetching,
  isInitialLoading,
  isLoading,
  isLoadingError,
  isPaused,
  isPending,
  isPlaceholderData,
  isRefetchError,
  isRefetching,
  isStale,
  isSuccess,
  isEnabled,
  promise,
  refetch,
  status,
} = useQuery(
  {
    queryKey,
    queryFn,
    gcTime,
    enabled,
    networkMode,
    initialData,
    initialDataUpdatedAt,
    meta,
    notifyOnChangeProps,
    placeholderData,
    queryKeyHashFn,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retry,
    retryOnMount,
    retryDelay,
    select,
    staleTime,
    structuralSharing,
    subscribed,
    throwOnError,
  },
  queryClient,
)
```

**Parameter1 (Options)**

- `queryKey: unknown[]`
  - **Required**
  - The query key to use for this query.
  - The query key will be hashed into a stable hash. See [Query Keys](../guides/query-keys.md) for more information.
  - The query will automatically update when this key changes (as long as `enabled` is not set to `false`).
- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **Required, but only if no default query function has been defined** See [Default Query Function](../guides/default-query-function.md) for more information.
  - The function that the query will use to request data.
  - Receives a [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext)
  - Must return a promise that will either resolve data or throw an error. The data cannot be `undefined`.
- `enabled: boolean | (query: Query) => boolean`
  - Set this to `false` to disable this query from automatically running.
  - Can be used for [Dependent Queries](../guides/dependent-queries.md).
- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - optional
  - defaults to `'online'`
  - see [Network Mode](../guides/network-mode.md) for more information.
- `retry: boolean | number | (failureCount: number, error: TError) => boolean`
  - If `false`, failed queries will not retry by default.
  - If `true`, failed queries will retry infinitely.
  - If set to a `number`, e.g. `3`, failed queries will retry until the failed query count meets that number.
  - If set to a function, it will be called with `failureCount` (starting at `0` for the first retry) and `error` to determine if a retry should be attempted.
  - defaults to `3` on the client and `0` on the server
- `retryOnMount: boolean`
  - If set to `false`, the query will not be retried on mount if it contains an error. Defaults to `true`.
- `retryDelay: number | (retryAttempt: number, error: TError) => number`
  - This function receives a `retryAttempt` integer and the actual Error and returns the delay to apply before the next attempt in milliseconds.
  - A function like `attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)` applies exponential backoff.
  - A function like `attempt => attempt * 1000` applies linear backoff.
- `staleTime: number | 'static' | ((query: Query) => number | 'static')`
  - Optional
  - Defaults to `0`
  - The time in milliseconds after which data is considered stale. This value only applies to the hook it is defined on.
  - If set to `Infinity`, the data will not be considered stale unless manually invalidated
  - If set to a function, the function will be executed with the query to compute a `staleTime`.
  - If set to `'static'`, the data will never be considered stale
- `gcTime: number | Infinity`
  - Defaults to `5 * 60 * 1000` (5 minutes) or `Infinity` during SSR
  - The time in milliseconds that unused/inactive cache data remains in memory. When a query's cache becomes unused or inactive, that cache data will be garbage collected after this duration. When different garbage collection times are specified, the longest one will be used.
  - Note: the maximum allowed time is about [24 days](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value), although it is possible to work around this limit using [timeoutManager.setTimeoutProvider](../../../reference/timeoutManager.md#timeoutmanagersettimeoutprovider).
  - If set to `Infinity`, will disable garbage collection
- `queryKeyHashFn: (queryKey: QueryKey) => string`
  - Optional
  - If specified, this function is used to hash the `queryKey` to a string.
- `refetchInterval: number | false | ((query: Query) => number | false | undefined)`
  - Optional
  - If set to a number, all queries will continuously refetch at this frequency in milliseconds
  - If set to a function, the function will be executed with the query to compute a frequency
- `refetchIntervalInBackground: boolean`
  - Optional
  - If set to `true`, queries that are set to continuously refetch with a `refetchInterval` will continue to refetch while their tab/window is in the background
- `refetchOnMount: boolean | "always" | ((query: Query) => boolean | "always")`
  - Optional
  - Defaults to `true`
  - If set to `true`, the query will refetch on mount if the data is stale.
  - If set to `false`, the query will not refetch on mount.
  - If set to `"always"`, the query will always refetch on mount (except when `staleTime: 'static'` is used).
  - If set to a function, the function will be executed with the query to compute the value
- `refetchOnWindowFocus: boolean | "always" | ((query: Query) => boolean | "always")`
  - Optional
  - Defaults to `true`
  - If set to `true`, the query will refetch on window focus if the data is stale.
  - If set to `false`, the query will not refetch on window focus.
  - If set to `"always"`, the query will always refetch on window focus (except when `staleTime: 'static'` is used).
  - If set to a function, the function will be executed with the query to compute the value
- `refetchOnReconnect: boolean | "always" | ((query: Query) => boolean | "always")`
  - Optional
  - Defaults to `true`
  - If set to `true`, the query will refetch on reconnect if the data is stale.
  - If set to `false`, the query will not refetch on reconnect.
  - If set to `"always"`, the query will always refetch on reconnect (except when `staleTime: 'static'` is used).
  - If set to a function, the function will be executed with the query to compute the value
- `notifyOnChangeProps: string[] | "all" | (() => string[] | "all" | undefined)`
  - Optional
  - If set, the component will only re-render if any of the listed properties change.
  - If set to `['data', 'error']` for example, the component will only re-render when the `data` or `error` properties change.
  - If set to `"all"`, the component will opt-out of smart tracking and re-render whenever a query is updated.
  - If set to a function, the function will be executed to compute the list of properties.
  - By default, access to properties will be tracked, and the component will only re-render when one of the tracked properties change.
- `select: (data: TData) => unknown`
  - Optional
  - This option can be used to transform or select a part of the data returned by the query function. It affects the returned `data` value, but does not affect what gets stored in the query cache.
  - The `select` function will only run if `data` changed, or if the reference to the `select` function itself changes. To optimize, wrap the function in `useCallback`.
- `initialData: TData | () => TData`
  - Optional
  - If set, this value will be used as the initial data for the query cache (as long as the query hasn't been created or cached yet)
  - If set to a function, the function will be called **once** during the shared/root query initialization, and be expected to synchronously return the initialData
  - Initial data is considered stale by default unless a `staleTime` has been set.
  - `initialData` **is persisted** to the cache
- `initialDataUpdatedAt: number | (() => number | undefined)`
  - Optional
  - If set, this value will be used as the time (in milliseconds) of when the `initialData` itself was last updated.
- `placeholderData: TData | (previousValue: TData | undefined, previousQuery: Query | undefined) => TData`
  - Optional
  - If set, this value will be used as the placeholder data for this particular query observer while the query is still in the `pending` state.
  - `placeholderData` is **not persisted** to the cache
  - If you provide a function for `placeholderData`, as a first argument you will receive previously watched query data if available, and the second argument will be the complete previousQuery instance.
- `structuralSharing: boolean | (oldData: unknown | undefined, newData: unknown) => unknown`
  - Optional
  - Defaults to `true`
  - If set to `false`, structural sharing between query results will be disabled.
  - If set to a function, the old and new data values will be passed through this function, which should combine them into resolved data for the query. This way, you can retain references from the old data to improve performance even when that data contains non-serializable values.
- `subscribed: boolean`
  - Optional
  - Defaults to `true`
  - If set to `false`, this instance of `useQuery` will not be subscribed to the cache. This means it won't trigger the `queryFn` on its own, and it won't receive updates if data gets into cache by other means.
- `throwOnError: undefined | boolean | (error: TError, query: Query) => boolean`
  - Set this to `true` if you want errors to be thrown in the render phase and propagate to the nearest error boundary
  - Set this to `false` to disable `suspense`'s default behavior of throwing errors to the error boundary.
  - If set to a function, it will be passed the error and the query, and it should return a boolean indicating whether to show the error in an error boundary (`true`) or return the error as state (`false`)
- `meta: Record<string, unknown>`
  - Optional
  - If set, stores additional information on the query cache entry that can be used as needed. It will be accessible wherever the `query` is available, and is also part of the `QueryFunctionContext` provided to the `queryFn`.

**Parameter2 (QueryClient)**

- `queryClient?: QueryClient`
  - Use this to use a custom QueryClient. Otherwise, the one from the nearest context will be used.

**Returns**

- `status: QueryStatus`
  - Will be:
    - `pending` if there's no cached data and no query attempt was finished yet.
    - `error` if the query attempt resulted in an error. The corresponding `error` property has the error received from the attempted fetch
    - `success` if the query has received a response with no errors and is ready to display its data. The corresponding `data` property on the query is the data received from the successful fetch or if the query's `enabled` property is set to `false` and has not been fetched yet `data` is the first `initialData` supplied to the query on initialization.
- `isPending: boolean`
  - A derived boolean from the `status` variable above, provided for convenience.
- `isSuccess: boolean`
  - A derived boolean from the `status` variable above, provided for convenience.
- `isError: boolean`
  - A derived boolean from the `status` variable above, provided for convenience.
- `isLoadingError: boolean`
  - Will be `true` if the query failed while fetching for the first time.
- `isRefetchError: boolean`
  - Will be `true` if the query failed while refetching.
- `data: TData`
  - Defaults to `undefined`.
  - The last successfully resolved data for the query.
- `dataUpdatedAt: number`
  - The timestamp for when the query most recently returned the `status` as `"success"`.
- `error: null | TError`
  - Defaults to `null`
  - The error object for the query, if an error was thrown.
- `errorUpdatedAt: number`
  - The timestamp for when the query most recently returned the `status` as `"error"`.
- `isStale: boolean`
  - Will be `true` if the data in the cache is invalidated or if the data is older than the given `staleTime`.
- `isPlaceholderData: boolean`
  - Will be `true` if the data shown is the placeholder data.
- `isFetched: boolean`
  - Will be `true` if the query has been fetched.
- `isFetchedAfterMount: boolean`
  - Will be `true` if the query has been fetched after the component mounted.
  - This property can be used to not show any previously cached data.
- `fetchStatus: FetchStatus`
  - `fetching`: Is `true` whenever the queryFn is executing, which includes initial `pending` as well as background refetches.
  - `paused`: The query wanted to fetch, but has been `paused`.
  - `idle`: The query is not fetching.
  - see [Network Mode](../guides/network-mode.md) for more information.
- `isFetching: boolean`
  - A derived boolean from the `fetchStatus` variable above, provided for convenience.
- `isPaused: boolean`
  - A derived boolean from the `fetchStatus` variable above, provided for convenience.
- `isRefetching: boolean`
  - Is `true` whenever a background refetch is in-flight, which _does not_ include initial `pending`
  - Is the same as `isFetching && !isPending`
- `isLoading: boolean`
  - Is `true` whenever the first fetch for a query is in-flight
  - Is the same as `isFetching && isPending`
- `isInitialLoading: boolean`
  - **deprecated**
  - An alias for `isLoading`, will be removed in the next major version.
- `isEnabled: boolean`
  - Is `true` if this query observer is enabled, `false` otherwise.
- `failureCount: number`
  - The failure count for the query.
  - Incremented every time the query fails.
  - Reset to `0` when the query succeeds.
- `failureReason: null | TError`
  - The failure reason for the query retry.
  - Reset to `null` when the query succeeds.
- `errorUpdateCount: number`
  - The sum of all errors.
- `refetch: (options: { throwOnError: boolean, cancelRefetch: boolean }) => Promise<UseQueryResult>`
  - A function to manually refetch the query.
  - If the query errors, the error will only be logged. If you want an error to be thrown, pass the `throwOnError: true` option
  - `cancelRefetch?: boolean`
    - Defaults to `true`
      - Per default, a currently running request will be cancelled before a new request is made
    - When set to `false`, no refetch will be made if there is already a request running.
- `promise: Promise<TData>`
  - A stable promise that will be resolved with the data of the query.
  - Requires the `experimental_prefetchInRender` feature flag to be enabled on the `QueryClient`.
# useInfiniteQuery

```tsx
const {
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  promise,
  ...result
} = useInfiniteQuery({
  queryKey,
  queryFn: ({ pageParam }) => fetchPage(pageParam),
  initialPageParam: 1,
  ...options,
  getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
    lastPage.nextCursor,
  getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
    firstPage.prevCursor,
})
```

**Options**

The options for `useInfiniteQuery` are identical to the [`useQuery` hook](../reference/useQuery.md) with the addition of the following:

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **Required, but only if no default query function has been defined** [`defaultQueryFn`](../guides/default-query-function.md)
  - The function that the query will use to request data.
  - Receives a [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext)
  - Must return a promise that will either resolve data or throw an error.
- `initialPageParam: TPageParam`
  - **Required**
  - The default page param to use when fetching the first page.
- `getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => TPageParam | undefined | null`
  - **Required**
  - When new data is received for this query, this function receives both the last page of the infinite list of data and the full array of all pages, as well as pageParam information.
  - It should return a **single variable** that will be passed as the last optional parameter to your query function.
  - Return `undefined` or `null` to indicate there is no next page available.
- `getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => TPageParam | undefined | null`
  - When new data is received for this query, this function receives both the first page of the infinite list of data and the full array of all pages, as well as pageParam information.
  - It should return a **single variable** that will be passed as the last optional parameter to your query function.
  - Return `undefined` or `null`to indicate there is no previous page available.
- `maxPages: number | undefined`
  - The maximum number of pages to store in the infinite query data.
  - When the maximum number of pages is reached, fetching a new page will result in the removal of either the first or last page from the pages array, depending on the specified direction.
  - If `undefined` or equals `0`, the number of pages is unlimited
  - Default value is `undefined`
  - `getNextPageParam` and `getPreviousPageParam` must be properly defined if `maxPages` value is greater than `0` to allow fetching a page in both directions when needed.

**Returns**

The returned properties for `useInfiniteQuery` are identical to the [`useQuery` hook](../reference/useQuery.md), with the addition of the following properties and a small difference in `isRefetching` and `isRefetchError`:

- `data.pages: TData[]`
  - Array containing all pages.
- `data.pageParams: unknown[]`
  - Array containing all page params.
- `isFetchingNextPage: boolean`
  - Will be `true` while fetching the next page with `fetchNextPage`.
- `isFetchingPreviousPage: boolean`
  - Will be `true` while fetching the previous page with `fetchPreviousPage`.
- `fetchNextPage: (options?: FetchNextPageOptions) => Promise<UseInfiniteQueryResult>`
  - This function allows you to fetch the next "page" of results.
  - `options.cancelRefetch: boolean` if set to `true`, calling `fetchNextPage` repeatedly will invoke `queryFn` every time, whether the previous
    invocation has resolved or not. Also, the result from previous invocations will be ignored. If set to `false`, calling `fetchNextPage`
    repeatedly won't have any effect until the first invocation has resolved. Default is `true`.
- `fetchPreviousPage: (options?: FetchPreviousPageOptions) => Promise<UseInfiniteQueryResult>`
  - This function allows you to fetch the previous "page" of results.
  - `options.cancelRefetch: boolean` same as for `fetchNextPage`.
- `hasNextPage: boolean`
  - Will be `true` if there is a next page to be fetched (known via the `getNextPageParam` option).
- `hasPreviousPage: boolean`
  - Will be `true` if there is a previous page to be fetched (known via the `getPreviousPageParam` option).
- `isFetchNextPageError: boolean`
  - Will be `true` if the query failed while fetching the next page.
- `isFetchPreviousPageError: boolean`
  - Will be `true` if the query failed while fetching the previous page.
- `isRefetching: boolean`
  - Will be `true` whenever a background refetch is in-flight, which _does not_ include initial `pending` or fetching of next or previous page
  - Is the same as `isFetching && !isPending && !isFetchingNextPage && !isFetchingPreviousPage`
- `isRefetchError: boolean`
  - Will be `true` if the query failed while refetching a page.
- `promise: Promise<TData>`
  - A stable promise that resolves to the query result.
  - This can be used with `React.use()` to fetch data
  - Requires the `experimental_prefetchInRender` feature flag to be enabled on the `QueryClient`.

Keep in mind that imperative fetch calls, such as `fetchNextPage`, may interfere with the default refetch behaviour, resulting in outdated data. Make sure to call these functions only in response to user actions, or add conditions like `hasNextPage && !isFetching`.
# useMutation

```tsx
const {
  data,
  error,
  isError,
  isIdle,
  isPending,
  isPaused,
  isSuccess,
  failureCount,
  failureReason,
  mutate,
  mutateAsync,
  reset,
  status,
  submittedAt,
  variables,
} = useMutation(
  {
    mutationFn,
    gcTime,
    meta,
    mutationKey,
    networkMode,
    onError,
    onMutate,
    onSettled,
    onSuccess,
    retry,
    retryDelay,
    scope,
    throwOnError,
  },
  queryClient,
)

mutate(variables, {
  onError,
  onSettled,
  onSuccess,
})
```

**Parameter1 (Options)**

- `mutationFn: (variables: TVariables, context: MutationFunctionContext) => Promise<TData>`
  - **Required, but only if no default mutation function has been defined**
  - A function that performs an asynchronous task and returns a promise.
  - `variables` is an object that `mutate` will pass to your `mutationFn`
  - `context` is an object that `mutate` will pass to your `mutationFn`. Contains reference to `QueryClient`, `mutationKey` and optional `meta` object.
- `gcTime: number | Infinity`
  - The time in milliseconds that unused/inactive cache data remains in memory. When a mutation's cache becomes unused or inactive, that cache data will be garbage collected after this duration. When different cache times are specified, the longest one will be used.
  - If set to `Infinity`, will disable garbage collection
  - Note: the maximum allowed time is about [24 days](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value), although it is possible to work around this limit using [timeoutManager.setTimeoutProvider](../../../reference/timeoutManager.md#timeoutmanagersettimeoutprovider).
- `mutationKey: unknown[]`
  - Optional
  - A mutation key can be set to inherit defaults set with `queryClient.setMutationDefaults`.
- `networkMode: 'online' | 'always' | 'offlineFirst'`
  - Optional
  - defaults to `'online'`
  - see [Network Mode](../guides/network-mode.md) for more information.
- `onMutate: (variables: TVariables, context: MutationFunctionContext) => Promise<TOnMutateResult | void> | TOnMutateResult | void`
  - Optional
  - This function will fire before the mutation function is fired and is passed the same variables the mutation function would receive
  - Useful to perform optimistic updates to a resource in hopes that the mutation succeeds
  - The value returned from this function will be passed to both the `onError` and `onSettled` functions in the event of a mutation failure and can be useful for rolling back optimistic updates.
- `onSuccess: (data: TData, variables: TVariables, onMutateResult: TOnMutateResult | undefined, context: MutationFunctionContext) => Promise<unknown> | unknown`
  - Optional
  - This function will fire when the mutation is successful and will be passed the mutation's result.
  - If a promise is returned, it will be awaited and resolved before proceeding
- `onError: (err: TError, variables: TVariables, onMutateResult: TOnMutateResult | undefined, context: MutationFunctionContext) => Promise<unknown> | unknown`
  - Optional
  - This function will fire if the mutation encounters an error and will be passed the error.
  - If a promise is returned, it will be awaited and resolved before proceeding
- `onSettled: (data: TData, error: TError, variables: TVariables, onMutateResult: TOnMutateResult | undefined, context: MutationFunctionContext) => Promise<unknown> | unknown`
  - Optional
  - This function will fire when the mutation is either successfully fetched or encounters an error and be passed either the data or error
  - If a promise is returned, it will be awaited and resolved before proceeding
- `retry: boolean | number | (failureCount: number, error: TError) => boolean`
  - Defaults to `0`.
  - If `false`, failed mutations will not retry.
  - If `true`, failed mutations will retry infinitely.
  - If set to an `number`, e.g. `3`, failed mutations will retry until the failed mutations count meets that number.
- `retryDelay: number | (retryAttempt: number, error: TError) => number`
  - This function receives a `retryAttempt` integer and the actual Error and returns the delay to apply before the next attempt in milliseconds.
  - A function like `attempt => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000)` applies exponential backoff.
  - A function like `attempt => attempt * 1000` applies linear backoff.
- `scope: { id: string }`
  - Optional
  - Defaults to a unique id (so that all mutations run in parallel)
  - Mutations with the same scope id will run in serial
- `throwOnError: undefined | boolean | (error: TError) => boolean`
  - Set this to `true` if you want mutation errors to be thrown in the render phase and propagate to the nearest error boundary
  - Set this to `false` to disable the behavior of throwing errors to the error boundary.
  - If set to a function, it will be passed the error and should return a boolean indicating whether to show the error in an error boundary (`true`) or return the error as state (`false`)
- `meta: Record<string, unknown>`
  - Optional
  - If set, stores additional information on the mutation cache entry that can be used as needed. It will be accessible wherever the `mutation` is available (eg. `onError`, `onSuccess` functions of the `MutationCache`).

**Parameter2 (QueryClient)**

- `queryClient?: QueryClient`
  - Use this to use a custom QueryClient. Otherwise, the one from the nearest context will be used.

**Returns**

- `mutate: (variables: TVariables, { onSuccess, onSettled, onError }) => void`
  - The mutation function you can call with variables to trigger the mutation and optionally hooks on additional callback options.
  - `variables: TVariables`
    - Optional
    - The variables object to pass to the `mutationFn`.
  - `onSuccess: (data: TData, variables: TVariables, onMutateResult: TOnMutateResult | undefined, context: MutationFunctionContext) => void`
    - Optional
    - This function will fire when the mutation is successful and will be passed the mutation's result.
    - Void function, the returned value will be ignored
  - `onError: (err: TError, variables: TVariables, onMutateResult: TOnMutateResult | undefined, context: MutationFunctionContext) => void`
    - Optional
    - This function will fire if the mutation encounters an error and will be passed the error.
    - Void function, the returned value will be ignored
  - `onSettled: (data: TData | undefined, error: TError | null, variables: TVariables, onMutateResult: TOnMutateResult | undefined, context: MutationFunctionContext) => void`
    - Optional
    - This function will fire when the mutation is either successfully fetched or encounters an error and be passed either the data or error
    - Void function, the returned value will be ignored
  - If you make multiple requests, `onSuccess` will fire only after the latest call you've made.
- `mutateAsync: (variables: TVariables, { onSuccess, onSettled, onError }) => Promise<TData>`
  - Similar to `mutate` but returns a promise which can be awaited.
- `status: MutationStatus`
  - Will be:
    - `idle` initial status prior to the mutation function executing.
    - `pending` if the mutation is currently executing.
    - `error` if the last mutation attempt resulted in an error.
    - `success` if the last mutation attempt was successful.
- `isIdle`, `isPending`, `isSuccess`, `isError`: boolean variables derived from `status`
- `isPaused: boolean`
  - will be `true` if the mutation has been `paused`
  - see [Network Mode](../guides/network-mode.md) for more information.
- `data: undefined | unknown`
  - Defaults to `undefined`
  - The last successfully resolved data for the mutation.
- `error: null | TError`
  - The error object for the query, if an error was encountered.
- `reset: () => void`
  - A function to clean the mutation internal state (i.e., it resets the mutation to its initial state).
- `failureCount: number`
  - The failure count for the mutation.
  - Incremented every time the mutation fails.
  - Reset to `0` when the mutation succeeds.
- `failureReason: null | TError`
  - The failure reason for the mutation retry.
  - Reset to `null` when the mutation succeeds.
- `submittedAt: number`
  - The timestamp for when the mutation was submitted.
  - Defaults to `0`.
- `variables: undefined | TVariables`
  - The `variables` object passed to the `mutationFn`.
  - Defaults to `undefined`.
# useQueryClient

The `useQueryClient` hook returns the current `QueryClient` instance.

```tsx
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient(queryClient?: QueryClient)
```

**Options**

- `queryClient?: QueryClient`
  - Use this to use a custom QueryClient. Otherwise, the one from the nearest context will be used.
# queryOptions

```tsx
queryOptions({
  queryKey,
  ...options,
})
```

**Options**

You can generally pass everything to `queryOptions` that you can also pass to [`useQuery`](./useQuery.md). Some options will have no effect when then forwarded to a function like `queryClient.prefetchQuery`, but TypeScript will still be fine with those excess properties.

- `queryKey: QueryKey`
  - **Required**
  - The query key to generate options for.
- `experimental_prefetchInRender?: boolean`
  - Optional
  - Defaults to `false`
  - When set to `true`, queries will be prefetched during render, which can be useful for certain optimization scenarios
  - Needs to be turned on for the experimental `useQuery().promise` functionality

[//]: # 'Materials'

## Further reading

To learn more about `QueryOptions`, have a look at [this article by TkDodo The Query Options API](https://tkdodo.eu/blog/the-query-options-api).

[//]: # 'Materials'
# infiniteQueryOptions

```tsx
infiniteQueryOptions({
  queryKey,
  ...options,
})
```

**Options**

You can generally pass everything to `infiniteQueryOptions` that you can also pass to [`useInfiniteQuery`](./useInfiniteQuery.md). Some options will have no effect when then forwarded to a function like `queryClient.prefetchInfiniteQuery`, but TypeScript will still be fine with those excess properties.

- `queryKey: QueryKey`
  - **Required**
  - The query key to generate options for.

See [useInfiniteQuery](./useInfiniteQuery.md) for more information.
# mutationOptions

```tsx
mutationOptions({
  mutationFn,
  ...options,
})
```

**Options**

You can generally pass everything to `mutationOptions` that you can also pass to [`useMutation`](./useMutation.md).
# hydration

## `dehydrate`

`dehydrate` creates a frozen representation of a `cache` that can later be hydrated with `HydrationBoundary` or `hydrate`. This is useful for passing prefetched queries from server to client or persisting queries to localStorage or other persistent locations. It only includes currently successful queries by default.

```tsx
import { dehydrate } from '@tanstack/react-query'

const dehydratedState = dehydrate(queryClient, {
  shouldDehydrateQuery,
  shouldDehydrateMutation,
})
```

**Options**

- `client: QueryClient`
  - **Required**
  - The `queryClient` that should be dehydrated
- `options: DehydrateOptions`
  - Optional
  - `shouldDehydrateMutation: (mutation: Mutation) => boolean`
    - Optional
    - Whether to dehydrate mutations.
    - The function is called for each mutation in the cache
      - Return `true` to include this mutation in dehydration, or `false` otherwise
    - Defaults to only including paused mutations
    - If you would like to extend the function while retaining the default behavior, import and execute `defaultShouldDehydrateMutation` as part of the return statement
  - `shouldDehydrateQuery: (query: Query) => boolean`
    - Optional
    - Whether to dehydrate queries.
    - The function is called for each query in the cache
      - Return `true` to include this query in dehydration, or `false` otherwise
    - Defaults to only including successful queries
    - If you would like to extend the function while retaining the default behavior, import and execute `defaultShouldDehydrateQuery` as part of the return statement
  - `serializeData?: (data: any) => any` A function to transform (serialize) data during dehydration.
  - `shouldRedactErrors?: (error: unknown) => boolean`
    - Optional
    - Whether to redact errors from the server during dehydration.
    - The function is called for each error in the cache
      - Return `true` to redact this error, or `false` otherwise
    - Defaults to redacting all errors

**Returns**

- `dehydratedState: DehydratedState`
  - This includes everything that is needed to hydrate the `queryClient` at a later point
  - You **should not** rely on the exact format of this response, it is not part of the public API and can change at any time
  - This result is not in serialized form, you need to do that yourself if desired

### Limitations

Some storage systems (such as browser [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)) require values to be JSON serializable. If you need to dehydrate values that are not automatically serializable to JSON (like `Error` or `undefined`), you have to serialize them for yourself. Since only successful queries are included per default, to also include `Errors`, you have to provide `shouldDehydrateQuery`, e.g.:

```tsx
// server
const state = dehydrate(client, { shouldDehydrateQuery: () => true }) // to also include Errors
const serializedState = mySerialize(state) // transform Error instances to objects

// client
const state = myDeserialize(serializedState) // transform objects back to Error instances
hydrate(client, state)
```

## `hydrate`

`hydrate` adds a previously dehydrated state into a `cache`.

```tsx
import { hydrate } from '@tanstack/react-query'

hydrate(queryClient, dehydratedState, options)
```

**Options**

- `client: QueryClient`
  - **Required**
  - The `queryClient` to hydrate the state into
- `dehydratedState: DehydratedState`
  - **Required**
  - The state to hydrate into the client
- `options: HydrateOptions`
  - Optional
  - `defaultOptions: DefaultOptions`
    - Optional
    - `mutations: MutationOptions` The default mutation options to use for the hydrated mutations.
    - `queries: QueryOptions` The default query options to use for the hydrated queries.
    - `deserializeData?: (data: any) => any` A function to transform (deserialize) data before it is put into the cache.
  - `queryClient?: QueryClient`
    - Use this to use a custom QueryClient. Otherwise, the one from the nearest context will be used.

### Limitations

If the queries you're trying to hydrate already exist in the queryCache, `hydrate` will only overwrite them if the data is newer than the data present in the cache. Otherwise, it will **not** get applied.

[//]: # 'HydrationBoundary'

## `HydrationBoundary`

`HydrationBoundary` adds a previously dehydrated state into the `queryClient` that would be returned by `useQueryClient()`. If the client already contains data, the new queries will be intelligently merged based on update timestamp.

```tsx
import { HydrationBoundary } from '@tanstack/react-query'

function App() {
  return <HydrationBoundary state={dehydratedState}>...</HydrationBoundary>
}
```

> Note: Only `queries` can be dehydrated with an `HydrationBoundary`.

**Options**

- `state: DehydratedState`
  - The state to hydrate
- `options: HydrateOptions`
  - Optional
  - `defaultOptions: QueryOptions`
    - The default query options to use for the hydrated queries.
  - `queryClient?: QueryClient`
    - Use this to use a custom QueryClient. Otherwise, the one from the nearest context will be used.

[//]: # 'HydrationBoundary'
# QueryClientProvider

Use the `QueryClientProvider` component to connect and provide a `QueryClient` to your application:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

**Options**

- `client: QueryClient`
  - **Required**
  - the QueryClient instance to provide
# ESLint Plugin Query

TanStack Query comes with its own ESLint plugin. This plugin is used to enforce best practices and to help you avoid common mistakes.

## Installation

The plugin is a separate package that you need to install:

```bash
npm i -D @tanstack/eslint-plugin-query
```

or

```bash
pnpm add -D @tanstack/eslint-plugin-query
```

or

```bash
yarn add -D @tanstack/eslint-plugin-query
```

or

```bash
bun add -D @tanstack/eslint-plugin-query
```

## Flat Config (`eslint.config.js`)

### Recommended setup

To enable all of the recommended rules for our plugin, add the following config:

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  ...pluginQuery.configs['flat/recommended'],
  // Any other config...
]
```

### Custom setup

Alternatively, you can load the plugin and configure only the rules you want to use:

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  {
    plugins: {
      '@tanstack/query': pluginQuery,
    },
    rules: {
      '@tanstack/query/exhaustive-deps': 'error',
    },
  },
  // Any other config...
]
```

## Legacy Config (`.eslintrc`)

### Recommended setup

To enable all of the recommended rules for our plugin, add `plugin:@tanstack/query/recommended` in extends:

```json
{
  "extends": ["plugin:@tanstack/query/recommended"]
}
```

### Custom setup

Alternatively, add `@tanstack/query` to the plugins section, and configure the rules you want to use:

```json
{
  "plugins": ["@tanstack/query"],
  "rules": {
    "@tanstack/query/exhaustive-deps": "error"
  }
}
```

## Rules

- [@tanstack/query/exhaustive-deps](./exhaustive-deps.md)
- [@tanstack/query/no-rest-destructuring](./no-rest-destructuring.md)
- [@tanstack/query/stable-query-client](./stable-query-client.md)
- [@tanstack/query/no-unstable-deps](./no-unstable-deps.md)
- [@tanstack/query/infinite-query-property-order](./infinite-query-property-order.md)
- [@tanstack/query/no-void-query-fn](./no-void-query-fn.md)
- [@tanstack/query/mutation-property-order](./mutation-property-order.md)
# Stable Query Client

The QueryClient contains the QueryCache, so you'd only want to create one instance of the QueryClient for the lifecycle of your application - _not_ a new instance on every render.

> Exception: It's allowed to create a new QueryClient inside an async Server Component, because the async function is only called once on the server.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/stable-query-client": "error" */

function App() {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

Examples of **correct** code for this rule:

```tsx
function App() {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

```tsx
const queryClient = new QueryClient()
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}
```

```tsx
async function App() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery(options)
}
```

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
# Disallow putting the result of query hooks directly in a React hook dependency array

The object returned from the following query hooks is **not** referentially stable:

- `useQuery`
- `useSuspenseQuery`
- `useQueries`
- `useSuspenseQueries`
- `useInfiniteQuery`
- `useSuspenseInfiniteQuery`
- `useMutation`

The object returned from those hooks should **not** be put directly into the dependency array of a React hook (e.g. `useEffect`, `useMemo`, `useCallback`).
Instead, destructure the return value of the query hook and pass the destructured values into the dependency array of the React hook.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/no-unstable-deps": "warn" */
import { useCallback } from 'React'
import { useMutation } from '@tanstack/react-query'

function Component() {
  const mutation = useMutation({ mutationFn: (value: string) => value })
  const callback = useCallback(() => {
    mutation.mutate('hello')
  }, [mutation])
  return null
}
```

Examples of **correct** code for this rule:

```tsx
/* eslint "@tanstack/query/no-unstable-deps": "warn" */
import { useCallback } from 'React'
import { useMutation } from '@tanstack/react-query'

function Component() {
  const { mutate } = useMutation({ mutationFn: (value: string) => value })
  const callback = useCallback(() => {
    mutate('hello')
  }, [mutate])
  return null
}
```

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
# Disallow object rest destructuring on query results

Use object rest destructuring on query results automatically subscribes to every field of the query result, which may cause unnecessary re-renders.
This makes sure that you only subscribe to the fields that you actually need.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/no-rest-destructuring": "warn" */

const useTodos = () => {
  const { data: todos, ...rest } = useQuery({
    queryKey: ['todos'],
    queryFn: () => api.getTodos(),
  })
  return { todos, ...rest }
}
```

Examples of **correct** code for this rule:

```tsx
const todosQuery = useQuery({
  queryKey: ['todos'],
  queryFn: () => api.getTodos(),
})

// normal object destructuring is fine
const { data: todos } = todosQuery
```

## When Not To Use It

If you set the `notifyOnChangeProps` options manually, you can disable this rule.
Since you are not using tracked queries, you are responsible for specifying which props should trigger a re-render.

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
# Exhaustive dependencies for query keys

Query keys should be seen like a dependency array to your query function: Every variable that is used inside the queryFn should be added to the query key.
This makes sure that queries are cached independently and that queries are refetched automatically when the variables changes.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/exhaustive-deps": "error" */

useQuery({
  queryKey: ['todo'],
  queryFn: () => api.getTodo(todoId),
})

const todoQueries = {
  detail: (id) => ({ queryKey: ['todo'], queryFn: () => api.getTodo(id) }),
}
```

Examples of **correct** code for this rule:

```tsx
const Component = ({ todoId }) => {
  const todos = useTodos()
  useQuery({
    queryKey: ['todo', todos, todoId],
    queryFn: () => todos.getTodo(todoId),
  })
}
```

```tsx
const todos = createTodos()
const todoQueries = {
  detail: (id) => ({
    queryKey: ['todo', id],
    queryFn: () => todos.getTodo(id),
  }),
}
```

```tsx
// with { allowlist: { variables: ["todos"] }}
const Component = ({ todoId }) => {
  const todos = useTodos()
  useQuery({
    queryKey: ['todo', todoId],
    queryFn: () => todos.getTodo(todoId),
  })
}
```

```tsx
// with { allowlist: { types: ["TodosClient"] }}
class TodosClient { ... }
const Component = ({ todoId }) => {
  const todos: TodosClient = new TodosClient()
  useQuery({
    queryKey: ['todo', todoId],
    queryFn: () => todos.getTodo(todoId),
  })
}
```

### Options

- `allowlist.variables`: An array of variable names that should be ignored when checking dependencies
- `allowlist.types`: An array of TypeScript type names that should be ignored when checking dependencies

```json
{
  "@tanstack/query/exhaustive-deps": [
    "error",
    {
      "allowlist": {
        "variables": ["api", "config"],
        "types": ["ApiClient", "Config"]
      }
    }
  ]
}
```

## When Not To Use It

If you don't care about the rules of the query keys, then you will not need this rule.

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
# Ensure correct order of inference sensitive properties for infinite queries

For the following functions, the property order of the passed in object matters due to type inference:

- `useInfiniteQuery`
- `useSuspenseInfiniteQuery`
- `infiniteQueryOptions`

The correct property order is as follows:

- `queryFn`
- `getPreviousPageParam`
- `getNextPageParam`

All other properties are insensitive to the order as they do not depend on type inference.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/infinite-query-property-order": "warn" */
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery({
  queryKey: ['projects'],
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  queryFn: async ({ pageParam }) => {
    const response = await fetch(`/api/projects?cursor=${pageParam}`)
    return await response.json()
  },
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  maxPages: 3,
})
```

Examples of **correct** code for this rule:

```tsx
/* eslint "@tanstack/query/infinite-query-property-order": "warn" */
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: async ({ pageParam }) => {
    const response = await fetch(`/api/projects?cursor=${pageParam}`)
    return await response.json()
  },
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  maxPages: 3,
})
```

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
# Disallow returning void from query functions

Query functions must return a value that will be cached by TanStack Query. Functions that don't return a value (void functions) can lead to unexpected behavior and might indicate a mistake in the implementation.

## Rule Details

Example of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/no-void-query-fn": "error" */

useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    await api.todos.fetch() // Function doesn't return the fetched data
  },
})
```

Example of **correct** code for this rule:

```tsx
/* eslint "@tanstack/query/no-void-query-fn": "error" */
useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    const todos = await api.todos.fetch()
    return todos
  },
})
```

## Attributes

- [x] ✅ Recommended
- [ ] 🔧 Fixable
# Ensure correct order of inference-sensitive properties in useMutation()

For the following functions, the property order of the passed in object matters due to type inference:

- `useMutation()`

The correct property order is as follows:

- `onMutate`
- `onError`
- `onSettled`

All other properties are insensitive to the order as they do not depend on type inference.

## Rule Details

Examples of **incorrect** code for this rule:

```tsx
/* eslint "@tanstack/query/mutation-property-order": "warn" */
import { useMutation } from '@tanstack/react-query'

const mutation = useMutation({
  mutationFn: () => Promise.resolve('success'),
  onSettled: () => {
    results.push('onSettled-promise')
    return Promise.resolve('also-ignored') // Promise<string> (should be ignored)
  },
  onMutate: async () => {
    results.push('onMutate-async')
    await sleep(1)
    return { backup: 'async-data' }
  },
  onError: async () => {
    results.push('onError-async-start')
    await sleep(1)
    results.push('onError-async-end')
  },
})
```

Examples of **correct** code for this rule:

```tsx
/* eslint "@tanstack/query/mutation-property-order": "warn" */
import { useMutation } from '@tanstack/react-query'

const mutation = useMutation({
  mutationFn: () => Promise.resolve('success'),
  onMutate: async () => {
    results.push('onMutate-async')
    await sleep(1)
    return { backup: 'async-data' }
  },
  onError: async () => {
    results.push('onError-async-start')
    await sleep(1)
    results.push('onError-async-end')
  },
  onSettled: () => {
    results.push('onSettled-promise')
    return Promise.resolve('also-ignored') // Promise<string> (should be ignored)
  },
})
```

## Attributes

- [x] ✅ Recommended
- [x] 🔧 Fixable
Next.js app with prefetching
→ Folder: nextjs-app-prefetching
Link: https://github.com/TanStack/query/tree/main/examples/react/nextjs-app-prefetching
(Demo prefetching data trước khi navigate trong Next.js App Router)
Next.js app with streaming
→ Folder: nextjs-suspense-streaming
Link: https://github.com/TanStack/query/tree/main/examples/react/nextjs-suspense-streaming
(Dùng Suspense + Streaming SSR trong Next.js App Router)
Pagination
→ Folder: pagination
Link: https://github.com/TanStack/query/tree/main/examples/react/pagination
Load-More & Infinite Scroll
→ Folder: load-more-infinite-scroll
Link: https://github.com/TanStack/query/tree/main/examples/react/load-more-infinite-scroll
Optimistic Updates (UI)
→ Folder: optimistic-updates-ui
Link: https://github.com/TanStack/query/tree/main/examples/react/optimistic-updates-ui
(Optimistic update ngay trên UI trước khi server confirm)
Optimistic Updates (Cache)
→ Folder: optimistic-updates-cache
Link: https://github.com/TanStack/query/tree/main/examples/react/optimistic-updates-cache
(Optimistic update trực tiếp vào cache + rollback nếu lỗi)

Toàn bộ list 27 examples React (latest main) – list hết ra cho mày luôn

algolia → Tích hợp Algolia search
Link: https://github.com/TanStack/query/tree/main/examples/react/algolia
auto-refetching → Auto refetching / polling / realtime
Link: https://github.com/TanStack/query/tree/main/examples/react/auto-refetching
basic → Basic query + mutation đơn giản nhất
Link: https://github.com/TanStack/query/tree/main/examples/react/basic
basic-graphql-request → Basic với GraphQL (graphql-request)
Link: https://github.com/TanStack/query/tree/main/examples/react/basic-graphql-request
chat → Chat realtime (streaming messages)
Link: https://github.com/TanStack/query/tree/main/examples/react/chat
default-query-function → Default query function pattern
Link: https://github.com/TanStack/query/tree/main/examples/react/default-query-function
devtools-panel → Embed Devtools panel
Link: https://github.com/TanStack/query/tree/main/examples/react/devtools-panel
eslint-legacy → ESLint legacy rules demo
Link: https://github.com/TanStack/query/tree/main/examples/react/eslint-legacy
eslint-plugin-demo → Demo ESLint plugin của TanStack
Link: https://github.com/TanStack/query/tree/main/examples/react/eslint-plugin-demo
infinite-query-with-max-pages → Infinite query giới hạn max pages
Link: https://github.com/TanStack/query/tree/main/examples/react/infinite-query-with-max-pages
load-more-infinite-scroll → (đã có ở #40)
nextjs → Next.js cơ bản (Pages Router)
Link: https://github.com/TanStack/query/tree/main/examples/react/nextjs
nextjs-app-prefetching → (đã có ở #37)
nextjs-suspense-streaming → (đã có ở #38)
offline → Offline queries & mutations (có network fallback)
Link: https://github.com/TanStack/query/tree/main/examples/react/offline
optimistic-updates-cache → (đã có ở #42)
optimistic-updates-ui → (đã có ở #41)
pagination → (đã có ở #39)
playground → Playground test mọi thứ
Link: https://github.com/TanStack/query/tree/main/examples/react/playground
prefetching → Prefetching cơ bản (không Next.js)
Link: https://github.com/TanStack/query/tree/main/examples/react/prefetching
react-native → React Native example
Link: https://github.com/TanStack/query/tree/main/examples/react/react-native
react-router → Tích hợp React Router v6
Link: https://github.com/TanStack/query/tree/main/examples/react/react-router
rick-morty → Demo thực tế với Rick & Morty API
Link: https://github.com/TanStack/query/tree/main/examples/react/rick-morty
shadow-dom → Query trong Shadow DOM
Link: https://github.com/TanStack/query/tree/main/examples/react/shadow-dom
simple → Siêu cơ bản (chỉ 1 query)
Link: https://github.com/TanStack/query/tree/main/examples/react/simple
star-wars → Demo Star Wars API
Link: https://github.com/TanStack/query/tree/main/examples/react/star-wars
suspense → Suspense + error boundary
Link: https://github.com/TanStack/query/tree/main/examples/react/suspense