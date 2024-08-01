let leon, canvas, ctx, div;

const sw = 800;
const sh = 150;
const pixelRatio = 2;

function init() {
  div = document.createElement("div");
  canvas = document.createElement("canvas");
  canvas.classList.add("leon-canvas");
  div.style.width = "100%";
  div.style.height = "fit-content";
  div.style.display = "flex";
  div.style.justifyContent = "center";
  div.style.alignItems = "center";
  div.style.overflow = "hidden";
  div.appendChild(canvas);
  document.body.insertBefore(div, document.body.firstChild);

  ctx = canvas.getContext("2d");

  canvas.width = sw * pixelRatio;
  canvas.height = sh * pixelRatio;
  canvas.style.width = sw + "px";
  canvas.style.height = sh + "px";
  ctx.scale(pixelRatio, pixelRatio);

  leon = new LeonSans({
    text: "To-Do List",
    color: [
      ["#CD5BFD", "#2a92ce"],
      ["#C543FD", "#C543FD", "#B715FD", "#C543FD"],
      ["#9D02E0", "#C543FD"],
    ],
    size: 80,
    weight: 450,
    tracking: 0,
  });
  let i,
    total = leon.drawing.length;
  for (i = 0; i < total; i++) {
    TweenMax.fromTo(
      leon.drawing[i],
      1.6,
      {
        value: 0,
      },
      {
        delay: i * 0.05,
        value: 1,
        ease: Power4.easeOut,
      }
    );
  }

  requestAnimationFrame(animate);
}

function animate(t) {
  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, sw, sh);

  const x = (sw - leon.rect.w) / 2;
  const y = (sh - leon.rect.h) / 2;
  leon.position(x, y);

  leon.draw(ctx);
}

window.onload = () => {
  init();
};

//CANVAS END

let editMode = false;

function toggleEdit() {
  editMode = !editMode;
  const editControls = document.querySelectorAll(".edit-controls");
  const completeControls = document.querySelectorAll(".complete-controls");
  const editButton = document.getElementById("editButton");
  if (editMode) {
    editControls.forEach((el) => (el.style.display = "inline"));
    completeControls.forEach((el) => (el.style.display = "none"));
    editButton.textContent = "Stop Editing";
  } else {
    editControls.forEach((el) => (el.style.display = "none"));
    completeControls.forEach((el) => (el.style.display = "inline"));
    editButton.textContent = "Edit Tasks";
  }
}

function openModal(taskId, taskContent) {
  const form = document.getElementById("editForm");
  form.onsubmit = (e) => editTask(e, taskId);
  document.getElementById("modalTaskId").value = taskId;
  document.getElementById("modalInput").value = taskContent;
  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

document.getElementById("addTaskForm").onsubmit = addTask;

function addTask(event) {
  event.preventDefault();
  const task = document.getElementById("task").value;
  fetch("/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task }),
  })
    .then((response) => response.json())
    .then((data) => {
      updateTaskList(data.tasks);
      document.getElementById("task").value = "";
    });
}

function editTask(event, taskId) {
  event.preventDefault();
  const edit_task = document.getElementById("modalInput").value;
  fetch(`/edit/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ edit_task }),
  })
    .then((response) => response.json())
    .then((data) => {
      updateTaskList(data.tasks);
      closeModal();
    });
}

function deleteTask(taskId) {
  fetch(`/delete/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      updateTaskList(data.tasks);
    });
}

function completeTask(taskId) {
  fetch(`/complete/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      updateTaskList(data.tasks);
    });
}

function markAsIncomplete(taskId) {
  fetch(`/incomplete/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      updateTaskList(data.tasks);
    });
}

function updateTaskList(tasks) {
  const taskList = document.getElementById("taskList").querySelector("ul");
  taskList.innerHTML = "";
  for (const [task_id, task] of Object.entries(tasks)) {
    const li = document.createElement("li");
    li.className = `flex justify-between items-center p-4 rounded-lg shadow ${
      task.completed
        ? "bg-[rgba(34,197,94,0.25)] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-sm"
        : "bg-[rgba(69,19,231,0.25)] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-sm"
    }`;
    li.style.borderRadius = "10px";
    li.innerHTML = `
      <span class="text-white mr-5">${task.description}</span>
      <div class="flex space-x-2">
        <button class="edit-controls bg-blue-500/25 hover:bg-blue-700/25 text-white font-bold py-1 px-2 rounded-lg backdrop-blur-md focus:outline-none focus:shadow-outline" onclick="openModal(${task_id}, '${
      task.description
    }')">Edit</button>
        <button class="edit-controls bg-red-500/25 hover:bg-red-700/25 text-white font-bold py-1 px-2 rounded-lg backdrop-blur-md focus:outline-none focus:shadow-outline" onclick="deleteTask(${task_id})">Delete</button>
        ${
          task.completed
            ? `<button class="complete-controls bg-yellow-500/25 hover:bg-yellow-700/25 text-white font-bold py-1 px-2 rounded-lg backdrop-blur-md focus:outline-none focus:shadow-outline" onclick="markAsIncomplete(${task_id})">Incomplete</button>`
            : `<button class="complete-controls bg-green-500/25 hover:bg-green-700/25 text-white font-bold py-1 px-2 rounded-lg backdrop-blur-md focus:outline-none focus:shadow-outline" onclick="completeTask(${task_id})">Complete</button>`
        }
      </div>
    `;
    taskList.appendChild(li);
  }
}
