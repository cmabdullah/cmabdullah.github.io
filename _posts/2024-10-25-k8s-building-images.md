---
title: "Building Images: the Docker Side — Kubernetes Internals #7"
header:
  overlay_image: /assets/images/unsplash-image-7.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/unsplash-image-7.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - docker
  - images
sidebar:
  nav: "kubernetes-series"
---

The cluster runs images you build and push, so image mechanics belong in the same muscle memory as `kubectl`.

### A Dockerfile, top to bottom

```dockerfile
FROM ubuntu
RUN apt-get update
RUN apt-get install -y python
RUN pip install flask flask-mysql
COPY . /opt/source-code
ENTRYPOINT FLASK_APP=/opt/source-code/app.py flask run
```

```bash
docker build -t cmabdullah21/my-custom-app .
docker push cmabdullah21/my-custom-app
```

### Layers are cached

Docker uses a layered architecture: each instruction is a cached layer. Change one line and Docker rebuilds
**that layer and every layer after it**, while everything above loads from cache. Ordering rarely-changed
steps first (dependencies before source) makes rebuilds much faster.

### ENTRYPOINT vs CMD

`ENTRYPOINT` is the fixed command; `CMD` supplies default arguments you can override at runtime:

```dockerfile
FROM ubuntu
ENTRYPOINT ["sleep"]
CMD ["5"]
```

`docker run ubuntu-sleeper` runs `sleep 5`; `docker run ubuntu-sleeper 10` runs `sleep 10`. In a Pod these
map to `command` and `args`.

### A word on container security

Containers share the host kernel and are isolated by Linux **namespaces**; by default the process runs as
root but with a **reduced set of capabilities**. Tighten or loosen that as needed:

```bash
docker run --user=1000 ubuntu sleep 3600   # drop root
docker run --cap-add MAC_ADMIN ubuntu       # add a capability
docker run --cap-drop KILL ubuntu           # remove one
```

> docker history cmabdullah21/my-custom-app

[Dockerfile reference](https://docs.docker.com/engine/reference/builder/)

---
*Kubernetes Internals series — Part 7 of 16.*
*← Previous: [Namespaces](/devops/k8s-namespaces/) · Next: [ConfigMaps](/devops/k8s-configmaps/) →*
