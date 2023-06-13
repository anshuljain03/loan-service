# Loan Management Service

## Aim

Create a service to handle loans and repayments for a user
## Pre-requisites
1. #### Node >= 20.x
    ```sh
    node -v
    ```
    To check if node is installed. If not download from [here](https://nodejs.org/en/download/current/)
2. #### Docker
    ```sh
    docker info
    ```
    To check ig it is installed. If not download from [here](https://docs.docker.com/get-docker/)

## How to run it
1. Ensure that all the above mentioned tools have been installed and docker is running
2. Clone using the following command
    ```sh
    git clone git@github.com:anshuljain03/loan-service.git
    ```
3. Install dependencies and run the script using
    ```sh
    npm start
    ```
5. Once the server has started import the Postman Collection named `Loan Service APIs.postman_collection.json`
6. Use the Postman Collection to test out various APIs
7. Use the below command to run lint and unit tests
    ```sh
    npm run test
    ```
8. To run the functional tests import the Postman Collection named `Loan Service functional tests.postman_collection.json` and run the collection using collection runner. Ensure that the server is running
9. To stop just press `ctrl+c`
10. Run to cleanup all docker containers and node modules
    ```sh
    npm cleanup
    ```
### Notes
1. Create a user first
2. Once the user has been created you can login using that user to create a temporary JWT token to be used to authenticate other requests
3. Once a user has logged in, use the auth token created to submit a new loan or repay a previous loan

## Caveats to take into account before running this in production
1. Mysql server root user should not be initalised without a password.
2. Never use the root user directly in your application. Create a new user with fine grained permissions
