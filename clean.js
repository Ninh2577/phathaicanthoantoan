const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const backupPath = path.join(__dirname, 'dist_backup');

function forceDeleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`[SUCCESS] Đã xóa ${dirPath}`);
    } catch (e) {
      console.error(`[ERROR] Không thể xóa ${dirPath}. Hãy chắc chắn bạn đã tắt server.`);
      console.error(e.message);
    }
  } else {
    console.log(`[INFO] ${dirPath} không tồn tại.`);
  }
}

console.log("Đang dọn dẹp các thư mục build cũ...");
forceDeleteDir(distPath);
forceDeleteDir(backupPath);
console.log("Hoàn tất! Bạn có thể chạy 'node build.js' ngay bây giờ.");
