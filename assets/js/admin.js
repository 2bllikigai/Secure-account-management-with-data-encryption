// DOM Elements
const usersTableBody = document.getElementById('usersTableBody');
const userSearch = document.getElementById('userSearch');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.querySelector('.refresh-btn');
const logoutBtn = document.querySelector('.logout-btn');
const adminEmail = document.getElementById('adminEmail');
const userDetailModal = document.getElementById('userDetailModal');
const closeModal = document.querySelector('.close-modal');
const verifyAdminBtn = document.getElementById('verifyAdminBtn');
const adminPassword = document.getElementById('adminPassword');
const userDetailsSection = document.getElementById('userDetailsSection');
const authRequiredSection = document.getElementById('authRequiredSection');
const adminAvatar = document.querySelector('.admin-avatar');
// Current User
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// API Endpoints
const API_ENDPOINTS = {
  users: "https://685cc395769de2bf085dbff3.mockapi.io/users",
  logs: "https://685cc395769de2bf085dbff3.mockapi.io/logs"
};

// Decryption Keys
const key1Str = '123456789012345678901234';
const key2Str = '12345678901234567890123456789012';
const ivStr = '1234567890123456';
const key1 = CryptoJS.enc.Utf8.parse(key1Str);
const key2 = CryptoJS.enc.Utf8.parse(key2Str);
const iv = CryptoJS.enc.Utf8.parse(ivStr);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  adminEmail.textContent = currentUser.email;
  try {
    const response = await fetch(`${API_ENDPOINTS.users}/${currentUser.id}`);
    const adminData = await response.json();
    if (adminData.avt) {
      adminAvatar.src = adminData.avt;
    }
  } catch (err) {
    console.error('Không thể tải avatar quản trị:', err);
  }
  // Load initial user list
  await loadUsers();

  // Setup event listeners
  setupEventListeners();
});

// Load Users
async function loadUsers(searchQuery = '') {
  try {
    let url = API_ENDPOINTS.users;
    const response = await fetch(url);
    let users = await response.json();

    // Loại bỏ người dùng có role là admin
    users = users.filter(u => u.role !== 'admin');

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
      );
    }

    renderUserTable(users);
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Render User Table
function renderUserTable(users) {
  usersTableBody.innerHTML = users.map((user, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
      <td>
        <button class="view-btn" data-userid="${user.id}">
          <i class="fas fa-eye"></i> Xem chi tiết
        </button>
      </td>
    </tr>
  `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
  searchBtn.addEventListener('click', () => {
    loadUsers(userSearch.value.trim());
  });

  userSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadUsers(userSearch.value.trim());
    }
  });

  refreshBtn.addEventListener('click', () => {
    userSearch.value = '';
    loadUsers();
  });

  logoutBtn.addEventListener('click', () => {
    addLog(currentUser.id, 'logout');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  });

  closeModal.addEventListener('click', () => {
    userDetailModal.style.display = 'none';
  });

  verifyAdminBtn.addEventListener('click', async () => {
    const password = adminPassword.value;
    const userId = verifyAdminBtn.dataset.userid;

    if (!password) {
      alert('Vui lòng nhập mật khẩu quản trị');
      return;
    }

    if (password === 'admin123') {
      authRequiredSection.style.display = 'none';
      await showUserDetails(userId);
      userDetailsSection.style.display = 'block';

      await addLog(currentUser.id, 'admin_view', `user_${userId}`);
    } else {
      alert('Mật khẩu quản trị không đúng');
    }
  });

  document.addEventListener('click', async (e) => {
    if (e.target.closest('.view-btn')) {
      const button = e.target.closest('.view-btn');
      const userId = button.dataset.userid;
      verifyAdminBtn.dataset.userid = userId;
      userDetailModal.style.display = 'flex';
      authRequiredSection.style.display = 'block';
      userDetailsSection.style.display = 'none';
      adminPassword.value = '';
    }
  });
}

// Show User Details
async function showUserDetails(userId) {
  try {
    const response = await fetch(`${API_ENDPOINTS.users}/${userId}`);
    const user = await response.json();

    document.getElementById('detailFullName').textContent = user.name;
    document.getElementById('detailEmail').textContent = user.email;
    document.getElementById('detailCreatedAt').textContent = new Date(user.createdAt).toLocaleString('vi-VN');

    try {
      const decryptedId = CryptoJS.TripleDES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(user.idNumber) }, key1, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);

      const decryptedAddress = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(user.address) }, key2, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);

      const decryptedBank = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(user.bankAccount) }, key2, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);

      const decryptedBHXH = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(user.socialInsurance) }, key2, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);

      document.getElementById('detailIdNumber').textContent = decryptedId;
      document.getElementById('detailSocialInsurance').textContent = decryptedBHXH;
      document.getElementById('detailBankAccount').textContent = decryptedBank;
      document.getElementById('detailAddress').textContent = decryptedAddress;
    } catch (e) {
      document.getElementById('detailIdNumber').textContent = '[Không thể giải mã]';
      document.getElementById('detailSocialInsurance').textContent = '[Không thể giải mã]';
      document.getElementById('detailBankAccount').textContent = '[Không thể giải mã]';
      document.getElementById('detailAddress').textContent = '[Không thể giải mã]';
    }
  } catch (error) {
    console.error('Error loading user details:', error);
  }
}

// Add Log Entry
async function addLog(userId, action, detail = '') {
  try {
    await fetch(API_ENDPOINTS.logs, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        action,
        detail,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
