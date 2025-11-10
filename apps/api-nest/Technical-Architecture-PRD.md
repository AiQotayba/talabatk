# 🏗️ Backend Technical Architecture PRD - تطبيق التوصيل

## 📋 جدول المحتويات

1. [الملخص التنفيذي](#الملخص-التنفيذي)
2. [Backend Architecture](#backend-architecture)
3. [Tech Stack](#tech-stack)
4. [APIs Documentation](#apis-documentation)
5. [Database Schema](#database-schema)
6. [Real-time Features](#real-time-features)
7. [الأمان](#الأمان)
8. [Deployment Strategy](#deployment-strategy)
9. [Testing & Documentation](#testing--documentation)

---

## 🎯 الملخص التنفيذي

تصميم بنية Backend مبسطة ومنخفضة التكلفة تدعم تطبيق العمال وتطبيق العملاء مع التركيز على التطوير السريع والتشغيل الاقتصادي.

### الأهداف الرئيسية:
- **Backend API**: RESTful APIs مع Socket.io
- **التكلفة المنخفضة**: أقل من 25$ شهرياً للتشغيل
- **التطوير السريع**: Backend MVP في 1-2 شهر
- **البساطة**: بنية سهلة الفهم والصيانة
- **الموثوقية**: توفر 99% مع مراقبة أساسية

---

## 🏗️ Backend Architecture

### 1️⃣ Backend Structure

```
┌───────────────────────────────────────┐
│         NestJS Backend API            │
│  ┌──────────────┐  ┌──────────────┐   │
│  │Controllers   │  │Services      │   │
│  │Guards        │  │Socket.io     │   │
│  │Pipes         │  │Interceptors  │   │
│  └──────────────┘  └──────────────┘   │
└───────────────────────────────────────┘
┌───────────────────────────────────────┐
│           Database Layer              │
│  ┌──────────────┐  ┌──────────────┐   │
│  │PostgreSQL    │  │Prisma ORM    │   │
│  │(Main DB)     │  │(Data Access) │   │
│  └──────────────┘  └──────────────┘   │
└───────────────────────────────────────┘
```
 

### NestJS Modules Structure
```typescript
// Module organization
- AuthModule: Authentication & Authorization
- UsersModule: User management
- OrdersModule: Order management
- MessagesModule: Real-time messaging
- AdminModule: Admin operations
```

---

## 🛠️ Tech Stack

### Backend Core
- **Node.js + NestJS** - إطار عمل منظم وقوي
- **TypeScript** - للكتابة الآمنة
- **Socket.io** - للاتصال المباشر
- **JWT** - للمصادقة
- **PostgreSQL** - قاعدة البيانات الرئيسية
- **Prisma** - ORM متقدم

### Backend Libraries
- **bcrypt** - تشفير كلمات المرور
- **Class-validator** - للتحقق من البيانات
- **Swagger** - لتوثيق الـ APIs
- **Jest** - للاختبارات
- **Helmet** - للأمان

### Infrastructure
- **VPS** - 20$ شهرياً
- **PM2** - إدارة العمليات
- **Nginx** - خادم ويب
- **GitHub** - للكود

### External Services
- **OpenStreetMap** - خرائط مجانية
- **SMTP** - للإشعارات البريدية

---

## 📡 APIs Documentation

### 🔐 Authentication APIs

#### POST /api/auth/register
```typescript
// إنشاء حساب جديد
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "client" | "driver"
}
```

#### POST /api/auth/login
```typescript
// تسجيل الدخول
{
  "email": "string",
  "password": "string"
}
// Response
{
  "access_token": "string",
  "refresh_token": "string",
  "user": UserObject
}
```

#### POST /api/auth/refresh-token
```typescript
// تجديد التوكن
{
  "refresh_token": "string"
}
```

#### POST /api/auth/verify-phone
```typescript
// التحقق من رقم الهاتف
{
  "phone": "string",
  "otp": "string"
}
```

### 👤 User Management APIs

#### GET /api/users/profile
```typescript
// الحصول على الملف الشخصي
// Headers: Authorization: Bearer <token>
```

#### PUT /api/users/profile
```typescript
// تحديث الملف الشخصي
{
  "name": "string",
  "profile_photo_url": "string"
}
```

#### GET /api/users/addresses
```typescript
// الحصول على العناوين المحفوظة
```

#### POST /api/users/addresses
```typescript
// إضافة عنوان جديد
{
  "city": "string",
  "street": "string",
  "label": "string",
  "lat": number,
  "lng": number,
  "is_default": boolean
}
```

### 📦 Order Management APIs

#### POST /api/orders
```typescript
// إنشاء طلب جديد
{
  "content": "string",
  "dropoff_address_id": "string",
  "payment_method": "cash" | "card"
}
```

#### GET /api/orders/:id
```typescript
// الحصول على تفاصيل الطلب
```

#### PUT /api/orders/:id/status
```typescript
// تحديث حالة الطلب
{
  "status": "pending" | "assigned" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled"
}
```

#### GET /api/orders/client/history
```typescript
// سجل طلبات العميل
// Query params: page, limit, status
```

#### GET /api/orders/driver/pending
```typescript
// الطلبات المعلقة للسائق
```

#### POST /api/orders/:id/accept
```typescript
// قبول الطلب (للسائق)
```

#### POST /api/orders/:id/reject
```typescript
// رفض الطلب (للسائق)
```

### 🗺️ Location & Tracking APIs

#### PUT /api/location/driver
```typescript
// تحديث موقع السائق
{
  "lat": number,
  "lng": number,
  "status": "available" | "busy" | "offline"
}
```

#### GET /api/location/order/:id
```typescript
// تتبع الطلب
```

#### GET /api/location/nearby-drivers
```typescript
// السائقين القريبين
// Query params: lat, lng, radius
```

### 💬 Messaging APIs

#### POST /api/messages
```typescript
// إرسال رسالة
{
  "order_id": "string",
  "to_user": "string",
  "content": "string",
  "message_type": "text" | "audio" | "image"
}
```

#### GET /api/messages/order/:id
```typescript
// محادثة الطلب
```

#### PUT /api/messages/:id/read
```typescript
// تحديد كمقروء
```

### ⭐ Rating & Complaint APIs

#### POST /api/ratings
```typescript
// تقييم الطلب
{
  "order_id": "string",
  "driver_id": "string",
  "score": number,
  "comment": "string"
}
```

#### POST /api/complaints
```typescript
// رفع شكوى
{
  "order_id": "string",
  "description": "string",
  "photo_urls": string[]
}
```

### 👨‍💼 Admin APIs

#### GET /api/admin/orders
```typescript
// جميع الطلبات مع فلترة
// Query params: status, date_from, date_to, page, limit
```

#### GET /api/admin/drivers
```typescript
// إدارة السائقين
```

#### PUT /api/admin/drivers/:id
```typescript
// تعديل بيانات السائق
{
  "status": "active" | "suspended",
  "notes": "string"
}
```

#### GET /api/admin/analytics
```typescript
// التحليلات والإحصائيات
// Query params: period (daily, weekly, monthly)
```

---

## 🗄️ Database Schema

### Schema Overview
[file](./prisma.schema)

### Key Models:
- **User**: المستخدمين (عملاء، سائقين، إدارة)
- **Order**: الطلبات مع الحالات المختلفة
- **Address**: العناوين المحفوظة
- **Message**: الرسائل والمحادثات
- **Rating**: التقييمات
- **Complaint**: الشكاوى
- **DriverStatusLog**: سجل حالات السائقين

### Indexes Strategy:
```sql
-- Performance indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Location indexes
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_addresses_location ON addresses USING GIST (point(lat, lng));
```

---

## ⚡ Real-time Features

### Socket.io Configuration
```typescript
// Server-side events
- order_created
- order_assigned
- order_status_updated
- driver_location_updated
- message_received

// Client-side events
- join_order_room
- leave_order_room
- send_message
- update_location
```

### Real-time Order Tracking
- تحديث موقع السائق كل 30 ثانية
- إشعارات فورية لتغيير حالة الطلب
- محادثة مباشرة بين العميل والسائق

### Live Notifications
- إشعارات Socket.io داخل التطبيق
- إشعارات البريد الإلكتروني (SMTP مجاني)

---

## 🔒 الأمان

### 1️⃣ المصادقة والتفويض

#### JWT Implementation
```typescript
// Access Token (1 hour)
{
  "sub": "user_id",
  "role": "client" | "driver" | "admin",
  "iat": timestamp,
  "exp": timestamp
}
```

#### Password Security
- **bcrypt** hashing with salt rounds: 10
- **Minimum password length**: 6 characters
- **Basic validation** فقط

### 2️⃣ حماية البيانات

#### HTTPS & SSL
- **Let's Encrypt** SSL مجاني
- **Basic security headers**

#### Input Validation
```typescript
// Basic validation
- Email format check
- Phone number format
- String length limits
- Required fields
```

### 3️⃣ مراقبة الأمان

#### Rate Limiting
```typescript
// Basic Rate Limits
- Auth endpoints: 10 requests/minute
- General APIs: 200 requests/minute
```

#### Basic Logging
- **Console logging** للـ development
- **File logging** للـ production
- **Error tracking** أساسي

---

## 🚀 Deployment Strategy

### 1️⃣ Infrastructure Setup

#### Server Configuration
```yaml
# VPS اقتصادي
- CPU: 2 vCPUs
- RAM: 4GB
- Storage: 40GB SSD
- Network: 1TB transfer
- التكلفة: ~20$ شهرياً
```

#### Simple Deployment
```bash
# NestJS Deployment بسيط
1. git clone repository
2. npm install
3. npm run build
4. pm2 start ecosystem.config.js
```

### 2️⃣ CI/CD Pipeline

#### Github Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && npm install && pm2 restart all'
```

### 3️⃣ Nginx Configuration
```nginx
# Simple Nginx config
server {
    listen 80;
    server_name api.delivery-app.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4️⃣ PM2 Process Management
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'delivery-api',
    script: 'dist/main.js', // NestJS main file
    instances: 1, // Single instance
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

---

## 🧪 Testing & Documentation

### 1️⃣ Testing Strategy

#### Unit Testing (Jest)
```typescript
// Basic unit tests
describe('Order Service', () => {
  it('should create order successfully', async () => {
    const orderData = { content: 'Test order' };
    const result = await orderService.create(orderData);
    expect(result).toBeDefined();
  });
});
```

#### API Testing (Supertest)
```typescript
// Basic API tests
describe('POST /api/orders', () => {
  it('should create order with valid data', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send(validOrderData)
      .expect(201);
  });
});
```

### 2️⃣ API Documentation (Swagger)

#### Swagger Configuration
```typescript
// NestJS Swagger setup
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Delivery App API')
  .setDescription('API documentation for delivery app')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

#### API Endpoints Documentation
- **GET /api/docs** - Swagger UI
- **JSON Schema** - للـ API validation
- **Interactive testing** - في Swagger UI

### 3️⃣ Basic Monitoring

#### Simple Logging
```typescript
// Basic logging
console.log('Order created:', orderId);
console.error('Error:', error.message);
```

#### Health Check
```typescript
// Simple health check
GET /health
// Response: { status: 'ok', timestamp: '2024-01-01T00:00:00Z' }
```

---

## 💰 التكلفة الشهرية المقدرة

### Infrastructure Costs
- **VPS**: 20$ شهرياً
- **Domain**: 1$ شهرياً
- **SSL Certificate**: مجاني (Let's Encrypt)
- **Total**: ~21$ شهرياً

### Development Costs
- **Developer**: 1 شخص (قتيبة)
- **Timeline**: 1-2 شهر
- **Total Development**: 0$ (إذا كان قتيبة يعمل مجاناً)

### External Services
- **OpenStreetMap**: مجاني
- **Socket.io**: مجاني
- **SMTP**: مجاني
- **Total External**: 0$ شهرياً

**إجمالي التكلفة الشهرية**: ~21$ فقط!

---
 