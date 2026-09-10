---
title: "ReplicaSets: Scale and Manage (Kubernetes Internals #3)"
header:
  overlay_image: /assets/images/unsplash-image-3.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/unsplash-image-3.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - replicaset
  - kubectl
sidebar:
  nav: "kubernetes-series"
---

Delete a Pod that a **ReplicaSet** manages and it reappears within seconds, that self-healing is the whole
point. A ReplicaSet keeps a specified number of identical Pods running: replacing ones that die and scaling
out on demand. It is the successor to the older ReplicationController, with one important addition, a
`selector`.

### The definition

```yaml
# replicaset-definition.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: myapp-replicaset
  labels:
    app: myapp
    type: front-end
spec:
  replicas: 3
  selector:
    matchLabels:
      type: front-end
  template:
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

Two parts do the work. The `template` is a full Pod definition the ReplicaSet stamps out. The `selector.matchLabels`
tells the ReplicaSet **which Pods it owns**, and this is why the ReplicaSet can adopt Pods that already existed
before it was created, as long as their labels match.

### Scaling

```bash
kubectl scale --replicas=6 -f replicaset-definition.yaml   # scale using the file as target
kubectl scale --replicas=6 replicaset myapp-replicaset      # scale by name
kubectl replace -f replicaset-definition.yaml               # apply an edited replica count
```

One gotcha: `kubectl scale -f file` changes the live count but does **not** update the number in the file, so
the two drift apart.

> kubectl get replicaset

[ReplicaSet, Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)

---
*Kubernetes Internals series, Part 3 of 18.*
*← Previous: [Editing a Running Pod](/devops/k8s-editing-a-running-pod/) · Next: [Deployments](/devops/k8s-deployments/) →*
