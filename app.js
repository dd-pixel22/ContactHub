
/* ==========================================
   CONTACTHUB
   Binary Search Tree Contact Management
========================================== */


// ==========================================
// 1. BST NODE
// ==========================================

class Node {
    constructor(id, name, phone) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.left = null;
        this.right = null;
    }
}


// ==========================================
// 2. BINARY SEARCH TREE
// ==========================================

class BinarySearchTree {

    constructor() {
        this.root = null;
    }

    // INSERT CONTACT
    insert(id, name, phone) {

        const newNode = new Node(id, name, phone);

        if (!this.root) {
            this.root = newNode;
            return true;
        }

        let current = this.root;

        while (true) {

            if (id === current.id) {
                return false;
            }

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


    // SEARCH CONTACT
    search(id) {

        let current = this.root;

        while (current) {

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


    // DELETE CONTACT
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

                // CASE 2: ONLY RIGHT CHILD
                if (!node.left) {
                    return node.right;
                }

                // CASE 2: ONLY LEFT CHILD
                if (!node.right) {
                    return node.left;
                }

                // CASE 3: TWO CHILDREN
                // Find inorder successor

                let successor = node.right;

                while (successor.left) {
                    successor = successor.left;
                }

                node.id = successor.id;
                node.name = successor.name;
                node.phone = successor.phone;

                node.right = removeSuccessor(
                    node.right,
                    successor.id
                );
            }

            return node;
        };


        // Remove inorder successor
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


    // INORDER TRAVERSAL
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


    // TOTAL CONTACTS
    count() {
        return this.inorder().length;
    }
}


// ==========================================
// 3. INITIALIZE BST
// ==========================================

const bst = new BinarySearchTree();


// ==========================================
// 4. LOAD SAVED CONTACTS
// ==========================================

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

        console.error("Unable to load contacts:", error);

        showToast("Could not load saved contacts.");
    }
}


// ==========================================
// 5. SAVE CONTACTS
// ==========================================

function saveContacts() {

    localStorage.setItem(
        "contacthub_contacts",
        JSON.stringify(bst.inorder())
    );
}


// ==========================================
// 6. SAFE HTML TEXT
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[char]);
}


// ==========================================
// 7. TOAST MESSAGE
// ==========================================

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


// ==========================================
// 8. ACTIVITY LOG
// ==========================================

function addActivity(
    title,
    description,
    symbol = "✳",
    color = "purple"
) {

    const activityList =
        document.getElementById("activityList");

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

    while (activityList.children.length > 8) {
        activityList.lastElementChild.remove();
    }
}


// ==========================================
// 9. MODAL CONTROLS
// ==========================================

function openContactModal() {

    document.getElementById("contactModal")
        .classList.add("show");

    document.getElementById("contactId").focus();
}


function closeContactModal() {

    document.getElementById("contactModal")
        .classList.remove("show");

    document.getElementById("contactForm").reset();
}


// ==========================================
// 10. INSERT CONTACT
// ==========================================

document.getElementById("contactForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const id = Number(
        document.getElementById("contactId").value
    );

    const name = document.getElementById("contactName")
        .value.trim();

    const phone = document.getElementById("contactPhone")
        .value.trim();


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


// ==========================================
// 11. SEARCH CONTACT
// ==========================================

