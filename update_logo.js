import fs from 'fs';
import path from 'path';

const srcLogo = 'C:\\Users\\hoang\\.gemini\\antigravity-ide\\brain\\96f160fb-5ff5-409e-86a9-0b92545e5c45\\suc_khoe_phu_khoa_logo_1786436537756.png';
const srcFavicon = 'C:\\Users\\hoang\\.gemini\\antigravity-ide\\brain\\96f160fb-5ff5-409e-86a9-0b92545e5c45\\favicon_lotus_1786436546662.png';

const destLogo = path.join(process.cwd(), 'assets', 'images', 'logo.png');
const destFavicon = path.join(process.cwd(), 'favicon.ico');

try {
    fs.copyFileSync(srcLogo, destLogo);
    console.log('✅ Đã cập nhật logo.png thành công!');
    
    fs.copyFileSync(srcFavicon, destFavicon);
    console.log('✅ Đã cập nhật favicon.ico thành công!');
} catch (error) {
    console.error('❌ Lỗi khi cập nhật:', error);
}
