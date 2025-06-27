import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutTemplate, WorkoutPlan, WorkoutSession, Client, Exercise } from '../types/workout';

const STORAGE_KEYS = {
  TEMPLATES: '@workout_templates',
  PLANS: '@workout_plans',
  SESSIONS: '@workout_sessions',
  CLIENTS: '@clients',
  EXERCISES: '@exercises',
  PENDING_SYNC: '@pending_sync',
  USER_ROLE: '@user_role',
  USER_ID: '@user_id',
};

// Generic storage functions
export const storeData = async (key: string, data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

// Template functions
export const saveTemplate = async (template: WorkoutTemplate): Promise<void> => {
  const templates = await getTemplates();
  const updatedTemplates = templates.filter(t => t.id !== template.id);
  updatedTemplates.push(template);
  await storeData(STORAGE_KEYS.TEMPLATES, updatedTemplates);
  await addToPendingSync('template', template.id, 'create');
};

export const getTemplates = async (): Promise<WorkoutTemplate[]> => {
  return await getData<WorkoutTemplate[]>(STORAGE_KEYS.TEMPLATES) || [];
};

export const getTemplate = async (id: string): Promise<WorkoutTemplate | null> => {
  const templates = await getTemplates();
  return templates.find(t => t.id === id) || null;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const templates = await getTemplates();
  const updatedTemplates = templates.filter(t => t.id !== id);
  await storeData(STORAGE_KEYS.TEMPLATES, updatedTemplates);
  await addToPendingSync('template', id, 'delete');
};

// Plan functions
export const savePlan = async (plan: WorkoutPlan): Promise<void> => {
  const plans = await getPlans();
  const updatedPlans = plans.filter(p => p.id !== plan.id);
  updatedPlans.push(plan);
  await storeData(STORAGE_KEYS.PLANS, updatedPlans);
  await addToPendingSync('plan', plan.id, 'create');
};

export const getPlans = async (): Promise<WorkoutPlan[]> => {
  return await getData<WorkoutPlan[]>(STORAGE_KEYS.PLANS) || [];
};

export const getPlan = async (id: string): Promise<WorkoutPlan | null> => {
  const plans = await getPlans();
  return plans.find(p => p.id === id) || null;
};

export const getClientPlans = async (clientId: string): Promise<WorkoutPlan[]> => {
  const plans = await getPlans();
  return plans.filter(p => p.clientId === clientId);
};

export const deletePlan = async (id: string): Promise<void> => {
  const plans = await getPlans();
  const updatedPlans = plans.filter(p => p.id !== id);
  await storeData(STORAGE_KEYS.PLANS, updatedPlans);
  await addToPendingSync('plan', id, 'delete');
};

// Session functions
export const saveSession = async (session: WorkoutSession): Promise<void> => {
  const sessions = await getSessions();
  const updatedSessions = sessions.filter(s => s.id !== session.id);
  updatedSessions.push(session);
  await storeData(STORAGE_KEYS.SESSIONS, updatedSessions);
  await addToPendingSync('session', session.id, 'create');
};

export const getSessions = async (): Promise<WorkoutSession[]> => {
  return await getData<WorkoutSession[]>(STORAGE_KEYS.SESSIONS) || [];
};

export const getSession = async (id: string): Promise<WorkoutSession | null> => {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id) || null;
};

export const getClientSessions = async (clientId: string): Promise<WorkoutSession[]> => {
  const sessions = await getSessions();
  return sessions.filter(s => s.clientId === clientId);
};

export const deleteSession = async (id: string): Promise<void> => {
  const sessions = await getSessions();
  const updatedSessions = sessions.filter(s => s.id !== id);
  await storeData(STORAGE_KEYS.SESSIONS, updatedSessions);
  await addToPendingSync('session', id, 'delete');
};

// Client functions
export const saveClient = async (client: Client): Promise<void> => {
  const clients = await getClients();
  const updatedClients = clients.filter(c => c.id !== client.id);
  updatedClients.push(client);
  await storeData(STORAGE_KEYS.CLIENTS, updatedClients);
  await addToPendingSync('client', client.id, 'create');
};

export const getClients = async (): Promise<Client[]> => {
  return await getData<Client[]>(STORAGE_KEYS.CLIENTS) || [];
};

export const getClient = async (id: string): Promise<Client | null> => {
  const clients = await getClients();
  return clients.find(c => c.id === id) || null;
};

// Exercise functions
export const getExercises = async (): Promise<Exercise[]> => {
  return await getData<Exercise[]>(STORAGE_KEYS.EXERCISES) || [];
};

export const saveExercises = async (exercises: Exercise[]): Promise<void> => {
  await storeData(STORAGE_KEYS.EXERCISES, exercises);
};

// Sync functions
export const addToPendingSync = async (type: string, id: string, action: 'create' | 'update' | 'delete'): Promise<void> => {
  const pendingSync = await getData<any[]>(STORAGE_KEYS.PENDING_SYNC) || [];
  const syncItem = {
    type,
    id,
    action,
    timestamp: new Date().toISOString(),
  };
  
  // Remove existing sync item for the same type and id
  const updatedSync = pendingSync.filter(item => !(item.type === type && item.id === id));
  updatedSync.push(syncItem);
  
  await storeData(STORAGE_KEYS.PENDING_SYNC, updatedSync);
};

