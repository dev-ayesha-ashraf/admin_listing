import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api2 from "../utils/api2";
// import { FeaturedProduct } from '../components/featured-products/types'

interface CreateFeaturedProductData {
  name: string;
  image_url: string;
  price: string;
  link_url: string;
}

interface UpdateFeaturedProductData {
  name?: string;
  image_url?: string;
  price?: string;
  link_url?: string;
}

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response = await api2.get("/featured-products");
      return response.data;
    },
  });
};

export const useCreateFeaturedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeaturedProductData) => {
      const response = await api2.post("/featured-products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
};

export const useUpdateFeaturedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFeaturedProductData;
    }) => {
      const response = await api2.patch(`/featured-products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
};

export const useDeleteFeaturedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api2.delete(`/featured-products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    },
  });
};
