/**
 * Student Management System - Optimized SPA Application Engine
 * High-performance DOM caching, debounced search, JWT session handling,
 * and robust MongoDB API integration with offline demo fallbacks.
 */

/* ==========================================================================
   1. API CONFIGURATION & STATE
   ========================================================================== */

const getApiBaseUrl = () => {
  const isPort5000 = window.location.port === '5000';
  if (window.location.protocol.startsWith('http') && isPort5000) {
    return `${window.location.origin}/students`;
  }
  return 'http://localhost:5000/students';
};

const API_BASE_URL = getApiBaseUrl();

// Application Reactive State
const state = {
  students: [],
  filteredStudents: [],
  activeView: 'dashboard',
  currentTheme: localStorage.getItem('sms_theme') || 'dark',
  isBackendConnected: false,
  editingStudentId: null,
  deletingStudentId: null,
  searchQuery: '',
  statusFilter: 'all',
  courseFilter: 'all',
  currentPage: 1,
  pageSize: 10
};

// Page Title Metadata Mapping
const viewTitles = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Real-time key metrics and student directory summary' },
  students: { title: 'Student Directory', subtitle: 'Search, filter, manage, and edit all student records' },
  teachers: { title: 'Faculty & Teachers', subtitle: 'Directory of academic instructors and department leads' },
  classes: { title: 'Classes & Grade Levels', subtitle: 'Overview of classrooms, grade sections, and student allocations' },
  attendance: { title: 'Daily Attendance', subtitle: 'Track student presence, absences, and monthly attendance rates' },
  timetable: { title: 'Class Timetable', subtitle: 'Weekly schedules, period allocations, and classroom assignments' },
  exams: { title: 'Examination Schedule', subtitle: 'Upcoming exams, test dates, venues, and subject allocations' },
  fees: { title: 'Fee Management', subtitle: 'Tuition tracking, payment history, and pending invoice dues' },
  reports: { title: 'Analytics & Reports', subtitle: 'Institutional performance reports and academic analytics' },
  settings: { title: 'System Settings', subtitle: 'Manage application preferences, API server config, and local cache' }
};

// Cached Centralized DOM References
let DOM = {};

/* ==========================================================================
   2. INITIALIZATION & DOM CACHING
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  initTheme();
  checkUserSession();
  setupNavigation();
  setupEventListeners();
  fetchStudents();
  fetchTeachers();
  initAttendanceDateInput();
  fetchFees();
  checkBackendHealth();

  if (DOM.settingsApiUrl) {
    DOM.settingsApiUrl.textContent = API_BASE_URL;
  }

  setInterval(checkBackendHealth, 10000);
});

function cacheDOM() {
  DOM = {
    // Navigation & Views
    navItems: document.querySelectorAll('.nav-item'),
    viewSections: document.querySelectorAll('.view-section'),
    pageTitle: document.getElementById('pageTitle'),
    pageSubtitle: document.getElementById('pageSubtitle'),

    // Sidebar & Navbar Session
    sidebarUserProfile: document.getElementById('sidebarUserProfile'),
    sidebarAuthBtns: document.getElementById('sidebarAuthBtns'),
    sidebarUserAvatar: document.getElementById('sidebarUserAvatar'),
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserEmail: document.getElementById('sidebarUserEmail'),
    navbarUserProfile: document.getElementById('navbarUserProfile'),
    navbarAuthBtns: document.getElementById('navbarAuthBtns'),
    navbarUserAvatar: document.getElementById('navbarUserAvatar'),
    navbarUserName: document.getElementById('navbarUserName'),
    navbarUserEmail: document.getElementById('navbarUserEmail'),
    userSettingsInfo: document.getElementById('userSettingsInfo'),

    // Dashboard Stats
    statTotalStudents: document.getElementById('statTotalStudents'),
    statActiveStudents: document.getElementById('statActiveStudents'),
    statInactiveStudents: document.getElementById('statInactiveStudents'),
    statTotalCourses: document.getElementById('statTotalCourses'),

    // Tables & Content Grids
    tbodies: document.querySelectorAll('.studentsTableBody, #dashboardTableBody, #studentsTableBody'),
    coursesGrid: document.getElementById('coursesGrid'),
    settingsApiUrl: document.getElementById('settingsApiUrl'),

    // Search & Filters
    searchInput: document.getElementById('searchInput'),
    courseFilterSelects: document.querySelectorAll('.courseFilterSelect'),
    statusFilter: document.getElementById('statusFilter'),

    // Pagination Controls
    pageStart: document.getElementById('pageStart'),
    pageEnd: document.getElementById('pageEnd'),
    totalRecords: document.getElementById('totalRecords'),
    pageIndicator: document.getElementById('pageIndicator'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),

    // Buttons & Toggles
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    addStudentBtn: document.getElementById('addStudentBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    studentForm: document.getElementById('studentForm'),

    // Form Inputs
    studentNameInput: document.getElementById('studentNameInput'),
    studentEmailInput: document.getElementById('studentEmailInput'),
    studentCourseInput: document.getElementById('studentCourseInput'),
    enrollmentDateInput: document.getElementById('enrollmentDateInput'),
    studentStatusInput: document.getElementById('studentStatusInput'),
    modalTitle: document.getElementById('modalTitle'),

    // Modals
    studentModal: document.getElementById('studentModal'),
    viewModal: document.getElementById('viewModal'),
    deleteModal: document.getElementById('deleteModal'),
    viewDetailsContent: document.getElementById('viewDetailsContent'),
    deleteStudentName: document.getElementById('deleteStudentName'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };
}

/* ==========================================================================
   3. AUTH & SESSION MANAGEMENT
   ========================================================================== */

