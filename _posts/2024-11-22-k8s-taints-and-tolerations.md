---
title: "Taints and Tolerations (Kubernetes Internals #13)"
header:
  overlay_image: /assets/images/blog_article_16_city_river_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_16_city_river_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - scheduling
  - taints
sidebar:
  nav: "kubernetes-series"
---

You have one node with a GPU, and you want *only* the machine-learning Pods on it, everything else kept off.
That is exactly the job of **taints and tolerations**, plus a little **node affinity**. The three together are
how you steer scheduling, and the key insight is that no single one of them is enough.

### Taint the node (the repellent)

A taint makes a node reject Pods that do not explicitly tolerate it:

```bash
kubectl taint nodes node01 app=blue:NoSchedule
#                        └key┘└val┘ └── effect
```

The **effect** decides how hard the rejection is:

- **NoSchedule**, new Pods without the toleration are not scheduled here.
- **PreferNoSchedule**, the scheduler tries to avoid the node but may still use it under pressure.
- **NoExecute**, new Pods are kept off *and* Pods already running without the toleration are **evicted**.

### Tolerate it on the Pod (the pass)

A toleration lets a specific Pod through the taint. Note that **every value is quoted**:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: nginx-container
      image: nginx
  tolerations:
    - key: "app"
      operator: "Equal"    # match key AND value; use "Exists" to match the key alone
      value: "blue"
      effect: "NoSchedule"
```

### The subtlety everyone misses

A taint tells the **node** to reject unmatched Pods. A toleration only *allows* a Pod onto a tainted node, it
does **not force** the Pod there, and it does nothing to stop that Pod being scheduled somewhere else. So
taints alone keep other Pods **off** your GPU node, but they cannot keep your GPU Pod **on** it.

### Node affinity (the attractant)

To pull a Pod toward the node, add node affinity, which matches node labels with real expressions
(`In`, `NotIn`, `Exists`) that `nodeSelector` cannot:

```bash
kubectl label nodes node01 app=blue
```

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: app
                operator: In
                values: [blue]
```

`requiredDuringScheduling` enforces the rule when the Pod is placed; `IgnoredDuringExecution` means a later
change to the node's labels will not evict a Pod that is already running.

### Dedicating a node (both tools together)

To guarantee a Pod runs on a specific node **and** nothing else lands there:

1. **Taint** the node so it repels everything (`kubectl taint nodes node01 app=blue:NoSchedule`).
2. **Tolerate** that taint on your Pod so it is allowed in.
3. **Node-affinity** the Pod to that node so the scheduler actively places it there.

> kubectl describe node node01 | grep -i taint

[Taints and Tolerations, Kubernetes docs](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)

---
*Kubernetes Internals series, Part 13 of 18.*
*← Previous: [Service Accounts](/devops/k8s-service-accounts/) · Next: [Labels, Selectors and Rollouts](/devops/k8s-labels-selectors-rollouts/) →*
