import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

export const dbService = {
  // --- PROJECTS ---
  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, creator:profiles!projects_created_by_fkey(id, full_name, email, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createProject(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select('*, creator:profiles!projects_created_by_fkey(id, full_name, email, avatar_url)')
      .single()

    if (error) throw error
    return data
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select('*, creator:profiles!projects_created_by_fkey(id, full_name, email, avatar_url)')
      .single()

    if (error) throw error
    return data
  },

  async deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // --- TASKS ---
  async getTasks(projectId = null) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role),
        assigner:profiles!tasks_assigned_by_fkey(id, full_name, email, avatar_url, role),
        project:projects(*)
      `)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getTask(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role),
        assigner:profiles!tasks_assigned_by_fkey(id, full_name, email, avatar_url, role),
        project:projects(*)
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async createTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role),
        assigner:profiles!tasks_assigned_by_fkey(id, full_name, email, avatar_url, role),
        project:projects(*)
      `)
      .single()

    if (error) throw error

    // Create real notification inside Supabase
    if (task.assigned_to) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', task.assigned_by)
          .single()
        
        const assignerName = profile?.full_name || 'Admin'
        await this.createNotification({
          user_id: task.assigned_to,
          title: 'New Task Assigned',
          message: `${assignerName} assigned you task: "${task.title}"`
        })
      } catch (err) {
        console.warn('Failed to send assignment notification:', err)
      }
    }

    return data
  },

  async updateTask(id, updates) {
    // Capture previous state for notification triggers
    const { data: previousTask } = await supabase
      .from('tasks')
      .select('status, assigned_to, assigned_by, title')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role),
        assigner:profiles!tasks_assigned_by_fkey(id, full_name, email, avatar_url, role),
        project:projects(*)
      `)
      .single()

    if (error) throw error

    // Send notifications on status change
    if (updates.status && previousTask && updates.status !== previousTask.status) {
      const authStore = useAuthStore()
      const triggerUserId = authStore.userProfile?.id

      if (triggerUserId && triggerUserId !== previousTask.assigned_to && previousTask.assigned_to) {
        await this.createNotification({
          user_id: previousTask.assigned_to,
          title: 'Task Status Updated',
          message: `Your task "${previousTask.title}" was set to "${updates.status}"`
        })
      } else if (triggerUserId === previousTask.assigned_to && previousTask.assigned_by) {
        try {
          const { data: employeeProf } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', triggerUserId)
            .single()

          const name = employeeProf?.full_name || 'Employee'
          await this.createNotification({
            user_id: previousTask.assigned_by,
            title: 'Task Progress Update',
            message: `${name} marked "${previousTask.title}" as "${updates.status}"`
          })
        } catch (err) {
          console.warn('Notification failure:', err)
        }
      }
    }

    return data
  },

  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // --- COMMENTS ---
  async getComments(taskId) {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*, user:profiles(id, full_name, email, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async createComment(comment) {
    const { data, error } = await supabase
      .from('task_comments')
      .insert([comment])
      .select('*, user:profiles(id, full_name, email, avatar_url)')
      .single()

    if (error) throw error

    // Notification trigger for comment
    try {
      const { data: task } = await supabase
        .from('tasks')
        .select('assigned_to, assigned_by, title')
        .eq('id', comment.task_id)
        .single()

      if (task) {
        const commenterId = comment.user_id
        const targetUserId = commenterId === task.assigned_to ? task.assigned_by : task.assigned_to
        
        if (targetUserId && targetUserId !== commenterId) {
          const { data: commenterProf } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', commenterId)
            .single()

          const commenterName = commenterProf?.full_name || 'Someone'
          await this.createNotification({
            user_id: targetUserId,
            title: 'New Task Comment',
            message: `${commenterName} commented: "${comment.comment.substring(0, 40)}${comment.comment.length > 40 ? '...' : ''}"`
          })
        }
      }
    } catch (err) {
      console.warn('Comment notification trigger failure:', err)
    }

    return data
  },

  // --- ATTACHMENTS ---
  async getAttachments(taskId) {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*, uploader:profiles(id, full_name, email, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async createAttachment(attachment) {
    const { data, error } = await supabase
      .from('task_attachments')
      .insert([attachment])
      .select('*, uploader:profiles(id, full_name, email, avatar_url)')
      .single()

    if (error) throw error
    return data
  },

  async deleteAttachment(id) {
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createNotification(notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markNotificationRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markAllNotificationsRead(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select()

    if (error) throw error
    return data
  }
}
