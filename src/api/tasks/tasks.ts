import { authFetch } from '../authFetch'
import type { PaginatedResponse } from '../../types/pagination'
import type { TaskDetails, TaskListItem } from '../../types/tasks'

interface GetTasksInput {
  date: string
  page?: number
  limit?: number
  signal?: AbortSignal
}

interface CreateTaskInput {
  title: string
  description: string | null
  date: string
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

export async function getTasks({
  date,
  page = 1,
  limit = 50,
  signal,
}: GetTasksInput): Promise<PaginatedResponse<TaskListItem>> {
  const query = new URLSearchParams({
    date,
    page: String(page),
    limit: String(limit),
  })

  const response = await authFetch(
    `/users/me/tasks?${query.toString()}`,
    {
      method: 'GET',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error('Failed to load tasks')
  }

  return response.json() as Promise<PaginatedResponse<TaskListItem>>
}

export async function createTask({
  title,
  description,
  date,
}: CreateTaskInput): Promise<void> {
  const response = await authFetch(
    '/users/me/tasks',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        date,
        subtasks: [],
      }),
    },
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
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    },
  )

  if (!response.ok) {
    throw new Error('Failed to update task')
  }

  return response.json() as Promise<UpdateTaskCompletionResponse>
}

export async function getTaskDetails(taskId: number): Promise<TaskDetails> {
  const response = await authFetch(
    `/users/me/tasks/${taskId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
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
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      }),
    },
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
