import { supabase } from '../lib/supabase'

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Invalid email or password')
    localStorage.setItem('task_tracker_profile', JSON.stringify(data))
    return data
  },

  async register(email, password, fullName, role = 'User') {
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (checkError) throw checkError
    if (existing) throw new Error('Email is already registered')

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        email,
        password,
        full_name: fullName,
        role,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`
      })
      .select()
      .single()

    if (error) throw error
    localStorage.setItem('task_tracker_profile', JSON.stringify(data))
    return data
  },

  async logout() {
    localStorage.removeItem('task_tracker_profile')
  },

  async getSession() {
    const profile = localStorage.getItem('task_tracker_profile')
    return profile ? JSON.parse(profile) : null
  },

  async getCurrentProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.warn('Profile fetch warning:', error)
      return null
    }
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    
    // Update local storage representation
    localStorage.setItem('task_tracker_profile', JSON.stringify(data))
    return data
  },

  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })
      
    if (error) throw error
    return data
  }
}
