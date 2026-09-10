---
title: "Cluster Auth and kubeconfig (Kubernetes Internals #16)"
header:
  overlay_image: /assets/images/unsplash-gallery-image-3.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/unsplash-gallery-image-3.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - authentication
  - kubeconfig
sidebar:
  nav: "kubernetes-series"
---

Every `kubectl` call is an authenticated HTTPS request to the **kube-apiserver**. Understanding the
certificates behind it, and the kubeconfig that wires them together, demystifies most access problems.

### The certificates

A kubeadm cluster keeps its PKI under `/etc/kubernetes/pki`, with etcd's own certs in a subfolder:

```bash
ls /etc/kubernetes/pki/etcd/
# ca.crt  server.crt  server.key  peer.crt  healthcheck-client.crt ...
```

Those same certs let you query etcd directly, useful for confirming, say, that Secrets are encrypted at rest:

```bash
ETCDCTL_API=3 etcdctl \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  get /registry/secrets/default/my-secret
```

### Talking to the API server

You can pass credentials explicitly:

```bash
kubectl get pods \
  --server my-kube:6443 \
  --client-key admin.key \
  --client-certificate admin.crt \
  --certificate-authority ca.crt
```

…or hit the REST API raw:

```bash
curl -v -k https://master-node:6443/api/v1/pods --user "user:password123"
```

### kubeconfig contexts

Day-to-day you never type certs, you switch **contexts**, each a cluster + user + namespace bundle:

```bash
kubectl config view
kubectl config use-context prod-user@production
kubectl config view --kubeconfig=my-custom-config
```

Always confirm where you are before anything destructive:

> kubectl config current-context

[Configure Access to Clusters, Kubernetes docs](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/)

---
*Kubernetes Internals series, Part 16 of 18.*
*← Previous: [Jobs, Scaling and Ingress](/devops/k8s-jobs-scaling-ingress/) · Next: [RBAC, Roles, Bindings, Access](/devops/k8s-rbac/) →*
