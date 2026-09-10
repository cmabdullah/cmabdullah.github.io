---
title: "Multi-Container Pods: Sidecar, Adapter, Ambassador — Kubernetes Internals #17"
header:
  overlay_image: /assets/images/blog_generated_11_circuit_board_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_generated_11_circuit_board_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - pods
  - patterns
sidebar:
  nav: "kubernetes-series"
---

A logging agent that ships your app's logs does not belong *inside* your app's image, but it does belong in
the same Pod. That is the whole idea of a **multi-container Pod**: two or more containers that share a
lifecycle, a network, and volumes, each doing one job well.

Containers in the same Pod are created and destroyed together, reach each other over `localhost`, and can
mount the same volumes. Three patterns show up again and again.

### Sidecar

A helper container running beside the main one. The classic example is a **logging agent** deployed next to a
web server, collecting its logs and forwarding them to a central log server. The app stays focused on serving;
the sidecar handles log shipping.

### Adapter

The sidecar's cousin. Before logs leave the Pod, an **adapter container reshapes them into a common format**
the central server expects. Your app writes logs however it likes; the adapter normalizes them.

### Ambassador

A proxy for *outbound* connections. Your app always talks to a database at `localhost`, and the **ambassador
container proxies that request to the right database** — local for dev, another for test, production for prod.
The environment logic lives in the ambassador, not your application code.

### The definition

All three are the same shape, more than one container under `spec.containers`:

```yaml
# pod-definition.yaml
apiVersion: v1
kind: Pod
metadata:
  name: simple-app
  labels:
    name: simple-app
spec:
  containers:
    - name: simple-app
      image: simple-app
    - name: log-agent      # the sidecar
      image: log-agent
```

The trade-off to remember: because they **share a lifecycle**, if any container in the Pod fails, the whole
Pod is restarted. Keep only tightly-coupled helpers in the same Pod; anything independent belongs in its own.

> kubectl logs simple-app -c log-agent

[Sidecar Containers — Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/)

---
*Kubernetes Internals series — Part 17.*
*Overview: [kubectl Field Guide](/devops/kubectl-command-field-guide/) · Next: [Init Containers](/devops/k8s-init-containers/) →*
