---
title: "Editing a Running Pod (Kubernetes Internals #2)"
header:
  overlay_image: /assets/images/blog_botanical_03_fresh_spring_leaves_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_botanical_03_fresh_spring_leaves_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - pods
  - kubectl
sidebar:
  nav: "kubernetes-series"
---

You open a running Pod with `kubectl edit`, change the image, hit save, and Kubernetes refuses the write.
That is not a bug: most of a Pod's spec is **immutable** once it is running. You can edit only a small set of
fields live, so the real skill is knowing the two escape hatches for everything else.

### Edit the fields you can

```bash
kubectl edit pod nginx
```

This opens the live object in your editor. If you change an editable field (for example a label), it applies
immediately. If you change a field the Pod does not allow live, the editor rejects the save and writes your
attempt to a temporary file such as `/tmp/kubectl-edit-2007.yaml`.

### Force-replace from that temp file

```bash
kubectl replace --force -f /tmp/kubectl-edit-2007.yaml
```

`--force` deletes the existing Pod and recreates it from the file, which is how you apply a change the live
edit refused.

### Extract, edit, re-apply

When you want full control, dump the Pod to a file, edit it, and replace:

```bash
kubectl get pod <pod-name> -o yaml > export.yaml
# edit export.yaml
kubectl replace --force -f export.yaml
```

In practice, for anything long-lived you rarely edit Pods directly, you let a Deployment recreate them for
you. Verify the running definition with:

> kubectl get pod nginx -o yaml

[Managing objects, Kubernetes docs](https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/)

---
*Kubernetes Internals series, Part 2 of 18.*
*← Previous: [Pods: Create, Inspect, Delete](/devops/k8s-pods-create-inspect-delete/) · Next: [ReplicaSets](/devops/k8s-replicasets/) →*
