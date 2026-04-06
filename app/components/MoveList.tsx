import { useMoves } from '@/app/hooks/useMoves';
import { format } from 'date-fns';

export const MoveList = () => {
  const { moves, isLoading, error } = useMoves();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading moves: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Moves</h2>
      <div className="grid gap-4">
        {moves?.map((move) => (
          <div
            key={move.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{move.name}</h3>
                <p className="text-gray-600">{move.description}</p>
                <div className="mt-2 space-y-1">
                  {move.fromAddress && (
                    <p className="text-sm">
                      <span className="font-medium">From:</span>{' '}
                      {`${move.fromAddress.street}, ${move.fromAddress.city}, ${move.fromAddress.state} ${move.fromAddress.zipCode}`}
                    </p>
                  )}
                  {move.toAddress && (
                    <p className="text-sm">
                      <span className="font-medium">To:</span>{' '}
                      {`${move.toAddress.street}, ${move.toAddress.city}, ${move.toAddress.state} ${move.toAddress.zipCode}`}
                    </p>
                  )}
                  {!move.fromAddress && !move.toAddress && (
                    <p className="text-sm text-gray-500 italic">No addresses specified</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  move.status === 'completed' ? 'bg-green-100 text-green-800' :
                  move.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  move.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {move.status}
                </span>
                {move.startDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(move.startDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 