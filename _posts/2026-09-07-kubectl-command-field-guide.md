---
title: kubectl Field Guide — A Working Reference for Day-to-Day Kubernetes
header:
  overlay_image: /assets/images/blog_generated_07_mountain_lake_2047x774.jpg
  overlay_filter: 0.5
  show_overlay_excerpt: false
  teaser: /assets/images/blog_generated_07_mountain_lake_2047x774.jpg
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
toc: true
toc_sticky: true
categories:
  - devops
tags:
  - kubernetes
  - kubectl
  - devops
sidebar:
  nav: "kubernetes-series"
---

This is a working reference for the `kubectl` commands I reach for while operating clusters, the kind of
notes you keep open in a second terminal tab rather than memorize. Each section groups commands by the task
you are actually trying to do, with the flags and gotchas that matter on the job.

> **Rule of thumb:** **imperative** commands (`run`, `create`, `scale`, `edit`) change the cluster directly and are great for quick fixes and scaffolding; **declarative** commands (`apply -f`) reconcile the cluster to a YAML file you keep in version control. Most day-to-day work is a mix scaffold imperatively, save the manifest, then manage it declaratively.

This field guide is the overview for a multi-part **Kubernetes Internals** deep-dive series (core fundamentals plus a Part II on workloads and networking). Each section below links to a post that unpacks the concept with YAML and internals — or use the series sidebar to jump around.

---

## Daily essentials — the commands I run most

If you read nothing else, this is the block worth pinning. Everything here is expanded, with context and
gotchas, in the sections below.

**Select & inspect**

```bash
kubectl get pods --selector app=App1     # filter by label (or -l app=App1)
kubectl get all                          # pods, svc, deploy, rs in one view
kubectl get deployments
kubectl get replicasets
kubectl get jobs
kubectl get ingress
```

**Deployments — create & update**

```bash
kubectl create -f deployment.yaml --record             # create, recording the change-cause
kubectl apply -f deploy.yaml                            # declarative create/update
kubectl set image deployment/my-app nginx=nginx:1.9.1   # update a running image
kubectl scale deployment frontend-v2 --replicas=5       # resize
```

**Rollout — status, history, rollback**

```bash
kubectl rollout status deployment/my-app     # watch a rollout
kubectl rollout history deployment/my-app    # revisions (CHANGE-CAUSE)
kubectl rollout undo deployment/my-app       # roll back one revision
```

**Jobs**

```bash
kubectl logs math-job-1dn5                   # a job's output lives in its pod logs
kubectl delete job math-job-1dn5             # deleting the job removes its pods
```

---

## Pods Create, Inspect, Delete

*Deep dive → [Pods: Create, Inspect, Delete](/devops/k8s-pods-create-inspect-delete/)*

```bash
kubectl run nginx --image=nginx        # create a pod from an image
kubectl get pods                       # list pods in the current namespace
kubectl get pods -o wide               # add node and pod-IP columns
kubectl describe pod nginx             # events, status, container details
kubectl delete pod nginx               # remove the pod
kubectl create -f pod.yaml             # create from a manifest
kubectl apply -f pod.yaml              # create or update from a manifest
```

The single most useful trick for productivity is generating a manifest instead of hand-writing YAML. Let
`kubectl` produce the boilerplate, then edit it:

```bash
# Print the YAML without touching the cluster
kubectl run redis --image=redis --dry-run=client -o yaml

# Redirect it into a file you can edit and apply later
kubectl run redis --image=redis --dry-run=client -o yaml > redis.yaml
```

`create -f` fails if the object already exists; `apply -f` creates or updates. In pipelines and GitOps
workflows you almost always want `apply`.

---

## Editing a Running Pod

*Deep dive → [Editing a Running Pod](/devops/k8s-editing-a-running-pod/)*

Most pod fields are immutable once the pod is running, so you generally cannot just change an image tag or
resource limit in place. Two approaches:

```bash
# Edit the few fields that are editable live
kubectl edit pod nginx

# Full replace: kubectl writes a temp file, you force-replace with it
kubectl replace --force -f /tmp/kubectl-edit-2007.yaml
```

