import { authFetch } from '../authFetch'
import type { TasksPaginatedResponse } from '../../types/pagination'
import type { SubtaskItem, TaskDetails } from '../../types/tasks'
import { withJsonHeaders } from '../http'

interface GetTasksInput {
  date: string
  completed?: boolean
  page?: number
  limit?: number
  signal?: AbortSignal
}

interface CreateTaskInput {
  title: string
  description: string | null
  date: string
  subtasks: string[]
}

interface UpdateTaskCompletionInput {
  taskId: number
  completed: boolean
}

interface UpdateTaskCompletionResponse {
  id: number
  completedAt: string | null
}

interface UpdateTaskInput {
  taskId: number
  title: string
  description: string | null
}

interface DeleteTaskInput {
  taskId: number
}

interface GetTaskSubtasksInput {
  taskId: number
}

interface CreateSubtaskInput {
  taskId: number
  title: string
}

interface UpdateSubtaskCompletionInput {
  taskId: number
  subtaskId: number
  completed: boolean
}

interface UpdateSubtaskTitleInput {
  taskId: number
  subtaskId: number
  title: string
}

interface DeleteSubtaskInput {
  taskId: number
  subtaskId: number
}

interface SubtaskMutationResponse {
  subtasks: SubtaskItem[]
  completedAt: string | null
}

export async function getTasks({
  date,
  completed,
  page = 1,
  limit = 50,
  signal,
}: GetTasksInput): Promise<TasksPaginatedResponse> {
  const query = new URLSearchParams()
  query.set('date', date)
  query.set('page', String(page))
  query.set('limit', String(limit))
  if (typeof completed === 'boolean') {
    query.set('completed', String(completed))
  }

  const response = await authFetch(
    `/users/me/tasks?${query.toString()}`,
    withJsonHeaders({
      method: 'GET',
      signal,
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to load tasks')
  }

  return response.json() as Promise<TasksPaginatedResponse>
}

export async function createTask({
  title,
  description,
  date,
  subtasks,
}: CreateTaskInput): Promise<void> {
  const response = await authFetch(
    '/users/me/tasks',
    withJsonHeaders({
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        date,
        subtasks: subtasks.map((subtaskTitle) => ({
          title: subtaskTitle,
        })),
      }),
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to create task')
  }
}

export async function updateTaskCompletion({
  taskId,
  completed,
}: UpdateTaskCompletionInput): Promise<UpdateTaskCompletionResponse> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}`,
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to update task')
  }

  return response.json() as Promise<UpdateTaskCompletionResponse>
}

export async function getTaskDetails(taskId: number): Promise<TaskDetails> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}`,
    withJsonHeaders({
      method: 'GET',
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to load task details')
  }

  return response.json() as Promise<TaskDetails>
}

export async function updateTask({
  taskId,
  title,
  description,
}: UpdateTaskInput): Promise<TaskDetails> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}`,
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({
        title,
        description,
      }),
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to update task')
  }

  return response.json() as Promise<TaskDetails>
}

export async function deleteTask({ taskId }: DeleteTaskInput): Promise<void> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error('Failed to delete task')
  }
}

export async function getTaskSubtasks({ taskId }: GetTaskSubtasksInput): Promise<SubtaskItem[]> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}/subtasks`,
    withJsonHeaders({
      method: 'GET',
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to load subtasks')
  }

  return response.json() as Promise<SubtaskItem[]>
}

export async function createSubtask({ taskId, title }: CreateSubtaskInput): Promise<void> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}/subtasks`,
    withJsonHeaders({
      method: 'POST',
      body: JSON.stringify({
        title,
      }),
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to create subtask')
  }
}

export async function updateSubtaskCompletion({
  taskId,
  subtaskId,
  completed,
}: UpdateSubtaskCompletionInput): Promise<SubtaskMutationResponse> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}/subtasks/${subtaskId}`,
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to update subtask')
  }

  return response.json() as Promise<SubtaskMutationResponse>
}

export async function updateSubtaskTitle({
  taskId,
  subtaskId,
  title,
}: UpdateSubtaskTitleInput): Promise<SubtaskMutationResponse> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}/subtasks/${subtaskId}`,
    withJsonHeaders({
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
  )

  if (!response.ok) {
    throw new Error('Failed to update subtask title')
  }

  return response.json() as Promise<SubtaskMutationResponse>
}

export async function deleteSubtask({
  taskId,
  subtaskId,
}: DeleteSubtaskInput): Promise<SubtaskMutationResponse> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}/subtasks/${subtaskId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error('Failed to delete subtask')
  }

  return response.json() as Promise<SubtaskMutationResponse>
}
