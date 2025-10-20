const profileContainer = document.getElementById("profile-container");

const escapeHtml = (s) =>
    String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

const getUserIdFromPath = () => {
    const pathParts = window.location.pathname.split("/");
    return pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
};

const renderProfile = (user) => {
    if (!user) {
        profileContainer.innerHTML = `
      <div class="error">
        <p>User not found</p>
      </div>
    `;
        return;
    }

    // Build social media display if available
    let socialMediaHtml = "";
    if (user.socialMediaType && user.socialMediaUsername) {
        socialMediaHtml = `
      <div class="social-media">
        <strong>${escapeHtml(user.socialMediaType)}:</strong> 
        ${escapeHtml(user.socialMediaUsername)}
      </div>
    `;
    }

    const profileHtml = `
    <section class="profile-card">
      <div class="profile-top">
        <div class="userblock">
          <h1 class="username">${escapeHtml(user.name || "Anonymous User")}</h1>
          <div class="stats">
            <span class="stat"><strong>${user.listingsCount || 0}</strong> Items Listed</span>
            <span class="stat"><strong>${user.rating || "N/A"}</strong> Rating</span>
          </div>
          ${user.preferredLocation ? `<p><strong>Location:</strong> ${escapeHtml(user.preferredLocation)}</p>` : ""}
          ${socialMediaHtml}
        </div>
      </div>
      <div class="profile-actions">
        <a class="btn" href="/user_profile/${escapeHtml(user._id || user.id)}/edit">Edit Profile</a>
      </div>
    </section>

    <nav class="section">
      <h2>Sections</h2>
      <div class="profile-actions tabs">
        <a class="btn primary" href="#section-listings">Active Listings</a>
        <a class="btn" href="#section-reviews">Reviews</a>
      </div>
    </nav>

    <section id="section-reviews" class="section">
      <h2>Reviews</h2>
      <div class="list">
        ${
            user.reviews && user.reviews.length > 0
                ? user.reviews
                      .map(
                          (review) => `
          <div class="item-row">
            <div class="item-info">
              <p class="item-title">${escapeHtml(review.text || "")}</p>
              <p class="item-meta">${escapeHtml(review.reviewer || "Anonymous")} · ${review.rating || "5"}★</p>
            </div>
          </div>
        `
                      )
                      .join("")
                : "<p>No reviews yet</p>"
        }
      </div>
    </section>

    <section id="section-listings" class="section">
      <h2>Active Listings</h2>
      <div class="list">
        ${
            user.listings && user.listings.length > 0
                ? user.listings
                      .map(
                          (listing) => `
          <div class="item-row">
            ${listing.photo && listing.photo.url ? `<img class="thumb" src="${listing.photo.url}" alt="${escapeHtml(listing.itemName || "Item")}">` : ""}
            <div class="item-info">
              <p class="item-title">${escapeHtml(listing.itemName || "Untitled")}</p>
              <p class="item-meta"><span class="price">$${listing.price || "0"}</span> · <span>${listing.description || "No description"}</span></p>
            </div>
            <div class="item-actions">
              <button class="btn edit-listing-btn" data-listing-id="${escapeHtml(listing._id || listing.id)}" style="background-color:#007bff; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:12px;">Edit</button>
            </div>
          </div>
        `
                      )
                      .join("")
                : "<p>No active listings</p>"
        }
      </div>
    </section>
  `;

    profileContainer.innerHTML = profileHtml;

    const editButtons = profileContainer.querySelectorAll(".edit-listing-btn");
    editButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const listingId = e.target.getAttribute("data-listing-id");
            if (listingId) {
                window.location.href = `/edit_post/${listingId}`;
            }
        });
    });
};

async function fetchProfile() {
    if (!profileContainer) {
        console.error("Profile container not found");
        return;
    }

    const userId = getUserIdFromPath();

    if (!userId) {
        profileContainer.innerHTML = `
      <div class="error">
        <p>Invalid user ID</p>
      </div>
    `;
        return;
    }

    try {
        const res = await fetch(`/users/api/profile/${userId}`, {
            method: "GET",
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch profile");
        }

        const user = await res.json();
        renderProfile(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        profileContainer.innerHTML = `
      <div class="error">
        <p>Error loading profile. Please try again later.</p>
      </div>
    `;
    }
}

fetchProfile();

const backToHomeBtn = document.getElementById("back-to-home-btn");
if (backToHomeBtn) {
    backToHomeBtn.addEventListener("click", () => {
        const userId = getUserIdFromPath();
        if (userId) {
            window.location.href = `/home/${userId}`;
        } else {
            console.error("User ID not found for home navigation");
            alert("Error: Cannot navigate to home page");
        }
    });
}
