(function () {
  const form = document.querySelector('form[action*="register"]');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (!form || !usernameInput || !emailInput || !passwordInput ) return;

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
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !email || !password ) {
      showError('Please fill in all fields');
      return false;
    }
    
    if (!email.includes('@')) {
      showError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  form.addEventListener('submit', (e) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  });

  usernameInput.addEventListener('input', clearError);
  emailInput.addEventListener('input', clearError);
  passwordInput.addEventListener('input', clearError);
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      form.submit();
    }
  });

})();
