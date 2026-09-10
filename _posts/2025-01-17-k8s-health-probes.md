---
title: "Health Probes: Readiness and Liveness (Kubernetes Internals #21)"
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
  - kubernetes
  - probes
  - observability
sidebar:
  nav: "kubernetes-series"
---

A Pod can be **Running but not Ready**. A web server that takes a minute to warm up will drop the first
requests if the Service starts routing traffic the moment the container process exists. Probes close that gap:
they tell Kubernetes when a container is genuinely *ready* for traffic, and when it has become unhealthy and
should be *restarted*.

### The lifecycle behind it

A Pod moves through conditions in order: **PodScheduled → Initialized → ContainersReady → Ready**. The final
`Ready` condition is what a Service watches before sending traffic. Without a probe, Kubernetes marks a
container ready as soon as it starts, which is often too early.

### Readiness probe: gate traffic

A readiness probe exposes a test the kubelet polls; until it passes, the Pod is kept out of Service endpoints.

```yaml
readinessProbe:
  httpGet:
    path: /api/ready
    port: 8080
  initialDelaySeconds: 10   # wait before the first check
  periodSeconds: 5          # check every 5s
  failureThreshold: 8       # give up after 8 failures
```

There are three probe mechanisms, and they apply to both probe types:

```yaml
# HTTP — 2xx/3xx means healthy
httpGet: { path: /api/ready, port: 8080 }

# TCP — can the port be opened?
tcpSocket: { port: 3306 }

# Exec — does the command exit 0?
exec: { command: ["cat", "/app/is-ready"] }
```

### Liveness probe: restart the hung

A **liveness** probe uses the same shape but a different purpose: if it starts failing, the kubelet **restarts
the container**. It catches deadlocks, a process that is up but wedged.

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 8080
  periodSeconds: 10
```

The distinction is the whole point: **readiness controls traffic, liveness controls restarts.** A slow-warming
app needs readiness so it is not sent traffic early; a long-running service needs liveness so a hang gets
recycled automatically.

> kubectl get pod simple-app    # the READY column reflects the readiness probe

[Configure Probes, Kubernetes docs](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

---
*Kubernetes Internals series, Part 21.*
*← Previous: [Init Containers](/devops/k8s-init-containers/) · Next: [Deployment Strategies](/devops/k8s-deployment-strategies/) →*