When you need to change a property that the live editor rejects, extract the definition, edit it, and
force-replace:

```bash
kubectl get pod <pod-name> -o yaml > export.yaml
# edit export.yaml, then:
kubectl replace --force -f export.yaml
```

In practice, for anything long-lived you would let a Deployment recreate the pod for you rather than editing
pods directly.

---

## ReplicaSets Scale and Manage

*Deep dive → [ReplicaSets: Scale and Manage](/devops/k8s-replicasets/)*

```bash
kubectl get replicationcontroller             # legacy controllers
kubectl get replicaset                        # list ReplicaSets
kubectl edit replicaset new-replica-set-cm    # edit live
kubectl replace -f replicaset.yml             # replace from file
kubectl delete replicaset myapp-replicaset    # delete
```

There are three ways to change the replica count, and the difference matters:

```bash
# Edit the file's replica count, then replace from it
kubectl replace -f replicaset.yml

# Scale using the file as the target — note this does NOT change the file on disk
kubectl scale --replicas=6 -f replicaset.yml

# Scale by resource type and name directly
kubectl scale --replicas=6 replicaset myapp-replicaset
```

The catch worth remembering: `kubectl scale -f file` changes the live count but leaves the file's number
untouched, so the file and cluster drift apart. If you care about the file staying accurate, edit it and
`replace`.

---

## Deployments

*Deep dive → [Deployments](/devops/k8s-deployments/)*

A Deployment is the object you actually want to manage in production. Compared to a bare ReplicaSet it does
not do much more day-to-day, except that it introduces the Deployment object itself, which manages
ReplicaSets underneath and gives you rolling updates and rollbacks for free.

```bash
kubectl create -f deployment.yaml                        # create
kubectl create -f deployment.yaml --record               # create and record the command in history
kubectl get deployments                                  # list

kubectl apply -f deploy.yaml                             # declarative update
kubectl set image deployment/my-app nginx=nginx:1.9.1    # update the image of a running deployment
```

Rolling out, watching, and rolling back:

```bash
kubectl rollout status deployment/my-app     # watch the rollout progress
kubectl rollout history deployment/my-app    # revision history (CHANGE-CAUSE from --record)
kubectl rollout undo deployment/my-app       # roll back to the previous revision
```

Update a specific container's image inside a Deployment:

```bash
kubectl set image deployment/my-app nginx-container=nginx:1.9.1
```

`--record` stores the command that caused a change, which shows up in `rollout history` as the
CHANGE-CAUSE column, invaluable when you are trying to work out what triggered a bad rollout at 2am.

---

## Viewing Resources and Output Formats

*Deep dive → [Viewing Resources and Output Formats](/devops/k8s-viewing-resources/)*

```bash
kubectl get all             # pods, services, deployments, replicasets in one view
kubectl get pods -o wide    # extra columns like node and IP
```

The `-o` flag controls output and is worth knowing cold:

| Flag      | Use it when you want                         |
|-----------|----------------------------------------------|
| `-o wide` | Plain text plus extra info (node, IP)        |
| `-o yaml` | The full manifest, for saving or diffing     |
| `-o json` | Machine-readable output to pipe into `jq`    |
| `-o name` | Just the resource names, ideal for scripting |

`-o name` pairs nicely with `xargs` when you need to act on a filtered set of resources.

---

## Namespaces

*Deep dive → [Namespaces](/devops/k8s-namespaces/)*

```bash
kubectl get pods --namespace=dev          # pods in one namespace
kubectl get pods --namespace=default      # pods in default
kubectl get pods --all-namespaces         # pods everywhere
kubectl create namespace dev              # create a namespace
kubectl get namespaces                    # list namespaces
```

Typing `--namespace` on every command gets old fast. Set a default namespace for your current context:

```bash
kubectl config set-context $(kubectl config current-context) --namespace=dev
```

And to look at services in a particular namespace:

```bash
kubectl get services --namespace=marketing
kubectl get service -o wide
```

---

## Building Images (the Docker Side)

*Deep dive → [Building Images: the Docker Side](/devops/k8s-building-images/)*

