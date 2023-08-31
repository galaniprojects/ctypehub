import { blockchainConnectionState } from '../utilities/initKilt';
import { databaseConnectionState } from '../utilities/sequelize';

export async function GET() {
  const result =
    !databaseConnectionState.isOffForTooLong() &&
    !blockchainConnectionState.isOffForTooLong();
  return new Response(String(result));
}
