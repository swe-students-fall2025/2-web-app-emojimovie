const listingId = window.location.pathname.split("/").pop();

const container = document.getElementById("listing-container");
const message = document.getElementById("message");
const submitBidBtn = document.getElementById("submit-bid-btn");
const bidPriceDiv = document.getElementById("bid-price");
const bidForm = document.getElementById("bid-form");
const cancelBidBtn = document.getElementById("cancel-bid-btn");

const getUserIdFromPath = () => {
    const pathParts = window.location.pathname.split("/");
    return pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
};

window.addEventListener("DOMContentLoaded", async () => {
    if (!listingId) {
        message.style.color = "red";
        message.textContent = "No listing ID provided.";
        return;
    }

    try {
        const res = await fetch(`/listings/api/${listingId}`, {
            method: "GET",
            credentials: "same-origin",
        });

        if (!res.ok) {
            throw new Error(`Failed to load listing: ${res.status}`);
        }

        const listing = await res.json();
        await displayListing(listing);
        addEventListeners();
    } catch (err) {
        console.error("Error loading listing:", err);
        message.style.color = "red";
        message.textContent = "Error loading listing.";
        container.innerHTML = "<p>Could not load listing.</p>";
    }
});

async function displayListing(listing) {
    const photoHtml =
        listing.photo && listing.photo.url
            ? `<img class="post-image" src="${listing.photo.url}" alt="${listing.itemName || "Product image"}" style="max-width: 400px; height: auto;">`
            : '<div class="post-image" style="background: #f0f0f0; height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">No photo available</div>';

    const sizeHtml = listing.size ? `<span class="chip">Size ${listing.size}</span>` : "";

    let sellerInfo = `
        <div><strong>Seller:</strong> Unknown Seller</div>
        <div><strong>Preferred location(s):</strong> N/A</div>
        <div><strong>N/A</strong> ⭐</div>
    `;
    if (listing.user_id) {
        try {
            const sellerRes = await fetch(`/users/api/profile/${listing.user_id}`, {
                method: "GET",
                credentials: "same-origin",
            });
            if (sellerRes.ok) {
                const seller = await sellerRes.json();
                const sellerName = seller.name || "Unknown Seller";
                const sellerRating = seller.rating || "N/A";
                const sellerLocation = seller.preferredLocation || "N/A";
                sellerInfo = `
                    <div><strong>Seller:</strong> ${sellerName}</div>
                    <div><strong>Preferred location(s):</strong> ${sellerLocation}</div>
                    <div><strong>${sellerRating}</strong> ⭐</div>
                `;
            }
        } catch (err) {
            console.error("Error fetching seller info:", err);
        }
    }

    container.innerHTML = `
        <article class="post-card">
            ${photoHtml}
            
            <div class="post-body">
                <h1 class="post-title">${listing.itemName || "Untitled"}</h1>
                <div class="price-row">
                    <div class="post-price">$${listing.price || "N/A"}</div>
                </div>
                
                ${sizeHtml ? `<div class="chips">${sizeHtml}</div>` : ""}
            </div>
            
            <div class="section">
                <h2>Description</h2>
                <p>${listing.description || "No description available"}</p>
            </div>
            
            <div class="section">
                <h2>Seller Information</h2>
                <div class="seller">
                    <div>${sellerInfo}</div>
                </div>
            </div>
            
            <div class="actions">
                <button class="btn" id="submit-bid-btn">Submit Bid</button>
                <div id="bid-price" style="display: none;">
                    <form id="bid-form">
                        <label for="bidAmount">Your Bid (USD): </label>
                        <input type="number" id="bidAmount" name="bidAmount" min="1" step="0.01" required>
                        <button type="submit" class="btn" id="placeBidButton">Place Bid</button>
                    </form>
                </div>
            </div>
        </article>
    `;
}

// Add event listeners after the listing is displayed
function addEventListeners() {
    const submitBidBtn = document.getElementById("submit-bid-btn");
    const bidPriceDiv = document.getElementById("bid-price");
    const bidForm = document.getElementById("bid-form");

    if (submitBidBtn) {
        submitBidBtn.addEventListener("click", () => {
            bidPriceDiv.style.display = "block";
            submitBidBtn.style.display = "none";
        });
    }

    if (bidForm) {
        bidForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            message.textContent = "";

            const bidAmount = bidForm.bidAmount?.value?.trim();

            if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
                message.style.color = "red";
                message.textContent = "Please enter a valid bid amount.";
                return;
            }

            const payload = {
                listing_id: listingId,
                bid_amount: parseFloat(bidAmount),
                timestamp: new Date().toISOString(),
            };

            try {
                const res = await fetch("/bids/api", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({...payload, user_id: getUserIdFromPath()}),
                    credentials: "same-origin",
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP ${res.status}`);
                }

                const data = await res.json();
                message.style.color = "green";
                message.textContent = "Bid submitted successfully!";

                bidPriceDiv.style.display = "none";
                submitBidBtn.style.display = "block";
                bidForm.reset();
            } catch (err) {
                console.error("Error submitting bid:", err);
                message.style.color = "red";
                message.textContent = `Error submitting bid: ${err.message}`;
            }
        });
    }
}

// Back to home functionality
const backToHomeBtn = document.getElementById("back-to-home-btn");
if (backToHomeBtn) {
    backToHomeBtn.addEventListener("click", () => {
        const userId = window.currentUserId;
        if (userId) {
            window.location.href = `/home/${userId}`;
        } else {
            window.location.href = "/";
        }
    });
}
