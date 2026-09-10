---
title: "ConfigMaps (Kubernetes Internals #8)"
header:
  overlay_image: /assets/images/blog_article_06_server_lights_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_article_06_server_lights_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - DevOps
tags:
  - kubernetes
  - configmap
  - configuration
sidebar:
  nav: "kubernetes-series"
---

Bake a database URL or a feature flag into your image and you are stuck rebuilding and re-pushing every time
it changes, and running a different image per environment. A **ConfigMap** breaks that coupling: the same
image runs everywhere, and configuration is supplied at runtime.

### Creating a ConfigMap

Imperatively, from literals or a properties file:

```bash
kubectl create configmap app-config \
  --from-literal=APP_COLOR=blue \
  --from-literal=APP_MODE=prod

kubectl create configmap app-config --from-file=app-config.properties
```

Or declaratively, which is what you keep in git:

```yaml
# config-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_COLOR: blue
  APP_MODE: prod
```

### Three ways to inject it

Which you pick decides how much a container sees. Load **every** key as environment variables:

```yaml
spec:
  containers:
    - name: simple-web-app
      image: simple-web-app
      envFrom:
        - configMapRef:
            name: app-config
```

Pull a **single** key into one named variable, the most precise option:

```yaml
env:
  - name: APP_COLOR
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_COLOR
```

Or mount it as a **volume**, where each key becomes a file, ideal for whole config files an app reads from
disk:

```yaml
volumes:
  - name: app-config-volume
    configMap:
      name: app-config
```

### The gotcha that surprises people

**Environment variables are a snapshot taken at container start.** Update the ConfigMap and the running Pod
keeps the old values until it restarts. **Volume-mounted** ConfigMaps, by contrast, are updated in place
(after a short kubelet sync delay), so an app that re-reads the file picks up changes without a restart.

If a config should never change under a running Pod, mark the ConfigMap `immutable: true`, it also improves
API-server performance at scale.

Verify what a Pod actually received:

> kubectl exec <pod> -- printenv APP_COLOR

[ConfigMaps, Kubernetes docs](https://kubernetes.io/docs/concepts/configuration/configmap/)

---
*Kubernetes Internals series, Part 8 of 18.*
*← Previous: [Building Images, the Docker Side](/devops/k8s-building-images/) · Next: [Secrets](/devops/k8s-secrets/) →*
