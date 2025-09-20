---
layout: post
title: What is NetworkPolicy in kubernetes?
header:
  teaser: /assets/images/unsplash-image-6.jpg
categories: [devops]
tags: [network-policy, security, devops]
image: '/assets/img/networkPolicyIngress.svg'
---

# What is NetworkPolicy in kubernetes?

In Kubernetes clusters, a firewall is used for controlling traffic at the IP level or port level. 
NetworkPolicy acts as a firewall in the cluster. It will allow you to define some firewall rules, 
like which pod is allowed to accept an incoming request or an outgoing request. 
It also helps to prevent sensitive resources from public access of all pods and limit the damage if you have any risk.

### Target Pod Selector
```yaml
spec:
  podSelector:
    matchLabels:
      app: product-db
  ```
The podSelector targets a group of pods that have the label **app: product-db**, and the network policy is applied to those pods.

### Types of network policies
```yaml
  policyTypes:
  - Ingress         # applicable to incoming requests
  - Egress          # applicable to outgoing requests
```
Kubernetes network policy has two types, one of them is Ingress, and another is Egress, 
where Ingress controls incoming requests to the selected pod and Egress controls outgoing requests from the pod selected by podSelector. 
If and only if policy is not defined, all incoming requests to pod or outgoing requests are unrestricted.

### Ingress Policy:
![networkPolicyIngress.svg](..%2F..%2Fassets%2Fimg%2FnetworkPolicyIngress.svg)

```yaml
  ingress:
    - from:
        - podSelector:
            matchLabels:
              name: product-api
```
If the ingress policy is configured, **then only the allowed source can send traffic to the pod** selected by podSelector. 
In the given example, the pod labeled with **product-api** is only allowed to send requests to the pod labeled with **product-db** from _the given namespace_ according to current policy.
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: product-db
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              name: product-api
      ports:
        - port: 3306
          protocol: TCP
```

### More Ingress Rules

```yaml
  ingress:
    - from:
        - podSelector:
            matchLabels:
              name: product-api
        - nameSpaceSelector:
              product-types: food-and-beverage
```

### this block allows incoming request from two sources
1. Pods in the specified namespace that has the label **name: product-api**
2. Pods within the entire namespace that have the label **product-types: food-and-beverage**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: product-db
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              name: product-api
        - nameSpaceSelector:
              product-types: food-and-beverage 
      ports:
        - port: 3306
          protocol: TCP
```
### Egress policy:
![egressPolicy.svg](..%2F..%2Fassets%2Fimg%2FegressPolicy.svg)

When the Egress network policy has been configured, then the behavior in the pod selected by selector can send outgoing requests to the destination pod; in the given example, the pod labeled with **product-db**
will be allowed to send the **outgoing traffic** to the pod labeled with  **product-types-db** or 192.168.0.105/24 from the given namespace according to current policy.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: payment-api-network-policy
spec:
  podSelector:
    matchLabels:
      app: product-db
  policyTypes:
    - Egress
  egress:
    - to:
        - podSelector:
            matchLabels:
              name: product-types-db
        - ipBlock:
            cidr: 192.168.0.105/24
      ports:
        - protocol: TCP
          port: 3306
```
Ref:
1. [Network Policy](https://kubernetes.io/docs/concepts/services-networking/network-policies/)