function searchContact() {

    const input = document.getElementById("searchId");

    const id = Number(input.value);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        input.value.trim() === ""
    ) {

        showToast("Enter a valid contact ID.");

        return;
    }


    const contact = bst.search(id);


    if (contact) {

        showToast(
            `Found: ${contact.name} · ${contact.phone}`
        );

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


// ==========================================
// 12. DELETE CONTACT
// ==========================================

function deleteContact() {

    const input = document.getElementById("deleteId");

    const id = Number(input.value);


    if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        input.value.trim() === ""
    ) {

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


// ==========================================
// 13. DISPLAY CONTACTS
// ==========================================

function displayContacts() {

    const contacts = bst.inorder();

    refreshTable(contacts);

    displayTraversal(contacts);

    document.getElementById("contacts")
        .scrollIntoView({
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


// ==========================================
// 14. CONTACT TABLE
// ==========================================

function refreshTable(contacts = bst.inorder()) {

    const tbody = document.getElementById("contactsTable");

    tbody.innerHTML = "";

    if (contacts.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-table";
        cell.textContent = "No contacts found.";

        row.appendChild(cell);

        tbody.appendChild(row);

        document.getElementById("tableCount")
            .textContent = "Showing 0 contacts";

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
            <td>
                <span class="id-badge">#${contact.id}</span>
            </td>

            <td>
                <div class="contact-name">
                    <div class="contact-avatar">
                        ${escapeHTML(initials)}
                    </div>
                    ${escapeHTML(contact.name)}
                </div>
            </td>

            <td>${escapeHTML(contact.phone)}</td>

            <td>
                <span class="status-badge">● Active</span>
            </td>

            <td>
                <button class="row-delete" data-id="${contact.id}">
                    Delete
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });


    document.getElementById("tableCount")
        .textContent =
        `Showing ${contacts.length} contact${contacts.length === 1 ? "" : "s"}`;
}


// ==========================================
// 15. TABLE DELETE BUTTONS
// ==========================================

document.getElementById("contactsTable")
.addEventListener("click", function(event) {

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


// ==========================================
// 16. FILTER CONTACTS
// ==========================================

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


// ==========================================
// 17. INORDER TRAVERSAL OUTPUT
// ==========================================

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


// ==========================================
// 18. UPDATE DASHBOARD
// ==========================================

function refreshDashboard() {

    const contacts = bst.inorder();

    document.getElementById("totalContacts")
        .textContent = contacts.length;

    document.getElementById("highestId")
        .textContent = contacts.length
            ? contacts[contacts.length - 1].id
            : "—";

    document.getElementById("lowestId")
        .textContent = contacts.length
            ? contacts[0].id
            : "—";

    document.getElementById("treeHeight")
        .textContent = bst.height();

    document.getElementById("nodeCount")
        .textContent = contacts.length;

    document.getElementById("rootNode")
        .textContent = bst.root
            ? `#${bst.root.id}`
            : "EMPTY";

    refreshTable(contacts);

    renderTree();
}


// ==========================================
// 19. ACTUAL HIERARCHICAL BST VISUALIZER
// ==========================================

function renderTree() {

    const svg = document.getElementById("treeSvg");

    const empty = document.getElementById("emptyTree");

    svg.innerHTML = "";

    if (!bst.root) {

        empty.style.display = "flex";

        svg.style.width = "900px";
        svg.style.height = "345px";

        return;
    }

    empty.style.display = "none";


    // SVG namespace
    const ns = "http://www.w3.org/2000/svg";


    // TREE DIMENSIONS
    const totalNodes = bst.count();

    const treeHeight = bst.height();

    const nodeRadius = 19;

    const horizontalGap = 105;

    const verticalGap = 85;

    const margin = 65;

    const width = Math.max(
        900,
        totalNodes * horizontalGap + margin * 2
    );

    const height = Math.max(
        345,
        100 + treeHeight * verticalGap
    );


    svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    svg.setAttribute(
        "preserveAspectRatio",
        "xMinYMin meet"
    );

    svg.style.width = `${width}px`;

    svg.style.height = `${height}px`;


    // ======================================
    // STEP A: CALCULATE REAL NODE POSITIONS
    // ======================================

    const positions = new Map();

    let inorderIndex = 0;


    function calculatePositions(node, depth) {

        if (!node) return;


        // LEFT SUBTREE
        calculatePositions(node.left, depth + 1);


        // CURRENT NODE
        const x = margin +
            inorderIndex * horizontalGap;

        const y = 48 + depth * verticalGap;


        positions.set(node.id, {
            x: x,
            y: y,
            node: node,
            depth: depth
        });

        inorderIndex++;


        // RIGHT SUBTREE
        calculatePositions(node.right, depth + 1);
    }


    calculatePositions(bst.root, 0);


    // ======================================
    // STEP B: SVG ELEMENT CREATOR
    // ======================================

    function makeElement(tag, attributes, parent = svg) {

        const element = document.createElementNS(ns, tag);

        Object.entries(attributes).forEach(([key, value]) => {

            element.setAttribute(key, value);

        });

        parent.appendChild(element);

        return element;
    }


    // ======================================
    // STEP C: DRAW CONNECTIONS
    // ======================================

    function drawConnections(node) {

        if (!node) return;

        const parent = positions.get(node.id);


        // CONNECT LEFT CHILD
        if (node.left) {

            const child = positions.get(node.left.id);

            makeElement("line", {

                x1: parent.x,
                y1: parent.y + nodeRadius,

                x2: child.x,
                y2: child.y - nodeRadius,

                class: "tree-edge"

            });

            drawConnections(node.left);
        }


        // CONNECT RIGHT CHILD
        if (node.right) {

            const child = positions.get(node.right.id);

            makeElement("line", {

                x1: parent.x,
                y1: parent.y + nodeRadius,

                x2: child.x,
                y2: child.y - nodeRadius,

                class: "tree-edge"

            });

            drawConnections(node.right);
        }
    }


    // Draw all branches before nodes
    drawConnections(bst.root);


    // ======================================
    // STEP D: DRAW NODE CIRCLES
    // ======================================

    function drawNodes(node) {

        if (!node) return;

        const pos = positions.get(node.id);

        const isRoot = node === bst.root;


        const group = makeElement("g", {

            class: "tree-node",

            "data-id": node.id

        });


        // Node circle
        makeElement("circle", {

            cx: pos.x,
            cy: pos.y,

            r: nodeRadius,

            fill: isRoot ? "#7650d8" : "#174c81",

            stroke: isRoot ? "#d1aaff" : "#55c9ff",

            "stroke-width": isRoot ? 3 : 2,

            filter: isRoot
                ? "url(#rootGlow)"
                : "url(#nodeGlow)"

        }, group);


        // Contact ID
        const label = makeElement("text", {

            x: pos.x,

            y: pos.y + 4,

            "text-anchor": "middle",

            fill: "#ffffff",

            "font-size": "12",

            "font-weight": "700"

        }, group);


        label.textContent = node.id;


        // Root label
        if (isRoot) {

            const rootLabel = makeElement("text", {

                x: pos.x,

                y: pos.y - 30,

                "text-anchor": "middle",

                fill: "#c5a7ff",

                "font-size": "10",

                "font-weight": "700"

            }, group);

            rootLabel.textContent = "ROOT";
        }


        // Display contact information on clicking node
        group.addEventListener("click", () => {

            showToast(
                `${node.name} | ${node.phone} | ID: ${node.id}`
            );

        });


        // LEFT SUBTREE
        drawNodes(node.left);


        // RIGHT SUBTREE
        drawNodes(node.right);
    }


    // ======================================
    // STEP E: ADD GLOW EFFECTS
    // ======================================

    const defs = makeElement("defs", {});


    const rootFilter = makeElement("filter", {

        id: "rootGlow",

        x: "-100%",

        y: "-100%",

        width: "300%",

        height: "300%"

    }, defs);


    makeElement("feGaussianBlur", {

        stdDeviation: "5",

        result: "blur"

    }, rootFilter);


    const rootMerge = makeElement("feMerge", {}, rootFilter);

    makeElement("feMergeNode", {
        in: "blur"
    }, rootMerge);

    makeElement("feMergeNode", {
        in: "SourceGraphic"
    }, rootMerge);


    const nodeFilter = makeElement("filter", {

        id: "nodeGlow",

        x: "-100%",

        y: "-100%",

        width: "300%",

        height: "300%"

    }, defs);


    makeElement("feGaussianBlur", {

        stdDeviation: "3",

        result: "blur"

    }, nodeFilter);


    const nodeMerge = makeElement("feMerge", {}, nodeFilter);

    makeElement("feMergeNode", {
        in: "blur"
    }, nodeMerge);

    makeElement("feMergeNode", {
        in: "SourceGraphic"
    }, nodeMerge);


    // Draw nodes last so branches stay behind them
    drawNodes(bst.root);
}


// ==========================================
// 20. HIGHLIGHT SEARCHED CONTACT
// ==========================================

function highlightContact(id) {

    const nodes = document.querySelectorAll(".tree-node");

    nodes.forEach(group => {

        const circle = group.querySelector("circle");

        if (Number(group.dataset.id) === id) {

            circle.setAttribute("stroke", "#ffffff");

            circle.setAttribute("stroke-width", "5");

            circle.style.filter =
                "drop-shadow(0 0 15px #ffffff)";
        }
    });
}


// ==========================================
// 21. CLOSE MODAL OUTSIDE CLICK
// ==========================================

document.getElementById("contactModal")
.addEventListener("click", function(event) {

    if (event.target === this) {

        closeContactModal();
    }
});


// ==========================================
// 22. ESCAPE KEY
// ==========================================

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeContactModal();
    }
});


// ==========================================
// 23. SIDEBAR ACTIVE LINK
// ==========================================

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function() {

        document.querySelectorAll(".nav-link")
            .forEach(item => {

                item.classList.remove("active");

            });

        this.classList.add("active");
    });
});


// ==========================================
// 24. INITIALIZE CONTACTHUB
// ==========================================

loadContacts();

refreshDashboard();

displayTraversal();

