import {
  useFetch,
  useFetchOne,
  useCreate,
  useUpdate,
  useDelete,
} from "../react-query/hooks";
import { Endpoint } from "../api/endpoints";
import { Attribute, Category, Listing, Seller } from "../../types/models";

type Model = Category | Attribute | Listing | Seller;

const useCrud = <T extends Model>(endpoint: Endpoint) => {
  const { data: items = [], isLoading, error } = useFetch<T>(endpoint);
  const createMutation = useCreate<T>(endpoint);
  const updateMutation = useUpdate<T>(endpoint);
  const deleteMutation = useDelete(endpoint);

  const getItem = (id: string) => useFetchOne<T>(endpoint, id);

  return {
    items: Array.isArray(items) ? items : [],
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
