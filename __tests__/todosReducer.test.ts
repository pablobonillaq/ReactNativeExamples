import { todosReducer, type Todo } from '../src/screens/todo/TodoContext';

const date = new Date(2026, 8, 30);

function addTodo(todos: Todo[], text: string, completed = false) {
  return todosReducer(todos, { type: 'add', todo: { text, date, completed } });
}

test('adds todos with unique ids', () => {
  const todos = addTodo(addTodo([], 'Buy milk'), 'Walk dog', true);
  expect(todos.map(t => t.text)).toEqual(['Buy milk', 'Walk dog']);
  expect(todos[1].completed).toBe(true);
  expect(todos[0].id).not.toBe(todos[1].id);
});

test('toggles completed', () => {
  const [todo] = addTodo([], 'Buy milk');
  const [toggled] = todosReducer([todo], { type: 'toggle', id: todo.id });
  expect(toggled.completed).toBe(true);
});

test('updates only the given todo', () => {
  const todos = addTodo(addTodo([], 'A'), 'B');
  const newDate = new Date(2027, 0, 1);
  const updated = todosReducer(todos, {
    type: 'update',
    id: todos[0].id,
    changes: { text: 'A2', date: newDate },
  });
  expect(updated[0]).toMatchObject({ text: 'A2', date: newDate });
  expect(updated[1]).toBe(todos[1]);
});

test('removes a todo', () => {
  const todos = addTodo(addTodo([], 'A'), 'B');
  const remaining = todosReducer(todos, { type: 'remove', id: todos[0].id });
  expect(remaining.map(t => t.text)).toEqual(['B']);
});
