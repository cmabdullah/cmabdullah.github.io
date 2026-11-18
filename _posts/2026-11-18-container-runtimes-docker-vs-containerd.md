---
title: "A Container Is Just a Process: Docker vs containerd, Demystified"
header:
  overlay_image: /assets/images/blog_article_04_data_center_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_04_data_center_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - containers
  - docker
  - containerd
  - runc
  - kubernetes
---

"Kubernetes is deprecating Docker" was the headline that made half the industry panic in late 2020. People
assumed their images would stop working, their `Dockerfile`s were obsolete, and they had to rewrite
everything. Almost none of that was true. The confusion came from one overloaded phrase — **container
runtime** — that actually names *three different layers* of software. Once you see the layers, the whole
"Docker vs containerd" argument mostly evaporates, and a surprising truth falls out: **a container is not a
thing your runtime owns. It's just a process the Linux kernel isolates.**

This post takes that claim apart, layer by layer.

## A container runtime is a stack, not one thing

When someone says "container runtime," they could mean any of three layers. Here's the whole stack, from the
thing that *wants* a container down to the kernel that actually makes one:

```
   ┌─────────────────────────────────────────────────────────┐
   │  Kubernetes kubelet  (wants to run a pod)                │
   └───────────────────────────┬─────────────────────────────┘
                               │  speaks CRI (gRPC)
                               ▼
   ┌─────────────────────────────────────────────────────────┐
   │  HIGH-LEVEL runtime   = containerd  /  CRI-O             │  ← "CRI runtime"
   │  pulls images, manages lifecycle, networking hooks       │
   └───────────────────────────┬─────────────────────────────┘
                               │  calls an OCI runtime
                               ▼
   ┌─────────────────────────────────────────────────────────┐
   │  LOW-LEVEL runtime    = runc  (the OCI reference impl)   │  ← "OCI runtime"
   │  actually creates the container from a spec              │
   └───────────────────────────┬─────────────────────────────┘
                               │  Linux syscalls
                               ▼
   ┌─────────────────────────────────────────────────────────┐
   │  KERNEL: namespaces + cgroups + capabilities + seccomp   │
   └─────────────────────────────────────────────────────────┘
```

When people argue "Docker vs containerd," they are arguing about the **high-level** layer only. The low-level
layer (`runc`) and the kernel are the **same** underneath both. A container started by Docker and one started
by containerd are *identical to the kernel*. The rest of this article explains exactly why.

## What each layer actually does

### Low-level (OCI) runtime — `runc`

`runc` is the thing that *literally makes a container*. Give it a root filesystem plus an **OCI runtime spec**
(a `config.json`) and it asks the kernel to:

- create **namespaces** (PID, network, mount, UTS, IPC, user) → isolation
- set up **cgroups** → CPU/memory limits
- apply **capabilities, seccomp, AppArmor/SELinux** → security
- `execve()` your process as PID 1 inside that sandbox

That's it. `runc` knows nothing about images, registries, or networks. It runs one container and exits.
Alternatives exist — `crun` (faster, written in C), `gVisor` (sandboxed), `kata` (microVMs) — but they all
implement the same OCI contract.

### High-level runtime — `containerd` / `CRI-O`

This is the "container manager." It handles everything `runc` doesn't:

- **pull images** from registries, verify them, unpack layers
- manage the **image store** and overlayfs snapshots
- track **container lifecycle** (create/start/stop/delete), restarts, metrics
- wire up **networking** (via CNI) and storage
- build the final OCI `config.json` and hand it to `runc`

### Docker Engine

Docker is a high-level runtime **plus a lot of developer UX on top**: the `docker` CLI, the REST API, image
**building** (BuildKit), Compose, volume/network management, Docker Hub integration.

Here's the fact that dissolves the whole debate: **Docker does not implement the low-level container bits
itself — Docker uses containerd internally**, which uses `runc`.

```
docker run  →  dockerd  →  containerd  →  runc  →  kernel
```

containerd was literally carved *out of* Docker in 2016 and donated to the CNCF. So **containerd is a subset
of Docker** — the engine without the developer tooling. "Docker vs containerd" is really "containerd plus
extra layers" vs "containerd alone."

## The CRI: why Kubernetes cares

Kubernetes doesn't want to hard-code support for every runtime, so the kubelet speaks exactly one standard
gRPC API: the **Container Runtime Interface (CRI)**. Any runtime that implements CRI can plug in.

- **containerd** implements CRI natively (built-in CRI plugin). ✅
- **CRI-O** was built from scratch *to be* a CRI runtime — nothing else, minimal. ✅
- **Docker Engine does NOT implement CRI.** ❌ Docker predates CRI and speaks its own API.

