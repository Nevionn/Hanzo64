interface connectionDb {
  name: string;
  location: string;
}

/**
 * database.db - dev
 * phovion.db - prod
 */

export const connectionParamsDb: connectionDb = {
  name: 'database.db',
  location: 'default',
};
