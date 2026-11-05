"use strict";

/* =========================================
   CONTACTHUB - BINARY SEARCH TREE
   Browser-only application for GitHub Pages
========================================= */

const $ = (id) => document.getElementById(id);

const STORAGE = {
  contacts: "contacthub_contacts_v2",
  activity: "contacthub_activity_v2",
  theme: "contacthub_theme_v2",
  pin: "contacthub_admin_pin_v2"
};

let contacts = loadJSON(STORAGE.contacts, []);
let activities = loadJSON(STORAGE.activity, []);
let operationCount = 0;
let selectedProfileId = null;
let adminUnlocked = false;
let soundEnabled = true;
let audioContext = null;

/* ---------- STORAGE ---------- */

function loadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveData() {
  localStorage.setItem(STORAGE.contacts, JSON.stringify(contacts));
  localStorage.setItem(STORAGE.activity, JSON.stringify(activities));
}

/* ---------- BINARY SEARCH TREE ---------- */

class Node {
  constructor(contact) {
    this.id = Number(contact.id);
    this.name = contact.name;
    this.phone = contact.phone;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(contact) {
    const newNode = new Node(contact);

    if (!this.root) {
      this.root = newNode;
      return true;
    }

    let current = this.root;

    while (current) {
      if (newNode.id === current.id) return false;

      if (newNode.id < current.id) {
        if (!current.left) {
          current.left = newNode;
          return true;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return true;
        }
        current = current.right;
      }
    }

    return false;
  }

  search(id) {
    let current = this.root;

    while (current) {
      if (id === current.id) return current;
      current = id < current.id ? current.left : current.right;
    }

    return null;
  }

  delete(id) {
    let deleted = false;

    const remove = (node, target) => {
      if (!node) return null;

      if (target < node.id) {
        node.left = remove(node.left, target);
      } else if (target > node.id) {
        node.right = remove(node.right, target);
      } else {
        deleted = true;

        // Case 1: no children
        if (!node.left && !node.right) return null;

        // Case 2: one child
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // Case 3: two children
        let successor = node.right;
        while (successor.left) successor = successor.left;

        node.id = successor.id;
        node.name = successor.name;
        node.phone = successor.phone;
        node.right = remove(node.right, successor.id);
      }

      return node;
    };

    this.root = remove(this.root, id);
    return deleted;
  }

  inorder() {
    const result = [];

    const walk = (node) => {
      if (!node) return;
      walk(node.left);
      result.push(node);
      walk(node.right);
    };

    walk(this.root);
    return result;
  }

  preorder() {
    const result = [];

    const walk = (node) => {
      if (!node) return;
      result.push(node);
      walk(node.left);
      walk(node.right);
    };

    walk(this.root);
    return result;
  }

  postorder() {
    const result = [];

    const walk = (node) => {
      if (!node) return;
      walk(node.left);
      walk(node.right);
      result.push(node);
    };

    walk(this.root);
    return result;
  }

  height(node = this.root) {
    if (!node) return 0;
    return 1 + Math.max(this.height(node.left), this.height(node.right));
  }

  leafCount(node = this.root) {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    return this.leafCount(node.left) + this.leafCount(node.right);
  }

  internalCount(node = this.root) {
    if (!node || (!node.left && !node.right)) return 0;
    return 1 + this.internalCount(node.left) + this.internalCount(node.right);
  }

  minimum() {
    let node = this.root;
    if (!node) return null;
    while (node.left) node = node.left;
    return node;
  }

  maximum() {
    let node = this.root;
    if (!node) return null;
    while (node.right) node = node.right;
    return node;
  }
}

let bst = new BinarySearchTree();

function rebuildTree() {
  bst = new BinarySearchTree();
  contacts.forEach(contact => bst.insert(contact));
}

/* ---------- UTILITIES ---------- */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function validContact(contact) {
  return Number.isInteger(Number(contact.id)) &&
    Number(contact.id) > 0 &&
    String(contact.name || "").trim().length > 0 &&
    String(contact.phone || "").trim().length > 0;
}

function toast(message) {
  const box = $("toast");
  box.textContent = message;
  box.classList.add("show");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => box.classList.remove("show"), 2600);
}

