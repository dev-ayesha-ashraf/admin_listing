import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/apiInstance";
import { API_ENDPOINTS, Endpoint } from "../api/endpoints";
import { Attribute, Category, Listing, Seller } from "../../types/models";

type Model = Category | Attribute | Listing | Seller;

export const useFetch = <T extends Model>(endpoint: Endpoint) => {
  return useQuery<T[]>({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS[endpoint]);
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useFetchOne = <T extends Model>(
  endpoint: Endpoint,
  id: string
) => {
  return useQuery<T>({
    queryKey: [endpoint, id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS[endpoint]}/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useCreate = <T extends Model>(endpoint: Endpoint) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, Partial<T>>({
    mutationFn: async (newItem) => {
      const response = await axiosInstance.post(
        API_ENDPOINTS[endpoint],
        newItem
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.refetchQueries({ queryKey: [endpoint] });
    },
  });
};

export const useUpdate = <T extends Model>(endpoint: Endpoint) => {
  const queryClient = useQueryClient();

  return useMutation<T, Error, { id: string; data: Partial<T> }>({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.put(
        `${API_ENDPOINTS[endpoint]}/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.invalidateQueries({ queryKey: [endpoint, id] });
      queryClient.refetchQueries({ queryKey: [endpoint] });
      queryClient.refetchQueries({ queryKey: [endpoint, id] });
    },
  });
};

export const useDelete = (endpoint: Endpoint) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS[endpoint]}/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.refetchQueries({ queryKey: [endpoint] });
    },
  });
};
