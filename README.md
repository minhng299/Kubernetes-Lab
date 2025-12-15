Hệ thống quản lý bệnh án trên Kubernetes với Node.js backend và MySQL database.

## Cấu trúc dự án

```
├── backend/          # Node.js API server
├── frontend/         # Static HTML/CSS/JS client
└── k8s/             # Kubernetes manifests
```

## Chạy trên Kubernetes

### 1. Build images

```bash
# Backend
cd backend
docker build -t ocop-backend:1.0 .

# Frontend
cd frontend
docker build -t ocop-frontend:1.0 .
```
### 2. Deploy to Kubernetes

```bash
cd .\k8s\
kubectl apply -f .\mysql-pv.yaml   
kubectl apply -f .\mysql-deployment.yaml   
kubectl apply -f .\backend-configmap.yaml  
kubectl apply -f .\backend-deployment.yaml
kubectl apply -f .\frontend-deployment.yaml

```
### 3. Truy cập
Truy cập: localhost:32000