The cluster runs images you build and push, so these belong in the same muscle memory:

```bash
docker build -t cmabdullah21/my-custom-app .    # build from the Dockerfile in the current directory
docker push cmabdullah21/my-custom-app          # push to the registry
docker images                                   # list local images
docker history cmabdullah21/my-custom-app       # inspect the image layers

docker run -p 8282:8080 web-app                 # map host:container ports
docker run python:3.6 cat /etc/*release*        # peek inside an image
docker build -t cmabdullah/app:lite .           # build a specific tag
docker run -e APP_COLOR=pink simple-webapp-color # pass an environment variable
```

`-t` names and tags the image, `-p` publishes ports as `host:container`, and `-e` injects an environment
variable, the same value you would later move into a ConfigMap or Secret once it runs in the cluster.

---

## ConfigMaps

*Deep dive → [ConfigMaps](/devops/k8s-configmaps/)*

Externalize configuration so the same image runs in every environment. Create from inline literals or from a
file:

```bash
# From literals
kubectl create configmap app-config --from-literal=APP_COLOR=blue

# From a properties file
kubectl create configmap app-config --from-file=app-config.properties
```

Inspect them:

```bash
kubectl get configmaps
kubectl describe configmap app-config
```

---

## Secrets

*Deep dive → [Secrets](/devops/k8s-secrets/)*

Secrets look like ConfigMaps but are meant for sensitive values. Create the same two ways:

```bash
kubectl create secret generic app-secret --from-literal=DB_HOST=mysql
kubectl create secret generic app-secret --from-file=app-secret.properties
```

The important operational caveat: **Secret values are base64-encoded, not encrypted**. Anyone who can read
the Secret can decode it:

```bash
echo -n 'mysql' | base64             # encode  -> bXlzcWw=
echo -n 'bXlzcWw=' | base64 --decode # decode -> mysql
```

```bash
kubectl get secrets
kubectl describe secret app-secret
kubectl get secret app-secret -o yaml
```

For real protection, enable encryption-at-rest on etcd or use an external secrets manager; base64 only keeps
the value from being printed by accident.

---

## Service Accounts

*Deep dive → [Service Accounts](/devops/k8s-service-accounts/)*

Pods authenticate to the API server as a service account. Create one, inspect it, and read its token:

```bash
kubectl create serviceaccount dashboard-sa       # create
kubectl get serviceaccount                        # list
kubectl describe serviceaccount dashboard-sa      # shows the mounted token secret

kubectl describe secret dashboard-sa-token-kbbdm  # inspect the token secret
kubectl create token dashboard-sa                 # generate a token on demand (newer clusters)
```

Every pod gets its service account token mounted at a well-known path, which you can read from inside the
pod:

```bash
kubectl exec -it <pod-name> -- cat /var/run/secrets/kubernetes.io/serviceaccount/token
kubectl exec -it <pod-name> -- ls  /var/run/secrets/kubernetes.io/serviceaccount/
```

---

## Taints and Tolerations

*Deep dive → [Taints and Tolerations](/devops/k8s-taints-and-tolerations/)*

Taints and tolerations control which pods are allowed onto which nodes. A **taint** on a node repels pods; a
matching **toleration** on a pod lets it through. Taint is the node side, toleration is the pod side.

```bash
kubectl taint nodes <node-name> key=value:taint-effect
kubectl taint nodes node01 app=blue:NoSchedule
```

The three effects: `NoSchedule` blocks new pods, `PreferNoSchedule` tries to avoid them, and `NoExecute`
also evicts pods already running there. One thing that trips people up: a toleration only *allows*
scheduling onto a tainted node, it does not *force* it. Use node affinity when you need to guarantee
placement.

---

## Labels, Selectors and Rollouts

*Deep dive → [Labels, Selectors and Rollouts](/devops/k8s-labels-selectors-rollouts/)*

Labels are how you filter and target groups of resources:

