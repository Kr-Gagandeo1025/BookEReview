
# Book-e-Review

A platform where users can post reviews of books that they have read and can also read reviews posted by their fellow users.

Does not have a lot of functionalities as it is a project developed while learning fullstack developmemt.




## Deployment

To deploy this project on your local environment for development purpose.

```bash
  npm i //install all packages 
```
```bash 
  node index.js //to run
```
```bash
  nodemon index.js //to run with nodemon
```



## Setup your Postgres Database

Create a database - name of your choice.\
then create following tables.

```bash
  CREATE TABLE bookreviews (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    review TEXT NOT NULL,
    author VARCHAR(50),
    rating INT,
    published_on timestamp,
    isbn VARCHAR(50)
  );
```
```bash
  CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    password VARCHAR(200) NOT NULL
  );
```
    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DB_URL` - url of your postgreSQL database.

