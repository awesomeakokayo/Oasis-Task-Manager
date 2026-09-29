import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

interface Task {
  id?: number;
  title: string;
  description?: string;
  priority?: Priority;
  completed?: boolean;
  category?: string;
  dueDate?: string;
  reminderAt?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.open]="mobileNavOpen">
        <div class="brand">
          <div class="brand-mark">O</div>
          <div><strong>OASIS</strong><span>Task Manager</span></div>
        </div>

        <nav class="nav">
          <button *ngFor="let item of navItems" class="nav-item" [class.active]="view === item.id"
                  (click)="setView(item.id)">
            <span class="nav-icon">{{ item.icon }}</span>{{ item.label }}
            <span *ngIf="item.id === 'today' && todayCount" class="nav-count">{{ todayCount }}</span>
          </button>
        </nav>

        <div class="sidebar-section">
          <p class="section-label">WORKSPACE</p>
          <button class="category-link" *ngFor="let category of categories" (click)="selectCategory(category)">
            <span class="dot"></span>{{ category }}
          </button>
          <button class="category-link muted" (click)="openEditor()"><span class="plus">+</span> Add task</button>
        </div>

        <div class="focus-card">
          <span class="focus-icon">✦</span>
          <strong>Keep your focus</strong>
          <p>Finish one important task before moving to the next.</p>
        </div>
      </aside>

      <div class="mobile-backdrop" *ngIf="mobileNavOpen" (click)="mobileNavOpen=false"></div>

      <section class="content">
        <header class="topbar">
          <button class="mobile-menu" (click)="mobileNavOpen=!mobileNavOpen" aria-label="Open navigation">☰</button>
          <div class="search">
            <span>⌕</span>
            <input [(ngModel)]="q" (ngModelChange)="load()" placeholder="Search your tasks..." />
            <kbd>/</kbd>
          </div>
          <div class="profile">
            <div class="avatar">A</div>
            <div class="profile-copy"><strong>Awesome</strong><span>My workspace</span></div>
          </div>
        </header>

        <main class="main">
          <div class="welcome">
            <div>
              <p class="eyebrow">{{ today | date:'EEEE, MMMM d' }}</p>
              <h1>{{ greeting }}, Awesome<span>.</span></h1>
              <p class="subtext">Here is what is happening with your tasks.</p>
            </div>
            <button class="primary-btn" (click)="openEditor()"><span>+</span> New task</button>
          </div>

          <section class="stats">
            <article class="stat-card">
              <div class="stat-icon gunmetal">✓</div>
              <div><span>Total tasks</span><strong>{{ tasks.length }}</strong></div>
              <small>in your workspace</small>
            </article>
            <article class="stat-card">
              <div class="stat-icon bronze">◷</div>
              <div><span>Due today</span><strong>{{ todayCount }}</strong></div>
              <small>need your attention</small>
            </article>
            <article class="stat-card">
              <div class="stat-icon brick">✓</div>
              <div><span>Completed</span><strong>{{ completedCount }}</strong></div>
              <small>{{ progress }}% of all tasks</small>
            </article>
            <article class="stat-card progress-card">
              <div class="progress-head"><span>Progress</span><strong>{{ progress }}%</strong></div>
              <div class="progress-track"><div class="progress-fill" [style.width.%]="progress"></div></div>
              <small>Keep going</small>
            </article>
          </section>

          <section class="task-panel">
            <div class="panel-head">
              <div>
                <h2>{{ viewTitle }}</h2>
                <span>{{ visibleTasks.length }} {{ visibleTasks.length === 1 ? 'task' : 'tasks' }}</span>
              </div>
              <div class="toolbar">
                <div class="segmented">
                  <button [class.active]="priorityFilter === 'ALL'" (click)="priorityFilter='ALL'">All</button>
                  <button [class.active]="priorityFilter === 'HIGH'" (click)="priorityFilter='HIGH'">High priority</button>
                </div>
                <select [(ngModel)]="sortBy" aria-label="Sort tasks">
                  <option value="due">Due date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            <div class="task-list" *ngIf="visibleTasks.length; else emptyState">
              <article class="task-row" *ngFor="let task of visibleTasks; trackBy: trackTask">
                <button class="check" [class.done]="task.completed" (click)="toggleComplete(task)"
                        [attr.aria-label]="task.completed ? 'Mark task incomplete' : 'Mark task complete'">
                  <span *ngIf="task.completed">✓</span>
                </button>
                <div class="task-body" [class.completed]="task.completed">
                  <div class="task-title-line">
                    <h3>{{ task.title }}</h3>
                    <span class="priority" [class.high]="task.priority==='HIGH'" [class.medium]="task.priority==='MEDIUM'"
                          [class.low]="task.priority==='LOW'">{{ priorityLabel(task.priority) }}</span>
                  </div>
                  <p *ngIf="task.description">{{ task.description }}</p>
                  <div class="meta">
                    <span *ngIf="task.category"><i class="mini-dot"></i>{{ task.category }}</span>
                    <span [class.overdue]="isOverdue(task)" *ngIf="task.dueDate">◷ {{ dueLabel(task) }}</span>
                    <span *ngIf="!task.dueDate" class="muted-meta">No due date</span>
                  </div>
                </div>
                <button class="icon-btn" (click)="openEditor(task)" aria-label="Edit task">⋯</button>
              </article>
            </div>

            <ng-template #emptyState>
              <div class="empty">
                <div class="empty-icon">✓</div>
                <h3>{{ q ? 'No matching tasks' : 'Your list is clear' }}</h3>
                <p>{{ q ? 'Try a different search or filter.' : 'Create a task and turn your plans into progress.' }}</p>
                <button class="secondary-btn" (click)="openEditor()" *ngIf="!q">Create your first task</button>
              </div>
            </ng-template>
          </section>
        </main>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="editorOpen" (click)="closeEditor()">
      <section class="modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <div><p class="eyebrow">{{ editingId ? 'EDIT TASK' : 'NEW TASK' }}</p><h2>{{ editingId ? 'Update task' : 'Create a task' }}</h2></div>
          <button class="close-btn" (click)="closeEditor()">×</button>
        </div>

        <form (ngSubmit)="submitTask()">
          <label>Task title<input [(ngModel)]="draft.title" name="title" required maxlength="120" placeholder="What needs to be done?" autofocus></label>
          <label>Description<textarea [(ngModel)]="draft.description" name="description" rows="3" placeholder="Add a little context..."></textarea></label>

          <div class="form-grid">
            <label>Priority<select [(ngModel)]="draft.priority" name="priority">
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select></label>
            <label>Category<input [(ngModel)]="draft.category" name="category" placeholder="e.g. Work"></label>
            <label>Due date<input type="date" [(ngModel)]="draft.dueDate" name="dueDate"></label>
            <label>Reminder<input type="datetime-local" [(ngModel)]="draft.reminderAt" name="reminderAt"></label>
          </div>

          <div class="modal-actions">
            <button type="button" class="danger-btn" *ngIf="editingId" (click)="remove(editingId)">Delete</button>
            <span></span>
            <button type="button" class="ghost-btn" (click)="closeEditor()">Cancel</button>
            <button type="submit" class="primary-btn" [disabled]="saving">{{ saving ? 'Saving...' : (editingId ? 'Save changes' : 'Create task') }}</button>
          </div>
        </form>
      </section>
    </div>

    <div class="toast" *ngIf="toast">{{ toast }}</div>
  `,
  styles: [`
    :host{display:block;min-height:100vh}
    *{box-sizing:border-box}
    button,input,textarea,select{font:inherit}
    button{cursor:pointer}
    .app-shell{min-height:100vh;background:#f7f7f6;color:#32373b;display:flex}
    .sidebar{width:252px;background:#32373b;color:#fff;padding:25px 16px;display:flex;flex-direction:column;flex:none}
    .brand{display:flex;align-items:center;gap:11px;padding:2px 10px 34px}.brand-mark{width:34px;height:34px;border-radius:10px;background:#f4b860;color:#32373b;display:grid;place-items:center;font-weight:900}.brand strong{display:block;font-size:15px;letter-spacing:.12em}.brand span{display:block;color:#bfc4c5;font-size:11px;margin-top:2px}
    .nav{display:grid;gap:5px}.nav-item,.category-link{width:100%;border:0;background:transparent;color:#cdd1d1;text-align:left;border-radius:10px;padding:11px 12px;display:flex;align-items:center;gap:11px}.nav-item:hover,.category-link:hover{background:#4a5859;color:#fff}.nav-item.active{background:#f4d6cc;color:#32373b;font-weight:700}.nav-icon{width:18px;text-align:center}.nav-count{margin-left:auto;background:#c83e4d;color:#fff;border-radius:99px;font-size:10px;padding:3px 7px}
    .sidebar-section{margin-top:30px}.section-label{font-size:10px;letter-spacing:.14em;color:#8e9899;margin:0 12px 9px}.category-link{font-size:13px}.dot,.plus{width:7px;height:7px;border-radius:50%;background:#f4b860;display:inline-block}.plus{background:transparent;width:12px;height:auto;font-size:17px;line-height:10px;color:#aeb6b7}.muted{color:#90999a!important}
    .focus-card{margin-top:auto;background:#4a5859;border-radius:14px;padding:15px}.focus-icon{color:#f4b860}.focus-card strong{display:block;font-size:12px;margin-top:8px}.focus-card p{color:#bfc4c5;font-size:11px;line-height:1.55;margin:5px 0 0}
    .content{min-width:0;flex:1}.topbar{height:72px;background:#fff;border-bottom:1px solid #e7e4e2;display:flex;align-items:center;justify-content:space-between;padding:0 38px;gap:25px}.search{height:40px;max-width:470px;flex:1;display:flex;align-items:center;gap:9px;color:#899092;background:#f7f7f6;border:1px solid #ebe9e7;border-radius:10px;padding:0 11px}.search input{border:0;outline:0;background:transparent;width:100%;color:#32373b}.search kbd{border:1px solid #ddd8d5;background:#fff;border-radius:5px;padding:1px 6px;font-size:11px;color:#9a9d9d}.profile{display:flex;align-items:center;gap:10px}.avatar{width:35px;height:35px;border-radius:50%;background:#f4d6cc;display:grid;place-items:center;font-weight:800;color:#32373b}.profile-copy strong{display:block;font-size:12px}.profile-copy span{font-size:10px;color:#8c9495}.mobile-menu{display:none}
    .main{max-width:1220px;margin:auto;padding:38px}.welcome{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:28px}.eyebrow{font-size:10px;letter-spacing:.14em;color:#8b9293;font-weight:700;margin:0 0 8px;text-transform:uppercase}.welcome h1{font-size:30px;letter-spacing:-.03em;margin:0}.welcome h1 span{color:#c83e4d}.subtext{color:#899092;font-size:13px;margin:7px 0 0}.primary-btn{border:0;background:#c83e4d;color:#fff;border-radius:9px;padding:11px 16px;font-weight:700;box-shadow:0 5px 14px rgba(200,62,77,.16)}.primary-btn:hover{filter:brightness(.95)}.primary-btn:disabled{opacity:.55;cursor:wait}.primary-btn span{font-size:18px;vertical-align:-1px;margin-right:4px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:26px}.stat-card{background:#fff;border:1px solid #ebe8e5;border-radius:13px;padding:17px;min-height:112px;position:relative}.stat-card>div:not(.progress-head){display:inline-flex;vertical-align:middle}.stat-icon{width:34px;height:34px;border-radius:9px;align-items:center;justify-content:center;margin-right:9px;font-weight:800}.gunmetal{background:#e7e9e9;color:#32373b}.bronze{background:#fff0d9;color:#a86b12}.brick{background:#fae1e4;color:#c83e4d}.stat-card span{display:block;color:#858d8e;font-size:10px}.stat-card strong{font-size:22px;line-height:1.4}.stat-card small{display:block;color:#a0a6a7;font-size:9px;margin-top:10px}.progress-card{padding:18px}.progress-head{display:flex;justify-content:space-between!important;align-items:center}.progress-head strong{font-size:19px}.progress-track{height:7px;background:#eceeed;border-radius:99px;margin-top:15px;overflow:hidden}.progress-fill{height:100%;background:#f4b860;border-radius:99px;transition:width .3s ease}
    .task-panel{background:#fff;border:1px solid #ebe8e5;border-radius:15px;overflow:hidden}.panel-head{padding:19px 21px;border-bottom:1px solid #efedeb;display:flex;justify-content:space-between;align-items:center;gap:15px}.panel-head h2{font-size:16px;margin:0 0 3px}.panel-head>div>span{font-size:10px;color:#92999a}.toolbar{display:flex;gap:8px;align-items:center}.segmented{background:#f5f5f4;border-radius:8px;padding:3px;display:flex}.segmented button,.toolbar select{border:0;background:transparent;color:#7b8384;font-size:10px;padding:7px 9px;border-radius:6px}.segmented button.active{background:#fff;color:#32373b;box-shadow:0 1px 4px rgba(0,0,0,.07);font-weight:700}.toolbar select{border:1px solid #e6e3e1;background:#fff}
    .task-list{padding:6px 21px}.task-row{display:flex;align-items:center;gap:13px;padding:15px 0;border-bottom:1px solid #f0eeec}.task-row:last-child{border-bottom:0}.check{width:20px;height:20px;border:1.5px solid #b8bdbd;background:#fff;border-radius:50%;flex:none;display:grid;place-items:center;color:#fff;font-size:11px}.check.done{background:#c83e4d;border-color:#c83e4d}.task-body{min-width:0;flex:1}.task-title-line{display:flex;align-items:center;gap:9px}.task-title-line h3{font-size:13px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.task-body.completed h3{text-decoration:line-through;color:#969c9d}.task-body>p{font-size:11px;color:#8a9293;margin:5px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.priority{font-size:8px;font-weight:800;padding:3px 6px;border-radius:99px;letter-spacing:.04em}.priority.high{background:#fae1e4;color:#c83e4d}.priority.medium{background:#fff0d9;color:#9a681d}.priority.low{background:#e8eeee;color:#4a5859}.meta{display:flex;gap:14px;color:#8b9394;font-size:9px}.mini-dot{width:6px;height:6px;background:#f4b860;border-radius:50%;display:inline-block;margin-right:5px}.overdue{color:#c83e4d}.muted-meta{color:#afb3b4}.icon-btn,.close-btn{border:0;background:transparent;color:#8f9697;font-size:20px;padding:5px}.icon-btn:hover{color:#32373b}
    .empty{text-align:center;padding:62px 20px}.empty-icon{width:50px;height:50px;margin:auto;border-radius:50%;display:grid;place-items:center;background:#f4d6cc;color:#c83e4d;font-weight:800}.empty h3{margin:15px 0 5px;font-size:15px}.empty p{color:#969c9d;font-size:11px;margin:0 0 17px}.secondary-btn{border:1px solid #ddd8d5;background:#fff;border-radius:8px;padding:9px 13px;font-weight:700;color:#4a5859}
    .modal-backdrop{position:fixed;inset:0;background:rgba(30,34,36,.48);display:grid;place-items:center;padding:20px;z-index:20}.modal{background:#fff;border-radius:16px;width:min(570px,100%);max-height:92vh;overflow:auto;box-shadow:0 25px 70px rgba(0,0,0,.22);padding:25px}.modal-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}.modal-head h2{margin:0;font-size:21px}.close-btn{font-size:25px;line-height:1}.modal label{display:block;font-size:10px;font-weight:800;color:#596162;margin-bottom:15px}.modal input,.modal textarea,.modal select{width:100%;margin-top:7px;border:1px solid #dedbd8;border-radius:8px;padding:10px 11px;outline:0;background:#fff;color:#32373b;font-size:12px}.modal input:focus,.modal textarea:focus,.modal select:focus{border-color:#f4b860;box-shadow:0 0 0 3px rgba(244,184,96,.15)}.modal textarea{resize:vertical}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.modal-actions{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;border-top:1px solid #eeeae7;padding-top:18px;margin-top:4px}.ghost-btn,.danger-btn{border:0;background:#f4f4f2;color:#4a5859;border-radius:8px;padding:10px 13px;font-weight:700;font-size:11px}.danger-btn{background:#fae1e4;color:#c83e4d}.toast{position:fixed;right:24px;bottom:24px;background:#32373b;color:#fff;border-radius:9px;padding:12px 15px;font-size:11px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:30}.mobile-backdrop{display:none}
    @media(max-width:900px){.sidebar{position:fixed;left:-270px;top:0;bottom:0;z-index:15;transition:left .2s}.sidebar.open{left:0}.mobile-backdrop{display:block;position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:14}.mobile-menu{display:block;border:0;background:transparent;font-size:21px;color:#32373b}.topbar{padding:0 18px}.stats{grid-template-columns:1fr 1fr}.main{padding:25px 18px}}
    @media(max-width:620px){.profile-copy{display:none}.search{max-width:none}.welcome{align-items:flex-start;flex-direction:column}.welcome h1{font-size:25px}.stats{grid-template-columns:1fr 1fr}.stat-card{min-height:100px}.panel-head{align-items:flex-start;flex-direction:column}.toolbar{width:100%;flex-wrap:wrap}.task-row{gap:9px}.task-title-line{align-items:flex-start;flex-direction:column;gap:4px}.form-grid{grid-template-columns:1fr}.modal{padding:19px}.modal-actions{grid-template-columns:1fr 1fr}.modal-actions span{display:none}.danger-btn{grid-column:1 / -1}.modal-actions .primary-btn{width:100%}}
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/tasks';

  tasks: Task[] = [];
  q = '';
  view = 'overview';
  priorityFilter: 'ALL' | 'HIGH' = 'ALL';
  sortBy = 'due';
  mobileNavOpen = false;
  editorOpen = false;
  saving = false;
  editingId?: number;
  toast = '';
  draft: Task = this.blankTask();
  today = new Date();

  navItems = [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'today', label: 'Today', icon: '◷' },
    { id: 'upcoming', label: 'Upcoming', icon: '→' },
    { id: 'completed', label: 'Completed', icon: '✓' }
  ];

  ngOnInit(): void { this.load(); }

  get greeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  }

  get todayKey(): string { return new Date().toISOString().slice(0, 10); }
  get todayCount(): number { return this.tasks.filter(t => t.dueDate === this.todayKey && !t.completed).length; }
  get completedCount(): number { return this.tasks.filter(t => !!t.completed).length; }
  get progress(): number { return this.tasks.length ? Math.round((this.completedCount / this.tasks.length) * 100) : 0; }

  get categories(): string[] {
    return [...new Set(this.tasks.map(t => t.category).filter((x): x is string => !!x))].slice(0, 5);
  }

  get viewTitle(): string {
    if (this.view === 'today') return 'Today';
    if (this.view === 'upcoming') return 'Upcoming';
    if (this.view === 'completed') return 'Completed';
    if (this.view.startsWith('category:')) return this.view.slice(9);
    return 'All tasks';
  }

  get visibleTasks(): Task[] {
    let list = [...this.tasks];
    if (this.view === 'today') list = list.filter(t => t.dueDate === this.todayKey);
    if (this.view === 'upcoming') list = list.filter(t => !!t.dueDate && t.dueDate > this.todayKey && !t.completed);
    if (this.view === 'completed') list = list.filter(t => !!t.completed);
    if (this.view.startsWith('category:')) list = list.filter(t => t.category === this.view.slice(9));
    if (this.priorityFilter === 'HIGH') list = list.filter(t => t.priority === 'HIGH');

    const weight: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    list.sort((a, b) => {
      if (this.sortBy === 'priority') return (weight[a.priority || 'MEDIUM'] ?? 1) - (weight[b.priority || 'MEDIUM'] ?? 1);
      if (this.sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31');
    });
    return list;
  }

  load(): void {
    this.http.get<Task[]>(this.api, { params: { q: this.q } }).subscribe({
      next: data => this.tasks = data || [],
      error: () => this.showToast('Could not load tasks. Check that the server is running.')
    });
  }

  setView(view: string): void {
    this.view = view;
    this.priorityFilter = 'ALL';
    this.mobileNavOpen = false;
  }

  selectCategory(category: string): void {
    this.view = 'category:' + category;
    this.priorityFilter = 'ALL';
    this.mobileNavOpen = false;
  }

  openEditor(task?: Task): void {
    this.editingId = task?.id;
    this.draft = task ? { ...task } : this.blankTask();
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editingId = undefined;
    this.draft = this.blankTask();
  }

  submitTask(): void {
    if (!this.draft.title.trim() || this.saving) return;
    this.saving = true;
    const payload = {
      title: this.draft.title.trim(),
      description: this.draft.description || '',
      priority: this.draft.priority || 'MEDIUM',
      completed: !!this.draft.completed,
      category: this.draft.category || '',
      dueDate: this.draft.dueDate || null,
      reminderAt: this.draft.reminderAt || null
    };

    const wasEditing = !!this.editingId;
    const request = wasEditing
      ? this.http.put(this.api + '/' + this.editingId, payload)
      : this.http.post(this.api, payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeEditor();
        this.load();
        this.showToast(wasEditing ? 'Task updated' : 'Task created');
      },
      error: () => {
        this.saving = false;
        this.showToast('Could not save task.');
      }
    });
  }

  toggleComplete(task: Task): void {
    const previous = !!task.completed;
    task.completed = !previous;
    this.http.put(this.api + '/' + task.id, { ...task }).subscribe({
      error: () => { task.completed = previous; this.showToast('Could not update task.'); },
      next: () => this.showToast(task.completed ? 'Task completed ✓' : 'Task reopened')
    });
  }

  remove(id?: number): void {
    if (!id) return;
    this.http.delete(this.api + '/' + id).subscribe({
      next: () => { this.closeEditor(); this.load(); this.showToast('Task deleted'); },
      error: () => this.showToast('Could not delete task.')
    });
  }

  priorityLabel(priority?: Priority): string {
    return priority === 'HIGH' ? 'HIGH' : priority === 'LOW' ? 'LOW' : 'MEDIUM';
  }

  isOverdue(task: Task): boolean {
    return !!task.dueDate && task.dueDate < this.todayKey && !task.completed;
  }

  dueLabel(task: Task): string {
    if (!task.dueDate) return '';
    if (task.dueDate === this.todayKey) return 'Today';
    if (this.isOverdue(task)) return 'Overdue';
    return new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  trackTask(_: number, task: Task): number | string {
    return task.id ?? task.title;
  }

  private blankTask(): Task {
    return { title: '', description: '', priority: 'MEDIUM', completed: false, category: '', dueDate: '', reminderAt: '' };
  }

  private showToast(message: string): void {
    this.toast = message;
    window.setTimeout(() => this.toast = '', 2600);
  }
}
