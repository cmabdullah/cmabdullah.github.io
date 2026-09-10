---
title: "Labels, Selectors and Rollouts — Kubernetes Internals #12"
header:
  overlay_image: /assets/images/blog_article_09_laptop_coffee_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_09_laptop_coffee_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - labels
  - scheduling
sidebar:
  nav: "kubernetes-series"
---

How does a Service know which Pods to send traffic to? It never names them, it **selects a label**. Labels are
arbitrary key/value tags on objects, selectors query them, and almost every higher-level object, from
ReplicaSets to Services to the scheduler, works this way.

### Select Pods by label

```bash
kubectl get pods --selector app=App1   # or: -l app=App1
```

Controllers own their Pods the same way, through `selector.matchLabels`, which is why a ReplicaSet can adopt
any Pod whose labels match.

### Steer Pods onto nodes

The simplest form is `nodeSelector`, an exact label match:

```bash
kubectl label nodes node-01 size=large
```

```yaml
spec:
  nodeSelector:
    size: large
```

`nodeSelector` cannot express "large **or** medium." **Node affinity** can:

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: size
                operator: In
                values: [large, medium]
```

The two phases in that long key matter: **DuringScheduling** applies when the Pod is first placed, while
**IgnoredDuringExecution** means a later change to node labels will not evict a running Pod. The
`required…RequiredDuringExecution` variant *would* evict it.

### Rollouts run on the same idea

Because a Deployment tracks its Pods by label, it can replace them a few at a time:

```bash
kubectl set image deployment/myapp nginx-container=nginx:1.9.1
kubectl rollout status deployment/myapp
kubectl rollout undo deployment/myapp
```

> kubectl get pods --show-labels

[Labels and Selectors — Kubernetes docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/)

---
*Kubernetes Internals series — Part 12 of 16.*
*← Previous: [Taints and Tolerations](/devops/k8s-taints-and-tolerations/) · Next: [Jobs, Scaling and Ingress](/devops/k8s-jobs-scaling-ingress/) →*
