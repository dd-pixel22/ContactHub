
/* ============================================
   CONTACTHUB — CONTACT MANAGEMENT SYSTEM
   DATA STRUCTURE: BINARY SEARCH TREE
============================================ */


// ============================================
// 1. BST NODE
// ============================================

class Node {
    constructor(id, name, phone) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.left = null;
        this.right = null;
    }
}


// ============================================
// 2. BINARY SEARCH TREE CLASS
// ============================================

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

        const minValue = node => {

            while (node.left) {
                node = node.left;
            }

            return node;
        };


        const remove = (node, id) => {

            if (!node) return null;

            if (id < node.id) {

                node.left = remove(node.left, id);

            } else if (id > node.id) {

                node.right = remove(node.right, id);

            } else {

                deleted = true;

                // CASE 1: LEAF NODE
                if (!node.left && !node.right) {
                    return null;
                }

                // CASE 2: ONE CHILD
                if (!node.left) return node.right;

                if (!node.right) return node.left;

                // CASE 3: TWO CHILDREN
                const successor = minValue(node.right);

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


    // INORDER TRAVERSAL
    inorder() {

        const result = [];

        const traverse = node => {

            if (!node) return;

            traverse(node.left);
            result.push(node);
            traverse(node.right);
        };

        traverse(this.root);

        return result;
    }


    // HEIGHT
    height(node = this.root) {

        if (!node) return 0;

        return 1 + Math.max(
            this.height(node.left),
            this.height(node.right)
        );
    }


    // NODE COUNT
    count() {

        return this.inorder().length;
    }


    // MAXIMUM DEPTH / BALANCE INDICATOR
    minimumHeight(node = this.root) {

        if (!node) return 0;

        return 1 + Math.min(
            this.minimumHeight(node.left),
            this.minimumHeight(node.right)
        );
    }
}


// ============================================
// 3. INITIALIZE
// ============================================

const bst = new BinarySearchTree();


// ============================================
// 4. DOM HELPERS
// ============================================

const $ = id => document.getElementById(id);

let toastTimer;


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}


