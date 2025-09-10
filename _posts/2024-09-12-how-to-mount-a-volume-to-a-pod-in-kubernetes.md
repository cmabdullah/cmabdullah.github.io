---
layout: post
title: How to mount a volume to a pod in Kubernetes
categories: [devops]
tags: [persistent-volumes, kubernetes, pods, storage]
image: '/assets/img/pv.png'
---

# How to mount a volume to a pod in Kubernetes

Kubernetes containers and pods are ephemeral and can be restarted, rescheduled, or deleted.
Persistent storage ensures that data remains intact across these lifecycle changes.
This type of storage is essential for applications that require long-term data retention, like databases or logs.
Volume mounts play a crucial role in providing persistent storage service.
This article will show the process of mounting the pod with persistent volume.

### Persistent Volume

A PersistentVolume is a piece of storage in the cluster; consider it a Kubernetes object that has been provisioned by
an administrator or dynamically provisioned using Storage Classes.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: c-volume
spec:
  accessModes:
    - ReadWriteMany
  capacity:
    storage: 500Mi
  hostPath:
    path: /opt
```
### Persistent Volume Claim

A Persistent Volume Claim in Kubernetes is a request for storage by an application.
It enables static or dynamic allocation of persistent volume in a cluster.
Claims can request specific size and access volume by a Pod.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: c-claim
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 100Mi
```

PersistentVolumeClaim is used by Pod to mount storage. In the given pod's specification, I have mounted /log path.
with the volume claim c-claim.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - image: cmabdullah21/log-simulation
    name: log-simulation
    volumeMounts:
    - mountPath: /log
      name: application-log
  volumes:
  - persistentVolumeClaim:
      claimName: c-claim
    name: application-log
```

If pod is lost, data will be preserved on the referenced volume.

by hitting this command
> kubectl exec -it app -- ls /log

You can check if the volume directory has been properly mounted within the pod.


[persistent-volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

