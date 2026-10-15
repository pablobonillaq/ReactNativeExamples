export type Todo = {
  id: string;
  text: string;
  date: Date;
  completed: boolean;
};

export type NewTodo = Omit<Todo, 'id'>;

/**
 * What the todo UI needs: the list and the actions to change it.
 * Both the Context version and the Redux version provide this same shape
 * through a hook, so they share exactly the same components.
 */
export type TodoStore = {
  todos: Todo[];
  addTodo: (todo: NewTodo) => void;
  updateTodo: (id: string, changes: Partial<NewTodo>) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
};

export type UseTodoStore = () => TodoStore;