function initials(name) {

    return name
        .trim()
        .split(/\s+/)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


// ============================================
// 5. TOAST NOTIFICATIONS
// ============================================

function notify(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


// ============================================
// 6. LOCAL STORAGE
// ============================================

function saveContacts() {

    try {

        localStorage.setItem(
            "contacthub_records",
            JSON.stringify(bst.inorder())
        );

    } catch (error) {

        console.error(error);

        notify("Unable to save contacts in this browser.");
    }
}


function loadContacts() {

    try {

        const records = JSON.parse(
            localStorage.getItem("contacthub_records") || "[]"
        );

        if (!Array.isArray(records)) return;

        records.forEach(record => {

            if (
                Number.isSafeInteger(record.id) &&
                record.id > 0 &&
                typeof record.name === "string" &&
                typeof record.phone === "string"
            ) {

                bst.insert(
                    record.id,
                    record.name,
                    record.phone
                );
            }
        });

    } catch (error) {

        console.error("Loading error:", error);
    }
}


// ============================================
// 7. MODAL MANAGEMENT
// ============================================

function openModal() {

    $("contactModal").classList.add("show");

    $("contactId").focus();
}


function closeModal() {

    $("contactModal").classList.remove("show");

    $("contactForm").reset();
}


$("heroAdd").addEventListener("click", openModal);
$("addAction").addEventListener("click", openModal);
$("sidebarAdd").addEventListener("click", openModal);
$("emptyAdd").addEventListener("click", openModal);

$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);


$("contactModal").addEventListener("click", event => {

    if (event.target === $("contactModal")) {
        closeModal();
    }
});


// ============================================
// 8. ACTIVITY LOG
// ============================================

function addActivity(title, description, symbol = "✦", color = "purple") {

    const list = $("activityList");

    const item = document.createElement("div");

    item.className = "activity-item";

    const icon = document.createElement("div");

    icon.className = `activity-icon ${color}`;

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

    list.prepend(item);

    while (list.children.length > 8) {
        list.lastElementChild.remove();
    }
}


// ============================================
// 9. INSERT CONTACT
// ============================================

$("contactForm").addEventListener("submit", event => {

    event.preventDefault();

    const id = Number($("contactId").value);

    const name = $("contactName").value.trim();

    const phone = $("contactPhone").value.trim();


    if (!Number.isSafeInteger(id) || id <= 0) {

        notify("Please enter a valid positive Contact ID.");

        return;
    }


    if (name.length < 2 || name.length > 60) {

        notify("Enter a valid contact name.");

        return;
    }


    if (!/^[+()\d\s.-]{7,20}$/.test(phone)) {

        notify("Enter a valid phone number.");

        return;
    }


    if (bst.search(id)) {

        notify("This Contact ID already exists!");

        return;
    }


    const inserted = bst.insert(id, name, phone);

    if (inserted) {

        saveContacts();

        refreshDashboard();

        addActivity(
            "New contact inserted",
            `${name} · Contact ID ${id}`,
            "＋",
            "purple-symbol"
        );

        closeModal();

        notify(`${name} successfully added to ContactHub!`);
    }
});


// ============================================
// 10. SEARCH CONTACT
// ============================================

function searchContact() {

    const value = $("searchId").value.trim();

    const id = Number(value);

    if (
        value === "" ||
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {

        notify("Enter a valid Contact ID.");

        return;
    }


    const contact = bst.search(id);


    if (contact) {

        addActivity(
            "Contact found",
            `${contact.name} · ID ${contact.id}`,
            "⌕",
            "blue-symbol"
        );

        notify(`Found: ${contact.name} · ${contact.phone}`);

        showContactDetails(contact);

        highlightTreeNode(id);

    } else {

        addActivity(
            "Search unsuccessful",
            `No contact exists with ID ${id}`,
            "!",
            "pink-symbol"
        );

        notify(`Contact ID ${id} not found!`);
    }
}


$("searchAction").addEventListener("click", searchContact);

$("searchId").addEventListener("keydown", event => {

    if (event.key === "Enter") searchContact();

});


// ============================================
// 11. DELETE CONTACT
// ============================================

function deleteContact() {

    const value = $("deleteId").value.trim();

    const id = Number(value);

    if (
        value === "" ||
        !Number.isSafeInteger(id) ||
        id <= 0
    ) {

        notify("Enter a valid Contact ID.");

        return;
    }


    const contact = bst.search(id);

    if (!contact) {

        addActivity(
            "Delete unsuccessful",
            `Contact ID ${id} was not found`,
            "!",
            "pink-symbol"
        );

        notify(`Contact ID ${id} not found!`);

        return;
    }


    const name = contact.name;

    if (bst.delete(id)) {

        saveContacts();

        refreshDashboard();

        addActivity(
            "Contact deleted",
            `${name} · ID ${id} removed`,
            "−",
            "pink-symbol"
        );

        $("deleteId").value = "";

        notify(`${name} deleted successfully!`);
    }
}


$("deleteAction").addEventListener("click", deleteContact);

$("deleteId").addEventListener("keydown", event => {

    if (event.key === "Enter") deleteContact();

});


// ============================================
// 12. CONTACT DETAILS
// ============================================

function showContactDetails(contact) {

    $("contactDetails").innerHTML = `
        <div class="details-content">

            <div class="details-avatar">
                ${escapeHTML(initials(contact.name))}
            </div>

            <div class="details-name">
                ${escapeHTML(contact.name)}
            </div>

            <div class="detail-row">
                <span>CONTACT ID</span>
                <strong>#${contact.id}</strong>
            </div>

            <div class="detail-row">
                <span>PHONE NUMBER</span>
                <strong>${escapeHTML(contact.phone)}</strong>
            </div>

            <div class="detail-row">
                <span>RECORD STATUS</span>
                <strong style="color:#57e4ad">● Active</strong>
            </div>

        </div>
    `;

    $("detailsModal").classList.add("show");
}


$("closeDetails").addEventListener("click", () => {

    $("detailsModal").classList.remove("show");

});


$("detailsModal").addEventListener("click", event => {

    if (event.target === $("detailsModal")) {
        $("detailsModal").classList.remove("show");
    }

});


// ============================================
// 13. CONTACT DIRECTORY
// ============================================

function renderContacts(contacts = bst.inorder()) {

    const tbody = $("contactTable");

    tbody.innerHTML = "";

    if (contacts.length === 0) {

        const row = document.createElement("tr");

        const cell = document.createElement("td");

        cell.colSpan = 5;

        cell.className = "empty-table";

        cell.textContent = "No matching contacts found.";

        row.appendChild(cell);

        tbody.appendChild(row);

    } else {

        contacts.forEach(contact => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <span class="id-label">#${contact.id}</span>
                </td>

                <td>
                    <div class="person">
                        <div class="person-avatar">
                            ${escapeHTML(initials(contact.name))}
                        </div>
                        ${escapeHTML(contact.name)}
                    </div>
                </td>

                <td>${escapeHTML(contact.phone)}</td>

                <td>
                    <span class="contact-status">● Active</span>
                </td>

                <td>
                    <button class="table-delete"
                            data-id="${contact.id}">
                        Delete
                    </button>
                </td>
            `;

            row.addEventListener("dblclick", () => {
                showContactDetails(contact);
            });

            tbody.appendChild(row);
        });
    }


    $("directoryCount").textContent =
        `${contacts.length} contact${contacts.length === 1 ? "" : "s"}`;
}


// ============================================
// 14. TABLE DELETE
// ============================================

$("contactTable").addEventListener("click", event => {

    const button = event.target.closest(".table-delete");

    if (!button) return;

    const id = Number(button.dataset.id);

    const contact = bst.search(id);

    if (!contact) return;

    const name = contact.name;

    if (bst.delete(id)) {

        saveContacts();

        refreshDashboard();

        addActivity(
            "Contact removed",
            `${name} · ID ${id}`,
            "−",
            "pink-symbol"
        );

        notify("Contact removed successfully!");
    }
});


// ============================================
// 15. DIRECTORY SEARCH
// ============================================

$("filterInput").addEventListener("input", () => {

    const query = $("filterInput").value.trim().toLowerCase();

    const filtered = bst.inorder().filter(contact =>

        String(contact.id).includes(query) ||

        contact.name.toLowerCase().includes(query) ||

        contact.phone.toLowerCase().includes(query)

    );

    renderContacts(filtered);
});


// ============================================
// 16. INORDER TRAVERSAL DISPLAY
// ============================================

function showInorder() {

    const contacts = bst.inorder();

    const result = $("traversalResult");

    result.innerHTML = "";

    if (contacts.length === 0) {

        const message = document.createElement("span");

        message.className = "traversal-placeholder";

        message.textContent = "The Binary Search Tree is empty.";

        result.appendChild(message);

    } else {

        contacts.forEach((contact, index) => {

            const chip = document.createElement("span");

            chip.className = "traversal-chip";

            chip.textContent = contact.id;

            result.appendChild(chip);


            if (index < contacts.length - 1) {

                const arrow = document.createElement("span");

                arrow.className = "traversal-arrow";

                arrow.textContent = "→";

                result.appendChild(arrow);
            }
        });
    }

    addActivity(
        "Inorder traversal executed",
        `${contacts.length} records displayed in ascending order`,
        "⇄",
        "cyan-symbol"
    );

    $("traversal").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    notify("Inorder traversal completed!");
}


$("inorderAction").addEventListener("click", showInorder);

$("sidebarTraversal").addEventListener("click", showInorder);

$("sortButton").addEventListener("click", () => {

    renderContacts(bst.inorder());

    notify("Contacts arranged in ascending ID order.");

});


// ============================================
// 17. ACTUAL BST TREE VISUALIZATION
// ============================================

function renderTree() {

    const svg = $("treeSvg");

    const empty = $("treeEmpty");

    svg.innerHTML = "";

    if (!bst.root) {

        empty.style.display = "flex";

        svg.style.width = "100%";

        svg.style.height = "360px";

        return;
    }

    empty.style.display = "none";


    const NS = "http://www.w3.org/2000/svg";

    const radius = 20;

    const horizontalGap = 110;

    const verticalGap = 90;

    const margin = 70;


    // Find number of leaves under each subtree.
    // This provides enough horizontal room for every branch.

    function leafCount(node) {

        if (!node) return 0;

        if (!node.left && !node.right) return 1;

        return leafCount(node.left) + leafCount(node.right);
    }


    const totalLeaves = Math.max(1, leafCount(bst.root));

    const width = Math.max(
        850,
        totalLeaves * horizontalGap + margin * 2
    );

    const height = Math.max(
        360,
        110 + bst.height() * verticalGap
    );


    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    svg.setAttribute("width", width);

    svg.setAttribute("height", height);

    svg.style.width = width + "px";

    svg.style.height = height + "px";


    // SVG element creator

    function create(tag, attrs, parent = svg) {

        const element = document.createElementNS(NS, tag);

        Object.entries(attrs).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        parent.appendChild(element);

        return element;
    }


    // Glow and line gradients

    const defs = create("defs", {});

    const gradient = create("linearGradient", {
        id: "edgeGradient",
        x1: "0%",
        y1: "0%",
        x2: "100%",
        y2: "100%"
    }, defs);

    create("stop", {
        offset: "0%",
        "stop-color": "#49d7ed"
    }, gradient);

    create("stop", {
        offset: "100%",
        "stop-color": "#a16cff"
    }, gradient);


    const filter = create("filter", {
        id: "edgeGlow",
        x: "-50%",
        y: "-50%",
        width: "200%",
        height: "200%"
    }, defs);

    create("feGaussianBlur", {
        stdDeviation: "3",
        result: "blur"
    }, filter);

    const merge = create("feMerge", {}, filter);

    create("feMergeNode", {
        in: "blur"
    }, merge);

    create("feMergeNode", {
        in: "SourceGraphic"
    }, merge);


    const nodeFilter = create("filter", {
        id: "nodeGlow",
        x: "-100%",
        y: "-100%",
        width: "300%",
        height: "300%"
    }, defs);

    create("feGaussianBlur", {
        stdDeviation: "5",
        result: "blur"
    }, nodeFilter);

    const nodeMerge = create("feMerge", {}, nodeFilter);

    create("feMergeNode", {
        in: "blur"
    }, nodeMerge);

    create("feMergeNode", {
        in: "SourceGraphic"
    }, nodeMerge);


    // Position nodes using actual left/right subtree structure.
    // The root is centered above its children.

    const positions = new Map();

    function layout(node, left, right, depth) {

        if (!node) return;

        const x = (left + right) / 2;

        const y = 52 + depth * verticalGap;

        positions.set(node.id, {
            x,
            y,
            node
        });


        if (node.left) {

            const leftWidth =
                leafCount(node.left) * horizontalGap;

            layout(
                node.left,
                left,
                left + leftWidth,
                depth + 1
            );
        }


        if (node.right) {

            const rightWidth =
                leafCount(node.right) * horizontalGap;

            layout(
                node.right,
                right - rightWidth,
                right,
                depth + 1
            );
        }
    }


    layout(
        bst.root,
        margin,
        width - margin,
        0
    );


    // Draw connecting branches first.

    function drawEdges(node) {

        if (!node) return;

        const parent = positions.get(node.id);

        ["left", "right"].forEach(side => {

            const childNode = node[side];

            if (!childNode) return;

            const child = positions.get(childNode.id);

            const middleY = (parent.y + child.y) / 2;

            // Smooth curved connection from parent to child

            create("path", {
                d: `M ${parent.x} ${parent.y + radius}
                    C ${parent.x} ${middleY},
                      ${child.x} ${middleY},
                      ${child.x} ${child.y - radius}`,
                class: "tree-edge"
            });

            drawEdges(childNode);
        });
    }

    drawEdges(bst.root);


    // Draw nodes.

    function drawNodes(node) {

        if (!node) return;

        const pos = positions.get(node.id);

        const isRoot = node === bst.root;

        const group = create("g", {
            class: "tree-node",
            "data-id": node.id,
            tabindex: "0",
            role: "button",
            "aria-label": `Contact ${node.id}: ${node.name}`
        });


        // Root glow

        if (isRoot) {

            create("circle", {
                cx: pos.x,
                cy: pos.y,
                r: 29,
                fill: "none",
                stroke: "#ad83ff",
                "stroke-width": 1,
                opacity: .35
            }, group);
        }


        // Main node

        create("circle", {
            cx: pos.x,
            cy: pos.y,
            r: radius,
            fill: isRoot ? "#7850d5" : "#174d84",
            stroke: isRoot ? "#d4b4ff" : "#5acfff",
            "stroke-width": isRoot ? 3 : 2,
            filter: "url(#nodeGlow)"
        }, group);


        // ID label

        const text = create("text", {
            x: pos.x,
            y: pos.y + 4,
            "text-anchor": "middle",
            fill: "#ffffff",
            "font-size": "12",
            "font-family": "DM Sans, sans-serif",
            "font-weight": "700"
        }, group);

        text.textContent = node.id;


        // Root label

        if (isRoot) {

            const label = create("text", {
                x: pos.x,
                y: pos.y - 34,
                "text-anchor": "middle",
                fill: "#c8aaff",
                "font-size": "9",
                "font-weight": "700",
                "letter-spacing": "1"
            }, group);

            label.textContent = "ROOT";
        }


        // Click to see contact details

        const openDetails = () => showContactDetails(node);

        group.addEventListener("click", openDetails);

        group.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                openDetails();
            }
        });


        drawNodes(node.left);

        drawNodes(node.right);
    }

    drawNodes(bst.root);
}


// ============================================
// 18. HIGHLIGHT SEARCHED NODE
// ============================================

function highlightTreeNode(id) {

    const nodes = document.querySelectorAll(".tree-node");

    nodes.forEach(node => {

        const circle = node.querySelector("circle");

        if (Number(node.dataset.id) === id) {

            circle.setAttribute("stroke", "#ffffff");

            circle.setAttribute("stroke-width", "5");

            node.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });

            setTimeout(() => {

                if (node.isConnected) {

                    circle.setAttribute(
                        "stroke",
                        node.dataset.id == bst.root?.id
                            ? "#d4b4ff"
                            : "#5acfff"
                    );

                    circle.setAttribute(
                        "stroke-width",
                        node.dataset.id == bst.root?.id ? "3" : "2"
                    );
                }

            }, 1800);
        }
    });
}


// ============================================
// 19. DASHBOARD STATISTICS
// ============================================

function updateStatistics() {

    const contacts = bst.inorder();

    const total = contacts.length;

    $("totalContacts").textContent = total;

    $("sideCount").textContent = total;

    $("nodeTotal").textContent = total;

    $("rootId").textContent =
        bst.root ? bst.root.id : "—";

    $("treeRoot").textContent =
        bst.root ? "#" + bst.root.id : "EMPTY";

    $("treeHeight").textContent = bst.height();


    // Structural balance indicator:
    // compares the minimum and maximum subtree depths.
    // This is a visual indicator, not a performance percentage.

    if (total === 0) {

        $("treeBalance").textContent = "—";

    } else {

        const difference =
            bst.height() - bst.minimumHeight();

        $("treeBalance").textContent =
            difference <= 1 ? "Good" :
            difference <= 3 ? "Fair" : "Skewed";
    }
}


// ============================================
// 20. REFRESH ENTIRE DASHBOARD
// ============================================

function refreshDashboard() {

    updateStatistics();

    renderContacts();

    renderTree();
}


// ============================================
// 21. TREE FIT BUTTON
// ============================================

$("fitTree").addEventListener("click", () => {

    const stage = $("treeStage");

    stage.scrollTo({
        left: Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2),
        top: 0,
        behavior: "smooth"
    });

    notify("Tree view centered.");
});


// ============================================
// 22. NAVIGATION
// ============================================

document.querySelectorAll(".nav-link[href]").forEach(link => {

    link.addEventListener("click", () => {

        document.querySelectorAll(".nav-link")
            .forEach(item => item.classList.remove("active"));

        link.classList.add("active");
    });
});


// ============================================
// 23. HELP BUTTON
// ============================================

$("helpButton").addEventListener("click", () => {

    notify("ContactHub — Contact Management powered by BST.");
});


// ============================================
// 24. KEYBOARD SUPPORT
// ============================================

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeModal();

        $("detailsModal").classList.remove("show");
    }
});


// ============================================
// 25. START APPLICATION
// ============================================

loadContacts();

refreshDashboard();

