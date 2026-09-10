---
title: "Pods: Create, Inspect, Delete — Kubernetes Internals #1"
header:
  overlay_image: /assets/images/blog_white_cherry_blossoms_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_white_cherry_blossoms_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - pods
  - kubectl
sidebar:
  nav: "kubernetes-series"
---

Kubernetes never runs a container directly. It wraps one or more containers in a **Pod**, the smallest
deployable unit in the cluster. In the common case a Pod holds a single container, but a Pod can hold several
containers that share the same network namespace and can reach each other over `localhost`.

### Anatomy of a Pod

Every object definition has the same four top-level keys: `apiVersion`, `kind`, `metadata`, and `spec`.
`metadata.labels` are arbitrary key/value pairs you later use to select the Pod.

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
    type: front-end
spec:
  containers:
    - name: nginx-container
      image: nginx
```

The `kind`/`apiVersion` pairing is worth memorizing: `Pod` and `Service` are `v1`, while `Deployment` and
`ReplicaSet` live under `apps/v1`.

### Create, inspect, delete

```bash
kubectl run nginx --image nginx      # quick imperative create
kubectl create -f pod-definition.yaml # create from a manifest
kubectl get pods                      # list
kubectl describe pod myapp-pod        # events, status, containers
kubectl delete pod myapp-pod          # remove
```

### command and args

A Pod's `command` overrides the image's Docker `ENTRYPOINT`, and `args` overrides its `CMD`:

```yaml
spec:
  containers:
    - name: ubuntu-sleeper
      image: ubuntu-sleeper
      command: ["sleep"]   # ENTRYPOINT
      args: ["10"]         # CMD
```

Confirm the Pod is running with:

> kubectl get pods

[Pods — Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/pods/)

---
*Kubernetes Internals series — Part 1 of 16.*
*Overview: [kubectl Field Guide](/devops/kubectl-command-field-guide/) · Next: [Editing a Running Pod](/devops/k8s-editing-a-running-pod/) →*
