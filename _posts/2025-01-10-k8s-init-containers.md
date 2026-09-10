---
title: "Init Containers — Kubernetes Internals #18"
header:
  overlay_image: /assets/images/blog_generated_13_train_journey_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_generated_13_train_journey_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - pods
  - init-containers
sidebar:
  nav: "kubernetes-series"
---

Your app needs a config file pulled from git, or a database migration run, *before* it starts, not alongside
it. A regular sidecar runs forever in parallel; this is one-shot setup work that must finish first. That is
exactly what an **init container** is for.

### Regular containers vs init containers

In a normal multi-container Pod, every container is expected to stay alive for the Pod's whole lifecycle, a
web server and its logging agent both run continuously. An **init container is different**: it runs to
completion, and only when it exits successfully does the next one (or the app container) start.

```yaml
# init-container.yaml
apiVersion: v1
kind: Pod
metadata:
  name: blue
  labels:
    app: blue
spec:
  initContainers:
    - name: init-setup
      image: busybox
      command: ['sh', '-c', 'echo waiting for setup; sleep 5']
  containers:
    - name: app
      image: busybox
```

### How they run

- Init containers run **in order**, one at a time, top to bottom.
- Each must **complete successfully** before the next starts.
- If an init container fails, Kubernetes **restarts the Pod** until it succeeds (subject to `restartPolicy`),
  so your app container never starts against a half-prepared environment.

That ordering guarantee is the point: use init containers to wait for a dependency, seed a volume, or run a
migration, so the main container can assume the world is ready.

> kubectl describe pod blue    # watch the Init: phases

[Init Containers — Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)

---
*Kubernetes Internals series — Part 18.*
*← Previous: [Multi-Container Pods](/devops/k8s-multi-container-pods/) · Next: [Health Probes](/devops/k8s-health-probes/) →*