function playSound(type = "click") {
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioContext ||= new AudioContextClass();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const settings = {
      click: [420, 0.045],
      success: [660, 0.11],
      error: [180, 0.13],
      delete: [260, 0.09]
    };

    const [frequency, duration] = settings[type] || settings.click;

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Sound is optional; the application still works without it.
  }
}

function logActivity(title, description, symbol = "↗") {
  activities.unshift({
    title,
    description,
    symbol,
    time: new Date().toISOString()
  });

  activities = activities.slice(0, 60);
  localStorage.setItem(STORAGE.activity, JSON.stringify(activities));
  renderActivity();
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ---------- ADD CONTACT ---------- */

$("contactForm").addEventListener("submit", event => {
  event.preventDefault();

  const contact = {
    id: Number($("contactId").value),
    name: $("contactName").value.trim(),
    phone: $("contactPhone").value.trim()
  };

  if (!validContact(contact)) {
    toast("Please enter a valid ID, name and phone number.");
    playSound("error");
    return;
  }

  if (bst.search(contact.id)) {
    toast("That contact ID already exists.");
    playSound("error");
    return;
  }

  contacts.push(contact);
  rebuildTree();
  saveData();

  operationCount++;
  logActivity("Contact added", `${contact.name} · ID ${contact.id}`, "＋");

  $("contactForm").reset();
  refreshUI();
  toast("Contact successfully added!");
  playSound("success");
});

/* ---------- DELETE CONTACT ---------- */

function deleteContact(id) {
  const contact = bst.search(Number(id));

  if (!contact) {
    toast("Contact not found.");
    return;
  }

  if (!confirm(`Delete ${contact.name} (ID ${contact.id})?`)) return;

  bst.delete(Number(id));
  contacts = contacts.filter(item => Number(item.id) !== Number(id));

  operationCount++;
  logActivity("Contact deleted", `${contact.name} · ID ${contact.id}`, "−");

  saveData();
  closeModal("profileModal");
  refreshUI();
  toast("Contact deleted successfully.");
  playSound("delete");
}

/* ---------- SEARCH ---------- */

function searchContact(id, record = true) {
  const contact = bst.search(Number(id));

  if (record) {
    operationCount++;

    logActivity(
      contact ? "Contact searched" : "Search unsuccessful",
      `ID ${id} ${contact ? "was found" : "was not found"}`,
      "⌕"
    );
  }

  return contact;
}

/* ---------- CONTACT DIRECTORY ---------- */

function renderContacts() {
  const query = $("directorySearch").value.trim().toLowerCase();

  const filtered = bst.inorder().filter(contact =>
    String(contact.id).includes(query) ||
    contact.name.toLowerCase().includes(query) ||
    contact.phone.toLowerCase().includes(query)
  );

  const table = $("contactTable");

  if (!filtered.length) {
    table.innerHTML = `<tr><td colspan="4" class="empty-state">${
      contacts.length ? "No matching contacts found." : "No contacts yet. Add your first contact."
    }</td></tr>`;
  } else {
    table.innerHTML = filtered.map(contact => `
      <tr>
        <td><span class="id-chip">#${contact.id}</span></td>
        <td>
          <span class="contact-name" data-profile="${contact.id}">
            ${escapeHTML(contact.name)}
          </span>
        </td>
        <td>${escapeHTML(contact.phone)}</td>
        <td>
          <button class="table-action" data-profile="${contact.id}" title="View profile">↗</button>
          <button class="table-action delete" data-delete="${contact.id}" title="Delete">×</button>
        </td>
      </tr>
    `).join("");
  }

  $("directoryCount").textContent =
    `${filtered.length} of ${contacts.length} contacts`;
}

$("directorySearch").addEventListener("input", renderContacts);

$("contactTable").addEventListener("click", event => {
  const profile = event.target.closest("[data-profile]");
  const remove = event.target.closest("[data-delete]");

  if (profile) openProfile(Number(profile.dataset.profile));
  if (remove) deleteContact(Number(remove.dataset.delete));
});

/* ---------- CONTACT PROFILE ---------- */

function openProfile(id) {
  const contact = bst.search(id);
  if (!contact) return;

  selectedProfileId = id;

  $("profileAvatar").textContent = contact.name
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  $("profileName").textContent = contact.name;
  $("profileId").textContent = `#${contact.id}`;
  $("profilePhone").textContent = contact.phone;

  openModal("profileModal");
}

$("profileDeleteBtn").addEventListener("click", () => {
  if (selectedProfileId !== null) deleteContact(selectedProfileId);
});

/* ---------- 3D BST SVG VISUALIZATION ---------- */

function renderTree() {
  const stage = $("treeStage");

  if (!bst.root) {
    stage.innerHTML = `
      <div class="tree-empty">
        Your Binary Search Tree will appear here.<br>
        <small>Add contacts to build your tree.</small>
      </div>`;
    return;
  }

  const nodes = [];
  let maxDepth = 0;

  function collect(node, depth = 0) {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    nodes.push({ node, depth });
    collect(node.left, depth + 1);
    collect(node.right, depth + 1);
  }

  collect(bst.root);

  const width = Math.max(600, Math.pow(2, Math.min(maxDepth + 1, 8)) * 75);
  const levelGap = 75;
  const height = Math.max(220, (maxDepth + 1) * levelGap + 65);
  const positions = new Map();

  // Inorder positions guarantee that left children are displayed left
  // of their parent and right children are displayed right of their parent.
  let index = 0;

  function assign(node, depth = 0) {
    if (!node) return;
    assign(node.left, depth + 1);

    const x = ((index + 0.5) / contacts.length) * (width - 50) + 25;
    const y = 42 + depth * levelGap;

    positions.set(node.id, { x, y });
    index++;

    assign(node.right, depth + 1);
  }

  assign(bst.root);

  let edges = "";
  let circles = "";

  nodes.forEach(({ node }) => {
    const from = positions.get(node.id);

    [node.left, node.right].forEach(child => {
      if (!child) return;
      const to = positions.get(child.id);

      edges += `
        <line class="tree-edge"
          x1="${from.x}" y1="${from.y}"
          x2="${to.x}" y2="${to.y}" />
      `;
    });
  });

  nodes.forEach(({ node }) => {
    const p = positions.get(node.id);

    circles += `
      <g class="tree-node-group" data-tree-id="${node.id}">
        <circle class="tree-node" cx="${p.x}" cy="${p.y}" r="20"></circle>
        <text class="tree-node-label" x="${p.x}" y="${p.y}">${node.id}</text>
        <text class="tree-node-name" x="${p.x}" y="${p.y + 34}">
          ${escapeHTML(node.name.slice(0, 13))}
        </text>
      </g>
    `;
  });

  stage.innerHTML = `
    <svg class="tree-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Binary Search Tree visualization">
      ${edges}
      ${circles}
    </svg>
  `;

  stage.querySelectorAll("[data-tree-id]").forEach(group => {
    group.addEventListener("click", () => {
      openProfile(Number(group.dataset.treeId));
    });
  });
}

/* ---------- ANALYTICS ---------- */

function renderAnalytics() {
  const count = contacts.length;
  const height = bst.height();
  const leaves = bst.leafCount();
  const internal = bst.internalCount();
  const maximum = height === 0 ? 0 : Math.pow(2, height) - 1;

  $("totalContacts").textContent = count;
  $("treeHeight").textContent = height;
  $("leafNodes").textContent = leaves;
  $("operationCount").textContent = operationCount;

  $("analyticsLeaves").textContent = leaves;
  $("internalNodes").textContent = internal;
  $("analyticsHeight").textContent = height;
  $("maxNodes").textContent = maximum;
}

/* ---------- INORDER TRAVERSAL ---------- */

function renderInorder() {
  const sequence = bst.inorder();

  $("inorderSequence").innerHTML = sequence.length
    ? sequence.map(node =>
        `<span class="sequence-node">${node.id}</span>`
      ).join("")
    : `<span class="muted">No nodes available</span>`;
}

/* ---------- SIMULATOR ---------- */

$("simulateBtn").addEventListener("click", () => {
  const id = Number($("simId").value);
  const operation = $("simOperation").value;

  if (!Number.isInteger(id) || id <= 0) {
    toast("Enter a valid positive contact ID.");
    return;
  }

  const output = $("simulationOutput");
  const steps = [];

  if (operation === "search") {
    let current = bst.root;

    if (!current) {
      steps.push("The BST is empty. There are no nodes to search.");
    }

    while (current) {
      steps.push(`Compare ${id} with current node ${current.id}.`);

      if (id === current.id) {
        steps.push(`Match found! Contact ${current.name} is located.`);
        break;
      }

      if (id < current.id) {
        steps.push(`${id} is smaller. Move to the LEFT subtree.`);
        current = current.left;
      } else {
        steps.push(`${id} is larger. Move to the RIGHT subtree.`);
        current = current.right;
      }
    }

    if (!current && bst.root) {
      steps.push("Reached an empty link. The contact does not exist.");
    }

    operationCount++;
    logActivity("BST search simulated", `Search for ID ${id}`, "⌕");
  } else {
    let current = bst.root;

    if (bst.search(id)) {
      steps.push(`ID ${id} already exists. Duplicate IDs are not allowed.`);
    } else if (!current) {
      steps.push(`The tree is empty. ID ${id} becomes the root node.`);
      steps.push("The sample node can now be inserted.");
    } else {
      while (current) {
        steps.push(`Compare ${id} with ${current.id}.`);

        if (id < current.id) {
          if (!current.left) {
            steps.push(`Empty LEFT position found at node ${current.id}.`);
            break;
          }
          steps.push("Move to the LEFT child.");
          current = current.left;
        } else {
          if (!current.right) {
            steps.push(`Empty RIGHT position found at node ${current.id}.`);
            break;
          }
          steps.push("Move to the RIGHT child.");
          current = current.right;
        }
      }

      steps.push("Simulation complete. Click Add contact to insert a real record.");
    }

    operationCount++;
    logActivity("BST insertion simulated", `Insertion path for ID ${id}`, "＋");
  }

  output.innerHTML = steps.map((step, index) => `
    <div class="sim-step">
      <span class="step-number">${index + 1}</span>
      <span>${escapeHTML(step)}</span>
    </div>
  `).join("");

  refreshUI();
  playSound("click");
});

/* ---------- LOCAL CONTACT ASSISTANT ---------- */

function assistantReply(question) {
  const q = question.toLowerCase();
  const sorted = bst.inorder();
  const total = contacts.length;

  if (/how many|total|count/.test(q)) {
    return `You currently have ${total} contact${total === 1 ? "" : "s"} in your ContactHub workspace.`;
  }

  if (/height|levels/.test(q)) {
    return `Your BST has ${bst.height()} level${bst.height() === 1 ? "" : "s"}. The height is calculated using the longest root-to-leaf path.`;
  }

  if (/leaf/.test(q)) {
    return `Your tree contains ${bst.leafCount()} leaf nodes. A leaf node has no left or right child.`;
  }

  if (/internal/.test(q)) {
    return `Your BST has ${bst.internalCount()} internal nodes. These are nodes with at least one child.`;
  }

  if (/highest|largest|maximum|biggest/.test(q)) {
    const node = bst.maximum();
    return node
      ? `The highest contact ID is ${node.id}, belonging to ${node.name}.`
      : "There are no contacts in your workspace yet.";
  }

  if (/lowest|smallest|minimum/.test(q)) {
    const node = bst.minimum();
    return node
      ? `The lowest contact ID is ${node.id}, belonging to ${node.name}.`
      : "There are no contacts in your workspace yet.";
  }

  if (/inorder|ascending|sorted/.test(q)) {
    return sorted.length
      ? `Your inorder sequence is: ${sorted.map(node => node.id).join(" → ")}.`
      : "Your tree is empty. Add contacts to create an inorder sequence.";
  }

  if (/preorder/.test(q)) {
    return `Preorder traversal: ${bst.preorder().map(node => node.id).join(" → ") || "No nodes yet"}.`;
  }

  if (/postorder/.test(q)) {
    return `Postorder traversal: ${bst.postorder().map(node => node.id).join(" → ") || "No nodes yet"}.`;
  }

  if (/explain|what is|how does|bst|binary search tree/.test(q)) {
    return "A Binary Search Tree stores unique keys in an ordered structure. Every ID in the left subtree is smaller than its parent ID, and every ID in the right subtree is larger. Inorder traversal visits Left → Root → Right, producing ascending IDs.";
  }

  if (/search|find|look for/.test(q)) {
    const match = q.match(/\d+/);
    if (match) {
      const result = bst.search(Number(match[0]));
      return result
        ? `Found contact ${result.name}, ID ${result.id}, phone ${result.phone}.`
        : `I couldn't find a contact with ID ${match[0]}.`;
    }
    return "To search, enter a contact ID in the contact directory search or ask me to find a specific ID, such as 'Find 105'.";
  }

  if (/help|what can you do/.test(q)) {
    return "I can report contact totals, tree height, leaf nodes, internal nodes, minimum and maximum IDs, and inorder, preorder or postorder traversal. Try asking 'How many contacts do I have?'";
  }

  return "I can answer questions about your locally stored contacts and BST structure. Try asking about total contacts, tree height, leaf nodes, highest ID or inorder traversal.";
}

function addChatMessage(message, type) {
  const chat = $("assistantChat");
  const row = document.createElement("div");

  row.className = `assistant-message ${type === "user" ? "user" : ""}`;

  if (type === "user") {
    const p = document.createElement("p");
    p.textContent = message;
    row.appendChild(p);
  } else {
    const avatar = document.createElement("span");
    avatar.className = "assistant-avatar";
    avatar.textContent = "✧";

    const p = document.createElement("p");
    p.textContent = message;

    row.append(avatar, p);
  }

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

$("assistantForm").addEventListener("submit", event => {
  event.preventDefault();

  const question = $("assistantQuestion").value.trim();
  if (!question) return;

  addChatMessage(question, "user");
  $("assistantQuestion").value = "";

  setTimeout(() => {
    addChatMessage(assistantReply(question), "assistant");
    playSound("click");
  }, 250);
});

document.querySelectorAll("[data-question]").forEach(button => {
  button.addEventListener("click", () => {
    $("assistantQuestion").value = button.dataset.question;
    $("assistantForm").requestSubmit();
  });
});

/* ---------- ACTIVITY TIMELINE ---------- */

function renderActivity() {
  const list = $("activityList");

  if (!activities.length) {
    list.innerHTML = `<div class="activity-empty">Your recent actions will appear here.</div>`;
    return;
  }

  list.innerHTML = activities.map(item => `
    <div class="activity-item">
      <div class="activity-icon">${escapeHTML(item.symbol || "↗")}</div>
      <div class="activity-copy">
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.description)} · ${formatTime(item.time)}</small>
      </div>
    </div>
  `).join("");
}

$("clearActivityBtn").addEventListener("click", () => {
  if (!confirm("Clear the entire activity history?")) return;

  activities = [];
  localStorage.setItem(STORAGE.activity, JSON.stringify(activities));
  renderActivity();
  toast("Activity history cleared.");
});

/* ---------- CSV EXPORT ---------- */

function csvEscape(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

$("exportCsvBtn").addEventListener("click", () => {
  const rows = [
    ["Contact ID", "Name", "Phone"],
    ...bst.inorder().map(c => [c.id, c.name, c.phone])
  ];

  const csv = "\uFEFF" + rows.map(row =>
    row.map(csvEscape).join(",")
  ).join("\r\n");

  downloadFile(csv, "contacthub-contacts.csv", "text/csv;charset=utf-8");

  logActivity("CSV exported", `${contacts.length} contacts exported`, "↓");
  toast("CSV file exported.");
});

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- CSV IMPORT ---------- */

$("importBtn").addEventListener("click", () => $("importFile").click());

$("importFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const content = await file.text();
    const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);

    if (lines.length < 2) throw new Error("The CSV file has no contact rows.");

    const rows = lines.slice(1).map(parseCSVLine);
    const imported = [];
    const existingIds = new Set(contacts.map(c => Number(c.id)));

    for (const row of rows) {
      if (row.length < 3) continue;

      const contact = {
        id: Number(row[0]),
        name: String(row[1] || "").trim(),
        phone: String(row[2] || "").trim()
      };

      if (!validContact(contact)) continue;
      if (existingIds.has(contact.id)) continue;

      existingIds.add(contact.id);
      imported.push(contact);
    }

    if (!imported.length) {
      toast("No new valid contacts were found in that file.");
      return;
    }

    contacts.push(...imported);
    rebuildTree();
    saveData();

    operationCount++;
    logActivity("CSV imported", `${imported.length} contacts imported`, "↑");

    refreshUI();
    toast(`${imported.length} contacts imported successfully.`);
    playSound("success");
  } catch (error) {
    toast(error.message || "Unable to read this CSV file.");
    playSound("error");
  } finally {
    event.target.value = "";
  }
});

