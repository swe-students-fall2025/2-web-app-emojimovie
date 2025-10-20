(function () {
  const form = document.querySelector('form[action*="login"]');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  if (!form || !usernameInput || !passwordInput) return;

  const clearError = () => {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  };

  const showError = (message) => {
    clearError();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    form.parentNode.insertBefore(errorDiv, form);
  };

  const validateForm = () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
      showError('Please fill in all fields');
      return false;
    }
    return true;
  };

  form.addEventListener('submit', (e) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  });

  // Clear error when user types
  usernameInput.addEventListener('input', clearError);
  passwordInput.addEventListener('input', clearError);

  // Enter key support
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      form.submit();
    }
  });

})();
