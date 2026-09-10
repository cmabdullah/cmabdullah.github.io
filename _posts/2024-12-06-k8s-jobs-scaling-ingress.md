---
title: "Jobs, Scaling and Ingress (Kubernetes Internals #15)"
header:
  overlay_image: /assets/images/blog_article_19_white_architecture_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_19_white_architecture_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - jobs
  - ingress
sidebar:
  nav: "kubernetes-series"
---

Three everyday tasks that do not fit the "long-running Deployment" mould: run work to completion, resize a
workload, and route external traffic in.

### Jobs, run to completion

A Deployment keeps Pods running forever; a **Job** runs a Pod until it succeeds, then stops.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: math-job
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: math
          image: python
          command: ["python", "-c", "print(2*3)"]
```

```bash
kubectl get jobs
kubectl logs math-job-1dn5       # the result lives in the Pod's logs
kubectl delete job math-job
```

### Scaling

```bash
kubectl scale deployment nginx --replicas=4
kubectl scale deployment --replicas=5 frontend-v2
```

### Exposing and routing traffic

A Service gives a stable address. `kubectl expose` reads the Pod's labels as the selector automatically:

```bash
kubectl expose pod redis --port=6379 --name=redis-service --dry-run=client -o yaml
kubectl expose pod nginx --port=80 --name=nginx-service --type=NodePort --dry-run=client -o yaml
```

For HTTP routing by host or path, an **Ingress** sits in front of your Services as the single entry point,
mapping requests to backends and handling TLS.

```bash
kubectl get ingress
```

> kubectl get jobs,svc,ingress

[Jobs, Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)

---
*Kubernetes Internals series, Part 15 of 18.*
*← Previous: [Labels, Selectors and Rollouts](/devops/k8s-labels-selectors-rollouts/) · Next: [Cluster Auth and kubeconfig](/devops/k8s-cluster-auth-kubeconfig/) →*