function parseCSVLine(line) {
  const values = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  values.push(value);
  return values;
}

/* ---------- PDF / PRINT ---------- */

$("exportPdfBtn").addEventListener("click", () => {
  logActivity("PDF print opened", "Use the browser print dialog to save the directory as PDF", "▣");
  window.print();
});

/* ---------- ADMIN ACCESS ---------- */

function getAdminPin() {
  return localStorage.getItem(STORAGE.pin) || "2468";
}

$("adminBtn").addEventListener("click", () => {
  updateAdminModal();
  openModal("adminModal");
});

function updateAdminModal() {
  $("adminForm").classList.toggle("hidden", adminUnlocked);
  $("adminControls").classList.toggle("hidden", !adminUnlocked);

  $("adminTitle").textContent = adminUnlocked ? "Admin workspace" : "Admin access";
  $("adminDescription").textContent = adminUnlocked
    ? "Manage your local workspace settings."
    : "Enter your local workspace PIN to unlock admin controls.";

  $("pinHint").classList.toggle("hidden", adminUnlocked);
}

$("adminForm").addEventListener("submit", event => {
  event.preventDefault();

  if ($("adminPin").value === getAdminPin()) {
    adminUnlocked = true;
    $("adminPin").value = "";
    updateAdminModal();
    toast("Admin workspace unlocked.");
    playSound("success");
  } else {
    toast("Incorrect PIN. Try again.");
    playSound("error");
  }
});

