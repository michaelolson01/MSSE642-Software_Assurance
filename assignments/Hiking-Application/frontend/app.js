let currentUser = null;
let currentEventId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    currentUser = JSON.parse(user);
    api.setToken(token);
    showUserSection();
  } else {
    showAuthSection();
  }

  // Event listeners
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
  document.getElementById('createEventForm')?.addEventListener('submit', handleCreateEvent);
});

// Auth handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const result = await api.login(email, password);
    currentUser = { user_id: result.user_id, email, role: result.role };
    localStorage.setItem('user', JSON.stringify(currentUser));
    api.setToken(result.token);
    showUserSection();
    showAlert('Login successful!', 'success');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const firstName = document.getElementById('registerFirstName').value;
  const lastName = document.getElementById('registerLastName').value;

  try {
    const result = await api.register(email, password, firstName, lastName);
    currentUser = { user_id: result.user_id, email, role: result.role };
    localStorage.setItem('user', JSON.stringify(currentUser));
    api.setToken(result.token);
    showUserSection();
    showAlert('Registration successful!', 'success');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function handleLogout() {
  try {
    await api.logout();
    currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.clearToken();
    showAuthSection();
    showAlert('Logged out successfully', 'success');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Section visibility
function showAuthSection() {
  document.getElementById('authSection').style.display = 'block';
  document.getElementById('guestSection').style.display = 'none';
  document.getElementById('memberSection').style.display = 'none';
  document.getElementById('tripLeaderSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('userInfo').textContent = '';
}

function showUserSection() {
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'block';
  document.getElementById('userInfo').textContent = `${currentUser.email} (${currentUser.role})`;

  if (currentUser.role === 'guest') {
    document.getElementById('guestSection').style.display = 'block';
    document.getElementById('memberSection').style.display = 'none';
    document.getElementById('tripLeaderSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'none';
    loadGuestEvents();
  } else if (currentUser.role === 'member') {
    document.getElementById('guestSection').style.display = 'none';
    document.getElementById('memberSection').style.display = 'block';
    document.getElementById('tripLeaderSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'none';
    loadMemberEvents();
    loadMemberProfile();
  } else if (currentUser.role === 'trip_leader') {
    document.getElementById('guestSection').style.display = 'none';
    document.getElementById('memberSection').style.display = 'none';
    document.getElementById('tripLeaderSection').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
    loadTripLeaderEvents();
    loadMemberProfile();
  } else if (currentUser.role === 'system_admin') {
    document.getElementById('guestSection').style.display = 'none';
    document.getElementById('memberSection').style.display = 'none';
    document.getElementById('tripLeaderSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    loadAdminUsers();
    loadTripLeaderEvents();
    loadMemberProfile();
  }
}

// Tab switching
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  const tabId = tabName + 'Tab';
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add('active');
  }

  event.target.classList.add('active');
}

// Event loading
async function loadGuestEvents() {
  try {
    const events = await api.getAllEvents();
    const container = document.getElementById('guestEventsList');
    container.innerHTML = events.map(event => `
      <div class="event-card" onclick="openEventModal(${event.id})">
        <h3>${event.title}</h3>
        <p>${event.description || 'No description'}</p>
        <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
        <p><strong>Capacity:</strong> <span class="capacity">${event.registered_count}/${event.capacity}</span></p>
      </div>
    `).join('');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function loadMemberEvents() {
  try {
    const events = await api.getAllEvents();
    const container = document.getElementById('memberEventsList');
    container.innerHTML = events.map(event => `
      <div class="event-card" onclick="openEventModal(${event.id})">
        <h3>${event.title}</h3>
        <p>${event.description || 'No description'}</p>
        <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
        <p><strong>Capacity:</strong> <span class="capacity">${event.registered_count}/${event.capacity}</span></p>
      </div>
    `).join('');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function loadTripLeaderEvents() {
  try {
    const events = await api.getAllEvents();
    const container = document.getElementById('tripLeaderEventsList') || document.getElementById('adminEventsList');
    if (!container) return;

    container.innerHTML = events.map(event => `
      <div class="event-card" onclick="openEventModal(${event.id})">
        <h3>${event.title}</h3>
        <p>${event.description || 'No description'}</p>
        <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
        <p><strong>Capacity:</strong> <span class="capacity">${event.registered_count}/${event.capacity}</span></p>
      </div>
    `).join('');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Event modal
async function openEventModal(eventId) {
  try {
    currentEventId = eventId;
    const event = await api.getEventById(eventId);

    document.getElementById('modalEventTitle').textContent = event.title;
    document.getElementById('modalEventDescription').textContent = event.description || 'No description';
    document.getElementById('modalEventDate').textContent = new Date(event.event_date).toLocaleString();
    document.getElementById('modalEventCapacity').textContent = event.capacity;
    document.getElementById('modalEventRegistered').textContent = event.registered_count || 0;

    // Show appropriate actions based on role
    document.getElementById('memberActions').style.display = currentUser.role === 'member' ? 'block' : 'none';
    document.getElementById('tripLeaderActions').style.display = 
      (currentUser.role === 'trip_leader' || currentUser.role === 'system_admin') && event.trip_leader_id === currentUser.user_id ? 'block' : 'none';

    if (currentUser.role === 'trip_leader' || currentUser.role === 'system_admin') {
      if (event.trip_leader_id === currentUser.user_id) {
        const members = await api.getEventMembers(eventId);
        const waitlist = await api.getEventWaitlist(eventId);

        const membersTable = document.getElementById('eventMembersTable').querySelector('tbody');
        membersTable.innerHTML = members.map(member => `
          <tr>
            <td>${member.first_name} ${member.last_name}</td>
            <td>${member.email}</td>
            <td>${member.status}</td>
            <td>
              <button class="btn btn-danger" onclick="removeMember(${eventId}, ${member.id})">Remove</button>
            </td>
          </tr>
        `).join('');

        const waitlistTable = document.getElementById('eventWaitlistTable').querySelector('tbody');
        waitlistTable.innerHTML = waitlist.map(w => `
          <tr>
            <td>${w.position}</td>
            <td>${w.first_name} ${w.last_name}</td>
            <td>${w.email}</td>
          </tr>
        `).join('');
      }
    }

    document.getElementById('eventModal').style.display = 'block';
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function closeEventModal() {
  document.getElementById('eventModal').style.display = 'none';
  currentEventId = null;
}

async function registerForEvent() {
  try {
    await api.registerForEvent(currentEventId, currentUser.user_id);
    showAlert('Registered successfully!', 'success');
    closeEventModal();
    loadMemberEvents();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function removeMember(eventId, memberId) {
  if (confirm('Remove this member from the event?')) {
    try {
      await api.removeFromEvent(eventId, memberId);
      showAlert('Member removed', 'success');
      openEventModal(eventId);
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
}

// Event creation
async function handleCreateEvent(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value;
  const description = document.getElementById('eventDescription').value;
  const event_date = document.getElementById('eventDate').value;
  const capacity = parseInt(document.getElementById('eventCapacity').value);

  try {
    await api.createEvent(title, description, event_date, capacity);
    showAlert('Event created successfully!', 'success');
    document.getElementById('createEventForm').reset();
    loadTripLeaderEvents();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Profile management
async function loadMemberProfile() {
  try {
    const profile = await api.getMemberProfile(currentUser.user_id);
    if (profile) {
      document.getElementById('profileFirstName').value = profile.first_name || '';
      document.getElementById('profileLastName').value = profile.last_name || '';
      document.getElementById('profileEmail').value = profile.email || '';
      document.getElementById('profileHomeAddress').value = profile.home_address || '';
      document.getElementById('profileMedicalInfo').value = profile.medical_info || '';
      document.getElementById('profileFitnessNotes').value = profile.fitness_notes || '';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const home_address = document.getElementById('profileHomeAddress').value;
  const medical_info = document.getElementById('profileMedicalInfo').value;
  const fitness_notes = document.getElementById('profileFitnessNotes').value;

  try {
    await api.updateMemberProfile(currentUser.user_id, home_address, medical_info, fitness_notes);
    showAlert('Profile updated successfully!', 'success');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Admin functions
async function loadAdminUsers() {
  try {
    const users = await api.getAllUsers();
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>
          <select onchange="updateUserRole(${user.id}, this.value)">
            <option value="guest" ${user.role === 'guest' ? 'selected' : ''}>Guest</option>
            <option value="member" ${user.role === 'member' ? 'selected' : ''}>Member</option>
            <option value="trip_leader" ${user.role === 'trip_leader' ? 'selected' : ''}>Trip Leader</option>
            <option value="system_admin" ${user.role === 'system_admin' ? 'selected' : ''}>System Admin</option>
          </select>
        </td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function updateUserRole(userId, role) {
  try {
    await api.updateUserRole(userId, role);
    showAlert('User role updated', 'success');
    loadAdminUsers();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function deleteUser(userId) {
  if (confirm('Delete this user?')) {
    try {
      await api.deleteUser(userId);
      showAlert('User deleted', 'success');
      loadAdminUsers();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
}

// Utility functions
function toggleAuthForm() {
  const loginForm = document.querySelector('.auth-form');
  const registerForm = document.getElementById('registerForm');
  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} show`;
  alertDiv.textContent = message;
  document.body.insertBefore(alertDiv, document.body.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}
