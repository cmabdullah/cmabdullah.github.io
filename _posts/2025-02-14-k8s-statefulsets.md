---
title: "StatefulSets and Headless Services — Kubernetes Internals #23"
header:
  overlay_image: /assets/images/blog_article_18_chicago_skyline_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_18_chicago_skyline_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - statefulsets
  - storage
sidebar:
  nav: "kubernetes-series"
---

A Deployment treats its Pods as interchangeable cattle, random names, any order, all equal. A database
cluster cannot live like that: the primary must come up before the replicas, and `mysql-0` must still be
`mysql-0` after a restart. **StatefulSets** give Pods the stable identity and ordering that stateful workloads
need.

### Stable identity and ordering

A StatefulSet assigns each Pod an **ordinal index** starting at zero, producing predictable names:
`mysql-0`, `mysql-1`, `mysql-2`. Two guarantees follow:

- **Stable names:** if a Pod dies, its replacement comes back with the *same* name, no more random suffixes.
- **Ordered rollout:** Pods are created one at a time, in order. `mysql-0` must be Ready before `mysql-1`
  starts. Scaling down happens in reverse.

Like a Deployment, a StatefulSet still does replicas, rolling updates, and rollbacks, it just adds identity
and sequence.

### It needs a Headless Service

For stable network identity, a StatefulSet pairs with a **headless Service**, one with `clusterIP: None`. A
headless Service does no load balancing and has no virtual IP; instead it creates a **DNS record per Pod**.

```yaml
# headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-h
spec:
  clusterIP: None       # this is what makes it headless
  selector:
    app: mysql
  ports:
    - port: 3306
```

```yaml
# statefulset-definition.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql-h   # ties the StatefulSet to the headless Service
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql
```

Each Pod then gets a resolvable DNS name of the form `<pod>.<service>.<namespace>.svc.cluster.local`:

```text
mysql-0.mysql-h.default.svc.cluster.local
mysql-1.mysql-h.default.svc.cluster.local
mysql-2.mysql-h.default.svc.cluster.local
```

That is how a replica addresses the primary directly, by a name that never changes.

> kubectl get statefulset mysql -o wide

[StatefulSets — Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)

---
*Kubernetes Internals series — Part 23.*
*← Previous: [Services](/devops/k8s-services/) · Overview: [kubectl Field Guide](/devops/kubectl-command-field-guide/)*
