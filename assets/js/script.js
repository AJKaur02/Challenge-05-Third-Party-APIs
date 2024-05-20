let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

document.addEventListener("DOMContentLoaded", function () {
    renderTasks();
});

function renderTasks() {
    const columns = ['todo', 'in-progress', 'done'];

    columns.forEach(columnId => {
        const column = document.getElementById(`${columnId}-cards`);
        column.innerHTML = ''; // Clear existing tasks

        tasks.forEach(task => {
            if (task.status === columnId) {
                const taskElement = createTaskElement(task);
                column.appendChild(taskElement);
            }
        });
    });
}

function createTaskElement(task) {
    const taskId = task.id;
    const taskElement = document.createElement("div");
    taskElement.id = taskId;
    taskElement.className = `task draggable card mb-3 ${getTaskClass(task.status)}`;
    taskElement.draggable = true;
    taskElement.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${task.title}</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text"><small>${task.dueDate}</small></p>
            <button class="btn btn-danger btn-sm" onclick="deleteTask('${taskId}')">Delete</button>
        </div>
    `;

    taskElement.addEventListener("dragstart", drag);
    return taskElement;
}

function getTaskClass(status) {
    switch (status) {
        case 'todo':
            return 'task-todo';
        case 'in-progress':
            return 'task-in-progress';
        case 'done':
            return 'task-done';
        default:
            return '';
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    updateLocalStorage();
    renderTasks();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function drop(event, columnId) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(data);
    if (draggedElement) {
        const taskStatus = columnId;
        updateTaskStatus(data, taskStatus);
        renderTasks();
    }
}

function addTask() {
    const taskTitle = document.getElementById('taskTitle').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskDeadline = document.getElementById('taskDeadline').value;

    if (taskTitle && taskDeadline) {
        const newTask = {
            id: "task-" + nextId++,
            title: taskTitle,
            description: taskDescription,
            dueDate: taskDeadline,
            status: 'todo'
        };
        tasks.push(newTask);
        updateLocalStorage();
        renderTasks();

        // Clear form fields and close modal
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskDeadline').value = '';
        $('#formModal').modal('hide');
    }
}

function updateTaskStatus(taskId, newStatus) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, status: newStatus };
        }
        return task;
    });
    updateLocalStorage();
}

function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', JSON.stringify(nextId));
}

$(document).ready(function () {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    nextId = JSON.parse(localStorage.getItem('nextId')) || 1;
    renderTasks();

    $('#taskForm').submit(function (event) {
        event.preventDefault();
        addTask();
    });
});
