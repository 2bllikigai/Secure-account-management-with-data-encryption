// dashboard.js
import { 
  decryptTripleDES, 
  decryptAES 
} from './encryption.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return window.location.href = 'index.html';

  // Hiển thị thông tin cơ bản
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;

  // Xử lý nút hiển thị thông tin nhạy cảm
  document.querySelectorAll('.reveal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const infoType = this.dataset.type;
      const displayElement = this.previousElementSibling;
      
      let decryptedData = '';
      try {
        switch(infoType) {
          case 'cmnd':
            decryptedData = decryptTripleDES(user.encryptedData.idNumber);
            break;
          case 'socialInsurance':
            decryptedData = decryptAES(user.encryptedData.socialInsurance);
            break;
          case 'bank':
            decryptedData = decryptAES(user.encryptedData.bankAccount);
            break;
          case 'address':
            decryptedData = decryptAES(user.encryptedData.address);
            break;
        }
        displayElement.textContent = decryptedData;
        this.style.display = 'none';
        addLog(user.id, 'view_info', infoType);
      } catch (error) {
        console.error('Decryption error:', error);
        displayElement.textContent = 'Lỗi giải mã';
      }
    });
  });
});