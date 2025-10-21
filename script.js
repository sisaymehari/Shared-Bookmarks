import { getUserIds, getData, setData } from "./storage.js";

function safeGetData(userId) {
  try {
    return getData(userId) || [];
  } catch {
    return [];
  }
}

function displayBookmarks(userId) {
  const list = document.getElementById("results-list");
  list.innerHTML = "";

  const bookmarks = safeGetData(userId);

  if (!bookmarks.length) {
    list.innerHTML = "<li>No bookmarks for this user.</li>";
    return;
  }

  bookmarks
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .forEach(({ url, title, description, timestamp }) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="${url}" target="_blank">${title}</a>
        <p>${description}</p>
        <small>Saved on: ${new Date(timestamp).toLocaleString()}</small>
      `;
      list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("user-select");
  const form = document.getElementById("bookmark-form");
  const title = document.getElementById("title");
  const url = document.getElementById("url");
  const desc = document.getElementById("description");

  // Populate user dropdown
  getUserIds().forEach(id => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `User ${id}`;
    select.appendChild(opt);
  });

  // Disable inputs until user is selected
  form.querySelectorAll("input, textarea, button").forEach(el => (el.disabled = true));

  select.addEventListener("change", () => {
    const userId = select.value;

    if (!userId) {
      // Go back to placeholder
      form.querySelectorAll("input, textarea, button").forEach(el => (el.disabled = true));
      document.getElementById("results-list").innerHTML = "";
      return;
    }

    // Enable inputs when user selected
    form.querySelectorAll("input, textarea, button").forEach(el => (el.disabled = false));
    displayBookmarks(userId);
  });

  // Allow pressing Enter to submit form
  form.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const userId = select.value;

    if (!userId) {
      alert("Please select a user first.");
      return;
    }

    const newBookmark = {
      url: url.value.trim(),
      title: title.value.trim(),
      description: desc.value.trim(),
      timestamp: new Date().toISOString()
    };

    // Combined validation (fix for "fix all on alert")
    if (!newBookmark.url || !newBookmark.title || !newBookmark.description) {
      alert("Please fill out all fields before saving.");
      return;
    }

    // URL format validation (fix for "doesn’t")
    try {
      new URL(newBookmark.url);
    } catch {
      alert("Invalid URL format. Please enter a valid one (e.g., https://example.com).");
      return;
    }

    // Get user data (no need to make global)
    const bookmarks = safeGetData(userId);

    // Prevent duplicates
    if (bookmarks.some(b => b.url === newBookmark.url)) {
      alert("This bookmark already exists for this user.");
      return;
    }

    // Save and refresh
    bookmarks.push(newBookmark);
    setData(userId, bookmarks);
    form.reset();
    displayBookmarks(userId);
  });
});

export { displayBookmarks };