$("changePinBtn").addEventListener("click", () => {
  const newPin = prompt("Enter a new PIN (at least 4 characters):");
  if (!newPin) return;

  if (newPin.trim().length < 4) {
    toast("Your PIN must contain at least 4 characters.");
    return;
  }

  localStorage.setItem(STORAGE.pin, newPin.trim());
  toast("Local admin PIN updated.");
});

$("lockAdminBtn").addEventListener("click", () => {
  adminUnlocked = false;
  updateAdminModal();
  toast("Admin workspace locked.");
});

/* ---------- MODALS ---------- */

function openModal(id) {
  $(id).classList.add("show");
}

function closeModal(id) {
  $(id).classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) backdrop.classList.remove("show");
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-backdrop").forEach(modal => {
      modal.classList.remove("show");
    });
  }
});

/* ---------- THEMES ---------- */

function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  localStorage.setItem(STORAGE.theme, theme);
}

applyTheme(localStorage.getItem(STORAGE.theme) || "dark");

$("themeBtn").addEventListener("click", () => {
  const next = document.body.classList.contains("light-theme") ? "dark" : "light";
  applyTheme(next);
  toast(`${next === "light" ? "Light" : "Dark"} appearance enabled.`);
  playSound("click");
});

/* ---------- SOUND ---------- */

$("soundBtn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  $("soundBtn").textContent = soundEnabled ? "♫" : "♪";
  toast(soundEnabled ? "Sound effects enabled." : "Sound effects muted.");

  if (soundEnabled) playSound("success");
});

/* ---------- NAVIGATION ---------- */

document.querySelectorAll(".nav-link[href^='#']").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link[href^='#']").forEach(item =>
      item.classList.remove("active")
    );

    link.classList.add("active");
  });
});

/* ---------- REFRESH ALL COMPONENTS ---------- */

function refreshUI() {
  renderContacts();
  renderTree();
  renderAnalytics();
  renderInorder();
  renderActivity();
}

/* ---------- INITIALIZE ---------- */

function initializeApp() {
  // Remove malformed or duplicate records from old local storage.
  const unique = new Map();

  contacts.forEach(contact => {
    if (validContact(contact)) {
      unique.set(Number(contact.id), {
        id: Number(contact.id),
        name: String(contact.name).trim(),
        phone: String(contact.phone).trim()
      });
    }
  });

  contacts = Array.from(unique.values());
  rebuildTree();
  saveData();

  $("todayDate").textContent = new Date().toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  $("footerYear").textContent = new Date().getFullYear();

  refreshUI();
}

initializeApp();