That last bullet is the entire source of the "Docker deprecation" drama.

## The dockershim story (the actual thing that got deprecated)

Because Docker can't speak CRI, early Kubernetes shipped a built-in adapter called **dockershim** to
translate CRI → the Docker API:

```
kubelet → CRI → [dockershim] → dockerd → containerd → runc
                  ▲ translation layer, maintained inside k8s
```

Look at the absurdity: the kubelet talks to Docker, which then talks to containerd **anyway** — so there are
*two extra hops* (`dockershim` + `dockerd`) wrapping the containerd that was going to do the work regardless.

So Kubernetes:

- **1.20 (Dec 2020):** deprecated dockershim
- **1.24 (May 2022):** removed it

Docker-the-runtime didn't die — the **in-tree shim** did. To keep using Docker as a node runtime after 1.24
you run an **external** shim, `cri-dockerd`. The modern, direct path simply drops the two redundant boxes:

```
kubelet → CRI → containerd → runc          ← the default path today
kubelet → CRI → cri-dockerd → dockerd → containerd → runc   ← the legacy --docker path
```

**Same `runc`, same kernel, same containers — just fewer layers.** And crucially: "Docker is deprecated in
Kubernetes" never meant "stop building images with Docker." Building images (`docker build`, BuildKit) and
running them as the node runtime are two separate concerns. Build with whatever you like; the cluster runs
them via containerd.

## Both paths converge at runc

This is the whole argument in one picture. Start from the two different worlds — a developer typing
`docker run` on the left, and a Kubernetes node on the right — and follow them down. They **merge**, and from
the merge point onward every layer is literally the same code doing the same thing:

```
   docker run ...                         k3s / kubelet (containerd path)
        │                                        │
        ▼                                        │
     dockerd                                     │
        │                                        │
        ▼                                        ▼
   containerd  ◄──────── SAME COMPONENT ──────► containerd
        │                                        │
        ▼                                        ▼
  containerd-shim                          containerd-shim
        │                                        │
        ▼                                        ▼
      runc  ◄─────────── SAME BINARY ──────────► runc
        │                                        │
        ▼                                        ▼
   clone()/unshare() + setns() + cgroups + pivot_root + execve()   ← SAME SYSCALLS
        │                                        │
        ▼                                        ▼
   Linux kernel  ◄──────── SAME KERNEL ────────► Linux kernel
```

The left path just has two extra boxes stacked on top (`dockerd`, and in Kubernetes the `cri-dockerd` shim
above it). Everything from `containerd` down is **one shared implementation**: the same containerd, the same
`runc` binary, the same syscalls, the same kernel. That shared lower half is why the container is identical no
matter which world you started in — the differences only ever live in the boxes *above* the merge.

## The contract that makes containers identical: the OCI spec

Here is the mechanism that *guarantees* Docker and containerd produce the same container. At the bottom,
neither tool describes a container in its own private way. Both emit a standardized **OCI runtime spec** —
a `config.json` — and hand it to `runc`:

```json
{
  "ociVersion": "1.1.0",
  "process": {
    "args": [
      "nginx",
      "-g",
      "daemon off;"
    ],
    "env": [
      "PATH=/usr/bin"
    ],
    "capabilities": {
      "bounding": [
        "CAP_NET_BIND_SERVICE"
      ]
    }
  },
  "root": {
    "path": "rootfs"
  },
  "linux": {
    "namespaces": [
      {
        "type": "pid"
      },
      {
        "type": "network"
      },
      {
        "type": "mount"
      },
      {
        "type": "ipc"
      },
      {
        "type": "uts"
      }
    ],
    "resources": {
      "memory": {
        "limit": 536870912
      },
      "cpu": {
        "quota": 50000,
        "period": 100000
      }
    },
    "maskedPaths": [
      "/proc/kcore"
    ]
  }
}
```

This is the contract defined by the **Open Container Initiative**. Because both high-level runtimes produce
the same kind of `config.json` and feed it to the same `runc`, the result is identical. The OCI spec *is* the
"same underneath" — it's the literal interface. Hand `runc` an identical `config.json` + rootfs and it cannot
tell, and does not care, who generated it.

## What `runc` does — and why a container is just a process

There is no "container" object in Linux. A container is an *emergent effect* of a precise sequence of kernel
syscalls applied to an ordinary process:

| Step                  | Syscall(s)                                                                                                                  | The "container" effect                                               |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| New isolation domains | `clone()` / `unshare()` with `CLONE_NEWPID`, `CLONE_NEWNET`, `CLONE_NEWNS`, `CLONE_NEWUTS`, `CLONE_NEWIPC`, `CLONE_NEWUSER` | Its own PID tree, network stack, mount table, hostname, IPC, UID map |
| Resource limits       | write to **cgroup** files (`cgroup.procs`, `memory.max`, `cpu.max`)                                                         | CPU / memory capped                                                  |
| Root filesystem       | `mount()` + `pivot_root()`                                                                                                  | Process sees the image's rootfs as `/`                               |
| Drop privileges       | `capset()`, `prctl(PR_SET_NO_NEW_PRIVS)`, `seccomp(...)`                                                                    | Fewer capabilities, syscall filter                                   |
| Become the app        | `execve("nginx", ...)`                                                                                                      | PID 1 inside the namespaces is now your program                      |

After `execve`, **`runc` exits** — its job is done. What remains is an ordinary Linux process that merely
*happens* to live in private namespaces with cgroup limits. From the kernel's point of view there is no
"Docker container" versus "containerd container" — there's just a process with these attributes. That is what
"identical to the kernel" means, literally.

## Prove it yourself

```bash
# Same runc binary used by BOTH Docker and containerd:
docker info --format '{{.DefaultRuntime}}'     # -> runc

# A running container is just a namespaced process on the host:
docker run -d --name web nginx
PID=$(docker inspect -f '{{.State.Pid}}' web)

sudo ls -l /proc/$PID/ns/     # pid/net/mnt/... namespace handles — plain kernel objects
cat /proc/$PID/cgroup         # its cgroup — a plain kernel object
ps -p $PID                    # shows up as a normal host process
```

Nothing there says "Docker." Had containerd started that nginx (say, via k3s), the exact same artifacts would
exist. The host kernel holds **one** namespace/cgroup implementation; both runtimes drive it the same way.

## So what *actually* differs?

Everything that lives **above** the runc/kernel line — the ergonomic and operational stuff:

| Lives above the line (differs)                           | Lives at/below the line (identical)         |
|----------------------------------------------------------|---------------------------------------------|
| `docker` CLI & REST API vs `crictl` / `ctr` / CRI gRPC   | the OCI `config.json` contract              |
| Image **building** (BuildKit) — Docker only              | `runc` executing the spec                   |
| Compose, Docker networks/volumes UX                      | namespaces, cgroups, capabilities, seccomp  |
| Where the **image store** lives + registry/mirror config | the resulting process as the kernel sees it |
| Extra daemons (`dockerd` + `cri-dockerd` shim)           | the kernel itself                           |

Two practical consequences worth internalizing:

1. **Image visibility.** With Docker-as-runtime, your `docker build` output and the cluster share one image
   store — build locally, run immediately. With containerd, the cluster has its *own* private store;
   locally-built images must be pushed to a registry (or imported) before the cluster can see them.
2. **Registry config moves.** Docker reads mirrors from `daemon.json`; containerd reads them from its own
   config (e.g. k3s's `/etc/rancher/k3s/registries.yaml`). Switch runtimes and you must move that config, or
   pulls silently change behavior.

## Where this bites in real life: k3s and RKE2

If you run lightweight Kubernetes locally, this is not academic. k3s ships an **embedded containerd** by
default:

```
kubelet → embedded containerd → runc
```

k3s also offers a `--docker` flag, which routes through `cri-dockerd` → your host Docker daemon instead —
the long, legacy path. Teams sometimes enable it so the cluster can see locally-built Docker images, or
because a registry mirror was configured in `daemon.json`. But containerd is the modern default across k3s,
RKE2, EKS, GKE, AKS, and kubeadm. Moving off `--docker` **doesn't change your containers at all** — same
`runc`, same kernel behavior. It only changes the operational layer: which socket, which CLI (`docker ps` vs
`crictl ps`), which image store, and where registry config lives.

## The one-sentence takeaway

> A container isn't a *thing* a runtime owns — it's a **process the kernel isolates** according to an **OCI
> spec**, and because Docker and containerd both hand that spec to the **same `runc`**, the container they
> produce is identical. They differ only in the tooling, APIs, and image/registry plumbing that sit *above*
> the moment of creation.

So the next time someone says "we're switching from Docker to containerd," you can reassure them: your
workloads will run bit-for-bit the same. You're not changing what a container *is* — you're just removing a
couple of boxes from the top of the stack.

[Open Container Initiative — Runtime Spec](https://github.com/opencontainers/runtime-spec) ·
[Kubernetes: Don't Panic — Dockershim Removal](https://kubernetes.io/blog/2022/02/17/dockershim-faq/)
