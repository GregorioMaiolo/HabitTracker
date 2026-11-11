import { useState, useEffect } from 'react';
import './App.css';

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getWeekDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    return {
      key: getDateKey(date),
      label: date.toLocaleDateString('de-CH', {
        weekday: 'short'
      }),
      day: date.getDate()
    };
  });
}

function calculateStreak(dates) {
  const completed = new Set(dates);
  const today = new Date();

  // Falls heute noch nichts erledigt wurde,
  // beginnt die Berechnung beim gestrigen Tag.
  if (!completed.has(getDateKey(today))) {
    today.setDate(today.getDate() - 1);
  }

  let streak = 0;

  while (completed.has(getDateKey(today))) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  return streak;
}

function App() {
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem('habits');
    return savedHabits ? JSON.parse(savedHabits) : [];
  });

  const [newHabit, setNewHabit] = useState('');

  const today = getDateKey(new Date());
  const weekDays = getWeekDays();

  // Habits automatisch speichern
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Neues Habit hinzufügen
  function addHabit(e) {
    e.preventDefault();

    if (!newHabit.trim()) return;

    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      completedDates: []
    };

    setHabits([...habits, habit]);
    setNewHabit('');
  }

  // Habit löschen
  function deleteHabit(id) {
    setHabits(habits.filter(habit => habit.id !== id));
  }

  // Habit als erledigt markieren
  function toggleHabit(id) {
    setHabits(habits.map(habit => {
      if (habit.id !== id) return habit;

      const isCompleted = habit.completedDates.includes(today);

      return {
        ...habit,
        completedDates: isCompleted
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today]
      };
    }));
  }

  // Statistiken berechnen
  const completedToday = habits.filter(habit =>
    habit.completedDates.includes(today)
  ).length;

  const progress = habits.length > 0
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const totalCompletions = habits.reduce(
    (total, habit) => total + habit.completedDates.length,
    0
  );

  const longestStreak = habits.length > 0
    ? Math.max(...habits.map(habit =>
      calculateStreak(habit.completedDates)
    ))
    : 0;

  const todayLabel = new Date().toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="app">

      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">H</span>
          <span>HabitFlow</span>
        </div>

        <div className="nav-label">MENU</div>

        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>

        <div className="nav-item">
          <span>◷</span> My Habits
        </div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">U</div>
          <div>
            <strong>My Profile</strong>
            <p>Personal account</p>
          </div>
        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p>{todayLabel}</p>
          </div>

          <div className="date-badge">
            <span>●</span> Daily overview
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="welcome-label">YOUR PERSONAL SPACE</p>
            <h1>Build better habits.</h1>
            <p>Small steps every day lead to big results.</p>
          </div>

          <div className="welcome-icon">✦</div>
        </section>

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon purple">▦</div>
            <p>Total Habits</p>
            <h2>{habits.length}</h2>
            <span>Active habits</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Completed Today</p>
            <h2>{completedToday}/{habits.length}</h2>
            <span>Daily progress</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">🔥</div>
            <p>Best Current Streak</p>
            <h2>{longestStreak}</h2>
            <span>Consecutive days</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">↗</div>
            <p>Total Completions</p>
            <h2>{totalCompletions}</h2>
            <span>All-time progress</span>
          </div>

        </section>

        <section className="content-grid">

          <div className="panel habits-panel">

            <div className="panel-header">
              <div>
                <h2>My Habits</h2>
                <p>Keep track of your daily routines.</p>
              </div>

              <span className="habit-count">
                {habits.length} habits
              </span>
            </div>

            <form className="add-form" onSubmit={addHabit}>
              <input
                type="text"
                placeholder="Add a new habit..."
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
              />

              <button type="submit">+ Add Habit</button>
            </form>

            <div className="habit-list">

              {habits.length === 0 ? (
                <div className="empty-state">
                  <span>✦</span>
                  <h3>No habits yet</h3>
                  <p>Add your first habit to get started!</p>
                </div>
              ) : (
                habits.map(habit => {
                  const completed = habit.completedDates.includes(today);
                  const streak = calculateStreak(habit.completedDates);

                  return (
                    <div className="habit-item" key={habit.id}>

                      <button
                        className={`check-button ${completed ? 'checked' : ''}`}
                        onClick={() => toggleHabit(habit.id)}
                        aria-label="Habit erledigen"
                      >
                        {completed ? '✓' : ''}
                      </button>

                      <div className="habit-info">
                        <strong className={completed ? 'completed-text' : ''}>
                          {habit.name}
                        </strong>
                        <span>🔥 {streak} day streak</span>
                      </div>

                      <div className="habit-actions">
                        <span className={completed ? 'status-done' : 'status-pending'}>
                          {completed ? 'Completed' : 'Pending'}
                        </span>

                        <button
                          className="delete-button"
                          onClick={() => deleteHabit(habit.id)}
                          aria-label="Habit löschen"
                        >
                          ×
                        </button>
                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </div>

          <div className="panel progress-panel">

            <div className="panel-header">
              <div>
                <h2>Today's Progress</h2>
                <p>Your daily performance.</p>
              </div>
            </div>

            <div className="progress-circle" style={{ background: `conic-gradient(#8059e8 ${progress}%, #303044 ${progress}%)`}}>
            <div className="progress-inner">
                <h2>{progress}%</h2>
                <span>Completed</span>
              </div>
            </div>

            <p className="progress-description">
              {completedToday} of {habits.length} habits completed today.
            </p>

            <div className="week-section">
              <h3>Last 7 Days</h3>

              <div className="week-grid">
                {weekDays.map(day => {
                  const count = habits.filter(habit =>
                    habit.completedDates.includes(day.key)
                  ).length;

                  const percentage = habits.length > 0
                    ? (count / habits.length) * 100
                    : 0;

                  const isToday = day.key === today;

                  return (
                    <div className="week-day" key={day.key}>
                      <div className="week-bar">
                        <div
                          className="week-bar-fill"
                          style={{ height: `${percentage}%` }}
                        />
                      </div>

                      <span className={isToday ? 'today-label' : ''}>
                        {day.label}
                      </span>
                      <strong>{day.day}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        <footer>
          MaioloCode © 2026 · Stay consistent.
        </footer>

      </main>
    </div>
  );
}

export default App;