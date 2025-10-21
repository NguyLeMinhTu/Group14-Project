```markdown
# Buổi 6 – Nâng cao: Hệ thống User Management bảo mật & tính năng mở rộng

**Môn học:** Lập trình Full-stack (Node.js + React)  
**Chủ đề:** Xây dựng hệ thống quản lý người dùng nâng cao với bảo mật, phân quyền, upload ảnh, email reset mật khẩu, logging, rate limiting và triển khai thực tế.

---

## Mục tiêu dự án

Xây dựng một ứng dụng **User Management System** đầy đủ với các tính năng nâng cao:

- Xác thực JWT + Refresh Token
- Phân quyền RBAC (User, Moderator, Admin)
- Upload avatar với resize & lưu trên Cloudinary
- Quên mật khẩu & reset bằng email thật (Nodemailer + Gmail)
- Ghi log hoạt động người dùng
- Chống brute-force bằng Rate Limiting
- Quản lý state bằng Redux + Protected Routes
- Triển khai online: **Frontend (Vercel)** + **Backend (Render/Railway)** + **MongoDB Atlas**

---

## Phân công nhóm

| Vai trò | Nhiệm vụ |
|-------|--------|
| **SV1 – Backend Advanced** | API nâng cao (Refresh Token, middleware, logging, rate limit) |
| **SV2 – Frontend Advanced** | React + Redux, Protected Routes, gọi API nâng cao |
| **SV3 – Database & Integration** | MongoDB schema nâng cao, Cloudinary, Nodemailer, tối ưu DB, test API |

---

## Tính năng triển khai

### 1. Refresh Token & Session Management
- JWT Access Token (ngắn hạn) + Refresh Token (dài hạn)
- API: `POST /auth/refresh`
- Middleware xác thực Access Token
- Lưu Refresh Token trong DB
- Frontend tự động refresh token khi hết hạn
- Revoke token khi logout

### 2. Advanced RBAC (Role-Based Access Control)
- Role: `User`, `Moderator`, `Admin`
- Middleware `checkRole(role)`
- API quản lý user theo role
- Frontend hiển thị chức năng riêng theo role

### 3. Upload Avatar (Cloudinary + Sharp)
- API: `POST /users/avatar`
- Dùng Multer + Sharp (resize ảnh)
- Lưu URL ảnh vào MongoDB
- Frontend: form upload + preview avatar

### 4. Forgot & Reset Password (Email thật)
- API: `POST /auth/forgot-password`, `PATCH /auth/reset-password/:token`
- Gửi email reset qua **Gmail SMTP** (Nodemailer)
- Token có thời hạn
- Frontend: form nhập email → nhận link → đổi mật khẩu

### 5. User Activity Logging & Rate Limiting
- Middleware ghi log: `userId`, `action`, `timestamp`
- Collection `logs` trong MongoDB
- Rate limit đăng nhập (chống brute-force)
- Admin xem lịch sử hoạt động

### 6. Redux & Protected Routes
- Redux Toolkit quản lý state `auth`
- Protected Routes: `/profile`, `/admin`
- Redux Thunk gọi API async
- Lưu token & user info trong Redux store

---

## Cấu trúc thư mục

```
/client          → React Frontend
/server          → Node.js + Express Backend
├── /routes
├── /controllers
├── /middleware
├── /models
├── /utils
└── .env
```

---

## Công nghệ sử dụng

| Layer | Công nghệ |
|------|----------|
| **Frontend** | React, Redux Toolkit, React Router, Axios |
| **Backend,  | Node.js, Express, JWT, Multer, Sharp |
| **Database** | MongoDB (Mongoose) |
| **Cloud** | Cloudinary (ảnh), Nodemailer (email) |
| **Deploy** | Vercel (FE), Render/Railway (BE), MongoDB Atlas |

---

## Hướng dẫn chạy local

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Cấu hình .env: MONGODB_URI, JWT_SECRET, CLOUDINARY_URL, GMAIL_USER, GMAIL_PASS
npm start
```
→ Server chạy tại: `http://localhost:5000`

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
# Cấu hình: REACT_APP_API_URL=http://localhost:5000
npm start
```
→ App chạy tại: `http://localhost:3000`

---

## Biến môi trường (.env)

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_URL=cloudinary://...
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
```

### Frontend (`client/.env`)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## Triển khai (Deployment)

### 1. Frontend → **Vercel**
```bash
git push client đến GitHub (thư mục client)
```
→ Vào [vercel.com](https://vercel.com) → Import Project  
Cấu hình:
- Framework: React
- Root: `client/`
- Output: `build/`
- Env: `REACT_APP_API_URL`

**Link:** `https://your-project.vercel.app`

---

### 2. Backend → **Render** hoặc **Railway**

#### Render
```bash
git push server đến GitHub (thư mục server)
```
→ [render.com](https://render.com) → New Web Service  
Cấu hình:
- Environment: Node
- Build: `npm install`
- Start: `npm start`
- Env: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_URL`, ...

**Link:** `https://your-backend.onrender.com`

#### Railway
→ Tự động detect Node.js, thêm env tương tự.

---

### 3. Database → **MongoDB Atlas**
→ Tạo cluster tại [cloud.mongodb.com](https://cloud.mongodb.com)  
→ Lấy `MONGODB_URI` → thêm vào Render/Railway

---

## Kết quả demo

- **Frontend:** [https://your-project.vercel.app](https://your-project.vercel.app)
- **Backend:** [https://your-backend.onrender.com](https://your-backend.onrender.com)
- **API Docs:** Test bằng Postman (xem ảnh trong PR)
- **Video demo:** Xem trong thư mục `/demo`

---

## Sản phẩm nộp (GitHub)

| Hoạt động | PR Link |
|---------|-------|
| Refresh Token | `feature/refresh-token` |
| RBAC | `feature/rbac` |
| Upload Avatar | `feature/avatar-upload` |
| Forgot Password | `feature/forgot-password` |
| Logging & Rate Limit | `feature/log-rate-limit` |
| Redux & Protected Routes | `feature/redux-protected` |

Tất cả đã **merge vào `main`**

---

## Đóng góp

Mở issue hoặc tạo PR vào nhánh `develop`  
Liên hệ: [email nhóm]

---

**Dự án hoàn thiện – Đã triển khai online – Sẵn sàng demo!**
```