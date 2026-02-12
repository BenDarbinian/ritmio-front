import type {TaskListItem} from "./tasks.ts";

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface TasksPaginatedResponse extends PaginatedResponse<TaskListItem>{
  completed: number;
}
