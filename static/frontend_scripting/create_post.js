// /static/frontend_scripting/create_post.js
const form = document.getElementById('createListingForm');
const photoInput = document.getElementById('photo');
const previewImg = document.getElementById('preview');
const message = document.getElementById('message');

photoInput.addEventListener('change', () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    previewImg.style.display = 'block'; // show once an image is selected
  };
  reader.readAsDataURL(file);
});


form.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.textContent = '';

  // Collect and clean form data
  const formData = new FormData(form);
  const jsonData = {};

  for (const [key, value] of formData.entries()) {
    // Trim whitespace for strings
    if (typeof value === 'string') {
      jsonData[key] = value.trim();
    } else {
      jsonData[key] = value;
    }
  }

  try {
    const res = await fetch('/listings/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData)
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    message.style.color = 'green';
    message.textContent = data.message || 'Listing created successfully!';
    form.reset();
    previewImg.src = '';
    previewImg.style.display = 'none';

  } catch (err) {
    console.error('Error posting listing:', err);
    message.style.color = 'red';
    message.textContent = 'Error posting listing.';
  }
});

