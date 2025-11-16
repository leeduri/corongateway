
import { GoogleGenAI, Type } from '@google/genai';
import { User } from '../types';
import { getMockAllUsers, getMockAllPosts } from './api';

// This is a placeholder for a real API key which should be stored in environment variables.
const API_KEY = process.env.API_KEY; 

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// This function simulates calling the Gemini API to get user recommendations.
// In a real application, you would replace the mock logic with an actual API call.
export const recommendUsersByHashtags = async (targetHashtags: string[]): Promise<User[]> => {
  console.log('Getting recommendations for:', targetHashtags);

  // For demonstration, we'll use mock data and simulate the logic.
  // If the API key is available, the actual Gemini call will be attempted.
  // Otherwise, it falls back to a simple mock algorithm.

  const allUsers = await getMockAllUsers();
  const allPosts = await getMockAllPosts();

  const userHashtags: { [userId: string]: Set<string> } = {};
  allPosts.forEach(post => {
    if (!userHashtags[post.user.id]) {
      userHashtags[post.user.id] = new Set();
    }
    post.hashtags.forEach(tag => userHashtags[post.user.id].add(tag));
  });
  
  const usersWithTheirHashtags = allUsers.map(user => ({
    id: user.id,
    username: user.username,
    hashtags: Array.from(userHashtags[user.id] || new Set())
  }));


  if (!ai) {
    console.warn("Gemini API key not found. Falling back to mock recommendation logic.");
    // Fallback mock logic if API key is not present
    return getMockRecommendations(targetHashtags, allUsers, userHashtags);
  }

  try {
    const prompt = `
      You are a user recommendation engine for a social media app.
      Based on the following list of users and their associated hashtags, and a user's interest in the target hashtags, recommend the top 3 most relevant users.
      
      Users and their hashtags:
      ${JSON.stringify(usersWithTheirHashtags, null, 2)}
      
      Target hashtags of interest:
      ${JSON.stringify(targetHashtags)}
      
      Analyze the users' hashtags and return a JSON array of recommended user objects, each containing the 'id' and 'username'. Order them by relevance.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              username: { type: Type.STRING },
            },
            required: ['id', 'username'],
          },
        },
      },
    });

    const recommendedUserIds = JSON.parse(response.text).map((u: {id: number}) => u.id);
    
    // Filter and return full user objects based on recommended IDs
    return allUsers.filter(user => recommendedUserIds.includes(user.id));

  } catch (error) {
    console.error("Error calling Gemini API, falling back to mock logic:", error);
    return getMockRecommendations(targetHashtags, allUsers, userHashtags);
  }
};


// Simple mock recommendation logic as a fallback
const getMockRecommendations = (targetHashtags: string[], allUsers: User[], userHashtags: { [userId: string]: Set<string> }): User[] => {
  const targetSet = new Set(targetHashtags);
  
  const scoredUsers = allUsers.map(user => {
    const userTags = userHashtags[user.id] || new Set();
    const intersection = new Set([...userTags].filter(tag => targetSet.has(tag)));
    const score = intersection.size;
    return { user, score };
  });

  return scoredUsers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.user)
    .slice(0, 3);
};