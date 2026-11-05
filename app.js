
/* ==========================================
   CONTACTHUB
   Binary Search Tree Contact Management
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

        if (!this.root) {
            this.root = newNode;
            return true;
        }

        let current = this.root;

        while (true) {
            if (id === current.id) return false;

            if (id < current.id) {
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
    }

    // SEARCH
    search(id) {
        let current = this.root;

        while (current) {
            if (id === current.id) return current;

            if (id < current.id) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }

    // DELETE
    delete(id) {
        let deleted = false;

        const remove = (node, id) => {
            if (!node) return null;

            if (id < node.id) {
                node.left = remove(node.left, id);
            } else if (id > node.id) {
                node.right = remove(node.right, id);
            } else {
                deleted = true;

                // CASE 1: NO CHILDREN
                if (!node.left && !node.right) {
                    return null;
                }

                // CASE 2: ONE CHILD
                if (!node.left) return node.right;
                if (!node.right) return node.left;

                // CASE 3: TWO CHILDREN
                // Find inorder successor
                let successor = node.right;

                while (successor.left) {
                    successor = successor.left;
                }

                node.id = successor.id;
                node.name = successor.name;
                node.phone = successor.phone;

                node.right = removeSuccessor(node.right, successor.id);
            }

            return node;
        };

        const removeSuccessor = (node, id) => {
            if (!node) return null;

            if (id < node.id) {
                node.left = removeSuccessor(node.left, id);
            } else if (id > node.id) {
                node.right = removeSuccessor(node.right, id);
            } else {
                if (!node.left) return node.right;
                if (!node.right) return node.left;
            }

            return node;
        };

        this.root = remove(this.root, id);
        return deleted;
    }

    // INORDER TRAVERSAL: LEFT, ROOT, RIGHT
    inorder() {
        const result = [];

        const traverse = (node) => {
            if (!node) return;

            traverse(node.left);
            result.push(node);
            traverse(node.right);
        };

        traverse(this.root);
        return result;
    }

    // TREE HEIGHT
    height(node = this.root) {
        if (!node) return 0;

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


// INITIALIZE TREE
const bst = new BinarySearchTree();


// LOAD SAVED CONTACTS
function loadContacts() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("contacthub_contacts") || "[]"
        );

        if (!Array.isArray(saved)) return;

        saved.forEach(contact => {
            if (
                Number.isSafeInteger(contact.id) &&
                contact.id > 0 &&
                typeof contact.name === "string" &&
                typeof contact.phone === "string"
            ) {
                bst.insert(
                    contact.id,
                    contact.name,
                    contact.phone
                );
            }
        });
    } catch (error) {
        console.error("Unable to load saved contacts:", error);
        showToast("Could not load saved contacts.");
    }
}


// SAVE CONTACTS
function saveContacts() {
    localStorage.setItem(
        "contacthub_contacts",
        JSON.stringify(bst.inorder())
    );
}


// SAFE HTML TEXT
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


// TOAST MESSAGE
let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ACTIVITY LOG
function addActivity(title, description, symbol = "✳", color = "purple") {
    const activityList = document.getElementById("activityList");

    const item = document.createElement("div");
    item.className = "activity-item";

    const icon = document.createElement("div");
    icon.className = `activity-symbol ${color}`;
    icon.textContent = symbol;

    const details = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = title;

    const message = document.createElement("small");
    message.textContent = description;

    const time = document.createElement("time");
    time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    details.append(heading, message, time);
    item.append(icon, details);

    activityList.prepend(item);

    // Keep recent activity limited
    while (activityList.children.length > 8) {
        activityList.lastElementChild.remove();
    }
}


// MODAL CONTROLS
function openContactModal() {
    document.getElementById("contactModal").classList.add("show");
    document.getElementById("contactId").focus();
}

function closeContactModal() {
    document.getElementById("contactModal").classList.remove("show");
    document.getElementById("contactForm").reset();
}


// INSERT CONTACT
document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const id = Number(document.getElementById("contactId").value);
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();

    if (!Number.isSafeInteger(id) || id <= 0) {
        showToast("Enter a valid positive contact ID.");
        return;
    }

    if (name.length < 2) {
        showToast("Please enter a valid contact name.");
        return;
    }

    if (!/^[+()\d\s.-]{7,20}$/.test(phone)) {
        showToast("Please enter a valid phone number.");
        return;
    }

    if (bst.search(id)) {
        showToast("Contact ID already exists!");
        return;
    }

    const inserted = bst.insert(id, name, phone);

    if (inserted) {
        saveContacts();
        refreshDashboard();

        addActivity(
            "Contact inserted",
            `${name} · ID ${id}`,
            "＋",
            "purple"
        );

        showToast("Contact successfully inserted into BST!");
        closeContactModal();
    }
});


// SEARCH CONTACT
function searchContact() {
    const input = document.getElementById("searchId");
    const id = Number(input.value);

    if (!Number.isSafeInteger(id) || id <= 0 || input.value.trim() === "") {
        showToast("Enter a valid contact ID.");
        return;
    }

    const contact = bst.search(id);

    if (contact) {
        showToast(`Found: ${contact.name} · ${contact.phone}`);

        addActivity(
            "Contact searched",
            `${contact.name} · ID ${id}`,
            "⌕",
            "blue"
        );

        highlightContact(id);
    } else {
        showToast(`Contact ID ${id} not found!`);

        addActivity(
            "Search unsuccessful",
            `No contact found with ID ${id}`,
            "!",
            "pink"
        );
    }
}


// DELETE CONTACT
function deleteContact() {
    const input = document.getElementById("deleteId");
    const id = Number(input.value);

    if (!Number.isSafeInteger(id) || id <= 0 || input.value.trim() === "") {
        showToast("Enter a valid contact ID.");
        return;
    }

    const contact = bst.search(id);

    if (!contact) {
        showToast(`Contact ID ${id} not found!`);

        addActivity(
            "Delete unsuccessful",
            `Contact ID ${id} does not exist`,
            "!",
            "pink"
        );

        return;
    }

    const name = contact.name;
    const deleted = bst.delete(id);

    if (deleted) {
        saveContacts();
        refreshDashboard();

        addActivity(
            "Contact deleted",
            `${name} · ID ${id} removed`,
            "−",
            "pink"
        );

        showToast("Contact successfully deleted!");
        input.value = "";
    }
}


// DISPLAY CONTACTS USING INORDER
function displayContacts() {
    const contacts = bst.inorder();

    refreshTable(contacts);
    displayTraversal(contacts);

    document.getElementById("contacts").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    addActivity(
        "Inorder traversal executed",
        `${contacts.length} contacts displayed in ascending order`,
        "≡",
        "cyan"
    );

    showToast("Contacts displayed in ascending ID order!");
}


// CONTACT TABLE
function refreshTable(contacts = bst.inorder()) {
    const tbody = document.getElementById("contactsTable");

    tbody.innerHTML = "";

    if (contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No contacts found.
                </td>
            </tr>
        `;

        document.getElementById("tableCount").textContent =
            "Showing 0 contacts";

        return;
    }

    contacts.forEach(contact => {
        const initials = contact.name
            .split(/\s+/)
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

        const row = document.createElement("tr");

        row.innerHTML = `
            <td><span class="id-badge">#${contact.id}</span></td>

            <td>
                <div class="contact-name">
                    <div class="contact-avatar">${escapeHTML(initials)}</div>
                    ${escapeHTML(contact.name)}
                </div>
            </td>

            <td>${escapeHTML(contact.phone)}</td>

            <td><span class="status-badge">● Active</span></td>

            <td>
                <button class="row-delete" data-id="${contact.id}">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    document.getElementById("tableCount").textContent =
        `Showing ${contacts.length} contact${contacts.length === 1 ? "" : "s"}`;
}


// TABLE DELETE BUTTONS
document.getElementById("contactsTable").addEventListener("click", function(event) {
    const button = event.target.closest(".row-delete");

    if (!button) return;

    const id = Number(button.dataset.id);
    const contact = bst.search(id);

    if (!contact) return;

    const name = contact.name;

    if (bst.delete(id)) {
        saveContacts();
        refreshDashboard();

        addActivity(
            "Contact deleted",
            `${name} · ID ${id} removed`,
            "−",
            "pink"
        );

        showToast("Contact deleted successfully!");
    }
});


// TABLE FILTER
function filterContacts() {
    const query = document.getElementById("tableSearch")
        .value.trim().toLowerCase();

    const filtered = bst.inorder().filter(contact =>
        String(contact.id).includes(query) ||
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query)
    );

    refreshTable(filtered);
}


// INORDER TRAVERSAL OUTPUT
function displayTraversal(contacts = bst.inorder()) {
    const output = document.getElementById("traversalOutput");

    output.innerHTML = "";

    if (contacts.length === 0) {
        const message = document.createElement("span");
        message.className = "muted";
        message.textContent = "The BST is empty.";
        output.appendChild(message);
        return;
    }

    contacts.forEach((contact, index) => {
        const chip = document.createElement("span");
        chip.className = "traversal-chip";
        chip.textContent = contact.id;
        output.appendChild(chip);

        if (index < contacts.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "traversal-arrow";
            arrow.textContent = "→";
            output.appendChild(arrow);
        }
    });
}


// UPDATE STATISTICS
function refreshDashboard() {
    const contacts = bst.inorder();

    document.getElementById("totalContacts").textContent =
        contacts.length;

    document.getElementById("highestId").textContent =
        contacts.length ? contacts[contacts.length - 1].id : "—";

    document.getElementById("lowestId").textContent =
        contacts.length ? contacts[0].id : "—";

    document.getElementById("treeHeight").textContent =
        bst.height();

    document.getElementById("nodeCount").textContent =
        contacts.length;

    document.getElementById("rootNode").textContent =
        bst.root ? `#${bst.root.id}` : "EMPTY";

    refreshTable(contacts);
    renderTree();
}


// VISUAL BST RENDERER
function renderTree() {
    const svg = document.getElementById("treeSvg");
    const empty = document.getElementById("emptyTree");

    svg.innerHTML = "";

    if (!bst.root) {
        empty.style.display = "flex";
        return;
    }

    empty.style.display = "none";

    const width = 900;
    const height = 345;
    const positions = new Map();
    let index = 0;

    // Assign X positions using inorder order.
    // This preserves the BST's left-to-right ordering.
    function assignPositions(node, depth) {
        if (!node) return;

        assignPositions(node.left, depth + 1);

        positions.set(node.id, {
            x: 45 + index * (width - 90) /
                Math.max(bst.count() - 1, 1),
            y: 38 + depth * 67,
            node: node
        });

        index++;

        assignPositions(node.right, depth + 1);
    }

    assignPositions(bst.root, 0);

    const ns = "http://www.w3.org/2000/svg";

    function createSvg(tag, attrs = {}) {
        const element = document.createElementNS(ns, tag);

        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        svg.appendChild(element);
        return element;
    }

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Draw connecting branches
    function drawEdges(node) {
        if (!node) return;

        const parent = positions.get(node.id);

        [node.left, node.right].forEach(child => {
            if (!child) return;

            const childPosition = positions.get(child.id);

            createSvg("line", {
                x1: parent.x,
                y1: parent.y + 16,
                x2: childPosition.x,
                y2: childPosition.y - 16,
                class: "tree-edge"
            });

            drawEdges(child);
        });
    }

    drawEdges(bst.root);

    // Draw nodes
    function drawNodes(node) {
        if (!node) return;

        const pos = positions.get(node.id);

        const group = createSvg("g", {
            class: "tree-node",
            "data-id": node.id
        });

        const circle = document.createElementNS(ns, "circle");

        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", "17");

        const isRoot = node === bst.root;

        circle.setAttribute(
            "fill",
            isRoot ? "#7650d8" : "#174c81"
        );

        circle.setAttribute(
            "stroke",
            isRoot ? "#c49cff" : "#56b9ff"
        );

        circle.setAttribute("stroke-width", "2.5");
        circle.style.filter = isRoot
            ? "drop-shadow(0 0 9px #a875ff)"
            : "drop-shadow(0 0 7px #388eff)";

        group.appendChild(circle);

        const label = document.createElementNS(ns, "text");

        label.setAttribute("x", pos.x);
        label.setAttribute("y", pos.y);
        label.textContent = node.id;

        group.appendChild(label);

        group.addEventListener("click", () => {
            showToast(`${node.name} · ${node.phone} · ID ${node.id}`);
        });

        svg.appendChild(group);

        drawNodes(node.left);
        drawNodes(node.right);
    }

    drawNodes(bst.root);
}


// HIGHLIGHT SEARCHED CONTACT
function highlightContact(id) {
    const nodes = document.querySelectorAll(".tree-node");

    nodes.forEach(group => {
        const circle = group.querySelector("circle");

        if (Number(group.dataset.id) === id) {
            circle.setAttribute("stroke", "#ffffff");
            circle.setAttribute("stroke-width", "5");
            circle.style.filter = "drop-shadow(0 0 15px #ffffff)";
        }
    });
}


// CLOSE MODAL WHEN CLICKING OUTSIDE
document.getElementById("contactModal").addEventListener("click", function(event) {
    if (event.target === this) {
        closeContactModal();
    }
});


// ESCAPE KEY
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeContactModal();
    }
});


// SIDEBAR ACTIVE LINK
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function() {
        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });
});


// INITIALIZE CONTACTHUB
loadContacts();
refreshDashboard();
displayTraversal();

