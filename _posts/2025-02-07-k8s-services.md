---
title: "Services: ClusterIP, NodePort, LoadBalancer — Kubernetes Internals #22"
header:
  overlay_image: /assets/images/blog_article_17_bridge_geometry_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_17_bridge_geometry_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - services
  - networking
sidebar:
  nav: "kubernetes-series"
---

Pods are ephemeral, they die, reschedule, and come back with a new IP. Anything pointing at that IP breaks.
A **Service** solves this: it gives a set of Pods one stable address and load-balances across them, no matter
how often the Pods underneath change.

### ClusterIP — internal (the default)

A ClusterIP exposes the Service on an internal address reachable **only inside the cluster**. It is how one
microservice talks to another.

```yaml
# service-definition.yaml
apiVersion: v1
kind: Service
metadata:
  name: back-end
spec:
  type: ClusterIP
  ports:
    - targetPort: 80    # the container's port
      port: 80          # the Service's port
```

### NodePort — reach it from outside

A NodePort builds on ClusterIP and also opens a **port on every node** (in the range **30000–32767**), so an
external client can hit any node IP on that port.

```yaml
spec:
  type: NodePort
  ports:
    - targetPort: 80    # pod port
      port: 80          # service port
      nodePort: 30008   # external listen port on each node
  selector:
    app: myapp
```

The three ports are worth pinning down: **`targetPort`** is where the container listens, **`port`** is the
Service's own port, and **`nodePort`** is what the outside world connects to.

### LoadBalancer — cloud front door

On a cloud provider, `type: LoadBalancer` provisions an external load balancer that routes to the Service.
It is the production way to expose a single service to the internet.

### Two things Kubernetes does for free

- **Built-in load balancing:** when several Pods match the selector, the Service spreads incoming requests
  across them at random.
- **Spans every node:** you never wire up nodes individually, a NodePort Service maps the same port on *all*
  nodes in the cluster, and traffic reaches the right Pod even if it lives on another node.

> kubectl get svc -o wide

[Services — Kubernetes docs](https://kubernetes.io/docs/concepts/services-networking/service/)

---
*Kubernetes Internals series — Part 22.*
*← Previous: [Jobs & CronJobs](/devops/k8s-jobs-and-cronjobs/) · Next: [StatefulSets & Headless Services](/devops/k8s-statefulsets/) →*
