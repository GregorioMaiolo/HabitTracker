
import { useState, useEffect } from "react";
import "./App.css";

const categories = [
  "Fitness",
  "Gesundheit",
  "Lernen",
  "Produktivität",
  "Sonstiges",
];

function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getWeekDays() {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    days.push({
      key: getDateKey(date),
      label: date.toLocaleDateString("de-CH", {
        weekday: "short",
      }),
    });
  }

  return days;
}

function calculateStreak(habit) {
  let streak = 0;
  const date = new Date();

  if (!habit.completedDates) return 0;

  if (!habit.completedDates.includes(getDateKey(date))) {
    date.setDate(date.getDate() - 1);
  }

  while (habit.completedDates.includes(getDateKey(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function App() {
  const [habits, setHabits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("habits")) || [];
    } catch {
      return [];
    }
  });

  const [newHabit, setNewHabit] = useState("");
  const [newCategory, setNewCategory] = useState("Fitness");
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  function addHabit(e) {
    e.preventDefault();

    if (!newHabit.trim()) return;

    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      category: newCategory,
      completedDates: [],
    };

    setHabits([...habits, habit]);
    setNewHabit("");
    setNewCategory("Fitness");
  }

  function toggleHabit(id) {
    const today = getDateKey();

    setHabits(
      habits.map((habit) => {
        if (habit.id !== id) return habit;

        const completedDates = habit.completedDates || [];
        const isCompleted = completedDates.includes(today);

        return {
          ...habit,
          completedDates: isCompleted
            ? completedDates.filter((date) => date !== today)
            : [...completedDates, today],
        };
      })
    );
  }

  function deleteHabit(id) {
    setHabits(habits.filter((habit) => habit.id !== id));
  }

  const today = getDateKey();

  const completedToday = habits.filter((habit) =>
    (habit.completedDates || []).includes(today)
  ).length;

  const progress =
    habits.length > 0
      ? Math.round((completedToday / habits.length) * 100)
      : 0;

  const totalCompletions = habits.reduce(
    (total, habit) =>
      total + (habit.completedDates || []).length,
    0
  );

  const weekDays = getWeekDays();

  const weekData = weekDays.map((day) => ({
    ...day,
    count: habits.filter((habit) =>
      (habit.completedDates || []).includes(day.key)
    ).length,
  }));

  const maxWeekCount = Math.max(
    ...weekData.map((day) => day.count),
    1
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">HabitFlow</h2>

        <p className="nav-label">MENU</p>

        <button
          className={`nav-item ${activePage === "dashboard" ? "active" : ""
            }`}
          onClick={() => setActivePage("dashboard")}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className={`nav-item ${activePage === "habits" ? "active" : ""
            }`}
          onClick={() => setActivePage("habits")}
        >
          <span>✓</span> My Habits
        </button>

        <div className="sidebar-bottom">
          <p>Build better habits.</p>
          <small>One day at a time.</small>
        </div>
      </aside>

      <main className="main-content">
        {activePage === "dashboard" ? (
          <>
            <header className="page-header">
              <div>
                <h1>Dashboard</h1>
                <p>Track your progress and build consistency.</p>
              </div>

              <span className="today-date">
                {new Date().toLocaleDateString("de-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </header>

            <section className="stats-grid">
              <div className="stat-card">
                <span>Total Habits</span>
                <h2>{habits.length}</h2>
              </div>

              <div className="stat-card">
                <span>Completed Today</span>
                <h2>{completedToday}/{habits.length}</h2>
              </div>

              <div className="stat-card">
                <span>Today's Progress</span>
                <h2>{progress}%</h2>
              </div>

              <div className="stat-card">
                <span>Total Completions</span>
                <h2>{totalCompletions}</h2>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="panel habits-panel">
                <div className="panel-header">
                  <h2>My Habits</h2>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("habits")}
                  >
                    View all
                  </button>
                </div>

                <HabitForm
                  newHabit={newHabit}
                  setNewHabit={setNewHabit}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  addHabit={addHabit}
                />

                <HabitList
                  habits={habits.slice(0, 4)}
                  toggleHabit={toggleHabit}
                  deleteHabit={deleteHabit}
                />
              </div>

              <ProgressPanel
                progress={progress}
                completedToday={completedToday}
                totalHabits={habits.length}
              />
            </section>


            <section className="panel weekly-panel">
              <div className="panel-header">
                <div>
                  <h2>Weekly Activity</h2>
                  <p className="weekly-subtitle">
                    Your completed habits over the last 7 days
                  </p>
                </div>

                <span className="weekly-total">
                  {weekData.reduce((sum, day) => sum + day.count, 0)} completed
                </span>
              </div>

              <div className="week-chart">
                {weekData.map((day) => {
                  const percentage =
                    habits.length > 0
                      ? (day.count / habits.length) * 100
                      : 0;

                  return (
                    <div className="week-day" key={day.key}>
                      <div className="week-day-info">
                        <span>{day.label}</span>
                        <strong>{day.count}</strong>
                      </div>

                      <div className="week-bar-background">
                        <div
                          className="week-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </>
        ) : (
          <>
            <header className="page-header">
              <div>
                <h1>My Habits</h1>
                <p>Manage your habits and their categories.</p>
              </div>
            </header>

            <section className="panel all-habits-page">
              <h2>Add a new habit</h2>

              <HabitForm
                newHabit={newHabit}
                setNewHabit={setNewHabit}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                addHabit={addHabit}
              />

              <div className="panel-header">
                <h2>All Habits ({habits.length})</h2>
              </div>

              <HabitList
                habits={habits}
                toggleHabit={toggleHabit}
                deleteHabit={deleteHabit}
              />
            </section>
          </>
        )}

        <footer>
          HabitFlow © 2026
        </footer>
      </main>
    </div>
  );
}

function HabitForm({
  newHabit,
  setNewHabit,
  newCategory,
  setNewCategory,
  addHabit,
}) {
  return (
    <form className="habit-form" onSubmit={addHabit}>
      <input
        type="text"
        placeholder="Enter a new habit..."
        value={newHabit}
        onChange={(e) => setNewHabit(e.target.value)}
      />

      <select
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <button type="submit">+ Add Habit</button>
    </form>
  );
}

function HabitList({ habits, toggleHabit, deleteHabit }) {
  if (habits.length === 0) {
    return <p className="empty-state">No habits yet. Add your first habit!</p>;
  }

  return (
    <div className="habit-list">
      {habits.map((habit) => {
        const completed = (habit.completedDates || []).includes(
          getDateKey()
        );

        return (
          <div className="habit-item" key={habit.id}>
            <button
              className={`check-button ${completed ? "checked" : ""
                }`}
              onClick={() => toggleHabit(habit.id)}
              title="Mark as completed"
            >
              {completed ? "✓" : ""}
            </button>

            <div className="habit-info">
              <strong className={completed ? "completed-text" : ""}>
                {habit.name}
              </strong>

              <div className="habit-meta">
                <span className="category-tag">
                  {habit.category || "Sonstiges"}
                </span>

                <span>
                  🔥 {calculateStreak(habit)} day streak
                </span>
              </div>
            </div>

            <span className={`habit-status ${completed ? "done" : ""}`}>
              {completed ? "Completed" : "Pending"}
            </span>

            <button
              className="delete-button"
              onClick={() => deleteHabit(habit.id)}
              title="Delete habit"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ProgressPanel({ progress, completedToday, totalHabits }) {
  return (
    <div className="panel progress-panel">
      <h2>Today's Progress</h2>

      <div
        className="progress-circle"
        style={{
          background: `conic-gradient(#a78bfa ${progress}%, #29293b ${progress}% 100%)`,
        }}
      >
        <div className="progress-inner">
          <strong>{progress}%</strong>
          <span>Completed</span>
        </div>
      </div>

      <p>
        {completedToday} of {totalHabits} habits completed today.
      </p>
    </div>
  );
}

export default App;
