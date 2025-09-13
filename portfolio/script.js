document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const tasksLeft = document.getElementById('tasksLeft');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTaskCount();
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        clearCompletedBtn.addEventListener('click', clearCompleted);
        filterBtns.forEach(btn => {
            btn.addEventListener('click', filterTasks);
        });
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateTaskCount();
        taskInput.value = '';
        taskInput.focus();
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = currentFilter === 'all' ? 'No tasks yet!' : 
                                     currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            emptyMessage.classList.add('empty-message');
            taskList.appendChild(emptyMessage);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="task-delete"><i class="fas fa-trash-alt"></i></button>
            `;
            
            taskList.appendChild(taskItem);
            
            // Add event listeners to new elements
            const checkbox = taskItem.querySelector('.task-checkbox');
            const deleteBtn = taskItem.querySelector('.task-delete');
            const taskText = taskItem.querySelector('.task-text');
            
            checkbox.addEventListener('change', function() {
                toggleTaskComplete(task.id);
            });
            
            deleteBtn.addEventListener('click', function() {
                deleteTask(task.id);
            });
            
            taskText.addEventListener('dblclick', function() {
                editTask(task.id, taskText);
            });
        });
    }
    
    // Toggle task completion status
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
    
    // Delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
    
    // Edit a task
    function editTask(taskId, taskTextElement) {
        const currentText = taskTextElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                updateTaskText(taskId, input.value);
            }
        });
        
        input.addEventListener('blur', function() {
            updateTaskText(taskId, input.value);
        });
        
        taskTextElement.replaceWith(input);
        input.focus();
    }
    
    // Update task text
    function updateTaskText(taskId, newText) {
        newText = newText.trim();
        if (newText === '') {
            deleteTask(taskId);
            return;
        }
        
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, text: newText };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
    
    // Clear all completed tasks
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
    
    // Filter tasks
    function filterTasks(e) {
        currentFilter = e.target.dataset.filter;
        
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        renderTasks();
    }
    
    // Update task counter
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Initialize the app
    init();
});