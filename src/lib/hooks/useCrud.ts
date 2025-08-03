import {
  useFetch,
  useFetchOne,
  useCreate,
  useUpdate,
  useDelete,
} from "../react-query/hooks";
import { Endpoint } from "../api/endpoints";
import { Attribute, Category, Listing, Seller } from "../../types/models";

// Union type of all your models
type Model = Category | Attribute | Listing | Seller;

// Helper to normalize _id to id
const normalizeId = <T extends Record<string, any>>(item: T): T & { id: string } => ({
  ...item,
  id: item._id ?? item.id,
});

const useCrud = <T extends Model>(endpoint: Endpoint) => {
  const { data: itemsRaw = [], isLoading, error } = useFetch<T>(endpoint);
  const createMutation = useCreate<T>(endpoint);
  const updateMutation = useUpdate<T>(endpoint);
  const deleteMutation = useDelete(endpoint);

  const getItem = (id: string) => useFetchOne<T>(endpoint, id);

  // Normalize all items so they always have `id`
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(item => normalizeId(item))
    : [];

  return {
    items,
    isLoading,
    error,
    createItem: createMutation.mutate,
    createItemAsync: createMutation.mutateAsync,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    getItem,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useCrud;
