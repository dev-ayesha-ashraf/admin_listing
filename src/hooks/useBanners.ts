// hooks/useBanners.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api2 from "../utils/api2";

interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

interface BannersResponse {
  data: Banner[];
}

interface CreateBannerData {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  is_active?: boolean;
  position?: number;
}

interface UpdateBannerData {
  title?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  is_active?: boolean;
  position?: number;
}

const bannerApi = {
  getAll: async (): Promise<BannersResponse> => {
    const response = await api2.get("/banners");
    return response.data;
  },

  getById: async (id: string): Promise<Banner> => {
    const response = await api2.get(`/banners/${id}`);
    return response.data;
  },

  create: async (data: CreateBannerData): Promise<Banner> => {
    const response = await api2.post(
      "/banners",
      {
        title: data.title,
        description: data.description,
        image: data.image_url,
        link: data.link_url,
        isActive: data.is_active ?? true,
        order: data.position ?? 0,
        bannerType: data.bannerType,
        status: "active",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  update: async (id: string, data: UpdateBannerData): Promise<Banner> => {
    const updateData: Record<string, any> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.image_url !== undefined) updateData.image = data.image_url;
    if (data.link_url !== undefined) updateData.link = data.link_url;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;
    if (data.position !== undefined) updateData.order = data.position;

    const response = await api2.put(`/banners/${id}`, updateData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api2.delete(`/banners/${id}`);
  },
};

const bannerKeys = {
  all: ["banners"] as const,
  lists: () => [...bannerKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...bannerKeys.lists(), filters] as const,
  details: () => [...bannerKeys.all, "detail"] as const,
  detail: (id: string) => [...bannerKeys.details(), id] as const,
};

export const useBanners = () => {
  return useQuery({
    queryKey: bannerKeys.list({}),
    queryFn: bannerApi.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useBanner = (id: string) => {
  return useQuery({
    queryKey: bannerKeys.detail(id),
    queryFn: () => bannerApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannerApi.create,
    onMutate: async (newBanner) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.lists() });
      const previousBanners = queryClient.getQueryData<BannersResponse>(
        bannerKeys.list({})
      );

      const optimisticBanner: Banner = {
        id: `temp-${Date.now()}`,
        title: newBanner.title,
        description: newBanner.description,
        image_url: newBanner.image_url,
        link_url: newBanner.link_url,
        is_active: newBanner.is_active ?? true,
        position: newBanner.position ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<BannersResponse>(bannerKeys.list({}), (old) => {
        if (!old) {
          return { data: [optimisticBanner] };
        }

        const currentBanners = Array.isArray(old.data) ? old.data : [];

        return {
          ...old,
          data: [...currentBanners, optimisticBanner],
        };
      });

      return { previousBanners };
    },
    onError: (err, newBanner, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(bannerKeys.list({}), context.previousBanners);
      }
      toast.error("Failed to create banner");
      console.error("Create banner error:", err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      toast.success("Banner created successfully");
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerData }) =>
      bannerApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: bannerKeys.lists() });

      const previousBanner = queryClient.getQueryData<Banner>(
        bannerKeys.detail(id)
      );
      const previousBanners = queryClient.getQueryData<BannersResponse>(
        bannerKeys.list({})
      );

      if (previousBanner) {
        const optimisticBanner: Banner = {
          ...previousBanner,
          ...data,
          image_url: data.image_url || previousBanner.image_url,
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData(bannerKeys.detail(id), optimisticBanner);

        queryClient.setQueryData<BannersResponse>(
          bannerKeys.list({}),
          (old) => {
            if (!old || !Array.isArray(old.data)) {
              return old;
            }

            return {
              ...old,
              data: old.data.map((banner) =>
                banner.id === id ? optimisticBanner : banner
              ),
            };
          }
        );
      }

      return { previousBanner, previousBanners };
    },
    onError: (err, { id }, context) => {
      if (context?.previousBanner) {
        queryClient.setQueryData(bannerKeys.detail(id), context.previousBanner);
      }
      if (context?.previousBanners) {
        queryClient.setQueryData(bannerKeys.list({}), context.previousBanners);
      }
      toast.error("Failed to update banner");
      console.error("Update banner error:", err);
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(bannerKeys.detail(id), data);

      queryClient.setQueryData<BannersResponse>(bannerKeys.list({}), (old) => {
        if (!old || !Array.isArray(old.data)) {
          return old;
        }

        return {
          ...old,
          data: old.data.map((banner) => (banner.id === id ? data : banner)),
        };
      });

      toast.success("Banner updated successfully");
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannerApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.lists() });
      const previousBanners = queryClient.getQueryData<BannersResponse>(
        bannerKeys.list({})
      );

      queryClient.setQueryData<BannersResponse>(bannerKeys.list({}), (old) => {
        if (!old || !Array.isArray(old.data)) {
          return old;
        }

        return {
          ...old,
          data: old.data.filter((banner) => banner.id !== id),
        };
      });

      return { previousBanners };
    },
    onError: (err, id, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(bannerKeys.list({}), context.previousBanners);
      }
      toast.error("Failed to delete banner");
      console.error("Delete banner error:", err);
    },
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: bannerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
      toast.success("Banner deleted successfully");
    },
  });
};
