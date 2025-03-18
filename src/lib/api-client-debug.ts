// lib/api-client-debug.ts
// This is a debug wrapper around your existing API client to log all requests

import apiClient from "./api-client";

const debugApiClient = {
  ...apiClient,

  get: async (url: string, config?: any) => {
    console.log(`[DEBUG] GET Request to: ${url}`, config);
    try {
      const response = await apiClient.get(url, config);
      console.log(`[DEBUG] GET Response from: ${url}`, response.status);
      return response;
    } catch (error) {
      console.error(`[DEBUG] GET Error from: ${url}`, error);
      throw error;
    }
  },

  post: async (url: string, data?: any, config?: any) => {
    console.log(`[DEBUG] POST Request to: ${url}`, { data, config });
    try {
      const response = await apiClient.post(url, data, config);
      console.log(`[DEBUG] POST Response from: ${url}`, response.status);
      return response;
    } catch (error) {
      console.error(`[DEBUG] POST Error from: ${url}`, error);
      throw error;
    }
  },

  put: async (url: string, data?: any, config?: any) => {
    console.log(`[DEBUG] PUT Request to: ${url}`, { data, config });
    try {
      const response = await apiClient.put(url, data, config);
      console.log(`[DEBUG] PUT Response from: ${url}`, response.status);
      return response;
    } catch (error) {
      console.error(`[DEBUG] PUT Error from: ${url}`, error);
      throw error;
    }
  },

  delete: async (url: string, config?: any) => {
    console.log(`[DEBUG] DELETE Request to: ${url}`, config);
    try {
      const response = await apiClient.delete(url, config);
      console.log(`[DEBUG] DELETE Response from: ${url}`, response.status);
      return response;
    } catch (error) {
      console.error(`[DEBUG] DELETE Error from: ${url}`, error);
      throw error;
    }
  }
};

export default debugApiClient;
