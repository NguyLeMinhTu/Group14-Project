# Buổi 5 – Ứng dụng hoàn chỉnh cơ bản với Authentication & User Management

## ✅ Trạng thái thực hiện
- Hoạt động 1 (Authentication): Done
- Hoạt động 2 (Profile - View/Update): Done
- Hoạt động 3 (User Management - Admin): Done

Các file backend đã được triển khai / cập nhật liên quan:
- `Backend/controllers/authController.js` (signup/login/logout)
- `Backend/routes/auth.js`
- `Backend/models/user.js` (thêm `avatar`, `updatedAt`)
- `Backend/controllers/userController.js` (getProfile, updateProfile, getUsers, updateUser, deleteUser)
- `Backend/routes/profile.js`
- `Backend/routes/user.js` (bảo vệ route, admin-only)
- `Backend/middleware/auth.js` (token -> req.user)
- `Backend/middleware/role.js` (requireRole middleware)


## 🎯 Mục tiêu
- Sinh viên thực hành xây dựng ứng dụng web hoàn chỉnh với Authentication & User Management.
- Sử dụng Node.js (backend), MongoDB (database), React (frontend).
- Tích hợp Git workflow: phân chia nhánh, commit, pull request.
- Thực hành teamwork như môi trường công ty.

## 👥 Phân công
- Sinh viên 1 – Backend: Xây dựng API (auth + user management).
- Sinh viên 2 – Frontend: Xây dựng giao diện React, gọi API.
- Sinh viên 3 – Database + Git Manager: Tạo schema, kết nối DB, kiểm thử dữ liệu, quản lý merge.

## 🛠 Các chức năng yêu cầu
1. Đăng ký (Sign Up) – tạo tài khoản, kiểm tra email trùng, mã hóa mật khẩu bằng bcrypt.
2. Đăng nhập (Login) – kiểm tra email/password, trả về JWT token.
3. Đăng xuất (Logout) – xóa token phía client.
4. Cập nhật thông tin cá nhân (Update Profile) – sửa name, avatar, password.
5. Xem thông tin cá nhân (View Profile) – lấy thông tin user sau đăng nhập.
6. Danh sách người dùng (User List – chỉ Admin).
7. Xóa tài khoản (Delete User – Admin hoặc tự xóa).
8. Phân quyền (RBAC) – User thường và Admin.
9. Quên mật khẩu (Forgot Password) – gửi token reset, đổi mật khẩu.
10. Ảnh đại diện (Avatar Upload) – lưu link ảnh, dùng Cloudinary hoặc dịch vụ tương tự.

## 📌 Luồng Git
1. Sử dụng repo GitHub ở buổi 4.
2. Các nhánh công việc:
   - `backend-auth` → API Authentication.
   - `backend-admin` → API quản lý user cho Admin.
   - `frontend-auth` → Form đăng ký, đăng nhập.
   - `frontend-profile` → Giao diện profile.
   - `database-auth` → Schema User + role.
3. Commit + Push vào nhánh riêng → Pull Request → Merge vào main.

## 📑 Sản phẩm nộp
- Repo GitHub với nhánh main ổn định.
- Video demo các chức năng chính: Sign Up, Login, Update Profile.
- Ảnh chụp Postman test API + giao diện React.
- File README.md hướng dẫn cài đặt và chạy project.

## Hoạt động 1: Authentication cơ bản
### Chức năng
- Đăng ký (Sign Up) – kiểm tra email trùng, mã hóa mật khẩu (bcrypt).
- Đăng nhập (Login) – xác thực email/password, trả về JWT token.
- Đăng xuất (Logout) – xóa token phía client.

### Phân công
- Sinh viên 1: API `/signup`, `/login`, `/logout`.
- Sinh viên 2: Form đăng ký, đăng nhập React, lưu token.
- Sinh viên 3: Schema User + role, test Postman.

### Screenshot yêu cầu
- Form đăng ký + thông báo kết quả.
- Form đăng nhập + JWT token.
- Postman test API `/signup`, `/login`, `/logout`.

## Hoạt động 2: Quản lý thông tin cá nhân
### Chức năng
- Cập nhật thông tin cá nhân (Update Profile).
- Xem thông tin cá nhân (View Profile).

### Phân công
- Sinh viên 1: API `/profile` (GET, PUT).
- Sinh viên 2: Trang Profile (React).
- Sinh viên 3: Kiểm thử DB, merge nhánh `frontend-profile`.

### Screenshot yêu cầu
- Trang Profile hiển thị user info.
- Form cập nhật thông tin.
- Postman test API `/profile` (GET, PUT).

## Hoạt động 3: Quản lý User (Admin)
### Chức năng
- Danh sách người dùng (User List – Admin).
- Xóa tài khoản (Delete User – Admin hoặc tự xóa).
- Phân quyền (RBAC: User, Admin).

### Phân công
- Sinh viên 1: API `/users` (GET, DELETE), middleware RBAC.
- Sinh viên 2: Giao diện Admin: danh sách user, nút xóa.
- Sinh viên 3: Kiểm thử role, merge `backend-admin`.

### Screenshot yêu cầu
- Trang Admin hiển thị danh sách user.
- Chức năng xóa user hoạt động.
- Postman test API `/users` với quyền Admin.

## Hoạt động 4: Tính năng nâng cao
### Chức năng
- Quên mật khẩu (Forgot Password) – gửi token reset.
- Đổi mật khẩu với token reset.
- Upload Avatar (Cloudinary).

### Phân công
- Sinh viên 1: API `/forgot-password`, `/reset-password`, `/upload-avatar`.
- Sinh viên 2: Form Forgot Password + Upload Avatar UI.
- Sinh viên 3: Tích hợp DB với Cloudinary, test reset password.

### Screenshot yêu cầu
- Form Forgot Password + email nhận token.
- Giao diện đổi mật khẩu bằng token reset.
- Upload Avatar: chọn ảnh + cập nhật thành công.
- Postman test API `/forgot-password`, `/reset-password`, `/upload-avatar`.

## Hoạt động 5: Git Workflow & Tích hợp
### Công việc
- Quản lý nhánh GitHub (`backend-auth`, `backend-admin`, `frontend-auth`, `frontend-profile`, `database-auth`).
- Commit, push, Pull Request, merge vào main.

### Phân công
- Sinh viên 1: Quản lý nhánh backend.
- Sinh viên 2: Quản lý nhánh frontend.
- Sinh viên 3: Quản lý Pull Request, review, merge.

### Screenshot yêu cầu
- Các nhánh GitHub hiển thị rõ ràng.
- Pull Request + Merge thành công vào main.
- Lịch sử commit rõ ràng.

## Hướng dẫn cài đặt và chạy project
1. Clone repo từ GitHub.
2. Cài đặt dependencies:
   - Backend: `npm install`.
   - Frontend: `npm install`.
3. Cấu hình MongoDB và Cloudinary.
4. Chạy project:
   - Backend: `npm start`.
   - Frontend: `npm start`.