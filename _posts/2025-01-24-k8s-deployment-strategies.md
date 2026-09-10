---
title: "Deployment Strategies: Rolling, Blue-Green, Canary (Kubernetes Internals #22)"
header:
  overlay_image: /assets/images/blog_article_05_server_wiring_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_05_server_wiring_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - deployment
  - release
sidebar:
  nav: "kubernetes-series"
---

Shipping v2 is not one thing, it is a choice about *risk*. Take everything down and bring it back up? Bleed
traffic over gradually? Run both versions and flip a switch? Send 5% of users to the new build first? Those
are the four deployment strategies, and Kubernetes gives you the primitives for all of them.

### Recreate

Kill all old Pods, then start the new ones. Simple, but there is **downtime** between the two. Fine for dev,
rarely for production.

### Rolling update (the default)

Replace Pods a few at a time so capacity never drops. This is what a Deployment does out of the box, tuned by
`maxSurge` and `maxUnavailable` (covered in [Deployments](/devops/k8s-deployments/)).

### Blue-Green

Run **two complete environments**, blue (current) and green (new). Test green privately, then switch the
Service's selector from blue to green in one move. Instant cutover, instant rollback, at the cost of double
the resources during the switch.

### Canary

Send a **small slice of traffic** to the new version while most stays on the old. The trick in plain
Kubernetes is a shared label: both Deployments carry `app: front-end`, so one Service loads-balances across
both, and you control the split by **replica count**.

```yaml
# primary — 5 replicas of v1
spec:
  replicas: 5
  template:
    metadata:
      labels: { app: front-end, version: v1 }
---
# canary — 1 replica of v2, same app label
spec:
  replicas: 1
  template:
    metadata:
      labels: { app: front-end, version: v2 }
```

```yaml
# one Service fronts both
spec:
  selector:
    app: front-end
```

Five old to one new is roughly a 1-in-6 canary. Happy with it? Scale the primary to v2 and delete the canary.

**The caveat worth knowing:** with plain Deployments you can only shift traffic in **whole-Pod steps**, the
split depends on replica counts. A service mesh like **Istio** lets you dial an exact percentage independent
of Pod count.

> kubectl get pods -l app=front-end -L version

[Deployments, Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)

---
*Kubernetes Internals series, Part 22.*
*← Previous: [Health Probes](/devops/k8s-health-probes/) · Next: [Jobs & CronJobs](/devops/k8s-jobs-and-cronjobs/) →*
