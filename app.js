
/* ==========================================
   CONTACTHUB - BINARY SEARCH TREE ENGINE
========================================== */

// BST NODE

class Node {
    constructor(id, name, phone) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.left = null;
        this.right = null;
    }
}

// BINARY SEARCH TREE

class BinarySearchTree {

    constructor() {
        this.root = null;
    }

    // INSERT

    insert(id, name, phone) {

        const newNode = new Node(id, name, phone);

        if (this.root === null) {
            this.root = newNode;
            return true;
        }

        let current = this.root;

        while (true) {

            if (id === current.id) {
                return false;
            }

            if (id < current.id) {

                if (current.left === null) {
                    current.left = newNode;
                    return true;
                }

                current = current.left;

            } else {

                if (current.right === null) {
                    current.right = newNode;
                    return true;
                }

                current = current.right;
            }
        }
    }

    // SEARCH

    search(id) {

        let current = this.root;

        while (current !== null) {

            if (id === current.id) {
                return current;
            }

            if (id < current.id) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    // FIND MINIMUM NODE

    findMin(node) {

        let current = node;

        while (current && current.left !== null) {
            current = current.left;
        }

        return current;
    }

    // DELETE

    delete(id) {

        const result = {
            root: this.root,
            deleted: false
        };

        const removeNode = (node, targetId) => {

            if (node === null) {
                return null;
            }

            if (targetId < node.id) {

                node.left = removeNode(node.left, targetId);

            } else if (targetId > node.id) {

                node.right = removeNode(node.right, targetId);

            } else {

                result.deleted = true;

                // CASE 1: NO CHILDREN

                if (node.left === null && node.right === null) {
                    return null;
                }

                // CASE 2: ONE CHILD

                if (node.left === null) {
                    return node.right;
                }

                if (node.right === null) {
                    return node.left;
                }

                // CASE 3: TWO CHILDREN

                const successor = this.findMin(node.right);

                node.id = successor.id;
                node.name = successor.name;
                node.phone = successor.phone;

                node.right = removeNode(node.right, successor.id);
            }

            return node;
        };

        this.root = removeNode(this.root, id);

        result.root = this.root;

        return result.deleted;
    }

    // INORDER TRAVERSAL: LEFT, ROOT, RIGHT

    inorder() {

        const result = [];

        const traverse = (node) => {

            if (node === null) return;

            traverse(node.left);

            result.push(node);

            traverse(node.right);
        };

        traverse(this.root);

        return result;
    }

    // TREE HEIGHT

    height(node = this.root) {

        if (node === null) return 0;

        return 1 + Math.max(
            this.height(node.left),
            this.height(node.right)
        );
    }

    // TOTAL NODES

    count() {
        return this.inorder().length;
    }
}


// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

const bst = new BinarySearchTree();

let searchOperations = 0;
let ascendingOrder = true;

const STORAGE_KEY = "contacthub_bst_contacts";

const $ = (id) => document.getElementById(id);


// ==========================================
// LOCAL STORAGE
// ==========================================

function saveContacts() {

    const contacts = bst.inorder().map(node => ({
        id: node.id,
        name: node.name,
        phone: node.phone
    }));

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(contacts)
    );
}

function loadContacts() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(saved)) return;

        saved.forEach(contact => {

            if (
                Number.isSafeInteger(contact.id) &&
                contact.id > 0 &&
                typeof contact.name === "string" &&
                typeof contact.phone === "string" &&
                !bst.search(contact.id)
            ) {
                bst.insert(
                    contact.id,
                    contact.name,
                    contact.phone
                );
            }
        });

    } catch (error) {
        console.error("Unable to load contacts:", error);
    }
}


// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = "toast" +
        (type === "error" ? " error" : "");

    toast.textContent = message;

    $("toastContainer").appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ==========================================
// ADD CONTACT
// ==========================================

$("contactForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const id = Number($("contactId").value);
    const name = $("contactName").value.trim();
    const phone = $("contactPhone").value.trim();

    const message = $("formMessage");

    if (!Number.isSafeInteger(id) || id <= 0) {

        message.textContent = "Please enter a valid positive integer ID.";
        message.style.color = "#ff829b";
        return;
    }

    if (!name || !phone) {

        message.textContent = "Please complete all fields.";
        message.style.color = "#ff829b";
        return;
    }

    if (bst.search(id)) {

        message.textContent = "This Contact ID already exists!";
        message.style.color = "#ff829b";

        showToast("Duplicate Contact ID is not allowed!", "error");

        return;
    }

    const inserted = bst.insert(id, name, phone);

    if (inserted) {

        saveContacts();

        this.reset();

        message.textContent =
            "✓ Contact successfully inserted into the BST.";

        message.style.color = "#65e8b8";

        showToast("Contact added successfully!");

        refreshDashboard();

        $("treeMessage").textContent =
            "New node inserted into the Binary Search Tree.";

    }
});


// ==========================================
// SEARCH CONTACT
// ==========================================

