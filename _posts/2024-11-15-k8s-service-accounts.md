---
title: "Service Accounts — Kubernetes Internals #10"
header:
  overlay_image: /assets/images/blog_article_08_coffee_journal_2047x7740.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_08_coffee_journal_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - service-account
  - security
sidebar:
  nav: "kubernetes-series"
---

Every Pod talks to the Kubernetes API as *someone*. By default a token is silently mounted into your
container, and any process inside can use it to call the API. Who that identity is, what it may do, and how
long its token lives are among the most-changed corners of Kubernetes, so it is worth understanding properly.

A **ServiceAccount** is the identity a workload uses; a user account is for humans, a service account is for
the Pod.

### Assigning one to a Pod

```bash
kubectl create serviceaccount dash-sa
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-kubernetes-dashboard
spec:
  serviceAccountName: dash-sa
  containers:
    - name: my-kubernetes-dashboard
      image: my-kubernetes-dashboard
```

If a Pod does not call the API at all, mounting a token is needless attack surface. Turn it off:

```yaml
spec:
  automountServiceAccountToken: false
```

### What actually gets mounted

On a modern cluster the token arrives through a **projected volume**, not a static Secret. Inspect a running
Pod and you will see this:

```yaml
volumes:
  - name: kube-api-access
    projected:
      sources:
        - serviceAccountToken:
            expirationSeconds: 3607   # short-lived, auto-rotated
            path: token
        - configMap:
            name: kube-root-ca.crt    # the CA to trust the API server
            items:
              - key: ca.crt
                path: ca.crt
```

Three things are bundled: a **time-bound token**, the cluster **CA certificate**, and the **namespace**. The
container reads them from `/var/run/secrets/kubernetes.io/serviceaccount/`.

### The token evolution (why behavior differs by version)

This is the part that trips people up during upgrades and interviews:

- **Before v1.22** — creating a service account generated a **non-expiring** token stored in a Secret and
  auto-mounted into every Pod. Long-lived and hard to revoke.
- **v1.22 (KEP-1205)** — the **TokenRequest API**. Tokens became **audience-, time-, and object-bound** and
  are delivered via the projected volume above, with an expiry and automatic rotation.
- **v1.24 (KEP-2799)** — creating a service account **no longer auto-creates a token Secret**. You mint one on
  demand.

```bash
kubectl create token dash-sa            # short-lived token, on demand
kubectl create token dash-sa --duration=24h
```

If you genuinely need a long-lived token (say, for an external CI system), create it explicitly with the
right type and annotation:

```yaml
apiVersion: v1
kind: Secret
type: kubernetes.io/service-account-token
metadata:
  name: dash-sa-token
  annotations:
    kubernetes.io/service-account.name: dash-sa
```

### The takeaway

A service account is only an *identity*. What it may actually do is decided by RBAC bindings, covered later in
this series. Grant the minimum, and disable auto-mount where a Pod does not need API access.

> kubectl describe serviceaccount dash-sa

[Service Accounts — Kubernetes docs](https://kubernetes.io/docs/concepts/security/service-accounts/)

---
*Kubernetes Internals series — Part 10 of 16.*
*← Previous: [Secrets](/devops/k8s-secrets/) · Next: [Taints and Tolerations](/devops/k8s-taints-and-tolerations/) →*
