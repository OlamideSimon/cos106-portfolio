/* ==========================================================================
   planner.js — the Academic Planner (interactive task management)
   1. Date helpers
   2. The tasks array, saved to and loaded from localStorage
   3. Actions: add, toggle complete, delete, clear completed
   4. Filtering and sorting
   5. Rendering: the task list, progress and the "tasks by course" table
   6. Event handling: the form, the list, the filters and the sort menu
   ========================================================================== */

'use strict';

const STORAGE_KEY = 'os-planner-tasks';
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/* 1. Date helpers ---------------------------------------------------------- */

// Dates are stored as "YYYY-MM-DD" strings (the format <input type="date">
// gives us). Strings in that format sort in date order, so comparing them
// with < and > works.
function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

function isOverdue(task) {
  return !task.done && Boolean(task.due) && task.due < toISODate(new Date());
}

function formatDue(isoDate, isDone) {
  if (!isoDate) return 'No due date';
  const today = toISODate(new Date());
  if (isoDate === today) return 'Due today';
  if (isoDate === daysFromToday(1)) return 'Due tomorrow';

  const [year, month, day] = isoDate.split('-').map(Number);
  const label = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  // A finished task is never "overdue", even if its date has passed.
  return isoDate < today && !isDone ? `Overdue · ${label}` : `Due ${label}`;
}

/* 2. The tasks array and localStorage ------------------------------------- */

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Shown the first time someone opens the planner, so it isn't empty.
function sampleTasks() {
  const now = Date.now();
  return [
    { id: createId(), title: 'Build my COS 106 portfolio website', course: 'COS 106', due: daysFromToday(-1), priority: 'high', done: true, createdAt: now - 4000 },
    { id: createId(), title: 'Write the COS 106 project report (PDF)', course: 'COS 106', due: daysFromToday(2), priority: 'high', done: false, createdAt: now - 3000 },
    { id: createId(), title: 'Prepare for the COS 106 project defence', course: 'COS 106', due: daysFromToday(6), priority: 'medium', done: false, createdAt: now - 2000 },
    { id: createId(), title: "Revise this week's lecture notes", course: 'General', due: daysFromToday(1), priority: 'low', done: false, createdAt: now - 1000 },
  ];
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    // Nothing saved yet, or the saved data was unreadable: start fresh.
  }
  return sampleTasks();
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Storage blocked: the planner still works, it just won't remember.
  }
}

let tasks = loadTasks();
let currentFilter = 'all';
let currentSort = 'due';

/* 3. Actions --------------------------------------------------------------- */

function addTask(title, course, due, priority) {
  tasks.push({
    id: createId(),
    title,
    course,
    due,
    priority,
    done: false,
    createdAt: Date.now(),
  });
  saveTasks();
  render();
  announce(`Added "${title}".`);
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
  announce(task.done ? `Marked "${task.title}" as completed.` : `Marked "${task.title}" as not completed.`);
}

function deleteTask(id) {
  const task = tasks.find((item) => item.id === id);
  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();
  render();
  if (task) announce(`Deleted "${task.title}".`);
}

function clearCompleted() {
  const completedCount = tasks.filter((task) => task.done).length;
  if (completedCount === 0) return;
  const plural = completedCount === 1 ? 'task' : 'tasks';
  if (!window.confirm(`Delete ${completedCount} completed ${plural}?`)) return;
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  render();
  announce(`Deleted ${completedCount} completed ${plural}.`);
}

/* 4. Filtering and sorting ------------------------------------------------- */

function compareDue(a, b) {
  if (a.due === b.due) return 0;
  if (!a.due) return 1; // tasks with no due date go last
  if (!b.due) return -1;
  return a.due < b.due ? -1 : 1;
}

function compareTasks(a, b) {
  // Unfinished tasks always come before finished ones.
  if (a.done !== b.done) return a.done ? 1 : -1;
  if (currentSort === 'priority') {
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || compareDue(a, b);
  }
  if (currentSort === 'newest') return b.createdAt - a.createdAt;
  return compareDue(a, b) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

function getVisibleTasks() {
  const filtered = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.done;
    if (currentFilter === 'completed') return task.done;
    return true;
  });
  // Copy before sorting, so the saved order of the tasks array isn't changed.
  return [...filtered].sort(compareTasks);
}

/* 5. Rendering ------------------------------------------------------------- */

const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const statusMessage = document.getElementById('planner-status');
const filterButtons = document.querySelectorAll('[data-task-filter]');
const clearButton = document.getElementById('clear-completed');
const progressBar = document.getElementById('progress-bar');
const courseTableBody = document.getElementById('course-table-body');
const courseTableFoot = document.getElementById('course-table-foot');

const TRASH_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

