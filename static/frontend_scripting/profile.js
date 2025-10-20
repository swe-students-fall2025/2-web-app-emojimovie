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

const formatCurrency = (num) => {
  if (num == null || num === "" || isNaN(Number(num))) return "No bids";
  return `$${Number(num).toFixed(2)}`;
};

const renderProfile = (user) => {
  if (!user) {
    profileContainer.innerHTML = `<div class="error"><p>User not found</p></div>`;
    return;
  }

  let socialMediaHtml = "";
  if (user.socialMediaType && user.socialMediaUsername) {
    socialMediaHtml = `
      <div class="social-media">
        <strong>${escapeHtml(user.socialMediaType)}:</strong> 
        ${escapeHtml(user.socialMediaUsername)}
      </div>`;
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
    <section id="section-listings" class="section">
      <h2>Active Listings</h2>
      <div class="list">
        ${
          user.listings && user.listings.length > 0
            ? user.listings
                .map(
                  (listing) => `
          <div class="item-row">
            ${
              listing.photo && listing.photo.url
                ? `<img class="thumb" src="${listing.photo.url}" alt="${escapeHtml(listing.itemName || "Item")}">`
                : ""
            }
            <div class="item-info">
              <p class="item-title">${escapeHtml(listing.itemName || "Untitled")}</p>
              <p class="item-meta">
                <span class="price">${formatCurrency(listing.price || 0)}</span>
                · <span>${escapeHtml(listing.description || "No description")}</span><br>
                <span class="highest-bid" data-listing-id="${escapeHtml(listing._id)}">
                  Highest bid: Loading...
                </span>
              </p>
            </div>
            <div class="item-actions">
              <button class="btn edit-listing-btn" data-listing-id="${escapeHtml(listing._id)}"
                style="background-color:#007bff; color:white; border:none; padding:6px 12px; border-radius:4px; font-size:12px;">
                Edit
              </button>
            </div>
          </div>`
                )
                .join("")
            : "<p>No active listings</p>"
        }
      </div>
    </section>`;

  profileContainer.innerHTML = profileHtml;

  const highestBidElems = document.querySelectorAll(".highest-bid");
  highestBidElems.forEach(async (elem) => {
    const id = (elem.dataset.listingId || "").trim();
    if (!id) {
      elem.textContent = "Highest bid: No bids";
      console.warn("Missing listing id for element:", elem);
      return;
    }
    const urls = [`/bids/api/highest/${encodeURIComponent(id)}`];
    let amount = null;
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const amountRaw =
          data?.amount ??
          data?.highest?.amount ??
          data?.bid?.amount ??
          data?.bid_amount ??
          data?.price ??
          null;
        amount = amountRaw;
        break;
      } catch {}
    }
    elem.textContent = `Highest bid: ${amount == null ? "No bids" : `$${Number(amount).toFixed(2)}`}`;
  });

  const editButtons = profileContainer.querySelectorAll(".edit-listing-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const listingId = e.target.getAttribute("data-listing-id");
      if (listingId) window.location.href = `/edit_post/${listingId}`;
    });
  });
};

async function fetchProfile() {
  const userId = getUserIdFromPath();
  try {
    const res = await fetch(`/users/api/profile/${userId}`);
    const user = await res.json();
    renderProfile(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
  }
}

fetchProfile();

const backToHomeBtn = document.getElementById("back-to-home-btn");
if (backToHomeBtn) {
  backToHomeBtn.addEventListener("click", () => {
    const id = (window.currentUserId || getUserIdFromPath() || "").trim();
    window.location.href = id ? `/home/${encodeURIComponent(id)}` : "/home";
  });
}
