# Group14-Project — User Manager

## Mô tả dự án

# Group14-Project

Phiên bản demo của hệ thống quản lý người dùng (User Management). Dự án bao gồm:
- Backend: REST API (Node.js + Express + Mongoose)
- Frontend: React (Vite) — giao diện quản trị, profile, xác thực và demo refresh token

Tài liệu này mô tả nhanh kiến trúc, cách chạy project trên máy, biến môi trường cần thiết và một số lưu ý vận hành.

---

## Nội dung chính

- Mục tiêu: minh họa một ứng dụng quản lý người dùng có đăng nhập, phân quyền (user / moderator / admin), refresh token flow và trang admin/logs.
- Công nghệ: Node.js, Express, MongoDB, Mongoose, React, Vite, Axios, Tailwind CSS (utility classes).

---
## Ảnh trang chính
![IMAGE](image.png)

## Video demo dự án
Bạn có thể xem video demo bằng cách bấm vào liên kết bên dưới (mở file video raw trong trình duyệt):

[▶️ Play demo video](https://raw.githubusercontent.com/NguyLeMinhTu/Group14-Project/main/demo.mp4)

Lưu ý: GitHub/Markdown không luôn hiển thị trình phát video trực tiếp trong `README.md` khi dùng cú pháp ảnh (`![]()`), nên tốt nhất là mở file raw hoặc host video trên YouTube để nhúng/preview dễ dàng.

## Cấu trúc dự án (tổng quan)

```
Group14-Project/
├─ Backend/                # API server (Express + Mongoose)
├─ Frontend/               # React app (Vite)
└─ README.md
```

Các thư mục con quan trọng:
- `Backend/controllers` — controller cho auth, user, logs
- `Backend/routes` — định nghĩa route /auth, /users, /logs, /profile
- `Backend/models` — Mongoose models (User, Log, RefreshToken)
- `Frontend/src/components` — các component React: AuthForm, Profile, AdminUserList, AdminLogs, DemoRefresh, ...

---

## Yêu cầu

- Node.js 16+ (khuyến nghị)
- npm hoặc pnpm
- MongoDB (local hoặc Atlas)

---

## Biến môi trường (Backend)

Tạo file `.env` trong thư mục `Backend/` với các biến tối thiểu sau:

```
MONGODB_URI=mongodb://localhost:27017/group14_db
PORT=3000
JWT_SECRET=some_jwt_secret
REFRESH_SECRET=some_refresh_secret
REFRESH_EXPIRES_DAYS=7
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

Ghi chú:
- `FRONTEND_ORIGIN` được dùng để cấu hình link reset password và có thể dùng cho cookie domain khi cần.

---

## API chính (tóm tắt)

Backend cung cấp các endpoint sau (đường dẫn tương đối tới `http://localhost:3000` theo mặc định):

- POST /auth/signup — đăng ký (trả access token và refreshToken trong dev)
- POST /auth/login — đăng nhập (trả access token; refresh token lưu ở cookie và/hoặc body trong dev)
- POST /auth/logout — đăng xuất (xóa refresh token server-side)
- POST /auth/refresh — đổi refresh token lấy access token mới
- POST /auth/forgot-password — gửi reset token (dev: trả token trong JSON để demo)
- POST /auth/reset-password — đặt lại mật khẩu (nhận token trong body hoặc params)

- GET /profile — lấy thông tin người dùng (protected)

- GET /users — danh sách users (admin/moderator tùy quyền)
- PUT /users/:id — chỉnh sửa user (admin)
- DELETE /users/:id — xóa user (admin)

- GET /logs — truy vấn logs (admin)

Xem chi tiết trong `Backend/controllers` và `Backend/routes`.

---

## Frontend — chức năng nổi bật

- Giao diện profile (read-only + modal edit)
- Trang Admin (user list, edit, delete)
- Trang Admin Logs (filter, search)
- Moderator panel (search users, view details)
- DemoRefresh — component để thử cơ chế refresh token (mô phỏng xóa token cục bộ, gọi /auth/refresh và quan sát event log)

Đường dẫn chính (frontend):
- `/login`, `/register`, `/forgot-password`, `/reset-password/:token`
- `/profile`
- `/admin`, `/admin/logs`
- `/moderator`
- `/demo-refresh`

---

## Seed dữ liệu (nếu có)

Nếu repo có script seed (ví dụ `Backend/seed/seedUsers.js`), bạn có thể chạy để tạo tài khoản admin/demo:

```powershell
Set-Location -Path D:\Group14-Project\Backend
node scripts/seedUsers.js    # hoặc `npm run seed` nếu có script trong package.json
```

---

## Lưu ý vận hành & debug nhanh

- Nếu trang reset password trả 404: kiểm tra route backend — backend dùng `POST /auth/reset-password` (token có thể nằm trong body). Trước đây frontend có gửi token trong đường dẫn; hiện đã khớp lại để gửi trong body.
- Nếu không thấy logs trong Admin Logs: đảm bảo bạn đăng nhập bằng tài khoản admin và frontend sử dụng shared `api` axios instance (cần có Authorization header). Kiểm tra Network → GET /logs và header Authorization.
- Vấn đề token/refresh: frontend có helper `src/lib/api.js` để lưu token, refresh tự động khi nhận 401 và dispatch custom events `auth:refresh:start|success|fail` mà `DemoRefresh` dùng để hiển thị.

---

## Troubleshooting phổ biến

- 500 / Mongoose connection error: kiểm tra `MONGODB_URI` và xem logs backend.
- 401 khi gọi protected endpoint: kiểm tra localStorage có `token` hay không, kiểm tra cookie `refreshToken` (nếu dùng cookie). Dùng `DemoRefresh` hoặc open DevTools → Application → Local Storage để xem.
- CORS: khi phát triển local, backend bật CORS cho tất cả origin; nếu vẫn có lỗi, kiểm tra `FRONTEND_ORIGIN` và cấu hình proxy (nếu dùng).

---

## Chạy project (Windows PowerShell)

1) Backend

```powershell
Set-Location -Path D:\Group14-Project\Backend
npm install
# Start server (the script name may vary, check Backend/package.json)
npm run dev    # hoặc `node server.js` / `npm run server` nếu có
```

2) Frontend

```powershell
Set-Location -Path D:\Group14-Project\Frontend
npm install
npm run dev
# Vite mặc định phục vụ tại http://localhost:5173
```

Sau khi cả hai server chạy, mở trình duyệt tới `http://localhost:5173`.

---

## Đóng góp

- Nguyen Le Minh Tu (Backend + support Frontend + check báo cáo)
- Tran Nhut Quang (Database + Viết báo cáo)
- Phan Tan Loc (Frontend + Test Api & PostMan)
- `Viết mô tả rõ ràng, steps để reproduce, và test locally trước khi PR`

---


Cám ơn!
