# User CRUD app

This is an example nodejs/express app allowing CRUD operations (create, read, update, delete) on a User object.



## Test

To install the required modules:
run `npm install` from the application directory.

To run the tests:
`npm test`
This will also output a coverage report, found in /coverage

To run eslint:
`npm run eslint`

## Run

To run this application you must have a mongo docker image
`docker pull mongo`

A docker compose file is provided.  To build and run:
`docker compose build` and `docker compose up`

Mongodb on the host machine may need to be stopped in order to map the container to port 27017.

This will run the express app on localhost:3000

There is a swagger ui available at localhost:3000/api-docs.
This can be used to test the api endpoints.
