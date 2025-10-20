(function () {
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    const search = document.getElementById("search");
    const sort = document.getElementById("sort");
    const reset = document.getElementById("reset");
    if (!grid || !empty || !search || !sort || !reset) return;
    const BASE_UPLOADS = "/static/uploads/";
    const escapeHtml = (s) =>
        String(s)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    const toNumber = (v) => {
        if (typeof v === "number") return v;
        if (typeof v === "string") {
            const n = Number(v.replace(/[,$]/g, "").trim());
            return Number.isFinite(n) ? n : null;
        }
        return null;
    };
    const buildImageUrl = (photo) => {
        if (photo && typeof photo === "object") {
            if (photo.url) return String(photo.url);
            if (photo.name) return BASE_UPLOADS + encodeURIComponent(photo.name);
        }
        return "";
    };
    const normalize = (raw) => ({
        id: raw._id ?? raw.id ?? null,
        itemName: raw.itemName || "",
        price: toNumber(raw.price),
        description: raw.description || "",
        size: raw.size || "",
        image: buildImageUrl(raw.photo),
    });
    const priceLabel = (n) =>
        typeof n === "number"
            ? n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            : "—";
    const createCard = (item) => {
        const article = document.createElement("article");
        article.className = "item";
        let html = "";
        if (item.image) {
            html += `<img src="${item.image}" alt="${escapeHtml(item.itemName)}" style="max-width:200px;max-height:200px;">`;
        }
        html += `
      <h3 style="margin:.5rem 0;">${escapeHtml(item.itemName)}</h3>
      <p style="margin:.25rem 0;">Price: $<span>${priceLabel(item.price)}</span></p>
    `;
        if (item.size) {
            html += `<p style="margin:.25rem 0;">Size: ${escapeHtml(item.size)}</p>`;
        }
        if (item.description) {
            html += `<p style="margin:.25rem 0;color:#555;">${escapeHtml(item.description)}</p>`;
        }
        html += `<button type="button">View Details</button>`;
        article.innerHTML = html;
        article.querySelector("button").addEventListener("click", () => {
            window.location.href = `/post/${item.id}`;
        });
        return article;
    };
    function render(list) {
        grid.innerHTML = "";
        if (!list || list.length === 0) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;
        const frag = document.createDocumentFragment();
        list.forEach((x) => frag.appendChild(createCard(x)));
        grid.appendChild(frag);
    }
    let allListings = [];
    let viewListings = [];
    function applyFilters() {
        const q = search.value.trim().toLowerCase();
        let next = allListings;
        if (q) {
            next = next.filter(
                (it) =>
                    (it.itemName && it.itemName.toLowerCase().includes(q)) ||
                    (it.description && it.description.toLowerCase().includes(q)) ||
                    (it.size && it.size.toLowerCase().includes(q))
            );
        }
        const how = sort.value;
        if (how === "asc" || how === "desc") {
            next = [...next].sort((a, b) => {
                const pa = Number.isFinite(a.price) ? a.price : Infinity;
                const pb = Number.isFinite(b.price) ? b.price : Infinity;
                return how === "asc" ? pa - pb : pb - pa;
            });
        }
        viewListings = next;
        render(viewListings);
    }
    const debounce = (fn, ms) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    };
    search.addEventListener("input", debounce(applyFilters, 150));
    sort.addEventListener("change", applyFilters);
    reset.addEventListener("click", (e) => {
        e.preventDefault();
        search.value = "";
        sort.value = "none";
        applyFilters();
    });
    async function fetchListings() {
        try {
            const res = await fetch("/listings/api/all", { method: "GET" });
            if (!res.ok) throw new Error(await res.text());
            let data = await res.json();
            if (data && !Array.isArray(data)) {
                if (Array.isArray(data.data)) data = data.data;
                else if (Array.isArray(data.listings)) data = data.listings;
            }
            if (!Array.isArray(data)) data = [];
            allListings = data.map(normalize);
            applyFilters();
        } catch {
            allListings = [];
            applyFilters();
        }
    }
    fetchListings();

    const profileBtn = document.getElementById("profile-btn");
    const createPostBtn = document.getElementById("create-post-btn");

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            const userId = window.currentUserId;
            if (userId) {
                window.location.href = `/user_profile/${userId}`;
            } else {
                console.error("User ID not found");
                alert("Error: User ID not found");
            }
        });
    }

    if (createPostBtn) {
        createPostBtn.addEventListener("click", () => {
            window.location.href = "/create_post";
        });
    }
})();
