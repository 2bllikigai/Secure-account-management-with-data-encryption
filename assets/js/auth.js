// API Configuration
const API_BASE_URL = "https://685cc395769de2bf085dbff3.mockapi.io";
const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  logs: `${API_BASE_URL}/logs`
};

// DOM Elements
const registerForm = document.getElementById('registerForm');
const notification = document.getElementById('notification');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
});

// Registration Function
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const idNumber = document.getElementById('idNumber').value.trim();
  const socialInsurance = document.getElementById('socialInsurance').value.trim();
  const bankAccount = document.getElementById('bankAccount').value.trim();
  const address = document.getElementById('address').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const avatar = document.getElementById('avatar') ? document.getElementById('avatar').value.trim() : "";

  if (password !== confirmPassword) {
    showNotification('Mật khẩu không khớp', 'error');
    return;
  }

try {
  let existingUsers = [];
  const encodedEmail = encodeURIComponent(email);
  const resCheck = await fetch(`${API_ENDPOINTS.users}?email=${encodedEmail}`);
  console.log("Checking email at:", `${API_ENDPOINTS.users}?email=${encodedEmail}`);

  if (resCheck.ok) {
    existingUsers = await resCheck.json();
  } else {
    console.warn("Không thể kiểm tra email: server trả về", resCheck.status);
  }

  if (existingUsers.length > 0) {
    showNotification('Email đã được sử dụng', 'error');
    return;
  }



//     Mã hóa dữ liệu nhạy cảm
// KHÓA ĐÚNG ĐỊNH DẠNG
// Thay toàn bộ phần mã hóa bằng đoạn này

// Tạo khóa đúng định dạng
// Tạo khóa và iv cố định
const key1Str = '123456789012345678901234';
const key2Str = '12345678901234567890123456789012';
const ivStr = '1234567890123456';

const key1 = CryptoJS.enc.Utf8.parse(key1Str);
const key2 = CryptoJS.enc.Utf8.parse(key2Str);
const iv = CryptoJS.enc.Utf8.parse(ivStr);

// Kiểm tra đầu vào
if (!idNumber || !address || !bankAccount || !socialInsurance) {
  showNotification("Vui lòng nhập đầy đủ thông tin", "error");
  return;
}

// Mã hóa
const cmndEnc = CryptoJS.TripleDES.encrypt(idNumber, key1, {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7
}).toString();

const diachiEnc = CryptoJS.AES.encrypt(address, key2, {
  iv: iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}).toString();

const stkEnc = CryptoJS.AES.encrypt(bankAccount, key2, {
  iv: iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}).toString();

const bhxhEnc = CryptoJS.AES.encrypt(socialInsurance, key2, {
  iv: iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}).toString();

// Kết thúc mã hóa dữ liệu
    const hashedPassword = hashPassword(password);

    const newUser = {
      name: fullName,
      idNumber: cmndEnc,
      socialInsurance: bhxhEnc,
      bankAccount: stkEnc,
      address: diachiEnc,
      email,  
      password: hashedPassword,
      role: 'user',
      avt: avatar,
      createdAt: new Date().toISOString()
    };

    const response = await fetch(API_ENDPOINTS.users, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    if (!response.ok) {
      throw new Error(`Lỗi từ server: ${response.status}`);
    }

    const createdUser = await response.json();
    await addLog(createdUser.id, 'register');

    showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
    setTimeout(() => window.location.href = 'index.html', 2000);
  } catch (error) {
    console.error('Registration error:', error);
    showNotification('Đăng ký thất bại', 'error');
  }
});

// Helper Functions
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

async function addLog(userId, action, infoType = null) {
  try {
    await fetch(API_ENDPOINTS.logs, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        infoType,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error adding log:', error);
  }
}

function showNotification(message, type) {
  if (!notification) return;
  notification.textContent = message;
  notification.className = `auth-notification show ${type}`;
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}