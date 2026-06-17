// Local Storage Database Mock Layer

const SEED_PROFILES = [
  {
    id: 'mock-uuid-super-admin',
    full_name: 'Super Admin User',
    email: 'superadmin@platform.com',
    role: 'Super Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-uuid-admin',
    full_name: 'Admin Manager',
    email: 'admin@platform.com',
    role: 'Admin',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-uuid-employee',
    full_name: 'Alex Cooper',
    email: 'user@platform.com',
    role: 'User',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-uuid-employee-2',
    full_name: 'Jane Smith',
    email: 'jane@platform.com',
    role: 'User',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Acme Web App Redesign',
    description: 'Modernize the main dashboard and customer portal with Tailwind and Vue 3.',
    status: 'Active',
    created_by: 'mock-uuid-admin',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj-2',
    title: 'Employee Performance Metrics',
    description: 'Design SVG charts and visual reporting modules for user feedback.',
    status: 'Planning',
    created_by: 'mock-uuid-super-admin',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj-3',
    title: 'Cloud Database Migration',
    description: 'Migrate legacy databases to Supabase PostgreSQL infrastructure.',
    status: 'Completed',
    created_by: 'mock-uuid-admin',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_TASKS = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Setup Project Repository & Build Tools',
    description: 'Initialize Vite with Vue 3, Vue Router, Pinia, and Tailwind CSS v4.',
    assigned_to: 'mock-uuid-employee',
    assigned_by: 'mock-uuid-admin',
    priority: 'High',
    status: 'Completed',
    progress: 100,
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    title: 'Create Kanban Board Interface',
    description: 'Implement drag and drop support and task cards categorized by status lane.',
    assigned_to: 'mock-uuid-employee',
    assigned_by: 'mock-uuid-admin',
    priority: 'High',
    status: 'In Progress',
    progress: 65,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-3',
    project_id: 'proj-1',
    title: 'Implement Realtime Dashboard Updates',
    description: 'Connect database updates to dashboard notification drawer and counters.',
    assigned_to: 'mock-uuid-employee-2',
    assigned_by: 'mock-uuid-admin',
    priority: 'Critical',
    status: 'Review',
    progress: 90,
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-4',
    project_id: 'proj-2',
    title: 'Research Chart Libraries for Vue 3',
    description: 'Compare apexcharts, chart.js, and pure custom SVG graphs for dashboard design.',
    assigned_to: 'mock-uuid-employee',
    assigned_by: 'mock-uuid-super-admin',
    priority: 'Medium',
    status: 'Pending',
    progress: 0,
    due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-5',
    project_id: 'proj-2',
    title: 'Write SQL Migration Scripts',
    description: 'Prepare database schema definitions for RLS policies, trigger sync, and notifications tables.',
    assigned_to: 'mock-uuid-employee-2',
    assigned_by: 'mock-uuid-super-admin',
    priority: 'Low',
    status: 'Pending',
    progress: 10,
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_COMMENTS = [
  {
    id: 'comm-1',
    task_id: 'task-2',
    user_id: 'mock-uuid-admin',
    comment: 'Excellent work on the basic styling. Please make sure the drag operations feel smooth and responsive on mobile.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comm-2',
    task_id: 'task-2',
    user_id: 'mock-uuid-employee',
    comment: "Thanks! I'm using HTML5 drag events with Tailwind transitions, it works really well.",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_ATTACHMENTS = [
  {
    id: 'att-1',
    task_id: 'task-2',
    uploaded_by: 'mock-uuid-employee',
    file_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop',
    file_name: 'kanban_ui_screenshot.jpg',
    file_size: 145000,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'not-1',
    user_id: 'mock-uuid-employee',
    title: 'New Task Assigned',
    message: 'Admin Manager assigned you: Setup Project Repository & Build Tools',
    is_read: true,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'not-2',
    user_id: 'mock-uuid-employee',
    title: 'New Task Assigned',
    message: 'Admin Manager assigned you: Create Kanban Board Interface',
    is_read: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'not-3',
    user_id: 'mock-uuid-employee-2',
    title: 'New Comment Posted',
    message: 'Admin Manager commented on task: Implement Realtime Dashboard Updates',
    is_read: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// DB Helper Functions
const getDB = (key, seedData) => {
  const data = localStorage.getItem(`task_platform_${key}`);
  if (!data) {
    localStorage.setItem(`task_platform_${key}`, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(data);
};

const saveDB = (key, data) => {
  localStorage.setItem(`task_platform_${key}`, JSON.stringify(data));
};

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Event emitter helper for Mock Realtime
const emitRealtimeUpdate = (type, payload) => {
  const event = new CustomEvent('mock-supabase-realtime', {
    detail: { type, payload, timestamp: new Date().toISOString() }
  });
  window.dispatchEvent(event);
};

export const mockDb = {
  // --- AUTH METHODS ---
  async login(email, password) {
    await delay(500);
    const profiles = getDB('profiles', SEED_PROFILES);
    const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid login credentials');
    }
    
    // In mock mode, any password works, default is 'password123'
    const session = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url
        }
      },
      access_token: `mock-jwt-token-for-${user.id}`
    };
    
    localStorage.setItem('task_platform_session', JSON.stringify(session));
    return { data: session, error: null };
  },

  async signup(email, password, fullName, role = 'User') {
    await delay(600);
    const profiles = getDB('profiles', SEED_PROFILES);
    const exists = profiles.some(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      throw new Error('User with this email already exists');
    }
    
    const newId = `mock-uuid-${Math.random().toString(36).substr(2, 9)}`;
    const newProfile = {
      id: newId,
      full_name: fullName,
      email: email,
      role: role,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
      created_at: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    saveDB('profiles', profiles);

    // Create session immediately (simple auth)
    const session = {
      user: {
        id: newId,
        email: email,
        user_metadata: {
          full_name: fullName,
          role: role,
          avatar_url: newProfile.avatar_url
        }
      },
      access_token: `mock-jwt-token-for-${newId}`
    };
    
    localStorage.setItem('task_platform_session', JSON.stringify(session));
    return { data: session, error: null };
  },

  async logout() {
    await delay(200);
    localStorage.removeItem('task_platform_session');
    return { error: null };
  },

  async getSession() {
    const sessionStr = localStorage.getItem('task_platform_session');
    if (!sessionStr) return { data: { session: null }, error: null };
    return { data: { session: JSON.parse(sessionStr) }, error: null };
  },

  async getCurrentProfile(userId) {
    await delay(100);
    const profiles = getDB('profiles', SEED_PROFILES);
    const profile = profiles.find(p => p.id === userId);
    return profile || null;
  },

  async updateProfile(userId, updates) {
    await delay(400);
    const profiles = getDB('profiles', SEED_PROFILES);
    const index = profiles.findIndex(p => p.id === userId);
    if (index === -1) throw new Error('Profile not found');
    
    profiles[index] = { ...profiles[index], ...updates };
    saveDB('profiles', profiles);
    
    // Also update active session if it matches
    const sessionStr = localStorage.getItem('task_platform_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.user.id === userId) {
        session.user.user_metadata = {
          ...session.user.user_metadata,
          full_name: profiles[index].full_name,
          avatar_url: profiles[index].avatar_url,
          role: profiles[index].role
        };
        localStorage.setItem('task_platform_session', JSON.stringify(session));
      }
    }
    
    return profiles[index];
  },

  async getProfiles() {
    await delay(300);
    return getDB('profiles', SEED_PROFILES);
  },

  // --- PROJECTS ---
  async getProjects() {
    await delay(400);
    const projects = getDB('projects', SEED_PROJECTS);
    const profiles = getDB('profiles', SEED_PROFILES);
    
    return projects.map(p => ({
      ...p,
      creator: profiles.find(prof => prof.id === p.created_by) || null
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createProject(project) {
    await delay(500);
    const projects = getDB('projects', SEED_PROJECTS);
    const newProject = {
      id: `proj-${Math.random().toString(36).substr(2, 9)}`,
      ...project,
      created_at: new Date().toISOString()
    };
    projects.push(newProject);
    saveDB('projects', projects);
    emitRealtimeUpdate('PROJECT_CREATED', newProject);
    return newProject;
  },

  async updateProject(id, updates) {
    await delay(400);
    const projects = getDB('projects', SEED_PROJECTS);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Project not found');

    projects[index] = { ...projects[index], ...updates };
    saveDB('projects', projects);
    emitRealtimeUpdate('PROJECT_UPDATED', projects[index]);
    return projects[index];
  },

  async deleteProject(id) {
    await delay(400);
    let projects = getDB('projects', SEED_PROJECTS);
    projects = projects.filter(p => p.id !== id);
    saveDB('projects', projects);
    
    // Cascade delete tasks
    let tasks = getDB('tasks', SEED_TASKS);
    tasks = tasks.filter(t => t.project_id !== id);
    saveDB('tasks', tasks);
    
    emitRealtimeUpdate('PROJECT_DELETED', { id });
    return true;
  },

  // --- TASKS ---
  async getTasks(projectId = null) {
    await delay(350);
    let tasks = getDB('tasks', SEED_TASKS);
    if (projectId) {
      tasks = tasks.filter(t => t.project_id === projectId);
    }
    const profiles = getDB('profiles', SEED_PROFILES);
    const projects = getDB('projects', SEED_PROJECTS);

    return tasks.map(t => ({
      ...t,
      assignee: profiles.find(prof => prof.id === t.assigned_to) || null,
      assigner: profiles.find(prof => prof.id === t.assigned_by) || null,
      project: projects.find(proj => proj.id === t.project_id) || null
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createTask(task) {
    await delay(400);
    const tasks = getDB('tasks', SEED_TASKS);
    const newTask = {
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      status: 'Pending',
      progress: 0,
      ...task,
      created_at: new Date().toISOString()
    };
    tasks.push(newTask);
    saveDB('tasks', tasks);

    // Auto-create notification for assignee
    if (newTask.assigned_to) {
      const assignerName = (getDB('profiles', SEED_PROFILES).find(p => p.id === newTask.assigned_by))?.full_name || 'Admin';
      await this.createNotification({
        user_id: newTask.assigned_to,
        title: 'New Task Assigned',
        message: `${assignerName} assigned you task: "${newTask.title}"`
      });
    }

    emitRealtimeUpdate('TASK_CREATED', newTask);
    return newTask;
  },

  async updateTask(id, updates) {
    await delay(300);
    const tasks = getDB('tasks', SEED_TASKS);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');

    const previousTask = { ...tasks[index] };
    tasks[index] = { ...tasks[index], ...updates };
    
    // Automatically enforce 100% progress if Completed status is selected
    if (updates.status === 'Completed' && previousTask.status !== 'Completed') {
      tasks[index].progress = 100;
    } else if (updates.status && updates.status !== 'Completed' && previousTask.status === 'Completed' && !updates.progress) {
      // If moved back, drop progress below 100
      tasks[index].progress = 90;
    }
    
    saveDB('tasks', tasks);

    // Notification trigger for updates
    if (updates.status && updates.status !== previousTask.status && tasks[index].assigned_to) {
      // Notify creator or assignee
      const triggerUser = localStorage.getItem('task_platform_session') 
        ? JSON.parse(localStorage.getItem('task_platform_session')).user.id 
        : null;

      if (triggerUser && triggerUser !== tasks[index].assigned_to) {
        // Assignee got updated by someone else
        await this.createNotification({
          user_id: tasks[index].assigned_to,
          title: 'Task Status Updated',
          message: `Your task "${tasks[index].title}" was set to ${updates.status}`
        });
      } else if (tasks[index].assigned_by && triggerUser === tasks[index].assigned_to) {
        // Employee updated status, notify admin assigner
        const employeeName = (getDB('profiles', SEED_PROFILES).find(p => p.id === triggerUser))?.full_name || 'Employee';
        await this.createNotification({
          user_id: tasks[index].assigned_by,
          title: 'Task Progress Update',
          message: `${employeeName} marked "${tasks[index].title}" as ${updates.status}`
        });
      }
    }

    emitRealtimeUpdate('TASK_UPDATED', tasks[index]);
    return tasks[index];
  },

  async deleteTask(id) {
    await delay(300);
    let tasks = getDB('tasks', SEED_TASKS);
    tasks = tasks.filter(t => t.id !== id);
    saveDB('tasks', tasks);
    
    // Cascade comments and attachments
    let comments = getDB('comments', SEED_COMMENTS);
    comments = comments.filter(c => c.task_id !== id);
    saveDB('comments', comments);

    let attachments = getDB('attachments', SEED_ATTACHMENTS);
    attachments = attachments.filter(a => a.task_id !== id);
    saveDB('attachments', attachments);

    emitRealtimeUpdate('TASK_DELETED', { id });
    return true;
  },

  // --- COMMENTS ---
  async getComments(taskId) {
    await delay(200);
    const comments = getDB('comments', SEED_COMMENTS).filter(c => c.task_id === taskId);
    const profiles = getDB('profiles', SEED_PROFILES);

    return comments.map(c => ({
      ...c,
      user: profiles.find(prof => prof.id === c.user_id) || null
    })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Chronological order
  },

  async createComment(comment) {
    await delay(300);
    const comments = getDB('comments', SEED_COMMENTS);
    const newComment = {
      id: `comm-${Math.random().toString(36).substr(2, 9)}`,
      ...comment,
      created_at: new Date().toISOString()
    };
    comments.push(newComment);
    saveDB('comments', comments);

    // Notify assignee/assigner of comment
    const tasks = getDB('tasks', SEED_TASKS);
    const task = tasks.find(t => t.id === newComment.task_id);
    if (task) {
      const profiles = getDB('profiles', SEED_PROFILES);
      const commenterName = profiles.find(p => p.id === newComment.user_id)?.full_name || 'Someone';
      
      const targetUser = newComment.user_id === task.assigned_to ? task.assigned_by : task.assigned_to;
      if (targetUser && targetUser !== newComment.user_id) {
        await this.createNotification({
          user_id: targetUser,
          title: 'New Task Comment',
          message: `${commenterName} commented: "${newComment.comment.substring(0, 40)}${newComment.comment.length > 40 ? '...' : ''}"`
        });
      }
    }

    emitRealtimeUpdate('COMMENT_CREATED', newComment);
    return newComment;
  },

  // --- ATTACHMENTS ---
  async getAttachments(taskId) {
    await delay(200);
    const attachments = getDB('attachments', SEED_ATTACHMENTS).filter(a => a.task_id === taskId);
    const profiles = getDB('profiles', SEED_PROFILES);

    return attachments.map(a => ({
      ...a,
      uploader: profiles.find(prof => prof.id === a.uploaded_by) || null
    }));
  },

  async createAttachment(attachment) {
    await delay(500);
    const attachments = getDB('attachments', SEED_ATTACHMENTS);
    const newAttachment = {
      id: `att-${Math.random().toString(36).substr(2, 9)}`,
      ...attachment,
      created_at: new Date().toISOString()
    };
    attachments.push(newAttachment);
    saveDB('attachments', attachments);
    emitRealtimeUpdate('ATTACHMENT_CREATED', newAttachment);
    return newAttachment;
  },

  async deleteAttachment(id) {
    await delay(300);
    let attachments = getDB('attachments', SEED_ATTACHMENTS);
    attachments = attachments.filter(a => a.id !== id);
    saveDB('attachments', attachments);
    emitRealtimeUpdate('ATTACHMENT_DELETED', { id });
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId) {
    await delay(150);
    const notifications = getDB('notifications', SEED_NOTIFICATIONS);
    return notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async createNotification(notification) {
    const notifications = getDB('notifications', SEED_NOTIFICATIONS);
    const newNotification = {
      id: `not-${Math.random().toString(36).substr(2, 9)}`,
      is_read: false,
      created_at: new Date().toISOString(),
      ...notification
    };
    notifications.push(newNotification);
    saveDB('notifications', notifications);
    emitRealtimeUpdate('NOTIFICATION_RECEIVED', newNotification);
    return newNotification;
  },

  async markNotificationRead(id) {
    const notifications = getDB('notifications', SEED_NOTIFICATIONS);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].is_read = true;
      saveDB('notifications', notifications);
      emitRealtimeUpdate('NOTIFICATION_UPDATED', notifications[index]);
    }
    return true;
  },

  async markAllNotificationsRead(userId) {
    const notifications = getDB('notifications', SEED_NOTIFICATIONS);
    let updated = false;
    notifications.forEach(n => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        updated = true;
      }
    });
    if (updated) {
      saveDB('notifications', notifications);
      emitRealtimeUpdate('NOTIFICATIONS_ALL_READ', { user_id: userId });
    }
    return true;
  }
};
