const editForm = document.getElementById("edit-profile-form");
const cancelBtn = document.getElementById("cancel-btn");
const messageDiv = document.getElementById("message");

const getUserIdFromPath = () => {
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 2];
};

const populateForm = (user) => {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const locationInput = document.getElementById("preferredLocation");
  const socialTypeInput = document.getElementById("socialMediaType");
  const socialUsernameInput = document.getElementById("socialMediaUsername");

  if (nameInput && user.name) nameInput.value = user.name;
  if (emailInput && user.email) emailInput.value = user.email;
  if (locationInput && user.preferredLocation) locationInput.value = user.preferredLocation;
  if (socialTypeInput && user.socialMediaType) socialTypeInput.value = user.socialMediaType;
  if (socialUsernameInput && user.socialMediaUsername) socialUsernameInput.value = user.socialMediaUsername;
};

async function fetchUserData() {
  const userId = getUserIdFromPath();

  if (!userId) {
    showMessage("Invalid user ID", true);
    return;
  }

  try {
    const res = await fetch(`/users/api/profile/${userId}`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = await res.json();
    populateForm(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    showMessage("Error loading profile data", true);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const userId = getUserIdFromPath();
  if (!userId) {
    showMessage("Invalid user ID", true);
    return;
  }

  const formData = new FormData(editForm);

  try {
    const res = await fetch(`/users/api/profile/${userId}/edit`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const result = await res.json();
    showMessage(result.message || "Profile updated successfully!");

    setTimeout(() => {
      window.location.href = `/profile/${userId}`;
    }, 1500);
  } catch (error) {
    console.error("Error updating profile:", error);
    showMessage(error.message || "Error updating profile", true);
  }
}

function handleCancel(e) {
  e.preventDefault();
  const userId = getUserIdFromPath();
  window.location.href = `/profile/${userId}`;
}

if (editForm) {
  editForm.addEventListener("submit", handleFormSubmit);
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", handleCancel);
}

if (editForm) {
  fetchUserData();
}