function getCurrentUser() {
  const userStr = localStorage.getItem('sms_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('sms_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function checkUserSession() {
  const user = getCurrentUser();
  const token = localStorage.getItem('sms_token');

  if (user && user.name && token) {
    const initials = getInitials(user.name);

    // Sidebar Session Updates
    if (DOM.sidebarUserName) DOM.sidebarUserName.textContent = user.name;
    if (DOM.sidebarUserEmail) DOM.sidebarUserEmail.textContent = user.email || 'student@university.edu';
    if (DOM.sidebarUserAvatar) DOM.sidebarUserAvatar.textContent = initials;
    if (DOM.sidebarUserProfile) DOM.sidebarUserProfile.style.display = 'flex';
    if (DOM.sidebarAuthBtns) DOM.sidebarAuthBtns.style.display = 'none';

    // Navbar Session Updates
    if (DOM.navbarUserName) DOM.navbarUserName.textContent = user.name;
    if (DOM.navbarUserEmail) DOM.navbarUserEmail.textContent = user.email || 'student@university.edu';
    if (DOM.navbarUserAvatar) DOM.navbarUserAvatar.textContent = initials;
    if (DOM.navbarUserProfile) DOM.navbarUserProfile.style.display = 'flex';
    if (DOM.navbarAuthBtns) DOM.navbarAuthBtns.style.display = 'none';

    if (DOM.userSettingsInfo) {
      DOM.userSettingsInfo.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div class="avatar" style="width: 48px; height: 48px; font-size: 1.1rem;">${initials}</div>
          <div>
            <h4 style="font-size: 1.1rem; color: var(--text-main);">${escapeHtml(user.name)}</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(user.email || '')}</p>
          </div>
        </div>
        <div class="detail-item">
          <span class="detail-label">Course Program</span>
          <span class="detail-value">${escapeHtml(user.course || 'Computer Science')}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Account Type</span>
          <span class="status-badge active">Active Student</span>
        </div>
        <div style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem;">
          <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="handleLogout()">
            <i class="fas fa-sign-out-alt"></i> Sign Out Account
          </button>
          <button class="btn btn-danger" style="width: 100%; justify-content: center;" onclick="handleDeleteAccount()">
            <i class="fas fa-user-times"></i> Delete My Account
          </button>
        </div>
      `;
    }
  } else {
    // Guest Mode (Sidebar & Navbar)
    if (DOM.sidebarUserProfile) DOM.sidebarUserProfile.style.display = 'none';
    if (DOM.sidebarAuthBtns) DOM.sidebarAuthBtns.style.display = 'flex';

    if (DOM.navbarUserProfile) DOM.navbarUserProfile.style.display = 'none';
    if (DOM.navbarAuthBtns) DOM.navbarAuthBtns.style.display = 'flex';

    if (DOM.userSettingsInfo) {
      DOM.userSettingsInfo.innerHTML = `
        <p style="color: var(--text-muted); margin-bottom: 1rem;">You are currently browsing in guest mode.</p>
        <div style="display: flex; gap: 0.75rem;">
          <a href="/login" class="btn btn-secondary" style="flex: 1; justify-content: center;">Sign In</a>
          <a href="/register" class="btn btn-primary" style="flex: 1; justify-content: center;">Register Here</a>
        </div>
      `;
    }
  }
}

function handleLogout() {
  localStorage.removeItem('sms_user');
  localStorage.removeItem('sms_token');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = '/login';
  }, 800);
}

async function handleDeleteAccount() {
  const confirmed = confirm(
    '⚠️ Are you sure you want to delete your account?\n\nThis will permanently remove your account and immediately invalidate your session. This action cannot be undone.'
  );
  if (!confirmed) return;

  const token = localStorage.getItem('sms_token');
  if (!token) {
    showToast('No active session found. Please sign in first.', 'error');
    return;
  }

  try {
    const AUTH_URL = window.location.port === '5000'
      ? `${window.location.origin}/auth/account`
      : 'http://localhost:5000/auth/account';

    const res = await fetch(AUTH_URL, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete account.');
    }

    localStorage.removeItem('sms_user');
    localStorage.removeItem('sms_token');

    showToast('Account deleted. Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/register';
    }, 1200);

  } catch (err) {
    showToast(err.message, 'error');
  }
}

/* ==========================================================================
   4. THEME & NAVIGATION SYSTEM
   ========================================================================== */

function initTheme() {
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  updateThemeIcon();
}

function toggleTheme() {
  state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  localStorage.setItem('sms_theme', state.currentTheme);
  updateThemeIcon();
  showToast(`Switched to ${state.currentTheme} theme`, 'info');
}

function updateThemeIcon() {
  if (DOM.themeIcon) {
    DOM.themeIcon.className = state.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function setupNavigation() {
  DOM.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      if (targetView) switchView(targetView);
    });
  });
}

function switchView(viewName) {
  if (!viewTitles[viewName]) return;

  toggleSidebar(false);
  state.activeView = viewName;

  DOM.navItems.forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  if (DOM.pageTitle) DOM.pageTitle.textContent = viewTitles[viewName].title;
  if (DOM.pageSubtitle) DOM.pageSubtitle.textContent = viewTitles[viewName].subtitle;

  DOM.viewSections.forEach(section => {
    if (section.id === `view-${viewName}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  if (viewName === 'courses') {
    renderCoursesGrid();
  }
}

/* ==========================================================================
   5. EVENT LISTENERS & DEBOUNCED SEARCH
   ========================================================================== */

function setupEventListeners() {
  if (DOM.themeToggleBtn) DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  if (DOM.addStudentBtn) DOM.addStudentBtn.addEventListener('click', openAddModal);

  // Debounced Search Input for optimal performance
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', debounce((e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    }, 150));
  }

  if (DOM.statusFilter) {
    DOM.statusFilter.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      applyFilters();
    });
  }

  DOM.courseFilterSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      state.courseFilter = e.target.value;
      DOM.courseFilterSelects.forEach(s => s.value = e.target.value);
      applyFilters();
    });
  });

  // Pagination Controls Listeners
  if (DOM.prevPageBtn) {
    DOM.prevPageBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderStudentsTable();
      }
    });
  }

  if (DOM.nextPageBtn) {
    DOM.nextPageBtn.addEventListener('click', () => {
      const maxPage = Math.ceil(state.filteredStudents.length / state.pageSize) || 1;
      if (state.currentPage < maxPage) {
        state.currentPage++;
        renderStudentsTable();
      }
    });
  }

  if (DOM.studentForm) DOM.studentForm.addEventListener('submit', handleFormSubmit);
  if (DOM.confirmDeleteBtn) DOM.confirmDeleteBtn.addEventListener('click', handleDeleteStudent);

  const teacherForm = document.getElementById('teacherForm');
  if (teacherForm) teacherForm.addEventListener('submit', handleTeacherSubmit);

  const feeForm = document.getElementById('feeForm');
  if (feeForm) feeForm.addEventListener('submit', handleFeeSubmit);
}