```bash
kubectl get pods --selector app=App1     # filter by label (also -l app=App1)

kubectl rollout status deployment/myapp  # is the rollout done?
kubectl rollout history deployment/myapp # what changed and when?

kubectl set image deployment/myapp nginx-container=nginx:1.9.1  # roll forward
kubectl get replicasets                  # see the ReplicaSets a Deployment manages
kubectl rollout undo deployment/myapp    # roll back
```

---

## Jobs, Scaling and Ingress

*Deep dive → [Jobs, Scaling and Ingress](/devops/k8s-jobs-scaling-ingress/)*

```bash
kubectl create -f deployment.yaml --record            # record for history
kubectl scale deployment --replicas=5 frontend-v2     # scale imperatively

kubectl get jobs                 # list jobs
kubectl logs math-job-1dn5       # read a job pod's output
kubectl delete job math-job-1dn5 # clean up a finished job

kubectl get ingress              # list ingress resources
```

For a Job, the result lives in the pod's logs, so `kubectl logs` is usually the first thing you run after it
completes.

---

## Talking to the Cluster Auth and kubeconfig

*Deep dive → [Cluster Auth and kubeconfig](/devops/k8s-cluster-auth-kubeconfig/)*

Sometimes you need to hit the API server explicitly with certificates rather than relying on your kubeconfig:

```bash
kubectl get pods \
  --server my-kube:6443 \
  --client-key admin.key \
  --client-certificate admin.crt \
  --certificate-authority ca.crt
```

Or go straight to the REST API with `curl`:

```bash
curl -v -k https://master-node:6443/api/v1/pods --user "user:password123"
```

Day-to-day, though, you manage all of this through kubeconfig contexts:

```bash
kubectl config view                                # show the merged config
kubectl config use-context prod-user@production    # switch cluster/user/namespace
kubectl config view --kubeconfig=my-custom-config  # view a specific config file
```

Switching contexts is how you move between clusters safely, always check `kubectl config current-context`
before running anything destructive.

---

## RBAC Roles, Bindings and Access Checks

*Deep dive → [RBAC: Roles, Bindings, Access](/devops/k8s-rbac/)*

Role-based access control decides who can do what. Create roles and bindings from manifests, then inspect
them:

```bash
kubectl create -f dev-user-role.yaml

kubectl get roles
kubectl get rolebindings
kubectl describe role <role-name>
kubectl describe rolebinding <name>
```

The command I use constantly for debugging permissions is `auth can-i`. It answers "am I allowed to do
this?" without you having to trigger the action:

```bash
kubectl auth can-i create deployments
kubectl auth can-i delete nodes

# Impersonate another user to check their access (needs impersonation rights)
kubectl auth can-i create deployments --as dev-user
kubectl auth can-i create pods --as dev-user
kubectl auth can-i create pods --as dev-user --namespace test-s
kubectl auth can-i create deployments --as dev-user --namespace test-1
```

Two distinctions to keep straight: a **Role** is namespaced while a **ClusterRole** is cluster-wide, and a
**RoleBinding** grants access within one namespace while a **ClusterRoleBinding** grants it across the whole
cluster.

---

## Handy Flags to Keep in Your Back Pocket

*Deep dive → [Handy Flags](/devops/k8s-handy-flags/)*

| Flag                                          | What it gives you                             |
|-----------------------------------------------|-----------------------------------------------|
| `--dry-run=client -o yaml`                    | Generate a manifest without creating anything |
| `-o wide` / `-o yaml` / `-o json` / `-o name` | Control output for humans or scripts          |
| `--from-literal=k=v` / `--from-file=path`     | ConfigMap and Secret sources                  |
| `--selector k=v` / `-l k=v`                   | Filter resources by label                     |
| `--record`                                    | Record the command in rollout history         |
| `--force -f file`                             | Force-replace a resource from a file          |
| `--as <user>`                                 | Impersonate a user for access checks          |
| `--namespace=<ns>` / `--all-namespaces`       | Scope a command to one namespace or all       |

Keep this open in a tab, and over time the commands you use most will settle into muscle memory, the rest
stay one glance away.

---

- [kubectl Quick Reference — Kubernetes docs](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
- [kubectl Commands reference](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands)
- [Managing Secrets using kubectl](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/)
- [Taints and Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)
- [Using RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
