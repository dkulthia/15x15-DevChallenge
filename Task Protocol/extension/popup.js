const form = document.getElementById("todo-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let dragSrcIndex = null;

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.setAttribute("draggable", true);
    li.dataset.index = index;
    if (task.completed) li.classList.add("completed");
    // Drag logic
    li.addEventListener("dragstart", () => (dragSrcIndex = index));
    li.addEventListener("dragover", (e) => e.preventDefault());
    li.addEventListener("drop", () => {
      if (dragSrcIndex !== null && dragSrcIndex !== index) {
        const moved = tasks.splice(dragSrcIndex, 1)[0];
        tasks.splice(index, 0, moved);
        saveTasks();
        renderTasks();
      }
    });
    const grip = document.createElement("i");
    grip.className = "fas fa-grip-lines-vertical grip";
    const span = document.createElement("span");
    span.className = "task-text";
    if (task.editing) {
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.value = task.text;
      inputField.onkeydown = (e) => {
        if (e.key === "Enter") finishEdit(index, inputField.value.trim());
      };
      span.appendChild(inputField);
      setTimeout(() => inputField.focus(), 0);
    } else {
      span.textContent = task.text;
      span.onclick = () => toggleTask(index);
    }
    const actions = document.createElement("div");
    actions.className = "actions";
    if (task.editing) {
      const checkBtn = document.createElement("button");
      checkBtn.innerHTML = '<i class="fas fa-check"></i>';
      checkBtn.onclick = () =>
        finishEdit(index, span.querySelector("input").value.trim());
      actions.appendChild(checkBtn);
    } else {
      const editBtn = document.createElement("button");
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      editBtn.onclick = () => editTask(index);
      actions.appendChild(editBtn);
    }
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => deleteTask(index);
    actions.appendChild(deleteBtn);
    li.appendChild(grip);
    li.appendChild(span);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

function addTask(text) {
  tasks.push({
    text,
    completed: false,
    editing: false
  });
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  if (!tasks[index].editing) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(index) {
  tasks = tasks.map((t, i) => ({
    ...t,
    editing: i === index
  }));
  renderTasks();
}

function finishEdit(index, newText) {
  if (newText) {
    tasks[index].text = newText;
    tasks[index].editing = false;
    saveTasks();
    renderTasks();
  }
}
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addTask(text);
    input.value = "";
  }
});
renderTasks();
document.querySelector(".add-icon").addEventListener("click", () => {
  const text = input.value.trim();
  if (text) {
    addTask(text);
    input.value = "";
  }
});
