import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from '@/app/lib/api/addresses';
import { CreateAddressInput, UpdateAddressInput } from '@/app/types/AddressType';

export const useAddresses = () => {
  const queryClient = useQueryClient();

  // Query for all addresses
  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.getAllAddresses,
  });

  // Query for a single address
  const getAddressQuery = (id: string) => {
    return useQuery({
      queryKey: ['addresses', id],
      queryFn: () => addressesApi.getAddress(id),
    });
  };

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: addressesApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressInput }) =>
      addressesApi.updateAddress(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['addresses', variables.id] });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: addressesApi.deleteAddress,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['addresses', id] });
    },
  });

  return {
    addresses: addressesQuery.data,
    isLoading: addressesQuery.isLoading,
    error: addressesQuery.error,
    getAddress: getAddressQuery,
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
  };
}; 