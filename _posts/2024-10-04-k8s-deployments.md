---
title: "Deployments — Kubernetes Internals #4"
header:
  overlay_image: /assets/images/unsplash-image-4.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/unsplash-image-4.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - deployment
  - kubectl
sidebar:
  nav: "kubernetes-series"
---

A ReplicaSet keeps your Pods *alive*. A **Deployment** lets you *change* them, ship a new image to dozens of
Pods without dropping a request, and undo it in one command when the new version misbehaves. That gap,
zero-downtime updates and rollbacks, is the entire reason Deployments exist.

### What the extra object buys you

A Deployment does not run Pods itself. It creates and manages **ReplicaSets**: one per version. Rolling out
v2 means the Deployment spins up a new ReplicaSet and shifts replicas from old to new a few at a time. Roll
back, and it simply scales the previous ReplicaSet up again.

### The definition

It is a ReplicaSet with `kind: Deployment` and a rollout strategy:

```yaml
# deployment-definition.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-deployment
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # at most 1 extra Pod above replicas during the roll
      maxUnavailable: 0     # never drop below the desired count
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: nginx-container
          image: nginx:1.9.0
```

`maxSurge` and `maxUnavailable` are the knobs that make the update safe: `maxUnavailable: 0` guarantees full
capacity throughout, while `maxSurge: 1` bounds how many extra Pods run at once.

### A real rollout, start to finish

```bash
# create, recording the command as the change-cause
kubectl create -f deployment-definition.yaml --record

# ship a new image — this triggers the rolling update
kubectl set image deployment/my-app-deployment nginx-container=nginx:1.9.1

# watch it converge
kubectl rollout status deployment/my-app-deployment

# see the revisions and what caused them
kubectl rollout history deployment/my-app-deployment

# the new build is bad — undo it
kubectl rollout undo deployment/my-app-deployment
```

`--record` is what populates the CHANGE-CAUSE column in `rollout history`, invaluable when you are working out
what triggered a bad release at 2am.

### Create and scale fast

```bash
kubectl create deployment nginx --image=nginx --replicas=4
kubectl scale deployment nginx --replicas=6
kubectl create deployment nginx --image=nginx --dry-run=client -o yaml > nginx-deployment.yaml
```

### One gotcha

`spec.selector.matchLabels` is **immutable** once created, changing it means deleting and recreating the
Deployment. Choose labels you will not need to rename.

> kubectl rollout status deployment/my-app-deployment

[Deployments — Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

---
*Kubernetes Internals series — Part 4 of 16.*
*← Previous: [ReplicaSets](/devops/k8s-replicasets/) · Next: [Viewing Resources and Output Formats](/devops/k8s-viewing-resources/) →*
