const form = document.getElementById('editListingForm');
const photoInput = document.getElementById('photo');
const previewImg = document.getElementById('preview');
const message = document.getElementById('message');

let base64Image = "";
let photoName = "";
let photoType = "";

const listingId = new URLSearchParams(window.location.search).get('id');

window.addEventListener('DOMContentLoaded', async () => {
    if (!listingId) {
        message.style.color = 'red';
        message.textContent = 'No listing ID provided.';
        return;
    }

    try {
        const res = await fetch(`/listings/api/${listingId}`, {
            method: 'GET',
            credentials: 'same-origin'
        });

        if (!res.ok) {
            throw new Error(`Failed to load listing: ${res.status}`);
        }

        const listing = await res.json();
        
        form.itemName.value = listing.itemName || '';
        form.description.value = listing.description || '';
        form.size.value = listing.size || '';
        form.price.value = listing.price || '';

        if (listing.photo && listing.photo.url) {
            previewImg.src = listing.photo.url;
            previewImg.style.display = 'block';
        }
    } catch (err) {
        console.error('Error loading listing:', err);
        message.style.color = 'red';
        message.textContent = 'Error loading listing data.';
    }
});

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
    };

    if (base64Image) {
        payload.photo = {
            name: photoName,
            content_type: photoType,
            data_url: base64Image
        };
    }

    try {
        const res = await fetch(`/listings/api/${listingId}`, {
            method: 'PUT',
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
        message.textContent = data.message || 'Listing updated successfully!';
        
        base64Image = "";
        photoName = "";
        photoType = "";
        photoInput.value = "";
    } catch (err) {
        console.error('Error updating listing:', err);
        message.style.color = 'red';
        message.textContent = 'Error updating listing.';
    }
});
