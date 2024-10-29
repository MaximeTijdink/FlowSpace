import Airtable from 'airtable';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const tables = {
  users: base('Users'),
  sessions: base('Sessions'),
  messages: base('Messages'),
  tasks: base('Tasks')
};

// Users
export const createUser = async (userData: any) => {
  const record = await tables.users.create([
    { fields: userData }
  ]);
  return record[0];
};

export const getUser = async (id: string) => {
  return await tables.users.find(id);
};

// Sessions
export const createSession = async (sessionData: any) => {
  const record = await tables.sessions.create([
    { fields: sessionData }
  ]);
  return record[0];
};

export const getSessions = async () => {
  const records = await tables.sessions.select({
    filterByFormula: 'AND(status = "active")',
    sort: [{ field: 'createdTime', direction: 'desc' }]
  }).all();
  return records;
};

// Messages
export const createMessage = async (messageData: any) => {
  const record = await tables.messages.create([
    { fields: messageData }
  ]);
  return record[0];
};

export const getSessionMessages = async (sessionId: string) => {
  const records = await tables.messages.select({
    filterByFormula: `{sessionId} = '${sessionId}'`,
    sort: [{ field: 'createdTime', direction: 'asc' }]
  }).all();
  return records;
};

// Tasks
export const createTask = async (taskData: any) => {
  const record = await tables.tasks.create([
    { fields: taskData }
  ]);
  return record[0];
};

export const updateTask = async (id: string, updates: any) => {
  const record = await tables.tasks.update(id, updates);
  return record;
};

export const getSessionTasks = async (sessionId: string) => {
  const records = await tables.tasks.select({
    filterByFormula: `{sessionId} = '${sessionId}'`,
    sort: [{ field: 'createdTime', direction: 'asc' }]
  }).all();
  return records;
};