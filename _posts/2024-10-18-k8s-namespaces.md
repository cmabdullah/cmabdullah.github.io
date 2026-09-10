---
title: "Namespaces — Kubernetes Internals #6"
header:
  overlay_image: /assets/images/blog_botanical_39_colorful_bougainvillea_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_botanical_39_colorful_bougainvillea_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - namespaces
sidebar:
  nav: "kubernetes-series"
---

Two teams each deploy a service called `db` to the same cluster, and without isolation they collide. A
**namespace** prevents that by partitioning one physical cluster into separate virtual clusters, think of
households sharing a building. Kubernetes ships with three: `default` (where objects land unless told
otherwise), `kube-system` (control-plane components), and `kube-public`.

### Placing an object in a namespace

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  namespace: dev
  labels:
    app: my-app
    type: front-end
spec:
  containers:
    - name: nginx-container
      image: nginx
```

### Talking across namespaces

Within one namespace, services reach each other by short name. Across namespaces, you need the fully qualified
DNS name, which Kubernetes creates automatically:

```text
db-service.dev.svc.cluster.local
    |       |    |       |
 service   ns  type   domain
```

So `mysql.connect("db-service")` works inside the namespace, but from another namespace you use
`mysql.connect("db-service.dev.svc.cluster.local")`.

### Capping a namespace with a quota

A `ResourceQuota` limits how much a namespace can consume in total:

```yaml
# compute-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: dev
spec:
  hard:
    pods: "10"
    requests.cpu: "4"
    requests.memory: 5Gi
    limits.cpu: "10"
    limits.memory: 10Gi
```

Switch your default namespace so you stop typing `--namespace`:

> kubectl config set-context $(kubectl config current-context) --namespace=dev

[Namespaces — Kubernetes docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

---
*Kubernetes Internals series — Part 6 of 16.*
*← Previous: [Viewing Resources and Output Formats](/devops/k8s-viewing-resources/) · Next: [Building Images — the Docker Side](/devops/k8s-building-images/) →*
