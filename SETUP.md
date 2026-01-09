# Hướng Dẫn Cài Đặt và Chạy Dự Án Tutor Platform

Tài liệu này hướng dẫn cách thiết lập dự án trên máy mới.

## 1. Yêu Cầu Hệ Thống
Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:
- **Node.js**: (Khuyên dùng v18 trở lên). Kiểm tra bằng lệnh `node -v`.
- **MongoDB**: Đã cài đặt và đang chạy (MongoDB Compass hoặc Service).
- **Git**: Để clone code về.

## 2. Cài Đặt
Mở terminal tại thư mục chứa dự án.

### 2.1. Clone Code (Nếu chưa có)
```bash
git clone <LINK_GITHUB_CUA_BAN>
cd TutorPlatform
```

### 2.2. Cài đặt thư viện (Dependencies)
Dự án gồm 2 phần: Server (Backend) và Client (Frontend). Cần cài đặt cho cả hai.

**Tại thư mục gốc:**
```bash
# Cài đặt cho Server
cd server
npm install

# Quay lại thư mục gốc và cài đặt cho Client
cd ../client
npm install
```

## 3. Cấu Hình Môi Trường (.env)
Bạn cần tạo file `.env` trong thư mục `server`.
1. Vào thư mục `server`.
2. Tạo file tên là `.env`.
3. Copy nội dung sau vào file `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tutor-platform
JWT_SECRET=secret_key_nay_rat_bao_mat_@123
```
*(Lưu ý: Nếu bạn dùng MongoDB Atlas, hãy thay `MONGODB_URI` bằng connection string của bạn)*

## 4. Khởi Tạo Dữ Liệu Mẫu (Database Seeding)
Để có sẵn danh sách gia sư và người dùng test, hãy chạy lệnh seed.

```bash
cd server
npm run seed
```
Khi thấy thông báo "Data Imported!" là thành công.

Tài khoản Test có sẵn sau khi seed:
- **Học sinh**: `hocsinh@test.com` / `123456`
- **Gia sư**: `giasu1@test.com` / `123456`

## 5. Chạy Dự Án
Bạn cần chạy cả Backend và Frontend (khuyên dùng 2 terminal riêng biệt).

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
-> Server chạy tại `http://localhost:5000`

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
-> Web chạy tại `http://localhost:5173`

---
## Các Lỗi Thường Gặp
- **Error: connect ECONNREFUSED 127.0.0.1:27017**: Chưa bật MongoDB. Hãy bật MongoDB Compass hoặc chạy service MongoDB.
- **Error: EADDRINUSE :::5000**: Port 5000 đang bị chiếm. Hãy tắt ứng dụng đang chạy port đó hoặc đổi PORT trong `.env`.
