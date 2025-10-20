const form = document.getElementById('createListingForm');
const photoInput = document.getElementById('photo');
const previewImg = document.getElementById('preview');
const message = document.getElementById('message');


let base64Image = "";
let photoName = "";
let photoType = "";

photoInput.addEventListener('change', () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;

  photoName = file.name || "";
  photoType = file.type || "";

  const reader = new FileReader();
  reader.onload = e => {
    base64Image = e.target.result;
    previewImg.src = base64Image;
    previewImg.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.textContent = '';

  const payload = {
    itemName: (form.itemName?.value || '').trim(),
    description: (form.description?.value || '').trim(),
    size: (form.size?.value || '').trim(),
    price: (form.price?.value || '').trim(),
    photo: base64Image ? { name: photoName, content_type: photoType, data_url: base64Image } : null
  };

  try {
    const res = await fetch('/listings/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }

    const data = await res.json();
    message.style.color = 'green';
    message.textContent = data.message || 'Listing created successfully!';
    form.reset();
    previewImg.removeAttribute('src');
    previewImg.style.display = 'none';
    base64Image = ""; photoName = ""; photoType = "";
  } catch (err) {
    console.error('Error posting listing:', err);
    message.style.color = 'red';
    message.textContent = 'Error posting listing.';
  }
});
