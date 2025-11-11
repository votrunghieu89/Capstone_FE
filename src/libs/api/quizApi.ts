import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../apiClient'; 

export interface PublicQuizItem {
    quizId: number;
    title: string;
    topicName: string;
    totalQuestion: number;
    avatarURL: string;
    description: string;
    totalParticipants: number; 
    plays: number; 
}


/**
 * @param page The page number to fetch (starting from 1).
 * @param pageSize The number of items per page.
 */
const fetchPublicQuizzes = async (page: number, pageSize: number): Promise<PublicQuizItem[]> => {
    const url = `/Quiz/GetAllQuizzes?page=${page}&pageSize=${pageSize}`;
    const response = await apiClient.get<PublicQuizItem[]>(url);
    
    return response || (response as PublicQuizItem[] || []); 
};

/**
 * Hook to retrieve the list of public quizzes, optimized with caching.
 * @param page The current page number.
 * @param pageSize The number of quizzes per page.
 */
export const useGetPublicQuizzes = (page: number = 1, pageSize: number = 6) => {
    return useQuery<PublicQuizItem[], Error>({
        queryKey: ['publicQuizzes', page, pageSize], 
        queryFn: () => fetchPublicQuizzes(page, pageSize),
        staleTime: 0, 
    });
};