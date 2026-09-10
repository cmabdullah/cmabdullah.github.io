---
title: "Jobs and CronJobs (Kubernetes Internals #23)"
header:
  overlay_image: /assets/images/blog_article_10_creative_desk_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_10_creative_desk_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - jobs
  - cronjobs
sidebar:
  nav: "kubernetes-series"
---

Not every workload should run forever. A nightly report, a database migration, a batch of image thumbnails,
these run to completion and stop. A Deployment would keep restarting them; a **Job** is built to run a task
once and finish.

### A Job

A Job creates a Pod, runs it to completion, and stops. `restartPolicy` must be `Never` or `OnFailure`, never
`Always`.

```yaml
# job-definition.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: math-add-job
spec:
  completions: 3     # run the Pod to success 3 times
  parallelism: 3     # up to 3 at once (omit for sequential)
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: math-add
          image: ubuntu
          command: ['expr', '3', '+', '2']
```

`completions` and `parallelism` are optional. Leave them out and you get one Pod run once; set them to run a
batch, sequentially or in parallel.

### A CronJob

A **CronJob** is a Job on a schedule, crontab for Kubernetes. It wraps a `jobTemplate` in a `schedule`.

```yaml
# cron-job-definition.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: reporting-cron-job
spec:
  schedule: "0 * * * *"     # top of every hour
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: report-tool
              image: report-tool
```

### Gotchas

- **`restartPolicy: Always` is invalid** for Jobs; the API rejects it.
- **Deleting a Job deletes the Pods it created**, useful for cleanup, surprising if you wanted the logs first.
- The Job's output lives in its Pod's logs, so read them before you delete.

```bash
kubectl get jobs
kubectl logs job/math-add-job
kubectl delete job math-add-job
```

> kubectl get cronjob reporting-cron-job

[Jobs, Kubernetes docs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)

---
*Kubernetes Internals series, Part 23.*
*← Previous: [Deployment Strategies](/devops/k8s-deployment-strategies/) · Next: [Services](/devops/k8s-services/) →*
