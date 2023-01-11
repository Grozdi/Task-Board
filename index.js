const todoCol = document.querySelector(".todo");
const inProgressCol = document.querySelector(".in-progress");
const doneCol = document.querySelector(".done");

function createTodo(title, description) {
    const card = document.createElement("div");
    card.classList.add("card");

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;

    const descElement = document.createElement("p");
    descElement.textContent = description;

    card.appendChild(titleElement);
    card.appendChild(descElement);
    card.addEventListener("click", (e) => {
        e.target.classList.toggle("selected");
    });

    return card;
}

function makeRequest(url, method, body, callBack) {
    fetch(url, {
        "method": method,
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(body)
    }).then((data) => {
        if (data.ok) return data.json();
    }).then((data) => {
        if (data !== undefined) callBack(data);
    });
}

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();

    makeRequest("http://localhost:3000/tasks", "POST", {
        "title": e.target.querySelector("input").value,
        "description": e.target.querySelector("textarea").value,
        "completed": false,
        "isInProgress": false
    }, (data) => {
        const { id, title, description } = data;
        const card = createTodo(title, description);
        card.setAttribute("data-to-do-id", id);
        todoCol.appendChild(card);
    });

    e.target.reset();
});

document.querySelector("#to-in-progress").addEventListener("click", (_) => {
    todoCol.querySelectorAll(".selected").forEach((card) => {
        const [title, desc] = card.children;
        makeRequest(`http://localhost:3000/tasks/${card.getAttribute("data-to-do-id")}`, "PUT", {
            "title": title.textContent,
            "description": desc.textContent,
            "completed": false,
            "isInProgress": true
        }, (_) => {
            todoCol.removeChild(card);
            inProgressCol.appendChild(card);
            card.classList.remove("selected");
        });
    });
});
document.querySelector("#to-done").addEventListener("click", (_) => {
    inProgressCol.querySelectorAll(".selected").forEach((card) => {
        const [title, desc] = card.children;
        makeRequest(`http://localhost:3000/tasks/${card.getAttribute("data-to-do-id")}`, "PUT", {
            "title": title.textContent,
            "description": desc.textContent,
            "completed": true,
            "isInProgress": false
        }, (_) => {
            inProgressCol.removeChild(card);
            doneCol.appendChild(card);
            card.classList.remove("selected");
        });
    });
});

fetch("http://localhost:3000/tasks").then((data) => data.json()).then((data) => {
    data.forEach((task) => {
        const { id, title, description, completed, isInProgress } = task;
        const card = createTodo(title, description);
        card.setAttribute("data-to-do-id", id);
        if (completed) doneCol.appendChild(card);
        else if (isInProgress) inProgressCol.appendChild(card);
        else todoCol.appendChild(card);
    });
});