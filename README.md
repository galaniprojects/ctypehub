# ctypehub

The source code of https://ctypehub.galaniprojects.de

### Prerequisites

Make sure you installed these required software before running this project:

- [Node.js](https://nodejs.org/en/download/prebuilt-installer)
- [pnpm](https://pnpm.io/installation#using-corepack)
- [Docker](https://docs.docker.com/engine/install/)


## Start the app locally:

After having [cloned the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) on your local machine and defining all environment variables according to the `.env.example`, to start the app locally follow this steps.

1. Make sure you have all dependencies installed, running:

   ```
   pnpm install
   ```

2. Start the database the app will use, running:

   ```
   pnpm start-db
   ```
_The Docker daemon needs to be running for this to work_

If there is already a postgres container running, with an incompatible database, you can stop it with `pnpm stop-db`.

3. Enter the dev watch mode from astro, running:

   ```
   pnpm dev
   ```

 Now you can see the logs of the backend on the terminal and visit the frontend under the URL specified by the variable `URL` from the `.env`-file.
 (By default http://localhost:3000)

 The database should start to populate from the configured indexer.


