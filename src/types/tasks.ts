export type TaskListItem = {
  id: number
  title: string
  subtasksCount: number
  completedAt: string | null
}

export type TaskDetails = {
  id: number
  title: string
  description: string | null
  completedAt: string | null
}