export const getPendingSync = async (): Promise<any[]> => {
  return await getData<any[]>(STORAGE_KEYS.PENDING_SYNC) || [];
};

export const clearPendingSync = async (): Promise<void> => {
  await storeData(STORAGE_KEYS.PENDING_SYNC, []);
};

export const removeSyncItem = async (type: string, id: string): Promise<void> => {
  const pendingSync = await getPendingSync();
  const updatedSync = pendingSync.filter(item => !(item.type === type && item.id === id));
  await storeData(STORAGE_KEYS.PENDING_SYNC, updatedSync);
};

// Initialize default data
export const initializeDefaultData = async (): Promise<void> => {
  const exercises = await getExercises();
  if (exercises.length === 0) {
    const defaultExercises: Exercise[] = [
      {
        id: '1',
        name: 'Push-ups',
        category: 'Bodyweight',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        instructions: 'Start in plank position, lower body to ground, push back up',
        equipment: 'None'
      },
      {
        id: '2',
        name: 'Squats',
        category: 'Bodyweight',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        instructions: 'Stand with feet shoulder-width apart, lower hips back and down',
        equipment: 'None'
      },
      {
        id: '3',
        name: 'Bench Press',
        category: 'Strength',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        instructions: 'Lie on bench, lower bar to chest, press up',
        equipment: 'Barbell, Bench'
      },
      {
        id: '4',
        name: 'Deadlift',
        category: 'Strength',
        muscleGroups: ['Hamstrings', 'Glutes', 'Back'],
        instructions: 'Stand with feet hip-width apart, lift bar from ground',
        equipment: 'Barbell'
      },
      {
        id: '5',
        name: 'Pull-ups',
        category: 'Bodyweight',
        muscleGroups: ['Back', 'Biceps'],
        instructions: 'Hang from bar, pull body up until chin over bar',
        equipment: 'Pull-up bar'
      },
      {
        id: '6',
        name: 'Overhead Press',
        category: 'Strength',
        muscleGroups: ['Shoulders', 'Triceps', 'Core'],
        instructions: 'Press weight overhead from shoulder level',
        equipment: 'Barbell or Dumbbells'
      },
      {
        id: '7',
        name: 'Barbell Rows',
        category: 'Strength',
        muscleGroups: ['Back', 'Biceps'],
        instructions: 'Pull barbell to lower chest while bent over',
        equipment: 'Barbell'
      },
      {
        id: '8',
        name: 'Lunges',
        category: 'Bodyweight',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        instructions: 'Step forward and lower back knee toward ground',
        equipment: 'None'
      }
    ];
    await saveExercises(defaultExercises);
  }

  // Initialize sample clients for trainers
  const clients = await getClients();
  if (clients.length === 0) {
    const defaultClients: Client[] = [
      {
        id: 'client-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '👩‍💼',
        joinDate: '2024-01-15',
        trainerId: 'trainer-1'
      },
      {
        id: 'client-2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        avatar: '👨‍💻',
        joinDate: '2024-02-01',
        trainerId: 'trainer-1'
      },
      {
        id: 'client-3',
        name: 'Emma Wilson',
        email: 'emma@example.com',
        avatar: '👩‍🎨',
        joinDate: '2024-01-20',
        trainerId: 'trainer-1'
      }
    ];
    await storeData(STORAGE_KEYS.CLIENTS, defaultClients);
  }

  // Initialize sample workout templates
  const templates = await getTemplates();
  if (templates.length === 0) {
    const defaultTemplates: WorkoutTemplate[] = [
      {
        id: 'template-1',
        name: 'Full Body Strength',
        description: 'A comprehensive full-body strength training workout',
        category: 'Strength',
        duration: 45,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: '3',
            exercise: {
              id: '3',
              name: 'Bench Press',
              category: 'Strength',
              muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
            },
            sets: [
              { reps: 8, weight: 60, restTime: 90 },
              { reps: 8, weight: 65, restTime: 90 },
              { reps: 6, weight: 70, restTime: 120 }
            ],
            order: 0
          },
          {
            id: 'ex-2',
            exerciseId: '4',
            exercise: {
              id: '4',
              name: 'Deadlift',
              category: 'Strength',
              muscleGroups: ['Hamstrings', 'Glutes', 'Back'],
            },
            sets: [
              { reps: 5, weight: 80, restTime: 120 },
              { reps: 5, weight: 85, restTime: 120 },
              { reps: 3, weight: 90, restTime: 180 }
            ],
            order: 1
          },
          {
            id: 'ex-3',
            exerciseId: '2',
            exercise: {
              id: '2',
              name: 'Squats',
              category: 'Bodyweight',
              muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
            },
            sets: [
              { reps: 12, weight: 0, restTime: 60 },
              { reps: 12, weight: 0, restTime: 60 },
              { reps: 15, weight: 0, restTime: 60 }
            ],
            order: 2
          }
        ],
        createdBy: 'trainer-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: false
      }
    ];
    await storeData(STORAGE_KEYS.TEMPLATES, defaultTemplates);
  }
};