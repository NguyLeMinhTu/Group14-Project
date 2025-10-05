# Group14-Project — User Manager

## Mô tả dự án

Ứng dụng nhỏ để quản lý người dùng (CRUD):
- Tạo (Create) user với tên và email
- Đọc (Read) danh sách user
- Cập nhật (Update) thông tin user
- Xóa (Delete) user

Ứng dụng gồm Backend (API REST) kết nối MongoDB và Frontend React (Vite) giao diện quản lý.

## Ảnh demo

![App screenshot](image.png)

## Tính năng

- Danh sách users
- Thêm user mới
- Sửa user (PUT /users/:id)
- Xóa user (DELETE /users/:id)
- Giao diện responsive đơn giản

## Kiến trúc & Công nghệ

- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Frontend: React, Vite
- HTTP client (frontend): Axios
- CORS middleware

## Cấu trúc thư mục (tổng quan)

```
Group14-Project/
├─ Backend/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ server.js
│  └─ package.json
├─ Frontend/
│  ├─ public/
│  ├─ src/
│  └─ package.json
└─ README.md
```

## Yêu cầu

- Node.js 14+ (khuyến nghị 16+)
- MongoDB (local hoặc Atlas)

## Cài đặt & chạy (local)

1) Backend

```powershell
cd D:\Group14-Project\Backend
npm install
# Tạo file .env (ví dụ bên dưới)
# Chạy server
npm run server    # nếu có script `server` trong package.json
# hoặc
node server.js
```

2) Frontend

```powershell
cd D:\Group14-Project\Frontend
npm install
npm run dev
# Mở địa chỉ Vite in ra (mặc định http://localhost:5173)
```

### Ví dụ file `.env` cho Backend

```
MONGODB_URI=mongodb://localhost:27017/group14_db
PORT=3000
```

## API endpoints chính

- GET /users — lấy danh sách users
- POST /users — tạo user mới { name, email }
- PUT /users/:id — cập nhật user
- DELETE /users/:id — xóa user

Ví dụ cURL (thêm user):

```bash
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Nguyen","email":"nguyen@example.com"}'
```

## Đóng góp — từng thành viên

Vui lòng cập nhật phần này theo thực tế của nhóm. Dưới đây là mẫu — sửa tên và mô tả công việc cho đúng.

| Thành viên | Vai trò / Đóng góp |
|---|---|
| Nguy Le Minh Tu | Backend (API, MongoDB) |
| Tran Nhut Quang | Database (UI, styles) |
| Phan Tan Loc | Kiểm thử, tài liệu |

Bạn có thể chỉnh sửa file này trực tiếp để ghi lại đóng góp chính xác.

## Hướng dẫn đóng góp (pull request)

1. Fork repo (nếu cần) và tạo branch riêng theo feature: `git checkout -b feature/ten-feature`
2. Viết code, chạy lint/tests (nếu có)
3. Tạo PR vào branch `main` hoặc branch mà nhóm thống nhất

## Một số lưu ý vận hành

- Kiểm tra biến môi trường `MONGODB_URI` trước khi chạy backend
- Nếu gặp lỗi CORS, đảm bảo backend đang bật CORS (backend đã set `cors({ origin: '*' })` trong mã nguồn)