// Tells screen-reader users what just happened (the element is visually hidden).
function announce(message) {
  statusMessage.textContent = message;
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeSpan(text, className) {
  const span = document.createElement('span');
  span.textContent = text;
  if (className) span.className = className;
  return span;
}

// Builds one task with createElement and textContent, never innerHTML, so
// whatever a visitor types is always shown as text and never run as code.
function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = `task task--${task.priority}${task.done ? ' task--done' : ''}`;
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `task-${task.id}`;
  checkbox.checked = task.done;

  const body = document.createElement('div');
  const title = document.createElement('label');
  title.className = 'task__title';
  title.htmlFor = checkbox.id;
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task__meta';
  meta.append(
    makeSpan(task.course || 'General'),
    makeSpan(formatDue(task.due, task.done), isOverdue(task) ? 'task__due--overdue' : ''),
    makeSpan(`${capitalise(task.priority)} priority`),
  );
  body.append(title, meta);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.dataset.action = 'delete';
  deleteButton.setAttribute('aria-label', `Delete "${task.title}"`);
  deleteButton.innerHTML = TRASH_ICON; // a fixed icon written by me, not visitor text

  item.append(checkbox, body, deleteButton);
  return item;
}

function renderList() {
  const visible = getVisibleTasks();
  list.replaceChildren(...visible.map(createTaskElement));

  if (tasks.length === 0) {
    emptyState.textContent = 'No tasks yet. Add your first one with the form.';
  } else if (visible.length === 0) {
    emptyState.textContent = `No ${currentFilter} tasks right now.`;
  }
  emptyState.hidden = visible.length > 0;
}

function renderProgress() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.done).length;
  const overdue = tasks.filter(isOverdue).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('done-count').textContent = done;
  document.getElementById('total-count').textContent = total;
  progressBar.value = percent;
  progressBar.textContent = `${percent}%`;
  document.getElementById('progress-text').textContent =
    total === 0 ? 'Add a task to get started.' : `${percent}% of your tasks are complete.`;

  const overdueText = document.getElementById('overdue-text');
  overdueText.textContent = overdue === 0 ? 'Nothing overdue. Nice.' : `${overdue} overdue: check the red dates.`;
  overdueText.classList.toggle('task__due--overdue', overdue > 0);

  // Counts on the filter buttons, e.g. "Active (3)"
  document.getElementById('count-all').textContent = total;
  document.getElementById('count-active').textContent = total - done;
  document.getElementById('count-completed').textContent = done;
  document.getElementById('remaining-text').textContent =
    `${total - done} ${total - done === 1 ? 'task' : 'tasks'} left to do`;
  clearButton.disabled = done === 0;
}

// Groups the tasks by course with reduce(), then writes one table row per course.
function renderCourseTable() {
  const byCourse = tasks.reduce((groups, task) => {
    const course = task.course || 'General';
    if (!groups[course]) groups[course] = { total: 0, done: 0 };
    groups[course].total += 1;
    if (task.done) groups[course].done += 1;
    return groups;
  }, {});

  const courses = Object.keys(byCourse).sort();
  courseTableBody.replaceChildren();

  if (courses.length === 0) {
    const row = courseTableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = 'No tasks yet.';
  }

  courses.forEach((course) => {
    const { total, done } = byCourse[course];
    const row = courseTableBody.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = course;
    row.append(heading);
    [total, done, total - done].forEach((value) => {
      const cell = row.insertCell();
      cell.className = 'num';
      cell.textContent = value;
    });
  });

  const totalDone = tasks.filter((task) => task.done).length;
  courseTableFoot.replaceChildren();
  const footRow = courseTableFoot.insertRow();
  const footHeading = document.createElement('th');
  footHeading.scope = 'row';
  footHeading.textContent = 'All courses';
  footRow.append(footHeading);
  [tasks.length, totalDone, tasks.length - totalDone].forEach((value) => {
    const cell = document.createElement('th');
    cell.className = 'num';
    cell.textContent = value;
    footRow.append(cell);
  });
}

function render() {
  renderList();
  renderProgress();
  renderCourseTable();
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.taskFilter === currentFilter));
  });
}

/* 6. Event handling -------------------------------------------------------- */

const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const titleError = document.getElementById('task-title-error');

function showTitleError(message) {
  titleError.textContent = message;
  titleInput.setAttribute('aria-invalid', message ? 'true' : 'false');
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // stay on the page instead of reloading it

  const title = titleInput.value.trim();
  if (title === '') {
    showTitleError('Please give the task a title.');
    titleInput.focus();
    return;
  }

  const course = form.elements.course.value.trim().toUpperCase() || 'General';
  addTask(title, course === 'GENERAL' ? 'General' : course, form.elements.due.value, form.elements.priority.value);

  form.reset();
  showTitleError('');
  titleInput.focus();
});

titleInput.addEventListener('input', () => {
  if (titleInput.value.trim() !== '') showTitleError('');
});

// Event delegation: one listener on the list handles every task, including
// tasks added later, by checking which element inside it was used.
list.addEventListener('change', (event) => {
  if (event.target.matches('input[type="checkbox"]')) {
    toggleTask(event.target.closest('.task').dataset.id);
  }
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  const item = button.closest('.task');
  item.classList.add('task--leaving'); // slide out (see styles.css), then remove
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => deleteTask(item.dataset.id), reduceMotion ? 0 : 250);
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.taskFilter;
    render();
  });
});

document.getElementById('task-sort').addEventListener('change', (event) => {
  currentSort = event.target.value;
  render();
});

clearButton.addEventListener('click', clearCompleted);

render();
