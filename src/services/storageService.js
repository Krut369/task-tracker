import { supabase } from '../lib/supabase'

export const storageService = {
  async uploadAttachment(file, taskId) {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${taskId}/${Math.random().toString(36).substr(2, 9)}.${fileExtension}`

    // Supabase Upload: Uploads to the 'task-attachments' bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Retrieve public link
    const { data: urlData } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(fileName)

    return {
      fileUrl: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size
    }
  }
}
