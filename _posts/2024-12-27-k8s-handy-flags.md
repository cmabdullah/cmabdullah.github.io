---
title: "Handy Flags — Kubernetes Internals #16"
header:
  overlay_image: /assets/images/blog_article_24_desert_horizon_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_24_desert_horizon_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - kubectl
  - reference
sidebar:
  nav: "kubernetes-series"
---

The last stop in the series: a short list of `kubectl` flags that do the most work per keystroke.

### Generate, don't hand-write

`--dry-run=client` means "do not create it, just show me," and `-o yaml` prints the definition. Together with
redirection they scaffold any manifest:

```bash
kubectl run nginx --image=nginx --dry-run=client -o yaml > nginx-pod.yaml
kubectl create deployment web --image=nginx --dry-run=client -o yaml > web.yaml
```

### The flags worth memorizing

| Flag                                          | What it gives you                             |
|-----------------------------------------------|-----------------------------------------------|
| `--dry-run=client -o yaml`                    | Generate a manifest without creating anything |
| `-o wide` / `-o yaml` / `-o json` / `-o name` | Control output for humans or scripts          |
| `--from-literal=k=v` / `--from-file=path`     | ConfigMap and Secret sources                  |
| `--selector k=v` / `-l k=v`                   | Filter resources by label                     |
| `--record`                                    | Record the command in rollout history         |
| `--force -f file`                             | Force-replace a resource from a file          |
| `--as <user>`                                 | Impersonate a user for access checks          |
| `--namespace=<ns>` / `--all-namespaces`       | Scope to one namespace or all                 |

### Docker-side flags you will reuse

```bash
docker run -e APP_COLOR=pink simple-web-color   # set an env var
docker run --user=1000 ubuntu                    # drop root
docker run --cap-add MAC_ADMIN ubuntu            # grant a capability
```

That wraps the **core fundamentals**. For the high-level command reference that started it all, see the
[kubectl Field Guide](/devops/kubectl-command-field-guide/) — and the series continues in **Part II —
Workloads & Networking**, starting with [Multi-Container Pods](/devops/k8s-multi-container-pods/).

> kubectl <any-command> --help

[kubectl Cheat Sheet — Kubernetes docs](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---
*Kubernetes Internals series — Part 16 (end of core fundamentals).*
*← Previous: [RBAC — Roles, Bindings, Access](/devops/k8s-rbac/) · Next: [Multi-Container Pods](/devops/k8s-multi-container-pods/) →*
