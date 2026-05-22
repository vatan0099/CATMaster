import { create } from 'zustand';
import axios from 'axios';

const useTestStore = create((set, get) => ({
    subjects: [],
    topics: [],
    loading: false,
    currentTest: null, // { _id, config, questions: [], ... }
    answers: {}, // { questionId: { selectedOption, status, timeTaken } }

    // Config Flow State
    selectedSubject: null,
    selectedTopics: [],
    testConfig: {
        difficulty: 'mixed',
        count: 10,
        timerMode: 'overall',
        timeLimit: 30
    },

    fetchSubjects: async () => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/subjects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ subjects: data, loading: false });
        } catch (error) {
            console.error(error);
            set({ loading: false });
        }
    },

    fetchTopics: async (subjectId) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`/api/subjects/${subjectId}/topics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            set({ topics: data, loading: false });
        } catch (error) {
            console.error(error);
            set({ loading: false });
        }
    },

    setTestConfig: (config) => set((state) => ({
        testConfig: { ...state.testConfig, ...config }
    })),

    selectSubject: (subject) => set({ selectedSubject: subject, selectedTopics: [] }),

    toggleTopic: (topicId) => set((state) => {
        const isSelected = state.selectedTopics.includes(topicId);
        if (isSelected) {
            return { selectedTopics: state.selectedTopics.filter(id => id !== topicId) };
        } else {
            return { selectedTopics: [...state.selectedTopics, topicId] };
        }
    }),

    startTest: async () => {
        set({ loading: true });
        const { selectedSubject, selectedTopics, testConfig } = get();

        try {
            const token = localStorage.getItem('token');
            const payload = {
                subjectId: selectedSubject._id,
                topicIds: selectedTopics,
                difficulty: testConfig.difficulty,
                questionCount: Number(testConfig.count),
                timerMode: testConfig.timerMode,
                timeLimit: Number(testConfig.timeLimit)
            };



            const { data } = await axios.post('/api/tests/start', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });



            set({ currentTest: data, loading: false });
            return data._id;
        } catch (error) {
            console.error(error);
            set({ loading: false });
            return null;
        }
    },

    retakeTest: async (attemptId) => {
        set({ loading: true });
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`/api/tests/${attemptId}/retake`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            set({ currentTest: data, loading: false });
            return data._id;
        } catch (error) {
            console.error(error);
            set({ loading: false });
            return null;
        }
    },

    resetTest: () => set({
        currentTest: null,
        answers: {},
        selectedSubject: null,
        selectedTopics: []
    })
}));

export default useTestStore;
