---
title: "Deputy AIBU"
date: 2026-08-09T11:42:25+01:00
draft: true
---

Stands for Deputy Am-I-Being-Underpaid? I was frustrated by the opacity of the
Australian Modern Award system. It's a great thing to properly compensate
employees for the work they do, but if they are unable to audit their own pay,
what's the point. Payroll audit engines are closely guarded corporate secrets,
so I made [an extensible open-source
one](https://github.com/hectorBrown/deputy-aibu).

<!--more-->

{{<toc>}}

## Structure

The structure was inspired by a [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) client-server model.

![Diagram of program architecture](./architecture.svg)

It's constructed of two separate applications. A CLI client, and a Dockerized
proxy server microservice. There are three code sources, a library for each
component, and a shared library that defines the interface that they communicate
on. The concept was to ensure a single source of truth for the interface, and
establish a robust versioning system such that it was impossible for the two
components to become out-of-sync.

The client is the heart of the project, it contains the fetching and parsing
logic for the timesheet data from Deputy, and, most importantly, the
[deterministic state machine](#the-state-machine), which is responsible for
actually running the simulation and calculating the total pay. It also handles
local caching and configuration management, as well as output formatting.

The server was born of necessity. [Deputy
OAuth2](https://developer.deputy.com/docs/using-oauth-20) doesn't accept
[PKCE](https://oauth.net/2/pkce/) (which I will delve into further
[here](#why-bother-with-standards)), which forces a flow that requires a client
secret, that I couldn't distribute with the source code. So I host a proxy at
[this address](deputy-aibu.hexn.live), but I wanted to make it self-hostable
too, as the data is (somewhat) sensitive and I prefer applications without a
single point of failure. This proxy also handles the [MAPD
API](https://www.fwc.gov.au/work-conditions/awards/modern-awards-pay-database/modern-awards-pay-database-api)
lookup. The reason for this is twofold:

1. This API also requires a client secret that I can't distribute, and would be
   a barrier to entry for the average user.
2. The API is an absolute cesspit of duplicated data, long fields with legal
   jargon, and out-of-context numbers - the approach I took to handle this is
   decidedly static and reliable (as opposed to dynamic and pseudo-intelligent),
   the ["classification manifest"](#mapd-and-the-classification-manifest), which
   needs to be resolved. This could be done on-device, but doing it on the proxy
   allows for potential caching some future update, and keeps the client code nice
   and clean.

### Cargo workspaces

I achieved the overall structure with the cargo workspace model, you define a top-level
`Cargo.toml` like so:

```toml
[workspace]
members = [
  "cli",
  "server", "shared",
]
resolver = "3"

[workspace.dependencies]
deputy-aibu-shared = { path = "shared" }
```

with a directory structure like this:

```zsh
$ tree -L 1 .
.
├── Cargo.lock
├── Cargo.toml
├── cli/
├── Dockerfile.server
├── LICENSE
├── README.md
├── server/
├── shared/
└── target/

5 directories, 5 files
```

and each subdirectory acts as its own little Rust project, but with versioning
done on the parent directory.

## The state machine

### Events

### Paystubs as a slice

### EventList workaround

### Pay period conversion

## Algebraic types

## MAPD and the classification manifest

### Manifest language

## Deputy, type-state model

### Why bother with standards?

## Serde structures

## Containerization of server

## Test logic

## Future (web interface, expanded manifests, more timesheet sources, backup options)
