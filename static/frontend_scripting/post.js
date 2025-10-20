const listingId = new URLSearchParams(window.location.search).get('id');

const container = document.getElementById('listing-container');
const message = document.getElementById('message');
const submitBidBtn = document.getElementById('submit-bid-btn');
const bidPriceDiv = document.getElementById('bid-price');
const bidForm = document.getElementById('bid-form');
const cancelBidBtn = document.getElementById('cancel-bid-btn');

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
        displayListing(listing);

    } catch (err) {
        console.error('Error loading listing:', err);
        message.style.color = 'red';
        message.textContent = 'Error loading listing.';
        container.innerHTML = '<p>Could not load listing.</p>';
    }
});

function displayListing(listing) {
    const photoHtml = listing.photo && listing.photo.url 
        ? `<img src="${listing.photo.url}" alt="${listing.itemName}" style="max-width: 400px; height: auto;">`
        : '<p>No photo available</p>';

    container.innerHTML = `
        <div class="listing-details">
            ${photoHtml}
            <h2>${listing.itemName || 'Untitled'}</h2>
            <p><strong>Price:</strong> $${listing.price || 'N/A'}</p>
            <p><strong>Size:</strong> ${listing.size || 'N/A'}</p>
            <p><strong>Description:</strong> ${listing.description || 'No description'}</p>
        </div>
    `;
}

if (submitBidBtn) {
    submitBidBtn.addEventListener('click', () => {
        bidPriceDiv.style.display = 'block';
        submitBidBtn.style.display = 'none';
    });
}

if (bidForm) {
    bidForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        message.textContent = '';

        const bidAmount = bidForm.bidAmount?.value?.trim();
        
        if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
            message.style.color = 'red';
            message.textContent = 'Please enter a valid bid amount.';
            return;
        }

        const payload = {
            listing_id: listingId,
            bid_amount: parseFloat(bidAmount),
            timestamp: new Date().toISOString()

        };

        try {
            const res = await fetch('/bids/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'same-origin'
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            message.style.color = 'green';
            message.textContent = 'Bid submitted successfully!';
            
            bidPriceDiv.style.display = 'none';
            submitBidBtn.style.display = 'block';
            bidForm.reset();

        } catch (err) {
            console.error('Error submitting bid:', err);
            message.style.color = 'red';
            message.textContent = `Error submitting bid: ${err.message}`;
        }
    });
}
