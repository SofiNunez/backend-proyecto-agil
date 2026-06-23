# Plataforma de Notificaciones Multicanal

Servicio transversal para envío y seguimiento de notificaciones por **email**, **SMS** y **push** con alta disponibilidad, fallback automático entre proveedores y tracking de estados en tiempo real.

---

## Características

- **Email** — SendGrid (principal) → Amazon SES (fallback)
- **SMS** — Twilio → Vonage (fallback)
- **Push** — Firebase Cloud Messaging (FCM)
- **Fallback automático** entre canales y proveedores
- **Tracking** de estados: `pending` → `sent` → `delivered` / `failed`
- **Autenticación** por API Key por proyecto
- **Rate limiting** y cola con backpressure
- **Reintentos automáticos** con backoff exponencial

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Lenguaje | TypeScript |
| Framework | Express.js |
| Email | SendGrid + Amazon SES |
| SMS | Twilio + Vonage |
| Push | Firebase Cloud Messaging |
| IDs únicos | UUID v4 |

---

## Estructura del Proyecto

```
src/
├── index.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── rate-limit.middleware.ts
├── queue/
│   └── notification.queue.ts
└── modules/
    ├── notifications/
    │   ├── controller.ts
    │   ├── service.ts
    │   ├── notifications.types.ts
    │   └── channels/
    │       ├── email/
    │       │   ├── email.channel.ts
    │       │   ├── email.types.ts
    │       │   └── providers/
    │       │       ├── sendgrid.provider.ts
    │       │       └── ses.provider.ts
    │       ├── sms/
    │       │   ├── sms.channel.ts
    │       │   ├── sms.types.ts
    │       │   └── providers/
    │       │       ├── twilio.provider.ts
    │       │       └── vonage.provider.ts
    │       └── push/
    │           ├── push.channel.ts
    │           ├── push.types.ts
    │           └── providers/
    │               └── fcm.provider.ts
    └── tracking/
        ├── controller.ts
        ├── service.ts
        ├── tracking.repository.ts
        └── tracking.types.ts
```

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/SofiNunez/backend-proyecto-gil.git
cd backend-proyecto
```

### 2. Instalar dependencias

```bash
npm install
```
### 4. Iniciar el servidor

```bash
npm run dev

```
El servidor corre en `http://localhost:3000`

---

## Endpoints

### Enviar notificación

```
POST /notifications/send
```

**Headers:**
```
x-api-key: tu-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "channel": "email",
  "recipient": {
    "email": "destino@gmail.com",
    "telefono": "+56912345678",
    "deviceToken": "token-del-dispositivo"
  },
  "subject": "Asunto del mensaje",
  "body": {
    "email": "<h1>Hola!</h1><p>Este es el mensaje</p>",
    "sms": "Este es el mensaje por SMS",
    "push": {
      "title": "Título de la notificación",
      "body": "Cuerpo de la notificación"
    }
  }
}
```

**Respuesta exitosa (`202`):**
```json
{
  "jobId": "uuid-del-job",
  "notificationId": "uuid-de-la-notificacion",
  "message": "Notificación en cola",
  "tracking": "/tracking/uuid-de-la-notificacion"
}
```

---

### Consultar estado de una notificación

```
GET /tracking/:notificationId
```

**Headers:**
```
x-api-key: tu-api-key
```

**Respuesta:**
```json
{
  "notificationId": "uuid-de-la-notificacion",
  "channel": "email",
  "provider": "sendgrid",
  "status": "sent",
  "recipient": "destino@gmail.com",
  "attempts": 1,
  "createdAt": "2026-06-22T00:00:00.000Z",
  "statusHistory": [
    { "status": "pending", "timestamp": "2026-06-22T00:00:00.000Z" },
    { "status": "sent",    "timestamp": "2026-06-22T00:00:01.000Z" }
  ]
}
```

---

### Ver estado de la cola

```
GET /notifications/queue/status
```

**Respuesta:**
```json
{
  "enCola": 3,
  "procesando": 1,
  "capacidadMaxima": 100
}
```

---

## Flujo de fallback

```
Email falla  →  SMS
SMS falla    →  (registra como failed)
Push falla   →  Email → SMS
```

El sistema reintenta automáticamente hasta 3 veces con backoff exponencial antes de marcar la notificación como `failed`.

---

## Seguridad

- Cada proyecto tiene su propia API Key
- Rate limiting: máximo **20 requests por minuto** por IP
- Cola con backpressure: máximo **1000 jobs** en cola simultáneamente

---

## Patrones de diseño utilizados

| Patrón | Dónde se aplica |
|---|---|
| **Singleton** | `NotificationsService`, `TrackingService` |
| **Strategy** | Proveedores de email, SMS y push |
| **Repository** | `TrackingRepository` |
| **Facade** | `NotificationsService` como punto de entrada único |
| **Chain of Responsibility** | Fallback entre proveedores |

---

## Estados de tracking

| Estado | Descripción |
|---|---|
| `pending` | Notificación recibida, en cola |
| `sent` | Enviada al proveedor exitosamente |
| `delivered` | Confirmada como entregada (vía webhook) |
| `failed` | Todos los proveedores fallaron |