/* ==========================================================================
   6. API DATA SERVICE & HEALTH
   ========================================================================== */

async function fetchStudents() {
  renderTableLoading();

  try {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const data = await res.json();
    state.students = (Array.isArray(data) && data.length > 0) ? data : getDemoStudents();
    updateBackendStatus(true);
    
    populateCourseFilterDropdowns();
    applyFilters();
    renderCoursesGrid();
  } catch (err) {
    updateBackendStatus(false);
    
    const localData = localStorage.getItem('sms_cached_students');
    if (localData) {
      try {
        state.students = JSON.parse(localData);
      } catch (e) {
        state.students = getDemoStudents();
      }
    } else {
      state.students = getDemoStudents();
      localStorage.setItem('sms_cached_students', JSON.stringify(state.students));
    }
    
    populateCourseFilterDropdowns();
    applyFilters();
    renderCoursesGrid();
  }
}

async function checkBackendHealth() {
  try {
    const res = await fetch(API_BASE_URL, { method: 'HEAD' });
    updateBackendStatus(res.ok);
  } catch (e) {
    updateBackendStatus(false);
  }
}

function updateBackendStatus(isConnected) {
  state.isBackendConnected = isConnected;
}

function getDemoStudents() {
  return [
    { _id: 'demo_1', name: 'Alex Johnson', email: 'alex.j@university.edu', course: 'Computer Science', enrollmentDate: '2024-01-15', status: 'active' },
    { _id: 'demo_2', name: 'Sarah Smith', email: 'sarah.s@university.edu', course: 'Data Science', enrollmentDate: '2023-11-20', status: 'active' },
    { _id: 'demo_3', name: 'Michael Brown', email: 'm.brown@university.edu', course: 'Cyber Security', enrollmentDate: '2024-02-01', status: 'inactive' },
    { _id: 'demo_4', name: 'Emily Davis', email: 'emily.d@university.edu', course: 'Software Engineering', enrollmentDate: '2023-09-10', status: 'active' }
  ];
}

/* ==========================================================================
   7. FILTER ENGINE & RENDERING SYSTEM
   ========================================================================== */

function populateCourseFilterDropdowns() {
  const courses = new Set();
  state.students.forEach(s => {
    if (s && s.course) courses.add(s.course);
  });

  const sortedCourses = Array.from(courses).sort();

  DOM.courseFilterSelects.forEach(select => {
    const currentVal = select.value || 'all';
    select.innerHTML = '<option value="all">All Courses</option>';

    sortedCourses.forEach(course => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      select.appendChild(option);
    });

    select.value = currentVal;
  });
}

function applyFilters() {
  let result = [...state.students];

  if (state.searchQuery) {
    result = result.filter(s =>
      (s.name && s.name.toLowerCase().includes(state.searchQuery)) ||
      (s.email && s.email.toLowerCase().includes(state.searchQuery)) ||
      (s.course && s.course.toLowerCase().includes(state.searchQuery))
    );
  }

  if (state.statusFilter !== 'all') {
    result = result.filter(s => {
      const raw = (s.status || 'active').toString().toLowerCase().trim();
      return raw === state.statusFilter;
    });
  }

  if (state.courseFilter !== 'all') {
    result = result.filter(s => s.course === state.courseFilter);
  }

  state.currentPage = 1;
  state.filteredStudents = result;
  renderDashboardStats();
  renderStudentsTable();
}

function renderDashboardStats() {
  const students = Array.isArray(state.students) ? state.students : [];
  const total = students.length;
  const active = students.filter(s => s && (s.status || 'active').toString().toLowerCase().trim() === 'active').length;
  const inactive = students.filter(s => s && (s.status || '').toString().toLowerCase().trim() === 'inactive').length;
  const courses = new Set(students.map(s => s && s.course).filter(Boolean)).size;

  if (DOM.statTotalStudents) DOM.statTotalStudents.textContent = total;
  if (DOM.statActiveStudents) DOM.statActiveStudents.textContent = active;
  if (DOM.statInactiveStudents) DOM.statInactiveStudents.textContent = inactive;
  if (DOM.statTotalCourses) DOM.statTotalCourses.textContent = courses;
}

