import { useState } from "react";

type Priority = "High" | "Medium" | "Low";
type TaskStatus = "Not Started" | "In Progress" | "Waiting" | "Done";

type OperationTask = {
  id: number;
  title: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
};

const startingTasks: OperationTask[] = [
  {
    id: 1,
    title: "Prepare discovery questions for first client meeting",
    category: "Client Work",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Deploy portal preview with Neon, Render, and Netlify",
    category: "Deployment",
    priority: "High",
    status: "Not Started",
  },
  {
    id: 3,
    title: "Clean client portal wording before sending preview",
    category: "Portal",
    priority: "High",
    status: "Not Started",
  },
  {
    id: 4,
    title: "Set up Square after final quote is approved",
    category: "Finance",
    priority: "Medium",
    status: "Waiting",
  },
];

const scheduleBlocks = [
  {
    label: "Work Block 1",
    time: "9:00 AM - 1:00 PM",
    note: "Client work, builds, and priority tasks",
  },
  {
    label: "Break",
    time: "1:00 PM - 3:30 PM",
    note: "Step away, eat, reset",
  },
  {
    label: "Work Block 2",
    time: "3:30 PM - 8:30 PM",
    note: "Meetings, revisions, deployment, follow-ups",
  },
  {
    label: "Wrap-Up",
    time: "10:00 PM - 11:00 PM",
    note: "Review progress and plan tomorrow",
  },
];

function Operations() {
  const [tasks, setTasks] = useState<OperationTask[]>(startingTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Client Work");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("High");
  const [dailyFocus, setDailyFocus] = useState(
    "Get the first client ready for a clean discovery meeting and deploy the portal preview safely."
  );
  const [wrapUpNotes, setWrapUpNotes] = useState("");

  const priorityOrder: Record<Priority, number> = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTaskTitle.trim()) {
      return;
    }

    const newTask: OperationTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      status: "Not Started",
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setNewTaskTitle("");
    setNewTaskCategory("Client Work");
    setNewTaskPriority("High");
  }

  function updateTaskStatus(id: number, status: TaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
            }
          : task
      )
    );
  }

  function deleteTask(id: number) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Internal Agency System</p>
          <h3>Operations</h3>
        </div>

        <span className="status-pill">Admin Only</span>
      </div>

      <div className="operations-grid">
        <div className="operations-card focus-card">
          <p className="eyebrow">Today’s Focus</p>
          <h3>What matters most today?</h3>

          <textarea
            value={dailyFocus}
            onChange={(event) => setDailyFocus(event.target.value)}
            rows={5}
          />
        </div>

        <div className="operations-card">
          <p className="eyebrow">Work Schedule</p>
          <h3>Daily Time Blocks</h3>

          <div className="schedule-list">
            {scheduleBlocks.map((block) => (
              <div className="schedule-block" key={block.label}>
                <div>
                  <strong>{block.label}</strong>
                  <span>{block.note}</span>
                </div>

                <p>{block.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="operations-card">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Priority Queue</p>
            <h3>What needs to be done?</h3>
          </div>

          <span>{tasks.length} tasks</span>
        </div>

        <form className="task-create-form" onSubmit={addTask}>
          <input
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="Add a task or project..."
          />

          <select
            value={newTaskCategory}
            onChange={(event) => setNewTaskCategory(event.target.value)}
          >
            <option>Client Work</option>
            <option>Deployment</option>
            <option>Portal</option>
            <option>Finance</option>
            <option>Follow-Up</option>
            <option>Admin</option>
          </select>

          <select
            value={newTaskPriority}
            onChange={(event) =>
              setNewTaskPriority(event.target.value as Priority)
            }
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button className="primary-btn" type="submit">
            Add Task
          </button>
        </form>

        <div className="priority-list">
          {sortedTasks.map((task) => (
            <div className="priority-task" key={task.id}>
              <div>
                <div className="task-title-row">
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  <span className="status-pill">{task.status}</span>
                </div>

                <h4>{task.title}</h4>
                <p>{task.category}</p>
              </div>

              <div className="row-actions">
                <button
                  className="small-btn"
                  onClick={() => updateTaskStatus(task.id, "In Progress")}
                >
                  Start
                </button>

                <button
                  className="small-btn"
                  onClick={() => updateTaskStatus(task.id, "Waiting")}
                >
                  Wait
                </button>

                <button
                  className="small-btn"
                  onClick={() => updateTaskStatus(task.id, "Done")}
                >
                  Done
                </button>

                <button
                  className="danger-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="operations-card">
        <p className="eyebrow">Daily Wrap-Up</p>
        <h3>End-of-day notes</h3>

        <textarea
          value={wrapUpNotes}
          onChange={(event) => setWrapUpNotes(event.target.value)}
          placeholder="What got done today? What needs to move to tomorrow?"
          rows={5}
        />
      </div>
    </section>
  );
}

export default Operations;