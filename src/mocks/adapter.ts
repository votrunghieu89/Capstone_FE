// Simple mock adapter for local development without backend
// Stores data in-memory per page load

type AnyRecord = Record<string, any>;

let autoIds = {
  group: 1000,
  quiz: 2000,
  question: 3000,
  option: 4000,
};

const db = {
  groups: [] as AnyRecord[],
  quizzes: [] as AnyRecord[],
  questions: [] as AnyRecord[],
  options: [] as AnyRecord[],
};

function simulateDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAdapter = {
  async get<T = any>(url: string): Promise<T> {
    await simulateDelay();
    if (url.startsWith('/groups')) {
      return db.groups as T;
    }
    if (url.startsWith('/quizzes')) {
      return db.quizzes as T;
    }
    throw new Error(`Mock GET not implemented for ${url}`);
  },

  async post<T = any>(url: string, data?: any): Promise<T> {
    await simulateDelay();
    if (url === '/groups') {
      const record = {
        groupId: ++autoIds.group,
        groupName: data.groupName,
        groupDescription: data.groupDescription ?? null,
        teacherId: 1,
        idUnique: `G${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };
      db.groups.push(record);
      return record as T;
    }
    if (url === '/quizzes') {
      const record = {
        quizId: ++autoIds.quiz,
        title: data.title,
        description: data.description ?? null,
        topicId: data.topicId,
        isPrivate: !!data.isPrivate,
        numberPlays: 0,
        avatarUrl: data.avatarUrl ?? null,
        teacherId: 1,
        folderId: data.folderId ?? null,
        createdAt: new Date().toISOString(),
      };
      db.quizzes.push(record);
      return record as T;
    }
    if (url === '/questions') {
      const record = {
        id: ++autoIds.question,
        ...data,
        createdAt: new Date().toISOString(),
      };
      db.questions.push(record);
      return record as T;
    }
    if (url === '/options') {
      const record = {
        id: ++autoIds.option,
        ...data,
        createdAt: new Date().toISOString(),
      };
      db.options.push(record);
      return record as T;
    }
    throw new Error(`Mock POST not implemented for ${url}`);
  },

  async patch<T = any>(url: string, data?: any): Promise<T> {
    await simulateDelay();
    if (url.startsWith('/groups/')) {
      const id = Number(url.split('/').pop());
      const item = db.groups.find(g => g.groupId === id);
      if (item) {
        Object.assign(item, {
          groupName: data.groupName ?? item.groupName,
          groupDescription: data.groupDescription ?? item.groupDescription,
        });
        return item as T;
      }
      throw new Error('Group not found');
    }
    throw new Error(`Mock PATCH not implemented for ${url}`);
  },

  async delete<T = any>(url: string): Promise<T> {
    await simulateDelay();
    if (url.startsWith('/groups/')) {
      const id = Number(url.split('/').pop());
      const idx = db.groups.findIndex(g => g.groupId === id);
      if (idx >= 0) {
        db.groups.splice(idx, 1);
        return { success: true } as T;
      }
      throw new Error('Group not found');
    }
    throw new Error(`Mock DELETE not implemented for ${url}`);
  },
};


