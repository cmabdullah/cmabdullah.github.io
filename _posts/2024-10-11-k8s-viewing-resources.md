---
title: "Viewing Resources and Output Formats — Kubernetes Internals #5"
header:
  overlay_image: /assets/images/blog_botanical_12_pink_flowers_sunlight_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_botanical_12_pink_flowers_sunlight_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - kubectl
sidebar:
  nav: "kubernetes-series"
---

Reading the cluster well is half of operating it. `kubectl get` and `describe` are the workhorses, and the
`-o` flag reshapes their output for either your eyes or a script.

### See what exists

```bash
kubectl get all              # pods, services, deployments, replicasets at once
kubectl get pods -o wide     # extra columns: node, IP
kubectl describe pod myapp   # events and full detail for one object
```

### Output formats

| Flag      | Use it when you want                         |
|-----------|----------------------------------------------|
| `-o wide` | Plain text plus node and IP                  |
| `-o yaml` | The full manifest, to save or diff           |
| `-o json` | Machine-readable output to pipe into `jq`    |
| `-o name` | Just the resource names, ideal for scripting |

### Generate manifests instead of writing them

The most useful habit is combining `--dry-run=client` with `-o yaml` and shell redirection. `--dry-run=client`
means "do not create anything, just show me what would be created," and `-o yaml` prints that definition:

```bash
kubectl run nginx --image=nginx --dry-run=client -o yaml > nginx-pod.yaml
```

Now edit `nginx-pod.yaml` and `kubectl create -f` it. This is far faster than writing YAML by hand and is the
single biggest day-to-day time-saver.

> kubectl get all -o wide

[kubectl overview — Kubernetes docs](https://kubernetes.io/docs/reference/kubectl/)

---
*Kubernetes Internals series — Part 5 of 16.*
*← Previous: [Deployments](/devops/k8s-deployments/) · Next: [Namespaces](/devops/k8s-namespaces/) →*
