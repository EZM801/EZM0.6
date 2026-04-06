import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMoveInput, Move, UpdateMoveInput } from '@/app/types/MoveType';
import { movesApi } from '@/app/lib/api/moves';

export const useMoves = () => {
  const queryClient = useQueryClient();

  // Get all moves
  const { data: moves, isLoading, error } = useQuery<Move[]>({
    queryKey: ['moves'],
    queryFn: movesApi.getAllMoves,
  });

  // Create a new move
  const createMove = useMutation({
    mutationFn: (data: CreateMoveInput) => movesApi.createMove(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] });
    },
  });

  // Update a move
  const updateMove = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMoveInput }) =>
      movesApi.updateMove(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] });
    },
  });

  // Delete a move
  const deleteMove = useMutation({
    mutationFn: (id: string) => movesApi.deleteMove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] });
    },
  });

  return {
    moves,
    isLoading,
    error,
    createMove,
    updateMove,
    deleteMove,
  };
}; 