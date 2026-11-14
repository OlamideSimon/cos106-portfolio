# Olamide Simon: Student Portfolio & Academic Planner

My term project for **COS 106: Introduction to Web Technologies** at MIVA Open University.

It's a responsive, multi-page website that works as my personal academic portfolio and a small student-management tool. It's written in plain **HTML, CSS and JavaScript**, with no frameworks, libraries or build step.

- **Live site:** https://olamide-cos106.onrender.com
- **Repository:** https://github.com/OlamideSimon/cos106-portfolio

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | Name and photo, a welcome message, a short biography, a video tour of the site and links to every page |
| About Me | `about.html` | Educational background (as a table), career aspirations, technical skills, work experience, hobbies and interests |
| Projects | `projects.html` | Six live client websites with screenshots, descriptions and links, plus filtering by sector and search |
| Academic Planner | `planner.html` | Add tasks, mark them as completed and delete them. Tasks are saved in the browser, with progress and a per-course summary table |
| Contact | `contact.html` | A form (name, email, phone, message) checked by JavaScript before it's accepted |

## How the brief is covered

### Functional requirements

| Requirement | Where |
|---|---|
| Homepage: name, photograph, welcome message, navigation menu, brief biography | `index.html` |
| About: education, career aspirations, technical skills, hobbies and interests | `about.html` |
| Projects: at least three, with descriptions, images and links | `projects.html`, data in `js/projects.js` |
| Planner: add, complete and delete tasks with JavaScript | `planner.html`, `js/planner.js` |
| Contact form: name, email, phone, message | `contact.html` |
| Validation: no empty field, valid email, phone digits only | `js/contact.js` |

### HTML

- **Semantic elements:** `header`, `nav`, `main`, `section`, `article`, `aside`, `figure`/`figcaption`, `footer`, `blockquote`
- **Forms:** the contact form and the planner's "Add a task" form
- **Tables:** education (`about.html`) and "Tasks by course" (`planner.html`, filled in by JavaScript)
- **Images:** profile photo, project screenshots, inline SVG icons
- **Hyperlinks:** navigation, live project sites, email, LinkedIn and GitHub
- **Lists:** navigation, skills, timeline, hobbies, task list
- **Multimedia:** the video tour on the home page (`<video>` with a poster image)

### CSS (`css/styles.css`, one external stylesheet)

- **Responsive layout** using CSS Grid and Flexbox, with breakpoints at 960px, 820px and 640px
- **Navigation:** a styled bar with an animated underline, collapsing into a menu on phones
- **Transitions and keyframe animations,** switched off for visitors who ask their device for reduced motion
- **Consistent colours** from CSS custom properties, with a light theme and a dark theme

### JavaScript

| Concept | Example |
|---|---|
| Event handling | Clicks, form `submit`, `input`, `blur`, `change` and `keydown`, plus event delegation on the task list |
| DOM manipulation | Building tasks with `createElement` and `textContent`, toggling classes and attributes |
| Form validation | Regular expressions for email and digits-only phone, with inline error messages |
| Dynamic content | Progress bar, counts, the per-course table, project filtering, time-of-day greeting |
| Arrays and functions | `filter`, `map`, `find`, `reduce`, `sort` and small single-purpose functions |
| Task management | Add, complete, delete, filter, sort and clear completed, saved with `localStorage` |

## Project structure

```
cos106-portfolio/
├── index.html        Home
├── about.html        About Me
├── projects.html     Projects
├── planner.html      Academic Planner
├── contact.html      Contact
├── css/
│   └── styles.css    The one external stylesheet
├── js/
│   ├── main.js       Shared: theme toggle, mobile menu, scroll reveal, footer year
│   ├── home.js       Greeting, count-up numbers, video fallback
│   ├── projects.js   Project data, filtering, search, rendering
│   ├── planner.js    The task manager
│   └── contact.js    Form validation
├── assets/
│   ├── images/       Photo, project screenshots, favicon
│   └── video/        The video tour and its poster
└── render.yaml       Hosting settings for Render
```

## Running it locally

Open `index.html` in a browser, or serve the folder so every feature behaves as it does online:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Hosting

The site is hosted on [Render](https://render.com) as a static site. `render.yaml` holds the settings: no build step, published from the repository root. Every push to `main` redeploys it.

## Author

**Olamide Simon** (Adepetoye Simon Olamide)
B.Sc. Software Engineering, 100 Level, MIVA Open University
[LinkedIn](https://www.linkedin.com/in/simon-adepetoye-13265b228/) · [GitHub](https://github.com/OlamideSimon) · simonadepetoye@gmail.com
