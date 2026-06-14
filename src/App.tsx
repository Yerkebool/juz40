import { useState } from 'react';
import { Home, Calendar, BarChart3, User, Users } from 'lucide-react';
import type { Role, Task, EventItem, Submission, DailyPlan } from './types';
import {
  tasks as initialTasks,
  events as initialEvents,
  submissions as initialSubmissions,
  dailyPlans as initialDailyPlans,
  CURRENT_STUDENT_ID,
} from './data/mock';
import { getTasksForDay } from './lib/rules';
import { format } from 'date-fns';

// Screens
import { S1 } from './screens/student/S1';
import { S2 } from './screens/student/S2';
import { S3 } from './screens/student/S3';
import { S4 } from './screens/student/S4';
import { S5 } from './screens/student/S5';
import { C0 } from './screens/curator/C0';
import { C1 } from './screens/curator/C1';
import { C3 } from './screens/curator/C3';
import { C4 } from './screens/curator/C4';
import { C5 } from './screens/curator/C5';

type StudentScreen = 'intro' | 'main' | 'month' | 'task' | 'create';
type CuratorScreen = 'main' | 'month' | 'create' | 'participants' | 'control' | 'daily-intro';

export default function App() {
  const [role, setRole] = useState<Role>('student');
  const [studentScreen, setStudentScreen] = useState<StudentScreen>('intro');
  const [curatorScreen, setCuratorScreen] = useState<CuratorScreen>('main');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>(initialDailyPlans);

  // C3 participant picker state
  const [c3Open, setC3Open] = useState(false);
  const [c3Selected, setC3Selected] = useState<string[]>([]);
  const [c3OnSave, setC3OnSave] = useState<(ids: string[]) => void>(() => () => {});

  function openParticipants(selected: string[], onSave: (ids: string[]) => void) {
    setC3Selected(selected);
    setC3OnSave(() => onSave);
    setC3Open(true);
  }

  // Toggle task done/undone
  function handleToggleTask(taskId: string) {
    setSubmissions((prev) => {
      const existing = prev.find((s) => s.taskId === taskId && s.studentId === CURRENT_STUDENT_ID);
      if (existing) {
        return prev.map((s) =>
          s.taskId === taskId && s.studentId === CURRENT_STUDENT_ID
            ? { ...s, done: !s.done, submittedAt: !s.done ? new Date().toISOString() : undefined }
            : s
        );
      } else {
        return [
          ...prev,
          {
            taskId,
            studentId: CURRENT_STUDENT_ID,
            files: [],
            done: true,
            submittedAt: new Date().toISOString(),
          },
        ];
      }
    });
  }

  // Update submission
  function handleUpdateSubmission(taskId: string, data: Partial<Submission>) {
    setSubmissions((prev) => {
      const existing = prev.find((s) => s.taskId === taskId && s.studentId === CURRENT_STUDENT_ID);
      if (existing) {
        return prev.map((s) =>
          s.taskId === taskId && s.studentId === CURRENT_STUDENT_ID ? { ...s, ...data } : s
        );
      } else {
        return [
          ...prev,
          {
            taskId,
            studentId: CURRENT_STUDENT_ID,
            files: [],
            done: false,
            ...data,
          },
        ];
      }
    });
  }

  // Create task
  function handleCreateTask(task: Task) {
    setTasks((prev) => [...prev, task]);
  }

  // Create event
  function handleCreateEvent(event: EventItem) {
    setEvents((prev) => [...prev, event]);
  }

  // Create daily plan
  function handleCreateDailyPlan(plan: DailyPlan) {
    setDailyPlans((prev) => {
      const existing = prev.findIndex((p) => p.date === plan.date && p.groupId === plan.groupId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = plan;
        return updated;
      }
      return [...prev, plan];
    });
  }

  const todayPlan = dailyPlans.find(
    (p) => p.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const todayTasks = getTasksForDay(tasks, submissions, CURRENT_STUDENT_ID, selectedDate);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const selectedTaskSub = selectedTaskId
    ? submissions.find((s) => s.taskId === selectedTaskId && s.studentId === CURRENT_STUDENT_ID)
    : undefined;

  // Bottom nav tabs
  const studentTabs = [
    { key: 'main' as StudentScreen, icon: Home, label: 'Главная' },
    { key: 'month' as StudentScreen, icon: Calendar, label: 'Месяц' },
  ];

  const curatorTabs = [
    { key: 'main' as CuratorScreen, icon: Home, label: 'Главная' },
    { key: 'month' as CuratorScreen, icon: Calendar, label: 'Месяц' },
    { key: 'daily-intro' as CuratorScreen, icon: BarChart3, label: 'Контроль' },
  ];

  // Render student content
  function renderStudentContent() {
    if (studentScreen === 'intro') {
      return (
        <S5
          dailyPlan={todayPlan}
          date={selectedDate}
          onStart={() => setStudentScreen('main')}
        />
      );
    }

    if (studentScreen === 'task' && selectedTask) {
      return (
        <S3
          task={selectedTask}
          submission={selectedTaskSub}
          allTodayTasks={todayTasks as { task: Task; submission?: Submission }[]}
          onBack={() => setStudentScreen('main')}
          onToggleTask={handleToggleTask}
          onUpdateSubmission={handleUpdateSubmission}
          onNavigate={(id) => setSelectedTaskId(id)}
        />
      );
    }

    if (studentScreen === 'month') {
      return (
        <S2
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={tasks}
          events={events}
          submissions={submissions}
          studentId={CURRENT_STUDENT_ID}
          onBack={() => setStudentScreen('main')}
        />
      );
    }

    // main (default)
    return (
      <S1
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        tasks={tasks}
        events={events}
        submissions={submissions}
        studentId={CURRENT_STUDENT_ID}
        onToggleTask={handleToggleTask}
        onOpenTask={(id) => {
          setSelectedTaskId(id);
          setStudentScreen('task');
        }}
        onCreateTask={() => setStudentScreen('create')}
        onGoToMonth={() => setStudentScreen('month')}
      />
    );
  }

  function renderCuratorContent() {
    if (curatorScreen === 'control' && selectedTaskId) {
      const ctask = tasks.find((t) => t.id === selectedTaskId);
      if (ctask) {
        return (
          <C4
            task={ctask}
            submissions={submissions}
            onBack={() => setCuratorScreen('main')}
          />
        );
      }
    }

    if (curatorScreen === 'daily-intro') {
      return (
        <C5
          onBack={() => setCuratorScreen('main')}
          tasks={tasks}
          dailyPlans={dailyPlans}
          onSavePlan={handleCreateDailyPlan}
        />
      );
    }

    if (curatorScreen === 'month') {
      return (
        <S2
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          tasks={tasks}
          events={events}
          submissions={submissions}
          studentId={CURRENT_STUDENT_ID}
          onBack={() => setCuratorScreen('main')}
        />
      );
    }

    // main / control list
    return (
      <C0
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        tasks={tasks}
        events={events}
        submissions={submissions}
        onCreateTask={() => setCuratorScreen('create')}
        onGoToMonth={() => setCuratorScreen('month')}
        onOpenControl={(id) => {
          setSelectedTaskId(id);
          setCuratorScreen('control');
        }}
      />
    );
  }

  const showStudentBottomNav = role === 'student' && studentScreen !== 'intro';
  const showCuratorBottomNav = role === 'curator';

  return (
    <div className="min-h-screen bg-gray-900 flex items-start justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen bg-[#0F172A] flex flex-col">
        {/* Dev role switcher */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10 flex-shrink-0">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">DEV</span>
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-0.5">
            <button
              onClick={() => { setRole('student'); setStudentScreen('intro'); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                role === 'student' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
              }`}
            >
              <User size={11} />
              <span>Студент</span>
            </button>
            <button
              onClick={() => { setRole('curator'); setCuratorScreen('main'); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                role === 'curator' ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'
              }`}
            >
              <Users size={11} />
              <span>Куратор</span>
            </button>
          </div>
        </div>

        {/* Screen content */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {role === 'student' ? renderStudentContent() : renderCuratorContent()}
        </div>

        {/* Bottom navigation - Student */}
        {showStudentBottomNav && (
          <div className="flex-shrink-0 bg-[#0F172A] border-t border-white/10 flex items-center">
            {studentTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.key === 'month' ? studentScreen === 'month' :
                studentScreen === 'main' || studentScreen === 'task';
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === 'month') setStudentScreen('month');
                    else setStudentScreen('main');
                  }}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                    isActive ? 'text-[#2F80ED]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom navigation - Curator */}
        {showCuratorBottomNav && (
          <div className="flex-shrink-0 bg-[#0F172A] border-t border-white/10 flex items-center">
            {curatorTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = curatorScreen === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCuratorScreen(tab.key as CuratorScreen)}
                  className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                    isActive ? 'text-[#2F80ED]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Student: Create personal task bottom sheet */}
        {role === 'student' && (
          <S4
            open={studentScreen === 'create'}
            onClose={() => setStudentScreen('main')}
            onCreateTask={(task) => {
              handleCreateTask(task);
              setStudentScreen('main');
            }}
            selectedDate={selectedDate}
          />
        )}

        {/* Curator: Create task/event/daily modal */}
        {role === 'curator' && (
          <>
            <C1
              open={curatorScreen === 'create'}
              onClose={() => setCuratorScreen('main')}
              onCreateTask={(task) => {
                handleCreateTask(task);
                setCuratorScreen('main');
              }}
              onCreateEvent={(event) => {
                handleCreateEvent(event);
                setCuratorScreen('main');
              }}
              onCreateDailyPlan={(plan) => {
                handleCreateDailyPlan(plan);
                setCuratorScreen('main');
              }}
              selectedDate={selectedDate}
              onOpenParticipants={openParticipants}
            />
            <C3
              open={c3Open}
              onClose={() => setC3Open(false)}
              selected={c3Selected}
              onSave={c3OnSave}
            />
          </>
        )}
      </div>
    </div>
  );
}