function searchContact() {

    const id = Number($("searchId").value);

    const resultBox = $("searchResult");

    if (
        $("searchId").value.trim() === "" ||
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {
        showToast("Enter a valid Contact ID.", "error");
        return;
    }

    searchOperations++;

    const result = bst.search(id);

    $("searchCount").textContent = searchOperations;

    if (result) {

        resultBox.innerHTML = `
            <div class="result-placeholder">✓</div>
            <div>
                <strong class="found-result">
                    Contact Found
                </strong>
                <p>
                    ID: ${result.id}<br>
                    Name: ${escapeHTML(result.name)}<br>
                    Phone: ${escapeHTML(result.phone)}
                </p>
            </div>
        `;

        showToast("Contact found in BST!");

    } else {

        resultBox.innerHTML = `
            <div class="result-placeholder">!</div>
            <div>
                <strong style="color:#ff8ba1">
                    Contact Not Found
                </strong>
                <p>No contact exists with ID ${id}.</p>
            </div>
        `;

        showToast("Contact not found!", "error");
    }
}

$("searchBtn").addEventListener("click", searchContact);

$("searchId").addEventListener("keydown", event => {

    if (event.key === "Enter") {
        searchContact();
    }
});


// ==========================================
// DELETE CONTACT
// ==========================================

function deleteContact(id) {

    if (!Number.isSafeInteger(id) || id <= 0) {
        showToast("Enter a valid Contact ID.", "error");
        return;
    }

    const deleted = bst.delete(id);

    if (deleted) {

        saveContacts();

        refreshDashboard();

        $("searchResult").innerHTML = `
            <div class="result-placeholder">✓</div>
            <p>Contact ID ${id} was successfully deleted.</p>
        `;

        $("treeMessage").textContent =
            "Contact removed and BST structure updated.";

        showToast("Contact deleted successfully!");

    } else {

        showToast("Contact ID not found!", "error");
    }
}

$("deleteBtn").addEventListener("click", () => {

    const id = Number($("searchId").value);

    if (!$("searchId").value.trim()) {
        showToast("Enter the Contact ID to delete.", "error");
        return;
    }

    deleteContact(id);
});


// ==========================================
// SAFE HTML OUTPUT
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {

    const total = bst.count();

    $("totalContacts").textContent = total;
    $("treeNodes").textContent = total;
    $("treeHeight").textContent = bst.height();
    $("searchCount").textContent = searchOperations;

    $("radarCount").textContent =
        total + (total === 1 ? " NODE" : " NODES");

    $("directoryCount").textContent =
        "Showing " + total +
        (total === 1 ? " contact" : " contacts");

    if (bst.root) {
        $("treeRootInfo").textContent =
            "ROOT: " + bst.root.id;
    } else {
        $("treeRootInfo").textContent = "ROOT: NONE";
    }
}


// ==========================================
// CONTACT DIRECTORY
// ==========================================

function renderContactTable() {

    const tbody = $("contactTableBody");

    let contacts = bst.inorder();

    if (!ascendingOrder) {
        contacts = [...contacts].reverse();
    }

    const filter = $("directorySearch").value
        .trim()
        .toLowerCase();

    contacts = contacts.filter(contact => {

        return (
            String(contact.id).includes(filter) ||
            contact.name.toLowerCase().includes(filter) ||
            contact.phone.toLowerCase().includes(filter)
        );
    });

    if (contacts.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No matching contacts found.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = contacts.map(contact => {

        const initial = escapeHTML(
            contact.name.charAt(0).toUpperCase()
        );

        return `
            <tr>
                <td>
                    <span class="id-pill">#${contact.id}</span>
                </td>

                <td>
                    <div class="contact-person">
                        <div class="contact-initial">
                            ${initial}
                        </div>
                        <span>${escapeHTML(contact.name)}</span>
                    </div>
                </td>

                <td>${escapeHTML(contact.phone)}</td>

                <td>
                    <span class="status-pill">● Active</span>
                </td>

                <td>
                    <button class="row-delete"
                        data-delete-id="${contact.id}">
                        Remove
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


// Directory filtering

$("directorySearch").addEventListener("input", () => {
    renderContactTable();
});


// Delete from directory

$("contactTableBody").addEventListener("click", event => {

    const button = event.target.closest("[data-delete-id]");

    if (!button) return;

    const id = Number(button.dataset.deleteId);

    deleteContact(id);
});


// Sort order

$("sortBtn").addEventListener("click", () => {

    ascendingOrder = !ascendingOrder;

    $("sortBtn").textContent = ascendingOrder
        ? "↕ ID: LOW TO HIGH"
        : "↕ ID: HIGH TO LOW";

    renderContactTable();
});


// ==========================================
// REAL BST TREE VISUALIZATION
// ==========================================

function renderTree() {

    const svg = $("treeSvg");

    const empty = $("emptyTree");

    svg.innerHTML = "";

    if (bst.root === null) {

        empty.style.display = "flex";

        $("treeMessage").textContent =
            "Waiting for contact insertion...";

        return;
    }

    empty.style.display = "none";

    const NS = "http://www.w3.org/2000/svg";

    const nodeRadius = 21;
    const levelGap = 85;
    const margin = 65;

    const nodes = [];
    const edges = [];

    // Determine the actual horizontal positions
    // using inorder sequence.

    let position = 0;

    function calculatePositions(node, depth = 0) {

        if (!node) return;

        calculatePositions(node.left, depth + 1);

        nodes.push({
            node,
            x: margin + position * 85,
            y: 55 + depth * levelGap,
            depth
        });

        position++;

        calculatePositions(node.right, depth + 1);
    }

    calculatePositions(bst.root);

    const nodeMap = new Map();

    nodes.forEach(item => {
        nodeMap.set(item.node.id, item);
    });

    // Build parent-child edges

    function buildEdges(node) {

        if (!node) return;

        if (node.left) {

            edges.push({
                parent: node,
                child: node.left
            });

            buildEdges(node.left);
        }

        if (node.right) {

            edges.push({
                parent: node,
                child: node.right
            });

            buildEdges(node.right);
        }
    }

    buildEdges(bst.root);

    const maxDepth = bst.height();

    const maxX = Math.max(
        400,
        margin * 2 + (nodes.length - 1) * 85
    );

    const maxY = 100 + maxDepth * levelGap;

    svg.setAttribute("width", maxX);
    svg.setAttribute("height", maxY);
    svg.setAttribute("viewBox", `0 0 ${maxX} ${maxY}`);

    // Draw connections FIRST so that nodes appear above them.

    edges.forEach(edge => {

        const parent = nodeMap.get(edge.parent.id);
        const child = nodeMap.get(edge.child.id);

        const line = document.createElementNS(NS, "line");

        line.setAttribute("x1", parent.x);
        line.setAttribute("y1", parent.y + nodeRadius);
        line.setAttribute("x2", child.x);
        line.setAttribute("y2", child.y - nodeRadius);

        line.setAttribute("class", "tree-edge");

        svg.appendChild(line);
    });

    // Draw the actual nodes

    nodes.forEach(item => {

        const group = document.createElementNS(NS, "g");

        group.setAttribute("class", "tree-node-group");

        const circle = document.createElementNS(NS, "circle");

        circle.setAttribute("cx", item.x);
        circle.setAttribute("cy", item.y);
        circle.setAttribute("r", nodeRadius);

        circle.setAttribute(
            "class",
            item.node === bst.root
                ? "tree-node root"
                : "tree-node"
        );

        const text = document.createElementNS(NS, "text");

        text.setAttribute("x", item.x);
        text.setAttribute("y", item.y);
        text.setAttribute("class", "tree-node-text");
        text.textContent = item.node.id;

        const label = document.createElementNS(NS, "text");

        label.setAttribute("x", item.x);
        label.setAttribute("y", item.y + 36);
        label.setAttribute("class", "tree-node-label");
        label.textContent = item.node.name.length > 12
            ? item.node.name.substring(0, 11) + "…"
            : item.node.name;

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(label);

        group.addEventListener("click", () => {

            $("searchId").value = item.node.id;

            $("searchResult").innerHTML = `
                <div class="result-placeholder">✓</div>
                <div>
                    <strong class="found-result">
                        Selected BST Node
                    </strong>
                    <p>
                        ID: ${item.node.id}<br>
                        Name: ${escapeHTML(item.node.name)}<br>
                        Phone: ${escapeHTML(item.node.phone)}
                    </p>
                </div>
            `;

        });

        svg.appendChild(group);
    });

    $("treeMessage").textContent =
        "BST updated successfully · " +
        nodes.length + " nodes rendered";
}


// ==========================================
// INORDER TRAVERSAL VISUALIZATION
// ==========================================

$("traverseBtn").addEventListener("click", () => {

    const output = $("traversalOutput");

    const sortedNodes = bst.inorder();

    if (sortedNodes.length === 0) {

        output.innerHTML = `
            <span class="traversal-placeholder">
                No contacts available for traversal.
            </span>
        `;

        showToast("Insert contacts before traversal.", "error");

        return;
    }

    output.innerHTML = sortedNodes.map((node, index) => {

        return `
            <span class="traversal-node"
                style="animation-delay:${index * 70}ms">
                ${node.id}
            </span>
        `;

    }).join("");

    $("treeMessage").textContent =
        "Inorder traversal completed successfully.";

    showToast("Inorder traversal completed!");
});


// ==========================================
// RESET TREE VIEW
// ==========================================

$("resetViewBtn").addEventListener("click", () => {

    renderTree();

    const viewport = $("treeViewport");

    viewport.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
    });

    showToast("Tree visualization refreshed.");
});


// ==========================================
// COMPLETE DASHBOARD REFRESH
// ==========================================

function refreshDashboard() {

    updateStatistics();

    renderContactTable();

    renderTree();
}


// ==========================================
// DATE
// ==========================================

function updateDate() {

    const now = new Date();

    $("currentDate").textContent =
        now.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

document.querySelectorAll(".nav-item").forEach(link => {

    link.addEventListener("click", () => {

        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});


// ==========================================
// START APPLICATION
// ==========================================

function initializeContactHub() {

    loadContacts();

    updateDate();

    refreshDashboard();

    console.log("ContactHub initialized successfully.");
    console.log("Binary Search Tree is ready.");
}

initializeContactHub();
