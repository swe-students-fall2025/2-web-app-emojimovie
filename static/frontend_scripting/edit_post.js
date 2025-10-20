const form = document.getElementById("editListingForm");
const photoInput = document.getElementById("photo");
const previewImg = document.getElementById("preview");
const message = document.getElementById("message");

let base64Image = "";
let photoName = "";
let photoType = "";

const listingId = window.location.pathname.split("/").pop();

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

        form.itemName.value = listing.itemName || "";
        form.description.value = listing.description || "";
        form.price.value = listing.price || "";

        if (listing.photo && listing.photo.url) {
            previewImg.src = listing.photo.url;
            previewImg.style.display = "block";
        }
    } catch (err) {
        console.error("Error loading listing:", err);
        message.style.color = "red";
        message.textContent = "Error loading listing data.";
    }
});

photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;

    photoName = file.name || "";
    photoType = file.type || "";

    const reader = new FileReader();
    reader.onload = (e) => {
        base64Image = e.target.result;
        previewImg.src = base64Image;
        previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const payload = {
        itemName: (form.itemName?.value || "").trim(),
        description: (form.description?.value || "").trim(),
        price: (form.price?.value || "").trim(),
    };

    if (base64Image) {
        payload.photo = {
            name: photoName,
            content_type: photoType,
            data_url: base64Image,
        };
    }

    try {
        console.log("Sending payload:", payload);
        console.log("Listing ID:", listingId);

        const res = await fetch(`/listings/api/${listingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "same-origin",
        });

        console.log("Response status:", res.status);
        console.log("Response ok:", res.ok);

        if (!res.ok) {
            const t = await res.text();
            console.error("Error response:", t);
            throw new Error(t || `HTTP ${res.status}`);
        }

        const data = await res.json();
        message.style.color = "green";
        message.textContent = data.message || "Listing updated successfully!";

        base64Image = "";
        photoName = "";
        photoType = "";
        photoInput.value = "";
    } catch (err) {
        console.error("Error updating listing:", err);
        message.style.color = "red";
        message.textContent = "Error updating listing.";
    }
});

const backToProfileBtn = document.getElementById("back-to-profile-btn");
if (backToProfileBtn) {
    backToProfileBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const userId = window.currentUserId;
        if (userId) {
            window.location.href = `/user_profile/${userId}`;
        } else {
            console.error("User ID not found");
            alert("Error: Cannot navigate to profile page");
        }
    });
}

const deleteListingBtn = document.getElementById("delete-listing-btn");
if (deleteListingBtn) {
    deleteListingBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (
            !confirm("Are you sure you want to delete this listing? This action cannot be undone.")
        ) {
            return;
        }

        try {
            const res = await fetch(`/listings/api/${listingId}`, {
                method: "DELETE",
                credentials: "same-origin",
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || `HTTP ${res.status}`);
            }

            message.style.color = "green";
            message.textContent = "Listing deleted successfully!";

            setTimeout(() => {
                const userId = window.currentUserId;
                if (userId) {
                    window.location.href = `/user_profile/${userId}`;
                } else {
                    window.location.href = "/";
                }
            }, 1000);
        } catch (err) {
            console.error("Error deleting listing:", err);
            message.style.color = "red";
            message.textContent = "Error deleting listing. Please try again.";
        }
    });
}
