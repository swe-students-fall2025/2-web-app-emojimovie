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
    <div class="profile-header">
      <h1>${escapeHtml(user.name || "Anonymous User")}</h1>
      <div class="profile-stats">
        <div class="stat">
          <strong>${user.listingsCount || 0}</strong>
          <span>Items Listed</span>
        </div>
        <div class="stat">
          <strong>${user.rating || "N/A"}</strong>
          <span>Rating</span>
        </div>
      </div>
      ${user.preferredLocation ? `<p><strong>Location:</strong> ${escapeHtml(user.preferredLocation)}</p>` : ""}
      ${socialMediaHtml}
      <a href="/profile/${escapeHtml(user._id || user.id)}/edit" class="edit-btn">Edit Profile</a>
    </div>

    <section class="active-listings">
      <h2>Active Listings</h2>
      <div class="listings-grid" id="user-listings">
        ${
          user.listings && user.listings.length > 0
            ? user.listings
                .map(
                  (listing) => `
          <article class="listing-card">
            <h3>${escapeHtml(listing.itemName || "Untitled")}</h3>
            <p>$${listing.price || "0"}</p>
          </article>
        `
                )
                .join("")
            : "<p>No active listings</p>"
        }
      </div>
    </section>

    <section class="reviews">
      <h2>Reviews</h2>
      <div class="reviews-list" id="user-reviews">
        ${
          user.reviews && user.reviews.length > 0
            ? user.reviews
                .map(
                  (review) => `
          <div class="review">
            <p>${escapeHtml(review.text || "")}</p>
            <span class="reviewer">- ${escapeHtml(review.reviewer || "Anonymous")}</span>
          </div>
        `
                )
                .join("")
            : "<p>No reviews yet</p>"
        }
      </div>
    </section>
  `;

  profileContainer.innerHTML = profileHtml;
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
