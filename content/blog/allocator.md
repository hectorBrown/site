---
title: "quick-allocator"
date: 2026-02-18T23:18:47+11:00
draft: false
---

Building a fixed size block allocator in C++ to better understand performance
profilers and memory management.

<!--more-->

{{< toc >}}

A fixed-size block allocator is the most primitive form of memory management.
The goal we are trying to achieve is the management of some large pool of
pre-allocated memory through the allocation of fixed-size blocks. Because it's
simple though, this is also a very fast way to do memory management, notably
faster than C's `malloc` and `free` operations, which are designed for a much
more general use case.

## Instantiating the allocator

![Diagram of the allocator after instantiation](/images/blog/allocator/instantiated.svg#center)

This is a sketch of what we want the allocator to look like immediately after
instantiation. And this is how we achieve it:

```c++
  QuickAllocator(size_t size, size_t block_size = 64) {
    // just setting some properties of the allocator
    total_size = size; // total size of the arena in bytes
    this->block_size = block_size; // size of a single block
    size_t block_count = size / block_size; // how many blocks are there

    // ask the OS for a big chunk of memory
    this->memory_base = malloc(size);

    // cast the pointer to the arena to a byte pointer so we can do
    // arithmetic on it
    std::byte *memory = (std::byte *)memory_base;

    // for every block, set its contents to the address of the next block
    for (size_t i = 0; i < block_count - 1; i++) {
      void *next = memory + (i + 1) * block_size;
      *(void **)(memory + i * block_size) = next;
    }

    // set the contents of the last block to the null pointer
    *(void **)(memory + (block_count - 1) * block_size) =
        nullptr; // last block points to null

    free_start = memory;
  }
```

After running this constructor, we have our arena as effectively a linked list
of blocks, where each block points to the next, and we keep a pointer to the
first. The lines

```c++
      *(void **)(memory + i * block_size) = next;

```

and

```c++
    *(void **)(memory + (block_count - 1) * block_size) =
        nullptr; // last block points to null

```

jump out as a bit strange, so let's break them down. They are effectively
versions of the same thing. We take `memory`, which is a `byte *` or byte
pointer, and we add `i * block_size` to it, i.e. `i * block_size` bytes to the
memory address. This gives us the address of the `i`th block. We then cast this
address to a `void **`, or a pointer to a pointer. We then deference that
pointer and assign it to the address of the next block (or `nullptr`) in the
second case. It also might be unclear why we do

```c++
    std::byte *memory = (std::byte *)memory_base;
```

but it is just so we can do arithmetic on `memory`. It isn't possible to do
arithmetic on a `void *` as the compiler doesn't know how many bytes to add when
we do `memory + 1`, by casting to a `byte *` we can add a specified number of
bytes to the pointer.

## Allocating memory

![Diagram of the allocator after one allocation](/images/blog/allocator/allocated.svg#center)

This is how the allocator looks after one allocation. We have moved the free
pointer to the next block (the one that was indicated by the data inside the
first block), and returned the address of the first block to the user.

```c++
  void *allocate() {
    if (free_start == nullptr) {
      return nullptr; // no more free blocks
    }
    // return the current free block
    void *output = free_start;
    free_start = *(void **)free_start; // point free to next free block
    return output;
  }

```

Here we first check if there actually are any blocks left to allocate (if there
are not, our `free_start` pointer will be `nullptr`). Then we set a `void *`
pointer, `output` to the current free block, and do the same cast-and-deference
trick as before to copy the contents of the block we are allocating to the
`free_start` pointer, effectively following the trail in the block's data to the
next block.

# Deallocating memory

Let's fast forward a bit to the state of the allocator after three allocations,
which is shown below.

![Diagram of the allocator after three allocations](/images/blog/allocator/deallocated_1.svg#center)

We've proceeded as before, and allocated three blocks in order, moving the free
pointer each time so that now it rests on the fourth block. Now, we want to
deallocate the second block, after which the allocator should look like this:

![Diagram of the allocator after deallocation](/images/blog/allocator/deallocated_2.svg#center)

By far the simplest of the three operations, we just point the block we are
deallocating to the current free block, and then set the free pointer to point
to this block.

```c++
  void deallocate(void *ptr) {
    // point free to this block, point this block to previous free
    *(void **)ptr = free_start;

    free_start = ptr;
  }
```

One final time we do the cast-and-dereference trick to copy `free_start` to the
contents of the block at `ptr`. Then we set `free_start` to `ptr`, moving the
free pointer back to the block we just deallocated.

## Is it actually faster?

I stress tested this implementation with
[perf](https://perfwiki.github.io/main/) on a 1MB arena, with 10000 full
allocations and deallocations against an identical program, with
`allocator.allocate` and `allocator.deallocate` replaced with `malloc` and
`free` respectively. Here are the results:

| Allocator       | Time elapsed (s) | Instructions (B) | CPU Cycles (B) |
| --------------- | ---------------- | ---------------- | -------------- |
| malloc/free     | 10.3             | 75.9             | 37.2           |
| quick-allocator | 8.18             | 57.9             | 29.7           |

Obviously, this is just a toy example, but a ~20% speed increase is pretty good,
and the fact that we are doing 25% fewer instructions is pretty interesting.
