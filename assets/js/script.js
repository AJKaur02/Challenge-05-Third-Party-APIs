// Retrieve tasks and nextId from localStorage
let tasks = []; // Initialize tasks as an empty array
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1; // Initialize nextId if it doesn't exist

// Function to generate a unique task ID
function generateTaskId() {
  return nextId++; // Increment nextId and return it
}

// Function to save tasks to localStorage
function saveTasksToStorage(tasks, callback) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('nextId', JSON.stringify(nextId)); // Save the updated nextId
  if (callback) {
    callback(); // Execute the callback function after successful save
  }
}

// Function to create a task card
function createTaskCard(task) {
  const existingCard = $(`.task-card[data-task-id="${task.id}"]`);

  // Return existing card if it already exists
  if (existingCard.length) {
    return existingCard;
  }

  const card = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const header = $('<div>').addClass('card-header h4').text(task.name);
  const description = $('<p>').addClass('card-text').text(task.description);
  const dueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const deleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);

  // Set card background color based on due date
  if (task.dueDate) {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
    if (now.isSame(taskDueDate, 'day')) {
      card.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      card.addClass('bg-danger text-white');
      deleteBtn.addClass('border-light'); // Make delete button visible on overdue cards
    }
  }

  card.append(header, description, dueDate, deleteBtn);
  return card;
}

// Function to render the task list and make cards draggable
function printTaskData(tasks) {
  // Empty existing task cards from the lanes
  const todoList = $('#todo-cards');
  todoList.empty();
  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();
  const doneList = $('#done-cards');
  doneList.empty();

  // Loop through tasks and create/append task cards
  for (const task of tasks) {
    const card = createTaskCard(task);
    if (task.status === 'to-do') {
      todoList.append(card);
    } else if (task.status === 'in-progress') {
      inProgressList.append(card);
    } else if (task.status === 'done') {
      doneList.append(card);
    }

    // Add event listener to the delete button within each card
    const deleteButton = card.find('.delete');
    deleteButton.click(handleDeleteTask);
  }

  // Make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr('data-task-id');

  console.log('Task ID to delete:', taskId);

  // Filter the tasks array to remove the deleted task
  tasks = tasks.filter((task) => task.id !== taskId);

  console.log('Updated tasks array:', tasks);

  // Check if all tasks are deleted
  if (tasks.length === 0) {
    // Clear tasks from localStorage
    localStorage.removeItem('tasks');
  } else {
    // Save the updated tasks array to localStorage
    saveTasksToStorage(tasks, () => {
      // Print task data after successful save
      printTaskData(tasks);
    });
  }

  // Remove the corresponding task card from the DOM
  const cardToDelete = $(`.task-card[data-task-id="${taskId}"]`);
  cardToDelete.remove();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui, tasks) {
  const taskId = ui.draggable[0].dataset.taskId;
  const newLaneId = event.target.id; // ID of the new lane

  // Find the task by ID and update its status
  for (let task of tasks) {
    if (task.id === taskId) {
      if (newLaneId === 'todo-cards') {
        task.status = 'to-do';
      } else if (newLaneId === 'in-progress-cards') {
        task.status = 'in-progress';
      } else if (newLaneId === 'done-cards') {
        task.status = 'done';
      }
      break;
    }
  }

  // Save the updated tasks array to localStorage
  saveTasksToStorage(tasks, () => {
    // Print task data after successful save
    printTaskData(tasks);
  });

  // Remove the task card from the previous lane before appending to the new one
  const previousLane = ui.helper.closest('.lane');
  const cardToRemove = previousLane.find(`.task-card[data-task-id="${taskId}"]`);
  cardToRemove.remove();
}

// Initial page load:
$(document).ready(function () {
  // Make task deadline field  date picker
  $('#taskDeadline').datepicker({
    changeMonth: true,
    changeYear: true,
    dateFormat: 'yy-mm-dd',
  });

  // Clear tasks array before retrieving from localStorage
  tasks = [];

  // Retrieve nextId from localStorage if it exists
  nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  // Retrieve tasks from localStorage and render them
  const retrievedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = retrievedTasks; // Assign retrieved tasks to the tasks array
  printTaskData(tasks); // Call printTaskData to display existing tasks

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  // Open modal for adding new task
  $('#addNewTaskBtn').click(function () {
    $('#newTaskModal').modal('show');
  });

  // Handle form submission for new task
  $('#newTaskForm').submit(function (event) {
    event.preventDefault();

    const taskName = $('#taskTitle').val().trim();
    const taskDescription = $('#taskDescription').val().trim();
    const taskDate = $('#taskDeadline').val(); // yyyy-mm-dd format

    const newTask = {
      id: generateTaskId(),
      name: taskName,
      description: taskDescription,
      dueDate: taskDate,
      status: 'to-do',
    };

    tasks.push(newTask);
    saveTasksToStorage(tasks, () => {
      // Print task data after successful save
      printTaskData(tasks); // Call printTaskData to display the newly added task
    });

    // Clear form fields and close modal
    $('#taskTitle').val('');
    $('#taskDescription').val('');
    $('#taskDeadline').val('');
    $('#newTaskModal').modal('hide');
  });
});