function renderStudentsTable() {
  const dashboardTbody = document.getElementById('dashboardTableBody');
  const mainTbody = document.getElementById('studentsTableBody');

  const total = Array.isArray(state.filteredStudents) ? state.filteredStudents.length : 0;
  const maxPage = Math.ceil(total / state.pageSize) || 1;

  if (state.currentPage > maxPage) state.currentPage = maxPage;
  if (state.currentPage < 1) state.currentPage = 1;

  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = Math.min(startIndex + state.pageSize, total);

  // 1. Render Dashboard Table (3 columns: Student, Course, Status)
  if (dashboardTbody) {
    if (total === 0) {
      dashboardTbody.innerHTML = `
        <tr>
          <td colspan="3">
            <div class="table-state">
              <i class="fas fa-folder-open"></i>
              <h3>No Students Found</h3>
            </div>
          </td>
        </tr>
      `;
    } else {
      const topSlice = state.filteredStudents.slice(0, 5);
      dashboardTbody.innerHTML = topSlice.map(student => {
        const initials = getInitials(student.name);
        const rawStatus = (student.status || 'active').toString().toLowerCase().trim();
        const statusClass = rawStatus === 'inactive' ? 'inactive' : 'active';
        const statusText = rawStatus === 'inactive' ? 'Inactive' : 'Active';

        return `
          <tr>
            <td>
              <div class="student-info-cell">
                <div class="avatar">${initials}</div>
                <div>
                  <div class="student-name">${escapeHtml(student.name)}</div>
                  <div class="student-email">${escapeHtml(student.email)}</div>
                </div>
              </div>
            </td>
            <td><strong>${escapeHtml(student.course)}</strong></td>
            <td>
              <span class="status-badge ${statusClass}">
                <span class="badge-dot"></span>
                ${statusText}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. Render Main Directory Table (5 columns)
  if (mainTbody) {
    if (total === 0) {
      mainTbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="table-state">
              <i class="fas fa-folder-open"></i>
              <h3>No Students Found</h3>
              <p>Try adjusting your search criteria or add a new student.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      const paginatedSlice = state.filteredStudents.slice(startIndex, endIndex);
      mainTbody.innerHTML = paginatedSlice.map(student => {
        const initials = getInitials(student.name);
        const formattedDate = formatDate(student.enrollmentDate);
        const rawStatus = (student.status || 'active').toString().toLowerCase().trim();
        const statusClass = rawStatus === 'inactive' ? 'inactive' : 'active';
        const statusText = rawStatus === 'inactive' ? 'Inactive' : 'Active';

        return `
          <tr>
            <td>
              <div class="student-info-cell">
                <div class="avatar">${initials}</div>
                <div>
                  <div class="student-name">${escapeHtml(student.name)}</div>
                  <div class="student-email">${escapeHtml(student.email)}</div>
                </div>
              </div>
            </td>
            <td><strong>${escapeHtml(student.course)}</strong></td>
            <td>${formattedDate}</td>
            <td>
              <span class="status-badge ${statusClass}">
                <span class="badge-dot"></span>
                ${statusText}
              </span>
            </td>
            <td class="actions-cell">
              <div class="actions-group">
                <button class="btn-icon" title="View Details" onclick="viewStudentDetails('${student._id}')">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon edit" title="Edit Student" onclick="openEditModal('${student._id}')">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" title="Delete Student" onclick="openDeleteModal('${student._id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Update Pagination Controls UI
  if (DOM.pageStart) DOM.pageStart.textContent = total === 0 ? 0 : startIndex + 1;
  if (DOM.pageEnd) DOM.pageEnd.textContent = endIndex;
  if (DOM.totalRecords) DOM.totalRecords.textContent = total;
  if (DOM.pageIndicator) DOM.pageIndicator.textContent = `Page ${state.currentPage} of ${maxPage}`;

  if (DOM.prevPageBtn) DOM.prevPageBtn.disabled = (state.currentPage <= 1);
  if (DOM.nextPageBtn) DOM.nextPageBtn.disabled = (state.currentPage >= maxPage || total === 0);
}

function renderTableLoading() {
  if (!DOM.tbodies) return;

  const skeletonHtml = Array(4).fill(0).map(() => `
    <tr>
      <td><div class="skeleton-row" style="width: 75%;"></div></td>
      <td><div class="skeleton-row" style="width: 60%;"></div></td>
      <td><div class="skeleton-row" style="width: 50%;"></div></td>
      <td><div class="skeleton-row" style="width: 40%;"></div></td>
      <td><div class="skeleton-row" style="width: 80%;"></div></td>
    </tr>
  `).join('');

  DOM.tbodies.forEach(tbody => {
    tbody.innerHTML = skeletonHtml;
  });
}

function renderCoursesGrid() {
  if (!DOM.coursesGrid) return;

  const courseCounts = {};
  state.students.forEach(s => {
    if (s && s.course) {
      courseCounts[s.course] = (courseCounts[s.course] || 0) + 1;
    }
  });

  const courses = Object.keys(courseCounts);

  if (courses.length === 0) {
    DOM.coursesGrid.innerHTML = `
      <div class="table-state" style="grid-column: 1 / -1;">
        <i class="fas fa-book"></i>
        <h3>No Courses Found</h3>
        <p>Add students with course programs to see available courses.</p>
      </div>
    `;
    return;
  }

  DOM.coursesGrid.innerHTML = courses.map(course => `
    <div class="course-card">
      <div class="course-icon">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <div class="course-info">
        <h3>${escapeHtml(course)}</h3>
        <p>${courseCounts[course]} Student${courseCounts[course] !== 1 ? 's' : ''} Enrolled</p>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="filterByCourse('${escapeHtml(course)}')">
        View Enrolled
      </button>
    </div>
  `).join('');
}

function filterByCourse(courseName) {
  state.courseFilter = courseName;
  DOM.courseFilterSelects.forEach(s => s.value = courseName);
  switchView('students');
  applyFilters();
}

/* ==========================================================================
   8. MODAL OPERATIONS (ADD, EDIT, DELETE, VIEW)
   ========================================================================== */

function openAddModal() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to add new students.', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  state.editingStudentId = null;
  if (DOM.modalTitle) DOM.modalTitle.textContent = 'Add New Student';
  if (DOM.studentForm) DOM.studentForm.reset();
  
  if (DOM.enrollmentDateInput) {
    DOM.enrollmentDateInput.value = new Date().toISOString().split('T')[0];
  }
  
  if (DOM.studentModal) DOM.studentModal.classList.add('active');
}

function openEditModal(id) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to edit student details.', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  const student = state.students.find(s => String(s._id) === String(id));
  if (!student) return;

  state.editingStudentId = id;
  if (DOM.modalTitle) DOM.modalTitle.textContent = 'Edit Student Details';
  
  if (DOM.studentNameInput) DOM.studentNameInput.value = student.name || '';
  if (DOM.studentEmailInput) DOM.studentEmailInput.value = student.email || '';
  if (DOM.studentCourseInput) DOM.studentCourseInput.value = student.course || '';
  if (DOM.enrollmentDateInput) DOM.enrollmentDateInput.value = student.enrollmentDate ? student.enrollmentDate.substring(0, 10) : '';
  if (DOM.studentStatusInput) DOM.studentStatusInput.value = (student.status || 'active').toString().toLowerCase().trim();

  if (DOM.studentModal) DOM.studentModal.classList.add('active');
}

function viewStudentDetails(id) {
  const student = state.students.find(s => String(s._id) === String(id));
  if (!student) return;

  if (!DOM.viewDetailsContent) return;

  const initials = getInitials(student.name);
  const rawStatus = (student.status || 'active').toString().toLowerCase().trim();
  const statusClass = rawStatus === 'inactive' ? 'inactive' : 'active';
  const statusText = rawStatus === 'inactive' ? 'Inactive' : 'Active';

  DOM.viewDetailsContent.innerHTML = `
    <div class="student-profile-header" style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-color);">
      <div class="avatar" style="width: 68px; height: 68px; font-size: 1.6rem; margin: 0 auto 0.85rem auto; border: 2px solid var(--accent-primary); box-shadow: var(--shadow-glow);">${initials}</div>
      <h3 style="font-size: 1.35rem; margin-bottom: 0.25rem; color: var(--text-main);">${escapeHtml(student.name)}</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem;">${escapeHtml(student.email)}</p>
    </div>
    
    <div class="detail-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div class="detail-item">
        <span class="detail-label"><i class="fas fa-hashtag"></i> Student ID</span>
        <span class="detail-value" style="font-family: monospace; font-size: 0.85rem; background: var(--bg-primary); padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">${student._id}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="fas fa-book-open"></i> Course Program</span>
        <span class="detail-value" style="font-weight: 600;">${escapeHtml(student.course)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="fas fa-calendar-alt"></i> Enrollment Date</span>
        <span class="detail-value">${formatDate(student.enrollmentDate)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="fas fa-info-circle"></i> Account Status</span>
        <span class="status-badge ${statusClass}">
          <span class="badge-dot"></span>
          ${statusText}
        </span>
      </div>
    </div>
  `;

  if (DOM.viewModal) DOM.viewModal.classList.add('active');
}

function openDeleteModal(id) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to delete a student.', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  const student = state.students.find(s => String(s._id) === String(id));
  if (!student) return;

  state.deletingStudentId = id;
  if (DOM.deleteStudentName) DOM.deleteStudentName.textContent = student.name;

  if (DOM.deleteModal) DOM.deleteModal.classList.add('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.classList.remove('active');
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to add or edit students.', 'error');
    setTimeout(() => window.location.href = 'login.html', 1000);
    return;
  }

  const name = DOM.studentNameInput ? DOM.studentNameInput.value.trim() : '';
  const email = DOM.studentEmailInput ? DOM.studentEmailInput.value.trim() : '';
  const course = DOM.studentCourseInput ? DOM.studentCourseInput.value.trim() : '';
  const enrollmentDate = DOM.enrollmentDateInput ? DOM.enrollmentDateInput.value : '';
  const status = DOM.studentStatusInput ? DOM.studentStatusInput.value : 'active';

  if (!name || !email || !course || !enrollmentDate) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const payload = { name, email, course, enrollmentDate, status };
  const saveBtn = document.getElementById('saveStudentBtn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    if (state.editingStudentId) {
      const isLocalOrDemo = String(state.editingStudentId).startsWith('demo_') || String(state.editingStudentId).startsWith('local_');

      if (state.isBackendConnected && !isLocalOrDemo) {
        const res = await fetch(`${API_BASE_URL}/${state.editingStudentId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update student');
        }
        showToast('Student updated successfully', 'success');
        await fetchStudents();
      } else {
        const idx = state.students.findIndex(s => String(s._id) === String(state.editingStudentId));
        if (idx !== -1) {
          state.students[idx] = { ...state.students[idx], ...payload };
          localStorage.setItem('sms_cached_students', JSON.stringify(state.students));
          populateCourseFilterDropdowns();
          applyFilters();
          renderCoursesGrid();
          showToast('Student updated successfully', 'success');
        }
      }
    } else {
      if (state.isBackendConnected) {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to create student');
        }
        showToast('Student added successfully', 'success');
        await fetchStudents();
      } else {
        const newStudent = { _id: 'local_' + Date.now(), ...payload };
        state.students.unshift(newStudent);
        localStorage.setItem('sms_cached_students', JSON.stringify(state.students));
        populateCourseFilterDropdowns();
        applyFilters();
        renderCoursesGrid();
        showToast('Student added locally', 'success');
      }
    }

    closeAllModals();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Student';
    }
  }
}

async function handleDeleteStudent() {
  if (!state.deletingStudentId) return;

  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to delete a student.', 'error');
    setTimeout(() => window.location.href = 'login.html', 1000);
    return;
  }

  if (DOM.confirmDeleteBtn) {
    DOM.confirmDeleteBtn.disabled = true;
    DOM.confirmDeleteBtn.textContent = 'Deleting...';
  }

  try {
    const isLocalOrDemoId = String(state.deletingStudentId).startsWith('demo_') || String(state.deletingStudentId).startsWith('local_');

    if (state.isBackendConnected && !isLocalOrDemoId) {
      const res = await fetch(`${API_BASE_URL}/${state.deletingStudentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete student');
      }
      showToast('Student deleted successfully', 'success');
      await fetchStudents();
    } else {
      state.students = state.students.filter(s => String(s._id) !== String(state.deletingStudentId));
      localStorage.setItem('sms_cached_students', JSON.stringify(state.students));
      populateCourseFilterDropdowns();
      applyFilters();
      renderCoursesGrid();
      showToast('Student deleted successfully', 'success');
    }

    closeAllModals();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (DOM.confirmDeleteBtn) {
      DOM.confirmDeleteBtn.disabled = false;
      DOM.confirmDeleteBtn.textContent = 'Delete';
    }
    state.deletingStudentId = null;
  }
}

function resetLocalCache() {
  if (confirm('Are you sure you want to reset your local student cache? This will restore original demo records.')) {
    localStorage.removeItem('sms_cached_students');
    showToast('Local cache reset successfully', 'success');
    fetchStudents();
  }
}

/* ==========================================================================
   9. UTILITY HELPERS
   ========================================================================== */

function getInitials(name) {
  if (!name) return 'ST';
  return name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

function debounce(func, delay = 150) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function showToast(message, type = 'info') {
  let container = DOM.toastContainer || document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    DOM.toastContainer = container;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toggleSidebar(force) {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar) return;

  const shouldOpen = (force !== undefined) ? force : !sidebar.classList.contains('active');

  if (shouldOpen) {
    sidebar.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  }
}

function openMyProfileModal() {
  const user = getCurrentUser();
  const modalContent = document.getElementById('myProfileModalContent');
  const myProfileModal = document.getElementById('myProfileModal');

  if (!modalContent || !myProfileModal) return;

  if (user && user.name) {
    const initials = getInitials(user.name);
    modalContent.innerHTML = `
      <div class="student-profile-header" style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-color);">
        <div class="avatar" style="width: 72px; height: 72px; font-size: 1.75rem; margin: 0 auto 0.85rem auto; border: 2px solid var(--accent-primary); box-shadow: var(--shadow-glow);">${initials}</div>
        <h3 style="font-size: 1.35rem; margin-bottom: 0.25rem; color: var(--text-main);">${escapeHtml(user.name)}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">${escapeHtml(user.email || 'student@university.edu')}</p>
      </div>
      
      <div class="detail-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div class="detail-item" style="display: flex; justify-content: space-between; padding: 0.6rem 0.75rem; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <span class="detail-label"><i class="fas fa-book-open"></i> Course Program</span>
          <span class="detail-value" style="font-weight: 600;">${escapeHtml(user.course || 'Computer Science')}</span>
        </div>
        <div class="detail-item" style="display: flex; justify-content: space-between; padding: 0.6rem 0.75rem; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <span class="detail-label"><i class="fas fa-user-shield"></i> Role & Status</span>
          <span class="status-badge active">
            <span class="badge-dot"></span>
            Active Student
          </span>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-secondary" style="width: 100%; justify-content: center;" onclick="closeAllModals(); handleLogout();">
          <i class="fas fa-sign-out-alt"></i> Sign Out Account
        </button>
        <button class="btn btn-danger" style="width: 100%; justify-content: center;" onclick="closeAllModals(); handleDeleteAccount();">
          <i class="fas fa-user-times"></i> Delete My Account
        </button>
      </div>
    `;
  } else {
    modalContent.innerHTML = `
      <div style="text-align: center; padding: 1rem 0;">
        <p style="color: var(--text-muted); margin-bottom: 1.25rem;">You are currently browsing in guest mode.</p>
        <div style="display: flex; gap: 0.75rem;">
          <a href="/login" class="btn btn-secondary" style="flex: 1; justify-content: center;">Sign In</a>
          <a href="/register" class="btn btn-primary" style="flex: 1; justify-content: center;">Register Here</a>
        </div>
      </div>
    `;
  }

  myProfileModal.classList.add('active');
}

/* ==========================================================================
   10. EXPORT REPORTS (CSV & PDF)
   ========================================================================== */

function exportToCSV() {
  const students = state.filteredStudents.length > 0 ? state.filteredStudents : state.students;
  if (!students || students.length === 0) {
    showToast('No student records available to export', 'error');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,ID,Name,Email,Course,Enrollment Date,Status\n';
  students.forEach(s => {
    const row = [
      `"${s._id || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.course || '').replace(/"/g, '""')}"`,
      `"${(s.enrollmentDate || '').substring(0, 10)}"`,
      `"${s.status || 'active'}"`
    ].join(',');
    csvContent += row + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Student_Directory_Export_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported Student Directory to CSV', 'success');
}

function exportToPDF() {
  const students = state.filteredStudents.length > 0 ? state.filteredStudents : state.students;
  if (!students || students.length === 0) {
    showToast('No student records available to print', 'error');
    return;
  }

  const printWindow = window.open('', '_blank');
  const rowsHtml = students.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${formatDate(s.enrollmentDate)}</td>
      <td>${s.status || 'active'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Directory Report</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 2rem; color: #111; }
        h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
        p { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ddd; padding: 0.6rem 0.85rem; text-align: left; font-size: 0.85rem; }
        th { background: #f4f4f5; font-weight: 600; }
        .footer { margin-top: 2rem; font-size: 0.75rem; color: #888; text-align: right; }
      </style>
    </head>
    <body>
      <h1>Student Management System - Directory Report</h1>
      <p>Generated on ${new Date().toLocaleString()} • Total Records: ${students.length}</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student Name</th>
            <th>Email Address</th>
            <th>Course Program</th>
            <th>Enrollment Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="footer">Official Institutional Academic Audit Record</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
}

/* ==========================================================================
   11. TEACHERS & FACULTY MODULE
   ========================================================================== */

let teachersList = [
  { _id: 't_1', name: 'Dr. Robert Vance', email: 'r.vance@university.edu', department: 'Computer Science', subject: 'Web Engineering', phone: '+1 (555) 234-5678', officeHours: 'Mon-Fri 10:00 AM - 4:00 PM' },
  { _id: 't_2', name: 'Prof. Elena Rostova', email: 'e.rostova@university.edu', department: 'Data Science', subject: 'Machine Learning', phone: '+1 (555) 345-6789', officeHours: 'Tue-Thu 11:00 AM - 3:00 PM' },
  { _id: 't_3', name: 'Dr. Marcus Sterling', email: 'm.sterling@university.edu', department: 'Cyber Security', subject: 'Ethical Hacking', phone: '+1 (555) 456-7890', officeHours: 'Mon-Wed 01:00 PM - 5:00 PM' }
];

async function fetchTeachers() {
  try {
    const res = await fetch('/teachers');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) teachersList = data;
    }
  } catch (e) {}
  renderTeachersGrid();
}

function renderTeachersGrid() {
  const grid = document.getElementById('teachersGrid');
  if (!grid) return;

  grid.innerHTML = teachersList.map(t => `
    <div class="course-card">
      <div class="course-icon"><i class="fas fa-user-tie"></i></div>
      <div class="course-info">
        <h3>${escapeHtml(t.name)}</h3>
        <p>${escapeHtml(t.subject)} • ${escapeHtml(t.department)}</p>
        <div style="font-size: 0.775rem; color: var(--text-dim); margin-top: 0.4rem;">
          <div><i class="fas fa-phone-alt"></i> ${escapeHtml(t.phone || 'N/A')}</div>
          <div><i class="fas fa-clock"></i> ${escapeHtml(t.officeHours || 'N/A')}</div>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="showToast('Email sent to ${escapeHtml(t.email)}', 'info')">
          <i class="fas fa-envelope"></i> Contact
        </button>
        <button class="btn-icon delete" title="Delete Faculty" onclick="deleteTeacher('${t._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function openAddTeacherModal() {
  const form = document.getElementById('teacherForm');
  if (form) form.reset();
  const modal = document.getElementById('teacherModal');
  if (modal) modal.classList.add('active');
}

async function handleTeacherSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('teacherNameInput')?.value.trim();
  const email = document.getElementById('teacherEmailInput')?.value.trim();
  const department = document.getElementById('teacherDeptInput')?.value.trim();
  const subject = document.getElementById('teacherSubjectInput')?.value.trim();
  const phone = document.getElementById('teacherPhoneInput')?.value.trim();

  if (!name || !email || !department || !subject) return;

  const newTeacher = { _id: 't_' + Date.now(), name, email, department, subject, phone, officeHours: 'Mon-Fri 10:00 AM - 4:00 PM' };

  try {
    const res = await fetch('/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeacher)
    });
    if (res.ok) {
      const saved = await res.json();
      teachersList.unshift(saved);
    } else {
      teachersList.unshift(newTeacher);
    }
  } catch (err) {
    teachersList.unshift(newTeacher);
  }

  renderTeachersGrid();
  closeAllModals();
  showToast('Teacher added successfully', 'success');
}

async function deleteTeacher(id) {
  if (!confirm('Are you sure you want to remove this faculty member?')) return;
  try {
    await fetch(`/teachers/${id}`, { method: 'DELETE' });
  } catch (e) {}
  teachersList = teachersList.filter(t => String(t._id) !== String(id));
  renderTeachersGrid();
  showToast('Teacher deleted successfully', 'info');
}

/* ==========================================================================
   12. DAILY ATTENDANCE ROLL-CALL MODULE
   ========================================================================== */

let currentAttendanceState = {};

function initAttendanceDateInput() {
  const dateInput = document.getElementById('attendanceDateInput');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    loadAttendanceForDate(today);
  }
}

function loadAttendanceForDate(dateStr) {
  const body = document.getElementById('attendanceRollCallBody');
  if (!body) return;

  const students = state.students.length > 0 ? state.students : getDemoStudents();

  body.innerHTML = students.map((s, idx) => {
    const currentStatus = currentAttendanceState[s._id] || (idx % 5 === 0 ? 'absent' : (idx % 7 === 0 ? 'late' : 'present'));
    return `
      <tr>
        <td>
          <div class="student-info-cell">
            <div class="avatar">${getInitials(s.name)}</div>
            <div>
              <div class="student-name">${escapeHtml(s.name)}</div>
              <div class="student-email">${escapeHtml(s.email)}</div>
            </div>
          </div>
        </td>
        <td><strong>${escapeHtml(s.course)}</strong></td>
        <td>
          <div style="display: flex; gap: 0.75rem;">
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: #34d399;">
              <input type="radio" name="att_${s._id}" value="present" ${currentStatus === 'present' ? 'checked' : ''} onchange="currentAttendanceState['${s._id}']='present'; updateAttendanceCounts();" /> Present
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: #f87171;">
              <input type="radio" name="att_${s._id}" value="absent" ${currentStatus === 'absent' ? 'checked' : ''} onchange="currentAttendanceState['${s._id}']='absent'; updateAttendanceCounts();" /> Absent
            </label>
            <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: #fbbf24;">
              <input type="radio" name="att_${s._id}" value="late" ${currentStatus === 'late' ? 'checked' : ''} onchange="currentAttendanceState['${s._id}']='late'; updateAttendanceCounts();" /> Late
            </label>
          </div>
        </td>
        <td>
          <input type="text" class="form-input" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" placeholder="Optional remark..." id="remark_${s._id}" />
        </td>
      </tr>
    `;
  }).join('');

  updateAttendanceCounts();
}

function updateAttendanceCounts() {
  const students = state.students.length > 0 ? state.students : getDemoStudents();
  let present = 0, absent = 0, late = 0;

  students.forEach((s, idx) => {
    const st = currentAttendanceState[s._id] || (idx % 5 === 0 ? 'absent' : (idx % 7 === 0 ? 'late' : 'present'));
    if (st === 'present') present++;
    else if (st === 'absent') absent++;
    else if (st === 'late') late++;
  });

  const pEl = document.getElementById('attPresentCount');
  const aEl = document.getElementById('attAbsentCount');
  const lEl = document.getElementById('attLateCount');

  if (pEl) pEl.textContent = present;
  if (aEl) aEl.textContent = absent;
  if (lEl) lEl.textContent = late;
}

function saveRollCallAttendance() {
  showToast('Attendance roll-call saved for selected date', 'success');
}

/* ==========================================================================
   13. FEE INVOICES & RECEIPT MODULE
   ========================================================================== */

let feeList = [
  { _id: 'f_1', studentName: 'Alex Johnson', studentEmail: 'alex.j@university.edu', course: 'Computer Science', totalFee: 1500, paidAmount: 1500, dueDate: '2026-12-01', status: 'paid' },
  { _id: 'f_2', studentName: 'Sarah Smith', studentEmail: 'sarah.s@university.edu', course: 'Data Science', totalFee: 1800, paidAmount: 1200, dueDate: '2026-11-15', status: 'partial' },
  { _id: 'f_3', studentName: 'Michael Brown', studentEmail: 'm.brown@university.edu', course: 'Cyber Security', totalFee: 1600, paidAmount: 0, dueDate: '2026-10-30', status: 'pending' }
];

async function fetchFees() {
  try {
    const res = await fetch('/fees');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) feeList = data;
    }
  } catch (e) {}
  renderFeesTable();
}

function renderFeesTable() {
  const tbody = document.getElementById('feesTableBody');
  if (!tbody) return;

  tbody.innerHTML = feeList.map(f => {
    const dueClass = f.status === 'paid' ? 'active' : (f.status === 'partial' ? 'active' : 'inactive');
    return `
      <tr>
        <td><strong>${escapeHtml(f.studentName)}</strong></td>
        <td>${escapeHtml(f.course)}</td>
        <td>$${f.totalFee}</td>
        <td><strong style="color: #34d399;">$${f.paidAmount}</strong></td>
        <td><span class="status-badge ${dueClass}"><span class="badge-dot"></span> ${f.status.toUpperCase()}</span></td>
        <td class="actions-cell">
          <button class="btn btn-secondary btn-sm" onclick="openFeeReceiptModal('${f._id}')">
            <i class="fas fa-receipt"></i> Printable Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddFeeModal() {
  const form = document.getElementById('feeForm');
  if (form) form.reset();
  const modal = document.getElementById('feeModal');
  if (modal) modal.classList.add('active');
}

async function handleFeeSubmit(e) {
  e.preventDefault();
  const studentName = document.getElementById('feeStudentName')?.value.trim();
  const course = document.getElementById('feeCourse')?.value.trim();
  const totalFee = Number(document.getElementById('feeTotalAmount')?.value) || 0;
  const paidAmount = Number(document.getElementById('feePaidAmount')?.value) || 0;
  const dueDate = document.getElementById('feeDueDate')?.value;

  if (!studentName || !course || !totalFee || !dueDate) return;

  let status = 'pending';
  if (paidAmount >= totalFee) status = 'paid';
  else if (paidAmount > 0) status = 'partial';

  const newFee = { _id: 'f_' + Date.now(), studentName, course, totalFee, paidAmount, dueDate, status };
  feeList.unshift(newFee);
  renderFeesTable();
  closeAllModals();
  showToast('Fee invoice created successfully', 'success');
}

function openFeeReceiptModal(id) {
  const item = feeList.find(f => String(f._id) === String(id));
  if (!item) return;

  const content = document.getElementById('feeReceiptContent');
  const modal = document.getElementById('feeReceiptModal');
  if (!content || !modal) return;

  content.innerHTML = `
    <div style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md); background: var(--bg-primary);">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.25rem; color: var(--text-main);">UNIVERSITY ACADEMIC FEE RECEIPT</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Receipt Ref: #${item._id.toUpperCase()}</p>
        </div>
        <div style="text-align: right;">
          <strong style="color: var(--accent-primary);">STUDENT MANAGEMENT SYSTEM</strong>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <div class="detail-list">
        <div class="detail-item"><span class="detail-label">Student Name</span><span class="detail-value">${escapeHtml(item.studentName)}</span></div>
        <div class="detail-item"><span class="detail-label">Course Program</span><span class="detail-value">${escapeHtml(item.course)}</span></div>
        <div class="detail-item"><span class="detail-label">Total Tuition Fee</span><span class="detail-value">$${item.totalFee}</span></div>
        <div class="detail-item"><span class="detail-label">Total Paid Amount</span><span class="detail-value" style="color: #34d399;">$${item.paidAmount}</span></div>
        <div class="detail-item"><span class="detail-label">Remaining Balance</span><span class="detail-value" style="color: #f87171;">$${item.totalFee - item.paidAmount}</span></div>
        <div class="detail-item"><span class="detail-label">Payment Status</span><span class="status-badge active">${item.status.toUpperCase()}</span></div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function printReceiptWindow() {
  window.print();
}

/* ==========================================================================
   14. GLOBAL SCOPE BINDINGS
   ========================================================================== */

window.viewStudentDetails = viewStudentDetails;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.filterByCourse = filterByCourse;
window.resetLocalCache = resetLocalCache;
window.checkBackendHealth = checkBackendHealth;
window.openAddModal = openAddModal;
window.toggleTheme = toggleTheme;
window.handleLogout = handleLogout;
window.handleDeleteAccount = handleDeleteAccount;
window.toggleSidebar = toggleSidebar;
window.openMyProfileModal = openMyProfileModal;
window.closeAllModals = closeAllModals;

window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.openAddTeacherModal = openAddTeacherModal;
window.deleteTeacher = deleteTeacher;
window.loadAttendanceForDate = loadAttendanceForDate;
window.saveRollCallAttendance = saveRollCallAttendance;
window.openAddFeeModal = openAddFeeModal;
window.openFeeReceiptModal = openFeeReceiptModal;
window.printReceiptWindow = printReceiptWindow;
